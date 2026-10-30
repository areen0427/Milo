// User-controlled permissions and service settings. Nothing is granted by default.
import fs from 'node:fs';
import path from 'node:path';
import type { DB } from './store.ts';
import { getSetting, setSetting } from './store.ts';

export type Permissions = { fileRoots: string[]; network: boolean; shell: boolean; autoApproveFileWrites: boolean };
export const DEFAULT_PERMISSIONS: Permissions = { fileRoots: [], network: false, shell: false, autoApproveFileWrites: false };

export type InferenceSettings = {
  backend: 'mock' | 'openai_compatible' | 'engine';
  baseUrl: string | null; model: string | null; allowRemote: boolean;
  timeoutMs: number; maxTokens: number; temperature: number;
  /** Model context window in tokens; prompts are compacted to fit. */
  contextTokens: number;
};
export const DEFAULT_INFERENCE: InferenceSettings = { backend: 'mock', baseUrl: null, model: null, allowRemote: false, timeoutMs: 120_000, maxTokens: 1024, temperature: 0.2, contextTokens: 8192 };

export type AgentSettings = { maxSteps: number; maxRecoveries: number };
export const DEFAULT_AGENT: AgentSettings = { maxSteps: 24, maxRecoveries: 3 };

export class ValidationError extends Error {}
function fail(message: string): never { throw new ValidationError(message); }

export function getPermissions(db: DB): Permissions { return { ...DEFAULT_PERMISSIONS, ...getSetting(db, 'permissions', {}) }; }
export function setPermissions(db: DB, serviceDir: string, patch: unknown): Permissions {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) fail('permissions must be an object');
  const p = patch as Record<string, unknown>;
  const next = getPermissions(db);
  for (const key of Object.keys(p)) if (!(key in DEFAULT_PERMISSIONS)) fail(`Unknown permission: ${key}`);
  for (const key of ['network', 'shell', 'autoApproveFileWrites'] as const) {
    if (key in p) { if (typeof p[key] !== 'boolean') fail(`${key} must be a boolean`); next[key] = p[key] as boolean; }
  }
  if ('fileRoots' in p) {
    if (!Array.isArray(p.fileRoots) || p.fileRoots.length > 32) fail('fileRoots must be an array of at most 32 paths');
    const service = fs.realpathSync(serviceDir);
    next.fileRoots = [...new Set(p.fileRoots.map(root => {
      if (typeof root !== 'string' || !path.isAbsolute(root)) fail('Each file root must be an absolute path');
      let real: string;
      try { real = fs.realpathSync(root); } catch { fail(`File root does not exist: ${root}`); }
      if (!fs.statSync(real).isDirectory()) fail(`File root is not a directory: ${root}`);
      if (real === path.parse(real).root) fail('The filesystem root cannot be granted');
      if (real === service || service.startsWith(real + path.sep) || real.startsWith(service + path.sep)) fail("Milo's own service directory cannot be granted");
      return real;
    }))];
  }
  setSetting(db, 'permissions', next);
  return next;
}

export function getInference(db: DB): InferenceSettings {
  const stored = { ...DEFAULT_INFERENCE, ...getSetting(db, 'inference', {}) };
  // Environment overrides are for development; they are not persisted.
  if (process.env.MILO_INFERENCE_URL) { stored.backend = 'openai_compatible'; stored.baseUrl = process.env.MILO_INFERENCE_URL; }
  if (process.env.MILO_INFERENCE_MODEL) stored.model = process.env.MILO_INFERENCE_MODEL;
  return stored;
}
export function setInference(db: DB, patch: unknown): InferenceSettings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) fail('inference settings must be an object');
  const p = patch as Record<string, unknown>;
  const next = { ...DEFAULT_INFERENCE, ...getSetting(db, 'inference', {}) } as InferenceSettings;
  for (const key of Object.keys(p)) if (!(key in DEFAULT_INFERENCE)) fail(`Unknown inference setting: ${key}`);
  if ('backend' in p) { if (!['mock', 'openai_compatible', 'engine'].includes(p.backend as string)) fail('backend must be mock, openai_compatible or engine'); next.backend = p.backend as InferenceSettings['backend']; }
  if ('baseUrl' in p) {
    if (p.baseUrl !== null) {
      if (typeof p.baseUrl !== 'string') fail('baseUrl must be a string or null');
      let u: URL; try { u = new URL(p.baseUrl); } catch { fail('baseUrl must be a valid URL'); }
      if (!/^https?:$/.test(u.protocol) || u.username || u.password || u.search || u.hash) fail('baseUrl must be http(s) without credentials, query or fragment');
    }
    next.baseUrl = p.baseUrl as string | null;
  }
  if ('model' in p) { if (p.model !== null && (typeof p.model !== 'string' || !p.model.trim() || p.model.length > 200)) fail('model must be a short string or null'); next.model = p.model as string | null; }
  if ('allowRemote' in p) { if (typeof p.allowRemote !== 'boolean') fail('allowRemote must be a boolean'); next.allowRemote = p.allowRemote; }
  const ranged = (key: 'timeoutMs' | 'maxTokens' | 'temperature' | 'contextTokens', lo: number, hi: number) => {
    if (!(key in p)) return;
    const v = p[key]; if (typeof v !== 'number' || !Number.isFinite(v) || (key !== 'temperature' && !Number.isInteger(v)) || v < lo || v > hi) fail(`${key} must be ${key === 'temperature' ? 'a number' : 'an integer'} between ${lo} and ${hi}`);
    next[key] = v;
  };
  ranged('timeoutMs', 1000, 600_000); ranged('maxTokens', 16, 32_768); ranged('temperature', 0, 2); ranged('contextTokens', 1024, 1_048_576);
  if (next.maxTokens >= next.contextTokens) fail('maxTokens must be smaller than contextTokens');
  setSetting(db, 'inference', next);
  return next;
}

export function getAgentSettings(db: DB): AgentSettings { return { ...DEFAULT_AGENT, ...getSetting(db, 'agent', {}) }; }
export function setAgentSettings(db: DB, patch: unknown): AgentSettings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) fail('agent settings must be an object');
  const p = patch as Record<string, unknown>;
  const next = getAgentSettings(db);
  for (const key of Object.keys(p)) {
    if (!(key in DEFAULT_AGENT)) fail(`Unknown agent setting: ${key}`);
    const v = p[key];
    if (!Number.isInteger(v) || (v as number) < (key === 'maxSteps' ? 1 : 0) || (v as number) > 90) fail(`${key} must be an integer between ${key === 'maxSteps' ? 1 : 0} and 90`);
    next[key as keyof AgentSettings] = v as number;
  }
  setSetting(db, 'agent', next);
  return next;
}

/** Paused: no new model steps start; the running task returns to the queue at its next step boundary. */
export function isPaused(db: DB): boolean { return getSetting(db, 'service', { paused: false }).paused === true; }
export function setPaused(db: DB, paused: boolean): void { setSetting(db, 'service', { paused }); }
