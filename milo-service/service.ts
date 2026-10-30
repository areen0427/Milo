// Milo background service entry point. Requires Node 22.13+ (node:sqlite) with --experimental-strip-types.
// Owns: the private service directory and single-instance lock, the SQLite store, startup recovery,
// the scheduler timer, the task worker and the authenticated Unix-socket protocol.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import crypto from 'node:crypto';
import { isSea } from 'node:sea';
import type { DB } from './src/store.ts';
import { openStore, tx, emit, newId } from './src/store.ts';
import { recoverInterrupted, appendMessage } from './src/jobs.ts';
import { getAgentSettings } from './src/settings.ts';
import { scanDue } from './src/scheduler.ts';
import { createWorker } from './src/worker.ts';
import type { Worker } from './src/worker.ts';
import { handle, write } from './src/protocol.ts';
import { registerBuiltinTools } from './src/tools/index.ts';
import { listenForNotifications, sendNative } from './src/notifications.ts';

const dir = path.resolve(process.env.MILO_SERVICE_DIR || path.join(os.homedir(), 'Library', 'Application Support', 'Milo', 'service'));
const socket = path.join(dir, 'service.sock');
const lock = path.join(dir, 'service.lock');
const recoveryLock = path.join(dir, 'startup.lock');
const tokenFile = path.join(dir, 'auth.token');
const legacyFile = path.join(dir, 'tasks.json');
const MAX_LINE = 65536;
const SCAN_MS = Number(process.env.MILO_SCHEDULER_INTERVAL_MS) || 15_000;
let server: net.Server | undefined;
let db: DB | undefined;
let worker: Worker | undefined;
let scanTimer: NodeJS.Timeout | undefined;
let ownsLock = false;
let ownsSocket = false;
let stopping = false;
let stopNotifications: (() => void) | undefined;
const clients = new Set<net.Socket>();

function pidAlive(pid: number) {
  try { process.kill(pid, 0); return true; } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ESRCH') return false; throw e; }
}
function acquire() {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const st = fs.lstatSync(dir);
  if (!st.isDirectory() || st.isSymbolicLink() || st.uid !== process.getuid!() || (st.mode & 0o077)) throw new Error('Service directory must be owned by this user and private (0700).');
  // An interrupted startup may leave this directory behind. Do not remove it automatically:
  // another process could still be starting and has not written its service PID yet.
  try { fs.mkdirSync(recoveryLock, { mode: 0o700 }); }
  catch (e) { if ((e as NodeJS.ErrnoException).code === 'EEXIST') throw new Error('Another service may be starting, or startup.lock is stale; inspect the lock before removing it.'); throw e; }
  try {
    if (fs.existsSync(lock)) {
      const content = fs.readFileSync(lock, 'utf8');
      if (!/^\d+\n$/.test(content)) throw new Error('Invalid service lock; inspect it manually.');
      const pid = Number(content.trim());
      if (!Number.isSafeInteger(pid) || pid <= 1 || pidAlive(pid)) throw new Error('Service already running or lock owner cannot be verified.');
      fs.unlinkSync(lock);
      if (fs.existsSync(socket)) {
        const sockStat = fs.lstatSync(socket);
        if (!sockStat.isSocket() || sockStat.uid !== process.getuid!()) throw new Error('Unexpected socket path; inspect it manually.');
        fs.unlinkSync(socket);
      }
    } else if (fs.existsSync(socket)) {
      throw new Error('Socket exists without a service lock; inspect it manually.');
    }
    const fd = fs.openSync(lock, 'wx', 0o600);
    try { fs.writeFileSync(fd, `${process.pid}\n`); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    ownsLock = true;
  } finally { fs.rmdirSync(recoveryLock); }
}

/** One-time import of the v1 prototype's tasks.json. A corrupt file aborts startup untouched. */
function importLegacy(store: DB) {
  if (!fs.existsSync(legacyFile)) return;
  const data = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));
  const valid = ['queued', 'running', 'completed', 'interrupted'];
  if (!data || data.version !== 1 || !Array.isArray(data.tasks) || data.tasks.some((t: Record<string, unknown>) => !t || typeof t.id !== 'string' || typeof t.goal !== 'string' || !valid.includes(t.status as string))) throw new Error('Invalid task store; it was not overwritten.');
  tx(store, () => {
    for (const t of data.tasks) {
      // v1 tasks had no message log or effects; a v1 task caught mid-run cannot be resumed.
      const status = t.status === 'running' ? 'interrupted' : t.status;
      const at = typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString();
      const inserted = store.prepare("INSERT OR IGNORE INTO tasks (id, goal, status, created_at, updated_at, result, origin) VALUES (?, ?, ?, ?, ?, ?, 'legacy')")
        .run(t.id, t.goal, status, at, typeof t.updatedAt === 'string' ? t.updatedAt : at, t.result ?? null).changes;
      if (inserted) appendMessage(store, t.id, { role: 'user', content: t.goal });
    }
    emit(store, null, 'service.legacy_imported', { tasks: data.tasks.length });
  });
  fs.renameSync(legacyFile, `${legacyFile}.imported`);
}

function writeToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  const temp = path.join(dir, `.auth-${newId()}.tmp`);
  const fd = fs.openSync(temp, 'wx', 0o600);
  try { fs.writeFileSync(fd, token + '\n'); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  fs.renameSync(temp, tokenFile);
  return token;
}

function shutdown(code = 0) {
  if (stopping) return; stopping = true;
  worker?.stop();
  stopNotifications?.();
  if (scanTimer) clearInterval(scanTimer);
  for (const client of clients) client.destroy();
  const finish = () => {
    try { db?.close(); } catch (e) { console.error((e as Error).message); code = 1; }
    try { if (ownsSocket && fs.existsSync(socket)) fs.unlinkSync(socket); } catch (e) { console.error((e as Error).message); code = 1; }
    try { if (ownsLock && fs.existsSync(tokenFile)) fs.unlinkSync(tokenFile); } catch (e) { console.error((e as Error).message); code = 1; }
    try { if (ownsLock && fs.existsSync(lock)) fs.unlinkSync(lock); } catch (e) { console.error((e as Error).message); code = 1; }
    process.exit(code);
  };
  if (server?.listening) server.close(finish); else finish();
}
const fatal = (e: Error) => { console.error('Fatal service error; shutting down:', e.message); shutdown(1); };

function scan() {
  try { scanDue(db!); worker!.kick(); } catch (e) { fatal(e as Error); }
}

try {
  acquire();
  db = openStore(dir);
  importLegacy(db);
  registerBuiltinTools();
  const recovery = recoverInterrupted(db, getAgentSettings(db).maxRecoveries);
  if (recovery.requeued || recovery.needsReview || recovery.failed) emit(db, null, 'service.recovered', recovery);
  const token = writeToken();
  worker = createWorker({ db, serviceDir: dir, onFatal: fatal });
  const helper = path.join(path.dirname(process.execPath), 'milo-notify');
  const notificationsAvailable = isSea() && process.platform === 'darwin' && fs.existsSync(helper);
  if (notificationsAvailable) stopNotifications = listenForNotifications(db, kind => sendNative(helper, kind));
  const ctx = { db, serviceDir: dir, token, worker, startedAt: new Date().toISOString(), notificationsAvailable, notificationHelper: notificationsAvailable ? helper : null };
  server = net.createServer(conn => {
    clients.add(conn); conn.on('close', () => clients.delete(conn)); conn.on('error', () => conn.destroy());
    let buf = Buffer.alloc(0);
    conn.on('data', chunk => {
      buf = Buffer.concat([buf, chunk]);
      while (true) {
        const pos = buf.indexOf(10);
        if (pos < 0) { if (buf.length > MAX_LINE) conn.destroy(); return; }
        if (pos > MAX_LINE) { conn.destroy(); return; }
        const line = buf.subarray(0, pos); buf = buf.subarray(pos + 1);
        let parsed;
        try { parsed = JSON.parse(line.toString('utf8')); }
        catch { write(conn, { id: null, error: 'Invalid JSON', code: 'invalid_json' }); continue; }
        handle(parsed, ctx, conn).catch(e => fatal(e as Error));
      }
    });
  });
  server.on('error', e => fatal(e));
  server.listen(socket, () => {
    ownsSocket = true; fs.chmodSync(socket, 0o600);
    console.log(`Milo service listening on ${socket}`);
    scan();
    scanTimer = setInterval(scan, SCAN_MS);
    worker!.kick();
  });
  process.on('SIGINT', () => shutdown()); process.on('SIGTERM', () => shutdown());
} catch (e) { console.error('Service startup failed:', (e as Error).message); shutdown(1); }
