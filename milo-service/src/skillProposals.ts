// Trace-derived skill candidates are inert until an explicit user decision.
import type { DB } from './store.ts';
import { emit, newId, now, tx } from './store.ts';
import { ValidationError } from './settings.ts';

type Proposal = { id: string; taskId: string; name: string; content: string; status: 'pending' | 'accepted' | 'rejected' | 'revoked'; createdAt: string; decidedAt: string | null };
function map(r: Record<string, unknown>): Proposal {
  return { id: r.id as string, taskId: r.task_id as string, name: r.name as string, content: r.content as string, status: r.status as Proposal['status'], createdAt: r.created_at as string, decidedAt: (r.decided_at as string) ?? null };
}
export function proposeFromTask(db: DB, taskId: string): Proposal | null {
  return tx(db, () => {
    const task = db.prepare('SELECT status FROM tasks WHERE id = ?').get(taskId) as { status: string } | undefined;
    if (task?.status !== 'completed') return null;
    if (db.prepare("SELECT 1 FROM tool_calls WHERE task_id = ? AND status <> 'succeeded' LIMIT 1").get(taskId)) return null;
    if (db.prepare("SELECT 1 FROM events WHERE task_id = ? AND type = 'honesty.finding' LIMIT 1").get(taskId)) return null;
    const calls = db.prepare("SELECT name FROM tool_calls WHERE task_id = ? AND status = 'succeeded' ORDER BY created_at, rowid").all(taskId) as Array<{ name: string }>;
    if (calls.length < 2) return null;
    const names = calls.map(c => c.name).filter(n => /^[a-z][a-z0-9_]{0,63}$/.test(n)).slice(0, 24);
    if (names.length < 2) return null;
    const id = newId(); const name = `task-${taskId}`;
    // Deliberately omit task text, arguments, tool outputs and model answers: they may contain secrets.
    const content = `# Workflow from a completed task\n\nThis is an untrusted, trace-derived starting point. Check whether each step applies to the current task. Do not assume previous results are still valid. Tool permissions and approvals remain required.\n\nObserved successful tools, in order:\n${names.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n`;
    const inserted = db.prepare("INSERT OR IGNORE INTO skill_proposals (id, task_id, name, content, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)").run(id, taskId, name, content, now());
    if (!inserted.changes) return null;
    emit(db, taskId, 'skill.proposed', { proposalId: id, name });
    return map(db.prepare('SELECT * FROM skill_proposals WHERE id = ?').get(id) as Record<string, unknown>);
  });
}
export function listProposals(db: DB): Proposal[] {
  return (db.prepare('SELECT * FROM skill_proposals ORDER BY created_at DESC LIMIT 200').all() as Array<Record<string, unknown>>).map(map);
}
export function decideProposal(db: DB, id: unknown, decision: unknown): Proposal {
  if (typeof id !== 'string' || (decision !== 'accept' && decision !== 'reject' && decision !== 'revoke')) throw new ValidationError('Expected proposal id and accept, reject or revoke decision');
  return tx(db, () => {
    const row = db.prepare('SELECT * FROM skill_proposals WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) throw new ValidationError('Skill proposal not found');
    if (decision === 'revoke' ? row.status !== 'accepted' : row.status !== 'pending') throw new ValidationError('Skill proposal already decided or not accepted');
    const status = decision === 'accept' ? 'accepted' : decision === 'revoke' ? 'revoked' : 'rejected';
    db.prepare('UPDATE skill_proposals SET status = ?, decided_at = ? WHERE id = ?').run(status, now(), id);
    emit(db, row.task_id as string, 'skill.decided', { proposalId: id, status });
    return map(db.prepare('SELECT * FROM skill_proposals WHERE id = ?').get(id) as Record<string, unknown>);
  });
}
export function acceptedSkills(db: DB): Array<{ name: string; content: string }> {
  return db.prepare("SELECT name, content FROM skill_proposals WHERE status = 'accepted' ORDER BY created_at DESC LIMIT 200").all() as Array<{ name: string; content: string }>;
}
