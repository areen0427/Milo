// Schedules that create tasks. Ported from Aiden core/v4/automation/scheduler.ts, schedule.ts and
// occurrenceKey.ts (AGPL-3.0-only, Copyright (c) 2026 Shiva Deore / Taracod), on Milo's own schema.
// Each due instant gets an occurrence key (unique in SQLite), so rescans, restarts and duplicate
// timers cannot create a second task for the same instant. Missed instants (sleep, service off)
// are handled by the schedule's misfire policy when the service next scans.
import crypto from 'node:crypto';
import type { DB } from './store.ts';
import { emit, newId, now, tx } from './store.ts';
import { ValidationError } from './settings.ts';
import { ACTIVE, createTask, MAX_GOAL } from './jobs.ts';
import { nextFire, parseCron, previousCron, preview, validateExpression } from './cron.ts';
import { requireActiveGoal } from './goals.ts';

export type Misfire = { kind: 'skip' } | { kind: 'run_once'; maxAgeMs?: number } | { kind: 'catch_up'; maxOccurrences: number; maxAgeMs?: number };
export type Schedule = {
  id: string; goal: string; expression: string; timezone: string; misfire: Misfire; overlap: 'skip' | 'allow'; enabled: boolean;
  revision: number; nextFireAt: string | null; lastFireAt: string | null; createdAt: string; updatedAt: string; goalId: string | null;
};
export const DEFAULT_MISFIRE: Misfire = { kind: 'run_once', maxAgeMs: 24 * 3600_000 };
const GRACE_MS = 60_000;

function toSchedule(r: Record<string, unknown>): Schedule {
  return {
    id: r.id as string, goal: r.goal as string, expression: r.expression as string, timezone: r.timezone as string, misfire: JSON.parse(r.misfire_json as string),
    overlap: r.overlap as 'skip' | 'allow', enabled: Number(r.enabled) === 1, revision: Number(r.revision), nextFireAt: (r.next_fire_at as string) ?? null,
    lastFireAt: (r.last_fire_at as string) ?? null, createdAt: r.created_at as string, updatedAt: r.updated_at as string, goalId: (r.goal_id as string) ?? null,
  };
}
export function occurrenceKey(scheduleId: string, revision: number, scheduledFor: string): string {
  return crypto.createHash('sha256').update(JSON.stringify([scheduleId, revision, 'schedule', scheduledFor])).digest('hex');
}

function parseMisfire(v: unknown): Misfire {
  if (v === undefined) return DEFAULT_MISFIRE;
  const m = v as Record<string, unknown>;
  const age = m?.maxAgeMs;
  if (age !== undefined && (!Number.isInteger(age) || (age as number) < 0)) throw new ValidationError('misfire.maxAgeMs must be a nonnegative integer');
  if (m?.kind === 'skip') return { kind: 'skip' };
  if (m?.kind === 'run_once') return { kind: 'run_once', ...(age !== undefined ? { maxAgeMs: age as number } : {}) };
  if (m?.kind === 'catch_up') {
    if (!Number.isInteger(m.maxOccurrences) || (m.maxOccurrences as number) < 1 || (m.maxOccurrences as number) > 100) throw new ValidationError('misfire.maxOccurrences must be 1-100');
    return { kind: 'catch_up', maxOccurrences: m.maxOccurrences as number, ...(age !== undefined ? { maxAgeMs: age as number } : {}) };
  }
  throw new ValidationError('misfire.kind must be skip, run_once or catch_up');
}

export function createSchedule(db: DB, p: Record<string, unknown>, nowMs = Date.now()): Schedule {
  if (typeof p.goal !== 'string' || !p.goal.trim() || p.goal.length > MAX_GOAL) throw new ValidationError(`goal must be a nonempty string of at most ${MAX_GOAL} characters`);
  if (typeof p.expression !== 'string') throw new ValidationError('expression is required (cron fields, "interval:<ms>" or "oneshot:<ISO time>")');
  const timezone = p.timezone === undefined ? Intl.DateTimeFormat().resolvedOptions().timeZone : p.timezone;
  if (typeof timezone !== 'string') throw new ValidationError('timezone must be an IANA name');
  try { validateExpression(p.expression, timezone); } catch (e) { throw new ValidationError((e as Error).message); }
  const misfire = parseMisfire(p.misfire);
  if (p.enabled !== undefined && typeof p.enabled !== 'boolean') throw new ValidationError('enabled must be a boolean');
  const overlap = p.overlap ?? 'skip';
  if (overlap !== 'skip' && overlap !== 'allow') throw new ValidationError('overlap must be skip or allow');
  const next = nextFire(p.expression, timezone, nowMs, nowMs);
  if (next === null) throw new ValidationError('Schedule has no future occurrence');
  return tx(db, () => {
    const goalId = requireActiveGoal(db, p.goalId);
    const id = newId(); const at = new Date(nowMs).toISOString();
    db.prepare('INSERT INTO schedules (id, goal, expression, timezone, misfire_json, overlap, enabled, revision, next_fire_at, created_at, updated_at, goal_id) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)')
      .run(id, p.goal as string, p.expression as string, timezone, JSON.stringify(misfire), overlap, p.enabled === false ? 0 : 1, new Date(next).toISOString(), at, at, goalId);
    emit(db, null, 'schedule.created', { scheduleId: id });
    return getSchedule(db, id)!;
  });
}
export function getSchedule(db: DB, id: string): Schedule | null {
  const r = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return r ? toSchedule(r) : null;
}
export function listSchedules(db: DB): Schedule[] { return (db.prepare('SELECT * FROM schedules ORDER BY created_at').all() as Array<Record<string, unknown>>).map(toSchedule); }
export function setScheduleEnabled(db: DB, id: unknown, enabled: unknown, nowMs = Date.now()): Schedule {
  if (typeof id !== 'string' || typeof enabled !== 'boolean') throw new ValidationError('id (string) and enabled (boolean) are required');
  return tx(db, () => {
    const s = getSchedule(db, id);
    if (!s) throw new ValidationError('Schedule not found');
    if (enabled) requireActiveGoal(db, s.goalId);
    // Re-enabling starts from now: occurrences missed while disabled are not owed. Bumping the
    // revision keeps old occurrence keys from colliding with new ones.
    const next = enabled ? nextFire(s.expression, s.timezone, nowMs, Date.parse(s.createdAt)) : null;
    if (enabled && next === null) throw new ValidationError('Schedule has no future occurrence');
    db.prepare('UPDATE schedules SET enabled = ?, next_fire_at = ?, revision = revision + 1, updated_at = ? WHERE id = ?').run(enabled ? 1 : 0, next === null ? null : new Date(next).toISOString(), now(), id);
    emit(db, null, 'schedule.updated', { scheduleId: id, enabled });
    return getSchedule(db, id)!;
  });
}
export function deleteSchedule(db: DB, id: unknown): boolean {
  if (typeof id !== 'string') throw new ValidationError('id must be a string');
  return tx(db, () => {
    const n = db.prepare('DELETE FROM schedules WHERE id = ?').run(id).changes;
    if (n) emit(db, null, 'schedule.deleted', { scheduleId: id });
    return n > 0;
  });
}
export function previewSchedule(p: Record<string, unknown>, nowMs = Date.now()): string[] {
  const tz = typeof p.timezone === 'string' ? p.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone;
  const count = Number.isInteger(p.count) ? Math.min(Math.max(p.count as number, 1), 50) : 5;
  try { return preview(String(p.expression), tz, nowMs, count); } catch (e) { throw new ValidationError((e as Error).message); }
}

/** Due instants in [firstDue, now] selected by the misfire policy (Aiden planDueInstants). */
export function planDueInstants(s: Pick<Schedule, 'expression' | 'timezone' | 'misfire' | 'createdAt'>, firstDueMs: number, nowMs: number): { run: number[]; missed: number; missedAtLeast?: boolean } {
  if (firstDueMs > nowMs) return { run: [], missed: 0 };
  const anchor = Date.parse(s.createdAt);
  if (s.expression.startsWith('interval:')) {
    const every = Number(s.expression.slice(9));
    const total = Math.floor((nowMs - firstDueMs) / every) + 1;
    const latest = firstDueMs + (total - 1) * every;
    let run: number[] = [];
    if (s.misfire.kind === 'skip') run = nowMs - latest <= GRACE_MS ? [latest] : [];
    else if (s.misfire.kind === 'run_once') run = s.misfire.maxAgeMs !== undefined && nowMs - latest > s.misfire.maxAgeMs ? [] : [latest];
    else {
      const cutoff = s.misfire.maxAgeMs === undefined ? firstDueMs : nowMs - s.misfire.maxAgeMs;
      const startIndex = Math.max(0, Math.ceil((cutoff - firstDueMs) / every));
      const count = Math.min(s.misfire.maxOccurrences, Math.max(0, total - startIndex));
      run = Array.from({ length: count }, (_, i) => firstDueMs + (startIndex + i) * every);
    }
    return { run, missed: total - run.length };
  }
  const all: number[] = [];
  for (let t = firstDueMs; t !== null && t <= nowMs && all.length < 10_000; t = nextFire(s.expression, s.timezone, t, anchor) as number) all.push(t);
  let latest = all[all.length - 1];
  const capped = all.length === 10_000 && (nextFire(s.expression, s.timezone, latest, anchor) ?? Infinity) <= nowMs;
  if (capped && !s.expression.startsWith('oneshot:')) {
    const expression = s.expression.startsWith('cron:') ? s.expression.slice(5) : s.expression;
    latest = previousCron(parseCron(expression), s.timezone, nowMs, firstDueMs) ?? latest;
  }
  let run: number[];
  if (s.misfire.kind === 'skip') run = nowMs - latest <= GRACE_MS ? [latest] : [];
  else if (s.misfire.kind === 'run_once') run = s.misfire.maxAgeMs !== undefined && nowMs - latest > s.misfire.maxAgeMs ? [] : [latest];
  else {
    const cutoff = s.misfire.maxAgeMs === undefined ? -Infinity : nowMs - s.misfire.maxAgeMs;
    if (capped && cutoff > all[all.length - 1]) {
      run = [];
      let t = nextFire(s.expression, s.timezone, cutoff - 1, anchor);
      while (t !== null && t <= nowMs && run.length < s.misfire.maxOccurrences) { run.push(t); t = nextFire(s.expression, s.timezone, t, anchor); }
    } else run = all.filter(t => t >= cutoff).slice(0, s.misfire.maxOccurrences);
  }
  return { run, missed: all.length - run.length, ...(capped ? { missedAtLeast: true } : {}) };
}

export function scanDue(db: DB, nowMs = Date.now(), maxPerScan = 100): { scanned: number; created: number; duplicates: number; skippedOverlap: number; missed: number } {
  const out = { scanned: 0, created: 0, duplicates: 0, skippedOverlap: 0, missed: 0 };
  tx(db, () => {
    const due = (db.prepare('SELECT * FROM schedules WHERE enabled = 1 AND next_fire_at IS NOT NULL AND next_fire_at <= ? ORDER BY next_fire_at, id LIMIT ?')
      .all(new Date(nowMs).toISOString(), maxPerScan) as Array<Record<string, unknown>>).map(toSchedule);
    for (const s of due) {
      out.scanned++;
      if (s.goalId) {
        const goal = db.prepare('SELECT status FROM goals WHERE id = ?').get(s.goalId) as { status: string } | undefined;
        if (!goal || goal.status !== 'active') {
          db.prepare('UPDATE schedules SET enabled = 0, next_fire_at = NULL, updated_at = ? WHERE id = ?').run(now(), s.id);
          emit(db, null, 'schedule.disabled_inactive_goal', { scheduleId: s.id, goalId: s.goalId });
          continue;
        }
      }
      const { run, missed, missedAtLeast } = planDueInstants(s, Date.parse(s.nextFireAt!), nowMs);
      out.missed += missed;
      if (missed) emit(db, null, 'schedule.missed', { scheduleId: s.id, missed, missedAtLeast: missedAtLeast ?? false, policy: s.misfire.kind });
      for (const t of run) {
        const scheduledFor = new Date(t).toISOString();
        const key = occurrenceKey(s.id, s.revision, scheduledFor);
        const occurrenceId = newId();
        const inserted = db.prepare('INSERT OR IGNORE INTO occurrences (id, schedule_id, occurrence_key, scheduled_for, state, created_at) VALUES (?, ?, ?, ?, ?, ?)')
          .run(occurrenceId, s.id, key, scheduledFor, 'pending', now()).changes === 1;
        if (!inserted) { out.duplicates++; continue; }
        const busy = s.overlap === 'skip' && (db.prepare(`SELECT 1 FROM tasks WHERE schedule_id = ? AND status IN (${ACTIVE.map(() => '?').join(',')}) LIMIT 1`).get(s.id, ...ACTIVE) !== undefined);
        if (busy) {
          db.prepare("UPDATE occurrences SET state = 'skipped_overlap' WHERE id = ?").run(occurrenceId);
          emit(db, null, 'schedule.skipped_overlap', { scheduleId: s.id, scheduledFor });
          out.skippedOverlap++;
          continue;
        }
        const task = createTask(db, s.goal, { origin: 'schedule', scheduleId: s.id, occurrenceId, goalId: s.goalId });
        db.prepare("UPDATE occurrences SET state = 'admitted', task_id = ? WHERE id = ?").run(task.id, occurrenceId);
        out.created++;
      }
      const next = nextFire(s.expression, s.timezone, nowMs, Date.parse(s.createdAt));
      const changed = db.prepare('UPDATE schedules SET next_fire_at = ?, enabled = CASE WHEN ? IS NULL THEN 0 ELSE enabled END, last_fire_at = COALESCE(?, last_fire_at), updated_at = ? WHERE id = ? AND next_fire_at = ?')
        .run(next === null ? null : new Date(next).toISOString(), next, run.length ? new Date(run[run.length - 1]).toISOString() : null, now(), s.id, s.nextFireAt).changes;
      if (changed !== 1) throw new Error('Scheduler lost schedule authority');
    }
  });
  return out;
}
