import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import TitleBar from "./components/TitleBar.tsx";
import Sidebar from "./components/Sidebar.tsx";
import type { ViewDef, ViewId } from "./components/Sidebar.tsx";
import StatusBar from "./components/StatusBar.tsx";
import ChatView from "./components/ChatView.tsx";
import TasksView from "./components/TasksView.tsx";
import GoalsView from "./components/GoalsView.tsx";
import MemoryView from "./components/MemoryView.tsx";
import SettingsView from "./components/SettingsView.tsx";
import SkillsView from "./components/SkillsView.tsx";
import SchedulesView from "./components/SchedulesView.tsx";
import PermissionsView from "./components/PermissionsView.tsx";
import WelcomeIntro from "./intro/WelcomeIntro.tsx";
import { ChatIcon, GoalsIcon, PermissionsIcon, TasksIcon } from "./components/Icons.tsx";
import { getAppInfo, getServiceStatus, listTasks, createTask, eventsCursor, listEvents } from "./lib/milo.ts";
import type { AppInfo, ServiceStatus, Task, ServiceEvent } from "./lib/milo.ts";

const VIEWS: readonly ViewDef[] = [
  { id: "chat", label: "Chat", subtitle: "Talk to the agent.", icon: <ChatIcon /> },
  { id: "tasks", label: "Tasks", subtitle: "Work the agent is doing or has done.", icon: <TasksIcon /> },
  { id: "goals", label: "Goals", subtitle: "Longer-running objectives.", icon: <GoalsIcon /> },
  { id: "memory", label: "Memory", subtitle: "Saved context and preferences.", icon: <GoalsIcon /> },
  { id: "schedules", label: "Schedules", subtitle: "Recurring and scheduled tasks.", icon: <TasksIcon /> },
  { id: "skills", label: "Skills", subtitle: "Review suggested workflows.", icon: <GoalsIcon /> },
  { id: "settings", label: "Settings", subtitle: "Configure inference and task limits.", icon: <PermissionsIcon /> },
  { id: "permissions", label: "Permissions", subtitle: "What the agent is allowed to touch.", icon: <PermissionsIcon /> },
];

const isMac = /Mac/i.test(navigator.platform || navigator.userAgent);

export default function App() {
  // Launch shows the intro; the single workspace opens only when the user presses its button.
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState<ViewId>("chat");
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const statusRevision = useRef(0);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [notificationError, setNotificationError] = useState("");

  // Loads during the intro, so the workspace opens with its status already known.
  useEffect(() => {
    let live = true;
    let cursor: number | null = null;
    let polling = false;
    let refreshing = false;
    void getAppInfo().then((result) => live && setInfo(result.value));
    const refresh = async () => {
      if (refreshing) return;
      refreshing = true;
      const revision = statusRevision.current;
      try {
      const result = await getServiceStatus();
      if (!live) return;
      if (revision === statusRevision.current) setStatus(result.value);
      if (result.value.state === "connected") {
        if (!polling) {
          polling = true;
          try {
            if (cursor === null) cursor = (await eventsCursor()).seq;
            else {
              const events = await listEvents(cursor);
              if (events.length) {
                cursor = events[events.length - 1].seq;
                const failure = events.find(e => e.type === "notification.failed");
                if (failure && live) setNotificationError(String((failure.data as { message?: string })?.message ?? "Notification delivery failed"));
              }
            }
          } catch (err) { console.error("Notification event polling failed:", err); }
          finally { polling = false; }
        }
        try { const data = await listTasks(); if (live) setTasks(data); }
        catch { if (live && revision === statusRevision.current) setStatus({ state: "not_connected", message: "Could not read tasks from service" }); }
      }
      } finally { refreshing = false; }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 2000);
    return () => { live = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    let live = true; let dispose: (() => void) | undefined;
    void listen<ServiceEvent>("milo-service-event", ({ payload }) => {
      const id = payload.taskId; if (!id) return;
      const data = payload.data as { content?: unknown; toolCalls?: unknown[]; status?: string } | null;
      if (payload.type === "task.delta" && typeof data?.content === "string") {
        const chunk = data.content;
        setDrafts(current => ({ ...current, [id]: ((current[id] ?? "") + chunk).slice(-65536) }));
      } else if (payload.type === "task.delta_reset" || (payload.type === "task.step" && Array.isArray(data?.toolCalls) && data.toolCalls.length > 0) || (payload.type === "task.status" && data?.status !== "running")) {
        setDrafts(current => { const next = { ...current }; delete next[id]; return next; });
      }
    }).then(unlisten => { if (live) dispose = unlisten; else unlisten(); }).catch(() => {});
    return () => { live = false; dispose?.(); };
  }, []);

  if (!entered) {
    return <WelcomeIntro onEnter={() => setEntered(true)} />;
  }

  const current = VIEWS.find((v) => v.id === view) ?? VIEWS[0];
  const connected = status?.state === "connected";

  return (
    <div className="app" data-native-titlebar={isMac ? "macos" : "other"}>
      <TitleBar />
      <Sidebar views={VIEWS} active={view} onSelect={setView} info={info} status={status} onPausedChange={(paused) => { statusRevision.current++; setStatus(cur => cur ? { ...cur, paused } : cur); }} />
      <main className="main">
        <div className="main-head">
          <h1 className="main-title">{current.label}</h1>
          <p className="main-sub">{current.subtitle}</p>
        </div>
        <section className="frame" aria-label={current.label}>
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          {notificationError && <p role="alert">Notification delivery failed: {notificationError} <button className="btn" onClick={() => setNotificationError("")}>Dismiss</button></p>}
          {view === "chat" && <ChatView connected={connected} tasks={tasks} drafts={drafts} onSubmit={async (goal) => { const task = await createTask(goal); setTasks((current) => [...current.filter((item) => item.id !== task.id), task]); }} />}
          {view === "tasks" && <TasksView tasks={tasks} connected={connected} />}
          {view === "goals" && <GoalsView connected={connected} />}
          {view === "memory" && <MemoryView connected={connected} />}
          {view === "schedules" && <SchedulesView connected={connected} />}
          {view === "skills" && <SkillsView connected={connected} />}
          {view === "settings" && <SettingsView connected={connected} />}
          {view === "permissions" && <PermissionsView connected={connected} />}
        </section>
      </main>
      <StatusBar viewLabel={current.label} info={info} status={status} />
      <div className="scanlines" aria-hidden="true" />
    </div>
  );
}
