-- Board app database. Run this whole file once in Supabase: SQL editor → New query → paste → Run.
-- It creates the tables, the access rules, the PV storage and the sign-up check.
--
-- Who can do what:
--   everyone on the board  reads and edits events, tasks, meetings, attendance and PVs
--   admins                 also add and edit people and give out invite codes

-- ---------------------------------------------------------------- tables

create table public.members (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  full_name text not null,
  role text not null default 'Board member',
  admin boolean not null default false,
  active boolean not null default true,
  -- set by the sign-up check below; cleared when the login is reset
  auth_user_id uuid unique references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- One open invite code per member who has not signed in yet. Admins only.
create table public.invites (
  member_id uuid primary key references public.members (id) on delete cascade,
  code text not null check (code = upper(code)),
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  time text,
  place text,
  ambassador_id uuid references public.members (id) on delete set null,
  status text not null default 'planning' check (status in ('planning', 'announced', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  owner_id uuid references public.members (id) on delete set null,
  due_date date,
  done boolean not null default false,
  done_at timestamptz,
  created_by uuid references public.members (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text,
  place text,
  pv_path text,
  pv_name text,
  created_at timestamptz not null default now()
);

create table public.attendance (
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  status text not null check (status in ('present', 'excused', 'absent')),
  primary key (meeting_id, member_id)
);

-- ---------------------------------------------------------------- who is asking

create or replace function public.is_board() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where auth_user_id = auth.uid() and active)
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where auth_user_id = auth.uid() and active and admin)
$$;

-- ---------------------------------------------------------------- access rules

alter table public.members enable row level security;
alter table public.invites enable row level security;
alter table public.events enable row level security;
alter table public.tasks enable row level security;
alter table public.meetings enable row level security;
alter table public.attendance enable row level security;

create policy "board reads members" on public.members for select to authenticated using (public.is_board());
create policy "admins manage members" on public.members for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins manage invites" on public.invites for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "board manages events" on public.events for all to authenticated
  using (public.is_board()) with check (public.is_board());
create policy "board manages tasks" on public.tasks for all to authenticated
  using (public.is_board()) with check (public.is_board());
create policy "board manages meetings" on public.meetings for all to authenticated
  using (public.is_board()) with check (public.is_board());
create policy "board manages attendance" on public.attendance for all to authenticated
  using (public.is_board()) with check (public.is_board());

-- ---------------------------------------------------------------- functions the app calls

-- Lets the "First time here?" form say what is wrong before it tries to create the account.
create or replace function public.check_invite(p_email text, p_code text) returns text
language plpgsql stable security definer set search_path = public as $$
declare m public.members;
begin
  select * into m from public.members where email = lower(trim(p_email)) and active;
  if m.id is null then return 'not_member'; end if;
  if m.auth_user_id is not null then return 'already_linked'; end if;
  if not exists (select 1 from public.invites where member_id = m.id and code = upper(trim(p_code))) then
    return 'bad_code';
  end if;
  return 'ok';
end $$;

-- Deletes a member's login so they can sign up again with a new invite code (forgotten
-- password). Their tasks, events and attendance stay: they belong to the member, not the login.
create or replace function public.reset_member_login(p_member uuid) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if not public.is_admin() then raise exception 'Only admins can reset a login.'; end if;
  select auth_user_id into uid from public.members where id = p_member;
  if uid is null then return; end if;
  if uid = auth.uid() then raise exception 'You cannot reset your own login.'; end if;
  delete from auth.users where id = uid;
end $$;

-- ---------------------------------------------------------------- the sign-up check

-- Only people on the board list, with the invite code an admin gave them, can create an account.
create or replace function public.link_board_member() returns trigger
language plpgsql security definer set search_path = public as $$
declare m public.members;
begin
  select * into m from public.members where email = lower(new.email) and active;
  if m.id is null then raise exception 'This email is not on the board list.'; end if;
  if m.auth_user_id is not null then raise exception 'This board member already has an account.'; end if;
  if not exists (
    select 1 from public.invites
    where member_id = m.id and code = upper(trim(coalesce(new.raw_user_meta_data ->> 'invite_code', '')))
  ) then
    raise exception 'The invite code does not match.';
  end if;
  update public.members set auth_user_id = new.id where id = m.id;
  delete from public.invites where member_id = m.id;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.link_board_member();

-- ---------------------------------------------------------------- PV storage

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pvs', 'pvs', false, 10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do nothing;

create policy "board reads PVs" on storage.objects for select to authenticated
  using (bucket_id = 'pvs' and public.is_board());
create policy "board uploads PVs" on storage.objects for insert to authenticated
  with check (bucket_id = 'pvs' and public.is_board());
create policy "board replaces PVs" on storage.objects for update to authenticated
  using (bucket_id = 'pvs' and public.is_board());
create policy "board removes PVs" on storage.objects for delete to authenticated
  using (bucket_id = 'pvs' and public.is_board());
