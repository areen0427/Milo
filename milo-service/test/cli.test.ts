import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root, startService, stopService, tempDir } from './helpers.ts';
import type { Service } from './helpers.ts';
import { renderPlist, LABEL } from '../src/launchd.ts';

function milo(dir: string, ...args: string[]): any {
  const out = execFileSync(process.execPath, ['--experimental-strip-types', '--no-warnings', path.join(root, 'cli.ts'), ...args, '--json'], { env: { ...process.env, MILO_SERVICE_DIR: dir }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return JSON.parse(out);
}

test('CLI drives the same service as the app', async () => {
  const dir = tempDir(); const files = tempDir('milo-files-'); let s: Service | undefined;
  try {
    s = startService(dir); await s.ready;
    assert.equal(milo(dir, 'status').inference, 'mock');
    assert.deepEqual(milo(dir, 'perms', '--grant', files, '--network', 'on').fileRoots, [files]);
    const sched = milo(dir, 'schedule', 'add', '0 9 * * *', 'daily', 'check', '--tz', 'Asia/Tokyo');
    assert.equal(sched.goal, 'daily check');
    assert.equal(sched.timezone, 'Asia/Tokyo');
    const done = milo(dir, 'ask', 'hello there');
    assert.equal(done.status, 'completed');
    assert.equal(milo(dir, 'tasks').length, 1);
    assert.equal(milo(dir, 'memory', 'add', 'notes', 'Repo uses vitest').source, 'said');
  } finally { await stopService(s); fs.rmSync(dir, { recursive: true, force: true }); fs.rmSync(files, { recursive: true, force: true }); }
});

test('CLI reports a stopped service clearly', () => {
  const dir = tempDir();
  try {
    assert.throws(() => milo(dir, 'status'), (e: any) => /not running/.test(String(e.stderr)));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('launchd plist is valid and escapes paths', () => {
  const xml = renderPlist({ nodeBin: '/usr/local/bin/node', servicePath: '/Users/a & b/<milo>/service.ts', serviceDir: '/tmp/s', logDir: '/tmp/l', customDir: true });
  assert.match(xml, new RegExp(`<string>${LABEL}</string>`));
  assert.match(xml, /a &amp; b\/&lt;milo&gt;/);
  assert.match(xml, /MILO_SERVICE_DIR/);
  const file = path.join(tempDir(), 'x.plist');
  fs.writeFileSync(file, xml);
  try { execFileSync('plutil', ['-lint', file], { stdio: 'ignore' }); }
  finally { fs.rmSync(path.dirname(file), { recursive: true, force: true }); }
  assert.doesNotMatch(renderPlist({ nodeBin: 'n', servicePath: '/s.ts', serviceDir: '/d', logDir: '/l', customDir: false }), /MILO_SERVICE_DIR/);
});
