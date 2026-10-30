// Backend for a local OpenAI-compatible server (Ollama `/v1`, llama.cpp `llama-server`, LM Studio).
// Behavior distilled from Aiden providers/v4/chatCompletionsAdapter.ts (AGPL-3.0-only,
// Copyright (c) 2026 Shiva Deore / Taracod): message/tool mapping, argument JSON validation,
// finish-reason mapping, usage, cancellation. Vendor-specific quirks were not carried over.
import crypto from 'node:crypto';
import type { InferenceBackend, InferenceRequest, InferenceResult, Message, StreamEvent, ToolCallRequest } from './types.ts';
import { InferenceError } from './types.ts';

const MAX_RESPONSE = 4 * 1024 * 1024;
/** Floor for the hard ceiling on one streamed response; the ceiling is max(this, 10 x timeoutMs). */
export const MIN_STREAM_CEILING_MS = 600_000;
export const INVALID_ARGUMENTS = '__milo_invalid_arguments';

export function isLoopbackUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^\[|\]$/g, '').toLowerCase();
    return host === 'localhost' || host === '::1' || /^127\.\d+\.\d+\.\d+$/.test(host);
  } catch { return false; }
}

function toWire(m: Message): Record<string, unknown> {
  if (m.role === 'tool') return { role: 'tool', tool_call_id: m.toolCallId, content: m.content };
  if (m.role === 'assistant' && m.toolCalls?.length) {
    return { role: 'assistant', content: m.content || null, tool_calls: m.toolCalls.map(c => ({ id: c.id, type: 'function', function: { name: c.name, arguments: JSON.stringify(c.arguments) } })) };
  }
  return { role: m.role, content: m.content };
}

// Hermes / Qwen text tool-call format, as matched by Aiden providers/v4/localPromptToolsAdapter.ts.
const TOOL_CALL_TAG = /<(tool_call|tool_request|function_call)>\s*([\s\S]*?)\s*<\/\1>|<(?:tool_call|tool_request|function_call)>\s*([\s\S]*)/g;
const OPEN_TAG = /<(tool_call|tool_request|function_call)>/;

/**
 * Some local models (e.g. Qwen via Ollama) return tool calls as text instead of structured
 * `tool_calls`. Accept `<tool_call>{json}</tool_call>` blocks, or a reply that is only a JSON call
 * (optionally fenced). Only names of tools offered in this request are accepted, so ordinary JSON
 * answers are not mistaken for actions.
 */
export function extractTextToolCalls(content: string, toolNames: ReadonlySet<string>): { calls: ToolCallRequest[]; text: string | null } {
  const toCall = (v: any): ToolCallRequest | null => {
    if (!v || typeof v !== 'object' || typeof v.name !== 'string' || !toolNames.has(v.name)) return null;
    const args = v.arguments ?? v.parameters ?? {};
    const parsed = typeof args === 'string' ? (() => { try { return JSON.parse(args); } catch { return { [INVALID_ARGUMENTS]: args.slice(0, 2000) }; } })() : args;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return { id: `text_call_${crypto.randomUUID()}`, name: v.name, arguments: parsed };
  };
  const calls: ToolCallRequest[] = [];
  const open = content.match(OPEN_TAG);
  if (open) {
    for (const m of content.matchAll(TOOL_CALL_TAG)) {
      try { const c = toCall(JSON.parse((m[2] ?? m[3]).trim())); if (c) calls.push(c); } catch { /* not JSON */ }
    }
    const before = content.slice(0, open.index).trim();
    return { calls, text: calls.length ? (before || null) : content };
  }
  const bare = content.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, '$1').trim();
  if (!/^[[{]/.test(bare)) return { calls, text: content };
  const values = splitJsonValues(bare);
  if (!values) return { calls, text: content };
  for (const v of values) {
    for (const item of Array.isArray(v) ? v : [v]) { const c = toCall(item); if (!c) return { calls: [], text: content }; calls.push(c); }
  }
  return { calls, text: null };
}

/** Parses one or more top-level JSON values separated by whitespace; null if anything else is present. */
function splitJsonValues(text: string): unknown[] | null {
  const out: unknown[] = [];
  let depth = 0, start = -1, inString = false, escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === '"') inString = false; continue; }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{' || ch === '[') { if (depth++ === 0) start = i; continue; }
    if (ch === '}' || ch === ']') {
      if (--depth < 0) return null;
      if (depth === 0) { try { out.push(JSON.parse(text.slice(start, i + 1))); } catch { return null; } }
      continue;
    }
    if (depth === 0 && !/\s/.test(ch)) return null;
  }
  return depth === 0 && out.length ? out : null;
}

export function parseCompletion(body: any, toolNames: ReadonlySet<string> = new Set()): InferenceResult {
  const choice = body?.choices?.[0];
  if (!choice || typeof choice !== 'object') throw new InferenceError('ValidationError', 'Backend response had no choices');
  const msg = choice.message ?? {};
  const toolCalls: ToolCallRequest[] = [];
  for (const raw of Array.isArray(msg.tool_calls) ? msg.tool_calls : []) {
    const name = raw?.function?.name;
    if (typeof name !== 'string' || !name) continue;
    let args: Record<string, unknown>;
    const text = raw.function.arguments;
    try {
      const parsed = typeof text === 'string' ? (text.trim() ? JSON.parse(text) : {}) : (text ?? {});
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
      args = parsed;
    } catch { args = { [INVALID_ARGUMENTS]: String(text).slice(0, 2000) }; }
    toolCalls.push({ id: typeof raw.id === 'string' && raw.id ? raw.id : `call_${crypto.randomUUID()}`, name, arguments: args });
  }
  let content: string | null = typeof msg.content === 'string' ? msg.content : null;
  if (!toolCalls.length && content && toolNames.size) {
    const extracted = extractTextToolCalls(content, toolNames);
    if (extracted.calls.length) { toolCalls.push(...extracted.calls); content = extracted.text; }
  }
  const fr = choice.finish_reason;
  const finishReason = toolCalls.length ? 'tool_use' : fr === 'length' ? 'length' : 'stop';
  return {
    content,
    toolCalls, finishReason,
    usage: { inputTokens: Number(body.usage?.prompt_tokens) || 0, outputTokens: Number(body.usage?.completion_tokens) || 0 },
  };
}

/**
 * Time limits for one streamed response. `timeoutMs` is an idle limit (longest silence, from the
 * request until the first byte and between byte chunks afterwards), so a long but healthy generation
 * is never cut off for its length. A separate hard ceiling bounds the whole stream so a server that
 * trickles bytes forever still ends. Paused while the consumer is handling a yielded event.
 */
class StreamGuard {
  private ctl = new AbortController();
  private idle: ReturnType<typeof setTimeout> | undefined;
  private ceiling: ReturnType<typeof setTimeout>;
  private why: 'idle' | 'ceiling' | null = null;
  private idleMs: number;
  private ceilingMs: number;
  constructor(idleMs: number, ceilingMs: number) {
    this.idleMs = idleMs; this.ceilingMs = ceilingMs;
    this.ceiling = setTimeout(() => this.trip('ceiling'), ceilingMs);
    this.touch();
  }
  get signal(): AbortSignal { return this.ctl.signal; }
  get reason(): 'idle' | 'ceiling' | null { return this.why; }
  get message(): string {
    return this.why === 'ceiling' ? `Inference stream exceeded the maximum duration (${this.ceilingMs} ms ceiling); not retried` : `Inference stream was silent for ${this.idleMs} ms`;
  }
  /** The timeout error for the tripped limit; a ceiling expiry is not retryable, an idle timeout is. */
  error(): InferenceError { return new InferenceError('TimeoutError', this.message, { retryable: this.why !== 'ceiling' }); }
  touch(): void { clearTimeout(this.idle); this.idle = setTimeout(() => this.trip('idle'), this.idleMs); }
  pause(): void { clearTimeout(this.idle); }
  dispose(): void { clearTimeout(this.idle); clearTimeout(this.ceiling); }
  private trip(why: 'idle' | 'ceiling'): void { this.why ??= why; this.ctl.abort(); }
}

export function createOpenAICompatibleBackend(opts: { baseUrl: string; model: string; apiKey?: string | null; timeoutMs: number; allowRemote: boolean; /** Hard ceiling for a whole streamed response; default max(600000, 10 x timeoutMs). */ streamCeilingMs?: number }): InferenceBackend {
  let parsed: URL;
  try { parsed = new URL(opts.baseUrl); } catch { throw new InferenceError('ValidationError', 'Inference URL is invalid'); }
  if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new InferenceError('ValidationError', 'Inference URL must be HTTP(S) without credentials, query or fragment');
  }
  const local = isLoopbackUrl(parsed.toString());
  // Never resolve localhost through DNS/hosts when remote inference was not enabled.
  // A numeric URL also keeps a changed hosts file from redirecting private prompts.
  if (local && parsed.hostname.toLowerCase() === 'localhost') parsed.hostname = '127.0.0.1';
  const base = parsed.toString().replace(/\/+$/, '');
  if (!local && !opts.allowRemote) throw new InferenceError('ValidationError', 'Inference URL is not on this Mac; enable allowRemote to send prompts to a remote server');
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.apiKey) headers.authorization = `Bearer ${opts.apiKey}`;

  /** Sends a request and maps transport and HTTP failures to InferenceError classes.
   * Without `guard` the whole request, body included, is bounded by `timeoutMs` (a non-streaming
   * reply carries no bytes until it is complete, so silence and total time are the same thing).
   * With `guard` (streaming) the idle and ceiling limits apply instead. */
  async function open(path: string, body: unknown, signal: AbortSignal, guard?: StreamGuard): Promise<Response> {
    const timeout = guard ? guard.signal : AbortSignal.timeout(opts.timeoutMs);
    const combined = AbortSignal.any([signal, timeout]);
    let res: Response;
    try {
      res = await fetch(base + path, { method: 'POST', headers, body: JSON.stringify(body), signal: combined, redirect: 'error' });
    } catch (e) {
      throw transportError(e, signal, timeout);
    }
    if (res.ok) return res;
    const text = await readBounded(res).catch(() => '');
    if (res.status === 401 || res.status === 403) throw new InferenceError('AuthError', `Inference server rejected credentials (${res.status})`);
    if (res.status === 429) throw new InferenceError('ResourceExhausted', 'Inference server is rate limiting or overloaded (429)');
    if (res.status >= 500) throw new InferenceError('NetworkError', `Inference server error ${res.status}`);
    throw new InferenceError('ValidationError', `Inference request rejected (${res.status}): ${text.slice(0, 300)}`);
    function transportError(e: unknown, user: AbortSignal, t: AbortSignal): InferenceError {
      if (user.aborted) return new InferenceError('Cancelled', 'Inference cancelled');
      if (t.aborted) return guard ? guard.error() : new InferenceError('TimeoutError', `Inference timed out after ${opts.timeoutMs} ms`);
      return new InferenceError('Unavailable', `Inference server unreachable at ${base}: ${(e as Error).message}`);
    }
  }
  const requestBody = (req: InferenceRequest, stream: boolean) => ({
    model: opts.model, messages: req.messages.map(toWire), max_tokens: req.maxTokens, temperature: req.temperature, stream,
    ...(stream ? { stream_options: { include_usage: true } } : {}),
    ...(req.tools.length ? { tools: req.tools.map(t => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.inputSchema } })) } : {}),
  });

  return {
    identity: { id: `openai_compatible:${opts.model}`, kind: 'openai_compatible', model: opts.model, local },
    async ready() {
      try {
        const res = await fetch(base + '/models', { headers, signal: AbortSignal.timeout(1500), redirect: 'error' });
        await readBounded(res);
        return res.ok ? { ok: true, message: `${local ? "Local" : "Remote"} model server at ${base} (${opts.model})` } : { ok: false, message: `Model server responded ${res.status}` };
      } catch (e) { return { ok: false, message: `Model server unreachable: ${(e as Error).message}` }; }
    },
    async call(req: InferenceRequest) {
      const res = await open('/chat/completions', requestBody(req, false), req.signal);
      let body: unknown;
      try { body = JSON.parse(await readBounded(res)); } catch (e) { if (e instanceof InferenceError) throw e; throw new InferenceError('ValidationError', 'Inference server returned invalid JSON'); }
      return parseCompletion(body, new Set(req.tools.map(t => t.name)));
    },
    async *stream(req: InferenceRequest): AsyncGenerator<StreamEvent, void, void> {
      const guard = new StreamGuard(opts.timeoutMs, opts.streamCeilingMs ?? Math.max(MIN_STREAM_CEILING_MS, 10 * opts.timeoutMs));
      try {
        const res = await open('/chat/completions', requestBody(req, true), req.signal, guard);
        const acc = new StreamAccumulator();
        let finished = false;
        try {
          for await (const data of sseData(res, () => guard.touch())) {
            if (data === '[DONE]') { finished = true; break; }
            let chunk: any;
            try { chunk = JSON.parse(data); } catch { throw new InferenceError('ValidationError', 'Inference server sent an invalid stream chunk'); }
            // Servers report mid-stream failures (e.g. Ollama out of memory) as an `error` chunk.
            if (chunk?.error) throw new InferenceError('NetworkError', `Inference server error during stream: ${String(chunk.error?.message ?? chunk.error).slice(0, 300)}`);
            const delta = acc.add(chunk);
            if (delta) { guard.pause(); yield { type: 'delta', content: delta }; guard.touch(); }
          }
        } catch (e) {
          if (e instanceof InferenceError) throw e;
          if (req.signal.aborted) throw new InferenceError('Cancelled', 'Inference cancelled');
          if (guard.reason) throw guard.error();
          throw new InferenceError('NetworkError', `Inference stream interrupted: ${(e as Error).message}`);
        }
        // A connection that closes before a finish reason or [DONE] was cut off; do not present partial text as a final answer.
        if (!finished && acc.finishReason === null) throw new InferenceError('NetworkError', 'Inference stream ended before completion');
        yield { type: 'done', result: parseCompletion(acc.body(), new Set(req.tools.map(t => t.name))) };
      } finally { guard.dispose(); }
    },
  };
}

/** Rebuilds a non-streaming completion body from OpenAI-style stream chunks. */
export class StreamAccumulator {
  content = '';
  finishReason: string | null = null;
  usage: { prompt_tokens?: number; completion_tokens?: number } | null = null;
  calls: Array<{ id?: string; name: string; arguments: string }> = [];
  /** Returns the text delta carried by this chunk, if any. */
  add(chunk: any): string {
    if (chunk?.usage) this.usage = chunk.usage;
    const choice = chunk?.choices?.[0];
    if (!choice) return '';
    if (choice.finish_reason) this.finishReason = choice.finish_reason;
    const d = choice.delta ?? {};
    for (const tc of Array.isArray(d.tool_calls) ? d.tool_calls : []) {
      const i = Number.isInteger(tc.index) ? tc.index : this.calls.length;
      const slot = this.calls[i] ??= { name: '', arguments: '' };
      if (tc.id) slot.id = tc.id;
      if (tc.function?.name) slot.name += tc.function.name;
      if (typeof tc.function?.arguments === 'string') slot.arguments += tc.function.arguments;
      if (this.calls.reduce((n, c) => n + c.arguments.length, 0) > MAX_RESPONSE) throw new InferenceError('ValidationError', 'Inference response too large');
    }
    if (typeof d.content === 'string' && d.content) {
      if (this.content.length + d.content.length > MAX_RESPONSE) throw new InferenceError('ValidationError', 'Inference response too large');
      this.content += d.content;
      return d.content;
    }
    return '';
  }
  body() {
    return {
      choices: [{ finish_reason: this.finishReason, message: { content: this.content || null, tool_calls: this.calls.filter(Boolean).map(c => ({ id: c.id, function: { name: c.name, arguments: c.arguments } })) } }],
      usage: this.usage ?? undefined,
    };
  }
}

/** Yields the payload of each `data:` field in a server-sent event stream. */
async function* sseData(res: Response, onChunk: () => void = () => {}): AsyncGenerator<string, void, void> {
  if (!res.body) return;
  const decoder = new TextDecoder();
  let buf = ''; let total = 0;
  for await (const bytes of res.body as unknown as AsyncIterable<Uint8Array>) {
    onChunk();
    total += bytes.byteLength;
    if (total > MAX_RESPONSE * 2) throw new InferenceError('ValidationError', 'Inference stream too large');
    buf += decoder.decode(bytes, { stream: true });
    let i;
    while ((i = buf.search(/\r?\n\r?\n/)) >= 0) {
      const event = buf.slice(0, i); buf = buf.slice(i).replace(/^\r?\n\r?\n/, '');
      const data = event.split(/\r?\n/).filter(l => l.startsWith('data:')).map(l => l.slice(5).replace(/^ /, '')).join('\n');
      if (data) yield data;
    }
  }
  const tail = buf.split(/\r?\n/).filter(l => l.startsWith('data:')).map(l => l.slice(5).replace(/^ /, '')).join('\n');
  if (tail) yield tail;
}

async function readBounded(res: Response): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_RESPONSE) { await reader.cancel(); throw new InferenceError('ValidationError', 'Inference response too large'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}
