// Deterministic mock backend. It does not understand language. It exists so the task, tool,
// approval and recovery paths can be exercised end to end before a real model is attached.
// A goal line of the form `/tool <name> <json-args>` becomes a tool call, one per step, in order.
import type { InferenceBackend, InferenceRequest, InferenceResult, ToolCallRequest } from './types.ts';

const DIRECTIVE = /^\/tool\s+([a-z_][a-z0-9_]*)\s*(\{.*\})?\s*$/i;

export function parseDirectives(goal: string): Array<{ name: string; arguments: Record<string, unknown> } | { error: string }> {
  const out: Array<{ name: string; arguments: Record<string, unknown> } | { error: string }> = [];
  for (const line of goal.split('\n')) {
    const m = line.trim().match(DIRECTIVE);
    if (!m) continue;
    try {
      const args = m[2] ? JSON.parse(m[2]) : {};
      if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('arguments must be an object');
      out.push({ name: m[1], arguments: args });
    } catch (e) { out.push({ error: `Invalid /tool arguments: ${(e as Error).message}` }); }
  }
  return out;
}

export function createMockBackend(): InferenceBackend {
  const backend: InferenceBackend = {
    identity: { id: 'mock', kind: 'mock', model: null, local: true },
    async ready() { return { ok: true, message: 'Mock backend (no model): placeholder responses only' }; },
    async call(req: InferenceRequest): Promise<InferenceResult> {
      if (req.signal.aborted) throw new Error('aborted');
      const user = req.messages.find(m => m.role === 'user');
      const directives = parseDirectives(user?.content ?? '');
      const issued = req.messages.filter(m => m.role === 'assistant').reduce((n, m) => n + ((m.role === 'assistant' && m.toolCalls?.length) || 0), 0);
      const usage = { inputTokens: 0, outputTokens: 0 };
      const next = directives[issued];
      if (next && !('error' in next)) {
        const call: ToolCallRequest = { id: `mock_${issued + 1}`, name: next.name, arguments: next.arguments };
        return { content: null, toolCalls: [call], finishReason: 'tool_use', usage };
      }
      const results = req.messages.filter(m => m.role === 'tool').map(m => m.role === 'tool' ? m.content : '');
      const lines = ['Placeholder only: the mock backend ran no model inference.'];
      if (next && 'error' in next) lines.push(next.error);
      if (results.length) {
        lines.push(`Tool steps executed by the service: ${results.length}.`);
        results.forEach((r, i) => lines.push(`${i + 1}. ${r.length > 300 ? r.slice(0, 300) + '…' : r}`));
      }
      return { content: lines.join('\n'), toolCalls: [], finishReason: 'stop', usage };
    },
    async *stream(req) {
      const result = await backend.call(req);
      // Deterministic chunking so streaming paths are testable without a model.
      for (const piece of (result.content ?? '').match(/[^\s]+\s*/g) ?? []) yield { type: 'delta', content: piece };
      yield { type: 'done', result };
    },
  };
  return backend;
}
