// web_fetch: GET a public http(s) page. Informed by Aiden tools/v4/web/webFetch.ts (AGPL-3.0-only,
// Copyright (c) 2026 Shiva Deore / Taracod). Every redirect hop is re-checked by the SSRF guard;
// redirects are followed manually so a public URL cannot bounce into a private address.
// The connection is pinned: name resolution for the socket goes through a lookup that rejects
// blocked addresses, so DNS rebinding between the check and the connect cannot reach them.
import type { ToolDefinition } from './registry.ts';
import { ToolFailure } from './registry.ts';
import http from 'node:http';
import https from 'node:https';
import type { LookupFunction } from 'node:net';
import { checkIp, checkUrl, defaultLookup } from '../policy/ssrf.ts';
import type { LookupFn } from '../policy/ssrf.ts';
import { scanContent } from '../policy/contentScanner.ts';

const MAX_BYTES = 512 * 1024;
const MAX_REDIRECTS = 5;

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/[ \t\f\v]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** A socket lookup that resolves with `resolve` and refuses any blocked address. */
export function guardedLookup(resolve: LookupFn): LookupFunction {
  return ((hostname: string, options: { all?: boolean }, callback: (...args: unknown[]) => void) => {
    resolve(hostname).then(addrs => {
      if (!addrs.length) return callback(Object.assign(new Error(`No addresses for ${hostname}`), { code: 'ENOTFOUND' }));
      for (const a of addrs) {
        const v = checkIp(a.address);
        if (v.blocked) return callback(Object.assign(new Error(`Blocked: ${v.reason}`), { code: 'EMILOBLOCKED' }));
      }
      if (options?.all) callback(null, addrs.map(a => ({ address: a.address, family: a.family })));
      else callback(null, addrs[0].address, addrs[0].family);
    }, err => callback(err));
  }) as unknown as LookupFunction;
}

function abortable<T>(operation: Promise<T>, signal: AbortSignal, userSignal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(userSignal.aborted ? new ToolFailure('cancelled', 'Request cancelled') : new ToolFailure('timeout', 'Request timed out after 20 s'));
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
    operation.then(value => { signal.removeEventListener('abort', abort); resolve(value); }, error => { signal.removeEventListener('abort', abort); reject(error); });
  });
}

type Fetched = { status: number; location: string | null; contentType: string; body: Buffer; truncated: boolean };
function get(url: string, limit: number, signal: AbortSignal, resolve: LookupFn): Promise<Fetched> {
  const u = new URL(url);
  const mod = u.protocol === 'https:' ? https : http;
  return new Promise((done, fail) => {
    const req = mod.request(u, {
      method: 'GET', agent: false, lookup: guardedLookup(resolve), signal, timeout: 20_000,
      headers: { 'user-agent': 'Milo/0.1 (local agent)', accept: 'text/html,text/plain,application/json;q=0.9,*/*;q=0.5', 'accept-encoding': 'identity' },
    }, res => {
      const status = res.statusCode ?? 0;
      const location = typeof res.headers.location === 'string' ? res.headers.location : null;
      const contentType = String(res.headers['content-type'] ?? '');
      if (status >= 300 && status < 400 && location) { res.destroy(); return done({ status, location, contentType, body: Buffer.alloc(0), truncated: false }); }
      const chunks: Buffer[] = []; let size = 0; let truncated = false;
      res.on('data', (c: Buffer) => {
        if (truncated) return;
        if (size + c.length > limit) { chunks.push(c.subarray(0, limit - size)); size = limit; truncated = true; res.destroy(); finish(); return; }
        chunks.push(c); size += c.length;
      });
      const finish = () => done({ status, location, contentType, body: Buffer.concat(chunks), truncated });
      res.on('end', finish);
      res.on('error', e => truncated ? finish() : fail(e));
    });
    req.on('timeout', () => req.destroy(new ToolFailure('timeout', 'Request timed out after 20 s')));
    req.on('error', e => {
      if ((e as NodeJS.ErrnoException).code === 'EMILOBLOCKED') fail(new ToolFailure('blocked_url', e.message));
      else if (signal.aborted) fail(new ToolFailure('cancelled', 'Request cancelled'));
      else fail(e instanceof ToolFailure ? e : new ToolFailure('network_error', e.message));
    });
    req.end();
  });
}

export const webFetch: ToolDefinition = {
  name: 'web_fetch',
  description: 'Fetch a public web page (http/https GET) and return its text. Private, loopback and cloud-metadata addresses are blocked.',
  inputSchema: { type: 'object', properties: { url: { type: 'string', maxLength: 2048 }, maxBytes: { type: 'integer', minimum: 1024, maximum: MAX_BYTES } }, required: ['url'], additionalProperties: false },
  mutates: false,
  assess(args, ctx) {
    const summary = `Fetch ${String(args.url).slice(0, 200)}`;
    if (!ctx.permissions.network) return { decision: 'deny', tier: 'caution', reasons: ['Network access is not granted'], summary };
    const findings = scanContent(args.url as string);
    // A secret in a URL would leave the Mac; make the user look at it.
    if (findings.length) return { decision: 'ask', tier: findings.some(f => f.severity === 'dangerous') ? 'dangerous' : 'caution', reasons: findings.map(f => f.description), summary };
    return { decision: 'allow', tier: 'safe', reasons: [], summary };
  },
  async execute(args, ctx) {
    let url = args.url as string;
    const limit = (args.maxBytes as number | undefined) ?? 256 * 1024;
    const deadline = AbortSignal.timeout(20_000);
    const signal = AbortSignal.any([ctx.signal, deadline]);
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const verdict = await abortable(checkUrl(url, ctx.lookup), signal, ctx.signal);
      if (verdict.blocked) throw new ToolFailure('blocked_url', `Blocked: ${verdict.reason}`);
      let res: Fetched;
      try { res = await get(url, limit, signal, ctx.lookup ?? defaultLookup); }
      catch (e) { if (!ctx.signal.aborted && deadline.aborted) throw new ToolFailure('timeout', 'Request timed out after 20 s'); throw e; }
      if (res.status >= 300 && res.status < 400 && res.location) { url = new URL(res.location, url).toString(); continue; }
      const type = res.contentType;
      const raw = res.body.toString('utf8');
      if (!/^(text\/|application\/(json|xml|xhtml))/i.test(type) && type) return { url, status: res.status, contentType: type, text: null, note: 'Non-text content not returned' };
      return { url, status: res.status, contentType: type, text: /html/i.test(type) ? htmlToText(raw) : raw, truncated: res.truncated };
    }
    throw new ToolFailure('too_many_redirects', `More than ${MAX_REDIRECTS} redirects`);
  },
};
