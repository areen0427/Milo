import type { AppInfo, ServiceStatus } from "../lib/milo.ts";
import { serviceLabel } from "../lib/milo.ts";

type StatusBarProps = {
  viewLabel: string;
  info: AppInfo | null;
  status: ServiceStatus | null;
};

export default function StatusBar({ viewLabel, info, status }: StatusBarProps) {
  const platform = info ? `${info.platform} / ${info.arch}` : "—";
  const service = status ? serviceLabel(status.state) : "—";
  const ready = status?.state === "connected";

  return (
    <footer className="statusbar">
      <span>{ready ? "READY" : viewLabel.toUpperCase()}</span>
      <span>
        {platform}
        <span className="statusbar-sep">·</span>
        {service}
      </span>
    </footer>
  );
}
