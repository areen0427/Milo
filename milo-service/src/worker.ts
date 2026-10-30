// Single worker: runs queued tasks one at a time (one local model is the bottleneck).
// Shutdown does not cancel the running task; it stays `running` on disk and startup recovery
// decides whether it can resume. Only a user cancel aborts work.
import type { DB } from './store.ts';
import { emit } from './store.ts';
import { endAttempt, getTask, nextQueued, setStatus, startAttempt } from './jobs.ts';
import { runAttempt } from './agent.ts';
import { resolveBackend } from './inference/router.ts';
import { getInference, isPaused } from './settings.ts';
import type { LookupFn } from './policy/ssrf.ts';

export type Worker = { kick(): void; abort(taskId: string): void; stop(): void; current(): string | null; idle(): Promise<void> };

export function createWorker(opts: { db: DB; serviceDir: string; lookup?: LookupFn; onFatal: (e: Error) => void }): Worker {
  const { db } = opts;
  let active: { taskId: string; controller: AbortController } | null = null;
  let loop: Promise<void> | null = null;
  let stopped = false;

  async function drain(): Promise<void> {
    while (!stopped) {
      if (isPaused(db)) return;
      const task = nextQueued(db);
      if (!task) return;
      let backend;
      try { backend = resolveBackend(getInference(db)); }
      catch (e) { setStatus(db, task.id, 'failed', { error: `Inference unavailable: ${(e as Error).message}` }); continue; }
      const controller = new AbortController();
      active = { taskId: task.id, controller };
      setStatus(db, task.id, 'running');
      const attemptId = startAttempt(db, task.id, backend.identity.id);
      emit(db, task.id, 'attempt.started', { backend: backend.identity.id });
      try {
        const outcome = await runAttempt(task.id, { db, backend, serviceDir: opts.serviceDir, signal: controller.signal, lookup: opts.lookup });
        if (stopped && getTask(db, task.id)?.status === 'running') return; // leave for recovery
        endAttempt(db, attemptId, outcome);
      } catch (e) {
        if (stopped) return;
        // A throw here means persistence failed or a bug escaped the agent; record it and stop
        // rather than risk running further work on an inconsistent store.
        try { endAttempt(db, attemptId, 'error'); setStatus(db, task.id, 'failed', { error: `Internal error: ${(e as Error).message}` }); } catch { /* store unusable */ }
        stopped = true;
        opts.onFatal(e as Error);
        return;
      } finally { active = null; }
    }
  }

  return {
    kick() {
      if (stopped || loop) return;
      loop = drain().then(() => {
        loop = null;
        if (stopped) return;
        try { if (!isPaused(db) && nextQueued(db)) this.kick(); }
        catch (e) { stopped = true; opts.onFatal(e as Error); }
      }, e => {
        loop = null;
        stopped = true;
        opts.onFatal(e as Error);
      });
    },
    abort(taskId) { if (active?.taskId === taskId) active.controller.abort(); },
    stop() { stopped = true; },
    current() { return active?.taskId ?? null; },
    async idle() { while (loop) await loop; },
  };
}
