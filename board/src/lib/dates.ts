import type { Day } from './types';

// Calendar days are ISO strings ("2026-11-21") in the board's local time, so a date never
// shifts by a day around midnight. Times of day stay text ("18:00").

const pad = (n: number) => String(n).padStart(2, '0'); // taste-skill-ignore: a calendar date, not a counter

export function toDay(d: Date): Day {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function today(): Day {
  return toDay(new Date());
}

export function parseDay(day: Day): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(day: Day, n: number): Day {
  const d = parseDay(day);
  d.setDate(d.getDate() + n);
  return toDay(d);
}

/** Whole days from `a` to `b` (positive when b is later). */
export function daysBetween(a: Day, b: Day): number {
  return Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86_400_000);
}

const fmtShort = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtDayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const fmtLong = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

/** "Fri 21 Nov" */
export const shortDate = (day: Day) => fmtShort.format(parseDay(day));
/** "21 Nov" */
export const dayMonth = (day: Day) => fmtDayMonth.format(parseDay(day));
/** "Friday 21 November" */
export const longDate = (day: Day) => fmtLong.format(parseDay(day));

/** "today", "tomorrow", "in 6 days", "yesterday", "3 days ago" */
export function relative(day: Day, from: Day = today()): string {
  const n = daysBetween(from, day);
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  return n > 0 ? `in ${n} days` : `${-n} days ago`;
}

/** A task's due date as people say it: "Today", "Tomorrow", "Fri 21 Nov", "3 days late". */
export function dueLabel(day: Day, from: Day = today()): string {
  const n = daysBetween(from, day);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n < 0) return n === -1 ? '1 day late' : `${-n} days late`;
  return shortDate(day);
}
