// shell_run: run a command in a granted folder. Off unless the user enables shell access.
// Every command requires approval and records an effect. Shell syntax, executable paths and
// configuration make a text-only read-only proof insufficient for an authorization boundary.
// A crash mid-command sends the task to the user because its outcome is uncertain.
import { spawn } from 'node:child_process';
import os from 'node:os';
import type { ToolDefinition } from './registry.ts';
import { ToolFailure } from './registry.ts';
import { resolveScoped } from './paths.ts';
import { analyzeCommandIntent } from '../policy/dangerousPatterns.ts';
import { scanContent } from '../policy/contentScanner.ts';

const MAX_OUTPUT = 64 * 1024;

export const shellRun: ToolDefinition = {
  name: 'shell_run',
  description: 'Run a shell command (/bin/sh -c) with a granted folder as its working directory. Every command requires user approval. Output is truncated to 64 KiB per stream.',
  inputSchema: { type: 'object', properties: { command: { type: 'string', minLength: 1, maxLength: 8000 }, cwd: { type: 'string', maxLength: 4096 }, timeoutMs: { type: 'integer', minimum: 1000, maximum: 300_000 } }, required: ['command'], additionalProperties: false },
  mutates: true,
  groundedOnly: true,
  assess(args, ctx) {
    const command = args.command as string;
    const summary = `Run \`${command.length > 160 ? command.slice(0, 160) + '…' : command}\``;
    if (!ctx.permissions.shell) return { decision: 'deny', tier: 'dangerous', reasons: ['Shell access is not granted'], summary };
    if (!ctx.permissions.fileRoots.length) return { decision: 'deny', tier: 'dangerous', reasons: ['Shell commands need a granted folder to run in'], summary };
    try { resolveScoped((args.cwd as string | undefined) ?? ctx.permissions.fileRoots[0], ctx.permissions.fileRoots, ctx.serviceDir); }
    catch (e) { return { decision: 'deny', tier: 'dangerous', reasons: [(e as Error).message], summary }; }
    const findings = scanContent(command);
    const intent = analyzeCommandIntent(command);
    const reasons = [intent.reason ?? intent.operation, ...findings.map(f => f.description)];
    return { decision: 'ask', tier: intent.tier === 'safe' ? 'caution' : intent.tier, reasons, summary };
  },
  planEffect() {
    return { kind: 'process.exec', target: null, reconciliation: null };
  },
  execute(args, ctx) {
    const cwd = resolveScoped((args.cwd as string | undefined) ?? ctx.permissions.fileRoots[0], ctx.permissions.fileRoots, ctx.serviceDir);
    const timeoutMs = (args.timeoutMs as number | undefined) ?? 30_000;
    return new Promise((resolve, reject) => {
      const child = spawn('/bin/sh', ['-c', args.command as string], {
        cwd, stdio: ['ignore', 'pipe', 'pipe'], detached: true,
        env: { PATH: '/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/usr/local/bin', HOME: os.homedir(), LANG: process.env.LANG ?? 'en_US.UTF-8', TMPDIR: os.tmpdir() },
      });
      const out = { stdout: '', stderr: '', truncated: false };
      const take = (key: 'stdout' | 'stderr') => (d: Buffer) => {
        if (out[key].length >= MAX_OUTPUT) { out.truncated = true; return; }
        out[key] += d.toString('utf8').slice(0, MAX_OUTPUT - out[key].length);
      };
      child.stdout.on('data', take('stdout')); child.stderr.on('data', take('stderr'));
      let killedBy: string | null = null;
      const kill = (why: string) => { killedBy = why; try { process.kill(-child.pid!, 'SIGKILL'); } catch { /* exited */ } };
      const timer = setTimeout(() => kill('timeout'), timeoutMs);
      const onAbort = () => kill('cancelled');
      ctx.signal.addEventListener('abort', onAbort, { once: true });
      child.on('error', e => { clearTimeout(timer); ctx.signal.removeEventListener('abort', onAbort); reject(new ToolFailure('spawn_failed', e.message)); });
      child.on('close', (code, signal) => {
        clearTimeout(timer); ctx.signal.removeEventListener('abort', onAbort);
        if (killedBy === 'timeout') return reject(new ToolFailure('timeout', `Command timed out after ${timeoutMs} ms`));
        if (killedBy === 'cancelled') return reject(new ToolFailure('cancelled', 'Command cancelled'));
        resolve({ exitCode: code, signal, cwd, ...out });
      });
    });
  },
};
