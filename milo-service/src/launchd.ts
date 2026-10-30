// Per-user launchd registration for development builds. Concepts from Aiden
// core/v4/daemon/supervisor.ts and templates/launchd.plist.template (AGPL-3.0-only,
// Copyright (c) 2026 Shiva Deore / Taracod). A signed release should register a bundled helper
// through Service Management (SMAppService) instead; this LaunchAgent runs the dev service with the
// current Node binary.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const LABEL = 'com.areendabadghav.milo.service';
export function plistPath(): string { return path.join(os.homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`); }
const domain = () => `gui/${process.getuid!()}`;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderPlist(o: { nodeBin: string; servicePath: string; serviceDir: string; logDir: string; customDir: boolean }): string {
  const args = [o.nodeBin, '--experimental-strip-types', '--no-warnings', o.servicePath].map(a => `    <string>${esc(a)}</string>`).join('\n');
  const env = o.customDir ? `  <key>EnvironmentVariables</key>\n  <dict>\n    <key>MILO_SERVICE_DIR</key>\n    <string>${esc(o.serviceDir)}</string>\n  </dict>\n` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
${args}
  </array>
${env}  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <dict>
    <key>SuccessfulExit</key>
    <false/>
  </dict>
  <key>ThrottleInterval</key>
  <integer>10</integer>
  <key>WorkingDirectory</key>
  <string>${esc(path.dirname(o.servicePath))}</string>
  <key>StandardOutPath</key>
  <string>${esc(path.join(o.logDir, 'service.log'))}</string>
  <key>StandardErrorPath</key>
  <string>${esc(path.join(o.logDir, 'service.err.log'))}</string>
</dict>
</plist>
`;
}

export function status(): { installed: boolean; loaded: boolean; pid: number | null } {
  const installed = fs.existsSync(plistPath());
  try {
    const out = execFileSync('launchctl', ['print', `${domain()}/${LABEL}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const pid = out.match(/\bpid = (\d+)/)?.[1];
    return { installed, loaded: true, pid: pid ? Number(pid) : null };
  } catch { return { installed, loaded: false, pid: null }; }
}

export function install(o: { servicePath: string; serviceDir: string; customDir: boolean }): string {
  const logDir = path.join(os.homedir(), 'Library', 'Logs', 'Milo');
  fs.mkdirSync(logDir, { recursive: true, mode: 0o700 });
  fs.mkdirSync(path.dirname(plistPath()), { recursive: true });
  if (status().loaded) uninstall();
  fs.writeFileSync(plistPath(), renderPlist({ nodeBin: process.execPath, servicePath: o.servicePath, serviceDir: o.serviceDir, logDir, customDir: o.customDir }), { mode: 0o644 });
  execFileSync('launchctl', ['bootstrap', domain(), plistPath()], { stdio: 'inherit' });
  return plistPath();
}

/** Stops the agent and removes the registration. Task data in the service directory is kept. */
export function uninstall(): void {
  try { execFileSync('launchctl', ['bootout', `${domain()}/${LABEL}`], { stdio: 'ignore' }); } catch { /* not loaded */ }
  fs.rmSync(plistPath(), { force: true });
}
