// Durable effect records and crash reconciliation. Ported from Aiden core/v4/effectContract.ts and
// core/v4/effectReconciliation.ts (AGPL-3.0-only, Copyright (c) 2026 Shiva Deore / Taracod).
// An effect is recorded as `intended` (with what success would look like) before the tool runs and
// moved to `applied`/`failed` after. After a crash, an `intended` effect is reconciled from
// observation; anything that cannot be proven stays unknown and goes to the user.
import fs from 'node:fs';
import crypto from 'node:crypto';
import type { DB } from './store.ts';
import { newId, now } from './store.ts';
import type { EffectPlan, FileBefore } from './tools/registry.ts';

export type EffectState = 'intended' | 'applied' | 'not_applied' | 'failed' | 'unknown';
export type Reconciliation = { outcome: 'occurred' | 'did_not_occur' | 'unknown'; evidence: Record<string, unknown> };
export type EffectRow = { id: string; task_id: string; tool_call_id: string; kind: string; target: string | null; state: EffectState; reconciliation_json: string | null };

export function sha256(data: string | Buffer): string { return crypto.createHash('sha256').update(data).digest('hex'); }

export function observeFile(path: string): FileBefore {
  try {
    const st = fs.statSync(path);
    if (!st.isFile()) return { exists: true, size: st.size };
    return { exists: true, size: st.size, contentSha256: sha256(fs.readFileSync(path)) };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return { exists: false };
    throw e;
  }
}

export function recordIntent(db: DB, taskId: string, toolCallId: string, plan: EffectPlan): string {
  const id = newId(); const at = now();
  db.prepare('INSERT INTO effects (id, task_id, tool_call_id, kind, target, state, reconciliation_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, taskId, toolCallId, plan.kind, plan.target, 'intended', plan.reconciliation ? JSON.stringify(plan.reconciliation) : null, at, at);
  return id;
}
export function settleEffect(db: DB, id: string, state: EffectState, evidence: unknown = null): void {
  db.prepare('UPDATE effects SET state = ?, evidence_json = ?, updated_at = ? WHERE id = ?').run(state, evidence === null ? null : JSON.stringify(evidence), now(), id);
}
export function pendingEffects(db: DB, taskId: string): EffectRow[] {
  return db.prepare("SELECT * FROM effects WHERE task_id = ? AND state = 'intended' ORDER BY created_at").all(taskId) as EffectRow[];
}

export function reconcile(effect: EffectRow): Reconciliation {
  const data = effect.reconciliation_json ? JSON.parse(effect.reconciliation_json) as EffectPlan['reconciliation'] : null;
  if (effect.kind === 'memory.write') return { outcome: 'unknown', evidence: { reason: 'memory writes are reconciled by the store transaction' } };
  if (effect.kind !== 'filesystem.write' || !data?.path) return { outcome: 'unknown', evidence: { reason: 'no_supported_reconciler', kind: effect.kind } };
  let current: FileBefore;
  try { current = observeFile(data.path); } catch (e) { return { outcome: 'unknown', evidence: { reason: 'observation_failed', error: (e as Error).message } }; }
  const evidence = { path: data.path, before: data.before ?? null, after: current };
  if (current.exists && data.expectedContentSha256 && current.contentSha256 === data.expectedContentSha256
    && (data.expectedSize === undefined || current.size === data.expectedSize)) return { outcome: 'occurred', evidence };
  // Unchanged from the recorded "before" state → the write never landed.
  if (data.before && current.exists === data.before.exists && current.contentSha256 === data.before.contentSha256) return { outcome: 'did_not_occur', evidence };
  return { outcome: 'unknown', evidence };
}
