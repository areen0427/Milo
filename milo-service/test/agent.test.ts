// Agent loop, permissions, approvals, effects and crash recovery against a real SQLite store.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runAttempt } from '../src/agent.ts';
import { createMockBackend } from '../src/inference/mock.ts';
import type { InferenceBackend, InferenceResult } from '../src/inference/types.ts';
import { InferenceError } from '../src/inference/types.ts';
import { cancelTask, createTask, decideApproval, getTask, listApprovals, recoverInterrupted, resolveReview, setStatus, taskDetail, ensureToolCall, appendMessage, updateToolCall } from '../src/jobs.ts';
import { recordIntent } from '../src/effects.ts';
import { setAgentSettings, setInference, setPermissions } from '../src/settings.ts';
import { addMemory, listMemory } from '../src/memory.ts';
import { sha256 } from '../src/effects.ts';
import { freshStore } from './helpers.ts';

const goal = (...lines: string[]) => lines.join('\n');
const tool = (name: string, args: unknown) => `/tool ${name} ${JSON.stringify(args)}`;
async function run(s: ReturnType<typeof freshStore>, taskId: string, backend: InferenceBackend = createMockBackend(), signal = new AbortController().signal) {
  setStatus(s.db, taskId, 'running');
  return runAttempt(taskId, { db: s.db, backend, serviceDir: s.dir, signal, sleep: async () => {} });
}

test('placeholder task completes without tools', async () => {
  const s = freshStore();
  try {
    const t = createTask(s.db, 'hello');
    assert.equal(await run(s, t.id), 'completed');
    assert.match(getTask(s.db, t.id)!.result!, /Placeholder only/);
  } finally { s.cleanup(); }
});

test('default-deny: file and network tools are refused without permission', async () => {
  const s = freshStore();
  try {
    const t = createTask(s.db, goal(tool('file_read', { path: '/etc/hosts' }), tool('web_fetch', { url: 'https://example.com' }), tool('shell_run', { command: 'ls' })));
    assert.equal(await run(s, t.id), 'completed');
    const d = taskDetail(s.db, t.id)!;
    assert.deepEqual(d.toolCalls.map(c => c.status), ['denied', 'denied', 'denied']);
    assert.ok(d.toolCalls.every(c => c.result.error.code === 'permission_denied'));
  } finally { s.cleanup(); }
});

test('reads are scoped to granted folders, including through symlinks', async () => {
  const s = freshStore();
  try {
    fs.writeFileSync(path.join(s.files, 'a.txt'), 'inside');
    fs.symlinkSync('/etc', path.join(s.files, 'escape'));
    setPermissions(s.db, s.dir, { fileRoots: [s.files] });
    const t = createTask(s.db, goal(tool('file_read', { path: 'a.txt' }), tool('file_read', { path: 'escape/hosts' }), tool('file_read', { path: '../x' }), tool('file_list', { path: '.' })));
    await run(s, t.id);
    const calls = taskDetail(s.db, t.id)!.toolCalls;
    assert.equal(calls[0].result.result.content, 'inside');
    assert.equal(calls[1].result.error.code, 'permission_denied');
    assert.equal(calls[2].status, 'failed');
    assert.deepEqual(calls[3].result.result.entries.map((e: { name: string }) => e.name), ['a.txt', 'escape']);
    assert.throws(() => setPermissions(s.db, s.dir, { fileRoots: [s.dir] }), /service directory/);
    assert.throws(() => setPermissions(s.db, s.dir, { fileRoots: ['/'] }), /root/);
  } finally { s.cleanup(); }
});

test('writes need approval; approve executes once with an effect record; deny is reported to the model', async () => {
  const s = freshStore();
  try {
    setPermissions(s.db, s.dir, { fileRoots: [s.files] });
    const t = createTask(s.db, goal(tool('file_write', { path: 'out.txt', content: 'one' }), tool('file_write', { path: 'two.txt', content: 'two' })));
    assert.equal(await run(s, t.id), 'waiting_approval');
    assert.equal(getTask(s.db, t.id)!.status, 'waiting_approval');
    assert.equal(fs.existsSync(path.join(s.files, 'out.txt')), false);
    const [first] = listApprovals(s.db, 'pending');
    decideApproval(s.db, first.id, 'approve');
    assert.throws(() => decideApproval(s.db, first.id, 'deny'), /already approved/);
    assert.equal(getTask(s.db, t.id)!.status, 'queued');
    assert.equal(await run(s, t.id), 'waiting_approval');
    assert.equal(fs.readFileSync(path.join(s.files, 'out.txt'), 'utf8'), 'one');
    const [second] = listApprovals(s.db, 'pending');
    decideApproval(s.db, second.id, 'deny');
    assert.equal(await run(s, t.id), 'completed');
    const d = taskDetail(s.db, t.id)!;
    assert.deepEqual(d.toolCalls.map(c => c.status), ['succeeded', 'denied']);
    assert.equal(d.toolCalls[1].result.error.code, 'denied_by_user');
    assert.deepEqual(d.effects.map(e => e.state), ['applied']);
    assert.equal(fs.existsSync(path.join(s.files, 'two.txt')), false);
  } finally { s.cleanup(); }
});

test('auto-approved writes still stop for secrets; existing files need overwrite', async () => {
  const s = freshStore();
  try {
    fs.writeFileSync(path.join(s.files, 'keep.txt'), 'original');
    setPermissions(s.db, s.dir, { fileRoots: [s.files], autoApproveFileWrites: true });
    const t = createTask(s.db, goal(tool('file_write', { path: 'free.txt', content: 'ok' }), tool('file_write', { path: 'keep.txt', content: 'x' }), tool('file_write', { path: 'secret.txt', content: 'AKIAABCDEFGHIJKLMNOP' })));
    assert.equal(await run(s, t.id), 'waiting_approval');
    const d = taskDetail(s.db, t.id)!;
    assert.equal(d.toolCalls[0].status, 'succeeded');
    assert.equal(d.toolCalls[1].result.error.code, 'permission_denied');
    assert.equal(fs.readFileSync(path.join(s.files, 'keep.txt'), 'utf8'), 'original');
    assert.equal(listApprovals(s.db, 'pending')[0].tier, 'dangerous');
  } finally { s.cleanup(); }
});

test('shell commands require approval and dangerous commands cannot be auto-approved', async () => {
  const s = freshStore();
  try {
    fs.writeFileSync(path.join(s.files, 'f.txt'), 'abc\n');
    setPermissions(s.db, s.dir, { fileRoots: [s.files], shell: true, autoApproveFileWrites: true });
    const t = createTask(s.db, goal(tool('shell_run', { command: 'cat f.txt | wc -l' }), tool('shell_run', { command: 'rm -rf build' })));
    assert.equal(await run(s, t.id), 'waiting_approval');
    decideApproval(s.db, listApprovals(s.db, 'pending')[0].id, 'approve');
    assert.equal(await run(s, t.id), 'waiting_approval');
    const d = taskDetail(s.db, t.id)!;
    assert.equal(d.toolCalls[0].result.result.stdout.trim(), '1');
    assert.equal(d.effects.length, 1, 'shell execution records an effect');
    assert.equal(listApprovals(s.db, 'pending')[0].tier, 'dangerous');
  } finally { s.cleanup(); }
});

test('invalid arguments and unknown tools return structured errors', async () => {
  const s = freshStore();
  try {
    const t = createTask(s.db, goal(tool('file_read', { nope: 1 }), tool('no_such_tool', {})));
    await run(s, t.id);
    const calls = taskDetail(s.db, t.id)!.toolCalls;
    assert.equal(calls[0].result.error.code, 'invalid_arguments');
    assert.equal(calls[1].result.error.code, 'unknown_tool');
  } finally { s.cleanup(); }
});

test('memory tools cannot claim user provenance or downgrade it', async () => {
  const s = freshStore();
  try {
    addMemory(s.db, { namespace: 'user', text: 'Prefers metric units', source: 'said' });
    const t = createTask(s.db, goal(tool('memory_add', { namespace: 'user', text: 'prefers metric units', source: 'guess' }), tool('memory_add', { namespace: 'user', text: 'x', source: 'said' }), tool('memory_search', { query: 'metric' })));
    await run(s, t.id);
    const d = taskDetail(s.db, t.id)!;
    assert.equal(d.toolCalls[0].result.result.source, 'said');
    assert.equal(d.toolCalls[1].result.error.code, 'invalid_arguments');
    assert.equal(d.toolCalls[2].result.result.results[0].text, 'Prefers metric units');
    assert.equal(listMemory(s.db).length, 1);
  } finally { s.cleanup(); }
});

test('step limit, retries and backend failures end the task honestly', async () => {
  const s = freshStore();
  try {
    setAgentSettings(s.db, { maxSteps: 2 });
    const looping: InferenceBackend = { identity: { id: 'loop', kind: 'mock', model: null, local: true }, async ready() { return { ok: true, message: '' }; },
      async call(): Promise<InferenceResult> { return { content: null, toolCalls: [{ id: `c${Math.random()}`, name: 'memory_search', arguments: { query: 'x' } }], finishReason: 'tool_use', usage: { inputTokens: 0, outputTokens: 0 } }; } };
    const t1 = createTask(s.db, 'loop forever');
    assert.equal(await run(s, t1.id, looping), 'failed');
    assert.match(getTask(s.db, t1.id)!.error!, /step limit/);

    let calls = 0;
    const flaky: InferenceBackend = { ...looping, async call() { calls++; if (calls < 3) throw new InferenceError('NetworkError', 'reset'); return { content: 'done', toolCalls: [], finishReason: 'stop', usage: { inputTokens: 1, outputTokens: 1 } }; } };
    const t2 = createTask(s.db, 'flaky');
    assert.equal(await run(s, t2.id, flaky), 'completed');
    assert.equal(calls, 3);

    const auth: InferenceBackend = { ...looping, async call() { throw new InferenceError('AuthError', 'bad key'); } };
    const t3 = createTask(s.db, 'auth');
    assert.equal(await run(s, t3.id, auth), 'failed');
    assert.match(getTask(s.db, t3.id)!.error!, /AuthError/);
  } finally { s.cleanup(); }
});

test('a stream that exceeds its hard ceiling is not retried, while an idle timeout still is', async () => {
  const s = freshStore();
  try {
    const base: InferenceBackend = { identity: { id: 'ceil', kind: 'mock', model: null, local: true }, async ready() { return { ok: true, message: '' }; }, async call() { throw new Error('unused'); } };
    let ceilingCalls = 0;
    const ceiling: InferenceBackend = { ...base, async call() { ceilingCalls++; throw new InferenceError('TimeoutError', 'Inference stream exceeded the maximum duration (5 ms ceiling); not retried', { retryable: false }); } };
    const t1 = createTask(s.db, 'ceiling');
    assert.equal(await run(s, t1.id, ceiling), 'failed');
    assert.equal(ceilingCalls, 1, 'ceiling expiry is attempted once');
    assert.match(getTask(s.db, t1.id)!.error!, /TimeoutError.*maximum duration.*not retried/);
    assert.equal(s.db.prepare("SELECT COUNT(*) AS n FROM events WHERE task_id = ? AND type = 'inference.retry'").get(t1.id)!.n, 0);

    let idleCalls = 0;
    const idle: InferenceBackend = { ...base, async call() { idleCalls++; if (idleCalls < 3) throw new InferenceError('TimeoutError', 'Inference stream was silent for 5 ms'); return { content: 'done', toolCalls: [], finishReason: 'stop', usage: { inputTokens: 1, outputTokens: 1 } }; } };
    const t2 = createTask(s.db, 'idle');
    assert.equal(await run(s, t2.id, idle), 'completed');
    assert.equal(idleCalls, 3, 'idle timeouts are retried');
  } finally { s.cleanup(); }
});

test('pause or cancellation during inference backoff prevents another request', async () => {
  const { setPaused } = await import('../src/settings.ts');
  const s = freshStore();
  try {
    let calls = 0;
    const backend: InferenceBackend = { identity: { id: 'retry', kind: 'mock', model: null, local: true }, async ready() { return { ok: true, message: '' }; },
      async call() { calls++; throw new InferenceError('NetworkError', 'reset'); } };
    const t = createTask(s.db, 'pause retry');
    setStatus(s.db, t.id, 'running');
    assert.equal(await runAttempt(t.id, { db: s.db, backend, serviceDir: s.dir, signal: new AbortController().signal, sleep: async () => { setPaused(s.db, true); } }), 'paused');
    assert.equal(calls, 1);
    assert.equal(getTask(s.db, t.id)!.status, 'queued');
    setPaused(s.db, false);
    const t2 = createTask(s.db, 'cancel retry');
    const ctl = new AbortController();
    setStatus(s.db, t2.id, 'running');
    assert.equal(await runAttempt(t2.id, { db: s.db, backend, serviceDir: s.dir, signal: ctl.signal, sleep: async () => { ctl.abort(); } }), 'cancelled');
    assert.equal(calls, 2);
  } finally { s.cleanup(); }
});

test('a pause during the first of several tool calls stops the rest of the step until resume', async () => {
  const { setPaused } = await import('../src/settings.ts');
  const { getTool } = await import('../src/tools/registry.ts');
  const s = freshStore();
  const search = getTool('memory_search')!;
  const original = search.execute;
  const ran: string[] = [];
  search.execute = async (args, ctx) => { ran.push(args.query as string); if (args.query === 'one') setPaused(s.db, true); return original(args, ctx); };
  try {
    const step = (): InferenceResult => ({ content: null, finishReason: 'tool_use', usage: { inputTokens: 1, outputTokens: 1 }, toolCalls: ['one', 'two', 'three'].map(q => ({ id: `multi_${q}`, name: 'memory_search', arguments: { query: q } })) });
    let modelCalls = 0;
    const backend: InferenceBackend = { identity: { id: 'multi', kind: 'mock', model: null, local: true }, async ready() { return { ok: true, message: '' }; },
      async call(): Promise<InferenceResult> { return modelCalls++ === 0 ? step() : { content: 'all done', toolCalls: [], finishReason: 'stop', usage: { inputTokens: 1, outputTokens: 1 } }; } };
    const t = createTask(s.db, 'multi');
    assert.equal(await run(s, t.id, backend), 'paused');
    assert.deepEqual(ran, ['one'], 'calls 2 and 3 never start');
    assert.equal(getTask(s.db, t.id)!.status, 'queued');
    assert.deepEqual(taskDetail(s.db, t.id)!.toolCalls.map(c => c.status), ['succeeded']);
    assert.equal(modelCalls, 1);
    setPaused(s.db, false);
    assert.equal(await run(s, t.id, backend), 'completed');
    assert.deepEqual(ran, ['one', 'two', 'three'], 'resume runs the remaining calls once each');
    assert.equal(modelCalls, 2);
    assert.equal(getTask(s.db, t.id)!.result, 'all done');
  } finally { search.execute = original; s.cleanup(); }
});

test('cancellation stops queued and running tasks', async () => {
  const s = freshStore();
  try {
    const queued = createTask(s.db, 'later');
    assert.equal(cancelTask(s.db, queued.id).status, 'cancelled');
    const t = createTask(s.db, 'now');
    const controller = new AbortController();
    const slow: InferenceBackend = { identity: { id: 'slow', kind: 'mock', model: null, local: true }, async ready() { return { ok: true, message: '' }; },
      call: (req) => new Promise((_, reject) => req.signal.addEventListener('abort', () => reject(new InferenceError('Cancelled', 'aborted')))) };
    const pending = run(s, t.id, slow, controller.signal);
    await new Promise(r => setTimeout(r, 10));
    cancelTask(s.db, t.id); controller.abort();
    assert.equal(await pending, 'cancelled');
    assert.equal(getTask(s.db, t.id)!.status, 'cancelled');
  } finally { s.cleanup(); }
});

function crashMidWrite(s: ReturnType<typeof freshStore>, file: string, content: string) {
  const t = createTask(s.db, 'write after crash');
  setStatus(s.db, t.id, 'running');
  appendMessage(s.db, t.id, { role: 'assistant', content: '', toolCalls: [{ id: 'c1', name: 'file_write', arguments: { path: file, content } }] });
  const row = ensureToolCall(s.db, t.id, 'c1', 'file_write', { path: file, content });
  updateToolCall(s.db, row.id, { status: 'running' });
  recordIntent(s.db, t.id, row.id, { kind: 'filesystem.write', target: file, reconciliation: { path: file, expectedContentSha256: sha256(content), expectedSize: Buffer.byteLength(content), before: { exists: false } } });
  return t;
}

test('recovery: confirmed write resumes without repeating it', async () => {
  const s = freshStore();
  try {
    setPermissions(s.db, s.dir, { fileRoots: [s.files] });
    const file = path.join(s.files, 'r.txt');
    const t = crashMidWrite(s, file, 'data');
    fs.writeFileSync(file, 'data'); // the write landed before the crash
    assert.deepEqual(recoverInterrupted(s.db, 3), { requeued: 1, needsReview: 0, failed: 0 });
    assert.equal(await run(s, t.id), 'completed');
    const d = taskDetail(s.db, t.id)!;
    assert.equal(d.effects[0].state, 'applied');
    assert.equal(d.toolCalls[0].result.result.recovered, true);
    assert.equal(listApprovals(s.db, 'pending').length, 0, 'no second approval or execution');
  } finally { s.cleanup(); }
});

test('recovery: write that never happened is reported as not executed', async () => {
  const s = freshStore();
  try {
    const t = crashMidWrite(s, path.join(s.files, 'never.txt'), 'data');
    recoverInterrupted(s.db, 3);
    await run(s, t.id);
    const d = taskDetail(s.db, t.id)!;
    assert.equal(d.effects[0].state, 'not_applied');
    assert.equal(d.toolCalls[0].result.error.code, 'not_executed');
  } finally { s.cleanup(); }
});

test('recovery: unknown outcome goes to review and is never retried automatically', async () => {
  const s = freshStore();
  try {
    const file = path.join(s.files, 'odd.txt');
    const t = crashMidWrite(s, file, 'data');
    fs.writeFileSync(file, 'something else');
    assert.equal(recoverInterrupted(s.db, 3).needsReview, 1);
    assert.equal(getTask(s.db, t.id)!.status, 'needs_review');
    resolveReview(s.db, t.id, 'resume');
    assert.equal(await run(s, t.id), 'completed');
    assert.equal(taskDetail(s.db, t.id)!.toolCalls[0].result.error.code, 'outcome_unknown');
    assert.equal(fs.readFileSync(file, 'utf8'), 'something else');
  } finally { s.cleanup(); }
});

test('recovery: repeated crashes stop automatic resumption', () => {
  const s = freshStore();
  try {
    const t = createTask(s.db, 'crashy');
    for (let i = 0; i < 3; i++) { setStatus(s.db, t.id, 'running'); recoverInterrupted(s.db, 2); }
    assert.equal(getTask(s.db, t.id)!.status, 'failed');
    assert.equal(getTask(s.db, t.id)!.recoveries, 3);
  } finally { s.cleanup(); }
});

test('side effects planned alongside earlier calls are deferred until grounded', async () => {
  const s = freshStore();
  try {
    fs.writeFileSync(path.join(s.files, 'notes.txt'), 'Owner: Sam');
    setPermissions(s.db, s.dir, { fileRoots: [s.files], autoApproveFileWrites: true });
    let step = 0;
    const eager: InferenceBackend = { identity: { id: 'eager', kind: 'mock', model: null, local: true }, async ready() { return { ok: true, message: '' }; },
      async call(): Promise<InferenceResult> {
        step++;
        const usage = { inputTokens: 0, outputTokens: 0 };
        if (step === 1) return { content: null, finishReason: 'tool_use', usage, toolCalls: [{ id: 'r', name: 'file_read', arguments: { path: 'notes.txt' } }, { id: 'w', name: 'file_write', arguments: { path: 'owner.txt', content: 'John Doe' } }] };
        // Re-reading what it already saw does not block the write a second time.
        if (step === 2) return { content: null, finishReason: 'tool_use', usage, toolCalls: [{ id: 'r2', name: 'file_read', arguments: { path: 'notes.txt' } }, { id: 'w2', name: 'file_write', arguments: { path: 'owner.txt', content: 'Sam' } }] };
        return { content: 'done', toolCalls: [], finishReason: 'stop', usage };
      } };
    const t = createTask(s.db, 'owner');
    assert.equal(await run(s, t.id, eager), 'completed');
    const calls = taskDetail(s.db, t.id)!.toolCalls;
    assert.deepEqual(calls.map(c => [c.callId, c.status]), [['r', 'succeeded'], ['w', 'failed'], ['r2', 'succeeded'], ['w2', 'succeeded']]);
    assert.equal(calls[1].result.error.code, 'deferred');
    assert.equal(fs.readFileSync(path.join(s.files, 'owner.txt'), 'utf8'), 'Sam');
  } finally { s.cleanup(); }
});

test('write approvals preview content unless it is flagged', async () => {
  const s = freshStore();
  try {
    setPermissions(s.db, s.dir, { fileRoots: [s.files] });
    const t = createTask(s.db, `/tool file_write ${JSON.stringify({ path: 'a.txt', content: 'Sam' })}`);
    await run(s, t.id);
    assert.match(listApprovals(s.db, 'pending')[0].summary, /“Sam”/);
    const t2 = createTask(s.db, `/tool file_write ${JSON.stringify({ path: 'b.txt', content: 'AKIAABCDEFGHIJKLMNOP' })}`);
    await run(s, t2.id);
    const flagged = listApprovals(s.db, 'pending').find(a => a.taskId === t2.id)!;
    assert.doesNotMatch(flagged.summary, /AKIA/);
    assert.match(flagged.summary, /content hidden/);
  } finally { s.cleanup(); }
});

test('streaming backends publish live deltas; tool-call text is not shown', async () => {
  const { onEvent } = await import('../src/store.ts');
  const s = freshStore();
  const seen: Array<{ type: string; data: any; transient?: boolean }> = [];
  const off = onEvent(e => { if (e.transient) seen.push(e); });
  try {
    const t = createTask(s.db, 'stream please');
    assert.equal(await run(s, t.id), 'completed');
    const text = seen.filter(e => e.type === 'task.delta').map(e => e.data.content).join('');
    assert.equal(text, getTask(s.db, t.id)!.result);
    seen.length = 0;
    const jsonCall: InferenceBackend = { identity: { id: 'j', kind: 'mock', model: null, local: true }, async ready() { return { ok: true, message: '' }; },
      async call() { return { content: 'done', toolCalls: [], finishReason: 'stop', usage: { inputTokens: 0, outputTokens: 0 } }; },
      async *stream() { yield { type: 'delta', content: '{"name": "memory_search",' }; yield { type: 'delta', content: ' "arguments": {}}' }; yield { type: 'done', result: { content: null, toolCalls: [], finishReason: 'stop', usage: { inputTokens: 0, outputTokens: 0 } } }; } };
    const t2 = createTask(s.db, 'json');
    await run(s, t2.id, jsonCall);
    assert.equal(seen.filter(e => e.type === 'task.delta').length, 0);
    seen.length = 0;
    const prefaced: InferenceBackend = { ...jsonCall, async *stream() {
      yield { type: 'delta', content: 'I will check this. '.repeat(4) };
      yield { type: 'delta', content: '<tool_call>{' };
      yield { type: 'delta', content: '"name":"memory_search"}</tool_call>' };
      yield { type: 'done', result: { content: null, toolCalls: [], finishReason: 'stop', usage: { inputTokens: 0, outputTokens: 0 } } };
    } };
    const t3 = createTask(s.db, 'prefaced'); await run(s, t3.id, prefaced);
    assert.ok(seen.some(e => e.type === 'task.delta_reset'));
    assert.doesNotMatch(seen.filter(e => e.type === 'task.delta').map(e => e.data.content).join(''), /tool_call|memory_search/);
  } finally { off(); s.cleanup(); }
});

test('task grants cover only the approved file and never dangerous actions', async () => {
  const s = freshStore();
  try {
    setPermissions(s.db, s.dir, { fileRoots: [s.files], shell: true });
    const t = createTask(s.db, goal(tool('file_write', { path: 'a.txt', content: 'a' }), tool('file_write', { path: 'a.txt', content: 'updated', overwrite: true }), tool('file_write', { path: 'b.txt', content: 'b' }), tool('shell_run', { command: 'touch c' })));
    assert.equal(await run(s, t.id), 'waiting_approval');
    const first = listApprovals(s.db, 'pending')[0];
    assert.equal(first.grantTarget, path.join(s.files, 'a.txt'));
    decideApproval(s.db, first.id, 'approve', 'task');
    assert.equal(await run(s, t.id), 'waiting_approval');
    assert.equal(fs.readFileSync(path.join(s.files, 'a.txt'), 'utf8'), 'updated');
    assert.equal(fs.existsSync(path.join(s.files, 'b.txt')), false, 'different target still asks');
    decideApproval(s.db, listApprovals(s.db, 'pending')[0].id, 'approve');
    assert.equal(await run(s, t.id), 'waiting_approval');
    const shell = listApprovals(s.db, 'pending')[0];
    assert.throws(() => decideApproval(s.db, shell.id, 'approve', 'task'), /only be approved once/);
    const other = createTask(s.db, tool('file_write', { path: 'a.txt', content: 'other', overwrite: true }));
    assert.equal(await run(s, other.id), 'waiting_approval');
  } finally { s.cleanup(); }
});

test('pausing returns the running task to the queue at a step boundary', async () => {
  const { setPaused } = await import('../src/settings.ts');
  const s = freshStore();
  try {
    const t = createTask(s.db, tool('memory_search', { query: 'x' }));
    setPaused(s.db, true);
    assert.equal(await run(s, t.id), 'paused');
    assert.equal(getTask(s.db, t.id)!.status, 'queued');
    setPaused(s.db, false);
    assert.equal(await run(s, t.id), 'completed');
  } finally { s.cleanup(); }
});

test('a pause during a model call holds that step\'s tool calls until resume, and never interrupts a started tool', async () => {
  const { setPaused } = await import('../src/settings.ts');
  const s = freshStore();
  try {
    setPermissions(s.db, s.dir, { fileRoots: [s.files], autoApproveFileWrites: true });
    const mock = createMockBackend();
    const pausing: InferenceBackend = { identity: mock.identity, ready: () => mock.ready(), async call(req) { const r = await mock.call(req); setPaused(s.db, true); return r; } };
    const t = createTask(s.db, tool('file_write', { path: 'p.txt', content: 'paused-write' }));
    assert.equal(await run(s, t.id, pausing), 'paused');
    assert.equal(getTask(s.db, t.id)!.status, 'queued');
    assert.equal(fs.existsSync(path.join(s.files, 'p.txt')), false, 'no tool starts after the pause');
    assert.equal(taskDetail(s.db, t.id)!.toolCalls.length, 0);
    setPaused(s.db, false);
    assert.equal(await run(s, t.id), 'completed');
    assert.equal(fs.readFileSync(path.join(s.files, 'p.txt'), 'utf8'), 'paused-write');
    assert.deepEqual(taskDetail(s.db, t.id)!.effects.map(e => e.state), ['applied']);
  } finally { s.cleanup(); }
});

test('final answers claiming unsupported actions are annotated', async () => {
  const s = freshStore();
  try {
    const liar: InferenceBackend = { identity: { id: 'liar', kind: 'mock', model: null, local: true }, async ready() { return { ok: true, message: '' }; },
      async call() { return { content: 'I have created the file report.txt for you.', toolCalls: [], finishReason: 'stop', usage: { inputTokens: 1, outputTokens: 1 } }; } };
    const t = createTask(s.db, 'make a report file');
    assert.equal(await run(s, t.id, liar), 'completed');
    assert.match(getTask(s.db, t.id)!.result!, /Milo check: the answer says a file was written, but no file write succeeded/);
    const finding = s.db.prepare("SELECT data_json FROM events WHERE task_id = ? AND type = 'honesty.finding'").get(t.id) as { data_json: string };
    assert.equal(JSON.parse(finding.data_json).findings[0].tool, 'file_write');
  } finally { s.cleanup(); }
});

test('file approval is invalidated if its symlink target changes', async () => {
  const s = freshStore();
  try {
    fs.mkdirSync(path.join(s.files, 'one')); fs.mkdirSync(path.join(s.files, 'two'));
    fs.symlinkSync(path.join(s.files, 'one'), path.join(s.files, 'link'));
    setPermissions(s.db, s.dir, { fileRoots: [s.files] });
    const task = createTask(s.db, tool('file_write', { path: 'link/result.txt', content: 'data' }));
    assert.equal(await run(s, task.id), 'waiting_approval');
    const approval = listApprovals(s.db, 'pending')[0];
    decideApproval(s.db, approval.id, 'approve');
    fs.unlinkSync(path.join(s.files, 'link')); fs.symlinkSync(path.join(s.files, 'two'), path.join(s.files, 'link'));
    assert.equal(await run(s, task.id), 'completed');
    assert.equal(fs.existsSync(path.join(s.files, 'two', 'result.txt')), false);
    assert.equal(taskDetail(s.db, task.id)!.toolCalls[0].status, 'denied');
  } finally { s.cleanup(); }
});

test('task-scoped file grant never bypasses content scanner findings', async () => {
  const s = freshStore();
  try {
    setPermissions(s.db, s.dir, { fileRoots: [s.files] });
    const t = createTask(s.db, goal(tool('file_write', { path: 'a.txt', content: 'safe' }), tool('file_write', { path: 'a.txt', content: '\u001b[31mred', overwrite: true })));
    assert.equal(await run(s, t.id), 'waiting_approval');
    decideApproval(s.db, listApprovals(s.db, 'pending')[0].id, 'approve', 'task');
    assert.equal(await run(s, t.id), 'waiting_approval');
    assert.equal(fs.readFileSync(path.join(s.files, 'a.txt'), 'utf8'), 'safe');
    assert.match(listApprovals(s.db, 'pending')[0].reasons.join(' '), /ANSI/);
  } finally { s.cleanup(); }
});

test('observed memories require evidence from an earlier tool result', async () => {
  const s = freshStore();
  try {
    setPermissions(s.db, s.dir, { fileRoots: [s.files] });
    fs.writeFileSync(path.join(s.files, 'facts.txt'), 'Launch deadline is Friday');
    const task = createTask(s.db, goal(
      tool('memory_add', { namespace: 'notes', text: 'Invented fact', source: 'saw' }),
      tool('file_read', { path: 'facts.txt' }),
      tool('memory_add', { namespace: 'notes', text: 'Launch deadline is Friday', source: 'saw' }),
    ));
    assert.equal(await run(s, task.id), 'completed');
    const trace = taskDetail(s.db, task.id)!.toolCalls;
    assert.equal(trace[0].result.error.code, 'unsupported_memory');
    assert.equal(trace[2].result.result.source, 'saw');
    assert.equal(listMemory(s.db).length, 1);
    setInference(s.db, { contextTokens: 16384 });
    fs.writeFileSync(path.join(s.files, 'large.txt'), 'x'.repeat(20_000) + ' Hidden phrase beyond the tool output');
    const hidden = createTask(s.db, goal(tool('file_read', { path: 'large.txt', maxBytes: 30000 }), tool('memory_add', { namespace: 'notes', text: 'Hidden phrase beyond the tool output', source: 'saw' })));
    await run(s, hidden.id);
    assert.equal(taskDetail(s.db, hidden.id)!.toolCalls[1].result.error.code, 'unsupported_memory');
    assert.throws(() => addMemory(s.db, { namespace: '__proto__', text: 'x', source: 'said' }), /namespace/);
  } finally { s.cleanup(); }
});

test('file_write refuses to run if its resolved target moved after the decision', async () => {
  const { fileWrite } = await import('../src/tools/files.ts');
  const s = freshStore();
  try {
    fs.mkdirSync(path.join(s.files, 'one')); fs.mkdirSync(path.join(s.files, 'two'));
    fs.symlinkSync(path.join(s.files, 'two'), path.join(s.files, 'link'));
    setPermissions(s.db, s.dir, { fileRoots: [s.files] });
    const { getPermissions } = await import('../src/settings.ts');
    const ctx = { db: s.db, taskId: 't', toolCallId: 'c', serviceDir: s.dir, signal: new AbortController().signal, permissions: getPermissions(s.db), expectedTarget: path.join(s.files, 'one', 'x.txt') };
    await assert.rejects(fileWrite.execute({ path: 'link/x.txt', content: 'x' }, ctx), (e: any) => e.code === 'target_changed');
    assert.equal(fs.existsSync(path.join(s.files, 'two', 'x.txt')), false);
    ctx.expectedTarget = path.join(fs.realpathSync(s.files), 'two', 'x.txt');
    await fileWrite.execute({ path: 'link/x.txt', content: 'x' }, ctx);
    assert.equal(fs.readFileSync(path.join(s.files, 'two', 'x.txt'), 'utf8'), 'x');
  } finally { s.cleanup(); }
});
