//! Milo desktop client for the local service (protocol v2).
//! Each command maps to one service method; the webview cannot call arbitrary methods.
use serde::Serialize;
use serde_json::{json, Value};
use std::io::{BufRead, BufReader, Write};
use std::time::Duration;
use std::sync::Mutex;
use std::process::{Child, Command, Stdio};
use tauri::{Emitter, Manager};

const PROTOCOL: u64 = 2;
const MAX_RESPONSE: u64 = 8 * 1024 * 1024;

#[derive(Serialize, Clone)]
pub struct AppInfo { name: String, version: String, platform: String, arch: String }
#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ServiceStatus { state: String, message: String, inference: Option<String>, model: Option<String>, inference_ready: bool, pending_approvals: u64, busy: bool, paused: bool }

impl ServiceStatus {
    fn down(state: &str, message: String) -> Self {
        ServiceStatus { state: state.into(), message, inference: None, model: None, inference_ready: false, pending_approvals: 0, busy: false, paused: false }
    }
}

pub fn app_info() -> AppInfo {
    AppInfo { name: "Milo".into(), version: env!("CARGO_PKG_VERSION").into(), platform: std::env::consts::OS.into(), arch: std::env::consts::ARCH.into() }
}

fn service_dir() -> Result<std::path::PathBuf, String> {
    Ok(match std::env::var_os("MILO_SERVICE_DIR") {
        Some(dir) => std::path::PathBuf::from(dir),
        None => std::path::PathBuf::from(std::env::var_os("HOME").ok_or("Home directory unavailable")?).join("Library/Application Support/Milo/service"),
    })
}

#[cfg(unix)]
fn service_call(method: &str, params: Value) -> Result<Value, String> {
    use std::io::Read;
    use std::os::unix::net::UnixStream;
    let dir = service_dir()?;
    let mut stream = UnixStream::connect(dir.join("service.sock")).map_err(|_| "Milo service is not running or cannot be reached".to_string())?;
    // The token rotates on each service start, so read it per call.
    let token = std::fs::read_to_string(dir.join("auth.token")).map_err(|_| "Milo service token is unavailable".to_string())?;
    stream.set_read_timeout(Some(Duration::from_secs(if method == "notifications.request" { 130 } else { 5 }))).map_err(|e| e.to_string())?;
    stream.set_write_timeout(Some(Duration::from_secs(2))).map_err(|e| e.to_string())?;
    let request = json!({"id": 1, "auth": token.trim(), "method": method, "params": params});
    writeln!(stream, "{}", request).map_err(|e| format!("Service request failed: {e}"))?;
    let mut reader = BufReader::new(stream);
    let mut response = String::new();
    reader.by_ref().take(MAX_RESPONSE).read_line(&mut response).map_err(|e| format!("Service response failed: {e}"))?;
    if !response.ends_with('\n') { return Err("Invalid or oversized service response".into()); }
    let reply: Value = serde_json::from_str(&response).map_err(|_| "Invalid service response")?;
    if reply.get("id") != Some(&json!(1)) { return Err("Mismatched service response".into()); }
    if let Some(error) = reply.get("error") { return Err(error.as_str().unwrap_or("Service error").to_string()); }
    reply.get("result").cloned().ok_or_else(|| "Missing service result".into())
}
#[cfg(not(unix))]
fn service_call(_: &str, _: Value) -> Result<Value, String> { Err("The development service requires Unix sockets".into()) }

pub fn service_status() -> ServiceStatus {
    match service_call("health", json!({})) {
        Ok(r) if r["service"] == "milo" && r["protocol"] == PROTOCOL => {
            let inference = r["inference"].as_str().map(String::from);
            let model = r["model"].as_str().map(String::from);
            let ready = r["inferenceReady"].as_bool().unwrap_or(false);
            let message = match (inference.as_deref(), ready) {
                (Some("mock"), _) => "Connected · placeholder mode (no model)".to_string(),
                (_, true) => format!("Connected · {}", model.clone().unwrap_or_else(|| "model".into())),
                (_, false) => format!("Connected · model unavailable: {}", r["inferenceMessage"].as_str().unwrap_or("unknown")),
            };
            let paused = r["paused"].as_bool().unwrap_or(false);
            let message = if paused { format!("{message} · paused") } else { message };
            let message = if r["serviceVersion"].as_str() != Some("0.3.0") { format!("{message} · service update requires restart") } else { message };
            ServiceStatus { state: "connected".into(), message, inference, model, inference_ready: ready, pending_approvals: r["pendingApprovals"].as_u64().unwrap_or(0), busy: r["worker"]["busy"].as_bool().unwrap_or(false), paused }
        }
        Ok(_) => ServiceStatus::down("not_connected", "Incompatible service protocol".into()),
        Err(message) => ServiceStatus::down("not_connected", message),
    }
}

// Only the process this app instance created can be stopped from its UI. Existing
// login agents and services started by other clients remain independently owned.
#[derive(Default)]
struct Supervisor { process: Mutex<Option<Child>>, last_error: Mutex<Option<String>> }

fn service_command() -> Result<Command, String> {
    let executable = std::env::current_exe().map_err(|e| e.to_string())?;
    let sidecar = executable.parent().ok_or("Application executable directory unavailable")?.join("milo-service");
    if sidecar.is_file() { return Ok(Command::new(sidecar)); }
    if cfg!(debug_assertions) {
        let script = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../milo-service/service.ts");
        if !script.is_file() { return Err("Development service source not found".into()); }
        let mut command = Command::new(std::env::var_os("MILO_NODE").unwrap_or_else(|| "node".into()));
        command.arg("--experimental-strip-types").arg("--no-warnings").arg(script);
        return Ok(command);
    }
    Err("Bundled Milo service is missing".into())
}

fn start_managed_service(supervisor: &Supervisor) -> Result<String, String> {
    let mut child = supervisor.process.lock().map_err(|_| "Service supervisor unavailable")?;
    if service_status().state == "connected" { return Ok("Milo service is already running".into()); }
    #[cfg(unix)]
    if std::os::unix::net::UnixStream::connect(service_dir()?.join("service.sock")).is_ok() {
        return Err("A service is listening but could not be authenticated or uses an incompatible protocol".into());
    }
    if let Some(existing) = child.as_mut() {
        if existing.try_wait().map_err(|e| e.to_string())?.is_none() { return Err("The service is starting but is not ready yet".into()); }
    }
    let mut command = service_command()?;
    let process = command.stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null()).spawn().map_err(|e| format!("Could not start Milo service: {e}"))?;
    *child = Some(process);
    for _ in 0..100 {
        if service_status().state == "connected" { return Ok("Milo service started".into()); }
        if let Some(status) = child.as_mut().unwrap().try_wait().map_err(|e| e.to_string())? {
            *child = None;
            return Err(format!("Milo service exited during startup: {status}. Run the service manually for diagnostics."));
        }
        std::thread::sleep(Duration::from_millis(50));
    }
    Err("Milo service did not become ready within five seconds".into())
}

fn stop_managed_service(supervisor: &Supervisor) -> Result<String, String> {
    let mut child = supervisor.process.lock().map_err(|_| "Service supervisor unavailable")?;
    let process = child.as_mut().ok_or("This app did not start the running service; stop it using the client that started it")?;
    if process.try_wait().map_err(|e| e.to_string())?.is_none() {
        #[cfg(unix)]
        if unsafe { libc::kill(process.id() as libc::pid_t, libc::SIGTERM) } != 0 { return Err(format!("Could not stop service: {}", std::io::Error::last_os_error())); }
        #[cfg(not(unix))]
        return Err("Stopping the service is supported on Unix only".into());
        for _ in 0..100 {
            if process.try_wait().map_err(|e| e.to_string())?.is_some() { *child = None; return Ok("Milo service stopped".into()); }
            std::thread::sleep(Duration::from_millis(50));
        }
        return Err("Milo service has not stopped yet".into());
    }
    *child = None;
    Ok("Milo service already stopped".into())
}

// A separate bounded connection forwards live events; missed transient text is never replayed.
#[cfg(unix)]
fn forward_events(app: tauri::AppHandle) {
    use std::io::Read;
    use std::os::unix::net::UnixStream;
    loop {
        let listen = || -> Result<(), String> {
            let dir = service_dir()?;
            let token = std::fs::read_to_string(dir.join("auth.token")).map_err(|e| e.to_string())?;
            let mut stream = UnixStream::connect(dir.join("service.sock")).map_err(|e| e.to_string())?;
            stream.set_read_timeout(Some(Duration::from_secs(15))).map_err(|e| e.to_string())?;
            stream.set_write_timeout(Some(Duration::from_secs(2))).map_err(|e| e.to_string())?;
            writeln!(stream, "{}", json!({"id": 1, "auth": token.trim(), "method": "events.subscribe", "params": {}})).map_err(|e| e.to_string())?;
            let mut reader = BufReader::new(stream);
            loop {
                let mut line = String::new();
                reader.by_ref().take(MAX_RESPONSE).read_line(&mut line).map_err(|e| e.to_string())?;
                if !line.ends_with('\n') { return Err("Event connection closed or exceeded size limit".into()); }
                let parsed: Value = serde_json::from_str(&line).map_err(|e| e.to_string())?;
                if parsed.get("error").is_some() { return Err("Event subscription rejected".into()); }
                if let Some(event) = parsed.get("event") { let _ = app.emit("milo-service-event", event); }
            }
        };
        let _ = listen();
        std::thread::sleep(Duration::from_secs(1));
    }
}

fn start_with_diagnostics(supervisor: &Supervisor) -> Result<String, String> {
    let result = start_managed_service(supervisor);
    if let Ok(mut last_error) = supervisor.last_error.lock() { *last_error = result.as_ref().err().cloned(); }
    result
}
#[tauri::command]
async fn start_service(state: tauri::State<'_, Supervisor>) -> Result<String, String> { start_with_diagnostics(&state) }
#[tauri::command]
async fn stop_service(state: tauri::State<'_, Supervisor>) -> Result<String, String> { stop_managed_service(&state) }
#[tauri::command]
async fn managed_service(state: tauri::State<'_, Supervisor>) -> Result<bool, String> {
    // Async so waiting on the supervisor lock during service startup cannot block the main thread.
    Ok(state.process.lock().ok().and_then(|mut c| c.as_mut().map(|p| matches!(p.try_wait(), Ok(None)))).unwrap_or(false))
}

#[tauri::command]
fn get_app_info() -> AppInfo { app_info() }
#[tauri::command]
async fn get_service_status(state: tauri::State<'_, Supervisor>) -> Result<ServiceStatus, String> {
    let mut status = service_status();
    if status.state != "connected" {
        if let Ok(error) = state.last_error.lock() { if let Some(message) = error.as_ref() { status.message = message.clone(); } }
    }
    Ok(status)
}
#[tauri::command]
async fn list_tasks() -> Result<Value, String> { service_call("tasks.list", json!({})) }
#[tauri::command]
async fn list_tasks_before(before: String) -> Result<Value, String> { service_call("tasks.list", json!({"before": before})) }
#[tauri::command]
async fn create_task(goal: String) -> Result<Value, String> { service_call("tasks.create", json!({"goal": goal})) }
#[tauri::command]
async fn get_task(id: String) -> Result<Value, String> { service_call("tasks.get", json!({"id": id, "detail": true})) }
#[tauri::command]
async fn cancel_task(id: String) -> Result<Value, String> { service_call("tasks.cancel", json!({"id": id})) }
#[tauri::command]
async fn review_task(id: String, action: String) -> Result<Value, String> { service_call("tasks.review", json!({"id": id, "action": action})) }
#[tauri::command]
async fn list_approvals() -> Result<Value, String> { service_call("approvals.list", json!({"status": "pending"})) }
#[tauri::command]
async fn decide_approval(id: String, decision: String, scope: Option<String>) -> Result<Value, String> { service_call("approvals.decide", json!({"id": id, "decision": decision, "scope": scope.unwrap_or_else(|| "once".into())})) }
#[tauri::command]
async fn list_schedules() -> Result<Value, String> { service_call("schedules.list", json!({})) }
#[tauri::command]
async fn create_schedule(spec: Value) -> Result<Value, String> { service_call("schedules.create", spec) }
#[tauri::command]
async fn preview_schedule(spec: Value) -> Result<Value, String> { service_call("schedules.preview", spec) }
#[tauri::command]
async fn set_schedule_enabled(id: String, enabled: bool) -> Result<Value, String> { service_call("schedules.setEnabled", json!({"id": id, "enabled": enabled})) }
#[tauri::command]
async fn delete_schedule(id: String) -> Result<Value, String> { service_call("schedules.delete", json!({"id": id})) }
#[tauri::command]
async fn list_memory() -> Result<Value, String> { service_call("memory.list", json!({})) }
#[tauri::command]
async fn add_memory(namespace: String, text: String) -> Result<Value, String> { service_call("memory.add", json!({"namespace": namespace, "text": text})) }
#[tauri::command]
async fn delete_memory(id: String) -> Result<Value, String> { service_call("memory.delete", json!({"id": id})) }
#[tauri::command]
async fn get_permissions() -> Result<Value, String> { service_call("permissions.get", json!({})) }
#[tauri::command]
async fn set_permissions(patch: Value) -> Result<Value, String> { service_call("permissions.set", patch) }
#[tauri::command]
async fn get_settings() -> Result<Value, String> { service_call("settings.get", json!({})) }
#[tauri::command]
async fn set_settings(patch: Value) -> Result<Value, String> { service_call("settings.set", patch) }
#[tauri::command]
async fn list_skill_proposals() -> Result<Value, String> { service_call("skills.proposals.list", json!({})) }
#[tauri::command]
async fn decide_skill_proposal(id: String, decision: String) -> Result<Value, String> { service_call("skills.proposals.decide", json!({"id": id, "decision": decision})) }
#[tauri::command]
async fn list_goals() -> Result<Value, String> { service_call("goals.list", json!({})) }
#[tauri::command]
async fn get_goal(id: String) -> Result<Value, String> { service_call("goals.get", json!({"id": id})) }
#[tauri::command]
async fn create_goal(title: String, description: String) -> Result<Value, String> { service_call("goals.create", json!({"title": title, "description": description})) }
#[tauri::command]
async fn update_goal(patch: Value) -> Result<Value, String> { service_call("goals.update", patch) }
#[tauri::command]
async fn create_goal_task(goal: String, goal_id: String) -> Result<Value, String> { service_call("tasks.create", json!({"goal": goal, "goalId": goal_id})) }
#[tauri::command]
async fn pause_service() -> Result<Value, String> { service_call("service.pause", json!({})) }
#[tauri::command]
async fn resume_service() -> Result<Value, String> { service_call("service.resume", json!({})) }
#[tauri::command]
async fn get_notifications() -> Result<Value, String> { service_call("notifications.get", json!({})) }
#[tauri::command]
async fn request_notifications() -> Result<Value, String> { service_call("notifications.request", json!({})) }
#[tauri::command]
async fn set_notifications(enabled: bool) -> Result<Value, String> { service_call("notifications.set", json!({"enabled": enabled})) }
#[tauri::command]
async fn events_cursor() -> Result<Value, String> { service_call("events.cursor", json!({})) }
#[tauri::command]
async fn list_events(after: u64, task_id: Option<String>) -> Result<Value, String> {
    let mut params = json!({"after": after});
    if let Some(id) = task_id { params["taskId"] = json!(id); }
    service_call("events.list", params)
}

pub fn run() {
    tauri::Builder::default()
        .manage(Supervisor::default())
        .setup(|app| {
            #[cfg(unix)]
            { let handle = app.handle().clone(); std::thread::spawn(move || forward_events(handle)); }
            let handle = app.handle().clone();
            std::thread::spawn(move || { let state = handle.state::<Supervisor>(); if let Err(e) = start_with_diagnostics(&state) { eprintln!("Milo service startup: {e}"); } });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_info, get_service_status, start_service, stop_service, managed_service, list_tasks, list_tasks_before, create_task, get_task, cancel_task, review_task,
            list_approvals, decide_approval, list_schedules, create_schedule, preview_schedule, set_schedule_enabled, delete_schedule,
            list_memory, add_memory, delete_memory, get_permissions, set_permissions, get_settings, set_settings, get_notifications, request_notifications, set_notifications, events_cursor, list_events, pause_service, resume_service, list_skill_proposals, decide_skill_proposal, list_goals, get_goal, create_goal, update_goal, create_goal_task
        ])
        .run(tauri::generate_context!())
        .expect("error while running Milo");
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn app_info_has_platform_and_arch() { let info = app_info(); assert_eq!(info.name, "Milo"); assert!(!info.platform.is_empty()); assert!(!info.arch.is_empty()); }
    #[test] fn app_info_version_matches_cargo() { assert_eq!(app_info().version, env!("CARGO_PKG_VERSION")); }
    #[cfg(unix)]
    #[test]
    fn bridge_drives_real_service() {
        use std::process::{Command, Stdio};
        use std::os::unix::fs::PermissionsExt;
        let root = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
        let dir = root.join(format!(".milo-test-{}", std::process::id()));
        let files = root.join(format!(".milo-test-files-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::create_dir_all(&files).unwrap();
        std::fs::set_permissions(&dir, std::fs::Permissions::from_mode(0o700)).unwrap();
        let mut child = Command::new("node").arg("--experimental-strip-types").arg("--no-warnings").arg(root.join("milo-service/service.ts")).env("MILO_SERVICE_DIR", &dir).stdout(Stdio::null()).stderr(Stdio::null()).spawn().unwrap();
        std::env::set_var("MILO_SERVICE_DIR", &dir);
        let outcome = std::panic::catch_unwind(|| {
            for _ in 0..200 { if dir.join("auth.token").exists() && dir.join("service.sock").exists() { break; } std::thread::sleep(Duration::from_millis(20)); }
            let status = service_status();
            assert_eq!(status.state, "connected", "{}", status.message);
            assert_eq!(status.inference.as_deref(), Some("mock"));
            let supervisor = Supervisor::default();
            assert!(start_managed_service(&supervisor).unwrap().contains("already running"));
            assert!(stop_managed_service(&supervisor).is_err());
            let created = service_call("tasks.create", json!({"goal": "bridge integration test"})).unwrap();
            let tasks = service_call("tasks.list", json!({})).unwrap();
            assert!(tasks.as_array().unwrap().iter().any(|task| task["id"] == created["id"]));
            // Approval round trip through the bridge.
            service_call("permissions.set", json!({"fileRoots": [files.canonicalize().unwrap()]})).unwrap();
            let goal = "/tool file_write {\"path\":\"bridge.txt\",\"content\":\"ok\"}";
            let task = service_call("tasks.create", json!({"goal": goal})).unwrap();
            let mut approvals = json!([]);
            for _ in 0..100 { approvals = service_call("approvals.list", json!({"status": "pending"})).unwrap(); if !approvals.as_array().unwrap().is_empty() { break; } std::thread::sleep(Duration::from_millis(20)); }
            service_call("approvals.decide", json!({"id": approvals[0]["id"], "decision": "approve"})).unwrap();
            let mut detail = json!({});
            for _ in 0..100 { detail = service_call("tasks.get", json!({"id": task["id"], "detail": true})).unwrap(); if detail["status"] == "completed" { break; } std::thread::sleep(Duration::from_millis(20)); }
            assert_eq!(detail["status"], "completed");
            assert_eq!(std::fs::read_to_string(files.join("bridge.txt")).unwrap(), "ok");
        });
        let _ = child.kill(); let _ = child.wait();
        // Starting and stopping a child is scoped to this supervisor.
        if outcome.is_ok() {
            let supervisor = Supervisor::default();
            assert!(start_managed_service(&supervisor).unwrap().contains("started"));
            assert_eq!(service_status().state, "connected");
            assert!(stop_managed_service(&supervisor).unwrap().contains("stopped"));
        }
        std::env::remove_var("MILO_SERVICE_DIR");
        let _ = std::fs::remove_dir_all(&dir);
        let _ = std::fs::remove_dir_all(&files);
        if let Err(error) = outcome { std::panic::resume_unwind(error); }
    }
}
