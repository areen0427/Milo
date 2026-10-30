// Tool contract. Narrowed from Aiden core/v4/toolRegistry.ts and tools/v4/effectContracts.ts
// (AGPL-3.0-only, Copyright (c) 2026 Shiva Deore / Taracod): schema, mutation flag, a risk
// assessment evaluated by the service (never by the model), and an effect plan recorded before
// any mutation runs so a crash can be reconciled.
import type { DB } from '../store.ts';
import type { Permissions } from '../settings.ts';
import type { ToolSchema } from '../inference/types.ts';
import type { RiskTier } from '../policy/dangerousPatterns.ts';
import type { LookupFn } from '../policy/ssrf.ts';

export type ToolContext = {
  db: DB; taskId: string; toolCallId: string; permissions: Permissions; serviceDir: string; signal: AbortSignal; lookup?: LookupFn;
  /** Resolved file target the policy decision and any approval were made for; execution must still resolve to it. */
  expectedTarget?: string | null;
};
export type Assessment = {
  /** allow: run now; ask: needs a user decision; deny: refuse with a structured result. */
  decision: 'allow' | 'ask' | 'deny';
  tier: RiskTier;
  reasons: string[];
  /** One line shown in the approval prompt; must not contain secrets. */
  summary: string;
};
export type FileBefore = { exists: boolean; size?: number; contentSha256?: string };
export type EffectPlan = {
  kind: 'filesystem.write' | 'process.exec' | 'memory.write';
  target: string | null;
  reconciliation: { path?: string; expectedContentSha256?: string; expectedSize?: number; before?: FileBefore } | null;
};
export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: ToolSchema['inputSchema'];
  mutates: boolean;
  /** Side effect that must not be issued alongside earlier calls in one model step (see agent.ts). */
  groundedOnly?: boolean;
  assess(args: Record<string, unknown>, ctx: ToolContext): Assessment | Promise<Assessment>;
  planEffect?(args: Record<string, unknown>, ctx: ToolContext): EffectPlan | null;
  execute(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown>;
};

/** Structured refusal the model can read and explain. */
export class ToolFailure extends Error {
  code: string;
  constructor(code: string, message: string) { super(message); this.code = code; }
}

const tools = new Map<string, ToolDefinition>();
export function registerTool(def: ToolDefinition): void {
  if (tools.has(def.name)) throw new Error(`Tool already registered: ${def.name}`);
  if (!/^[a-z][a-z0-9_]{0,63}$/.test(def.name)) throw new Error(`Invalid tool name: ${def.name}`);
  tools.set(def.name, def);
}
export function getTool(name: string): ToolDefinition | undefined { return tools.get(name); }
export function listTools(): ToolDefinition[] { return [...tools.values()]; }
export function toolSchemas(): ToolSchema[] { return listTools().map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })); }

/** Validates the JSON-schema subset Milo tools use. Returns an error message or null. */
export function validateArgs(schema: ToolSchema['inputSchema'], args: unknown): string | null {
  if (!args || typeof args !== 'object' || Array.isArray(args)) return 'arguments must be an object';
  const a = args as Record<string, unknown>;
  const props = schema.properties as Record<string, Record<string, unknown>>;
  for (const key of schema.required ?? []) if (!(key in a)) return `missing required argument: ${key}`;
  for (const [key, value] of Object.entries(a)) {
    const spec = props[key];
    if (!spec) { if (schema.additionalProperties === false) return `unexpected argument: ${key}`; continue; }
    const err = checkValue(spec, value, key);
    if (err) return err;
  }
  return null;
}
function checkValue(spec: Record<string, unknown>, value: unknown, key: string): string | null {
  const type = spec.type;
  if (type === 'string') {
    if (typeof value !== 'string') return `${key} must be a string`;
    if (typeof spec.maxLength === 'number' && value.length > spec.maxLength) return `${key} exceeds ${spec.maxLength} characters`;
    if (typeof spec.minLength === 'number' && value.length < spec.minLength) return `${key} must have at least ${spec.minLength} characters`;
    if (Array.isArray(spec.enum) && !spec.enum.includes(value)) return `${key} must be one of ${spec.enum.join(', ')}`;
  } else if (type === 'integer' || type === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value) || (type === 'integer' && !Number.isInteger(value))) return `${key} must be ${type === 'integer' ? 'an integer' : 'a number'}`;
    if (typeof spec.minimum === 'number' && value < spec.minimum) return `${key} must be >= ${spec.minimum}`;
    if (typeof spec.maximum === 'number' && value > spec.maximum) return `${key} must be <= ${spec.maximum}`;
  } else if (type === 'boolean') {
    if (typeof value !== 'boolean') return `${key} must be a boolean`;
  }
  return null;
}
