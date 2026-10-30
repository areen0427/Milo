import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = process.arch === 'arm64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin';
const appBundle = process.argv[2] ? path.resolve(process.argv[2]) : null;
const binary = appBundle ? path.join(appBundle, 'Contents/MacOS/milo-service') : path.resolve(root, `../milo-app/src-tauri/binaries/milo-service-${target}`);
const dir = fs.mkdtempSync(path.join(root, '.sidecar-test-')); fs.chmodSync(dir, 0o700);
const child = spawn(binary, [], { env: { ...process.env, MILO_SERVICE_DIR: dir }, stdio: ['ignore', 'pipe', 'pipe'] });
let error = ''; child.stderr.on('data', d => error += d);
try {
  await Promise.race([new Promise((resolve, reject) => { child.stdout.once('data', resolve); child.once('exit', code => reject(new Error(`sidecar exited ${code}: ${error}`))); }), new Promise((_, reject) => { const timer = setTimeout(() => reject(new Error(`sidecar startup timed out: ${error}`)), 10000); timer.unref(); })]);
  const auth = fs.readFileSync(path.join(dir, 'auth.token'), 'utf8').trim();
  const reply = await new Promise((resolve, reject) => {
    const sock = net.createConnection(path.join(dir, 'service.sock')); let data = '';
    sock.on('error', reject); sock.on('connect', () => sock.write(JSON.stringify({ id: 1, auth, method: 'health' }) + '\n'));
    sock.on('data', b => { data += b; if (data.includes('\n')) { sock.end(); resolve(JSON.parse(data.split('\n')[0])); } });
  });
  if (reply.result?.service !== 'milo' || reply.result?.protocol !== 2) throw new Error(`Unexpected health reply: ${JSON.stringify(reply)}`);
  if (appBundle) {
    if (reply.result.notificationsAvailable !== true) throw new Error('Packaged notification helper was not detected');
    const helper = spawnSync(path.join(appBundle, 'Contents/MacOS/milo-notify'), ['--identity'], { encoding: 'utf8' });
    if (helper.status !== 0 || helper.stdout.trim() !== 'com.areendabadghav.milo') throw new Error('Notification helper has the wrong bundle identity');
    const status = spawnSync(path.join(appBundle, 'Contents/MacOS/milo-notify'), ['--status'], { encoding: 'utf8', timeout: 8000 });
    if (status.status !== 0 || !/^\d+$/.test(status.stdout.trim())) throw new Error(`Notification status query failed: ${status.stderr || status.error || status.status}`);
  }
  console.log('Standalone sidecar started and answered authenticated health request' + (appBundle ? '; notification helper has Milo bundle identity and can read OS authorization status' : ''));
} finally {
  if (child.exitCode === null && child.signalCode === null) { child.kill('SIGTERM'); await new Promise(resolve => child.once('exit', resolve)); }
  fs.rmSync(dir, { recursive: true, force: true });
}
