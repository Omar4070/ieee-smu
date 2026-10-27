import type { APIRoute, GetStaticPaths } from 'astro';
import { site } from '../../config/site';
import { getEvents, type EventEntry } from '../../lib/utils';

/** "Add to calendar": one all-day .ics file per event, generated at build time. */
export const getStaticPaths: GetStaticPaths = async () => {
  const { all } = await getEvents();
  return all.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
};

const day = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

export const GET: APIRoute = ({ props, site: siteUrl }) => {
  const { data, id } = (props as { entry: EventEntry }).entry;
  const end = new Date(data.endDate ?? data.date);
  end.setUTCDate(end.getUTCDate() + 1); // DTEND is exclusive for all-day events
  const pageUrl = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/events/${id}/`, siteUrl);
  const description = [data.summary, data.time ? `Time: ${data.time}` : '', pageUrl.href].filter(Boolean).join('\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${site.name}//Events//EN`,
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${id}@${pageUrl.host}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;VALUE=DATE:${day(data.date)}`,
    `DTEND;VALUE=DATE:${day(end)}`,
    `SUMMARY:${escape(data.title)}`,
    `LOCATION:${escape(data.location)}`,
    `DESCRIPTION:${escape(description)}`,
    `URL:${pageUrl.href}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(ics + '\r\n', { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
