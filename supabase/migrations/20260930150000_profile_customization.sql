-- ===========================================================================
-- Profile customisation: username and avatar. Onboarding needs nothing new:
-- the /start answers go in the existing profiles.onboarding column.
-- Runs after _accounts, _progress_sync and _lock_down_functions.
-- Safe to run more than once.
-- ===========================================================================

alter table public.profiles
  add column if not exists username text,
  -- A storage path inside the user's own folder of the `avatars` bucket
  -- ("<uid>/avatar-<ts>.webp"), never a free-form URL: a URL column would let
  -- a profile point at any image on the internet, tracking pixels included.
  add column if not exists avatar_path text;

-- Lowercase letters, digits and underscores, 3 to 20 characters. Being
-- lowercase-only makes the plain unique index case-insensitive.
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username is null or username ~ '^[a-z0-9_]{3,20}$');
create unique index if not exists profiles_username_key on public.profiles (username);

alter table public.profiles drop constraint if exists profiles_display_name_length;
alter table public.profiles add constraint profiles_display_name_length
  check (display_name is null or char_length(display_name) between 1 and 60);

alter table public.profiles drop constraint if exists profiles_avatar_path_own_folder;
alter table public.profiles add constraint profiles_avatar_path_own_folder
  check (avatar_path is null or (avatar_path like id::text || '/%' and char_length(avatar_path) <= 200));

-- The onboarding answers are a handful of short keys; cap the blob so the
-- column can't be used as free storage.
alter table public.profiles drop constraint if exists profiles_onboarding_size;
alter table public.profiles add constraint profiles_onboarding_size
  check (jsonb_typeof(onboarding) = 'object' and pg_column_size(onboarding) <= 2048);

grant update (display_name, locale, track, onboarding, username, avatar_path)
  on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Username availability for the live check on the account page. RLS only lets
-- a player read their own row, so the check needs definer rights. It answers
-- yes/no about one name and exposes nothing else.
-- ---------------------------------------------------------------------------
create or replace function public.username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles
    where username = lower(candidate) and id <> (select auth.uid())
  )
$$;

-- Postgres grants EXECUTE to PUBLIC by default, and Supabase exposes every
-- public function over REST. Signed-in players only.
revoke execute on function public.username_available(text) from public, anon;
grant execute on function public.username_available(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Avatars: public read (they are shown in the app), writes only into the
-- player's own folder. The client resizes to 256px WebP before uploading;
-- the bucket limits enforce the same on the server side.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatar read own" on storage.objects;
drop policy if exists "avatar insert own" on storage.objects;
drop policy if exists "avatar update own" on storage.objects;
drop policy if exists "avatar delete own" on storage.objects;

create policy "avatar read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatar insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatar update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatar delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
