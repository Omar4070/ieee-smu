import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Attendance, Backend, Data, Invite, InviteCheck, Rows, Table } from './types';

const BUCKET = 'pvs';

/** Turns Supabase's technical errors into sentences a board member can act on. */
function friendly(error: { message: string } | null): void {
  if (!error) return;
  const m = error.message || '';
  if (/Invalid login credentials/i.test(m)) throw new Error('That email and password do not match. Check both, or ask an admin to reset your login.');
  if (/Database error saving new user/i.test(m)) throw new Error('The account could not be created. Check the email and the invite code with an admin.');
  if (/row-level security|permission denied/i.test(m)) throw new Error('Only an admin can do this.');
  if (/Failed to fetch|NetworkError/i.test(m)) throw new Error('No connection. Check your internet and try again.');
  if (/Password should be at least/i.test(m)) throw new Error('Choose a password of at least 8 characters.');
  throw new Error(m);
}

export function supabaseBackend(url: string, key: string): Backend {
  const db: SupabaseClient = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });

  async function all<T>(table: string): Promise<T[]> {
    const { data, error } = await db.from(table).select('*');
    friendly(error);
    return (data ?? []) as T[];
  }

  return {
    mode: 'live',

    async session() {
      const { data } = await db.auth.getSession();
      return data.session?.user.id ?? null;
    },

    onAuthChange(cb) {
      const { data } = db.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') cb();
      });
      return () => data.subscription.unsubscribe();
    },

    async signIn(email, password) {
      const { error } = await db.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      friendly(error);
    },

    async signUp(email, password, code) {
      const { data, error } = await db.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { invite_code: code.trim().toUpperCase() } },
      });
      friendly(error);
      // With "Confirm email" switched off in Supabase the new account is signed in at once.
      if (!data.session) throw new Error('Account created, but Supabase is waiting for an email confirmation. Ask the Webmaster to switch off "Confirm email" (see board/README.md).');
    },

    async signOut() {
      await db.auth.signOut();
    },

    async checkInvite(email, code) {
      const { data, error } = await db.rpc('check_invite', { p_email: email, p_code: code });
      friendly(error);
      return data as InviteCheck;
    },

    async load(): Promise<Data> {
      const [members, invites, events, tasks, meetings, attendance] = await Promise.all([
        all<Data['members'][number]>('members'),
        all<Invite>('invites'),
        all<Data['events'][number]>('events'),
        all<Data['tasks'][number]>('tasks'),
        all<Data['meetings'][number]>('meetings'),
        all<Attendance>('attendance'),
      ]);
      return { members, invites, events, tasks, meetings, attendance };
    },

    async insert<T extends Table>(table: T, row: Partial<Rows[T]>) {
      const { data, error } = await db.from(table).insert(row as never).select().single();
      friendly(error);
      return data as Rows[T];
    },

    async update<T extends Table>(table: T, id: string, patch: Partial<Rows[T]>) {
      const { data, error } = await db.from(table).update(patch as never).eq('id', id).select().single();
      friendly(error);
      return data as Rows[T];
    },

    async remove(table, id) {
      const { error } = await db.from(table).delete().eq('id', id);
      friendly(error);
    },

    async mark(rows) {
      const { error } = await db.from('attendance').upsert(rows, { onConflict: 'meeting_id,member_id' });
      friendly(error);
    },

    async saveInvite(memberId, code) {
      const { data, error } = await db
        .from('invites')
        .upsert({ member_id: memberId, code, created_at: new Date().toISOString() }, { onConflict: 'member_id' })
        .select()
        .single();
      friendly(error);
      return data as Invite;
    },

    async resetLogin(memberId) {
      const { error } = await db.rpc('reset_member_login', { p_member: memberId });
      friendly(error);
    },

    async uploadFile(path, file) {
      const { error } = await db.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type || undefined });
      friendly(error);
    },

    async fileUrl(path) {
      const { data, error } = await db.storage.from(BUCKET).createSignedUrl(path, 60 * 10);
      friendly(error);
      return data!.signedUrl;
    },

    async removeFile(path) {
      const { error } = await db.storage.from(BUCKET).remove([path]);
      friendly(error);
    },
  };
}
