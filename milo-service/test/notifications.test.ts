import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { openStore, emit, listEvents, tx } from '../src/store.ts';
import { listenForNotifications, setNotificationEnabled } from '../src/notifications.ts';

test('notifications follow committed events only and surface delivery failures', async () => {
  const dir = fs.mkdtempSync(path.join(process.cwd(), '.notifications-test-')); const db = openStore(dir); const sent: string[] = [];
  const off = listenForNotifications(db, async kind => { sent.push(kind); if (kind === 'approval') throw new Error('OS denied'); });
  try {
    emit(db, 't', 'task.status', { status: 'completed' });
    assert.deepEqual(sent, []);
    setNotificationEnabled(db, true, true);
    assert.throws(() => tx(db, () => { emit(db, 't', 'approval.requested', {}); throw new Error('rollback'); }));
    assert.deepEqual(sent, []);
    emit(db, 't', 'task.status', { status: 'completed', secret: 'not forwarded' });
    emit(db, 't', 'approval.requested', { summary: 'not forwarded' });
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(sent, ['complete', 'approval']);
    const failure = listEvents(db, { after: 0 }).find(e => e.type === 'notification.failed');
    assert.match(JSON.stringify(failure), /OS denied/);
    setNotificationEnabled(db, false, true);
    emit(db, 't', 'approval.requested', {}); assert.equal(sent.length, 2);
  } finally { off(); db.close(); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('native helper return codes distinguish authorization denial', async () => {
  const { sendNative } = await import('../src/notifications.ts');
  const dir = fs.mkdtempSync(path.join(process.cwd(), '.notify-helper-'));
  const helper = path.join(dir, 'helper');
  try {
    fs.writeFileSync(helper, '#!/bin/sh\nif [ "$1" = "--request" ]; then exit 3; fi\nexit 0\n', { mode: 0o700 });
    await sendNative(helper, 'complete');
    await assert.rejects(sendNative(helper, '--request'), /denied by macOS/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('notifications are off by default, cannot be enabled when unavailable, and the opt-in persists across reopen', async () => {
  const { notificationEnabled } = await import('../src/notifications.ts');
  const dir = fs.mkdtempSync(path.join(process.cwd(), '.notifications-opt-'));
  try {
    let db = openStore(dir);
    assert.equal(notificationEnabled(db), false);
    assert.throws(() => setNotificationEnabled(db, true, false), /packaged/);
    assert.throws(() => setNotificationEnabled(db, 'yes', true), /boolean/);
    assert.equal(notificationEnabled(db), false);
    setNotificationEnabled(db, true, true); db.close();
    db = openStore(dir); assert.equal(notificationEnabled(db), true); db.close();
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
