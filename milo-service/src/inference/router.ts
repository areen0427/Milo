// Selects the inference backend from settings. The `engine` slot is where Milo's custom
// inference engine attaches: register a factory with registerEngine() and select backend
// "engine". Until one is registered, selecting it reports Unavailable rather than silently
// falling back, so the reported model identity stays truthful.
import type { InferenceBackend } from './types.ts';
import { InferenceError } from './types.ts';
import type { InferenceSettings } from '../settings.ts';
import { createMockBackend } from './mock.ts';
import { createOpenAICompatibleBackend } from './openaiCompatible.ts';

let engineFactory: ((settings: InferenceSettings) => InferenceBackend) | null = null;
export function registerEngine(factory: ((settings: InferenceSettings) => InferenceBackend) | null): void { engineFactory = factory; }

export function resolveBackend(settings: InferenceSettings): InferenceBackend {
  if (settings.backend === 'mock') return createMockBackend();
  if (settings.backend === 'engine') {
    if (!engineFactory) throw new InferenceError('Unavailable', 'The Milo inference engine is not installed in this build');
    return engineFactory(settings);
  }
  if (!settings.baseUrl || !settings.model) throw new InferenceError('ValidationError', 'openai_compatible backend needs baseUrl and model');
  return createOpenAICompatibleBackend({
    baseUrl: settings.baseUrl, model: settings.model, timeoutMs: settings.timeoutMs, allowRemote: settings.allowRemote,
    apiKey: process.env.MILO_INFERENCE_API_KEY ?? null,
  });
}

/** Status for health/UI. Never throws. */
export async function describeBackend(settings: InferenceSettings): Promise<{ backend: string; model: string | null; local: boolean; ready: boolean; message: string }> {
  try {
    const b = resolveBackend(settings);
    const r = await b.ready();
    return { backend: b.identity.kind, model: b.identity.model, local: b.identity.local, ready: r.ok, message: r.message };
  } catch (e) {
    return { backend: settings.backend, model: settings.model, local: false, ready: false, message: (e as Error).message };
  }
}
