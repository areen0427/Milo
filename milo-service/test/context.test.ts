import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { estimateTokens, fitContext, estimateMessages } from '../src/context.ts';
import type { Message } from '../src/inference/types.ts';
import { openStore } from '../src/store.ts';
import { runAttempt } from '../src/agent.ts';
import { createMockBackend } from '../src/inference/mock.ts';
import { createTask, getTask, setStatus, taskDetail, startAttempt } from '../src/jobs.ts';
import type { InferenceBackend, InferenceResult } from '../src/inference/types.ts';
import { setInference, setPermissions } from '../src/settings.ts';
import { freshStore, tempDir } from './helpers.ts';

const callsOf = (m: Message | undefined) => (m && m.role === 'assistant' ? m.toolCalls ?? [] : []);
const big = (n: number) => 'x'.repeat(n);
function history(): Message[] {
  return [
    { role: 'system', content: 'sys' },
    { role: 'user', content: 'goal' },
    { role: 'assistant', content: '', toolCalls: [{ id: 'a', name: 'file_read', arguments: {} }] },
    { role: 'tool', toolCallId: 'a', content: big(20_000) },
    { role: 'assistant', content: big(2000), toolCalls: [{ id: 'b', name: 'file_read', arguments: {} }] },
    { role: 'tool', toolCallId: 'b', content: big(20_000) },
  ];
}

test('fits by eliding older tool results, keeping goal and latest step', () => {
  const h = history();
  const fitted = fitContext(h, 9000);
  assert.equal(fitted.fits, true);
  assert.equal(fitted.elidedResults, 1);
  assert.match(fitted.messages[3].content, /elided/);
  assert.equal(fitted.messages[5].content.length, 20_000, 'latest result kept');
  assert.equal(fitted.messages[1].content, 'goal');
  assert.equal(h[3].content.length, 20_000, 'input not mutated');
  assert.ok(estimateMessages(fitted.messages) <= 9000);
  assert.equal(fitContext(h, 1_000_000).elidedResults, 0);
  assert.equal(fitContext(h, 1000).fits, false);
});

test('agent compacts the prompt, keeps the log, and records usage', async () => {
  const s = freshStore();
  try {
    fs.writeFileSync(path.join(s.files, 'big.txt'), big(14_000));
    setPermissions(s.db, s.dir, { fileRoots: [s.files] });
    setInference(s.db, { contextTokens: 9000, maxTokens: 512 });
    const read = `/tool file_read {"path":"big.txt"}`;
    const t = createTask(s.db, [read, read, read].join('\n'));
    setStatus(s.db, t.id, 'running');
    startAttempt(s.db, t.id, 'mock');
    assert.equal(await runAttempt(t.id, { db: s.db, backend: createMockBackend(), serviceDir: s.dir, signal: new AbortController().signal }), 'completed');
    const d = taskDetail(s.db, t.id)!;
    assert.equal(d.messages.filter(m => m.role === 'tool').every(m => m.content.length > 13_000), true, 'log keeps full results');
    const events = s.db.prepare("SELECT data_json FROM events WHERE task_id = ? AND type = 'context.compacted'").all(t.id);
    assert.ok(events.length >= 1);
    const task = getTask(s.db, t.id)!;
    assert.ok(task.usage.inputTokens > 0 && task.usage.estimated);
    assert.deepEqual(d.attempts[0].usage, task.usage);
    assert.throws(() => setInference(s.db, { maxTokens: 30_000 }), /smaller than contextTokens/);
  } finally { s.cleanup(); }
});

test('a v1 database is migrated in place', () => {
  const dir = tempDir();
  try {
    const old = new DatabaseSync(path.join(dir, 'milo.db'));
    old.exec(`CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO meta VALUES ('schema_version','1');
      CREATE TABLE tasks (id TEXT PRIMARY KEY, goal TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, result TEXT, error TEXT,
        origin TEXT NOT NULL DEFAULT 'client', schedule_id TEXT, occurrence_id TEXT, steps INTEGER NOT NULL DEFAULT 0, recoveries INTEGER NOT NULL DEFAULT 0, cancel_requested INTEGER NOT NULL DEFAULT 0);
      INSERT INTO tasks (id, goal, status, created_at, updated_at) VALUES ('t1', 'old', 'completed', '2026-01-01', '2026-01-01');`);
    old.close();
    const db = openStore(dir);
    assert.deepEqual(getTask(db, 't1')!.usage, { inputTokens: 0, outputTokens: 0, estimated: false });
    assert.equal((db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string }).value, '5');
    db.close();
    openStore(dir).close(); // idempotent
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('context estimate accounts for non-ASCII input more conservatively', () => {
  assert.ok(estimateTokens('你好世界') >= 4);
  assert.ok(estimateTokens('😀') >= 2);
});

test('latest step is never elided, even when it alone is too big; older replies are shortened last', () => {
  const h = history();
  const fitted = fitContext(h, 100);
  assert.equal(fitted.fits, false);
  assert.equal(fitted.messages[5].content.length, 20_000, 'latest tool result untouched');
  assert.equal(fitted.messages[4].content.length, 2000, 'latest assistant message untouched');
  assert.equal(fitted.messages[0].content, 'sys'); assert.equal(fitted.messages[1].content, 'goal');
  // A tool result placed after the final assistant message is protected; only earlier ones are elided.
  const tail: Message[] = [...h, { role: 'assistant', content: big(2000) }];
  const f2 = fitContext(tail, 1000);
  assert.equal(f2.elidedResults, 2); assert.equal(f2.shortenedReplies, 1);
  assert.match(f2.messages[4].content, /shortened/);
  assert.equal(f2.messages[6].content.length, 2000);
  assert.equal(h[4].content.length, 2000, 'input not mutated');
});

test('estimates scale with non-ASCII bytes and tool-call arguments', () => {
  assert.equal(estimateTokens(''), 0);
  assert.equal(estimateTokens('abcde'), 2);
  assert.equal(estimateTokens('你好'), 6, 'three UTF-8 bytes per CJK character');
  assert.equal(estimateTokens('😀'), 4);
  const plain: Message[] = [{ role: 'assistant', content: 'x' }];
  const withCalls: Message[] = [{ role: 'assistant', content: 'x', toolCalls: [{ id: 'a', name: 'file_write', arguments: { content: big(1000) } }] }];
  assert.ok(estimateMessages(withCalls) > estimateMessages(plain) + 400);
});

test('a task that cannot fit the context window fails honestly instead of being truncated', async () => {
  const s = freshStore();
  try {
    setInference(s.db, { contextTokens: 1024, maxTokens: 512 });
    const t = createTask(s.db, big(3900));
    setStatus(s.db, t.id, 'running'); startAttempt(s.db, t.id, 'mock');
    assert.equal(await runAttempt(t.id, { db: s.db, backend: createMockBackend(), serviceDir: s.dir, signal: new AbortController().signal }), 'failed');
    const task = getTask(s.db, t.id)!;
    assert.match(task.error!, /1024-token context window/);
    assert.equal(task.steps, 0, 'the model was never called');
  } finally { s.cleanup(); }
});

test('schema v2 migration: fresh database has usage columns; a populated v1 database keeps its rows and is idempotent', async () => {
  const { usageTotals } = await import('../src/jobs.ts');
  const cols = (db: DatabaseSync, table: string) => (db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map(c => c.name);
  const fresh = freshStore();
  try {
    for (const table of ['tasks', 'attempts']) for (const c of ['input_tokens', 'output_tokens', 'usage_estimated']) assert.ok(cols(fresh.db, table).includes(c), `${table}.${c}`);
    assert.deepEqual(usageTotals(fresh.db), { inputTokens: 0, outputTokens: 0, tasks: 0 });
  } finally { fresh.cleanup(); }

  const dir = tempDir();
  try {
    const old = new DatabaseSync(path.join(dir, 'milo.db'));
    old.exec(`CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO meta VALUES ('schema_version','1');
      CREATE TABLE tasks (id TEXT PRIMARY KEY, goal TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, result TEXT, error TEXT,
        origin TEXT NOT NULL DEFAULT 'client', schedule_id TEXT, occurrence_id TEXT, steps INTEGER NOT NULL DEFAULT 0, recoveries INTEGER NOT NULL DEFAULT 0, cancel_requested INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE attempts (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, number INTEGER NOT NULL, backend TEXT NOT NULL, started_at TEXT NOT NULL, ended_at TEXT, outcome TEXT);
      INSERT INTO tasks (id, goal, status, created_at, updated_at, steps) VALUES ('t1', 'old', 'completed', '2026-01-01', '2026-01-01', 2);
      INSERT INTO attempts (id, task_id, number, backend, started_at, ended_at, outcome) VALUES ('a1', 't1', 1, 'mock', '2026-01-01', '2026-01-01', 'completed');`);
    old.close();
    let db = openStore(dir);
    assert.deepEqual(getTask(db, 't1')!.usage, { inputTokens: 0, outputTokens: 0, estimated: false });
    assert.deepEqual(taskDetail(db, 't1')!.attempts[0].usage, { inputTokens: 0, outputTokens: 0, estimated: false });
    assert.equal(getTask(db, 't1')!.steps, 2);
    db.prepare('UPDATE tasks SET input_tokens = 7 WHERE id = ?').run('t1');
    db.close();
    db = openStore(dir); // second open must not fail on duplicate columns or reset data
    assert.equal(getTask(db, 't1')!.usage.inputTokens, 7);
    assert.deepEqual(usageTotals(db), { inputTokens: 7, outputTokens: 0, tasks: 1 });
    db.close();
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

function writeHistory(): Message[] {
  const call = (id: string, content: string) => ({ id, name: 'file_write', arguments: { path: `${id}.txt`, content } });
  return [
    { role: 'system', content: 'sys' },
    { role: 'user', content: 'goal' },
    { role: 'assistant', content: 'writing', toolCalls: [call('a', big(20_000))] },
    { role: 'tool', toolCallId: 'a', content: '{"ok":true}' },
    { role: 'assistant', content: 'writing', toolCalls: [call('b', big(20_000))] },
    { role: 'tool', toolCallId: 'b', content: '{"ok":true}' },
  ];
}

test('older tool-call arguments are elided last, keeping the tool name; the latest call is never touched', () => {
  const h = writeHistory();
  const before = JSON.stringify(h);
  // Tool results and replies are already small, so only argument elision can make this fit.
  const fitted = fitContext(h, 9000);
  assert.equal(fitted.fits, true);
  assert.equal(fitted.elidedResults, 0); assert.equal(fitted.shortenedReplies, 0); assert.equal(fitted.elidedArguments, 1);
  const first = callsOf(fitted.messages[2])[0];
  assert.equal(first.id, 'a'); assert.equal(first.name, 'file_write');
  assert.deepEqual(Object.keys(first.arguments).sort(), ['elided', 'note']);
  assert.match(String(first.arguments.note), /file_write call \(\d+ characters\) were removed/);
  assert.equal((callsOf(fitted.messages[4])[0].arguments.content as string).length, 20_000, 'latest call kept');
  assert.equal(fitted.messages[0].content, 'sys'); assert.equal(fitted.messages[1].content, 'goal');
  assert.equal(JSON.stringify(h), before, 'input not mutated');
  assert.ok(estimateMessages(fitted.messages) <= 9000);
  // When even the latest call alone is too large, the failure is reported rather than truncating it.
  const tooSmall = fitContext(h, 1000);
  assert.equal(tooSmall.fits, false);
  assert.equal((callsOf(tooSmall.messages[4])[0].arguments.content as string).length, 20_000);
  // Cheaper steps are used first: with no argument pressure nothing is rewritten.
  assert.equal(fitContext(h, 1_000_000).elidedArguments, 0);
  assert.equal(fitContext(h, 1_000_000).signature, '');
});

test('small arguments are left alone, and the signature identifies which messages changed', () => {
  const h = writeHistory();
  h[2] = { role: 'assistant', content: 'writing', toolCalls: [{ id: 'a', name: 'file_read', arguments: { path: 'a.txt' } }] };
  const fitted = fitContext(h, 2000);
  assert.equal(fitted.elidedArguments, 0);
  assert.equal(fitted.fits, false);
  const a = fitContext(writeHistory(), 9000).signature;
  assert.equal(a, fitContext(writeHistory(), 9000).signature, 'deterministic');
  assert.notEqual(a, fitContext([...writeHistory(), { role: 'assistant', content: 'x', toolCalls: [{ id: 'c', name: 'file_read', arguments: {} }] }], 5000).signature, 'a later call changes which messages are elided');
});

function scripted(prompts: Message[][], steps: Array<() => InferenceResult>): InferenceBackend {
  let n = 0;
  return { identity: { id: 'scripted', kind: 'mock', model: null, local: true }, async ready() { return { ok: true, message: '' }; },
    async call(req): Promise<InferenceResult> { prompts.push(req.messages); return steps[Math.min(n++, steps.length - 1)](); } };
}

test('a task that only fits after argument elision completes; the stored log is unchanged and the event is not repeated', async () => {
  const s = freshStore();
  try {
    setPermissions(s.db, s.dir, { fileRoots: [s.files], autoApproveFileWrites: true });
    setInference(s.db, { contextTokens: 8192, maxTokens: 512 });
    const usage = { inputTokens: 0, outputTokens: 0 };
    const write = (id: string, content: string) => (): InferenceResult => ({ content: null, finishReason: 'tool_use', usage, toolCalls: [{ id, name: 'file_write', arguments: { path: `${id}.txt`, content } }] });
    const prompts: Message[][] = [];
    const backend = scripted(prompts, [
      write('w1', big(9000)), write('w2', big(9000)), write('w3', big(9000)),
      write('s1', 'a'), write('s2', 'b'), write('s3', 'c'),
      () => ({ content: 'done', toolCalls: [], finishReason: 'stop', usage }),
    ]);
    const t = createTask(s.db, 'write three big files, then three small ones');
    setStatus(s.db, t.id, 'running'); startAttempt(s.db, t.id, 'scripted');
    assert.equal(await runAttempt(t.id, { db: s.db, backend, serviceDir: s.dir, signal: new AbortController().signal, sleep: async () => {} }), 'completed');
    assert.equal(getTask(s.db, t.id)!.status, 'completed');
    // The model saw placeholders for older big writes but never for the latest call.
    const lastPrompt = prompts[prompts.length - 1];
    const placeholders = lastPrompt.flatMap(callsOf).filter(c => c.arguments.elided === true);
    assert.ok(placeholders.length >= 1 && placeholders.every(c => c.name === 'file_write'));
    for (const p of prompts) {
      const lastAssistant = [...p].reverse().find(m => m.role === 'assistant');
      assert.ok(callsOf(lastAssistant).every(c => c.arguments.elided !== true), 'latest call never elided');
    }
    // The stored log keeps every original argument.
    const stored = taskDetail(s.db, t.id)!.messages.filter(m => m.role === 'assistant').flatMap(m => m.toolCalls ?? []);
    assert.deepEqual(stored.slice(0, 3).map(c => (c.arguments.content as string).length), [9000, 9000, 9000]);
    assert.ok(stored.every(c => c.arguments.elided !== true));
    // One event per change in what was elided, not one per step.
    const events = (s.db.prepare("SELECT data_json FROM events WHERE task_id = ? AND type = 'context.compacted' ORDER BY seq").all(t.id) as Array<{ data_json: string }>).map(r => JSON.parse(r.data_json));
    const compactedSteps = prompts.filter(p => p.some(m => callsOf(m).some(c => c.arguments.elided === true))).length;
    assert.ok(events.length >= 1);
    assert.ok(events.length < compactedSteps, `${events.length} events for ${compactedSteps} compacted steps`);
    assert.equal(new Set(events.map(e => e.signature)).size, events.length, 'no consecutive duplicates');
    assert.ok(events.every((e, i) => i === 0 || e.signature !== events[i - 1].signature));
    assert.ok(events.every(e => e.elidedArguments >= 1));
  } finally { s.cleanup(); }
});
