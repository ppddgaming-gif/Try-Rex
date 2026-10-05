-- ===========================================================================
-- Onboarding tour: a "profile complete" flag and the guided tours a player
-- has seen. Runs after _profile_customization. Safe to run more than once.
-- ===========================================================================

alter table public.profiles
  add column if not exists profile_completed_at timestamptz,
  add column if not exists tours_seen text[] not null default '{}';

-- The flag can't claim a profile is complete when it isn't: a username and
-- the /start answers (a skipped quiz is stored as a full record too, never
-- '{}'). This also stops a username being emptied once the profile is done.
alter table public.profiles drop constraint if exists profiles_completed_is_complete;
alter table public.profiles add constraint profiles_completed_is_complete
  check (profile_completed_at is null or (username is not null and onboarding <> '{}'::jsonb));

-- At most 32 tour ids, each ^[a-z0-9-]{1,40}$. Ids can't contain a comma, so
-- the joined list is checked with one pattern; NULL entries and nested
-- arrays are refused separately because array_to_string skips NULLs.
alter table public.profiles drop constraint if exists profiles_tours_seen_valid;
alter table public.profiles add constraint profiles_tours_seen_valid
  check (
    cardinality(tours_seen) <= 32
    and coalesce(array_ndims(tours_seen), 1) = 1
    and array_position(tours_seen, null) is null
    and (cardinality(tours_seen) = 0
         or array_to_string(tours_seen, ',') ~ '^[a-z0-9-]{1,40}(,[a-z0-9-]{1,40})*$')
  );

-- Accounts that already have both count as done. Players without a username
-- or quiz answers are sent to /lengkapi-profil on their next visit.
update public.profiles set profile_completed_at = now()
 where profile_completed_at is null
   and username is not null
   and onboarding <> '{}'::jsonb;

-- Column grants on top of the existing "own profile update" policy
-- (id = auth.uid()), so a player can write these on their own row only.
grant update (profile_completed_at, tours_seen) on public.profiles to authenticated;
