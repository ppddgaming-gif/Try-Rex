-- ===========================================================================
-- The player's language (Indonesian or English), so the choice follows the
-- account to other devices. lib/i18n/actions.ts writes it through the
-- player's own session (RLS "own profile update"); login reads it back into
-- the NEXT_LOCALE cookie. docs/schema.sql always had this column, but the
-- live project was created without it.
-- Safe to run more than once.
-- ===========================================================================

alter table public.profiles
  add column if not exists locale text not null default 'id';

alter table public.profiles drop constraint if exists profiles_locale_check;
alter table public.profiles add constraint profiles_locale_check
  check (locale in ('id', 'en'));

-- Same column list as _profile_customization, so re-running either leaves
-- the same grant.
grant update (display_name, locale, track, onboarding, username, avatar_path)
  on public.profiles to authenticated;
