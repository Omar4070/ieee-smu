/**
 * Chapter-wide settings. Every value marked TODO is a placeholder:
 * replace it with the real information and the whole site updates.
 */
export const site = {
  name: 'IEEE IES/IAS/PES Joint Chapter',
  shortName: 'IES · IAS · PES',
  tagline: 'Power, electronics and industry, built by students.',
  description:
    'The IEEE Industrial Electronics, Industry Applications and Power & Energy societies joint student chapter: workshops, industrial visits and competitions for engineering students.',

  university: '[University name]', // TODO: e.g. "University of Example"
  studentBranch: '[University] IEEE Student Branch', // TODO: official student branch name
  city: '[City]', // TODO
  country: '[Country]', // TODO
  timeZone: 'UTC', // TODO: IANA time zone of your city, e.g. "Africa/Algiers", "Europe/Paris"
  founded: 2019, // TODO: year the chapter was founded

  email: 'chapter@example.org', // TODO: chapter email address

  social: {
    facebook: 'https://www.facebook.com/', // TODO: chapter Facebook page
    instagram: 'https://www.instagram.com/', // TODO: chapter Instagram profile
    linkedin: 'https://www.linkedin.com/', // TODO: chapter LinkedIn page
  },

  /** Key numbers shown on the home page. */
  stats: {
    members: 120, // TODO: current number of members
    eventsPerYear: 14, // TODO: events organised last year
  },

  /**
   * Google Maps embed. Replace `mapQuery` with your building's name and city
   * (or paste a full embed URL from Google Maps → Share → Embed a map into `mapEmbedUrl`).
   */
  mapQuery: 'Faculty of Electrical Engineering', // TODO
  mapEmbedUrl: '', // TODO (optional)
  address: '[Building, Faculty of Electrical Engineering, University, City]', // TODO

  /** Formspree form ID, the part after https://formspree.io/f/ */
  formspreeId: 'TODO_FORMSPREE_ID', // TODO: create a free form at formspree.io

  /** Chapter logo in /public/logos. Leave empty to use the built-in mark. */
  logo: '', // TODO: e.g. '/logos/chapter.svg'
} as const;

export const nav = [
  { href: '/about/', label: 'About' },
  { href: '/events/', label: 'Events' },
  { href: '/team/', label: 'Team' },
  { href: '/news/', label: 'News' },
  { href: '/contact/', label: 'Contact' },
] as const;

export const membershipUrl = 'https://www.ieee.org/membership/join/index.html';
