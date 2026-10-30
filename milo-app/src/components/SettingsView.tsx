import { useEffect, useState } from "react";
import { getSettings, setSettings } from "../lib/milo.ts";
import type { Settings } from "../lib/milo.ts";
export default function SettingsView({ connected }: { connected: boolean }) {
  const [settings, setForm] = useState<Settings | null>(null); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { let live = true; if (connected) void getSettings().then(s => { if (live) setForm(s); }).catch(e => { if (live) setError(String(e)); }); return () => { live = false; }; }, [connected]);
  if (!connected) return <p className="muted">Start the local service to configure Milo.</p>;
  if (!settings) return <p role={error ? "alert" : undefined}>{error || "Loading settings…"}</p>;
  const update = (patch: Partial<Settings["inference"]>) => setForm(s => s && ({ ...s, inference: { ...s.inference, ...patch } }));
  const save = async () => { setSaving(true); setError(""); setMessage(""); try { setForm(await setSettings(settings)); setMessage("Settings saved. The next task uses them."); } catch (e) { setError(String(e)); } finally { setSaving(false); } };
  return <div className="workspace-list"><form onSubmit={e => { e.preventDefault(); void save(); }}>
    <label>Inference backend <select value={settings.inference.backend} onChange={e => update({ backend: e.target.value as Settings["inference"]["backend"] })}><option value="mock">Mock (no model)</option><option value="openai_compatible">OpenAI-compatible server</option><option value="engine">Milo engine (not installed)</option></select></label>
    {settings.inference.backend === "openai_compatible" && <><label>Server URL <input type="url" value={settings.inference.baseUrl ?? ""} placeholder="http://127.0.0.1:11434/v1" required onChange={e => update({ baseUrl: e.target.value || null })} /></label><label>Model <input value={settings.inference.model ?? ""} required onChange={e => update({ model: e.target.value || null })} /></label><label><span>Send prompts to a remote server</span><input type="checkbox" checked={settings.inference.allowRemote} onChange={e => update({ allowRemote: e.target.checked })} /></label></>}
    <label>Context tokens <input type="number" min={1024} max={1048576} step={1} value={settings.inference.contextTokens} onChange={e => update({ contextTokens: e.target.valueAsNumber })} required /></label>
    <label>Output tokens <input type="number" min={16} max={32768} step={1} value={settings.inference.maxTokens} onChange={e => update({ maxTokens: e.target.valueAsNumber })} required /></label>
    <label>Task step limit <input type="number" min={1} max={90} step={1} value={settings.agent.maxSteps} onChange={e => setForm(s => s && ({ ...s, agent: { ...s.agent, maxSteps: e.target.valueAsNumber } }))} required /></label>
    <button className="btn btn-primary" disabled={saving}>Save settings</button>
    </form><p className="muted">Remote inference sends task text and tool results to the selected server. API keys are configured in the service environment, not stored here.</p>{message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}</div>;
}
