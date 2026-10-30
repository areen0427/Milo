import { useEffect, useState } from "react";
import { decideSkillProposal, listSkillProposals } from "../lib/milo.ts";
import type { SkillProposal } from "../lib/milo.ts";
export default function SkillsView({ connected }: { connected: boolean }) {
  const [proposals, setProposals] = useState<SkillProposal[]>([]); const [error, setError] = useState("");
  const refresh = async () => setProposals(await listSkillProposals());
  useEffect(() => { if (connected) void refresh().catch(e => setError(String(e))); }, [connected]);
  const decide = async (id: string, decision: "accept" | "reject" | "revoke") => { try { setError(""); await decideSkillProposal(id, decision); await refresh(); } catch (e) { setError(String(e)); } };
  if (!connected) return <p className="muted">Start the local service to review skills.</p>;
  return <div className="workspace-list"><p>These candidates are generated from completed task traces. Accepted skills are reference material and do not grant permissions.</p>{error && <p role="alert">{error}</p>}{!proposals.length && <p className="muted">No skill proposals yet.</p>}{proposals.map(p => <article key={p.id}><strong>{p.name}</strong> · {p.status}<p className="muted">From task {p.taskId}</p><pre>{p.content}</pre>{p.status === "pending" && <><button className="btn btn-primary" onClick={() => void decide(p.id, "accept")}>Accept skill</button> <button className="btn" onClick={() => void decide(p.id, "reject")}>Reject</button></>}{p.status === "accepted" && <button className="btn" onClick={() => void decide(p.id, "revoke")}>Remove skill</button>}</article>)}</div>;
}
