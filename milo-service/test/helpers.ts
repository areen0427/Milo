import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { openStore } from '../src/store.ts';
import type { DB } from '../src/store.ts';
import { registerBuiltinTools } from '../src/tools/index.ts';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function tempDir(prefix = 'milo-test-'): string {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  fs.chmodSync(dir, 0o700);
  return dir;
}
export function freshStore(): { db: DB; dir: string; files: string; cleanup(): void } {
  registerBuiltinTools();
  const dir = tempDir();
  const files = tempDir('milo-files-');
  const db = openStore(dir);
  return { db, dir, files, cleanup() { try { db.close(); } catch { /* closed */ } fs.rmSync(dir, { recursive: true, force: true }); fs.rmSync(files, { recursive: true, force: true }); } };
}

export type Service = { child: ChildProcess; dir: string; ready: Promise<void>; stderr(): string };
export function startService(dir: string, env: Record<string, string> = {}): Service {
  const child = spawn(process.execPath, ['--experimental-strip-types', '--no-warnings', path.join(root, 'service.ts')], { env: { ...process.env, MILO_SERVICE_DIR: dir, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let errors = ''; child.stderr!.on('data', d => { errors += d; });
  const ready = new Promise<void>((resolve, reject) => {
    child.stdout!.once('data', () => resolve());
    child.once('exit', code => reject(new Error(`exit ${code}: ${errors}`)));
  });
  return { child, dir, ready, stderr: () => errors };
}
export function stopService(s: Service | undefined, signal: NodeJS.Signals = 'SIGTERM'): Promise<void> {
  return new Promise(resolve => {
    if (!s || s.child.exitCode !== null || s.child.signalCode !== null) return resolve();
    s.child.once('exit', () => resolve());
    s.child.kill(signal);
  });
}
export function token(dir: string): string { return fs.readFileSync(path.join(dir, 'auth.token'), 'utf8').trim(); }

let nextId = 1;
export function rawCall(dir: string, line: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const conn = net.createConnection(path.join(dir, 'service.sock')); let buf = '';
    conn.on('connect', () => conn.write(line + '\n'));
    conn.on('data', chunk => { buf += chunk; if (buf.includes('\n')) { conn.end(); resolve(JSON.parse(buf.split('\n')[0])); } });
    conn.on('error', reject);
  });
}
export async function call(dir: string, method: string, params: unknown = {}): Promise<any> {
  const reply = await rawCall(dir, JSON.stringify({ id: nextId++, auth: token(dir), method, params }));
  if (reply.error) throw new Error(`${method}: ${reply.error}`);
  return reply.result;
}
export async function waitFor<T>(fn: () => Promise<T> | T, ok: (v: T) => boolean, timeoutMs = 3000): Promise<T> {
  const end = Date.now() + timeoutMs; let last: T;
  while (Date.now() < end) { last = await fn(); if (ok(last)) return last; await new Promise(r => setTimeout(r, 15)); }
  throw new Error(`Timed out; last value: ${JSON.stringify(last!)?.slice(0, 500)}`);
}
