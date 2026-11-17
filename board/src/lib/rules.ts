import { daysBetween, today } from './dates';
import type { Attendance, BoardEvent, Data, EventStatus, Meeting, Member, Presence, Task } from './types';

// The few rules the app applies. Everything else is just the board's own lists.

/** An event should be announced this many days before it happens. */
export const ANNOUNCE_BEFORE = 4;

export const STATUS_LABEL: Record<EventStatus, string> = {
  planning: 'Planning',
  announced: 'Announced',
  cancelled: 'Cancelled',
};

export const PRESENCE_LABEL: Record<Presence, string> = {
  present: 'Present',
  excused: 'Excused',
  absent: 'Absent',
};

// ------------------------------------------------------------ tasks

export const isLate = (t: Task, day: string = today()) => !t.done && !!t.due_date && t.due_date < day;

/** Earliest due first, undated last, then by name. */
export function byDue(a: Task, b: Task): number {
  if (a.due_date !== b.due_date) {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date < b.due_date ? -1 : 1;
  }
  return a.title.localeCompare(b.title);
}

/** Most recently finished first. */
export const byDoneAt = (a: Task, b: Task) => (b.done_at ?? '').localeCompare(a.done_at ?? '');

// ------------------------------------------------------------ events

export const comingEvents = (events: BoardEvent[], day: string = today()) =>
  events.filter((e) => e.date >= day).sort((a, b) => a.date.localeCompare(b.date));

export const pastEvents = (events: BoardEvent[], day: string = today()) =>
  events.filter((e) => e.date < day).sort((a, b) => b.date.localeCompare(a.date));

/** True when an event is close and still not announced: the one alert on the Events screen. */
export function needsAnnouncing(e: BoardEvent, day: string = today()): boolean {
  if (e.status !== 'planning' || e.date < day) return false;
  return daysBetween(day, e.date) <= ANNOUNCE_BEFORE;
}

// ------------------------------------------------------------ meetings and attendance

/** Today's and later meetings, soonest first. */
export const comingMeetings = (meetings: Meeting[], day: string = today()) =>
  meetings.filter((m) => m.date >= day).sort((a, b) => a.date.localeCompare(b.date));

/** Earlier meetings, latest first. */
export const pastMeetings = (meetings: Meeting[], day: string = today()) =>
  meetings.filter((m) => m.date < day).sort((a, b) => b.date.localeCompare(a.date));

export interface Tally { present: number; excused: number; absent: number; marked: number }

function count(rows: Attendance[]): Tally {
  const t: Tally = { present: 0, excused: 0, absent: 0, marked: rows.length };
  for (const r of rows) t[r.status]++;
  return t;
}

export const meetingTally = (data: Data, meetingId: string) =>
  count(data.attendance.filter((a) => a.meeting_id === meetingId));

export const memberTally = (data: Data, memberId: string) =>
  count(data.attendance.filter((a) => a.member_id === memberId));

// ------------------------------------------------------------ people

const ROLE_ORDER = [/^chair/i, /vice/i, /secretary/i, /treasurer/i, /hr|human/i, /webmaster/i];
const rank = (m: Member) => {
  const i = ROLE_ORDER.findIndex((re) => re.test(m.role));
  return i < 0 ? ROLE_ORDER.length : i;
};

/** The board in its usual order: officers first, then everyone else by name. */
export function byBoardOrder(a: Member, b: Member): number {
  return rank(a) - rank(b) || a.full_name.localeCompare(b.full_name);
}

export const activeMembers = (members: Member[]) => members.filter((m) => m.active).sort(byBoardOrder);

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0];

/** "1 task", "3 tasks" */
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
