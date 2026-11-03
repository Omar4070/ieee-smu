/**
 * Chapter-wide settings. The values live in settings.json so they can be
 * edited from the dashboard (/admin/ → "Chapter settings"); placeholders
 * still to replace: email, Facebook and LinkedIn links, founded year, stats,
 * Formspree ID and the history milestones.
 */
import settings from './settings.json';

export const site = {
  ...settings,
  // Optional in the dashboard, so the key may be missing from settings.json.
  mapEmbedUrl: (settings as { mapEmbedUrl?: string }).mapEmbedUrl ?? '',

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
