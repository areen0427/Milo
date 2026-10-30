import { useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Task } from "../lib/milo.ts";

const MAX_COMPOSER_PX = 6 * 22 + 20; // six 22px lines plus padding and borders

export default function ChatView({ connected, tasks, drafts, onSubmit }: { connected: boolean; tasks: Task[]; drafts: Record<string, string>; onSubmit: (goal: string) => Promise<void> }) {
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow: reset height first so the box can also shrink.
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    // +2 for the 1px borders, which scrollHeight excludes.
    const next = Math.min(el.scrollHeight + 2, MAX_COMPOSER_PX);
    el.style.height = `${next}px`;
    el.style.overflowY = next >= MAX_COMPOSER_PX ? "auto" : "hidden";
  }, [draft]);

  const canSend = connected && !sending && draft.trim().length > 0;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setError("");
    try { await onSubmit(draft.trim()); setDraft(""); }
    catch (err) { setError(String(err)); }
    finally { setSending(false); }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  };

  return (
    <div className="chat">
      <div className="transcript">
        {tasks.length === 0 ? <p className="muted">No requests yet.</p> : tasks.map(task => (
          <article key={task.id}><strong>{task.goal}</strong><p>{task.result ?? task.error ?? (drafts[task.id] ? `Draft: ${drafts[task.id]}` : `Task ${task.status.replace("_", " ")}`)}</p></article>
        ))}
      </div>
      <div className="composer">
        <div className="composer-row">
          <textarea
            ref={areaRef}
            className="composer-input"
            rows={1}
            value={draft}
            placeholder="Message Milo"
            aria-label="Message"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="button" className="btn btn-primary" disabled={!canSend} onClick={() => void send()}>
            Send
          </button>
        </div>
        <p className="composer-caption">
          {error || (connected ? "Placeholder mode: requests create mock tasks; no model or tools run." : "Agent service not connected. Messages are not sent.")}
        </p>
      </div>
    </div>
  );
}
