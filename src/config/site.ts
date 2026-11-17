/**
 * Chapter-wide settings. The values live in small JSON files so each one is a
 * page of its own in the dashboard (/admin/):
 *   chapter.json  Chapter details        contact.json  Contact and social media
 *   numbers.json  Home page numbers      history.json  Our history (About page)
 *   website.json  Website setup (search description, time zone, contact form)
 * Placeholders still to replace: founded year, numbers, Formspree ID and the
 * history milestones.
 */
import chapter from './chapter.json';
import contact from './contact.json';
import numbers from './numbers.json';
import history from './history.json';
import website from './website.json';

export const site = {
  ...chapter,
  ...contact,
  ...website,
  history: history.history,
  stats: numbers,
  // Optional in the dashboard, so the key may be missing from contact.json.
  mapEmbedUrl: (contact as { mapEmbedUrl?: string }).mapEmbedUrl ?? '',

  /** Full chapter logo (society logos above the three-colour wave), in /public/logos. */
  logoColour: '/logos/chapter-logo.webp', // for light backgrounds (PNG kept for the icon script)
  logoWhite: '/logos/chapter-logo-white.webp', // for black backgrounds and dark mode
};

export const nav = [
  { href: '/about/', label: 'About' },
  { href: '/events/', label: 'Events' },
  { href: '/team/', label: 'Team' },
  { href: '/news/', label: 'News' },
  { href: '/contact/', label: 'Contact' },
] as const;

export const membershipUrl = 'https://www.ieee.org/membership/join/index.html';
