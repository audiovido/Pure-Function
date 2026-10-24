-- Pure Function: auth wiring (run AFTER schema.sql, once).
-- Rules when someone signs up with email + password:
--   1. The very first signup becomes the TRAINER (so the coach must sign up first).
--   2. Later signups become a CLIENT only if the trainer already added a client
--      with the same email. Anyone else gets no profile and cannot see any data.
-- Keep "Confirm email" ENABLED in Supabase > Authentication > Providers > Email,
-- so nobody can claim a client's email without owning it.

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cid text;
  cname text;
begin
  if not exists (select 1 from public.profiles where role = 'trainer') then
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
