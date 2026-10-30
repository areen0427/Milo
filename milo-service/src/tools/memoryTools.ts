// Memory tools exposed to the model. Writes are limited to `saw`/`guess` provenance.
import type { ToolDefinition } from './registry.ts';
import { ToolFailure } from './registry.ts';
import { addMemory, searchMemory, NAMESPACES } from '../memory.ts';

export const memoryAdd: ToolDefinition = {
  name: 'memory_add',
  description: 'Remember a short fact for future tasks. namespace "user" is for the user\'s preferences and identity; "notes" for environment or project facts. source is "saw" if a tool result showed it, otherwise "guess".',
  inputSchema: { type: 'object', properties: { namespace: { type: 'string', enum: Object.keys(NAMESPACES) }, text: { type: 'string', minLength: 1, maxLength: 500 }, source: { type: 'string', enum: ['saw', 'guess'] } }, required: ['namespace', 'text', 'source'], additionalProperties: false },
  mutates: true,
  groundedOnly: true,
  assess(args) { return { decision: 'allow', tier: 'safe', reasons: [], summary: `Remember (${args.namespace}): ${String(args.text).slice(0, 120)}` }; },
  async execute(args, ctx) {
    if (args.source === 'saw') {
      const needle = String(args.text).toLowerCase().replace(/\s+/g, ' ').trim();
      const calls = ctx.db.prepare("SELECT call_id FROM tool_calls WHERE task_id = ? AND status = 'succeeded' AND name NOT IN ('memory_add','memory_search','skill_read','skill_list')").all(ctx.taskId) as Array<{ call_id: string }>;
      const allowed = new Set(calls.map(call => call.call_id));
      const messages = ctx.db.prepare('SELECT message_json FROM task_messages WHERE task_id = ? ORDER BY seq').all(ctx.taskId) as Array<{ message_json: string }>;
      const strings = (value: unknown): string[] => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(strings) : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
      const supported = messages.some(row => {
        try {
          const message = JSON.parse(row.message_json);
          if (message.role !== 'tool' || !allowed.has(message.toolCallId)) return false;
          const result = JSON.parse(message.content);
          return strings(result).some(text => text.toLowerCase().replace(/\s+/g, ' ').includes(needle));
        } catch { return false; }
      });
      if (!supported) throw new ToolFailure('unsupported_memory', 'Observed memories must be supported by a successful tool result from this task. Use source guess for an inference.');
    }
    const { entry, created } = addMemory(ctx.db, { namespace: args.namespace, text: args.text, source: args.source as 'saw' | 'guess', taskId: ctx.taskId });
    return { id: entry.id, created, source: entry.source };
  },
};

export const memorySearch: ToolDefinition = {
  name: 'memory_search',
  description: 'Search remembered facts by keywords.',
  inputSchema: { type: 'object', properties: { query: { type: 'string', minLength: 1, maxLength: 500 }, limit: { type: 'integer', minimum: 1, maximum: 20 } }, required: ['query'], additionalProperties: false },
  mutates: false,
  assess(args) { return { decision: 'allow', tier: 'safe', reasons: [], summary: `Search memory for ${String(args.query).slice(0, 120)}` }; },
  async execute(args, ctx) {
    return { results: searchMemory(ctx.db, args.query as string, (args.limit as number | undefined) ?? 8).map(e => ({ namespace: e.namespace, text: e.text, source: e.source, score: e.score })) };
  },
};
