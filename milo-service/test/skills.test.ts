import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { listSkills, readSkill } from '../src/tools/skills.ts';

test('skills are bounded and reject traversal and symlinked files', () => {
  const dir = fs.mkdtempSync(path.join(process.cwd(), '.skill-test-'));
  try {
    const service = path.join(dir, 'service'); const skills = path.join(dir, 'skills');
    fs.mkdirSync(service); fs.mkdirSync(skills); fs.mkdirSync(path.join(skills, 'example'));
    fs.writeFileSync(path.join(skills, 'example', 'SKILL.md'), 'Reference text');
    fs.mkdirSync(path.join(skills, 'link')); fs.symlinkSync(path.join(skills, 'example', 'SKILL.md'), path.join(skills, 'link', 'SKILL.md'));
    assert.deepEqual(listSkills(service), ['example']);
    assert.equal(readSkill(service, 'example'), 'Reference text');
    assert.throws(() => readSkill(service, '../example'));
    assert.throws(() => readSkill(service, 'link'));
    fs.writeFileSync(path.join(skills, 'example', 'SKILL.md'), 'x'.repeat(12289));
    assert.throws(() => readSkill(service, 'example'), /12 KiB/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('successful traces produce inert proposals that require an explicit decision', async () => {
  const { openStore } = await import('../src/store.ts');
  const { createTask, setStatus } = await import('../src/jobs.ts');
  const { proposeFromTask, listProposals, decideProposal, acceptedSkills } = await import('../src/skillProposals.ts');
  const dir = fs.mkdtempSync(path.join(process.cwd(), '.skill-db-')); const db = openStore(dir);
  try {
    const task = createTask(db, 'Do not copy this secret into the proposal');
    const insert = db.prepare("INSERT INTO tool_calls (id, task_id, call_id, name, args_json, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    insert.run('1', task.id, 'call1', 'file_read', '{"secret":"do not copy"}', 'succeeded', '2026-01-01', '2026-01-01');
    insert.run('2', task.id, 'call2', 'file_write', '{}', 'succeeded', '2026-01-02', '2026-01-02');
    assert.equal(proposeFromTask(db, task.id), null);
    setStatus(db, task.id, 'completed');
    const proposal = proposeFromTask(db, task.id)!;
    assert.equal(proposal.status, 'pending'); assert.match(proposal.content, /file_read[\s\S]*file_write/);
    assert.doesNotMatch(proposal.content, /secret|do not copy/i);
    assert.equal(acceptedSkills(db).length, 0); assert.equal(proposeFromTask(db, task.id), null);
    assert.equal(decideProposal(db, proposal.id, 'accept').status, 'accepted');
    assert.equal(acceptedSkills(db)[0].content, proposal.content);
    assert.throws(() => decideProposal(db, proposal.id, 'reject'), /already decided/);
    assert.equal(listProposals(db).length, 1);
    assert.equal(decideProposal(db, proposal.id, 'revoke').status, 'revoked');
    assert.equal(acceptedSkills(db).length, 0);
  } finally { db.close(); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('old broad approval grants cannot authorize a file target after migration', async () => {
  const { openStore } = await import('../src/store.ts');
  const { hasTaskGrant } = await import('../src/jobs.ts');
  const dir = fs.mkdtempSync(path.join(process.cwd(), '.grant-db-')); const db = openStore(dir);
  try {
    db.prepare('INSERT INTO approval_grants (id, task_id, tool, approval_id, created_at) VALUES (?, ?, ?, ?, ?)').run('g', 't', 'file_write', 'a', '2026-01-01');
    assert.equal(hasTaskGrant(db, 't', 'file_write', '/some/file'), false);
  } finally { db.close(); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('a symlinked skills root or skill directory is rejected, and failed or single-tool traces propose nothing', async () => {
  const { openStore } = await import('../src/store.ts');
  const { createTask, setStatus } = await import('../src/jobs.ts');
  const { proposeFromTask } = await import('../src/skillProposals.ts');
  const dir = fs.mkdtempSync(path.join(process.cwd(), '.skill-link-'));
  try {
    const service = path.join(dir, 'service'); const real = path.join(dir, 'real'); fs.mkdirSync(service); fs.mkdirSync(path.join(real, 'example'), { recursive: true });
    fs.writeFileSync(path.join(real, 'example', 'SKILL.md'), 'Reference text');
    fs.symlinkSync(real, path.join(dir, 'skills'));
    assert.deepEqual(listSkills(service), []);
    assert.throws(() => readSkill(service, 'example'), /not found/i);
    fs.rmSync(path.join(dir, 'skills')); fs.mkdirSync(path.join(dir, 'skills')); fs.symlinkSync(path.join(real, 'example'), path.join(dir, 'skills', 'example'));
    assert.deepEqual(listSkills(service), []);
    assert.throws(() => readSkill(service, 'example'), /not found/i);

    const db = openStore(dir);
    try {
      const insert = db.prepare("INSERT INTO tool_calls (id, task_id, call_id, name, args_json, status, created_at, updated_at) VALUES (?, ?, ?, ?, '{}', ?, '2026-01-01', '2026-01-01')");
      const failed = createTask(db, 'one call failed'); insert.run('a', failed.id, 'c1', 'file_read', 'succeeded'); insert.run('b', failed.id, 'c2', 'file_write', 'failed'); setStatus(db, failed.id, 'completed');
      assert.equal(proposeFromTask(db, failed.id), null);
      const single = createTask(db, 'one call'); insert.run('c', single.id, 'c1', 'file_read', 'succeeded'); setStatus(db, single.id, 'completed');
      assert.equal(proposeFromTask(db, single.id), null);
    } finally { db.close(); }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
