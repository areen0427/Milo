// Path scoping for file and process tools. Paths are resolved through symlinks and must stay inside
// a user-granted root. Sensitive locations are refused even inside a root.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ToolFailure } from './registry.ts';

const SENSITIVE = ['.ssh', '.gnupg', '.aws', '.kube', '.docker', '.netrc', 'Library/Keychains', 'Library/Cookies', 'Library/Application Support/Milo'];

function inside(child: string, parent: string): boolean { return child === parent || child.startsWith(parent.endsWith(path.sep) ? parent : parent + path.sep); }

export function isSensitive(real: string, serviceDir: string): boolean {
  const home = os.homedir();
  let service = serviceDir;
  try { service = fs.realpathSync(serviceDir); } catch { /* keep given path */ }
  if (inside(real, service)) return true;
  return SENSITIVE.some(s => inside(real, path.join(home, s))) || /(^|\/)\.env(\.|$)/.test(path.basename(real));
}

/**
 * Resolve `input` to a real path inside one of `roots`. For writes the final component may not exist,
 * but its parent must, and the parent's real path must be inside a root.
 */
export function resolveScoped(input: string, roots: string[], serviceDir: string, opts: { write?: boolean } = {}): string {
  if (!roots.length) throw new ToolFailure('permission_denied', 'No folders have been granted to Milo. Ask the user to grant a folder in Permissions.');
  if (typeof input !== 'string' || !input || input.includes('\0')) throw new ToolFailure('invalid_path', 'Path must be a nonempty string');
  const expanded = input.startsWith('~/') ? path.join(os.homedir(), input.slice(2)) : input;
  const absolute = path.isAbsolute(expanded) ? path.normalize(expanded) : path.resolve(roots[0], expanded);
  let real: string;
  try { real = fs.realpathSync(absolute); }
  catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT' || !opts.write) throw new ToolFailure('not_found', `No such file or directory: ${input}`);
    let parent: string;
    try { parent = fs.realpathSync(path.dirname(absolute)); } catch { throw new ToolFailure('not_found', `Parent directory does not exist: ${path.dirname(input)}`); }
    real = path.join(parent, path.basename(absolute));
  }
  if (!roots.some(root => inside(real, root))) throw new ToolFailure('permission_denied', `${input} is outside the folders granted to Milo`);
  if (isSensitive(real, serviceDir)) throw new ToolFailure('permission_denied', `${input} is a protected location`);
  return real;
}
