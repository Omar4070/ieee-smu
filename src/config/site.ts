/**
 * Chapter-wide settings. Every value marked TODO is a placeholder:
 * replace it with the real information and the whole site updates.
 */
export const site = {
  name: 'IEEE SMU Student Branch Joint Chapter',
  shortName: 'SMU Joint Chapter',
  tagline: 'Power, electronics and industry, built by students.',
  description:
    'The IEEE Industry Applications, Industrial Electronics and Power & Energy societies joint chapter of the SMU Student Branch: workshops, industrial visits and competitions for engineering students.',

  university: 'South Mediterranean University',
  studentBranch: 'SMU Student Branch',
  city: 'Tunis',
  country: 'Tunisia',
  timeZone: 'Africa/Tunis',
  founded: 2019, // TODO: year the chapter was founded

  email: 'chapter@example.org', // TODO: chapter email address

  social: {
    facebook: 'https://www.facebook.com/', // TODO: chapter Facebook page
    instagram: 'https://www.instagram.com/ieee.ias.ies.pes.smu/',
    linkedin: 'https://www.linkedin.com/', // TODO: chapter LinkedIn page
  },

  /** Key numbers shown on the home page. */
  stats: {
    members: 120, // TODO: current number of members
    eventsPerYear: 14, // TODO: events organised last year
  },

  /**
   * Google Maps embed: `mapQuery` is what the map searches for (or paste a full embed URL from
   * Google Maps → Share → Embed a map into `mapEmbedUrl` to pin an exact building).
   */
  mapQuery: 'South Mediterranean University, Berges du Lac 2, Tunis',
  mapEmbedUrl: '', // optional
  address: 'South Mediterranean University, Berges du Lac 2, Tunis, Tunisia',

  /** Formspree form ID, the part after https://formspree.io/f/ */
  formspreeId: 'TODO_FORMSPREE_ID', // TODO: create a free form at formspree.io

  /** Full chapter logo (society logos above the three-colour wave), in /public/logos. */
  logoColour: '/logos/chapter-logo.webp', // for light backgrounds (PNG kept for the icon script)
  logoWhite: '/logos/chapter-logo-white.webp', // for black backgrounds and dark mode
} as const;

export const nav = [
  { href: '/about/', label: 'About' },
  { href: '/events/', label: 'Events' },
  { href: '/team/', label: 'Team' },
  { href: '/news/', label: 'News' },
  { href: '/contact/', label: 'Contact' },
] as const;

export const membershipUrl = 'https://www.ieee.org/membership/join/index.html';
