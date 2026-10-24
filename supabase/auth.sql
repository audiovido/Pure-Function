-- Pure Function: who gets which role (run AFTER schema.sql, once).
--   * The COACH role goes only to the configured coach email (not "whoever signs up first").
--   * A CLIENT role goes to someone whose email the coach already added to a client profile.
--   * Anyone else gets no profile and cannot see any data.

create table if not exists private.settings (
  key text primary key,
  value text not null
);
revoke all on private.settings from public, anon, authenticated;

create or replace function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  coach_email text;
  cid text;
  cname text;
begin
  select value into coach_email from private.settings where key = 'coach_email';

  if coach_email is not null
     and lower(new.email) = lower(coach_email)
     and not exists (select 1 from public.profiles where role = 'trainer') then
    insert into public.profiles (id, role, display_name)
    values (
      new.id, 'trainer',
      coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1))
    );
  else
    select id, data->>'name' into cid, cname
    from public.clients
    where lower(data->>'email') = lower(new.email)
    limit 1;

    if cid is not null then
      insert into public.profiles (id, role, display_name, client_id)
      values (new.id, 'client', coalesce(cname, split_part(new.email, '@', 1)), cid);
    end if;
  end if;
  return new;
end;
$$;
revoke execute on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Then set the coach's email (replace the address):
-- insert into private.settings (key, value) values ('coach_email', 'coach@example.com')
--   on conflict (key) do update set value = excluded.value;
