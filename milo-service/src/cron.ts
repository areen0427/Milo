// Five-field cron evaluation in an IANA time zone, dependency-free (replaces Aiden's use of
// `croner`). Fields: minute hour day-of-month month day-of-week, with *, lists, ranges, steps,
// month/day names, and 7 = Sunday. Like Vixie cron, when both day fields are restricted a day
// matches if either does. Semantics across DST: a wall-clock time that does not exist (spring
// forward) is skipped; a wall-clock time that occurs twice (fall back) fires once, at the first
// occurrence.
export type CronSpec = { minute: Set<number>; hour: Set<number>; dom: Set<number>; month: Set<number>; dow: Set<number>; domStar: boolean; dowStar: boolean };

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MACROS: Record<string, string> = { '@hourly': '0 * * * *', '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@weekly': '0 0 * * 0', '@monthly': '0 0 1 * *', '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *' };

function field(text: string, lo: number, hi: number, names?: string[], offset = 0): Set<number> {
  const out = new Set<number>();
  const value = (s: string) => {
    const i = names ? names.indexOf(s.toLowerCase()) : -1;
    const n = i >= 0 ? i + offset : Number(s);
    if (!Number.isInteger(n) || n < lo || n > hi) throw new Error(`Value ${s} out of range ${lo}-${hi}`);
    return n;
  };
  for (const part of text.split(',')) {
    const [range, stepText] = part.split('/');
    const step = stepText === undefined ? 1 : Number(stepText);
    if (!Number.isInteger(step) || step < 1) throw new Error(`Invalid step in ${part}`);
    let start: number, end: number;
    if (range === '*') { start = lo; end = hi; }
    else if (range.includes('-')) { const [a, b] = range.split('-'); start = value(a); end = value(b); if (start > end) throw new Error(`Invalid range ${range}`); }
    else { start = value(range); end = stepText === undefined ? start : hi; }
    for (let v = start; v <= end; v += step) out.add(v);
  }
  return out;
}

export function parseCron(expression: string): CronSpec {
  const text = MACROS[expression.trim().toLowerCase()] ?? expression.trim();
  const parts = text.split(/\s+/);
  if (parts.length !== 5) throw new Error('Cron expressions need five fields: minute hour day-of-month month day-of-week');
  const dow = field(parts[4], 0, 7, DAYS);
  if (dow.has(7)) { dow.delete(7); dow.add(0); }
  return { minute: field(parts[0], 0, 59), hour: field(parts[1], 0, 23), dom: field(parts[2], 1, 31), month: field(parts[3], 1, 12, MONTHS, 1), dow, domStar: parts[2] === '*', dowStar: parts[4] === '*' };
}

const formatters = new Map<string, Intl.DateTimeFormat>();
type Local = { year: number; month: number; day: number; hour: number; minute: number; weekday: number };
export function localParts(ms: number, timeZone: string): Local {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short' });
    formatters.set(timeZone, f);
  }
  const p: Record<string, string> = {};
  for (const part of f.formatToParts(new Date(ms))) p[part.type] = part.value;
  return { year: +p.year, month: +p.month, day: +p.day, hour: +p.hour % 24, minute: +p.minute, weekday: DAYS.indexOf(p.weekday.toLowerCase().slice(0, 3)) };
}

export function assertTimeZone(tz: string): void {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(0); } catch { throw new Error(`Invalid IANA time zone: ${tz}`); }
}

function dayMatches(spec: CronSpec, l: Local): boolean {
  if (!spec.month.has(l.month)) return false;
  const dom = spec.dom.has(l.day); const dow = spec.dow.has(l.weekday);
  if (spec.domStar && spec.dowStar) return true;
  if (spec.domStar) return dow;
  if (spec.dowStar) return dom;
  return dom || dow;
}
const sameWall = (a: Local, b: Local) => a.year === b.year && a.month === b.month && a.day === b.day && a.hour === b.hour && a.minute === b.minute;

/** First matching instant strictly after `afterMs`. Searches up to five years ahead. */
export function nextCron(spec: CronSpec, timeZone: string, afterMs: number): number | null {
  const MIN = 60_000;
  let t = Math.floor(afterMs / MIN) * MIN + MIN;
  const limit = afterMs + 5 * 366 * 24 * 60 * MIN;
  while (t <= limit) {
    const l = localParts(t, timeZone);
    if (!dayMatches(spec, l) || !spec.hour.has(l.hour)) { t += (60 - l.minute) * MIN; continue; } // next local hour
    if (!spec.minute.has(l.minute)) { t += MIN; continue; }
    // Fall-back: skip the second occurrence of the same wall-clock minute.
    const earlier = [60, 30].some(back => sameWall(localParts(t - back * MIN, timeZone), l));
    if (!earlier) return t;
    t += MIN;
  }
  return null;
}

/** Latest matching occurrence at or before `beforeMs`, within the supplied lower bound. */
export function previousCron(spec: CronSpec, timeZone: string, beforeMs: number, notBeforeMs: number): number | null {
  const MIN = 60_000;
  let t = Math.floor(beforeMs / MIN) * MIN;
  const limit = Math.max(notBeforeMs, beforeMs - 5 * 366 * 24 * 60 * MIN);
  while (t >= limit) {
    const l = localParts(t, timeZone);
    if (!dayMatches(spec, l) || !spec.hour.has(l.hour)) { t -= (l.minute + 1) * MIN; continue; }
    if (spec.minute.has(l.minute) && ![60, 30].some(back => sameWall(localParts(t - back * MIN, timeZone), l))) return t;
    t -= MIN;
  }
  return null;
}

// ── Schedule expressions: "cron:<5 fields>" | "interval:<ms>" | "oneshot:<ISO>" ─────────────
export function validateExpression(expression: string, timeZone: string): void {
  assertTimeZone(timeZone);
  if (expression.startsWith('interval:')) {
    const ms = Number(expression.slice(9));
    if (!Number.isInteger(ms) || ms < 60_000) throw new Error('Interval schedules must be at least 60000 ms');
  } else if (expression.startsWith('oneshot:')) {
    if (Number.isNaN(Date.parse(expression.slice(8)))) throw new Error('Invalid one-shot time');
  } else parseCron(expression.startsWith('cron:') ? expression.slice(5) : expression);
}

/** Next fire time strictly after afterMs (interval schedules are anchored at `anchorMs`). */
export function nextFire(expression: string, timeZone: string, afterMs: number, anchorMs = afterMs): number | null {
  if (expression.startsWith('interval:')) {
    const every = Number(expression.slice(9));
    const k = Math.floor((afterMs - anchorMs) / every) + 1;
    return anchorMs + Math.max(1, k) * every;
  }
  if (expression.startsWith('oneshot:')) { const at = Date.parse(expression.slice(8)); return at > afterMs ? at : null; }
  return nextCron(parseCron(expression.startsWith('cron:') ? expression.slice(5) : expression), timeZone, afterMs);
}

export function preview(expression: string, timeZone: string, afterMs: number, count: number): string[] {
  validateExpression(expression, timeZone);
  const out: string[] = []; let t = afterMs;
  for (let i = 0; i < count; i++) { const n = nextFire(expression, timeZone, t, afterMs); if (n === null) break; out.push(new Date(n).toISOString()); t = n; }
  return out;
}
