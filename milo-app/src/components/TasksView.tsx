import { useEffect, useState } from "react";
import { cancelTask, getTask, reviewTask, listTasksBefore } from "../lib/milo.ts";
import type { Task, TaskDetail } from "../lib/milo.ts";
export default function TasksView({ tasks, connected }: { tasks: Task[]; connected: boolean }) {
  const [older, setOlder] = useState<Task[]>([]); const [hasMore, setHasMore] = useState(true); const [loadingOlder, setLoadingOlder] = useState(false);
  const [selected, setSelected] = useState<string | null>(null); const [detail, setDetail] = useState<TaskDetail | null>(null); const [error, setError] = useState("");
  useEffect(() => { if (!connected || !selected) return; let live = true; const refresh = () => void getTask(selected).then(t => { if (live) setDetail(t); }).catch(e => { if (live) setError(String(e)); }); refresh(); const timer = window.setInterval(refresh, 2000); return () => { live = false; window.clearInterval(timer); }; }, [connected, selected]);
  const act = async (action: () => Promise<unknown>) => { try { setError(""); await action(); if (selected) setDetail(await getTask(selected)); } catch (e) { setError(String(e)); } };
  const all = [...older.filter(old => !tasks.some(task => task.id === old.id)), ...tasks];
  const loadOlder = async () => {
    if (!all.length || loadingOlder) return;
    setLoadingOlder(true);
    try { setError(""); const page = await listTasksBefore(all[0].id); setOlder(old => [...page, ...old]); if (page.length < 500) setHasMore(false); }
    catch (e) { setError(String(e)); } finally { setLoadingOlder(false); }
  };
  if (!connected) return <p className="muted">Start the local service to view tasks.</p>;
  return <div className="workspace-list">{error && <p role="alert">{error}</p>}{!tasks.length && <p className="muted">No tasks yet. Send a request from Chat to create one.</p>}{[...all].reverse().map(t => <article key={t.id}><button className="btn" onClick={() => { setDetail(null); setSelected(selected === t.id ? null : t.id); }}>{selected === t.id ? "Close" : "Details"}</button> <strong>{t.goal}</strong> · {t.status.replace("_", " ")}{(t.result ?? t.error) && <p>{t.result ?? t.error}</p>}
    {selected === t.id && detail?.id === t.id && <div><p>Steps: {detail.steps} · recoveries: {detail.recoveries} · tokens: {detail.usage.inputTokens} in / {detail.usage.outputTokens}{detail.usage.estimated ? " (estimated)" : ""}</p>
      {detail.status === "needs_review" && <><p>Inspect the uncertain effects below before deciding. Resuming tells Milo their outcome is unknown; it may choose to act again.</p><button className="btn" onClick={() => void act(() => reviewTask(t.id, "resume"))}>Resume after review</button> <button className="btn" onClick={() => void act(() => reviewTask(t.id, "cancel"))}>Cancel after review</button></>}
      {["queued", "running", "waiting_approval"].includes(detail.status) && <button className="btn" onClick={() => void act(() => cancelTask(t.id))}>Cancel task</button>}
      <h3>Tool calls</h3>{detail.toolCalls.length ? detail.toolCalls.map((c, i) => <div key={i}><strong>{c.name}</strong> · {c.status}<pre>{JSON.stringify({ arguments: c.arguments, result: c.result }, null, 2)}</pre></div>) : <p className="muted">None</p>}
      <h3>Effects</h3>{detail.effects.length ? detail.effects.map((effect, i) => <div key={i}><strong>{effect.kind}</strong> · {effect.state} · {effect.target}<pre>{JSON.stringify(effect.evidence, null, 2)}</pre></div>) : <p className="muted">None</p>}
      <h3>Attempts</h3>{detail.attempts.map(a => <p key={a.number}>#{a.number} · {a.backend} · {a.outcome ?? "running"} · {a.startedAt}</p>)}
    </div>}</article>)}{all.length > 0 && hasMore && <button className="btn" disabled={loadingOlder} onClick={() => void loadOlder()}>{loadingOlder ? "Loading…" : "Load older tasks"}</button>}</div>;
}
