import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { backend } from './lib/backend';
import { byBoardOrder } from './lib/rules';
import type { BoardEvent, Data, Invite, Meeting, Member, Presence, Rows, Table, Task } from './lib/types';

export interface ToastItem { id: number; text: string; tone: 'ok' | 'error' }

export interface Store {
  mode: 'live' | 'demo';
  data: Data;
  me: Member;
  member(id: string | null | undefined): Member | undefined;
  /** A stable pale hue per person, neighbours at least 60° apart. */
  hue(id: string | null | undefined): number;
  toast(text: string, tone?: ToastItem['tone']): void;
  signOut(): Promise<void>;

  saveTask(input: Partial<Task>): Promise<Task | undefined>;
  toggleTask(t: Task): Promise<void>;
  deleteTask(t: Task): Promise<boolean>;

  saveEvent(input: Partial<BoardEvent>): Promise<BoardEvent | undefined>;
  deleteEvent(e: BoardEvent): Promise<boolean>;

  saveMeeting(input: Partial<Meeting>): Promise<Meeting | undefined>;
  deleteMeeting(m: Meeting): Promise<boolean>;
  mark(meetingId: string, memberIds: string[], status: Presence): Promise<void>;
  uploadPv(m: Meeting, file: File): Promise<void>;
  openPv(m: Meeting): Promise<void>;
  removePv(m: Meeting): Promise<void>;

  saveMember(input: Partial<Member>): Promise<Member | undefined>;
  newInvite(m: Member): Promise<Invite | undefined>;
  resetLogin(m: Member): Promise<Invite | undefined>;
}

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}

// Pale identity tints for people, in board order; no two neighbours closer than 60°.
const HUES = [205, 25, 145, 340, 50, 175, 5, 90, 225, 320, 120, 30];
export const hueAt = (i: number) => HUES[i % HUES.length];

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

function upsertBy<T>(list: T[], row: T, same: (a: T) => boolean): T[] {
  const i = list.findIndex(same);
  if (i < 0) return [...list, row];
  const next = list.slice();
  next[i] = row;
  return next;
}

export function StoreProvider(props: {
  initial: Data;
  me: Member;
  onToast(t: ToastItem): void;
  onSignOut(): Promise<void>;
  children: ReactNode;
}) {
  const [data, setData] = useState<Data>(props.initial);
  const me = data.members.find((m) => m.id === props.me.id) ?? props.me;
  const toastId = useRef(0);
  const { onToast } = props;
  const toast = useCallback((text: string, tone: ToastItem['tone'] = 'ok') => {
    onToast({ id: ++toastId.current, text, tone });
  }, [onToast]);

  const hueMap = useMemo(() => {
    const map = new Map<string, number>();
    [...data.members].sort(byBoardOrder).forEach((m, i) => map.set(m.id, hueAt(i)));
    return map;
  }, [data.members]);

  // Every local change bumps this, so a refresh that started before it never overwrites it.
  const writes = useRef(0);

  const put = <T extends Table>(table: T, row: Rows[T]) => {
    writes.current++;
    setData((d) => ({ ...d, [table]: upsertBy(d[table] as Rows[T][], row, (r) => r.id === row.id) }));
  };
  const drop = (table: Table, id: string) => {
    writes.current++;
    setData((d) => ({ ...d, [table]: (d[table] as { id: string }[]).filter((r) => r.id !== id) }));
  };

  /** Runs a save; on failure shows the error and returns undefined (so `fn` must return a value). */
  async function attempt<T>(fn: () => Promise<T>, ok?: string): Promise<T | undefined> {
    writes.current++;
    try {
      const r = await fn();
      if (ok) toast(ok);
      return r;
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Something went wrong. Try again.', 'error');
      return undefined;
    } finally {
      writes.current++;
    }
  }

  // ---------------------------------------------------------- refresh by itself
  // Everyone else's changes arrive without a reload: when the app comes back to the screen (phone
  // unlocked, tab reopened, connection back) and every minute while it is open. Quiet on failure:
  // offline, the screen simply keeps what it has.
  const lastLoad = useRef(Date.now());
  const refresh = useCallback(async () => {
    const before = writes.current;
    try {
      const fresh = await backend.load();
      lastLoad.current = Date.now();
      if (writes.current === before) setData(fresh); // a save happened meanwhile: wait for the next round
    } catch { /* keep what is on screen */ }
  }, []);
  useEffect(() => {
    const back = () => { if (document.visibilityState === 'visible' && Date.now() - lastLoad.current > 15_000) refresh(); };
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 60_000);
    document.addEventListener('visibilitychange', back);
    window.addEventListener('focus', back);
    window.addEventListener('online', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', back);
      window.removeEventListener('focus', back);
      window.removeEventListener('online', refresh);
    };
  }, [refresh]);

  async function save<T extends Table>(table: T, input: Partial<Rows[T]>, extra: Partial<Rows[T]>, added: string, saved: string) {
    const { id, ...rest } = input as Partial<Rows[T]> & { id?: string };
    const row = await attempt(
      () => (id ? backend.update(table, id, rest as Partial<Rows[T]>) : backend.insert(table, { ...extra, ...rest } as Partial<Rows[T]>)),
      id ? saved : added,
    );
    if (row) put(table, row);
    return row;
  }

  async function remove(table: Table, id: string, ok: string) {
    const done = await attempt(async () => { await backend.remove(table, id); return true; }, ok);
    if (done === undefined) return false;
    drop(table, id);
    return true;
  }

  const store: Store = {
    mode: backend.mode,
    data,
    me,
    member: (id) => (id ? data.members.find((m) => m.id === id) : undefined),
    hue: (id) => (id ? hueMap.get(id) ?? 205 : 205),
    toast,
    signOut: props.onSignOut,

    // -------------------------------------------------------- tasks
    saveTask: (input) => save('tasks', input, { done: false, created_by: me.id }, 'Task added.', 'Task saved.'),
    async toggleTask(t) {
      const patch = { done: !t.done, done_at: t.done ? null : new Date().toISOString() };
      put('tasks', { ...t, ...patch }); // feels instant; put back below if the save fails
      const row = await attempt(() => backend.update('tasks', t.id, patch));
      put('tasks', row ?? t);
    },
    deleteTask: (t) => remove('tasks', t.id, 'Task deleted.'),

    // -------------------------------------------------------- events
    saveEvent: (input) => save('events', input, { status: 'planning' }, 'Event added.', 'Event saved.'),
    deleteEvent: (e) => remove('events', e.id, 'Event deleted.'),

    // -------------------------------------------------------- meetings
    saveMeeting: (input) => save('meetings', input, {}, 'Meeting added.', 'Meeting saved.'),
    async deleteMeeting(m) {
      if (m.pv_path) await backend.removeFile(m.pv_path).catch(() => undefined);
      const ok = await remove('meetings', m.id, 'Meeting deleted.');
      if (ok) setData((d) => ({ ...d, attendance: d.attendance.filter((a) => a.meeting_id !== m.id) }));
      return ok;
    },
    async mark(meetingId, memberIds, status) {
      const rows = memberIds.map((member_id) => ({ meeting_id: meetingId, member_id, status }));
      const before = data.attendance;
      const apply = (list: Data['attendance']) =>
        rows.reduce((acc, r) => upsertBy(acc, r, (a) => a.meeting_id === r.meeting_id && a.member_id === r.member_id), list);
      setData((d) => ({ ...d, attendance: apply(d.attendance) })); // instant; undone if the save fails
      const ok = await attempt(async () => { await backend.mark(rows); return true; });
      if (ok === undefined) setData((d) => ({ ...d, attendance: before }));
    },
    async uploadPv(m, file) {
      const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'pdf';
      const path = `${m.date}/pv-${m.id.slice(0, 8)}-${Date.now()}.${ext}`;
      const row = await attempt(async () => {
        await backend.uploadFile(path, file);
        if (m.pv_path && m.pv_path !== path) await backend.removeFile(m.pv_path).catch(() => undefined);
        return backend.update('meetings', m.id, { pv_path: path, pv_name: file.name });
      }, 'PV uploaded.');
      if (row) put('meetings', row);
    },
    async openPv(m) {
      if (!m.pv_path) return;
      const w = window.open('about:blank', '_blank');
      const url = await attempt(() => backend.fileUrl(m.pv_path!));
      if (!url) { w?.close(); return; }
      if (w) w.location.href = url;
      else window.location.href = url;
    },
    async removePv(m) {
      const row = await attempt(async () => {
        if (m.pv_path) await backend.removeFile(m.pv_path);
        return backend.update('meetings', m.id, { pv_path: null, pv_name: null });
      }, 'PV removed.');
      if (row) put('meetings', row);
    },

    // -------------------------------------------------------- people
    async saveMember(input) {
      const clean = { ...input, ...(input.email ? { email: input.email.trim().toLowerCase() } : {}) };
      return save('members', clean, { active: true, admin: false }, 'Member added.', 'Member saved.');
    },
    async newInvite(m) {
      const inv = await attempt(() => backend.saveInvite(m.id, newCode()));
      if (inv) setData((d) => ({ ...d, invites: upsertBy(d.invites, inv, (i) => i.member_id === m.id) }));
      return inv;
    },
    async resetLogin(m) {
      const ok = await attempt(async () => { await backend.resetLogin(m.id); return true; });
      if (ok === undefined) return undefined;
      put('members', { ...m, auth_user_id: null });
      return store.newInvite({ ...m, auth_user_id: null });
    },
  };

  return <Ctx.Provider value={store}>{props.children}</Ctx.Provider>;
}
