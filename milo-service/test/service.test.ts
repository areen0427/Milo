// End-to-end tests against a spawned service process (successor of the v1 service.test.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { call, rawCall, startService, stopService, tempDir, token, waitFor } from './helpers.ts';
import type { Service } from './helpers.ts';

test('auth, privacy, single instance, malformed input, task lifecycle and persistence', async () => {
  const dir = tempDir(); let first: Service | undefined, second: Service | undefined;
  try {
    first = startService(dir); await first.ready;
    assert.equal(fs.statSync(path.join(dir, 'service.sock')).mode & 0o777, 0o600);
    assert.equal(fs.statSync(path.join(dir, 'auth.token')).mode & 0o777, 0o600);
    assert.equal(fs.statSync(path.join(dir, 'milo.db')).mode & 0o777, 0o600);
    second = startService(dir); await assert.rejects(second.ready, /already running/);
    assert.equal((await rawCall(dir, '{')).error, 'Invalid JSON');
    assert.equal((await rawCall(dir, JSON.stringify({ id: 1, method: 'health' }))).code, 'unauthorized');
    assert.equal((await rawCall(dir, JSON.stringify({ id: 1, method: 'health', auth: 'x'.repeat(64) }))).code, 'unauthorized');
    assert.equal((await rawCall(dir, JSON.stringify({ id: 1, method: 'nope', auth: token(dir) }))).code, 'unknown_method');
    assert.equal((await rawCall(dir, JSON.stringify({ id: 1, method: 'hello', auth: token(dir), params: { protocol: [1] } }))).code, 'invalid_params');
    assert.equal((await call(dir, 'hello', { protocol: [1, 2] })).protocol, 2);
    const health = await call(dir, 'health');
    assert.equal(health.inference, 'mock');
    assert.equal(health.version, 2);
    await assert.rejects(call(dir, 'tasks.create', { goal: '' }), /nonempty/);
    const created = await call(dir, 'tasks.create', { goal: 'Test task' });
    const done = await waitFor(() => call(dir, 'tasks.get', { id: created.id }), t => t.status === 'completed');
    assert.match(done.result, /Placeholder only/);
    await stopService(first);
    assert.equal(fs.existsSync(path.join(dir, 'auth.token')), false, 'token removed on clean stop');
    const oldToken = '';
    first = startService(dir); await first.ready;
    assert.notEqual(token(dir), oldToken);
    assert.equal((await call(dir, 'tasks.get', { id: created.id })).status, 'completed');
    assert.equal((await call(dir, 'tasks.list')).length, 1);
  } finally { await stopService(first); await stopService(second); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('v1 tasks.json is imported once; corrupt data is never overwritten', async () => {
  const dir = tempDir(); let s: Service | undefined;
  try {
    fs.writeFileSync(path.join(dir, 'tasks.json'), JSON.stringify({ version: 1, tasks: [
      { id: 'done', goal: 'old', status: 'completed', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', result: 'Placeholder only' },
      { id: 'mid', goal: 'old running', status: 'running', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', result: null },
    ] }));
    s = startService(dir); await s.ready;
    const tasks = await call(dir, 'tasks.list');
    assert.deepEqual(tasks.map((t: { id: string; status: string }) => [t.id, t.status]), [['done', 'completed'], ['mid', 'interrupted']]);
    assert.ok(fs.existsSync(path.join(dir, 'tasks.json.imported')));
  } finally { await stopService(s); fs.rmSync(dir, { recursive: true, force: true }); }

  const bad = tempDir(); let p: Service | undefined;
  try {
    fs.writeFileSync(path.join(bad, 'tasks.json'), '{bad');
    p = startService(bad); await assert.rejects(p.ready, /startup failed/);
    assert.equal(fs.readFileSync(path.join(bad, 'tasks.json'), 'utf8'), '{bad');
    assert.equal(fs.existsSync(path.join(bad, 'service.lock')), false);
  } finally { await stopService(p); fs.rmSync(bad, { recursive: true, force: true }); }
});

test('approval flow over the protocol survives a hard kill and streams events', async () => {
  const dir = tempDir(); const files = tempDir('milo-files-'); let s: Service | undefined;
  try {
    s = startService(dir); await s.ready;
    await call(dir, 'permissions.set', { fileRoots: [files] });
    // Subscribe before work starts.
    const events: any[] = [];
    const sub = net.createConnection(path.join(dir, 'service.sock'));
    let buf = '';
    sub.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const line = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1); if (line.event) events.push(line.event); } });
    await new Promise(r => sub.on('connect', r));
    sub.write(JSON.stringify({ id: 1, auth: token(dir), method: 'events.subscribe' }) + '\n');
    const t = await call(dir, 'tasks.create', { goal: `/tool file_write ${JSON.stringify({ path: 'a.txt', content: 'A' })}` });
    const [approval] = await waitFor(() => call(dir, 'approvals.list'), (a: any[]) => a.length === 1);
    assert.equal(approval.tool, 'file_write');
    await waitFor(() => events, e => e.some(x => x.type === 'approval.requested'));
    sub.destroy();

    // Hard kill while waiting for approval; the approval and task must survive.
    await stopService(s, 'SIGKILL');
    s = startService(dir); await s.ready;
    assert.equal((await call(dir, 'tasks.get', { id: t.id })).status, 'waiting_approval');
    await call(dir, 'approvals.decide', { id: approval.id, decision: 'approve' });
    const done = await waitFor(() => call(dir, 'tasks.get', { id: t.id, detail: true }), x => x.status === 'completed');
    assert.equal(fs.readFileSync(path.join(files, 'a.txt'), 'utf8'), 'A');
    assert.deepEqual(done.effects.map((e: { state: string }) => e.state), ['applied']);
    const log = await call(dir, 'events.list', { taskId: t.id });
    assert.ok(log.some((e: { type: string }) => e.type === 'tool.result'));
  } finally { await stopService(s); fs.rmSync(dir, { recursive: true, force: true }); fs.rmSync(files, { recursive: true, force: true }); }
});

test('schedules, memory and settings over the protocol', async () => {
  const dir = tempDir(); let s: Service | undefined;
  try {
    s = startService(dir, { MILO_SCHEDULER_INTERVAL_MS: '50' }); await s.ready;
    const preview = await call(dir, 'schedules.preview', { expression: '0 9 * * mon', timezone: 'Europe/London', count: 3 });
    assert.equal(preview.instants.length, 3);
    const soon = new Date(Date.now() + 300).toISOString();
    const sched = await call(dir, 'schedules.create', { goal: 'scheduled hello', expression: `oneshot:${soon}`, timezone: 'UTC' });
    const tasks = await waitFor(() => call(dir, 'tasks.list'), (l: any[]) => l.some(t => t.scheduleId === sched.id && t.status === 'completed'));
    assert.equal(tasks.filter((t: { scheduleId: string }) => t.scheduleId === sched.id).length, 1);
    assert.equal((await call(dir, 'schedules.list'))[0].enabled, false);
    await assert.rejects(call(dir, 'schedules.create', { goal: 'x', expression: 'every day' }), /five fields/);

    const m = await call(dir, 'memory.add', { namespace: 'user', text: 'Name is Sam' });
    assert.equal(m.source, 'said');
    assert.equal((await call(dir, 'memory.search', { query: 'name' }))[0].id, m.id);
    assert.equal((await call(dir, 'memory.delete', { id: m.id })).deleted, true);

    await assert.rejects(call(dir, 'permissions.set', { network: 'yes' }), /boolean/);
    await assert.rejects(call(dir, 'settings.set', { inference: { backend: 'cloud' } }), /backend/);
    const before = await call(dir, 'settings.get');
    await assert.rejects(call(dir, 'settings.set', { inference: { maxTokens: 512 }, agent: { maxSteps: -1 } }), /maxSteps/);
    assert.equal((await call(dir, 'settings.get')).inference.maxTokens, before.inference.maxTokens, 'invalid combined settings do not partially commit');
    await assert.rejects(call(dir, 'settings.set', { inference: { maxTokens: 32.5 } }), /integer/);
    const settings = await call(dir, 'settings.set', { agent: { maxSteps: 10 } });
    assert.equal(settings.agent.maxSteps, 10);
    assert.ok((await call(dir, 'tools.list')).some((tool: { name: string }) => tool.name === 'skill_read')); 
  } finally { await stopService(s); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('pause holds queued work and resume continues it', async () => {
  const dir = tempDir(); let s: Service | undefined;
  try {
    s = startService(dir); await s.ready;
    await call(dir, 'service.pause');
    const t = await call(dir, 'tasks.create', { goal: 'wait for resume' });
    await new Promise(r => setTimeout(r, 150));
    assert.equal((await call(dir, 'tasks.get', { id: t.id })).status, 'queued');
    const h = await call(dir, 'health');
    assert.equal(h.paused, true);
    assert.ok(h.resources.rssBytes > 0 && h.resources.databaseBytes > 0);
    await stopService(s); s = startService(dir); await s.ready; // pause survives restart
    assert.equal((await call(dir, 'health')).paused, true);
    await call(dir, 'service.resume');
    await waitFor(() => call(dir, 'tasks.get', { id: t.id }), x => x.status === 'completed');
    assert.ok((await call(dir, 'health')).usage.inputTokens > 0);
  } finally { await stopService(s); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('a paused service still accepts cancellation and stays idle', async () => {
  const dir = tempDir(); let s: Service | undefined;
  try {
    s = startService(dir); await s.ready;
    await call(dir, 'service.pause');
    const t = await call(dir, 'tasks.create', { goal: 'cancel while paused' });
    assert.equal((await call(dir, 'tasks.cancel', { id: t.id })).status, 'cancelled');
    const paused = await call(dir, 'health'); assert.equal(paused.paused, true); assert.equal(paused.worker.busy, false);
  } finally { await stopService(s); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('multi-step task proposes a skill only after success and acceptance exposes it', async () => {
  const dir = tempDir(); let s: Service | undefined;
  try {
    s = startService(dir); await s.ready;
    const cursor = (await call(dir, 'events.cursor')).seq;
    const task = await call(dir, 'tasks.create', { goal: '/tool memory_search {"query":"alpha"}\n/tool memory_search {"query":"beta"}' });
    await waitFor(() => call(dir, 'tasks.get', { id: task.id }), t => t.status === 'completed');
    const proposals = await call(dir, 'skills.proposals.list');
    assert.equal(proposals.length, 1); assert.equal(proposals[0].status, 'pending');
    assert.doesNotMatch(proposals[0].content, /alpha|beta/);
    const events = await call(dir, 'events.list', { after: cursor });
    assert.ok(events.some((event: { type: string }) => event.type === 'skill.proposed'));
    const accepted = await call(dir, 'skills.proposals.decide', { id: proposals[0].id, decision: 'accept' });
    assert.equal(accepted.status, 'accepted');
    const read = await call(dir, 'tasks.create', { goal: `/tool skill_read {"name":"${accepted.name}"}` });
    const result = await waitFor(() => call(dir, 'tasks.get', { id: read.id }), t => t.status === 'completed');
    assert.match(result.result, /Workflow from a completed task/);
  } finally { await stopService(s); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('unbundled service reports native notification support unavailable', async () => {
  const dir = tempDir(); let s: Service | undefined;
  try {
    s = startService(dir); await s.ready;
    const state = await call(dir, 'notifications.get');
    assert.equal(state.enabled, false); assert.equal(state.available, false);
    await assert.rejects(call(dir, 'notifications.set', { enabled: true }), /packaged Milo app/);
    await assert.rejects(call(dir, 'notifications.request'), /packaged Milo app/);
    assert.equal((await call(dir, 'notifications.set', { enabled: false })).enabled, false);
  } finally { await stopService(s); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('client event subscription can be cancelled without leaking a connection', async () => {
  const { subscribe } = await import('../src/client.ts');
  const dir = tempDir(); let s: Service | undefined;
  try {
    s = startService(dir); await s.ready;
    const controller = new AbortController();
    const stream = subscribe(() => {}, dir, undefined, controller.signal);
    controller.abort();
    await stream;
    assert.equal((await call(dir, 'health')).service, 'milo');
  } finally { await stopService(s); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('CLI client rejects malformed, mismatched and incomplete replies', async () => {
  const { request } = await import('../src/client.ts');
  const dir = tempDir(); const replies = ['not json\n', '{"id":2,"result":{}}\n', '{"id":1}\n', ''];
  fs.writeFileSync(path.join(dir, 'auth.token'), 'test-token');
  const server = net.createServer(socket => { socket.once('data', () => socket.end(replies.shift() ?? '')); });
  try {
    await new Promise<void>(resolve => server.listen(path.join(dir, 'service.sock'), resolve));
    await assert.rejects(request('health', {}, dir), /Invalid service response/);
    await assert.rejects(request('health', {}, dir), /Mismatched/);
    await assert.rejects(request('health', {}, dir), /Missing service result/);
    await assert.rejects(request('health', {}, dir), /closed before responding/);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('a pre-existing startup lock fails safely with recovery guidance', async () => {
  const dir = tempDir(); let s: Service | undefined;
  try {
    fs.mkdirSync(path.join(dir, 'startup.lock'));
    s = startService(dir);
    await assert.rejects(s.ready, /startup\.lock is stale/);
    assert.equal(fs.existsSync(path.join(dir, 'startup.lock')), true);
  } finally { await stopService(s); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('event subscriptions replay more than one page before live events', async () => {
  const { openStore, emit, tx } = await import('../src/store.ts');
  const dir = tempDir(); const db = openStore(dir);
  tx(db, () => { for (let i = 0; i < 1105; i++) emit(db, null, 'test.replay', { i }); }); db.close();
  let service: Service | undefined; let socket: net.Socket | undefined;
  try {
    service = startService(dir); await service.ready;
    socket = net.createConnection(path.join(dir, 'service.sock'));
    const observed: any[] = []; let buffer = ''; let ack!: () => void;
    const acknowledged = new Promise<void>(resolve => ack = resolve);
    socket.on('data', chunk => { buffer += chunk; let i; while ((i = buffer.indexOf('\n')) >= 0) { const data = JSON.parse(buffer.slice(0, i)); buffer = buffer.slice(i + 1); if (data.result?.subscribed) ack(); if (data.event) observed.push(data.event); } });
    await new Promise<void>((resolve, reject) => { socket!.once('connect', resolve); socket!.once('error', reject); });
    socket.write(JSON.stringify({ id: 1, auth: token(dir), method: 'events.subscribe', params: { after: 0 } }) + '\n');
    await acknowledged;
    await call(dir, 'tasks.create', { goal: 'live event' });
    await waitFor(() => observed, events => events.some((e: any) => e.type === 'task.created'));
    assert.equal(observed.filter(e => e.type === 'test.replay').length, 1105);
    const seq = observed.filter(e => !e.transient).map(e => e.seq);
    assert.deepEqual(seq, [...seq].sort((a, b) => a - b));
  } finally { socket?.destroy(); await stopService(service); fs.rmSync(dir, { recursive: true, force: true }); }
});
