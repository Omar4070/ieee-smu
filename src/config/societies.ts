/**
 * The three IEEE societies of the joint chapter, in the order of the chapter
 * logo: Industry Applications, Industrial Electronics, Power & Energy.
 * Colours come from the chapter palette. On the site, societies are shown by
 * their logos (SocietyLogo.astro), never by their acronyms.
 */
export type SocietyId = 'PES' | 'IES' | 'IAS';

export interface Society {
  id: SocietyId;
  name: string;
  role: string;
  summary: string;
  focus: string[];
  benefits: string[];
  url: string;
  field: 'pes' | 'ies' | 'ias';
}

export const societies: Society[] = [
  {
    id: 'IAS',
    name: 'Industry Applications Society',
    role: 'Puts energy to work in industry',
    summary:
      'The electrical systems that run industry and commerce: electric machines and drives, industrial power systems, process industries and electrical safety: this is the world of the Industry Applications Society.',
    focus: ['Electric machines and drives', 'Industrial power systems', 'Process industries', 'Electrical safety', 'Transportation electrification'],
    benefits: [
      'IEEE Industry Applications Magazine',
      'Student project and paper competitions',
      'Reduced fees at the society’s conferences, such as its Annual Meeting',
    ],
    url: 'https://ias.ieee.org/',
    field: 'ias',
  },
  {
    id: 'IES',
    name: 'Industrial Electronics Society',
    role: 'Converts and controls it',
    summary:
      'Electronics applied to industry: power electronics, motion control, robotics, factory automation and industrial informatics.',
    focus: ['Power electronics', 'Motion control', 'Robotics', 'Factory automation', 'Industrial informatics'],
    benefits: [
      'IEEE Industrial Electronics Magazine',
      'Student awards and travel support for the society’s conferences',
      'Reduced fees at conferences such as IECON',
    ],
    url: 'https://www.ieee-ies.org/',
    field: 'ies',
  },
  {
    id: 'PES',
    name: 'Power & Energy Society',
    role: 'Generates and moves it',
    summary:
      'The IEEE community for the electric power industry: how electricity is generated, transmitted, distributed and used, from large power plants to smart grids and renewables.',
    focus: ['Power generation', 'Transmission and distribution', 'Smart grids', 'Renewable integration', 'Energy storage'],
    benefits: [
      'IEEE Power & Energy Magazine',
      'Student and young professional programmes, awards and competitions',
      'Reduced fees at the society’s conferences, such as its General Meeting',
    ],
    url: 'https://ieee-pes.org/',
    field: 'pes',
  },
];

export const societyById = Object.fromEntries(societies.map((s) => [s.id, s])) as Record<SocietyId, Society>;
