-- Run this once, after schema.sql, to create the first admin (you).
-- 1. Replace the email and the name below with yours.
-- 2. Run it in Supabase: SQL editor → New query → paste → Run.
-- 3. Open the board app → "First time here?" → your email, the code BOARD2026 and a new password.
-- Then add everyone else from the app (Team → Add member); each gets their own invite code.

insert into public.members (email, full_name, role, admin)
values (lower('you@example.com'), 'Your name', 'Webmaster', true);

insert into public.invites (member_id, code)
select id, 'BOARD2026' from public.members where email = lower('you@example.com');
