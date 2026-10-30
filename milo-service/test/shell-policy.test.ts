import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shellRun } from '../src/tools/shell.ts';
import { freshStore } from './helpers.ts';

test('all shell commands require approval and record an uncertain process effect', async () => {
  const s = freshStore();
  try {
    const ctx = { db: s.db, taskId: 'task', toolCallId: 'call', serviceDir: s.dir,
      permissions: { fileRoots: [s.files], shell: true, network: false, autoApproveFileWrites: true },
      signal: new AbortController().signal };
    // An executable with an allowlisted basename may be arbitrary code. Shell and git
    // also interpret arguments and configuration in ways a regex cannot reliably prove safe.
    for (const command of ['cat f.txt', '/tmp/cat f.txt', 'git status', 'rm -rf build']) {
      const args = { command };
      assert.equal((await shellRun.assess(args, ctx)).decision, 'ask', command);
      assert.equal(shellRun.planEffect!(args, ctx)?.kind, 'process.exec', command);
    }
  } finally { s.cleanup(); }
});
