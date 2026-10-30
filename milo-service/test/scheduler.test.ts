// Behavior ported from Aiden core/v4/automation scheduler tests: timezones, DST, misfire, dedupe, overlap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextFire, parseCron, preview } from '../src/cron.ts';
import { createSchedule, listSchedules, planDueInstants, scanDue, setScheduleEnabled } from '../src/scheduler.ts';
import { listTasks, setStatus } from '../src/jobs.ts';
import { freshStore } from './helpers.ts';

const iso = (ms: number | null) => ms === null ? null : new Date(ms).toISOString();

test('cron parsing and evaluation in a time zone', () => {
  assert.throws(() => parseCron('* * *'));
  assert.throws(() => parseCron('61 * * * *'));
  assert.ok(parseCron('*/15 9-17 * * mon-fri').minute.has(45));
  assert.ok(parseCron('0 0 * * 7').dow.has(0));
  // 09:00 in New York (EDT, UTC-4) on 2026-06-01 = 13:00Z.
  assert.equal(iso(nextFire('0 9 * * *', 'America/New_York', Date.parse('2026-06-01T12:00:00Z'))), '2026-06-01T13:00:00.000Z');
  // Kolkata is UTC+5:30.
  assert.equal(iso(nextFire('30 8 * * *', 'Asia/Kolkata', Date.parse('2026-06-01T00:00:00Z'))), '2026-06-01T03:00:00.000Z');
  // Day-of-month OR day-of-week when both restricted (Vixie semantics): 13th or Friday.
  assert.equal(iso(nextFire('0 0 13 * fri', 'UTC', Date.parse('2026-02-01T00:00:00Z'))), '2026-02-06T00:00:00.000Z');
  assert.equal(nextFire('@daily', 'UTC', Date.parse('2026-01-01T10:00:00Z')), Date.parse('2026-01-02T00:00:00Z'));
});

test('DST: fall-back hour fires once, spring-forward gap is skipped', () => {
  // 2026-11-01 01:30 occurs twice in New York; expect only the first (EDT, 05:30Z).
  const after = Date.parse('2026-11-01T04:00:00Z');
  const runs = preview('30 1 * * *', 'America/New_York', after, 2);
  assert.deepEqual(runs, ['2026-11-01T05:30:00.000Z', '2026-11-02T06:30:00.000Z']);
  // 2026-03-08 02:30 does not exist in New York.
  assert.equal(iso(nextFire('30 2 * * *', 'America/New_York', Date.parse('2026-03-08T05:00:00Z'))), '2026-03-09T06:30:00.000Z');
});

test('interval and one-shot expressions', () => {
  const anchor = Date.parse('2026-01-01T00:00:00Z');
  assert.equal(nextFire('interval:3600000', 'UTC', anchor + 90 * 60_000, anchor), anchor + 2 * 3600_000);
  assert.equal(nextFire('oneshot:2026-01-02T00:00:00Z', 'UTC', anchor), Date.parse('2026-01-02T00:00:00Z'));
  assert.equal(nextFire('oneshot:2026-01-02T00:00:00Z', 'UTC', Date.parse('2026-01-03T00:00:00Z')), null);
});

test('misfire policies choose which missed instants run', () => {
  const s = { expression: 'interval:3600000', timezone: 'UTC', createdAt: '2026-01-01T00:00:00.000Z' };
  const first = Date.parse('2026-01-01T01:00:00Z');
  const now = Date.parse('2026-01-01T05:30:00Z'); // 01..05 due = 5 instants
  assert.deepEqual(planDueInstants({ ...s, misfire: { kind: 'skip' } }, first, now), { run: [], missed: 5 });
  assert.deepEqual(planDueInstants({ ...s, misfire: { kind: 'run_once' } }, first, now).run.map(iso), ['2026-01-01T05:00:00.000Z']);
  assert.deepEqual(planDueInstants({ ...s, misfire: { kind: 'run_once', maxAgeMs: 60_000 } }, first, now).run, []);
  assert.equal(planDueInstants({ ...s, misfire: { kind: 'catch_up', maxOccurrences: 3 } }, first, now).run.length, 3);
  assert.equal(planDueInstants({ ...s, misfire: { kind: 'catch_up', maxOccurrences: 10, maxAgeMs: 2 * 3600_000 } }, first, now).run.length, 2);
  assert.deepEqual(planDueInstants({ ...s, misfire: { kind: 'skip' } }, first, first + 30_000).run, [first]);
});

test('scan creates one task per occurrence, dedupes, skips overlap, retires one-shots', () => {
  const { db, cleanup } = freshStore();
  try {
    const t0 = Date.parse('2026-01-01T00:00:00Z');
    const s = createSchedule(db, { goal: 'hourly report', expression: 'interval:3600000', timezone: 'UTC' }, t0);
    assert.equal(s.nextFireAt, '2026-01-01T01:00:00.000Z');
    assert.equal(scanDue(db, t0 + 30 * 60_000).created, 0);
    assert.equal(scanDue(db, t0 + 3600_000).created, 1);
    assert.equal(scanDue(db, t0 + 3600_000).scanned, 0, 'next_fire_at advanced');
    // Previous task still active → overlap skip.
    assert.equal(scanDue(db, t0 + 2 * 3600_000).skippedOverlap, 1);
    for (const t of listTasks(db)) setStatus(db, t.id, 'completed');
    assert.equal(scanDue(db, t0 + 3 * 3600_000).created, 1);
    // Re-running an old instant cannot create a duplicate (occurrence key is unique).
    db.prepare('UPDATE schedules SET next_fire_at = ? WHERE id = ?').run('2026-01-01T03:00:00.000Z', s.id);
    for (const t of listTasks(db)) setStatus(db, t.id, 'completed');
    assert.equal(scanDue(db, t0 + 3 * 3600_000).duplicates, 1);
    assert.equal(listTasks(db).filter(t => t.origin === 'schedule').length, 2);

    const once = createSchedule(db, { goal: 'once', expression: 'oneshot:2026-01-02T00:00:00Z', timezone: 'UTC' }, t0);
    scanDue(db, Date.parse('2026-01-02T00:00:10Z'));
    const after = listSchedules(db).find(x => x.id === once.id)!;
    assert.equal(after.enabled, false);
    assert.equal(after.nextFireAt, null);
    assert.throws(() => setScheduleEnabled(db, once.id, true, Date.parse('2026-01-03T00:00:00Z')), /no future occurrence/);

    const disabled = setScheduleEnabled(db, s.id, false);
    assert.equal(disabled.nextFireAt, null);
    assert.equal(setScheduleEnabled(db, s.id, true, t0 + 10 * 3600_000 + 5).nextFireAt, '2026-01-01T11:00:00.000Z');
    assert.throws(() => createSchedule(db, { goal: 'x', expression: 'interval:5', timezone: 'UTC' }), /at least 60000/);
    assert.throws(() => createSchedule(db, { goal: 'x', expression: 'interval:60000', timezone: 'UTC', enabled: 'false' }), /boolean/);
    assert.throws(() => createSchedule(db, { goal: 'x', expression: '0 9 * * *', timezone: 'Mars/Base' }), /time zone/);
  } finally { cleanup(); }
});

test('long outages select recent due runs instead of stopping at the scan cap', () => {
  const start = Date.parse('2026-01-01T00:00:00Z');
  const current = start + 20_000 * 60_000 + 20_000;
  const base = { timezone: 'UTC', createdAt: new Date(start).toISOString() };
  const interval = planDueInstants({ ...base, expression: 'interval:60000', misfire: { kind: 'run_once', maxAgeMs: 60_000 } }, start + 60_000, current);
  assert.deepEqual(interval, { run: [start + 20_000 * 60_000], missed: 19_999 });
  const cron = planDueInstants({ ...base, expression: '* * * * *', misfire: { kind: 'run_once', maxAgeMs: 60_000 } }, start + 60_000, current);
  assert.deepEqual(cron.run, [start + 20_000 * 60_000]);
  assert.equal(cron.missedAtLeast, true);
  const catchup = planDueInstants({ ...base, expression: '* * * * *', misfire: { kind: 'catch_up', maxOccurrences: 2, maxAgeMs: 5 * 60_000 } }, start + 60_000, current);
  assert.deepEqual(catchup.run, [start + 19_996 * 60_000, start + 19_997 * 60_000]);
});

test('previous cron occurrence respects the first fall-back wall time', async () => {
  const { previousCron } = await import('../src/cron.ts');
  const spec = parseCron('30 1 * * *');
  const latest = previousCron(spec, 'America/New_York', Date.parse('2026-11-01T07:00:00Z'), Date.parse('2026-11-01T04:00:00Z'));
  assert.equal(iso(latest), '2026-11-01T05:30:00.000Z');
});

test('scans keep recording occurrences while the service is paused, limited by overlap skip', async () => {
  const { setPaused, isPaused } = await import('../src/settings.ts');
  const { db, cleanup } = freshStore();
  try {
    setPaused(db, true);
    const t0 = Date.parse('2026-01-01T00:00:00Z');
    createSchedule(db, { goal: 'hourly', expression: 'interval:3600000', timezone: 'UTC' }, t0);
    assert.equal(scanDue(db, t0 + 3600_000).created, 1);
    assert.equal(scanDue(db, t0 + 2 * 3600_000).skippedOverlap, 1);
    assert.equal(listTasks(db).length, 1);
    assert.equal(listTasks(db)[0].status, 'queued');
    assert.equal(isPaused(db), true);
  } finally { cleanup(); }
});
