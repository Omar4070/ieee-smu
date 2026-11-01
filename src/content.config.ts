import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const society = z.enum(['PES', 'IES', 'IAS', 'Joint']);

/** One Markdown file per event in src/content/events/. The file name becomes the URL. */
const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      time: z.string().optional(), // e.g. "14:00–17:00"
      type: z.enum(['Workshop', 'Conference', 'Industrial visit', 'Competition', 'Talk', 'Social']),
      societies: z.array(society).min(1),
      location: z.string(),
      summary: z.string().max(220),
      cover: image(),
      coverAlt: z.string(),
      registrationUrl: z.url().optional(),
      gallery: z.array(z.object({ src: image(), alt: z.string() })).default([]),
    }),
});

/** One Markdown file per news item in src/content/news/. */
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      category: z.enum(['Award', 'Competition', 'Announcement']),
      summary: z.string().max(220),
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

/** One JSON file per committee year in src/content/team/, e.g. 2026-2027.json. */
const team = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/team' }),
  schema: ({ image }) =>
    z.object({
      year: z.string(), // shown as the heading, e.g. "2026–2027"
      members: z.array(
        z.object({
          name: z.string().optional(), // leave out until the seat is filled
          role: z.string(),
          lead: z.boolean().default(false), // Chair / Vice-Chair: top of the board diagram
          society: society.optional(),
          photo: image().optional(),
          linkedin: z.url().optional(),
        }),
      ),
    }),
});

export const collections = { events, news, team };
