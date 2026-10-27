import { getCollection, type CollectionEntry } from 'astro:content';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix an internal path with the site's base path (needed on GitHub Pages project sites). */
export function url(path = '/'): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** True when `href` is the current page or one of its children. */
export function isCurrent(href: string, pathname: string): boolean {
  const target = url(href).replace(/\/$/, '');
  const here = pathname.replace(/\/$/, '');
  return here === target || here.startsWith(`${target}/`);
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const dayMonthFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const dayFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: 'UTC' });

export function formatDate(date: Date): string {
  return dateFmt.format(date);
}

/** "18–19 April 2026", "30 April – 2 May 2026" or "30 December 2025 – 2 January 2026". */
export function formatRange(start: Date, end?: Date): string {
  if (!end || end.getTime() === start.getTime()) return formatDate(start);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  if (sameYear && start.getUTCMonth() === end.getUTCMonth()) return `${dayFmt.format(start)}–${formatDate(end)}`;
  if (sameYear) return `${dayMonthFmt.format(start)} – ${formatDate(end)}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/** ISO date (YYYY-MM-DD) for <time datetime>. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export type EventEntry = CollectionEntry<'events'>;

/**
 * Events split into upcoming (soonest first) and past (most recent first).
 * The site is static, so "today" is the day of the build; the deploy workflow
 * also rebuilds the site every night so events move to "past" automatically.
 */
export async function getEvents() {
  const all = await getCollection('events');
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const isPast = (e: EventEntry) => (e.data.endDate ?? e.data.date) < today;
  const upcoming = all.filter((e) => !isPast(e)).sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
  const past = all.filter(isPast).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return { upcoming, past, all };
}

export async function getNews() {
  return (await getCollection('news')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Committees, newest year first (file names like 2026-2027.json sort naturally). */
export async function getTeams() {
  return (await getCollection('team')).sort((a, b) => b.id.localeCompare(a.id));
}

/** Field colour class for an event or member's society. */
export function fieldFor(society?: string): string {
  switch (society) {
    case 'PES':
      return 'field-pes';
    case 'IES':
      return 'field-ies';
    case 'IAS':
      return 'field-ias';
    default:
      return 'field-blue';
  }
}
