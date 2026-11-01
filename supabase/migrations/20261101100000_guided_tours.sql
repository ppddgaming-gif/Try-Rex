-- ===========================================================================
-- Guided tours: which tours a player has seen (components/tour/, lib/tours.ts).
-- Guests keep the list on the device; accounts keep it here, merged with the
-- device's list on load. Runs after _profile_customization. Safe to run more
-- than once. Until it runs, getCurrentUser() reports toursSeen: null and the
-- device's list is the only one.
-- ===========================================================================

alter table public.profiles
  add column if not exists tours_seen text[] not null default '{}';

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

-- A column grant on top of the existing "own profile update" policy
-- (id = auth.uid()), so a player can write this on their own row only.
grant update (tours_seen) on public.profiles to authenticated;
