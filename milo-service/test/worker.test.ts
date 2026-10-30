import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorker } from '../src/worker.ts';
import { freshStore } from './helpers.ts';

test('a store failure stops the worker and reports fatal only once', async () => {
  const s = freshStore();
  let failures = 0;
  const worker = createWorker({ db: s.db, serviceDir: s.dir, onFatal: () => { failures++; } });
  s.db.close();
  worker.kick();
  await worker.idle();
  worker.kick();
  await worker.idle();
  assert.equal(failures, 1);
  // The database is already closed; clean up only the test directory.
  try { s.cleanup(); } catch { /* cleanup closes the store too */ }
});
