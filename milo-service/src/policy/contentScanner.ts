// Ported from Aiden moat/tirithScanner.ts (AGPL-3.0-only, Copyright (c) 2026 Shiva Deore / Taracod),
// plus a secret detector for content Milo is about to write or send. Heuristic: a finding forces an
// approval prompt; absence of findings is not proof the content is safe.
export type ScanFinding = { type: string; severity: 'caution' | 'dangerous'; description: string };

const HOMOGRAPH_RANGES: Array<[number, number]> = [[0x0400, 0x04ff], [0x0370, 0x03ff], [0x0530, 0x058f], [0xff00, 0xffef]];
const ANSI_ESCAPE = /\x1b\[[0-9;?]*[A-Za-z]/;
const ZERO_WIDTH = /[​‌‍⁠﻿]/;
const BIDI_OVERRIDE = /[‪-‮⁦-⁩]/;
const PIPE_TO_INTERPRETER = /\b(curl|wget)\b[^|]*\|\s*(sh|bash|zsh|ksh|fish|python[23]?|node|perl|ruby)\b/i;
const SECRETS: Array<[string, RegExp]> = [
  ['private_key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
  ['aws_access_key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['github_token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ['slack_token', /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/],
  ['openai_style_key', /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{32,}\b/],
  ['google_api_key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['jwt', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
];

export function scanContent(text: string): ScanFinding[] {
  const out: ScanFinding[] = [];
  for (const [name, re] of SECRETS) if (re.test(text)) out.push({ type: `secret:${name}`, severity: 'dangerous', description: `Content appears to contain a secret (${name.replace(/_/g, ' ')})` });
  if (PIPE_TO_INTERPRETER.test(text)) out.push({ type: 'pipe_to_interpreter', severity: 'dangerous', description: 'Remote content piped into an interpreter' });
  if (ANSI_ESCAPE.test(text)) out.push({ type: 'terminal_injection', severity: 'caution', description: 'ANSI escape sequences embedded' });
  if (ZERO_WIDTH.test(text)) out.push({ type: 'zero_width', severity: 'caution', description: 'Zero-width characters present' });
  if (BIDI_OVERRIDE.test(text)) out.push({ type: 'bidi_override', severity: 'dangerous', description: 'Bidirectional override characters can disguise text' });
  for (const url of text.match(/https?:\/\/[^\s"'`<>]+/gi) ?? []) out.push(...scanUrl(url));
  return out;
}

export function scanUrl(url: string): ScanFinding[] {
  const raw = url.match(/^[a-z]+:\/\/([^/?#]+)/i)?.[1]?.split('@').pop()?.split(':')[0];
  if (!raw) return [];
  for (const ch of raw) {
    const cp = ch.codePointAt(0)!;
    if (cp >= 0x80 && HOMOGRAPH_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi)) return [{ type: 'homograph_url', severity: 'dangerous', description: `Hostname contains a look-alike character (U+${cp.toString(16).toUpperCase().padStart(4, '0')})` }];
  }
  return /(^|\.)xn--/i.test(raw) ? [{ type: 'punycode_url', severity: 'caution', description: 'Punycode (IDN) hostname' }] : [];
}
