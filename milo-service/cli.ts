// `milo` command-line client: a second client of the same per-user service the app uses.
// Patterns from Aiden cli/v4/commands (status, tasks, cron, memory) rebuilt as thin protocol calls.
// Add --json to any command for machine-readable output.
import path from 'node:path';
import readline from 'node:readline/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { request, subscribe, defaultServiceDir, ServiceError } from './src/client.ts';
import * as launchd from './src/launchd.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const json = argv.includes('--json');
const args = argv.filter(a => a !== '--json');
const flag = (name: string) => { const i = args.indexOf(`--${name}`); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const bool = (v: string | undefined) => v === undefined ? undefined : ['on', 'true', 'yes', '1'].includes(v.toLowerCase()) ? true : ['off', 'false', 'no', '0'].includes(v.toLowerCase()) ? false : fail(`Expected on/off, got ${v}`);
function fail(message: string): never { console.error(message); process.exit(2); }
// Parse every value flag before positional arguments are read.
const flags = Object.fromEntries(['tz', 'goal', 'status', 'grant', 'network', 'shell', 'auto-writes', 'backend', 'url', 'model', 'allow-remote'].map(n => [n, flag(n)]));
const print = (value: unknown, human: () => void) => { if (json) console.log(JSON.stringify(value, null, 2)); else human(); };
const short = (id: string) => id.slice(0, 8);
const TERMINAL = ['completed', 'failed', 'cancelled', 'interrupted'];

async function resolveId(kind: 'tasks' | 'approvals' | 'schedules' | 'memory' | 'goals', prefix: string | undefined): Promise<string> {
  if (!prefix) fail(`Missing ${kind.replace(/s$/, '')} id`);
  const list: Array<{ id: string }> = await request(kind === 'approvals' ? 'approvals.list' : `${kind}.list`, kind === 'approvals' ? { status: 'pending' } : {});
  const matches = list.filter(x => x.id.startsWith(prefix));
  if (matches.length === 1) return matches[0].id;
  return matches.length ? fail(`Ambiguous id ${prefix}`) : prefix;
}

async function promptApprovals(taskId: string) {
  const pending = (await request('approvals.list', { status: 'pending' }) as Array<{ id: string; taskId: string; summary: string; tier: string; reasons: string[] }>).filter(a => a.taskId === taskId);
  for (const a of pending) {
    if (!process.stdin.isTTY) { console.log(`Waiting for approval ${short(a.id)}: ${a.summary} (run: milo approve ${short(a.id)})`); return false; }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(`\n[${a.tier}] ${a.summary}${a.reasons.length ? `\n  ${a.reasons.join('; ')}` : ''}\nApprove? [y/N] `);
    rl.close();
    await request('approvals.decide', { id: a.id, decision: /^y(es)?$/i.test(answer.trim()) ? 'approve' : 'deny' });
  }
  return true;
}

async function follow(taskId: string) {
  const controller = new AbortController(); let draft = false;
  // A terminal may display a live draft. Piped/JSON output stays stable and machine-readable.
  const events = !json && process.stdout.isTTY ? subscribe(e => {
    if (e.taskId !== taskId) return;
    if (e.type === 'task.delta' && typeof e.data?.content === 'string') {
      if (!draft) { process.stdout.write('Draft: '); draft = true; }
      process.stdout.write(e.data.content.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, ''));
    } else if (e.type === 'task.delta_reset' && draft) { process.stdout.write('\n[Draft withdrawn]\n'); draft = false; }
    else if (e.type === 'task.step' && e.data?.toolCalls?.length && draft) { process.stdout.write('\n[Continuing with tools]\n'); draft = false; }
  }, defaultServiceDir(), undefined, controller.signal).catch(e => { if (!controller.signal.aborted) console.error(`Live updates unavailable: ${(e as Error).message}`); }) : Promise.resolve();
  try {
    let task = await request('tasks.get', { id: taskId });
    while (!TERMINAL.includes(task.status)) {
      if (task.status === 'waiting_approval') { if (draft) { process.stdout.write('\n'); draft = false; } if (!(await promptApprovals(taskId))) return task; }
      else if (task.status === 'needs_review') { console.log(`Task needs review: ${task.error}\nRun: milo review ${short(taskId)} resume|cancel`); return task; }
      else await new Promise(r => setTimeout(r, 250));
      task = await request('tasks.get', { id: taskId });
    }
    if (draft) process.stdout.write('\nFinal: ');
    return task;
  } finally { controller.abort(); await events; }
}

async function main() {
  const [cmd, sub, ...rest] = args;
  switch (cmd) {
    case undefined: case 'help': case '--help':
      console.log(`milo — local agent CLI

  milo status                         service, model, queue, usage and resource status
  milo pause | resume                 stop/start running work (state is kept)
  milo ask "<goal>" [--no-wait] [--goal ID]   create a task and follow it (prompts for approvals)
  milo goal list | add "<title>" [description] | show <id> | pause|activate|achieve|archive <id>
  milo tasks [--status S]             list tasks
  milo task <id>                      task detail with tool trace and effects
  milo cancel <id> | review <id> resume|cancel
  milo approvals | approve <id> [--task] | deny <id>   (--task: allow future writes to this exact file in this task; never for dangerous)
  milo schedule list | add "<cron|interval:ms|oneshot:ISO>" "<goal>" [--tz Zone] | rm <id> | on <id> | off <id> | preview "<expr>" [--tz Zone]
  milo memory list | add <user|notes> "<text>" | rm <id> | search "<query>"
  milo perms [--grant DIR] [--revoke-folders] [--network on|off] [--shell on|off] [--auto-writes on|off]
  milo model [--backend mock|openai_compatible|engine] [--url URL] [--model NAME] [--allow-remote on|off]
  milo service start | install | uninstall | status
Add --json for machine-readable output.`);
      return;
    case 'status': {
      const h = await request('health');
      return print(h, () => console.log(`Milo service ${h.serviceVersion} (protocol ${h.protocol}) since ${h.startedAt}\nInference: ${h.inference}${h.model ? ` · ${h.model}` : ''} · ${h.inferenceReady ? 'ready' : 'not ready'} — ${h.inferenceMessage}\nWorker: ${h.paused ? 'PAUSED' : h.worker.busy ? `running ${short(h.worker.taskId)}` : 'idle'} · pending approvals: ${h.pendingApprovals}\nUsage: ${h.usage.inputTokens} in / ${h.usage.outputTokens} out tokens over ${h.usage.tasks} tasks · memory ${Math.round(h.resources.rssBytes / 1048576)} MB · db ${Math.round(h.resources.databaseBytes / 1024)} KB\nTools: ${h.tools.join(', ')}`));
    }
    case 'pause': case 'resume': {
      const r = await request(`service.${cmd}`);
      return print(r, () => console.log(r.paused ? 'Paused: no new steps will start; the running task returns to the queue at its next step.' : 'Resumed.'));
    }
    case 'ask': {
      const noWait = args.includes('--no-wait');
      const goal = [sub, ...rest].filter(a => a !== '--no-wait').join(' ');
      if (!goal.trim()) fail('Usage: milo ask "<goal>" [--goal <id>]');
      const task = await request('tasks.create', { goal, ...(flags.goal ? { goalId: await resolveId('goals', flags.goal) } : {}) });
      if (noWait) return print(task, () => console.log(`Queued ${short(task.id)}`));
      const done = await follow(task.id);
      return print(done, () => console.log(done.status === 'completed' ? done.result : `${done.status}${done.error ? `: ${done.error}` : ''}`));
    }
    case 'goal': case 'goals': {
      if (!sub || sub === 'list') { const l = await request('goals.list'); return print(l, () => { if (!l.length) console.log('No goals.'); for (const g of l) console.log(`${short(g.id)}  ${g.status.padEnd(8)} ${g.title}  (${g.tasks.completed}/${g.tasks.total} tasks done, ${g.schedules} schedules)`); }); }
      if (sub === 'add') { const g = await request('goals.create', { title: rest[0], description: rest.slice(1).join(' ') }); return print(g, () => console.log(`Goal ${short(g.id)} created`)); }
      if (sub === 'show') { const g = await request('goals.get', { id: await resolveId('goals', rest[0]) }); return print(g, () => { console.log(`${g.title} · ${g.status}\n${g.description}${g.notes ? `\nNotes: ${g.notes}` : ''}`); for (const t of g.tasks) console.log(`  ${short(t.id)} ${t.status.padEnd(16)} ${t.goal.split('\n')[0].slice(0, 70)}`); }); }
      if (['pause', 'activate', 'achieve', 'archive'].includes(sub)) {
        const status = { pause: 'paused', activate: 'active', achieve: 'achieved', archive: 'archived' }[sub as 'pause'];
        const g = await request('goals.update', { id: await resolveId('goals', rest[0]), status });
        return print(g, () => console.log(`${short(g.id)} ${g.status}`));
      }
      return fail('Usage: milo goal list|add "<title>" [description]|show <id>|pause|activate|achieve|archive <id>');
    }
    case 'tasks': {
      const status = flags['status'];
      const tasks = await request('tasks.list', status ? { status } : {});
      return print(tasks, () => { for (const t of tasks) console.log(`${short(t.id)}  ${t.status.padEnd(16)} ${t.createdAt.slice(0, 16).replace('T', ' ')}  ${t.goal.split('\n')[0].slice(0, 70)}`); });
    }
    case 'task': {
      const t = await request('tasks.get', { id: await resolveId('tasks', sub), detail: true });
      return print(t, () => {
        console.log(`${t.id}\n${t.status} · steps ${t.steps} · recoveries ${t.recoveries}\nGoal: ${t.goal}`);
        for (const c of t.toolCalls) console.log(`  • ${c.name} [${c.status}${c.tier ? `, ${c.tier}` : ''}] ${JSON.stringify(c.arguments).slice(0, 100)}`);
        for (const e of t.effects) console.log(`  ↳ effect ${e.kind} ${e.target ?? ''} → ${e.state}`);
        if (t.result) console.log(`Result:\n${t.result}`);
        if (t.error) console.log(`Error: ${t.error}`);
      });
    }
    case 'cancel': { const t = await request('tasks.cancel', { id: await resolveId('tasks', sub) }); return print(t, () => console.log(`${short(t.id)} ${t.status}`)); }
    case 'review': { const t = await request('tasks.review', { id: await resolveId('tasks', sub), action: rest[0] }); return print(t, () => console.log(`${short(t.id)} ${t.status}`)); }
    case 'approvals': {
      const list = await request('approvals.list', { status: 'pending' });
      return print(list, () => { if (!list.length) console.log('No pending approvals.'); for (const a of list) console.log(`${short(a.id)}  [${a.tier}] ${a.summary}${a.reasons.length ? ` — ${a.reasons.join('; ')}` : ''}`); });
    }
    case 'approve': case 'deny': {
      const a = await request('approvals.decide', { id: await resolveId('approvals', sub), decision: cmd, scope: rest.includes('--task') ? 'task' : 'once' });
      return print(a, () => console.log(`${short(a.id)} ${a.status}`));
    }
    case 'schedule': {
      const tz = flags['tz'];
      if (sub === 'list' || !sub) { const l = await request('schedules.list'); return print(l, () => { for (const s of l) console.log(`${short(s.id)}  ${s.enabled ? 'on ' : 'off'}  ${s.expression} (${s.timezone})  next ${s.nextFireAt ?? '—'}  ${s.goal.slice(0, 60)}`); }); }
      if (sub === 'add') { const s = await request('schedules.create', { expression: rest[0], goal: rest.slice(1).join(' '), ...(tz ? { timezone: tz } : {}), ...(flags.goal ? { goalId: await resolveId('goals', flags.goal) } : {}) }); return print(s, () => console.log(`Scheduled ${short(s.id)}; next run ${s.nextFireAt}`)); }
      if (sub === 'preview') { const p = await request('schedules.preview', { expression: rest[0], ...(tz ? { timezone: tz } : {}) }); return print(p, () => p.instants.forEach((i: string) => console.log(new Date(i).toString()))); }
      if (sub === 'rm') { const r = await request('schedules.delete', { id: await resolveId('schedules', rest[0]) }); return print(r, () => console.log(r.deleted ? 'Deleted' : 'Not found')); }
      if (sub === 'on' || sub === 'off') { const s = await request('schedules.setEnabled', { id: await resolveId('schedules', rest[0]), enabled: sub === 'on' }); return print(s, () => console.log(`${short(s.id)} ${s.enabled ? 'enabled' : 'disabled'}`)); }
      return fail('Usage: milo schedule list|add|rm|on|off|preview');
    }
    case 'memory': {
      if (sub === 'list' || !sub) { const l = await request('memory.list'); return print(l, () => { for (const m of l) console.log(`${short(m.id)}  ${m.namespace.padEnd(5)} [${m.source}] ${m.text}`); }); }
      if (sub === 'add') { const m = await request('memory.add', { namespace: rest[0], text: rest.slice(1).join(' ') }); return print(m, () => console.log(`Remembered ${short(m.id)}`)); }
      if (sub === 'rm') { const r = await request('memory.delete', { id: await resolveId('memory', rest[0]) }); return print(r, () => console.log(r.deleted ? 'Deleted' : 'Not found')); }
      if (sub === 'search') { const r = await request('memory.search', { query: rest.join(' ') }); return print(r, () => { for (const m of r) console.log(`${m.score.toFixed(2)}  [${m.source}] ${m.text}`); }); }
      return fail('Usage: milo memory list|add|rm|search');
    }
    case 'perms': {
      const patch: Record<string, unknown> = {};
      const grant = flags['grant'];
      const current = await request('permissions.get');
      if (grant) patch.fileRoots = [...current.fileRoots, path.resolve(grant)];
      if (args.includes('--revoke-folders')) patch.fileRoots = [];
      for (const [f, key] of [['network', 'network'], ['shell', 'shell'], ['auto-writes', 'autoApproveFileWrites']] as const) { const v = bool(flags[f]); if (v !== undefined) patch[key] = v; }
      const p = Object.keys(patch).length ? await request('permissions.set', patch) : current;
      return print(p, () => console.log(`Folders: ${p.fileRoots.length ? p.fileRoots.join(', ') : 'none'}\nNetwork: ${p.network ? 'on' : 'off'} · Shell: ${p.shell ? 'on' : 'off'} · Auto-approve writes: ${p.autoApproveFileWrites ? 'on' : 'off'}`));
    }
    case 'model': {
      const inference: Record<string, unknown> = {};
      const backend = flags['backend']; const url = flags['url']; const model = flags['model']; const remote = bool(flags['allow-remote']);
      if (backend) inference.backend = backend; if (url) inference.baseUrl = url; if (model) inference.model = model; if (remote !== undefined) inference.allowRemote = remote;
      const s = Object.keys(inference).length ? await request('settings.set', { inference }) : await request('settings.get');
      const h = await request('health');
      return print({ ...s, status: h }, () => console.log(`Backend: ${s.inference.backend}${s.inference.model ? ` · ${s.inference.model}` : ''}${s.inference.baseUrl ? ` @ ${s.inference.baseUrl}` : ''}\nStatus: ${h.inferenceReady ? 'ready' : 'not ready'} — ${h.inferenceMessage}`));
    }
    case 'service': {
      const servicePath = path.join(here, 'service.ts');
      if (sub === 'start') { const child = spawn(process.execPath, ['--experimental-strip-types', '--no-warnings', servicePath], { stdio: 'inherit' }); child.on('exit', c => process.exit(c ?? 0)); return; }
      if (sub === 'install') { const p = launchd.install({ servicePath, serviceDir: defaultServiceDir(), customDir: !!process.env.MILO_SERVICE_DIR }); return print({ plist: p, ...launchd.status() }, () => console.log(`Installed ${launchd.LABEL} (${p}); it starts at login and restarts after crashes.`)); }
      if (sub === 'uninstall') { launchd.uninstall(); return print({ uninstalled: true }, () => console.log('Removed the login agent. Task data was kept in the service directory.')); }
      if (sub === 'status' || !sub) { const s = launchd.status(); return print(s, () => console.log(`Login agent: ${s.installed ? 'installed' : 'not installed'} · ${s.loaded ? `loaded${s.pid ? `, pid ${s.pid}` : ', not running'}` : 'not loaded'}`)); }
      return fail('Usage: milo service start|install|uninstall|status');
    }
    default: fail(`Unknown command: ${cmd}. Run milo help.`);
  }
}

main().catch(e => { console.error(e instanceof ServiceError ? e.message : (e as Error).stack); process.exit(1); });
