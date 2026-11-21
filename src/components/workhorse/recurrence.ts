import type { Events, RecurrenceRule } from "./queries";

/**
 * A single concrete occurrence of an event on the calendar.
 *
 * For one-off events there is exactly one occurrence. For recurring events the
 * rule is expanded into many occurrences that all share the same `id` (so the
 * event's images, edit/delete etc. still resolve to the one DB row) but each
 * has its own `start_datetime`/`end_datetime` and a unique `occurrence_key`.
 */
export interface Occurrence extends Events {
  occurrence_key: string;
}

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"];

// Hard cap so a bad rule can never lock up the browser.
const MAX_ITERATIONS = 5000;

/** Parse a MySQL "YYYY-MM-DD HH:MM:SS" string as local time (Safari-safe). */
export function parseDT(str: string): Date {
  return new Date(str.replace(" ", "T"));
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Local Date -> "YYYY-MM-DD" */
export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local Date -> MySQL "YYYY-MM-DD HH:MM:SS" */
export function toDBString(d: Date): string {
  return `${toDateKey(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** "YYYY-MM-DD" -> local midnight Date */
function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a: Date, b: Date): number {
  // Round to absorb DST hour shifts.
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 864e5);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Which occurrence of its weekday a date is within its month (1-5). */
export function nthWeekdayOfMonth(d: Date): number {
  return Math.ceil(d.getDate() / 7);
}

/** True when there is no later occurrence of the same weekday in the month. */
export function isLastWeekdayOfMonth(d: Date): boolean {
  return d.getDate() + 7 > daysInMonth(d.getFullYear(), d.getMonth());
}

/** Date of the nth (1-5) or last (-1) given weekday in a month, or null. */
function nthWeekdayDate(
  year: number,
  month: number,
  weekday: number,
  nth: number,
): number | null {
  const dim = daysInMonth(year, month);
  if (nth === -1) {
    const lastDow = new Date(year, month, dim).getDay();
    return dim - ((lastDow - weekday + 7) % 7);
  }
  const firstDow = new Date(year, month, 1).getDay();
  const day = 1 + ((weekday - firstDow + 7) % 7) + (nth - 1) * 7;
  return day <= dim ? day : null;
}

/**
 * Normalise whatever came back from the API into a rule (or null).
 * Tolerates the column arriving as a JSON string as well as an object.
 */
export function parseRule(raw: unknown): RecurrenceRule | null {
  let value = raw;
  if (typeof value === "string") {
    if (!value.trim()) return null;
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") return null;
  const r = value as Partial<RecurrenceRule>;
  if (r.freq !== "daily" && r.freq !== "weekly" && r.freq !== "monthly") {
    return null;
  }
  return {
    freq: r.freq,
    interval: Math.max(1, Math.floor(Number(r.interval) || 1)),
    byweekday: Array.isArray(r.byweekday)
      ? r.byweekday.filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
      : undefined,
    monthly_mode:
      r.monthly_mode === "nth_weekday" || r.monthly_mode === "last_weekday"
        ? r.monthly_mode
        : "day_of_month",
    until: typeof r.until === "string" && r.until ? r.until : undefined,
    exdates: Array.isArray(r.exdates)
      ? r.exdates.filter((s) => typeof s === "string")
      : undefined,
  };
}

/**
 * Generate the start Dates of a rule that fall within [rangeStart, rangeEnd).
 * Candidates are generated in chronological order.
 */
function generateStarts(
  start: Date,
  rule: RecurrenceRule,
  rangeStart: Date,
  rangeEnd: Date,
): Date[] {
  const out: Date[] = [];
  const interval = Math.max(1, rule.interval || 1);
  const until = rule.until ? fromDateKey(rule.until) : null;
  // `until` is inclusive of the whole day.
  const hardEnd = until
    ? new Date(Math.min(rangeEnd.getTime(), until.getTime() + 864e5))
    : rangeEnd;
  const h = start.getHours();
  const mi = start.getMinutes();
  const s = start.getSeconds();
  const at = (y: number, m: number, d: number) => new Date(y, m, d, h, mi, s);

  const push = (d: Date) => {
    if (d >= start && d >= rangeStart && d < hardEnd) out.push(d);
  };

  if (rule.freq === "daily") {
    // Jump straight to the first step at or after rangeStart.
    let step = Math.max(0, Math.floor(daysBetween(start, rangeStart) / interval));
    for (let i = 0; i < MAX_ITERATIONS; i++, step++) {
      const d = at(start.getFullYear(), start.getMonth(), start.getDate() + step * interval);
      if (d >= hardEnd) break;
      push(d);
    }
  } else if (rule.freq === "weekly") {
    const days =
      rule.byweekday && rule.byweekday.length > 0
        ? [...new Set(rule.byweekday)].sort()
        : [start.getDay()];
    // Sunday of the week the event starts in.
    const week0 = at(start.getFullYear(), start.getMonth(), start.getDate() - start.getDay());
    let step = Math.max(
      0,
      Math.floor(Math.floor(daysBetween(week0, rangeStart) / 7) / interval),
    );
    for (let i = 0; i < MAX_ITERATIONS; i++, step++) {
      const weekStart = at(week0.getFullYear(), week0.getMonth(), week0.getDate() + step * 7 * interval);
      if (weekStart >= hardEnd) break;
      for (const dow of days) {
        push(at(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + dow));
      }
    }
  } else if (rule.freq === "monthly") {
    const monthsDiff =
      (rangeStart.getFullYear() - start.getFullYear()) * 12 +
      (rangeStart.getMonth() - start.getMonth());
    // Back off one interval so occurrences that start before rangeStart but
    // run into the range (multi-day events) are still considered.
    let step = Math.max(0, Math.floor(monthsDiff / interval) - 1);
    const weekday = start.getDay();
    const nth =
      rule.monthly_mode === "last_weekday" ? -1 : nthWeekdayOfMonth(start);
    for (let i = 0; i < MAX_ITERATIONS; i++, step++) {
      const y = start.getFullYear();
      const m = start.getMonth() + step * interval;
      const monthStart = new Date(y, m, 1);
      if (monthStart >= hardEnd) break;
      let day: number | null;
      if (rule.monthly_mode === "day_of_month" || !rule.monthly_mode) {
        // Skip months that don't have this date (e.g. the 31st).
        day =
          start.getDate() <= daysInMonth(monthStart.getFullYear(), monthStart.getMonth())
            ? start.getDate()
            : null;
      } else {
        day = nthWeekdayDate(monthStart.getFullYear(), monthStart.getMonth(), weekday, nth);
      }
      if (day !== null) push(at(monthStart.getFullYear(), monthStart.getMonth(), day));
    }
  }
  return out;
}

/**
 * Expand a list of events (one-off and recurring) into the concrete
 * occurrences that overlap [rangeStart, rangeEnd). Sorted by start time.
 */
export function expandEvents(
  events: Events[],
  rangeStart: Date,
  rangeEnd: Date,
): Occurrence[] {
  const out: Occurrence[] = [];
  for (const event of events) {
    const start = parseDT(event.start_datetime);
    if (isNaN(start.getTime())) continue;
    const end = event.end_datetime ? parseDT(event.end_datetime) : null;
    const duration = end && !isNaN(end.getTime()) ? end.getTime() - start.getTime() : 0;
    const rule = parseRule(event.recurrence);

    if (!rule) {
      if (start < rangeEnd && start.getTime() + duration >= rangeStart.getTime()) {
        out.push({ ...event, occurrence_key: `${event.id}` });
      }
      continue;
    }

    const exdates = new Set(rule.exdates ?? []);
    // Look back by the event's duration so multi-day occurrences that began
    // before the range but are still running get included.
    const lookBack = new Date(rangeStart.getTime() - duration);
    for (const occStart of generateStarts(start, rule, lookBack, rangeEnd)) {
      const key = toDateKey(occStart);
      if (exdates.has(key)) continue;
      out.push({
        ...event,
        start_datetime: toDBString(occStart),
        end_datetime: end
          ? toDBString(new Date(occStart.getTime() + duration))
          : event.end_datetime,
        occurrence_key: `${event.id}_${key}`,
      });
    }
  }
  return out.sort(
    (a, b) => parseDT(a.start_datetime).getTime() - parseDT(b.start_datetime).getTime(),
  );
}

/** Human readable summary, e.g. "Every 2 weeks on Tue, Thu until Dec 31, 2026". */
export function describeRule(
  rawRule: RecurrenceRule | string | null | undefined,
  startDatetime: string,
): string | null {
  const rule = parseRule(rawRule);
  if (!rule) return null;
  const start = parseDT(startDatetime);
  const n = rule.interval;
  let text: string;

  if (rule.freq === "daily") {
    text = n === 1 ? "Every day" : `Every ${n} days`;
  } else if (rule.freq === "weekly") {
    const days =
      rule.byweekday && rule.byweekday.length > 0
        ? [...new Set(rule.byweekday)].sort()
        : [start.getDay()];
    const dayText =
      days.length === 1
        ? WEEKDAY_LONG[days[0]]
        : days.map((d) => WEEKDAY_SHORT[d]).join(", ");
    text = `${n === 1 ? "Every week" : `Every ${n} weeks`} on ${dayText}`;
  } else {
    const every = n === 1 ? "Every month" : `Every ${n} months`;
    if (rule.monthly_mode === "nth_weekday") {
      text = `${every} on the ${ORDINALS[nthWeekdayOfMonth(start) - 1]} ${WEEKDAY_LONG[start.getDay()]}`;
    } else if (rule.monthly_mode === "last_weekday") {
      text = `${every} on the last ${WEEKDAY_LONG[start.getDay()]}`;
    } else {
      text = `${every} on day ${start.getDate()}`;
    }
  }

  if (rule.until) {
    text += ` until ${fromDateKey(rule.until).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }
  return text;
}
