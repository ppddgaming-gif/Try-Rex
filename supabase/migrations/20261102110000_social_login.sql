-- ===========================================================================
-- Google and GitHub login. A new profile's name now also comes from what the
-- provider sends (Google: full_name, name; GitHub: full_name, name, user_name,
-- preferred_username); the sign-up form still sends display_name.
--
-- Consent stays as it was: only the sign-up form sends privacy_accepted, so a
-- social account starts with privacy_accepted_at null and agrees on
-- /persetujuan, where the server records it. Replacing the function keeps its
-- grants, so it stays revoked from PUBLIC (_lock_down_functions).
--
-- Runs after _accounts. Safe to run more than once.
-- ===========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := new.raw_user_meta_data;
begin
  insert into public.profiles (id, display_name, privacy_accepted_at)
  values (
    new.id,
    nullif(left(trim(coalesce(
      nullif(trim(meta ->> 'display_name'), ''),
      nullif(trim(meta ->> 'full_name'), ''),
      nullif(trim(meta ->> 'name'), ''),
      nullif(trim(meta ->> 'user_name'), ''),
      nullif(trim(meta ->> 'preferred_username'), '')
    )), 60), ''),
    case when meta ->> 'privacy_accepted' = 'true' then now() end
  );

  -- Spec §3: seed everyone at 50, not 0. Four zeroes read as failure before
  -- the user has done anything.
  insert into public.competency_scores (user_id, competency, score)
  select new.id, c, 50
  from unnest(enum_range(null::public.competency_kind)) as c;

  return new;
end $$;
