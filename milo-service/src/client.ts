// Client for the service protocol, used by the CLI. The Tauri app has an equivalent in Rust.
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

export function defaultServiceDir(): string {
  return path.resolve(process.env.MILO_SERVICE_DIR || path.join(os.homedir(), 'Library', 'Application Support', 'Milo', 'service'));
}

export class ServiceError extends Error {
  code: string;
  constructor(code: string, message: string) { super(message); this.code = code; }
}

function readToken(dir: string): string {
  try { return fs.readFileSync(path.join(dir, 'auth.token'), 'utf8').trim(); }
  catch { throw new ServiceError('not_running', 'Milo service is not running (no auth token). Start it with `milo service start` or `milo service install`.'); }
}

export function request(method: string, params: unknown = {}, dir = defaultServiceDir(), timeoutMs = 10_000): Promise<any> {
  const auth = readToken(dir);
  return new Promise((resolve, reject) => {
    const conn = net.createConnection(path.join(dir, 'service.sock'));
    let buf = ''; let settled = false;
    const finish = (error?: Error, result?: unknown) => {
      if (settled) return;
      settled = true; clearTimeout(timer); conn.destroy();
      if (error) reject(error); else resolve(result);
    };
    const timer = setTimeout(() => finish(new ServiceError('timeout', `${method} timed out`)), timeoutMs);
    conn.on('connect', () => conn.write(JSON.stringify({ id: 1, auth, method, params }) + '\n'));
    conn.on('data', chunk => {
      buf += chunk;
      const i = buf.indexOf('\n');
      if (i > 8 * 1024 * 1024 || (i < 0 && buf.length > 8 * 1024 * 1024)) return finish(new ServiceError('invalid_response', 'Service response too large'));
      if (i < 0) return;
      let reply: any;
      try { reply = JSON.parse(buf.slice(0, i)); } catch { return finish(new ServiceError('invalid_response', 'Invalid service response')); }
      if (!reply || reply.id !== 1) return finish(new ServiceError('invalid_response', 'Mismatched service response'));
      if (reply.error) return finish(new ServiceError(reply.code ?? 'error', String(reply.error)));
      if (!Object.hasOwn(reply, 'result')) return finish(new ServiceError('invalid_response', 'Missing service result'));
      finish(undefined, reply.result);
    });
    conn.on('end', () => finish(new ServiceError('invalid_response', 'Service closed before responding')));
    conn.on('error', e => finish(new ServiceError('not_running', `Milo service cannot be reached: ${e.message}`)));
  });
}

/** Streams events until `onEvent` returns true or the connection closes. */
export function subscribe(onEvent: (e: { seq: number; taskId: string | null; type: string; data: any }) => boolean | void, dir = defaultServiceDir(), after?: number, signal?: AbortSignal): Promise<void> {
  const auth = readToken(dir);
  return new Promise((resolve, reject) => {
    const conn = net.createConnection(path.join(dir, 'service.sock'));
    let buf = '';
    const abort = () => conn.destroy();
    if (signal?.aborted) { conn.destroy(); resolve(); return; }
    signal?.addEventListener('abort', abort, { once: true });
    conn.on('connect', () => conn.write(JSON.stringify({ id: 1, auth, method: 'events.subscribe', params: after === undefined ? {} : { after } }) + '\n'));
    conn.on('data', chunk => {
      buf += chunk;
      if (buf.length > 8 * 1024 * 1024) { conn.destroy(); reject(new ServiceError('invalid_response', 'Event response too large')); return; }
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        let line: any;
        try { line = JSON.parse(buf.slice(0, i)); } catch { conn.destroy(); reject(new ServiceError('invalid_response', 'Invalid event response')); return; }
        buf = buf.slice(i + 1);
        if (line.error) { conn.destroy(); reject(new ServiceError(line.code ?? 'error', line.error)); return; }
        if (line.event && onEvent(line.event) === true) { conn.destroy(); resolve(); return; }
      }
    });
    conn.on('close', () => { signal?.removeEventListener('abort', abort); resolve(); });
    conn.on('error', e => reject(new ServiceError('not_running', e.message)));
  });
}
