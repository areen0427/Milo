import { useEffect, useState } from "react";
import { decideApproval, getPermissions, listApprovals, setPermissions } from "../lib/milo.ts";
import { disableNotifications, enableNotifications, notificationSettings } from "../lib/notifications.ts";
import type { Approval, Permissions } from "../lib/milo.ts";

type Toggle = { key: "network" | "shell" | "autoApproveFileWrites"; name: string; description: string };
const TOGGLES: readonly Toggle[] = [
  { key: "network", name: "Network", description: "Fetch public web pages. Private and local addresses stay blocked." },
  { key: "shell", name: "Shell commands", description: "Run commands with a granted folder as the working directory. Every command asks first; shell access is not confined to that folder." },
  { key: "autoApproveFileWrites", name: "Write files without asking", description: "Skip the prompt for ordinary file writes. Writes containing secrets still ask." },
];

export default function PermissionsView({ connected }: { connected: boolean }) {
  const [perms, setPerms] = useState<Permissions | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [folder, setFolder] = useState("");
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState(false);
  const [backgroundNotifications, setBackgroundNotifications] = useState(false);
  const [notificationFailure, setNotificationFailure] = useState<string | null>(null);
  const [notificationBusy, setNotificationBusy] = useState(false);

  useEffect(() => {
    if (!connected) return;
    let live = true;
    const refresh = async () => {
      try {
        const [p, a, n] = await Promise.all([getPermissions(), listApprovals(), notificationSettings().catch(() => ({ enabled: false, available: false, lastError: null }))]);
        if (live) { setPerms(p); setApprovals(a); setNotifications(n.enabled); setBackgroundNotifications(n.available); setNotificationFailure(n.lastError); }
      } catch (err) { if (live) setError(String(err)); }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 2000);
    return () => { live = false; window.clearInterval(timer); };
  }, [connected]);

  if (!connected) return <p className="muted">Start the local service to manage permissions.</p>;
  if (!perms) return <p className="muted">Loading permissions…</p>;

  const update = async (patch: Partial<Permissions>) => {
    setError("");
    try { setPerms(await setPermissions(patch)); } catch (err) { setError(String(err)); }
  };
  const decide = async (id: string, decision: "approve" | "deny", scope: "once" | "task" = "once") => {
    setError("");
    try { await decideApproval(id, decision, scope); setApprovals((list) => list.filter((a) => a.id !== id)); } catch (err) { setError(String(err)); }
  };

  return (
    <div className="permissions">
      {approvals.length > 0 && (
        <ul className="perm-list" aria-label="Waiting for your approval">
          {approvals.map((a) => (
            <li key={a.id} className="perm-row">
              <div>
                <div className="perm-name">{a.summary} <span className="tag">{a.tier}</span></div>
                <div className="perm-desc">{a.goal ? `Task: ${a.goal.split("\n")[0]}` : a.tool}{a.grantTarget ? ` · Target: ${a.grantTarget}` : ""}{a.reasons.length ? ` · ${a.reasons.join("; ")}` : ""}</div>
              </div>
              <span>
                <button className="btn btn-primary" onClick={() => void decide(a.id, "approve")}>Approve</button>{" "}
                {a.tier !== "dangerous" && a.grantTarget && <><button className="btn" title={`Allow ${a.tool} only for ${a.grantTarget} for the rest of this task`} onClick={() => void decide(a.id, "approve", "task")}>Approve for task</button>{" "}</>}
                <button className="btn" onClick={() => void decide(a.id, "deny")}>Deny</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <ul className="perm-list">
        <li className="perm-row">
          <div>
            <div className="perm-name">Files</div>
            <div className="perm-desc">{perms.fileRoots.length ? perms.fileRoots.join(", ") : "No folders granted."}</div>
          </div>
          {perms.fileRoots.length > 0 && <button className="btn" onClick={() => void update({ fileRoots: [] })}>Revoke all</button>}
        </li>
        <li className="perm-row">
          <input className="composer-input" value={folder} placeholder="/Users/you/Documents/Project" aria-label="Folder to grant" onChange={(e) => setFolder(e.target.value)} />
          <button className="btn" disabled={!folder.trim()} onClick={() => void update({ fileRoots: [...perms.fileRoots, folder.trim()] }).then(() => setFolder(""))}>Grant folder</button>
        </li>
        <li className="perm-row"><div><div className="perm-name">Notifications</div><div className="perm-desc">{backgroundNotifications ? "Show task completion and approval alerts while the service runs. macOS permission is required." : "Notifications require the packaged Milo app."}</div></div><button className="btn" disabled={notificationBusy || (!backgroundNotifications && !notifications)} aria-pressed={notifications} onClick={() => void (async () => { setNotificationBusy(true); try { setError(""); if (notifications) { await disableNotifications(); setNotifications(false); } else { const allowed = await enableNotifications(); setNotifications(allowed); if (!allowed) setError("macOS did not grant notification permission."); } } catch (e) { setError(String(e)); } finally { setNotificationBusy(false); } })()}>{notifications ? "On" : "Off"}</button></li>
        {TOGGLES.map((t) => (
          <li key={t.key} className="perm-row">
            <div>
              <div className="perm-name">{t.name}</div>
              <div className="perm-desc">{t.description}</div>
            </div>
            <button className="btn" aria-pressed={perms[t.key]} onClick={() => void update({ [t.key]: !perms[t.key] })}>{perms[t.key] ? "On" : "Off"}</button>
          </li>
        ))}
      </ul>
      {notificationFailure && <p className="perm-note" role="alert">Last notification failed: {notificationFailure}</p>}
      {error && <p className="perm-note" role="alert">{error}</p>}
      <p className="perm-note">Nothing is enabled by default. Dangerous actions always ask, whatever is enabled here.</p>
    </div>
  );
}
