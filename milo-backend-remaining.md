# Milo backend: remaining work (working checklist)

Resumable checklist for the work that follows [milo-backend-implementation.md](milo-backend-implementation.md). A session resuming after a usage reset continues from the first unchecked item. Each item ends with `npm test` + `npm run typecheck` in `milo-service/` (and `cargo test` / `npx tsc -b` in `milo-app/` when the app is touched), then a tick here and a line in the decision log.

Priority order: inference pipeline first (the custom engine needs it), then safety gaps, then product features, then packaging.

- [x] 1. **Streaming inference**: `stream()` on the OpenAI-compatible backend (SSE), agent uses it when available, `task.delta` events (throttled, not persisted per token), final text persisted as before. Mock implements `stream` too.
- [x] 2. **Context budget / compaction**: estimate prompt tokens; when over the model's budget, elide old tool results in the *prompt only* (message log untouched); setting `contextTokens`.
- [x] 3. **Usage accounting**: tokens per attempt and per task (`attempts.input_tokens/output_tokens`), shown in `tasks.get` and `health` totals.
- [x] 4. **Pinned-address web_fetch**: resolve + SSRF-check inside the socket `lookup`, so the connection uses the validated address (closes DNS TOCTOU).
- [x] 5. **Task-scoped approval grants**: "approve for this task" for the same tool + target (never for `dangerous`).
- [x] 6. **Pause/resume service**: `service.pause/resume` stops admitting new work (scheduler still records occurrences), persisted; health shows paused + process memory.
- [x] 7. **Honesty check**: after a task completes, compare action claims in the final answer to the tool trace; record a finding and append a correction note when the answer claims an action that failed or never ran.
- [x] 8. **Goals**: `goals.*` (create/list/update/archive), tasks and schedules link to a goal, goal context and recent task outcomes injected into linked tasks' prompts.
- [x] 9. **App screens**: Goals, Memory, Schedules views wired to the service; Tasks view detail (trace, cancel, review).
- [x] 10. **Skills**: load `SKILL.md` skills from `<serviceDir>/../skills`, `skill_list`/`skill_read` tools; skill proposals from successful multi-step tasks stored as untrusted proposals the user must accept.
- [x] 11. **App supervises the service**: the Tauri app starts the service if it isn't running (dev: `node`; packaged: sidecar), shows start/stop.
- [x] 12. **Packaging**: build the service into a single executable (Node SEA), ad-hoc sign it, ship it as a Tauri sidecar. Notarization needs an Apple Developer account and stays blocked.
- [x] 13. **Notifications**: notify on task completion / approval needed (permission-gated).

## Log

(append one line per completed item: date, item, result)
- 2026-10-30 · 1 streaming: SSE parser + StreamAccumulator, mock streams, live `task.delta` (transient, batched ~48 chars/60 ms, hidden when text looks like a tool call), `task.delta_reset` on retry. 
- 2026-10-30 · 2 compaction: `src/context.ts`, `inference.contextTokens` (default 8192); prompt-only elision of older tool results then older replies; `context.compacted` event; fails honestly if still too big.
- 2026-10-30 · 3 usage: schema v2 migration (additive, idempotent); per-task and per-attempt tokens, estimated (flagged) when the backend reports none; totals in `health`.
- 2026-10-30 · 4 pinned fetch: `node:http(s)` with a guarded socket `lookup` (rejects blocked addresses at connect time), `agent: false`; rebinding test; live https://example.com check OK.
- 2026-10-30 · 5 task grants: `approvals.decide {scope: "task"}` → `approval_grants`; later calls were originally tool-wide (superseded by target-scoped grants below); dangerous refuses task scope. CLI `approve --task`, app "Approve for task".
- 2026-10-30 · 6 pause: persisted `service.paused`; worker stops admitting, running task requeued at next step boundary; health adds paused, RSS/heap, uptime, DB size, usage totals; CLI pause/resume; Rust commands.
- 2026-10-30 · 7 honesty: `src/honesty.ts` claim patterns (write/command/fetch/memory) vs succeeded tool calls; hedged/negated sentences ignored; finding → `honesty.finding` event + appended "Milo check" note on the result.
- 2026-10-30 · 8 goals: `src/goals.ts`, schema v3 (`goals`, `tasks.goal_id`, `schedules.goal_id`); `goals.create/list/get/update`; `tasks.create`/`schedules.create` accept `goalId` (active goals only); goal + 5 recent outcomes injected into linked prompts; pausing/closing a goal disables its schedules; CLI `milo goal …`, `ask --goal`, `schedule add --goal`; Rust + TS bindings.
- 2026-10-30 · Stopped near the 5-hour limit; continuation scheduled for 03:52Z. Next: item 9 (app screens).

- 2026-10-30 · 9 app screens: goals and linked tasks, memory, schedules with goal linking and preview, task traces, cancellation and uncertain-effect review; app production build and existing bridge tests pass. Visual verification pending.
- 2026-10-30 · 10 partial: skill_list and skill_read load bounded user-installed SKILL.md files, reject symlinks and traversal; proposal generation and acceptance remain.
- 2026-10-30 · 10 skills: successful multi-tool traces create inert candidates with tool names only; SQLite-backed acceptance/rejection in the app activates accepted references without granting permissions. 55 service tests, app build and Rust bridge tests pass.
- 2026-10-30 · 11 supervision: app startup connects or starts the sidecar/dev service; UI can stop only the child started by this app instance, avoiding interference with independently managed services. Rust integration checks both cases.
- 2026-10-30 · 12 packaging: Node SEA sidecar, authenticated health smoke test, architecture check, ad-hoc signing and Tauri macOS bundle; no notarization.
- 2026-10-30 · 13 partial: opt-in task-complete and approval notifications while the app is open; OS permission required. Background delivery still needs implementation.
- 2026-10-30 · safety correction: task-scoped approvals now bind to one resolved file target; old broad grants are inactive and changed symlink targets invalidate pending approvals.
- 2026-10-30 · 13 implementation: native helper requests macOS authorization only on explicit UI action; service opt-in persists and sends generic notifications for committed events even when the app closes. Helper identity and service socket verified in signed bundle; actual OS authorization/delivery still needs user-driven verification.
- 2026-10-30 · verification caveats: native macOS delivery/authorization and visual inspection of the new screens require a usable lane window and user interaction with the OS prompt; helper status and bundle identity were checked without prompting. The custom inference engine, notarization and full licensing review remain future work.
- 2026-10-30 · verification pass (4 reviewers): fixed streaming early-EOF, mid-stream error chunks and split fence leaks; SIIT SSRF range; file_write re-checks its target; honesty phrasing false negatives/positives; pause now checked before tool calls; goal outcomes one-line; `managed_service` moved off the main thread. Service 88/88 tests, typecheck, app build, cargo test pass. Sidecar rebuilt (`MILO_SEA_NODE` official Node) and `package:mac` re-run; smoke test passes. Still user-driven: GUI rendering and native notification authorization/delivery.
- 2026-10-30 · remaining-work pass: app pause control (Sidebar); streaming idle timeout + hard ceiling (not retried); prompt compaction elides older tool-call arguments; `context.compacted` only on change; goals/schedules UI fixes (linked tasks, goal link, local times, stale-load guard); pause checked before each tool call; sidebar fits 960x620. Browser visual check passed with shim fixtures. Service 97/97, typecheck, app build, cargo test, `package:mac` pass. Native window and notification delivery remain unverified (ADE lane display driver failed; OS authorization needs your approval). Deferred with decisions 47–52 in milo-backend-implementation.md: session grants, SMAppService login registration (needs your approval), notarization (no account), multi-user isolation.
- 2026-10-30 · verification audit: shell now always requires approval and records an effect; corrected deletion evidence, retry pause/cancel and fatal worker handling, unavailable schedule goal selection, and stale pause status. Service 100/100, typecheck, Rust 3/3 and `package:mac` pass; socket tests required execution outside the sandbox. Native window and notification delivery remain unverified; no new native visual test was performed.
