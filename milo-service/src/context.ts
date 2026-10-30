// Fits a task's conversation into the model's context window. Compaction changes only the prompt
// sent for this step; the persisted message log keeps every result. Older tool results are elided
// first (they are the bulk and can be re-fetched), then older assistant text is shortened, and only
// then are the arguments of older tool calls (e.g. a large file_write body) replaced by a short
// placeholder that keeps the tool name. The user's goal, the system prompt and the latest step are always kept. Aiden's contextCompressor.ts
// summarizes with an auxiliary model call; a deterministic elision is used here because a small
// local model is the only model and summarizing would cost a full extra generation per step.
import type { Message, ToolSchema } from './inference/types.ts';

/** Heuristic only: count non-ASCII UTF-8 bytes conservatively and budget ASCII at 2.5 chars/token.
 * A backend-specific tokenizer is still required for an exact context guarantee. */
export function estimateTokens(text: string): number {
  let ascii = 0; let other = 0;
  for (const ch of text) { if (ch.codePointAt(0)! < 128) ascii++; else other += Buffer.byteLength(ch); }
  return Math.ceil(ascii / 2.5) + other;
}
export function estimateMessages(messages: Message[]): number {
  return messages.reduce((n, m) => n + 4 + estimateTokens(m.content) + (m.role === 'assistant' && m.toolCalls ? estimateTokens(JSON.stringify(m.toolCalls)) : 0), 0);
}
export function estimateTools(tools: ToolSchema[]): number { return estimateTokens(JSON.stringify(tools)); }

/** Serialized tool-call arguments shorter than this are not worth a placeholder. */
const ARGUMENT_ELISION_MIN = 400;

export type Compaction = { messages: Message[]; estimatedTokens: number; elidedResults: number; shortenedReplies: number; elidedArguments: number; /** Which messages were changed, so callers can tell whether the prompt differs from the previous step's. */ signature: string; fits: boolean };

export function fitContext(messages: Message[], budgetTokens: number): Compaction {
  let current = messages.slice();
  let estimate = estimateMessages(current);
  const out = { elidedResults: 0, shortenedReplies: 0, elidedArguments: 0 };
  const touched = { r: [] as number[], s: [] as number[], a: [] as number[] };
  const signature = () => (['r', 's', 'a'] as const).map(k => `${k}:${touched[k].join(',')}`).join('|');
  if (estimate <= budgetTokens) return { messages: current, estimatedTokens: estimate, ...out, signature: '', fits: true };
  // Protect the latest step: the last assistant message and everything after it.
  let protectFrom = current.length;
  for (let i = current.length - 1; i >= 0; i--) if (current[i].role === 'assistant') { protectFrom = i; break; }
  for (let i = 0; i < protectFrom && estimate > budgetTokens; i++) {
    const m = current[i];
    if (m.role !== 'tool' || m.content.length < 200) continue;
    const stub = JSON.stringify({ elided: true, note: `Older tool result removed to fit the context window (${m.content.length} characters). Call the tool again if you need it.` });
    estimate -= estimateTokens(m.content) - estimateTokens(stub);
    current[i] = { ...m, content: stub };
    out.elidedResults++; touched.r.push(i);
  }
  for (let i = 0; i < protectFrom && estimate > budgetTokens; i++) {
    const m = current[i];
    if (m.role !== 'assistant' || m.content.length < 400) continue;
    const short = `${m.content.slice(0, 300)}… [shortened]`;
    estimate -= estimateTokens(m.content) - estimateTokens(short);
    current[i] = { ...m, content: short };
    out.shortenedReplies++; touched.s.push(i);
  }
  // Last resort: large arguments of older tool calls. The call id and tool name are kept so the
  // assistant/tool pairing stays valid; the placeholder says the arguments were removed.
  for (let i = 0; i < protectFrom && estimate > budgetTokens; i++) {
    const m = current[i];
    if (m.role !== 'assistant' || !m.toolCalls?.length) continue;
    let changed = false;
    const calls = m.toolCalls.map(c => {
      if (estimate <= budgetTokens) return c;
      const text = JSON.stringify(c.arguments);
      if (text.length < ARGUMENT_ELISION_MIN) return c;
      const placeholder = { elided: true, note: `Arguments of this older ${c.name} call (${text.length} characters) were removed to fit the context window.` };
      estimate -= estimateTokens(text) - estimateTokens(JSON.stringify(placeholder));
      out.elidedArguments++; changed = true;
      return { ...c, arguments: placeholder };
    });
    if (changed) { current[i] = { ...m, toolCalls: calls }; touched.a.push(i); }
  }
  return { messages: current, estimatedTokens: estimate, ...out, signature: signature(), fits: estimate <= budgetTokens };
}
