// File tools. Behavior informed by Aiden tools/v4/files/{fileRead,fileList,fileWrite}.ts
// (AGPL-3.0-only, Copyright (c) 2026 Shiva Deore / Taracod), rebuilt around scoped real paths,
// bounded output and an effect record for every write.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { ToolDefinition } from './registry.ts';
import { ToolFailure } from './registry.ts';
import { resolveScoped } from './paths.ts';
import { observeFile, sha256 } from '../effects.ts';
import { scanContent } from '../policy/contentScanner.ts';

const MAX_READ = 256 * 1024;
const MAX_WRITE = 1024 * 1024;

export const fileRead: ToolDefinition = {
  name: 'file_read',
  description: 'Read a UTF-8 text file inside a folder the user granted. Returns at most maxBytes (default 65536) starting at offset.',
  inputSchema: { type: 'object', properties: { path: { type: 'string', maxLength: 4096 }, offset: { type: 'integer', minimum: 0 }, maxBytes: { type: 'integer', minimum: 1, maximum: MAX_READ } }, required: ['path'], additionalProperties: false },
  mutates: false,
  assess(args, ctx) {
    if (!ctx.permissions.fileRoots.length) return { decision: 'deny', tier: 'safe', reasons: ['No folders granted'], summary: `Read ${args.path}` };
    return { decision: 'allow', tier: 'safe', reasons: [], summary: `Read ${args.path}` };
  },
  async execute(args, ctx) {
    const real = resolveScoped(args.path as string, ctx.permissions.fileRoots, ctx.serviceDir);
    const st = fs.statSync(real);
    if (!st.isFile()) throw new ToolFailure('not_a_file', `${args.path} is not a regular file`);
    const offset = (args.offset as number | undefined) ?? 0;
    const max = (args.maxBytes as number | undefined) ?? 65536;
    const fd = fs.openSync(real, 'r');
    try {
      const buf = Buffer.alloc(Math.max(0, Math.min(max, st.size - offset)));
      const n = buf.length ? fs.readSync(fd, buf, 0, buf.length, offset) : 0;
      const bytes = buf.subarray(0, n);
      if (bytes.includes(0)) return { path: real, size: st.size, binary: true, content: null };
      return { path: real, size: st.size, offset, content: bytes.toString('utf8'), truncated: offset + n < st.size };
    } finally { fs.closeSync(fd); }
  },
};

export const fileList: ToolDefinition = {
  name: 'file_list',
  description: 'List entries of a directory inside a folder the user granted.',
  inputSchema: { type: 'object', properties: { path: { type: 'string', maxLength: 4096 }, maxEntries: { type: 'integer', minimum: 1, maximum: 1000 } }, required: ['path'], additionalProperties: false },
  mutates: false,
  assess(args, ctx) {
    if (!ctx.permissions.fileRoots.length) return { decision: 'deny', tier: 'safe', reasons: ['No folders granted'], summary: `List ${args.path}` };
    return { decision: 'allow', tier: 'safe', reasons: [], summary: `List ${args.path}` };
  },
  async execute(args, ctx) {
    const real = resolveScoped(args.path as string, ctx.permissions.fileRoots, ctx.serviceDir);
    if (!fs.statSync(real).isDirectory()) throw new ToolFailure('not_a_directory', `${args.path} is not a directory`);
    const max = (args.maxEntries as number | undefined) ?? 200;
    const all = fs.readdirSync(real, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    const entries = all.slice(0, max).map(d => {
      const type = d.isDirectory() ? 'directory' : d.isFile() ? 'file' : d.isSymbolicLink() ? 'symlink' : 'other';
      let size: number | undefined;
      if (type === 'file') { try { size = fs.statSync(path.join(real, d.name)).size; } catch { /* raced */ } }
      return { name: d.name, type, ...(size !== undefined ? { size } : {}) };
    });
    return { path: real, entries, truncated: all.length > max, total: all.length };
  },
};

/** The path may have been re-pointed (symlink swap) since the decision was made; refuse to write elsewhere. */
function sameTarget(real: string, ctx: { expectedTarget?: string | null }): void {
  if (ctx.expectedTarget !== undefined && ctx.expectedTarget !== real) throw new ToolFailure('target_changed', 'The resolved file target changed since it was approved; request the action again.');
}

export const fileWrite: ToolDefinition = {
  name: 'file_write',
  description: 'Create or replace a UTF-8 text file inside a folder the user granted. Set overwrite=true to replace an existing file. Requires user approval unless the user enabled automatic file-write approval.',
  inputSchema: { type: 'object', properties: { path: { type: 'string', maxLength: 4096 }, content: { type: 'string', maxLength: MAX_WRITE }, overwrite: { type: 'boolean' } }, required: ['path', 'content'], additionalProperties: false },
  mutates: true,
  groundedOnly: true,
  assess(args, ctx) {
    const content = args.content as string;
    const findings = scanContent(content);
    // Show what will be written so the user can catch a wrong value; never echo flagged content.
    const preview = findings.length ? ' (content hidden: flagged by scanner)' : `: “${content.length > 120 ? content.slice(0, 120).replace(/\s+/g, ' ') + '…' : content.replace(/\s+/g, ' ')}”`;
    const summary = `Write ${Buffer.byteLength(content)} bytes to ${args.path}${preview}`;
    if (!ctx.permissions.fileRoots.length) return { decision: 'deny', tier: 'caution', reasons: ['No folders granted'], summary };
    let real: string;
    try { real = resolveScoped(args.path as string, ctx.permissions.fileRoots, ctx.serviceDir, { write: true }); }
    catch (e) { return { decision: 'deny', tier: 'caution', reasons: [(e as Error).message], summary }; }
    const exists = fs.existsSync(real);
    if (exists && args.overwrite !== true) return { decision: 'deny', tier: 'caution', reasons: ['File exists; pass overwrite=true to replace it'], summary };
    const reasons = findings.map(f => f.description);
    if (exists) reasons.push('Replaces an existing file');
    const flagged = findings.some(f => f.severity === 'dangerous');
    if (flagged) return { decision: 'ask', tier: 'dangerous', reasons, summary };
    const auto = ctx.permissions.autoApproveFileWrites && findings.length === 0;
    return { decision: auto ? 'allow' : 'ask', tier: auto ? 'safe' : 'caution', reasons, summary };
  },
  planEffect(args, ctx) {
    const real = resolveScoped(args.path as string, ctx.permissions.fileRoots, ctx.serviceDir, { write: true });
    sameTarget(real, ctx);
    const content = args.content as string;
    return { kind: 'filesystem.write', target: real, reconciliation: { path: real, expectedContentSha256: sha256(content), expectedSize: Buffer.byteLength(content), before: observeFile(real) } };
  },
  async execute(args, ctx) {
    const real = resolveScoped(args.path as string, ctx.permissions.fileRoots, ctx.serviceDir, { write: true });
    sameTarget(real, ctx);
    if (fs.existsSync(real) && args.overwrite !== true) throw new ToolFailure('exists', 'File exists; pass overwrite=true to replace it');
    if (fs.existsSync(real) && !fs.lstatSync(real).isFile()) throw new ToolFailure('not_a_file', `${args.path} is not a regular file`);
    const temp = path.join(path.dirname(real), `.milo-${crypto.randomUUID()}.tmp`);
    const fd = fs.openSync(temp, 'wx', 0o644);
    try { fs.writeFileSync(fd, args.content as string); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    try {
      if (args.overwrite === true) fs.renameSync(temp, real);
      else {
        // link is atomic and fails if another process created the destination after assessment.
        try { fs.linkSync(temp, real); }
        catch (e) { if ((e as NodeJS.ErrnoException).code === 'EEXIST') throw new ToolFailure('exists', 'File exists; pass overwrite=true to replace it'); throw e; }
        fs.unlinkSync(temp);
      }
    } catch (e) { fs.rmSync(temp, { force: true }); throw e; }
    return { path: real, bytes: Buffer.byteLength(args.content as string), sha256: sha256(args.content as string) };
  },
};
