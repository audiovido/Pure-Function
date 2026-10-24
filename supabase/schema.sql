-- Pure Function: Supabase schema (run once in Supabase Dashboard > SQL Editor)
-- Design: simple JSONB document tables so the existing app types map 1:1.

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

-- Helper functions (security definer avoids RLS recursion on profiles)
create or replace function public.is_trainer() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'trainer');
$$;

create or replace function public.my_client_id() returns text
language sql stable security definer set search_path = public as $$
  select client_id from profiles where id = auth.uid();
$$;

alter table public.profiles  enable row level security;
alter table public.clients   enable row level security;
alter table public.workouts  enable row level security;
alter table public.nutrition enable row level security;
alter table public.messages  enable row level security;

-- profiles: everyone reads own; trainer reads/writes all
create policy "profiles self read"   on public.profiles for select using (id = auth.uid() or public.is_trainer());
create policy "profiles trainer all" on public.profiles for all    using (public.is_trainer()) with check (public.is_trainer());

-- clients: trainer full; client reads/updates only own row
create policy "clients trainer all" on public.clients for all using (public.is_trainer()) with check (public.is_trainer());
create policy "clients self read"   on public.clients for select using (id = public.my_client_id());
create policy "clients self update" on public.clients for update using (id = public.my_client_id()) with check (id = public.my_client_id());

-- workouts / nutrition / messages: trainer full; client only own client_id
create policy "workouts trainer all" on public.workouts for all using (public.is_trainer()) with check (public.is_trainer());
create policy "workouts self all"    on public.workouts for all using (client_id = public.my_client_id()) with check (client_id = public.my_client_id());

create policy "nutrition trainer all" on public.nutrition for all using (public.is_trainer()) with check (public.is_trainer());
create policy "nutrition self all"    on public.nutrition for all using (client_id = public.my_client_id()) with check (client_id = public.my_client_id());

create policy "messages trainer all" on public.messages for all using (public.is_trainer()) with check (public.is_trainer());
create policy "messages self all"    on public.messages for all using (client_id = public.my_client_id()) with check (client_id = public.my_client_id());

-- Realtime for chat
alter publication supabase_realtime add table public.messages;
