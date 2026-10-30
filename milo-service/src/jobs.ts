// Durable tasks. State model distilled from Aiden core/v4/daemon/jobLifecycle.ts, jobEngine.ts and
// jobRecoverySweep.ts (AGPL-3.0-only, Copyright (c) 2026 Shiva Deore / Taracod), reduced to a
// single-writer service: one process owns the store, so leases and fencing tokens are not needed.
//
//   queued ─► running ─► completed | failed | cancelled
//               │  ▲
//               ▼  │ (approve / deny)
//        waiting_approval
//   running ─(crash)─► queued (safe resume) | needs_review (unknown effect) | failed (too many crashes)
import type { DB } from './store.ts';
import { emit, newId, now, tx } from './store.ts';
import type { Message } from './inference/types.ts';
import { pendingEffects, reconcile, settleEffect } from './effects.ts';
import { ValidationError } from './settings.ts';

export type TaskStatus = 'queued' | 'running' | 'waiting_approval' | 'needs_review' | 'completed' | 'failed' | 'cancelled' | 'interrupted';
export const TERMINAL: readonly TaskStatus[] = ['completed', 'failed', 'cancelled', 'interrupted'];
export const ACTIVE: readonly TaskStatus[] = ['queued', 'running', 'waiting_approval', 'needs_review'];
export type Task = {
  id: string; goal: string; status: TaskStatus; createdAt: string; updatedAt: string; result: string | null; error: string | null;
  origin: string; scheduleId: string | null; goalId: string | null; steps: number; recoveries: number;
  usage: { inputTokens: number; outputTokens: number; estimated: boolean };
};
export type ToolCallStatus = 'pending' | 'waiting_approval' | 'running' | 'succeeded' | 'failed' | 'denied' | 'unknown';
export type ToolCallRow = { id: string; task_id: string; call_id: string; name: string; args_json: string; status: ToolCallStatus; tier: string | null; reason: string | null; result_json: string | null };
export const MAX_GOAL = 4000;

function toTask(r: Record<string, unknown>): Task {
  return {
    id: r.id as string, goal: r.goal as string, status: r.status as TaskStatus, createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    result: (r.result as string) ?? null, error: (r.error as string) ?? null, origin: r.origin as string, scheduleId: (r.schedule_id as string) ?? null, goalId: (r.goal_id as string) ?? null,
    steps: Number(r.steps), recoveries: Number(r.recoveries),
    usage: { inputTokens: Number(r.input_tokens ?? 0), outputTokens: Number(r.output_tokens ?? 0), estimated: Number(r.usage_estimated ?? 0) === 1 },
  };
}

export function createTask(db: DB, goal: unknown, opts: { origin?: string; scheduleId?: string | null; occurrenceId?: string | null; goalId?: string | null } = {}): Task {
  if (typeof goal !== 'string' || !goal.trim() || goal.length > MAX_GOAL) throw new ValidationError(`Goal must be a nonempty string of at most ${MAX_GOAL} characters`);
  return tx(db, () => {
    const id = newId(); const at = now();
    db.prepare('INSERT INTO tasks (id, goal, status, created_at, updated_at, origin, schedule_id, occurrence_id, goal_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, goal, 'queued', at, at, opts.origin ?? 'client', opts.scheduleId ?? null, opts.occurrenceId ?? null, opts.goalId ?? null);
    appendMessage(db, id, { role: 'user', content: goal });
    emit(db, id, 'task.created', { status: 'queued', origin: opts.origin ?? 'client' });
    return getTask(db, id)!;
  });
}

export function getTask(db: DB, id: string): Task | null {
  const r = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return r ? toTask(r) : null;
}
export function listTasks(db: DB, opts: { status?: string; limit?: number; goalId?: string; before?: string } = {}): Task[] {
  if (opts.limit !== undefined && (!Number.isInteger(opts.limit) || opts.limit < 1 || opts.limit > 2000)) throw new ValidationError('limit must be an integer from 1 to 2000');
  const limit = opts.limit ?? 500;
  const filters: string[] = []; const values: Array<string | number> = [];
  if (opts.goalId) { filters.push('goal_id = ?'); values.push(opts.goalId); }
  if (opts.status) { filters.push('status = ?'); values.push(opts.status); }
  if (opts.before) {
    const cursor = db.prepare('SELECT created_at, rowid AS cursor_rowid FROM tasks WHERE id = ?').get(opts.before) as { created_at: string; cursor_rowid: number } | undefined;
    if (!cursor) throw new ValidationError('Task cursor not found');
    filters.push('(created_at < ? OR (created_at = ? AND rowid < ?))');
    values.push(cursor.created_at, cursor.created_at, Number(cursor.cursor_rowid));
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  // Return the most recent bounded window in chronological order for the UI.
  const rows = db.prepare(`SELECT * FROM tasks ${where} ORDER BY created_at DESC, rowid DESC LIMIT ?`).all(...values, limit) as Array<Record<string, unknown>>;
  return rows.reverse().map(toTask);
}
export function nextQueued(db: DB): Task | null {
  const r = db.prepare("SELECT * FROM tasks WHERE status = 'queued' ORDER BY created_at, rowid LIMIT 1").get() as Record<string, unknown> | undefined;
  return r ? toTask(r) : null;
}

export function setStatus(db: DB, id: string, status: TaskStatus, fields: { result?: string | null; error?: string | null } = {}): void {
  tx(db, () => {
    const sets = ['status = ?', 'updated_at = ?']; const vals: Array<string | null> = [status, now()];
    if ('result' in fields) { sets.push('result = ?'); vals.push(fields.result ?? null); }
    if ('error' in fields) { sets.push('error = ?'); vals.push(fields.error ?? null); }
    db.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`).run(...vals, id);
    emit(db, id, 'task.status', { status, ...fields });
  });
}
export function incrementSteps(db: DB, id: string): number {
  db.prepare('UPDATE tasks SET steps = steps + 1, updated_at = ? WHERE id = ?').run(now(), id);
  return Number((db.prepare('SELECT steps FROM tasks WHERE id = ?').get(id) as { steps: number }).steps);
}
export function cancelRequested(db: DB, id: string): boolean {
  return Number((db.prepare('SELECT cancel_requested FROM tasks WHERE id = ?').get(id) as { cancel_requested: number } | undefined)?.cancel_requested) === 1;
}

// ── Message log ───────────────────────────────────────────────────────────
export function appendMessage(db: DB, taskId: string, message: Message): void {
  const seq = Number((db.prepare('SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM task_messages WHERE task_id = ?').get(taskId) as { n: number }).n);
  db.prepare('INSERT INTO task_messages (task_id, seq, message_json, created_at) VALUES (?, ?, ?, ?)').run(taskId, seq, JSON.stringify(message), now());
}
export function loadMessages(db: DB, taskId: string): Message[] {
  return (db.prepare('SELECT message_json FROM task_messages WHERE task_id = ? ORDER BY seq').all(taskId) as Array<{ message_json: string }>).map(r => JSON.parse(r.message_json) as Message);
}

/** Adds one model step's usage to the task and its open attempt. */
export function recordUsage(db: DB, taskId: string, attemptId: string | null, usage: { inputTokens: number; outputTokens: number }, estimated: boolean): void {
  const est = estimated ? 1 : 0;
  db.prepare('UPDATE tasks SET input_tokens = input_tokens + ?, output_tokens = output_tokens + ?, usage_estimated = MAX(usage_estimated, ?) WHERE id = ?').run(usage.inputTokens, usage.outputTokens, est, taskId);
  if (attemptId) db.prepare('UPDATE attempts SET input_tokens = input_tokens + ?, output_tokens = output_tokens + ?, usage_estimated = MAX(usage_estimated, ?) WHERE id = ?').run(usage.inputTokens, usage.outputTokens, est, attemptId);
}
export function openAttemptId(db: DB, taskId: string): string | null {
  return (db.prepare('SELECT id FROM attempts WHERE task_id = ? AND ended_at IS NULL ORDER BY number DESC LIMIT 1').get(taskId) as { id: string } | undefined)?.id ?? null;
}
export function usageTotals(db: DB): { inputTokens: number; outputTokens: number; tasks: number } {
  const r = db.prepare('SELECT COALESCE(SUM(input_tokens), 0) AS i, COALESCE(SUM(output_tokens), 0) AS o, COUNT(*) AS n FROM tasks').get() as { i: number; o: number; n: number };
  return { inputTokens: Number(r.i), outputTokens: Number(r.o), tasks: Number(r.n) };
}

// ── Attempts ──────────────────────────────────────────────────────────────
export function startAttempt(db: DB, taskId: string, backend: string): string {
  const id = newId();
  const n = Number((db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE task_id = ?').get(taskId) as { n: number }).n) + 1;
  db.prepare('INSERT INTO attempts (id, task_id, number, backend, started_at) VALUES (?, ?, ?, ?, ?)').run(id, taskId, n, backend, now());
  return id;
}
export function endAttempt(db: DB, id: string, outcome: string): void {
  db.prepare('UPDATE attempts SET ended_at = ?, outcome = ? WHERE id = ? AND ended_at IS NULL').run(now(), outcome, id);
}

// ── Tool calls ────────────────────────────────────────────────────────────
export function getToolCall(db: DB, taskId: string, callId: string): ToolCallRow | null {
  return (db.prepare('SELECT * FROM tool_calls WHERE task_id = ? AND call_id = ?').get(taskId, callId) as ToolCallRow | undefined) ?? null;
}
export function ensureToolCall(db: DB, taskId: string, callId: string, name: string, args: Record<string, unknown>): ToolCallRow {
  const existing = getToolCall(db, taskId, callId);
  if (existing) return existing;
  const at = now();
  db.prepare('INSERT INTO tool_calls (id, task_id, call_id, name, args_json, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(newId(), taskId, callId, name, JSON.stringify(args), 'pending', at, at);
  return getToolCall(db, taskId, callId)!;
}
export function updateToolCall(db: DB, id: string, fields: { status: ToolCallStatus; tier?: string; reason?: string | null; result?: unknown }): void {
  db.prepare('UPDATE tool_calls SET status = ?, tier = COALESCE(?, tier), reason = COALESCE(?, reason), result_json = COALESCE(?, result_json), updated_at = ? WHERE id = ?')
    .run(fields.status, fields.tier ?? null, fields.reason ?? null, fields.result === undefined ? null : JSON.stringify(fields.result), now(), id);
}

// ── Approvals ─────────────────────────────────────────────────────────────
export type Approval = { id: string; taskId: string; toolCallId: string; tool: string; summary: string; tier: string; reasons: string[]; status: 'pending' | 'approved' | 'denied' | 'expired'; createdAt: string; decidedAt: string | null; grantTarget: string | null; goal?: string };
function toApproval(r: Record<string, unknown>): Approval {
  return { id: r.id as string, taskId: r.task_id as string, toolCallId: r.tool_call_id as string, tool: r.tool as string, summary: r.summary as string, tier: r.tier as string, reasons: JSON.parse(r.reasons_json as string), status: r.status as Approval['status'], createdAt: r.created_at as string, decidedAt: (r.decided_at as string) ?? null, grantTarget: (r.grant_target as string) ?? null, ...(r.goal ? { goal: r.goal as string } : {}) };
}
export function createApproval(db: DB, input: { taskId: string; toolCallId: string; tool: string; digest: string; summary: string; tier: string; reasons: string[]; grantTarget?: string | null }): Approval {
  const id = newId();
  db.prepare('INSERT INTO approvals (id, task_id, tool_call_id, tool, args_digest, summary, tier, reasons_json, status, created_at, grant_target) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, input.taskId, input.toolCallId, input.tool, input.digest, input.summary, input.tier, JSON.stringify(input.reasons), 'pending', now(), input.grantTarget ?? null);
  emit(db, input.taskId, 'approval.requested', { approvalId: id, tool: input.tool, summary: input.summary, tier: input.tier });
  return toApproval(db.prepare('SELECT * FROM approvals WHERE id = ?').get(id) as Record<string, unknown>);
}
export function approvalForToolCall(db: DB, toolCallId: string): (Approval & { digest: string }) | null {
  const r = db.prepare('SELECT * FROM approvals WHERE tool_call_id = ? ORDER BY created_at DESC LIMIT 1').get(toolCallId) as Record<string, unknown> | undefined;
  return r ? { ...toApproval(r), digest: r.args_digest as string } : null;
}
export function listApprovals(db: DB, status: string | undefined): Approval[] {
  const base = 'SELECT a.*, t.goal FROM approvals a JOIN tasks t ON t.id = a.task_id';
  const rows = (status ? db.prepare(`${base} WHERE a.status = ? ORDER BY a.created_at`).all(status) : db.prepare(`${base} ORDER BY a.created_at DESC LIMIT 200`).all()) as Array<Record<string, unknown>>;
  return rows.map(toApproval);
}
/**
 * scope "once" approves this call only. scope "task" also lets later calls of the same tool in the
 * same task and exact resolved file target run without asking, as long as each is assessed below `dangerous`; dangerous actions
 * cannot be granted this way.
 */
export function decideApproval(db: DB, id: unknown, decision: unknown, scope: unknown = 'once'): Approval {
  if (typeof id !== 'string') throw new ValidationError('id must be a string');
  if (decision !== 'approve' && decision !== 'deny') throw new ValidationError('decision must be "approve" or "deny"');
  if (scope !== 'once' && scope !== 'task') throw new ValidationError('scope must be "once" or "task"');
  return tx(db, () => {
    const r = db.prepare('SELECT * FROM approvals WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!r) throw new ValidationError('Approval not found');
    if (r.status !== 'pending') throw new ValidationError(`Approval already ${r.status}`);
    if (scope === 'task' && decision === 'approve' && r.tier === 'dangerous') throw new ValidationError('Dangerous actions can only be approved once');
    if (scope === 'task' && decision === 'approve' && !r.grant_target) throw new ValidationError('Task-scoped approval requires a supported file target');
    const status = decision === 'approve' ? 'approved' : 'denied';
    db.prepare('UPDATE approvals SET status = ?, decided_at = ? WHERE id = ?').run(status, now(), id);
    if (scope === 'task' && decision === 'approve') {
      db.prepare('INSERT OR IGNORE INTO approval_target_grants (id, task_id, tool, target, approval_id, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(newId(), r.task_id as string, r.tool as string, r.grant_target as string, id, now());
    }
    emit(db, r.task_id as string, 'approval.decided', { approvalId: id, status, scope });
    const task = getTask(db, r.task_id as string);
    if (task?.status === 'waiting_approval') setStatus(db, task.id, 'queued');
    return toApproval(db.prepare('SELECT * FROM approvals WHERE id = ?').get(id) as Record<string, unknown>);
  });
}

export function hasTaskGrant(db: DB, taskId: string, tool: string, target: string): boolean {
  return db.prepare('SELECT 1 FROM approval_target_grants WHERE task_id = ? AND tool = ? AND target = ?').get(taskId, tool, target) !== undefined;
}

// ── Cancellation ──────────────────────────────────────────────────────────
export function cancelTask(db: DB, id: unknown): Task {
  if (typeof id !== 'string') throw new ValidationError('id must be a string');
  return tx(db, () => {
    const task = getTask(db, id);
    if (!task) throw new ValidationError('Task not found');
    if (TERMINAL.includes(task.status)) return task;
    db.prepare("UPDATE approvals SET status = 'expired', decided_at = ? WHERE task_id = ? AND status = 'pending'").run(now(), id);
    if (task.status === 'running') {
      db.prepare('UPDATE tasks SET cancel_requested = 1, updated_at = ? WHERE id = ?').run(now(), id);
      emit(db, id, 'task.cancel_requested', {});
    } else setStatus(db, id, 'cancelled', { error: 'Cancelled by user' });
    return getTask(db, id)!;
  });
}

// ── Evidence for clients ──────────────────────────────────────────────────
export function taskDetail(db: DB, id: string) {
  const task = getTask(db, id);
  if (!task) return null;
  const toolCalls = (db.prepare('SELECT * FROM tool_calls WHERE task_id = ? ORDER BY created_at, rowid').all(id) as ToolCallRow[]).map(t => ({
    callId: t.call_id, name: t.name, arguments: JSON.parse(t.args_json), status: t.status, tier: t.tier, reason: t.reason, result: t.result_json ? JSON.parse(t.result_json) : null,
  }));
  const effects = (db.prepare('SELECT kind, target, state, evidence_json, created_at, updated_at FROM effects WHERE task_id = ? ORDER BY created_at').all(id) as Array<Record<string, unknown>>)
    .map(e => ({ kind: e.kind, target: e.target, state: e.state, evidence: e.evidence_json ? JSON.parse(e.evidence_json as string) : null, createdAt: e.created_at, updatedAt: e.updated_at }));
  const attempts = (db.prepare('SELECT * FROM attempts WHERE task_id = ? ORDER BY number').all(id) as Array<Record<string, unknown>>)
    .map(a => ({ number: a.number, backend: a.backend, startedAt: a.started_at, endedAt: a.ended_at, outcome: a.outcome, usage: { inputTokens: Number(a.input_tokens), outputTokens: Number(a.output_tokens), estimated: Number(a.usage_estimated) === 1 } }));
  const approvals = (db.prepare('SELECT * FROM approvals WHERE task_id = ? ORDER BY created_at').all(id) as Array<Record<string, unknown>>).map(toApproval);
  return { ...task, toolCalls, effects, attempts, approvals, messages: loadMessages(db, id) };
}

// ── Crash recovery ────────────────────────────────────────────────────────
/**
 * Runs once at startup, before the worker. Tasks left `running` were interrupted by a crash or kill.
 * Each `intended` effect is reconciled from observation. A task resumes only when every effect is
 * resolved; an unknown outcome is never retried and goes to the user instead.
 */
export function recoverInterrupted(db: DB, maxRecoveries: number): { requeued: number; needsReview: number; failed: number } {
  const out = { requeued: 0, needsReview: 0, failed: 0 };
  tx(db, () => {
    db.prepare("UPDATE attempts SET ended_at = ?, outcome = 'crashed' WHERE ended_at IS NULL").run(now());
    for (const task of listTasks(db, { status: 'running', limit: 2000 })) {
      let unknown = false;
      for (const effect of pendingEffects(db, task.id)) {
        const r = reconcile(effect);
        const call = db.prepare('SELECT * FROM tool_calls WHERE id = ?').get(effect.tool_call_id) as ToolCallRow | undefined;
        if (r.outcome === 'occurred') {
          settleEffect(db, effect.id, 'applied', r.evidence);
          if (call) updateToolCall(db, call.id, { status: 'succeeded', result: { ok: true, result: { recovered: true, note: 'The service restarted after this action; observation confirmed it was applied.', evidence: r.evidence } } });
        } else if (r.outcome === 'did_not_occur') {
          settleEffect(db, effect.id, 'not_applied', r.evidence);
          if (call) updateToolCall(db, call.id, { status: 'failed', result: { ok: false, error: { code: 'not_executed', message: 'The service restarted before this action completed; observation shows it was not applied. You may request it again.' } } });
        } else {
          unknown = true;
          settleEffect(db, effect.id, 'unknown', r.evidence);
          if (call) updateToolCall(db, call.id, { status: 'unknown', reason: 'Outcome could not be verified after a restart' });
        }
        emit(db, task.id, 'effect.reconciled', { kind: effect.kind, target: effect.target, outcome: r.outcome });
      }
      if (unknown) {
        setStatus(db, task.id, 'needs_review', { error: 'Milo restarted while an action was in progress and cannot verify whether it happened. Review the action, then cancel or resume the task.' });
        out.needsReview++;
        continue;
      }
      db.prepare('UPDATE tasks SET recoveries = recoveries + 1, cancel_requested = 0 WHERE id = ?').run(task.id);
      if (task.recoveries + 1 > maxRecoveries) {
        setStatus(db, task.id, 'failed', { error: `Interrupted ${task.recoveries + 1} times; not resuming automatically.` });
        out.failed++;
      } else {
        setStatus(db, task.id, 'queued');
        emit(db, task.id, 'task.recovered', { recoveries: task.recoveries + 1 });
        out.requeued++;
      }
    }
  });
  return out;
}

/** User decision for a needs_review task: `resume` treats unknown actions as failed and continues; `cancel` stops. */
export function resolveReview(db: DB, id: unknown, action: unknown): Task {
  if (typeof id !== 'string') throw new ValidationError('id must be a string');
  if (action !== 'resume' && action !== 'cancel') throw new ValidationError('action must be "resume" or "cancel"');
  return tx(db, () => {
    const task = getTask(db, id);
    if (!task) throw new ValidationError('Task not found');
    if (task.status !== 'needs_review') throw new ValidationError('Task is not waiting for review');
    if (action === 'cancel') { setStatus(db, id, 'cancelled', { error: 'Cancelled after review' }); return getTask(db, id)!; }
    for (const call of db.prepare("SELECT * FROM tool_calls WHERE task_id = ? AND status = 'unknown'").all(id) as ToolCallRow[]) {
      updateToolCall(db, call.id, { status: 'failed', result: { ok: false, error: { code: 'outcome_unknown', message: 'The service restarted during this action. The user reviewed it; do not assume it succeeded. Check the current state before repeating it.' } } });
    }
    setStatus(db, id, 'queued', { error: null });
    return getTask(db, id)!;
  });
}
