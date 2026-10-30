import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Mark from "./Mark.tsx";
import type { AppInfo, ServiceStatus } from "../lib/milo.ts";
import { serviceLabel, startService, stopService, managedService, pauseService, resumeService } from "../lib/milo.ts";

export type ViewId = "chat" | "tasks" | "goals" | "memory" | "schedules" | "skills" | "settings" | "permissions";

export type ViewDef = {
  id: ViewId;
  label: string;
  subtitle: string;
  icon: ReactNode;
};

type SidebarProps = {
  views: readonly ViewDef[];
  active: ViewId;
  onSelect: (id: ViewId) => void;
  info: AppInfo | null;
  status: ServiceStatus | null;
  onPausedChange?: (paused: boolean) => void;
};

export default function Sidebar({ views, active, onSelect, info, status, onPausedChange }: SidebarProps) {
  const [owned, setOwned] = useState(false); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { void managedService().then(setOwned).catch(() => setOwned(false)); }, [status?.state]);
  const control = async (action: () => Promise<string>) => { setBusy(true); try { setMessage(await action()); setOwned(await managedService()); } catch (e) { setMessage(String(e)); } finally { setBusy(false); } };
  const togglePause = async () => {
    setBusy(true);
    try { const r = await (status?.paused ? resumeService() : pauseService()); setMessage(""); onPausedChange?.(r.paused); }
    catch (e) { setMessage(String(e)); }
    finally { setBusy(false); }
  };
  const state = status?.state ?? "loading";
  const label = status ? serviceLabel(status.state) : "—";
  const dotClass = state === "connected" ? "dot dot-ok" : "dot";

  return (
    <aside className="sidebar">
      <div className="brand">
        <Mark />
        <div>
          <div className="brand-name">MILO</div>
          <div className="brand-sub">local agent</div>
        </div>
      </div>

      <nav className="nav" aria-label="Primary">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            className="nav-item"
            aria-current={view.id === active ? "page" : undefined}
            onClick={() => onSelect(view.id)}
          >
            {view.icon}
            <span>{view.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="section-label">Service</div>
        <div className="service-row">
          <span className={dotClass} role="img" aria-label={`Service status: ${label}`} />
          <span className="mono">{label}</span>
        </div>
        {status?.message && <div className="mono faint" role="status">{status.message}</div>}
        {state === "connected" && (
          <>
            <div className="mono" role="status">{status?.paused ? "Paused" : "Running"}</div>
            <button className="btn" disabled={busy} onClick={() => void togglePause()}>{status?.paused ? "Resume" : "Pause"}</button>
          </>
        )}
        {state === "connected" && owned && <button className="btn" disabled={busy} onClick={() => void control(stopService)}>Stop service</button>}
        {state !== "connected" && <button className="btn" disabled={busy} onClick={() => void control(startService)}>Start service</button>}
        {message && <div className="mono faint" role="status">{message}</div>}
        <div className="mono faint">{info ? (info.version === "unavailable" ? "version unavailable" : `v${info.version}`) : "—"}</div>
      </div>
    </aside>
  );
}
