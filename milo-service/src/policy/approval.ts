// Final approval decision, enforced by the service independently of each tool's own
// assessment. Tiering rules follow Aiden moat/approvalEngine.ts (AGPL-3.0-only,
// Copyright (c) 2026 Shiva Deore / Taracod): dangerous work always needs an explicit user
// decision, and no setting can turn that off.
import crypto from 'node:crypto';
import type { Assessment, ToolDefinition } from '../tools/registry.ts';

export function enforce(tool: ToolDefinition, a: Assessment): Assessment {
  if (a.decision === 'deny') return a;
  if (a.tier === 'dangerous' && a.decision === 'allow') return { ...a, decision: 'ask', reasons: [...a.reasons, 'Dangerous actions always require approval'] };
  if (tool.mutates && a.tier !== 'safe' && a.decision === 'allow') return { ...a, decision: 'ask', reasons: [...a.reasons, 'Mutating action above safe tier'] };
  return a;
}

/** Binds an approval to the exact tool and arguments so it cannot be replayed onto others. */
export function argsDigest(tool: string, args: Record<string, unknown>): string {
  return crypto.createHash('sha256').update(JSON.stringify([tool, canonical(args)])).digest('hex');
}
function canonical(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical((v as Record<string, unknown>)[k])]));
  return v;
}
