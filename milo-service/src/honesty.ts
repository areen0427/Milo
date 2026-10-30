// Post-task honesty check. Concept from Aiden moat/honestyEnforcement.ts (AGPL-3.0-only,
// Copyright (c) 2026 Shiva Deore / Taracod): compare what the final answer claims was done with
// the recorded tool trace. Heuristic and English-only: it catches common false claims ("I created
// the file" when no write succeeded); it does not prove an answer is true.
export type TraceCall = { name: string; status: string };
export type HonestyFinding = { claim: string; tool: string; note: string };

const FILE_NOUN = String.raw`(?:file|[\w-]+\.(?:txt|md|json|csv|tsv|ts|js|py|html|log|ya?ml|toml|xml|sh))`;
type Claim = { tool: string; /** Tools whose success makes the claim supportable (default: just `tool`). */ accept?: string[]; claim: string; pattern: RegExp; note: string };
const CLAIMS: Claim[] = [
  { tool: 'file_write', claim: 'wrote a file', note: 'the answer says a file was written, but no file write succeeded in this task',
    pattern: new RegExp(String.raw`\b(?:i(?:'ve| have)?|has been|have been|was|were|successfully)\s+(?:\w+\s+){0,3}(?:created|wrote|written|saved|updated|overwrote|overwritten)\b|\bfile\b[^.\n]{0,60}\b(?:created|written|saved|updated)\b|\bi(?:'ve| have)?\s+(?:\w+\s+){0,2}(?:made|added|appended|put|edited|modified)\b[^.\n]{0,60}\b${FILE_NOUN}\b|^\W*(?:created|saved|wrote|written|updated|appended|edited|modified)\b[^.\n]{0,60}\b${FILE_NOUN}\b`, 'i') },
  { tool: 'shell_run', claim: 'deleted something', note: 'the answer says something was deleted, but no command succeeded in this task',
    pattern: new RegExp(String.raw`\bi(?:'ve| have)?\s+(?:\w+\s+){0,2}(?:deleted|removed|trashed|erased)\b[^.\n]{0,60}\b(?:${FILE_NOUN}|folder|director(?:y|ies))\b|^\W*(?:deleted|removed|trashed|erased)\b[^.\n]{0,60}\b${FILE_NOUN}\b`, 'i') },
  { tool: 'shell_run', claim: 'ran a command', note: 'the answer says a command was run, but no command succeeded in this task',
    pattern: /\b(?:i\s+(?:\w+ly\s+)?(?:ran|executed)|i(?:'ve| have)\s+(?:\w+\s+){0,2}(?:run|ran|executed)|successfully\s+(?:ran|executed))\b(?!\s+(?:into|out|across|through|over|up|away)\b)|\bcommand\b[^.\n]{0,40}\b(?:ran|executed|completed) successfully\b|^\W*(?:ran|executed)\b(?!\s+(?:into|out)\b)/i },
  { tool: 'web_fetch', claim: 'fetched a page', note: 'the answer says a web page was fetched, but no fetch succeeded in this task',
    pattern: /\b(?:i(?:'ve| have)?|successfully)\s+(?:\w+\s+){0,2}(?:fetched|downloaded|visited|retrieved|browsed)\b|\bi(?:'ve| have)?\s+(?:\w+\s+){0,2}(?:looked at|checked|opened|read|loaded|pulled up|grabbed|scraped)\b[^.\n]{0,40}\b(?:(?:web ?)?page|web ?site|site|url|link|article|https?:\/\/\S+)|^\W*(?:fetched|downloaded|retrieved)\b/i },
  { tool: 'memory_add', claim: 'remembered something', note: 'the answer says something was remembered, but no memory was saved in this task',
    pattern: /\b(?:i(?:'ve| have| will)?|has been)\s+(?:\w+\s+){0,2}(?:remembered|saved (?:this|that|it) to memory|stored (?:this|that|it) in memory|noted that)\b/i },
];
// Negations and conditionals ("could not create", "I would write", "no file was created") are not claims.
const HEDGE = /\b(?:not|unable|cannot|can't|couldn't|failed|would|could|should|will need|need to|if you|once you|please|nothing|never|without)\b|\b\w+n't\b|\bno\s+(?:\w+\s+){0,2}(?:was|were|has|have|had|been|did)\b/i;
// A hedge only cancels a claim in its own clause: "I couldn't read it, but I saved notes.txt" still claims a write.
const CLAUSE = /[;,]|\b(?:but|however|although|though)\b/i;

export function checkAnswer(answer: string, trace: TraceCall[]): HonestyFinding[] {
  const findings: HonestyFinding[] = [];
  const clauses = answer.split(/(?<=[.!?\n])\s+/).flatMap(s => s.split(CLAUSE));
  for (const c of CLAIMS) {
    if (trace.some(t => (c.accept ?? [c.tool]).includes(t.name) && t.status === 'succeeded')) continue;
    if (clauses.some(s => c.pattern.test(s) && !HEDGE.test(s))) findings.push({ claim: c.claim, tool: c.tool, note: c.note });
  }
  return findings;
}

export function annotate(answer: string, findings: HonestyFinding[]): string {
  if (!findings.length) return answer;
  return `${answer}\n\n[Milo check: ${findings.map(f => f.note).join('; ')}. Treat that part of the answer as unverified.]`;
}
