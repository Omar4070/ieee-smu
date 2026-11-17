import type { Data, Member } from './types';

// What the demo starts with (only while the app is not connected to Supabase): the 2026–2027
// committee as listed on the website's Team page (src/content/team/2026-2027.json), with their
// roles, and nothing else. Tasks, events and meetings are added in the app; they stay in this
// browser. Update this list when the committee changes.

const COMMITTEE: [name: string, role: string, admin: boolean][] = [
  ['Hedi Ennaifer', 'Chair', true],
  ['Zayneb Sassi', 'Vice-Chair', true],
  ['Malak Belhadj', 'Secretary', false],
  ['Youssef Bousnina', 'Treasurer', false],
  ['Mouhannad Elfarra', 'HR Manager', false],
  ['Omar Ben Tkhayat', 'Webmaster', true],
  ['Walid Fakhfakh', 'Media Manager', false],
];

export function demoData(): Data {
  const now = new Date().toISOString();
  const members: Member[] = COMMITTEE.map(([full_name, role, admin], i) => ({
    id: `m-${i + 1}`,
    email: '', // real emails are added on the Team screen
    full_name,
    role,
    admin,
    active: true,
    auth_user_id: `m-${i + 1}`,
    created_at: now,
  }));
  return { members, invites: [], events: [], tasks: [], meetings: [], attendance: [] };
}
