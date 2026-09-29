-- ===========================================================================
-- Accounts: profile row and competency seed on signup.
--
-- Run docs/schema.sql FIRST. This migration builds on its `profiles` and
-- `competency_scores` tables and the `competency_kind` enum.
-- Safe to run more than once.
-- ===========================================================================

-- When the user accepted the privacy policy and terms. Set by the trigger
-- below from the server clock, so the client cannot backdate it.
alter table public.profiles
  add column if not exists privacy_accepted_at timestamptz;

-- ---------------------------------------------------------------------------
-- New auth user -> profile row + the four competencies at 50.
-- The client never creates these rows. security definer lets the trigger
-- write past RLS; the empty search_path stops it resolving names through
-- anything the caller could influence, so every name is schema-qualified.
--
-- Consent is recorded, not enforced: a signup without `privacy_accepted`
-- gets a null timestamp. Rejecting it here would also block Google signups
-- (next ticket), which don't carry this metadata; those must collect
-- consent separately.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, privacy_accepted_at)
  values (
    new.id,
    nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 60), ''),
    case when new.raw_user_meta_data ->> 'privacy_accepted' = 'true' then now() end
  );

  -- Spec §3: seed everyone at 50, not 0. Four zeroes read as failure before
  -- the user has done anything.
  insert into public.competency_scores (user_id, competency, score)
  select new.id, c, 50
  from unnest(enum_range(null::public.competency_kind)) as c;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Profiles: a user may read and update their own row, nothing else.
-- schema.sql's "own profile" policy was `for all`, which let a client insert
-- or delete its own profile and rewrite privacy_accepted_at. Rows now come
-- only from the trigger, and only the user-editable columns are writable.
-- ---------------------------------------------------------------------------
drop policy if exists "own profile" on public.profiles;
drop policy if exists "own profile read" on public.profiles;
drop policy if exists "own profile update" on public.profiles;

create policy "own profile read" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy "own profile update" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, locale, track, onboarding) on public.profiles to authenticated;
