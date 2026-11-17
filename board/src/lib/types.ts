// The board's data, one interface per table in supabase/schema.sql. Keep the two in step.

/** ISO calendar date, "2026-11-21". */
export type Day = string;
export type EventStatus = 'planning' | 'announced' | 'cancelled';
export type Presence = 'present' | 'excused' | 'absent';

export interface Member {
  id: string;
  email: string;
  full_name: string;
  /** "Chair", "Treasurer", "Workshop ambassador"… */
  role: string;
  /** Admins add and edit people and give out invite codes. */
  admin: boolean;
  /** False once they leave the board: no login, history kept. */
  active: boolean;
  auth_user_id: string | null;
  created_at: string;
}

export interface Invite {
  member_id: string;
  code: string;
  created_at: string;
}

export interface BoardEvent {
  id: string;
  title: string;
  date: Day;
  time: string | null;
  place: string | null;
  ambassador_id: string | null;
  status: EventStatus;
  notes: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  owner_id: string | null;
  due_date: Day | null;
  done: boolean;
  done_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Meeting {
  id: string;
  date: Day;
  time: string | null;
  place: string | null;
  pv_path: string | null;
  pv_name: string | null;
  created_at: string;
}

export interface Attendance {
  meeting_id: string;
  member_id: string;
  status: Presence;
}

export interface Data {
  members: Member[];
  invites: Invite[];
  events: BoardEvent[];
  tasks: Task[];
  meetings: Meeting[];
  attendance: Attendance[];
}

/** Tables the app edits row by row (each row has an `id`). */
export interface Rows {
  members: Member;
  events: BoardEvent;
  tasks: Task;
  meetings: Meeting;
}
export type Table = keyof Rows;

export type InviteCheck = 'ok' | 'not_member' | 'already_linked' | 'bad_code';

export interface Backend {
  mode: 'live' | 'demo';
  /** The signed-in login (Supabase user id, or the demo member's id), or null. */
  session(): Promise<string | null>;
  onAuthChange(cb: () => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, code: string): Promise<void>;
  signOut(): Promise<void>;
  checkInvite(email: string, code: string): Promise<InviteCheck>;
  load(): Promise<Data>;
  insert<T extends Table>(table: T, row: Partial<Rows[T]>): Promise<Rows[T]>;
  update<T extends Table>(table: T, id: string, patch: Partial<Rows[T]>): Promise<Rows[T]>;
  remove(table: Table, id: string): Promise<void>;
  /** One mark per (meeting, member), replacing any earlier one. */
  mark(rows: Attendance[]): Promise<void>;
  saveInvite(memberId: string, code: string): Promise<Invite>;
  resetLogin(memberId: string): Promise<void>;
  uploadFile(path: string, file: File): Promise<void>;
  fileUrl(path: string): Promise<string>;
  removeFile(path: string): Promise<void>;
}
