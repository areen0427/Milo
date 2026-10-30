// Local protocol v2: newline-delimited JSON over a private Unix socket.
// Request:  {"id": 1, "auth": "<token from auth.token>", "method": "tasks.create", "params": {...}}
// Response: {"id": 1, "result": ...} or {"id": 1, "error": "message", "code": "..."}
// Push (after events.subscribe): {"event": {seq, taskId, type, data, at}}
// Local-access concepts follow Aiden core/v4/workbench/bridgeServer.ts; the token rotates on every
// service start and is readable only by this user, so it limits access to this account's processes.
import crypto from 'node:crypto';
import type net from 'node:net';
import type { DB, ServiceEvent } from './store.ts';
import { emit, getSetting, listEvents, onEvent, tx } from './store.ts';
import fs from 'node:fs';
import path from 'node:path';
import { ValidationError, isPaused, setPaused, getAgentSettings, getInference, getPermissions, setAgentSettings, setInference, setPermissions } from './settings.ts';
import { usageTotals, cancelTask, createTask, decideApproval, getTask, listApprovals, listTasks, resolveReview, taskDetail } from './jobs.ts';
import { createGoal, getGoal, listGoals, requireActiveGoal, updateGoal } from './goals.ts';
import { createSchedule, deleteSchedule, listSchedules, previewSchedule, setScheduleEnabled } from './scheduler.ts';
import { addMemory, deleteMemory, listMemory, searchMemory, NAMESPACES } from './memory.ts';
import { listTools } from './tools/registry.ts';
import { decideProposal, listProposals } from './skillProposals.ts';
import { notificationEnabled, setNotificationEnabled, sendNative } from './notifications.ts';
import { describeBackend } from './inference/router.ts';
import type { Worker } from './worker.ts';

export const PROTOCOL_VERSION = 2;
export const SUPPORTED_PROTOCOLS = [2];
export const SERVICE_VERSION = '0.3.0';

export type ProtocolContext = { db: DB; serviceDir: string; token: string; worker: Worker; startedAt: string; notificationsAvailable: boolean; notificationHelper: string | null };
type Params = Record<string, unknown>;
type Handler = (p: Params, ctx: ProtocolContext, conn: net.Socket) => unknown | Promise<unknown>;

let backendCache: { at: number; key: string; value: Awaited<ReturnType<typeof describeBackend>> } | null = null;
async function backendStatus(db: DB) {
  const settings = getInference(db);
  const key = JSON.stringify(settings);
  if (!backendCache || backendCache.key !== key || Date.now() - backendCache.at > 10_000) backendCache = { at: Date.now(), key, value: await describeBackend(settings) };
  return backendCache.value;
}
const str = (p: Params, k: string) => { if (typeof p[k] !== 'string') throw new ValidationError(`${k} must be a string`); return p[k] as string; };

const METHODS: Record<string, Handler> = {
  'hello': (p) => {
    const offered = Array.isArray(p.protocol) ? p.protocol : [p.protocol ?? PROTOCOL_VERSION];
    const chosen = SUPPORTED_PROTOCOLS.filter(v => offered.includes(v)).pop();
    if (chosen === undefined) throw new ValidationError(`Unsupported protocol; this service speaks ${SUPPORTED_PROTOCOLS.join(', ')}`);
    return { service: 'milo', protocol: chosen, serviceVersion: SERVICE_VERSION, methods: Object.keys(METHODS) };
  },
  'health': async (_p, ctx) => {
    const inference = await backendStatus(ctx.db);
    return {
      service: 'milo', version: PROTOCOL_VERSION, protocol: PROTOCOL_VERSION, serviceVersion: SERVICE_VERSION, startedAt: ctx.startedAt,
      inference: inference.backend, model: inference.model, inferenceReady: inference.ready, inferenceMessage: inference.message,
      tools: listTools().map(t => t.name), worker: { busy: ctx.worker.current() !== null, taskId: ctx.worker.current() },
      notificationsAvailable: ctx.notificationsAvailable,
      pendingApprovals: listApprovals(ctx.db, 'pending').length,
      usage: usageTotals(ctx.db),
      paused: isPaused(ctx.db),
      resources: { rssBytes: process.memoryUsage().rss, heapUsedBytes: process.memoryUsage().heapUsed, uptimeSeconds: Math.round(process.uptime()), databaseBytes: dbSize(ctx.serviceDir) },
    };
  },
  'notifications.get': (_p, ctx) => ({ enabled: notificationEnabled(ctx.db), available: ctx.notificationsAvailable, lastError: getSetting<string | null>(ctx.db, 'notifications.lastError', null) }),
  'notifications.request': async (_p, ctx) => { if (!ctx.notificationHelper) throw new ValidationError('Notifications require the packaged Milo app'); try { await sendNative(ctx.notificationHelper, '--request'); return { granted: true }; } catch (e) { throw new ValidationError((e as Error).message); } },
  'notifications.set': (p, ctx) => ({ enabled: setNotificationEnabled(ctx.db, p.enabled, ctx.notificationsAvailable), available: ctx.notificationsAvailable, lastError: getSetting<string | null>(ctx.db, 'notifications.lastError', null) }),
  'service.pause': (_p, ctx) => { setPaused(ctx.db, true); emit(ctx.db, null, 'service.paused', {}); return { paused: true }; },
  'service.resume': (_p, ctx) => { setPaused(ctx.db, false); emit(ctx.db, null, 'service.resumed', {}); ctx.worker.kick(); return { paused: false }; },
  'tasks.create': (p, ctx) => { const t = createTask(ctx.db, p.goal, { goalId: requireActiveGoal(ctx.db, p.goalId) }); ctx.worker.kick(); return t; },
  'goals.create': (p, ctx) => createGoal(ctx.db, p),
  'goals.list': (p, ctx) => listGoals(ctx.db, p.includeArchived === true),
  'goals.get': (p, ctx) => { const g = getGoal(ctx.db, str(p, 'id')); if (!g) throw new ValidationError('Goal not found'); return { ...g, tasks: listTasks(ctx.db, { goalId: g.id }) }; },
  'goals.update': (p, ctx) => updateGoal(ctx.db, p),
  'tasks.list': (p, ctx) => listTasks(ctx.db, { status: typeof p.status === 'string' ? p.status : undefined, limit: typeof p.limit === 'number' ? p.limit : undefined, goalId: typeof p.goalId === 'string' ? p.goalId : undefined, before: typeof p.before === 'string' ? p.before : undefined }),
  'tasks.get': (p, ctx) => { const t = p.detail === true ? taskDetail(ctx.db, str(p, 'id')) : getTask(ctx.db, str(p, 'id')); if (!t) throw new ValidationError('Task not found'); return t; },
  'tasks.cancel': (p, ctx) => { const t = cancelTask(ctx.db, p.id); ctx.worker.abort(t.id); return t; },
  'tasks.review': (p, ctx) => { const t = resolveReview(ctx.db, p.id, p.action); ctx.worker.kick(); return t; },
  'approvals.list': (p, ctx) => listApprovals(ctx.db, typeof p.status === 'string' ? p.status : 'pending'),
  'approvals.decide': (p, ctx) => { const a = decideApproval(ctx.db, p.id, p.decision, p.scope ?? 'once'); ctx.worker.kick(); return a; },
  'schedules.create': (p, ctx) => createSchedule(ctx.db, p),
  'schedules.list': (_p, ctx) => listSchedules(ctx.db),
  'schedules.setEnabled': (p, ctx) => setScheduleEnabled(ctx.db, p.id, p.enabled),
  'schedules.delete': (p, ctx) => ({ deleted: deleteSchedule(ctx.db, p.id) }),
  'schedules.preview': (p) => ({ instants: previewSchedule(p) }),
  'memory.namespaces': () => Object.entries(NAMESPACES).map(([name, d]) => ({ name, label: d.label, charLimit: d.charLimit })),
  'memory.list': (p, ctx) => listMemory(ctx.db, typeof p.namespace === 'string' ? p.namespace : undefined),
  'memory.add': (p, ctx) => addMemory(ctx.db, { namespace: p.namespace, text: p.text, source: 'said' }).entry,
  'memory.delete': (p, ctx) => ({ deleted: deleteMemory(ctx.db, p.id) }),
  'memory.search': (p, ctx) => searchMemory(ctx.db, str(p, 'query'), typeof p.limit === 'number' ? p.limit : 8),
  'permissions.get': (_p, ctx) => getPermissions(ctx.db),
  'permissions.set': (p, ctx) => setPermissions(ctx.db, ctx.serviceDir, p),
  'settings.get': (_p, ctx) => ({ inference: getInference(ctx.db), agent: getAgentSettings(ctx.db) }),
  'settings.set': (p, ctx) => {
    const settings = tx(ctx.db, () => {
      if (p.inference !== undefined) setInference(ctx.db, p.inference);
      if (p.agent !== undefined) setAgentSettings(ctx.db, p.agent);
      return { inference: getInference(ctx.db), agent: getAgentSettings(ctx.db) };
    });
    backendCache = null;
    return settings;
  },
  'skills.proposals.list': (_p, ctx) => listProposals(ctx.db),
  'skills.proposals.decide': (p, ctx) => decideProposal(ctx.db, p.id, p.decision),
  'tools.list': () => listTools().map(t => ({ name: t.name, description: t.description, mutates: t.mutates, inputSchema: t.inputSchema })),
  'events.cursor': (_p, ctx) => ({ seq: Number((ctx.db.prepare('SELECT COALESCE(MAX(seq), 0) AS seq FROM events').get() as { seq: number }).seq) }),
  'events.list': (p, ctx) => listEvents(ctx.db, { after: typeof p.after === 'number' ? p.after : 0, taskId: typeof p.taskId === 'string' ? p.taskId : undefined, limit: typeof p.limit === 'number' ? p.limit : undefined }),
  'events.subscribe': (p, ctx, conn) => {
    if ((conn as net.Socket & { miloSubscribed?: boolean }).miloSubscribed) throw new ValidationError('Already subscribed');
    (conn as net.Socket & { miloSubscribed?: boolean }).miloSubscribed = true;
    // Capture a stable replay boundary. Live events are buffered until replay completes,
    // preserving order and preventing old backlog from appearing after newer events.
    const highWater = Number((ctx.db.prepare('SELECT COALESCE(MAX(seq), 0) AS seq FROM events').get() as { seq: number }).seq);
    const requested = typeof p.after === 'number' && Number.isSafeInteger(p.after) && p.after >= 0 ? p.after : highWater;
    let last = requested; let replaying = true; let queuedBytes = 0;
    const queued: ServiceEvent[] = [];
    const send = (e: ServiceEvent) => {
      if (e.transient) { if (p.transient !== false && !write(conn, { event: e })) conn.destroy(); return; }
      if (e.seq > last) { last = e.seq; if (!write(conn, { event: e })) conn.destroy(); }
    };
    const off = onEvent(e => {
      if (!replaying) { send(e); return; }
      if (e.transient && p.transient === false) return;
      if (!e.transient && e.seq <= highWater) return;
      queuedBytes += Buffer.byteLength(JSON.stringify(e));
      if (queued.length >= 1000 || queuedBytes > 4 * 1024 * 1024) { conn.destroy(); return; }
      queued.push(e);
    });
    conn.once('close', off);
    const replay = () => {
      if (conn.destroyed) return;
      const batch = listEvents(ctx.db, { after: last, limit: 1000 }).filter(e => e.seq <= highWater);
      for (const event of batch) { send(event); if (conn.destroyed) return; }
      if (batch.length === 1000 && last < highWater) { setImmediate(replay); return; }
      replaying = false;
      for (const event of queued) { send(event); if (conn.destroyed) return; }
      queued.length = 0;
    };
    setImmediate(replay);
    return { subscribed: true };
  },
};

function dbSize(dir: string): number {
  let total = 0;
  for (const f of ['milo.db', 'milo.db-wal', 'milo.db-shm']) { try { total += fs.statSync(path.join(dir, f)).size; } catch { /* absent */ } }
  return total;
}

/** Writes a line; returns false if the client is not keeping up (bounded backpressure). */
export function write(conn: net.Socket, body: unknown): boolean {
  if (conn.destroyed) return false;
  conn.write(JSON.stringify(body) + '\n');
  return conn.writableLength < 4 * 1024 * 1024;
}

function tokenMatches(given: unknown, token: string): boolean {
  if (typeof given !== 'string') return false;
  const a = Buffer.from(given); const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Handles one parsed request. Throws only for persistence/internal failures (caller shuts down). */
export async function handle(req: unknown, ctx: ProtocolContext, conn: net.Socket): Promise<void> {
  const r = req as Record<string, unknown> | null;
  const id = r && typeof r === 'object' && !Array.isArray(r) && (typeof r.id === 'string' || typeof r.id === 'number') ? r.id : null;
  if (id === null || typeof r!.method !== 'string') { write(conn, { id, error: 'Invalid request', code: 'invalid_request' }); return; }
  if (!tokenMatches(r!.auth, ctx.token)) { write(conn, { id, error: 'Unauthorized: read auth.token from the service directory', code: 'unauthorized' }); return; }
  const handler = Object.hasOwn(METHODS, r!.method as string) ? METHODS[r!.method as string] : undefined;
  if (!handler) { write(conn, { id, error: 'Unknown method', code: 'unknown_method' }); return; }
  const params = r!.params === undefined ? {} : r!.params;
  if (!params || typeof params !== 'object' || Array.isArray(params)) { write(conn, { id, error: 'params must be an object', code: 'invalid_params' }); return; }
  try {
    write(conn, { id, result: await handler(params as Params, ctx, conn) });
  } catch (e) {
    if (e instanceof ValidationError) { write(conn, { id, error: e.message, code: 'invalid_params' }); return; }
    throw e;
  }
}
