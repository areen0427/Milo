import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { createOpenAICompatibleBackend, parseCompletion, INVALID_ARGUMENTS } from '../src/inference/openaiCompatible.ts';
import { resolveBackend, registerEngine, describeBackend } from '../src/inference/router.ts';
import { DEFAULT_INFERENCE } from '../src/settings.ts';
import { parseDirectives } from '../src/inference/mock.ts';
import { htmlToText, webFetch } from '../src/tools/web.ts';
import { DEFAULT_PERMISSIONS } from '../src/settings.ts';

function fakeServer(handler: (body: any, res: http.ServerResponse) => void): Promise<{ url: string; close(): void; bodies: any[] }> {
  const bodies: any[] = [];
  const server = http.createServer((req, res) => {
    let raw = ''; req.on('data', d => raw += d);
    req.on('end', () => {
      if (req.url === '/v1/models') { res.end('{"data":[]}'); return; }
      const body = JSON.parse(raw); bodies.push(body); handler(body, res);
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`, close: () => server.close(), bodies })));
}

test('parses tool calls, invalid argument JSON and usage', () => {
  const r = parseCompletion({ choices: [{ finish_reason: 'tool_calls', message: { content: null, tool_calls: [
    { id: 'a', function: { name: 'file_read', arguments: '{"path":"x"}' } },
    { function: { name: 'file_list', arguments: '{bad' } },
  ] } }], usage: { prompt_tokens: 12, completion_tokens: 3 } });
  assert.equal(r.finishReason, 'tool_use');
  assert.deepEqual(r.toolCalls[0], { id: 'a', name: 'file_read', arguments: { path: 'x' } });
  assert.ok(INVALID_ARGUMENTS in r.toolCalls[1].arguments);
  assert.match(r.toolCalls[1].id, /^call_/);
  assert.deepEqual(r.usage, { inputTokens: 12, outputTokens: 3 });
  assert.throws(() => parseCompletion({}), /no choices/);
});

test('talks to a local OpenAI-compatible server and maps errors', async () => {
  let mode = 'ok';
  const srv = await fakeServer((body, res) => {
    if (mode === '429') { res.statusCode = 429; res.end('{}'); return; }
    if (mode === '401') { res.statusCode = 401; res.end('{}'); return; }
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: `echo ${body.messages.length}` } }], usage: { prompt_tokens: 5, completion_tokens: 2 } }));
  });
  try {
    const b = createOpenAICompatibleBackend({ baseUrl: srv.url, model: 'test-model', timeoutMs: 5000, allowRemote: false });
    assert.equal((await b.ready()).ok, true);
    const localhost = createOpenAICompatibleBackend({ baseUrl: srv.url.replace('127.0.0.1', 'localhost'), model: 'test-model', timeoutMs: 5000, allowRemote: false });
    const localhostStatus = await localhost.ready();
    assert.equal(localhostStatus.ok, true); assert.match(localhostStatus.message, /127\.0\.0\.1/);
    const tools = [{ name: 't', description: 'd', inputSchema: { type: 'object' as const, properties: {} } }];
    const r = await b.call({ messages: [{ role: 'system', content: 's' }, { role: 'user', content: 'u' }, { role: 'assistant', content: '', toolCalls: [{ id: 'c', name: 't', arguments: { a: 1 } }] }, { role: 'tool', toolCallId: 'c', content: '{}' }], tools, maxTokens: 64, temperature: 0, signal: new AbortController().signal, taskId: 'x' });
    assert.equal(r.content, 'echo 4');
    const sent = srv.bodies[0];
    assert.equal(sent.model, 'test-model');
    assert.equal(sent.tools[0].function.name, 't');
    assert.equal(sent.messages[2].tool_calls[0].function.arguments, '{"a":1}');
    assert.equal(sent.messages[3].tool_call_id, 'c');
    mode = '429';
    await assert.rejects(b.call({ messages: [], tools: [], maxTokens: 8, temperature: 0, signal: new AbortController().signal, taskId: 'x' }), (e: any) => e.errorClass === 'ResourceExhausted');
    mode = '401';
    await assert.rejects(b.call({ messages: [], tools: [], maxTokens: 8, temperature: 0, signal: new AbortController().signal, taskId: 'x' }), (e: any) => e.errorClass === 'AuthError');
  } finally { srv.close(); }
  const dead = createOpenAICompatibleBackend({ baseUrl: 'http://127.0.0.1:9/v1', model: 'm', timeoutMs: 2000, allowRemote: false });
  await assert.rejects(dead.call({ messages: [], tools: [], maxTokens: 8, temperature: 0, signal: new AbortController().signal, taskId: 'x' }), (e: any) => e.errorClass === 'Unavailable');
});

test('remote inference requires an explicit opt-in; engine slot is truthful', async () => {
  assert.throws(() => createOpenAICompatibleBackend({ baseUrl: 'http://localhost/v1?token=secret', model: 'm', timeoutMs: 1000, allowRemote: false }), /without credentials/);
  assert.throws(() => createOpenAICompatibleBackend({ baseUrl: 'https://api.example.com/v1', model: 'm', timeoutMs: 1000, allowRemote: false }), /allowRemote/);
  assert.equal(resolveBackend(DEFAULT_INFERENCE).identity.kind, 'mock');
  const status = await describeBackend({ ...DEFAULT_INFERENCE, backend: 'engine' });
  assert.equal(status.ready, false);
  assert.match(status.message, /not installed/);
  registerEngine(() => ({ identity: { id: 'engine:test', kind: 'engine', model: 'tiny', local: true }, async ready() { return { ok: true, message: 'engine ready' }; }, async call() { return { content: 'hi', toolCalls: [], finishReason: 'stop', usage: { inputTokens: 0, outputTokens: 0 } }; } }));
  try { assert.equal(resolveBackend({ ...DEFAULT_INFERENCE, backend: 'engine' }).identity.id, 'engine:test'); }
  finally { registerEngine(null); }
});

test('mock directives', () => {
  assert.deepEqual(parseDirectives('do it\n/tool file_read {"path":"a"}\n/tool memory_search'), [{ name: 'file_read', arguments: { path: 'a' } }, { name: 'memory_search', arguments: {} }]);
  assert.ok('error' in parseDirectives('/tool x {nope}')[0]);
});

test('web_fetch is gated by permission and the SSRF guard', async () => {
  const ctx = { db: null as any, taskId: 't', toolCallId: 'c', serviceDir: '/tmp', signal: new AbortController().signal, permissions: { ...DEFAULT_PERMISSIONS } };
  assert.equal((await webFetch.assess({ url: 'https://example.com' }, ctx)).decision, 'deny');
  ctx.permissions.network = true;
  assert.equal((await webFetch.assess({ url: 'https://example.com' }, ctx)).decision, 'allow');
  assert.equal((await webFetch.assess({ url: 'https://example.com/?k=AKIAABCDEFGHIJKLMNOP' }, ctx)).decision, 'ask');
  await assert.rejects(webFetch.execute({ url: 'http://127.0.0.1:1/' }, ctx), /Blocked/);
  await assert.rejects(webFetch.execute({ url: 'http://internal.test/' }, { ...ctx, lookup: async () => [{ address: '10.0.0.5', family: 4 }] }), /Blocked/);
  assert.equal(htmlToText('<html><script>x()</script><p>Hello&nbsp;<b>world</b></p><p>two</p></html>'), 'Hello world\ntwo');
  const controller = new AbortController();
  const pending = webFetch.execute({ url: 'https://slow.example/' }, { ...ctx, signal: controller.signal, lookup: () => new Promise(() => {}) });
  controller.abort();
  await assert.rejects(pending, /cancelled/);
});

test('text-format tool calls from local models are recovered, ordinary JSON is not', async () => {
  const { extractTextToolCalls } = await import('../src/inference/openaiCompatible.ts');
  const names = new Set(['file_read', 'memory_search']);
  assert.equal(extractTextToolCalls('{"name": "file_read", "arguments": {"path": "a"}}', names).calls[0].arguments.path, 'a');
  assert.equal(extractTextToolCalls('```json\n{"name":"memory_search","parameters":{"query":"x"}}\n```', names).calls[0].name, 'memory_search');
  const tagged = extractTextToolCalls('Let me look.\n<tool_call>\n{"name":"file_read","arguments":"{\\"path\\":\\"b\\"}"}\n</tool_call>', names);
  assert.deepEqual([tagged.text, tagged.calls[0].arguments], ['Let me look.', { path: 'b' }]);
  assert.equal(extractTextToolCalls('{"name": "rm_everything", "arguments": {}}', names).calls.length, 0);
  assert.equal(extractTextToolCalls('Again:\n<tool_request>\n{"name": "file_read", "arguments": {"path": "c"}}\n</tool_request>', names).calls[0].arguments.path, 'c');
  assert.equal(extractTextToolCalls('{"deadline": "Friday"}', names).calls.length, 0);
  assert.equal(extractTextToolCalls('The answer is 4.', names).calls.length, 0);
  const two = extractTextToolCalls('{"name": "file_read", "arguments": {"path": "a}"}}\n{"name": "memory_search", "arguments": {"query": "q"}}', names);
  assert.deepEqual(two.calls.map(c => c.name), ['file_read', 'memory_search']);
  assert.equal(two.calls[0].arguments.path, 'a}');
  assert.equal(extractTextToolCalls('{"name": "file_read", "arguments": {}} and then I will stop', names).calls.length, 0);
  const r = parseCompletion({ choices: [{ finish_reason: 'stop', message: { content: '{"name": "file_read", "arguments": {"path": "n"}}' } }] }, names);
  assert.equal(r.finishReason, 'tool_use');
  assert.equal(r.content, null);
});

test('streams SSE text and tool-call deltas from a local server', async () => {
  const chunks = [
    { choices: [{ delta: { content: 'Hel' } }] },
    { choices: [{ delta: { content: 'lo' } }] },
    { choices: [{ delta: { tool_calls: [{ index: 0, id: 'c1', function: { name: 'file_', arguments: '{"pa' } }] } }] },
    { choices: [{ delta: { tool_calls: [{ index: 0, function: { name: 'read', arguments: 'th":"x"}' } }] }, finish_reason: 'tool_calls' }] },
    { choices: [], usage: { prompt_tokens: 9, completion_tokens: 4 } },
  ];
  const server = http.createServer((req, res) => {
    let raw = ''; req.on('data', d => raw += d);
    req.on('end', () => {
      assert.equal(JSON.parse(raw).stream, true);
      res.setHeader('content-type', 'text/event-stream');
      // Split one event across writes to exercise buffering.
      const wire = chunks.map(c => `data: ${JSON.stringify(c)}\n\n`).join('') + 'data: [DONE]\n\n';
      res.write(wire.slice(0, 17)); setTimeout(() => { res.write(wire.slice(17)); res.end(); }, 5);
    });
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', () => r()));
  try {
    const b = createOpenAICompatibleBackend({ baseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`, model: 'm', timeoutMs: 5000, allowRemote: false });
    const deltas: string[] = []; let result: any;
    for await (const e of b.stream!({ messages: [{ role: 'user', content: 'hi' }], tools: [{ name: 'file_read', description: '', inputSchema: { type: 'object', properties: {} } }], maxTokens: 16, temperature: 0, signal: new AbortController().signal, taskId: 't' })) {
      if (e.type === 'delta') deltas.push(e.content); else if (e.type === 'done') result = e.result;
    }
    assert.deepEqual(deltas, ['Hel', 'lo']);
    assert.equal(result.content, 'Hello');
    assert.deepEqual(result.toolCalls, [{ id: 'c1', name: 'file_read', arguments: { path: 'x' } }]);
    assert.equal(result.finishReason, 'tool_use');
    assert.deepEqual(result.usage, { inputTokens: 9, outputTokens: 4 });
  } finally { server.close(); }
});

test('stream accumulator handles interleaved tool calls and size limits', async () => {
  const { StreamAccumulator } = await import('../src/inference/openaiCompatible.ts');
  const acc = new StreamAccumulator();
  acc.add({ choices: [{ delta: { tool_calls: [{ index: 1, id: 'b', function: { name: 'two', arguments: '{}' } }, { index: 0, id: 'a', function: { name: 'one', arguments: '{"k":' } }] } }] });
  acc.add({ choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '1}' } }] }, finish_reason: 'tool_calls' }] });
  const parsed = parseCompletion(acc.body());
  assert.deepEqual(parsed.toolCalls.map(c => [c.id, c.name, c.arguments]), [['a', 'one', { k: 1 }], ['b', 'two', {}]]);
  assert.throws(() => acc.add({ choices: [{ delta: { content: 'x'.repeat(5 * 1024 * 1024) } }] }), /too large/);
});

test('web_fetch connections are pinned: DNS rebinding after the check is refused', async () => {
  const { guardedLookup } = await import('../src/tools/web.ts');
  let calls = 0;
  // First resolution (pre-check) is public; the connect-time resolution rebinds to loopback.
  const rebinding = async () => (++calls === 1 ? [{ address: '93.184.216.34', family: 4 }] : [{ address: '127.0.0.1', family: 4 }]);
  const ctx = { db: null as any, taskId: 't', toolCallId: 'c', serviceDir: '/tmp', signal: new AbortController().signal, permissions: { ...DEFAULT_PERMISSIONS, network: true }, lookup: rebinding };
  await assert.rejects(webFetch.execute({ url: 'http://rebind.test/' }, ctx), (e: any) => e.code === 'blocked_url' && /127\.0\.0\.1/.test(e.message));
  assert.equal(calls, 2, 'the socket used the guarded lookup');
  const result = await new Promise<any[]>(resolve => (guardedLookup(async () => [{ address: '10.0.0.1', family: 4 }]) as any)('x', {}, (...a: any[]) => resolve(a)));
  assert.match(result[0].message, /Blocked/);
  const ok = await new Promise<any[]>(resolve => (guardedLookup(async () => [{ address: '93.184.216.34', family: 4 }]) as any)('x', { all: true }, (...a: any[]) => resolve(a)));
  assert.deepEqual(ok, [null, [{ address: '93.184.216.34', family: 4 }]]);
});

async function sseServer(write: (res: http.ServerResponse) => void): Promise<{ url: string; close(): void }> {
  const server = http.createServer((req, res) => { req.resume(); req.on('end', () => { res.setHeader('content-type', 'text/event-stream'); write(res); }); });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', () => r()));
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`, close: () => { server.closeAllConnections(); server.close(); } };
}
const sse = (o: unknown) => `data: ${JSON.stringify(o)}\n\n`;
async function drain(b: ReturnType<typeof createOpenAICompatibleBackend>, signal = new AbortController().signal) {
  const out: any[] = [];
  for await (const e of b.stream!({ messages: [{ role: 'user', content: 'hi' }], tools: [], maxTokens: 16, temperature: 0, signal, taskId: 't' })) out.push(e);
  return out;
}

test('stream failures: truncated, malformed, error chunk, cancelled; missing usage is reported as zero', async () => {
  const mk = (url: string) => createOpenAICompatibleBackend({ baseUrl: url, model: 'm', timeoutMs: 5000, allowRemote: false });
  // No usage chunk and CRLF framing: still a valid completion, usage zero (the agent then estimates).
  let srv = await sseServer(res => { res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'ok' }, finish_reason: 'stop' }] })}\r\n\r\ndata: [DONE]\r\n\r\n`); res.end(); });
  try {
    const events = await drain(mk(srv.url));
    assert.deepEqual(events.at(-1).result.usage, { inputTokens: 0, outputTokens: 0 });
    assert.equal(events.at(-1).result.content, 'ok');
  } finally { srv.close(); }
  // Connection closes mid-answer without a finish reason: an error, not a partial "final" answer.
  srv = await sseServer(res => { res.write(sse({ choices: [{ delta: { content: 'half an ans' } }] })); res.end(); });
  try { await assert.rejects(drain(mk(srv.url)), (e: any) => e.errorClass === 'NetworkError' && /before completion/.test(e.message)); } finally { srv.close(); }
  // Malformed chunk.
  srv = await sseServer(res => { res.write('data: {not json\n\n'); res.end(); });
  try { await assert.rejects(drain(mk(srv.url)), (e: any) => e.errorClass === 'ValidationError'); } finally { srv.close(); }
  // Server-reported error chunk mid-stream.
  srv = await sseServer(res => { res.write(sse({ choices: [{ delta: { content: 'x' } }] }) + sse({ error: { message: 'out of memory' } })); res.end(); });
  try { await assert.rejects(drain(mk(srv.url)), (e: any) => e.errorClass === 'NetworkError' && /out of memory/.test(e.message)); } finally { srv.close(); }
  // Cancelled while the server is holding the stream open.
  srv = await sseServer(res => { res.write(sse({ choices: [{ delta: { content: 'x' } }] })); });
  try {
    const controller = new AbortController();
    const seen = (async () => { const out: any[] = []; for await (const e of mk(srv.url).stream!({ messages: [], tools: [], maxTokens: 16, temperature: 0, signal: controller.signal, taskId: 't' })) { out.push(e); controller.abort(); } return out; })();
    await assert.rejects(seen, (e: any) => e.errorClass === 'Cancelled');
  } finally { srv.close(); }
});

test('agent streaming: final text persisted, deltas transient, retry resets the draft, split fences are held back', async () => {
  const { freshStore } = await import('./helpers.ts');
  const { onEvent, listEvents } = await import('../src/store.ts');
  const { runAttempt } = await import('../src/agent.ts');
  const { createTask, getTask, loadMessages, setStatus, startAttempt } = await import('../src/jobs.ts');
  const { InferenceError } = await import('../src/inference/types.ts');
  const s = freshStore();
  const seen: Array<{ type: string; data: any; seq: number; transient?: boolean }> = [];
  const off = onEvent(e => { if (e.type.startsWith('task.delta')) seen.push(e as any); });
  const done = (content: string | null) => ({ type: 'done' as const, result: { content, toolCalls: [], finishReason: 'stop' as const, usage: { inputTokens: 3, outputTokens: 2 } } });
  const run = async (taskGoal: string, stream: (n: number) => AsyncGenerator<any>) => {
    const t = createTask(s.db, taskGoal); setStatus(s.db, t.id, 'running'); startAttempt(s.db, t.id, 'x');
    let n = 0;
    const backend = { identity: { id: 'x', kind: 'mock' as const, model: null, local: true }, async ready() { return { ok: true, message: '' }; }, async call() { throw new Error('unused'); }, stream: () => stream(++n) };
    const outcome = await runAttempt(t.id, { db: s.db, backend, serviceDir: s.dir, signal: new AbortController().signal, sleep: async () => {} });
    return { t, outcome };
  };
  try {
    // Retry after a mid-stream failure: draft is reset before the second try; only the final text is stored.
    const retried = await run('retry', async function* (n) {
      yield { type: 'delta', content: 'partial text that is long enough to flush immediately, yes' };
      if (n === 1) throw new InferenceError('NetworkError', 'cut');
      yield done('full answer');
    });
    assert.equal(retried.outcome, 'completed');
    assert.deepEqual(seen.map(e => e.type), ['task.delta', 'task.delta_reset', 'task.delta']);
    assert.ok(seen.every(e => e.transient && e.seq === 0));
    assert.equal(listEvents(s.db, { taskId: retried.t.id }).filter(e => e.type.startsWith('task.delta')).length, 0, 'deltas are not persisted');
    assert.equal(getTask(s.db, retried.t.id)!.result, 'full answer');
    assert.equal(loadMessages(s.db, retried.t.id).at(-1)!.content, 'full answer');
    // A code fence split across chunks is still recognised and withheld.
    seen.length = 0;
    const fenced = await run('fence', async function* () {
      yield { type: 'delta', content: 'Here:\n``' }; yield { type: 'delta', content: '`\nsecret-body' }; yield done('Here is the answer.');
    });
    assert.equal(fenced.outcome, 'completed');
    assert.ok(seen.some(e => e.type === 'task.delta_reset'));
    assert.doesNotMatch(seen.filter(e => e.type === 'task.delta').map(e => e.data.content).join(''), /secret-body/);
    // A stream that fails permanently marks the task failed with the reason.
    const dead = await run('dead', async function* () { throw new InferenceError('ValidationError', 'bad chunk'); });
    assert.equal(dead.outcome, 'failed');
    assert.match(getTask(s.db, dead.t.id)!.error!, /bad chunk/);
  } finally { off(); s.cleanup(); }
});

// Streaming timeouts: timeoutMs is the longest silence; a separate ceiling bounds the whole stream.
async function trickleServer(onRequest: (res: http.ServerResponse) => void): Promise<{ url: string; close(): void }> {
  const server = http.createServer((req, res) => {
    req.resume();
    req.on('end', () => { res.setHeader('content-type', 'text/event-stream'); res.flushHeaders(); onRequest(res); });
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', () => r()));
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`, close: () => { server.closeAllConnections(); server.close(); } };
}
const chunkLine = (content: string, extra: object = {}) => `data: ${JSON.stringify({ choices: [{ delta: { content }, ...extra }] })}\n\n`;
async function drainResult(b: ReturnType<typeof createOpenAICompatibleBackend>, signal = new AbortController().signal) {
  let result: any;
  for await (const e of b.stream!({ messages: [{ role: 'user', content: 'hi' }], tools: [], maxTokens: 16, temperature: 0, signal, taskId: 't' })) if (e.type === 'done') result = e.result;
  return result;
}

test('stream timeout is an idle limit: a slow but steady generation longer than timeoutMs succeeds', async () => {
  let n = 0; let timer: NodeJS.Timeout;
  const srv = await trickleServer(res => {
    timer = setInterval(() => {
      if (++n < 8) res.write(chunkLine('x'));
      else { res.write(chunkLine('!', { finish_reason: 'stop' })); res.write('data: [DONE]\n\n'); res.end(); clearInterval(timer); }
    }, 60);
  });
  try {
    // 8 chunks x 60 ms is about 480 ms in total, well over the 250 ms idle limit, but no gap exceeds it.
    const b = createOpenAICompatibleBackend({ baseUrl: srv.url, model: 'm', timeoutMs: 250, allowRemote: false });
    const started = Date.now();
    const result = await drainResult(b);
    assert.equal(result.content, 'xxxxxxx!');
    assert.ok(Date.now() - started > 250, 'ran longer than the idle limit');
  } finally { clearInterval(timer!); srv.close(); }
});

test('stream that goes silent fails with a timeout, and a silent start does too', async () => {
  const silentAfterFirst = await trickleServer(res => { res.write(chunkLine('partial')); });
  const silentFromStart = await trickleServer(() => {});
  try {
    for (const srv of [silentAfterFirst, silentFromStart]) {
      const b = createOpenAICompatibleBackend({ baseUrl: srv.url, model: 'm', timeoutMs: 150, allowRemote: false });
      const started = Date.now();
      await assert.rejects(drainResult(b), (e: any) => e.errorClass === 'TimeoutError' && e.retryable !== false && /silent for 150 ms/.test(e.message));
      assert.ok(Date.now() - started < 3000);
    }
  } finally { silentAfterFirst.close(); silentFromStart.close(); }
});

test('stream ceiling ends a server that trickles forever, and user cancel still wins', async () => {
  const timers: NodeJS.Timeout[] = [];
  const srv = await trickleServer(res => { const t = setInterval(() => res.write(chunkLine('.')), 30); timers.push(t); res.on('close', () => clearInterval(t)); });
  try {
    const b = createOpenAICompatibleBackend({ baseUrl: srv.url, model: 'm', timeoutMs: 200, streamCeilingMs: 400, allowRemote: false });
    const started = Date.now();
    await assert.rejects(drainResult(b), (e: any) => e.errorClass === 'TimeoutError' && e.retryable === false && /maximum duration.*400 ms ceiling.*not retried/.test(e.message));
    const took = Date.now() - started;
    assert.ok(took >= 350 && took < 3000, `ended by the ceiling after ${took} ms`);
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 100);
    await assert.rejects(drainResult(b, ctl.signal), (e: any) => e.errorClass === 'Cancelled');
  } finally { timers.forEach(clearInterval); srv.close(); }
});

test('non-stream calls keep a total deadline of timeoutMs', async () => {
  const srv = await fakeServer(() => { /* never answers */ });
  try {
    const b = createOpenAICompatibleBackend({ baseUrl: srv.url, model: 'm', timeoutMs: 150, allowRemote: false });
    await assert.rejects(b.call({ messages: [{ role: 'user', content: 'hi' }], tools: [], maxTokens: 16, temperature: 0, signal: new AbortController().signal, taskId: 't' }), (e: any) => e.errorClass === 'TimeoutError' && /timed out after 150 ms/.test(e.message));
  } finally { srv.close(); }
});
