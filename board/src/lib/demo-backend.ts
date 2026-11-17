import { demoData } from './demo-data';
import type { Backend, Data, Rows, Table } from './types';

// The demo keeps everything in this browser: the data in localStorage, uploaded PVs in
// IndexedDB. "Reset the demo" (account menu) goes back to the committee alone.

const DATA_KEY = 'board-demo-data-v4';
const SESSION_KEY = 'board-demo-session';

function read(): Data {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) return JSON.parse(raw) as Data;
  } catch { /* private window or blocked storage: start from the committee */ }
  const fresh = demoData();
  write(fresh);
  return fresh;
}

function write(data: Data) {
  try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch { /* the demo still works for this visit */ }
}

let memory: Data | null = null;
const db = () => (memory ??= read());
const save = () => write(db());

// ------------------------------------------------------------ files in IndexedDB
function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('board-demo-files', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('files');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function fileOp<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const base = await idb();
  return new Promise((resolve, reject) => {
    const req = fn(base.transaction('files', mode).objectStore('files'));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

let listeners: (() => void)[] = [];
const notify = () => listeners.forEach((l) => l());

export function resetDemo() {
  memory = demoData();
  save();
}

export function demoBackend(): Backend {
  return {
    mode: 'demo',

    async session() {
      // ?as=m-3 opens the demo as that person
      const as = new URLSearchParams(window.location.search).get('as');
      const m = as ? db().members.find((x) => x.id === as) : undefined;
      if (m) {
        m.auth_user_id ??= m.id;
        try { localStorage.setItem(SESSION_KEY, m.auth_user_id); } catch { return m.auth_user_id; }
      }
      let id: string | null = null;
      try { id = localStorage.getItem(SESSION_KEY); } catch { return m?.auth_user_id ?? null; }
      // a session left from an older demo whose person no longer exists: back to the picker
      return id && db().members.some((x) => x.auth_user_id === id) ? id : null;
    },

    onAuthChange(cb) {
      listeners.push(cb);
      return () => { listeners = listeners.filter((l) => l !== cb); };
    },

    async signIn(emailOrId) {
      const m = db().members.find((x) => x.id === emailOrId || x.email === emailOrId.trim().toLowerCase());
      if (!m) throw new Error('Nobody on the board has that email.');
      m.auth_user_id ??= m.id; // the demo lets you try anyone
      save();
      try { localStorage.setItem(SESSION_KEY, m.auth_user_id); } catch { /* ignore */ }
      notify();
    },

    async signUp(email, _password, code) {
      const m = db().members.find((x) => x.email === email.trim().toLowerCase());
      const inv = m && db().invites.find((i) => i.member_id === m.id);
      if (!m || !inv || inv.code !== code.trim().toUpperCase()) throw new Error('The email or the invite code does not match.');
      m.auth_user_id = m.id;
      db().invites = db().invites.filter((i) => i !== inv);
      save();
      try { localStorage.setItem(SESSION_KEY, m.id); } catch { /* ignore */ }
      notify();
    },

    async signOut() {
      try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
      notify();
    },

    async checkInvite(email, code) {
      const m = db().members.find((x) => x.email === email.trim().toLowerCase() && x.active);
      if (!m) return 'not_member';
      if (m.auth_user_id) return 'already_linked';
      const inv = db().invites.find((i) => i.member_id === m.id);
      return inv && inv.code === code.trim().toUpperCase() ? 'ok' : 'bad_code';
    },

    async load() {
      return structuredClone(db());
    },

    async insert<T extends Table>(table: T, row: Partial<Rows[T]>) {
      const full = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row } as unknown as Rows[T];
      (db()[table] as Rows[T][]).push(full);
      save();
      return structuredClone(full);
    },

    async update<T extends Table>(table: T, id: string, patch: Partial<Rows[T]>) {
      const list = db()[table] as Rows[T][];
      const i = list.findIndex((r) => r.id === id);
      if (i < 0) throw new Error('That item no longer exists. Reload the page.');
      list[i] = { ...list[i], ...patch };
      save();
      return structuredClone(list[i]);
    },

    async remove(table, id) {
      const d = db();
      d[table] = (d[table] as { id: string }[]).filter((r) => r.id !== id) as never;
      if (table === 'meetings') d.attendance = d.attendance.filter((a) => a.meeting_id !== id);
      if (table === 'members') d.attendance = d.attendance.filter((a) => a.member_id !== id);
      save();
    },

    async mark(rows) {
      const d = db();
      for (const r of rows) {
        const existing = d.attendance.find((a) => a.meeting_id === r.meeting_id && a.member_id === r.member_id);
        if (existing) existing.status = r.status;
        else d.attendance.push({ ...r });
      }
      save();
    },

    async saveInvite(memberId, code) {
      const d = db();
      d.invites = d.invites.filter((i) => i.member_id !== memberId);
      const inv = { member_id: memberId, code, created_at: new Date().toISOString() };
      d.invites.push(inv);
      save();
      return { ...inv };
    },

    async resetLogin(memberId) {
      const m = db().members.find((x) => x.id === memberId);
      if (m) m.auth_user_id = null;
      save();
    },

    async uploadFile(path, file) {
      await fileOp('readwrite', (s) => s.put(file, path));
    },

    async fileUrl(path) {
      let blob: Blob | undefined;
      try { blob = await fileOp<Blob | undefined>('readonly', (s) => s.get(path) as IDBRequest<Blob | undefined>); } catch { /* no IndexedDB */ }
      if (!blob) throw new Error('This file is not in this browser any more. Upload it again.');
      return URL.createObjectURL(blob);
    },

    async removeFile(path) {
      try { await fileOp('readwrite', (s) => s.delete(path)); } catch { /* nothing stored */ }
    },
  };
}
