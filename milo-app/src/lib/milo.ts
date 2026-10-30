import { invoke } from "@tauri-apps/api/core";

export type AppInfo = {
  name: string;
  version: string;
  platform: string;
  arch: string;
};

export type ServiceStatus = {
  state: string;
  message: string;
  inference?: string | null;
  model?: string | null;
  inferenceReady?: boolean;
  pendingApprovals?: number;
  busy?: boolean;
  paused?: boolean;
};

// A result carries `available: false` when the Tauri backend could not be reached
// (for example in a plain browser), so the UI can say so instead of crashing.
export type Result<T> = { available: boolean; value: T };

const FALLBACK_INFO: AppInfo = {
  name: "Milo",
  version: "unavailable",
  platform: "unavailable",
  arch: "unavailable",
};

const FALLBACK_STATUS: ServiceStatus = {
  state: "unavailable",
  message: "Desktop backend unavailable",
};

export async function getAppInfo(): Promise<Result<AppInfo>> {
  try {
    return { available: true, value: await invoke<AppInfo>("get_app_info") };
  } catch {
    return { available: false, value: FALLBACK_INFO };
  }
}

export async function getServiceStatus(): Promise<Result<ServiceStatus>> {
  try {
    return { available: true, value: await invoke<ServiceStatus>("get_service_status") };
  } catch {
    return { available: false, value: FALLBACK_STATUS };
  }
}

export function serviceLabel(state: string): string {
  switch (state) {
    case "connected":
      return "Connected";
    case "not_connected":
      return "Not connected";
    case "unavailable":
      return "Unavailable";
    default:
      return state;
  }
}

export type TaskStatus = "queued" | "running" | "waiting_approval" | "needs_review" | "completed" | "failed" | "cancelled" | "interrupted";
export type Task = {
  id: string; goal: string; status: TaskStatus; createdAt: string; updatedAt: string;
  result: string | null; error: string | null; origin: string; scheduleId: string | null; goalId: string | null; steps: number; recoveries: number;
  usage: { inputTokens: number; outputTokens: number; estimated: boolean };
};
export type ToolCallTrace = { callId: string; name: string; arguments: Record<string, unknown>; status: string; tier: string | null; reason: string | null; result: unknown };
export type EffectTrace = { kind: string; target: string | null; state: string; evidence: unknown; createdAt: string; updatedAt: string };
export type TaskDetail = Task & { toolCalls: ToolCallTrace[]; effects: EffectTrace[]; attempts: Array<{ number: number; backend: string; startedAt: string; endedAt: string | null; outcome: string | null }>; approvals: Approval[] };
export type Approval = { id: string; taskId: string; toolCallId: string; tool: string; summary: string; tier: "safe" | "caution" | "dangerous"; reasons: string[]; status: string; createdAt: string; decidedAt: string | null; grantTarget: string | null; goal?: string };
export type Permissions = { fileRoots: string[]; network: boolean; shell: boolean; autoApproveFileWrites: boolean };
export type Misfire = { kind: "skip" } | { kind: "run_once"; maxAgeMs?: number } | { kind: "catch_up"; maxOccurrences: number; maxAgeMs?: number };
export type Schedule = { id: string; goal: string; expression: string; timezone: string; misfire: Misfire; overlap: "skip" | "allow"; enabled: boolean; revision: number; nextFireAt: string | null; lastFireAt: string | null; createdAt: string; updatedAt: string; goalId: string | null };
/** Local short date + time for an ISO timestamp; falls back to the raw value if unparsable. */
export function formatTime(iso: string): string { const d = new Date(iso); return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); }
export type ScheduleSpec = { goal: string; expression: string; timezone?: string; misfire?: Misfire; overlap?: "skip" | "allow"; enabled?: boolean; goalId?: string };
export type MemoryEntry = { id: string; namespace: string; text: string; source: "said" | "saw" | "guess"; taskId: string | null; createdAt: string; updatedAt: string };
export type InferenceSettings = { backend: "mock" | "openai_compatible" | "engine"; baseUrl: string | null; model: string | null; allowRemote: boolean; timeoutMs: number; maxTokens: number; temperature: number; contextTokens: number };
export type Settings = { inference: InferenceSettings; agent: { maxSteps: number; maxRecoveries: number } };
export type ServiceEvent = { seq: number; taskId: string | null; type: string; data: unknown; at: string };

export const ACTIVE_STATUSES: readonly TaskStatus[] = ["queued", "running", "waiting_approval", "needs_review"];

export async function listTasks(): Promise<Task[]> { return invoke<Task[]>("list_tasks"); }
export async function listTasksBefore(before: string): Promise<Task[]> { return invoke<Task[]>("list_tasks_before", { before }); }
export async function createTask(goal: string): Promise<Task> { return invoke<Task>("create_task", { goal }); }
export async function getTask(id: string): Promise<TaskDetail> { return invoke<TaskDetail>("get_task", { id }); }
export async function cancelTask(id: string): Promise<Task> { return invoke<Task>("cancel_task", { id }); }
export async function reviewTask(id: string, action: "resume" | "cancel"): Promise<Task> { return invoke<Task>("review_task", { id, action }); }
export async function listApprovals(): Promise<Approval[]> { return invoke<Approval[]>("list_approvals"); }
export async function decideApproval(id: string, decision: "approve" | "deny", scope: "once" | "task" = "once"): Promise<Approval> { return invoke<Approval>("decide_approval", { id, decision, scope }); }
export async function listSchedules(): Promise<Schedule[]> { return invoke<Schedule[]>("list_schedules"); }
export async function createSchedule(spec: ScheduleSpec): Promise<Schedule> { return invoke<Schedule>("create_schedule", { spec }); }
export async function previewSchedule(expression: string, timezone?: string, count = 5): Promise<{ instants: string[] }> { return invoke("preview_schedule", { spec: { expression, timezone, count } }); }
export async function setScheduleEnabled(id: string, enabled: boolean): Promise<Schedule> { return invoke<Schedule>("set_schedule_enabled", { id, enabled }); }
export async function deleteSchedule(id: string): Promise<{ deleted: boolean }> { return invoke("delete_schedule", { id }); }
export async function listMemory(): Promise<MemoryEntry[]> { return invoke<MemoryEntry[]>("list_memory"); }
export async function addMemory(namespace: "user" | "notes", text: string): Promise<MemoryEntry> { return invoke<MemoryEntry>("add_memory", { namespace, text }); }
export async function deleteMemory(id: string): Promise<{ deleted: boolean }> { return invoke("delete_memory", { id }); }
export async function getPermissions(): Promise<Permissions> { return invoke<Permissions>("get_permissions"); }
export async function setPermissions(patch: Partial<Permissions>): Promise<Permissions> { return invoke<Permissions>("set_permissions", { patch }); }
export async function getSettings(): Promise<Settings> { return invoke<Settings>("get_settings"); }
export async function setSettings(patch: { inference?: Partial<InferenceSettings>; agent?: Partial<Settings["agent"]> }): Promise<Settings> { return invoke<Settings>("set_settings", { patch }); }
export async function listEvents(after: number, taskId?: string): Promise<ServiceEvent[]> { return invoke<ServiceEvent[]>("list_events", { after, taskId: taskId ?? null }); }
export async function pauseService(): Promise<{ paused: boolean }> { return invoke("pause_service"); }
export async function resumeService(): Promise<{ paused: boolean }> { return invoke("resume_service"); }
export type GoalStatus = "active" | "paused" | "achieved" | "archived";
export type Goal = { id: string; title: string; description: string; status: GoalStatus; notes: string; createdAt: string; updatedAt: string };
export type GoalSummary = Goal & { tasks: { total: number; completed: number; active: number }; schedules: number };
export async function listGoals(): Promise<GoalSummary[]> { return invoke<GoalSummary[]>("list_goals"); }
export async function getGoal(id: string): Promise<Goal & { tasks: Task[] }> { return invoke("get_goal", { id }); }
export async function createGoal(title: string, description = ""): Promise<Goal> { return invoke<Goal>("create_goal", { title, description }); }
export async function updateGoal(patch: { id: string; title?: string; description?: string; notes?: string; status?: GoalStatus }): Promise<Goal> { return invoke<Goal>("update_goal", { patch }); }
export async function createGoalTask(goal: string, goalId: string): Promise<Task> { return invoke<Task>("create_goal_task", { goal, goalId }); }

export type SkillProposal = { id: string; taskId: string; name: string; content: string; status: "pending" | "accepted" | "rejected" | "revoked"; createdAt: string; decidedAt: string | null };
export async function listSkillProposals(): Promise<SkillProposal[]> { return invoke("list_skill_proposals"); }
export async function decideSkillProposal(id: string, decision: "accept" | "reject" | "revoke"): Promise<SkillProposal> { return invoke("decide_skill_proposal", { id, decision }); }

export async function startService(): Promise<string> { return invoke("start_service"); }
export async function stopService(): Promise<string> { return invoke("stop_service"); }
export async function managedService(): Promise<boolean> { return invoke("managed_service"); }

export async function eventsCursor(): Promise<{ seq: number }> { return invoke("events_cursor"); }

export type NotificationSettings = { enabled: boolean; available: boolean; lastError: string | null };
export async function getNotifications(): Promise<NotificationSettings> { return invoke("get_notifications"); }
export async function setNotifications(enabled: boolean): Promise<NotificationSettings> { return invoke("set_notifications", { enabled }); }

export async function requestNotifications(): Promise<{ granted: boolean }> { return invoke("request_notifications"); }
