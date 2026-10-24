-- Pure Function: database schema. Run once in Supabase > SQL Editor, then run auth.sql.
-- Design: simple JSONB document tables so the app's types map 1:1.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('trainer','client')),
  display_name text not null default '',
  client_id text,               -- set for role='client'
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.workouts (
  client_id text not null,
  date text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (client_id, date)
);

create table if not exists public.nutrition (
  client_id text not null,
  date text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (client_id, date)
);

create table if not exists public.messages (
  id text primary key,
  client_id text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Helpers live in a schema the API does not expose (security definer avoids RLS recursion).
create schema if not exists private;

create or replace function private.is_trainer() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'trainer');
$$;

create or replace function private.my_client_id() returns text
language sql stable security definer set search_path = public as $$
  select client_id from profiles where id = auth.uid();
$$;

grant usage on schema private to authenticated;
revoke execute on function private.is_trainer(), private.my_client_id() from public, anon;
grant execute on function private.is_trainer(), private.my_client_id() to authenticated;

alter table public.profiles  enable row level security;
alter table public.clients   enable row level security;
alter table public.workouts  enable row level security;
alter table public.nutrition enable row level security;
alter table public.messages  enable row level security;

-- Only signed-in users have policies; anonymous requests see nothing.
-- profiles: read own; trainer reads/writes all
create policy "profiles self read"   on public.profiles to authenticated for select using (id = auth.uid() or private.is_trainer());
create policy "profiles trainer all" on public.profiles to authenticated for all    using (private.is_trainer()) with check (private.is_trainer());

-- clients: trainer full; client reads/updates only own row
create policy "clients trainer all" on public.clients to authenticated for all using (private.is_trainer()) with check (private.is_trainer());
create policy "clients self read"   on public.clients to authenticated for select using (id = private.my_client_id());
create policy "clients self update" on public.clients to authenticated for update using (id = private.my_client_id()) with check (id = private.my_client_id());

-- workouts / nutrition / messages: trainer full; client only own client_id
create policy "workouts trainer all"  on public.workouts  to authenticated for all using (private.is_trainer()) with check (private.is_trainer());
create policy "workouts self all"     on public.workouts  to authenticated for all using (client_id = private.my_client_id()) with check (client_id = private.my_client_id());
create policy "nutrition trainer all" on public.nutrition to authenticated for all using (private.is_trainer()) with check (private.is_trainer());
create policy "nutrition self all"    on public.nutrition to authenticated for all using (client_id = private.my_client_id()) with check (client_id = private.my_client_id());
create policy "messages trainer all"  on public.messages  to authenticated for all using (private.is_trainer()) with check (private.is_trainer());
create policy "messages self all"     on public.messages  to authenticated for all using (client_id = private.my_client_id()) with check (client_id = private.my_client_id());

-- Realtime: chat messages and workout edits show up live on other devices.
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.workouts;
exception when duplicate_object then null; end $$;
