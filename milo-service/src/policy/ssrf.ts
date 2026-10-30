// Ported from Aiden moat/ssrfProtection.ts (AGPL-3.0-only, Copyright (c) 2026 Shiva Deore / Taracod).
// Changes for Milo: also blocks 0.0.0.0/8, multicast/reserved ranges, IPv4-mapped IPv6 and
// NAT64-embedded IPv4; credentials in URLs are refused; the class became a function so it runs
// under Node type stripping. DNS is resolved before the check so rebinding to a private address
// fails closed. Callers must re-check every redirect hop (see tools/web.ts).
import dns from 'node:dns';

export type SSRFCategory = 'rfc1918' | 'loopback' | 'link_local' | 'cgnat' | 'cloud_metadata' | 'reserved' | 'invalid' | 'unsupported_scheme';
export type SSRFCheckResult = { blocked: boolean; reason?: string; category?: SSRFCategory; ip?: string };
export type LookupFn = (hostname: string) => Promise<Array<{ address: string; family: number }>>;

const BLOCKED_HOSTNAMES = ['metadata.google.internal', 'metadata.azure.com', 'metadata.aws.amazon.com', '169.254.169.254', 'fd00:ec2::254', 'localhost'];

type CIDR = { base: bigint; prefix: number; width: 32 | 128; category: SSRFCategory; description: string };
const NETWORKS: CIDR[] = [
  cidr4('0.0.0.0', 8, 'reserved', '"this network" (0.0.0.0/8)'),
  cidr4('10.0.0.0', 8, 'rfc1918', 'RFC 1918 private (10.0.0.0/8)'),
  cidr4('172.16.0.0', 12, 'rfc1918', 'RFC 1918 private (172.16.0.0/12)'),
  cidr4('192.168.0.0', 16, 'rfc1918', 'RFC 1918 private (192.168.0.0/16)'),
  cidr4('127.0.0.0', 8, 'loopback', 'loopback (127.0.0.0/8)'),
  cidr4('169.254.0.0', 16, 'link_local', 'link-local / cloud metadata (169.254.0.0/16)'),
  cidr4('100.64.0.0', 10, 'cgnat', 'CGNAT (100.64.0.0/10)'),
  cidr4('192.0.0.0', 24, 'reserved', 'IETF protocol assignments (192.0.0.0/24)'),
  cidr4('198.18.0.0', 15, 'reserved', 'benchmarking (198.18.0.0/15)'),
  cidr4('224.0.0.0', 4, 'reserved', 'multicast (224.0.0.0/4)'),
  cidr4('240.0.0.0', 4, 'reserved', 'reserved / broadcast (240.0.0.0/4)'),
  cidr6('::1', 128, 'loopback', 'IPv6 loopback (::1)'),
  cidr6('::', 96, 'reserved', 'IPv4-compatible and unspecified IPv6 addresses (::/96)'),
  cidr6('fec0::', 10, 'reserved', 'deprecated IPv6 site-local addresses (fec0::/10)'),
  cidr6('::ffff:0:0:0', 96, 'reserved', 'IPv4-translated addresses (::ffff:0:0:0/96)'),
  cidr6('2002::', 16, 'reserved', '6to4 transition addresses (2002::/16)'),
  cidr6('2001::', 32, 'reserved', 'Teredo transition addresses (2001::/32)'),
  cidr6('64:ff9b:1::', 48, 'reserved', 'local-use translation addresses (64:ff9b:1::/48)'),
  cidr6('fe80::', 10, 'link_local', 'IPv6 link-local (fe80::/10)'),
  cidr6('fc00::', 7, 'rfc1918', 'IPv6 unique-local (fc00::/7)'),
  cidr6('ff00::', 8, 'reserved', 'IPv6 multicast (ff00::/8)'),
];

export const defaultLookup: LookupFn = (hostname) => new Promise((resolve, reject) => {
  dns.lookup(hostname, { all: true, verbatim: true }, (err, addrs) => err ? reject(err) : resolve(addrs));
});

export async function checkUrl(url: string, lookup: LookupFn = defaultLookup): Promise<SSRFCheckResult> {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return { blocked: true, reason: 'Invalid URL', category: 'invalid' }; }
  if (!/^https?:$/i.test(parsed.protocol)) return { blocked: true, reason: `Unsupported scheme: ${parsed.protocol}`, category: 'unsupported_scheme' };
  if (parsed.username || parsed.password) return { blocked: true, reason: 'URLs with embedded credentials are not allowed', category: 'invalid' };
  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!hostname) return { blocked: true, reason: 'Empty hostname', category: 'invalid' };
  if (BLOCKED_HOSTNAMES.includes(hostname) || hostname.endsWith('.localhost')) return { blocked: true, reason: `${hostname} is a local or metadata endpoint`, category: 'cloud_metadata', ip: hostname };
  if (parseIp4(hostname) !== null || parseIp6(hostname) !== null) return checkIp(hostname);
  let addrs: Array<{ address: string }>;
  try { addrs = await lookup(hostname); } catch (e) { return { blocked: true, reason: `DNS lookup failed: ${(e as Error).message}`, category: 'invalid' }; }
  if (!addrs.length) return { blocked: true, reason: 'DNS returned no addresses', category: 'invalid' };
  for (const a of addrs) { const r = checkIp(a.address); if (r.blocked) return r; }
  return { blocked: false };
}

export function checkIp(ip: string): SSRFCheckResult {
  const clean = ip.replace(/^\[|\]$/g, '').toLowerCase();
  if (BLOCKED_HOSTNAMES.includes(clean)) return { blocked: true, reason: `${clean} is a cloud-metadata endpoint`, category: 'cloud_metadata', ip: clean };
  const v4 = parseIp4(clean);
  if (v4 !== null) return match(v4, 32, clean);
  const v6 = parseIp6(clean);
  if (v6 === null) return { blocked: true, reason: `Unrecognized address ${clean}`, category: 'invalid' };
  // IPv4-mapped (::ffff:a.b.c.d) and NAT64 (64:ff9b::a.b.c.d) addresses reach IPv4 hosts.
  if ((v6 >> 32n) === 0xffffn || (v6 >> 32n) === 0x64ff9b0000000000000000n) return match(v6 & 0xffffffffn, 32, clean);
  return match(v6, 128, clean);
}

function match(addr: bigint, width: 32 | 128, label: string): SSRFCheckResult {
  for (const c of NETWORKS) {
    if (c.width !== width) continue;
    const shift = BigInt(c.width - c.prefix);
    if ((addr >> shift) === (c.base >> shift)) return { blocked: true, reason: `${label} is in ${c.description}`, category: c.category, ip: label };
  }
  return { blocked: false };
}
function cidr4(base: string, prefix: number, category: SSRFCategory, description: string): CIDR { return { base: parseIp4(base)!, prefix, width: 32, category, description }; }
function cidr6(base: string, prefix: number, category: SSRFCategory, description: string): CIDR { return { base: parseIp6(base)!, prefix, width: 128, category, description }; }

export function parseIp4(s: string): bigint | null {
  const m = s.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const parts = m.slice(1).map(Number);
  if (parts.some(n => n > 255)) return null;
  return parts.reduce((acc, n) => (acc << 8n) | BigInt(n), 0n);
}

export function parseIp6(s: string): bigint | null {
  let text = s;
  // Embedded dotted IPv4 tail (e.g. ::ffff:127.0.0.1) → two hex groups.
  const tail = text.match(/^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (tail) {
    const v4 = parseIp4(tail[2]);
    if (v4 === null) return null;
    text = `${tail[1]}${(v4 >> 16n).toString(16)}:${(v4 & 0xffffn).toString(16)}`;
  }
  if (!/^[0-9a-f:]+$/i.test(text) || (text.match(/::/g) ?? []).length > 1) return null;
  let groups: string[];
  if (text.includes('::')) {
    const [h, t] = text.split('::');
    const head = h ? h.split(':') : [];
    const rest = t ? t.split(':') : [];
    const fill = 8 - head.length - rest.length;
    if (fill < 1) return null;
    groups = [...head, ...new Array(fill).fill('0'), ...rest];
  } else groups = text.split(':');
  if (groups.length !== 8) return null;
  let acc = 0n;
  for (const g of groups) { if (!/^[0-9a-f]{1,4}$/i.test(g)) return null; acc = (acc << 16n) | BigInt(parseInt(g, 16)); }
  return acc;
}
