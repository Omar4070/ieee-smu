/**
 * The three IEEE societies of the joint chapter, in power-chain order:
 * PES generates and moves energy, IES converts and controls it, IAS puts it to work.
 *
 * `logo`: path to the official society logo in /public/logos (SVG or PNG).
 * Leave it empty to show the society's acronym instead.
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
  logo: string;
}

export const societies: Society[] = [
  {
    id: 'PES',
    name: 'Power & Energy Society',
    role: 'Generates and moves energy',
    summary:
      'PES is the IEEE community for the electric power industry: how electricity is generated, transmitted, distributed and used, from large power plants to smart grids and renewables.',
    focus: ['Power generation', 'Transmission and distribution', 'Smart grids', 'Renewable integration', 'Energy storage'],
    benefits: [
      'IEEE Power & Energy Magazine',
      'Student and young professional programmes, awards and competitions',
      'Reduced fees at PES conferences such as the General Meeting',
    ],
    url: 'https://ieee-pes.org/',
    field: 'pes',
    logo: '', // TODO: '/logos/pes.svg'
  },
  {
    id: 'IES',
    name: 'Industrial Electronics Society',
    role: 'Converts and controls it',
    summary:
      'IES covers electronics applied to industry: power electronics, motion control, robotics, factory automation and industrial informatics.',
    focus: ['Power electronics', 'Motion control', 'Robotics', 'Factory automation', 'Industrial informatics'],
    benefits: [
      'IEEE Industrial Electronics Magazine',
      'Student awards and travel support for IES conferences',
      'Reduced fees at conferences such as IECON',
    ],
    url: 'https://www.ieee-ies.org/',
    field: 'ies',
    logo: '', // TODO: '/logos/ies.svg'
  },
  {
    id: 'IAS',
    name: 'Industry Applications Society',
    role: 'Puts it to work in industry',
    summary:
      'IAS is about the electrical systems that run industry and commerce: electric machines and drives, industrial power systems, process industries and electrical safety.',
    focus: ['Electric machines and drives', 'Industrial power systems', 'Process industries', 'Electrical safety', 'Transportation electrification'],
    benefits: [
      'IEEE Industry Applications Magazine',
      'Student project and paper competitions',
      'Reduced fees at IAS conferences such as the Annual Meeting',
    ],
    url: 'https://ias.ieee.org/',
    field: 'ias',
    logo: '', // TODO: '/logos/ias.svg'
  },
];

export const societyById = Object.fromEntries(societies.map((s) => [s.id, s])) as Record<SocietyId, Society>;
