// SQLite persistence for the Milo service. One process owns the database (see service.ts lock).
// Schema concepts (tasks, attempts, effects, approvals, occurrences) follow Aiden's
// core/v4/daemon/db, rebuilt as a small fresh schema rather than importing its migrations.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

export type DB = InstanceType<typeof DatabaseSync>;
export const SCHEMA_VERSION = 5;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY, goal TEXT NOT NULL, status TEXT NOT NULL,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, result TEXT, error TEXT,
  origin TEXT NOT NULL DEFAULT 'client', schedule_id TEXT, occurrence_id TEXT,
  steps INTEGER NOT NULL DEFAULT 0, recoveries INTEGER NOT NULL DEFAULT 0, cancel_requested INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS tasks_status ON tasks(status, created_at);
CREATE TABLE IF NOT EXISTS task_messages (
  task_id TEXT NOT NULL, seq INTEGER NOT NULL, message_json TEXT NOT NULL, created_at TEXT NOT NULL,
  PRIMARY KEY (task_id, seq));
CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY, task_id TEXT NOT NULL, number INTEGER NOT NULL, backend TEXT NOT NULL,
  started_at TEXT NOT NULL, ended_at TEXT, outcome TEXT);
CREATE TABLE IF NOT EXISTS tool_calls (
  id TEXT PRIMARY KEY, task_id TEXT NOT NULL, call_id TEXT NOT NULL, name TEXT NOT NULL, args_json TEXT NOT NULL,
  status TEXT NOT NULL, tier TEXT, reason TEXT, result_json TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  UNIQUE (task_id, call_id));
CREATE TABLE IF NOT EXISTS effects (
  id TEXT PRIMARY KEY, task_id TEXT NOT NULL, tool_call_id TEXT NOT NULL, kind TEXT NOT NULL, target TEXT,
  state TEXT NOT NULL, reconciliation_json TEXT, evidence_json TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS effects_state ON effects(task_id, state);
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY, task_id TEXT NOT NULL, tool_call_id TEXT NOT NULL, tool TEXT NOT NULL, args_digest TEXT NOT NULL,
  summary TEXT NOT NULL, tier TEXT NOT NULL, reasons_json TEXT NOT NULL, status TEXT NOT NULL,
  created_at TEXT NOT NULL, decided_at TEXT);
CREATE INDEX IF NOT EXISTS approvals_status ON approvals(status);
CREATE TABLE IF NOT EXISTS events (
  seq INTEGER PRIMARY KEY AUTOINCREMENT, task_id TEXT, type TEXT NOT NULL, data_json TEXT NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS memory (
  id TEXT PRIMARY KEY, namespace TEXT NOT NULL, text TEXT NOT NULL, source TEXT NOT NULL, task_id TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY, goal TEXT NOT NULL, expression TEXT NOT NULL, timezone TEXT NOT NULL,
  misfire_json TEXT NOT NULL, overlap TEXT NOT NULL, enabled INTEGER NOT NULL, revision INTEGER NOT NULL,
  next_fire_at TEXT, last_fire_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS occurrences (
  id TEXT PRIMARY KEY, schedule_id TEXT NOT NULL, occurrence_key TEXT NOT NULL UNIQUE, scheduled_for TEXT NOT NULL,
  state TEXT NOT NULL, task_id TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL, notes TEXT NOT NULL,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS skill_proposals (
  id TEXT PRIMARY KEY, task_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, decided_at TEXT);
CREATE TABLE IF NOT EXISTS approval_target_grants (
  id TEXT PRIMARY KEY, task_id TEXT NOT NULL, tool TEXT NOT NULL, target TEXT NOT NULL,
  approval_id TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE (task_id, tool, target));
CREATE TABLE IF NOT EXISTS approval_grants (
  id TEXT PRIMARY KEY, task_id TEXT NOT NULL, tool TEXT NOT NULL, approval_id TEXT NOT NULL, created_at TEXT NOT NULL,
  UNIQUE (task_id, tool));
`;

export function now(): string { return new Date().toISOString(); }
export function newId(): string { return crypto.randomUUID(); }

export function openStore(dir: string): DB {
  const file = path.join(dir, 'milo.db');
  const created = !fs.existsSync(file);
  const db = new DatabaseSync(file);
  if (created) fs.chmodSync(file, 0o600);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 2000;');
  const version = (() => {
    try { return db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined; } catch { return undefined; }
  })();
  if (version && Number(version.value) > SCHEMA_VERSION) throw new Error(`Database schema ${version.value} is newer than this service supports (${SCHEMA_VERSION}).`);
  db.exec(SCHEMA);
  migrate(db);
  db.prepare("INSERT INTO meta (key, value) VALUES ('schema_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(String(SCHEMA_VERSION));
  return db;
}

/** Additive migrations; each is idempotent so a partially upgraded database can be re-run. */
function migrate(db: DB): void {
  const ensureColumn = (table: string, column: string, definition: string) => {
    const cols = (db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map(c => c.name);
    if (!cols.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  };
  // v2: token usage per task and attempt.
  for (const table of ['tasks', 'attempts']) {
    ensureColumn(table, 'input_tokens', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn(table, 'output_tokens', 'INTEGER NOT NULL DEFAULT 0');
    ensureColumn(table, 'usage_estimated', 'INTEGER NOT NULL DEFAULT 0');
  }
  // v5: old tool-wide grants are deliberately not migrated: their targets were not recorded.
  ensureColumn('approvals', 'grant_target', 'TEXT');
  // v3: goals link tasks and schedules.
  ensureColumn('tasks', 'goal_id', 'TEXT');
  ensureColumn('schedules', 'goal_id', 'TEXT');
}

/** Run fn inside BEGIN IMMEDIATE … COMMIT; rolls back on throw. Nested calls join the outer transaction. */
let depth = 0;
export function tx<T>(db: DB, fn: () => T): T {
  if (depth > 0) return fn();
  db.exec('BEGIN IMMEDIATE');
  depth++;
  let committed = false;
  try { const out = fn(); db.exec('COMMIT'); committed = true; return out; }
  catch (e) { try { db.exec('ROLLBACK'); } catch { /* already rolled back */ } throw e; }
  finally {
    depth--;
    // Push events only for committed work; drop those from a rolled-back transaction.
    if (committed) flushEvents(); else pending = [];
  }
}

// ── Events: persisted, then pushed to subscribers after commit ─────────────
export type ServiceEvent = { seq: number; taskId: string | null; type: string; data: unknown; at: string; transient?: boolean };
const listeners = new Set<(e: ServiceEvent) => void>();
let pending: ServiceEvent[] = [];
export function onEvent(fn: (e: ServiceEvent) => void): () => void { listeners.add(fn); return () => listeners.delete(fn); }
export function emit(db: DB, taskId: string | null, type: string, data: unknown = {}): void {
  const at = now();
  const info = db.prepare('INSERT INTO events (task_id, type, data_json, at) VALUES (?, ?, ?, ?)').run(taskId, type, JSON.stringify(data), at);
  pending.push({ seq: Number(info.lastInsertRowid), taskId, type, data, at });
  if (depth === 0) flushEvents();
}
/** Live-only event (e.g. streamed tokens): pushed to subscribers, never stored. seq is 0. */
export function emitTransient(taskId: string | null, type: string, data: unknown): void {
  const e: ServiceEvent = { seq: 0, taskId, type, data, at: now(), transient: true };
  for (const fn of listeners) { try { fn(e); } catch { /* ignore */ } }
}
export function flushEvents(): void {
  const batch = pending; pending = [];
  for (const e of batch) for (const fn of listeners) { try { fn(e); } catch { /* a bad subscriber must not break the writer */ } }
}
export function listEvents(db: DB, opts: { after?: number; taskId?: string; limit?: number }): ServiceEvent[] {
  const limit = Math.min(Math.max(opts.limit ?? 200, 1), 1000);
  const rows = (opts.taskId
    ? db.prepare('SELECT * FROM events WHERE seq > ? AND task_id = ? ORDER BY seq LIMIT ?').all(opts.after ?? 0, opts.taskId, limit)
    : db.prepare('SELECT * FROM events WHERE seq > ? ORDER BY seq LIMIT ?').all(opts.after ?? 0, limit)) as Array<Record<string, unknown>>;
  return rows.map(r => ({ seq: Number(r.seq), taskId: (r.task_id as string) ?? null, type: r.type as string, data: JSON.parse(r.data_json as string), at: r.at as string }));
}

// ── Settings ──────────────────────────────────────────────────────────────
export function getSetting<T>(db: DB, key: string, fallback: T): T {
  const row = db.prepare('SELECT value_json FROM settings WHERE key = ?').get(key) as { value_json: string } | undefined;
  return row ? JSON.parse(row.value_json) as T : fallback;
}
export function setSetting(db: DB, key: string, value: unknown): void {
  db.prepare('INSERT INTO settings (key, value_json) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json').run(key, JSON.stringify(value));
}
