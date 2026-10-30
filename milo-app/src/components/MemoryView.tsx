import { useEffect, useState } from "react";
import { addMemory, deleteMemory, listMemory } from "../lib/milo.ts";
import type { MemoryEntry } from "../lib/milo.ts";
export default function MemoryView({ connected }: { connected: boolean }) {
  const [entries, setEntries] = useState<MemoryEntry[]>([]); const [text, setText] = useState(""); const [namespace, setNamespace] = useState<"user" | "notes">("notes"); const [error, setError] = useState("");
  const refresh = async () => setEntries(await listMemory());
  useEffect(() => { if (connected) void refresh().catch(e => setError(String(e))); }, [connected]);
  const run = async (action: () => Promise<unknown>) => { try { setError(""); await action(); await refresh(); } catch (e) { setError(String(e)); } };
  if (!connected) return <p className="muted">Start the local service to manage memory.</p>;
  return <div className="workspace-list"><form onSubmit={e => { e.preventDefault(); void run(async () => { await addMemory(namespace, text); setText(""); }); }}><label>Memory <input value={text} onChange={e => setText(e.target.value)} required /></label><label>Namespace <select value={namespace} onChange={e => setNamespace(e.target.value as "user" | "notes")}><option value="notes">Notes</option><option value="user">User</option></select></label><button className="btn btn-primary">Save</button></form>
    {error && <p role="alert">{error}</p>}{!entries.length && <p className="muted">No memories yet.</p>}{entries.map(m => <article key={m.id}><p>{m.text}</p><span className="muted">{m.namespace} · {m.source}</span> <button className="btn" onClick={() => void run(() => deleteMemory(m.id))}>Delete</button></article>)}</div>;
}
