// Inference boundary. Ported and narrowed from Aiden providers/v4/types.ts
// (AGPL-3.0-only, Copyright (c) 2026 Shiva Deore / Taracod). Every backend — the mock, a local
// OpenAI-compatible server, and the future custom engine — implements InferenceBackend.

export type ToolSchema = {
  name: string;
  description: string;
  inputSchema: { type: 'object'; properties: Record<string, unknown>; required?: string[]; additionalProperties?: boolean };
};
export type ToolCallRequest = { id: string; name: string; arguments: Record<string, unknown> };

export type Message =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; toolCalls?: ToolCallRequest[] }
  | { role: 'tool'; toolCallId: string; content: string };

export type InferenceRequest = {
  messages: Message[];
  tools: ToolSchema[];
  maxTokens: number;
  temperature: number;
  signal: AbortSignal;
  /** Correlation only; a backend must not share cached state across tasks. */
  taskId: string;
};

export type Usage = { inputTokens: number; outputTokens: number };
export type InferenceResult = {
  content: string | null;
  toolCalls: ToolCallRequest[];
  finishReason: 'stop' | 'tool_use' | 'length' | 'error';
  usage: Usage;
};

export type StreamEvent =
  | { type: 'delta'; content: string }
  | { type: 'tool_call'; toolCall: ToolCallRequest }
  | { type: 'done'; result: InferenceResult };

export type BackendIdentity = { id: string; kind: 'mock' | 'openai_compatible' | 'engine'; model: string | null; local: boolean };

export interface InferenceBackend {
  identity: BackendIdentity;
  /** Cheap readiness probe for health/status; must not run a generation. */
  ready(): Promise<{ ok: boolean; message: string }>;
  call(req: InferenceRequest): Promise<InferenceResult>;
  stream?(req: InferenceRequest): AsyncGenerator<StreamEvent, void, void>;
}

/** Failure classes drive retry policy (see jobs.ts). */
export class InferenceError extends Error {
  errorClass: 'NetworkError' | 'TimeoutError' | 'ResourceExhausted' | 'ValidationError' | 'AuthError' | 'Unavailable' | 'Cancelled';
  /** Set to false to stop the agent retrying an error whose class is otherwise retryable. */
  retryable?: boolean;
  constructor(errorClass: InferenceError['errorClass'], message: string, opts?: { retryable?: boolean }) { super(message); this.errorClass = errorClass; if (opts?.retryable !== undefined) this.retryable = opts.retryable; }
}
