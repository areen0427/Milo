import { useEffect, useRef, useState } from "react";
import { createGoal, createGoalTask, getGoal, listGoals, updateGoal } from "../lib/milo.ts";
import type { GoalSummary, GoalStatus, Task } from "../lib/milo.ts";

export default function GoalsView({ connected }: { connected: boolean }) {
  const [goals, setGoals] = useState<GoalSummary[]>([]); const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); const [task, setTask] = useState<Record<string, string>>({}); const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null); const [linked, setLinked] = useState<Task[] | null>(null); const [linkedFailed, setLinkedFailed] = useState(false);
  // Latest request wins: the open goal and a request counter live in refs so a response that arrives
  // after the user switched goals (or closed the panel) is ignored instead of showing another goal's tasks.
  const openRef = useRef<string | null>(null); const requestRef = useRef(0);
  const loadLinked = async (id: string) => {
    const request = ++requestRef.current; const current = () => requestRef.current === request && openRef.current === id;
    try { const d = await getGoal(id); if (current()) { setLinked(d.tasks); setLinkedFailed(false); } }
    catch (e) { if (current()) { setLinked([]); setLinkedFailed(true); setError(String(e)); } }
  };
  const refresh = async () => { setGoals(await listGoals()); if (openRef.current) await loadLinked(openRef.current); };
  const toggle = (id: string) => {
    setLinked(null); setLinkedFailed(false);
    if (openRef.current === id) { openRef.current = null; requestRef.current++; setOpen(null); return; }
    openRef.current = id; setOpen(id); void loadLinked(id);
  };
  useEffect(() => { if (connected) void refresh().catch(e => setError(String(e))); }, [connected]);
  const run = async (action: () => Promise<unknown>) => { try { setError(""); await action(); await refresh(); } catch (e) { setError(String(e)); } };
  if (!connected) return <p className="muted">Start the local service to manage goals.</p>;
  return <div className="workspace-list">
    <form onSubmit={e => { e.preventDefault(); void run(async () => { await createGoal(title, description); setTitle(""); setDescription(""); }); }}>
      <label>New goal <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={500} /></label>
      <label>Description <input value={description} onChange={e => setDescription(e.target.value)} /></label>
      <button className="btn btn-primary">Create goal</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {goals.length === 0 && <p className="muted">No goals yet.</p>}
    {goals.map(g => <article key={g.id}><strong>{g.title}</strong> · {g.status}<p>{g.description}</p><p className="muted">{g.tasks.completed}/{g.tasks.total} tasks completed · {g.schedules} schedules</p>
      <button type="button" className="btn" onClick={() => toggle(g.id)}>{open === g.id ? "Hide tasks" : "Show tasks"}</button>
      {open === g.id && (linked === null ? <p className="muted">Loading tasks…</p> : linkedFailed ? <p className="muted">Could not load tasks.</p> : linked.length === 0 ? <p className="muted">No linked tasks.</p> : <ul>{linked.map(t => <li key={t.id}>{t.goal} · {t.status.replace("_", " ")}</li>)}</ul>)}
      <p className="muted">Pausing, achieving or archiving this goal disables its schedules. After reactivating the goal, re-enable them individually if needed.</p><label>Status <select value={g.status} onChange={e => void run(() => updateGoal({ id: g.id, status: e.target.value as GoalStatus }))}><option value="active">Active</option><option value="paused">Paused</option><option value="achieved">Achieved</option><option value="archived">Archived</option></select></label>
      {g.status === "active" && <form onSubmit={e => { e.preventDefault(); void run(async () => { await createGoalTask(task[g.id], g.id); setTask(v => ({ ...v, [g.id]: "" })); }); }}><label>Task <input value={task[g.id] ?? ""} onChange={e => setTask(v => ({ ...v, [g.id]: e.target.value }))} required /></label><button className="btn">Start task</button></form>}
    </article>)}
  </div>;
}
