-- ===========================================================================
-- Progress sync: practice attempts saved to the account, plus the public
-- counts shown on the landing page.
--
-- Runs after 20260929120000_accounts.sql. Safe to run more than once.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Backfill. Accounts created before on_auth_user_created existed have no
-- profile and no competency rows. Give them what the trigger would have.
-- Consent is dated to signup, which is when the form recorded it.
-- ---------------------------------------------------------------------------
insert into public.profiles (id, display_name, privacy_accepted_at)
select
  u.id,
  nullif(left(trim(u.raw_user_meta_data ->> 'display_name'), 60), ''),
  case when u.raw_user_meta_data ->> 'privacy_accepted' = 'true' then u.created_at end
from auth.users u
on conflict (id) do nothing;

insert into public.competency_scores (user_id, competency, score)
select u.id, c, 50
from auth.users u
cross join unnest(enum_range(null::public.competency_kind)) as c
on conflict (user_id, competency) do nothing;

-- ---------------------------------------------------------------------------
-- practice_attempts: one row per answered Trading Game question.
--
-- This is the account copy of lib/progress's Attempt. XP, level and streak
-- are derived from these rows on the client, so there is nothing else to
-- keep in step.
--
-- It is deliberately separate from `attempts`, which belongs to the graded
-- scenario flow (rubric, reasons, service-role writes). The Trading Game
-- grades in the browser, so these rows are self-reported: a player can only
-- ever inflate their own numbers. The checks below keep the values in the
-- shape the game produces.
-- ---------------------------------------------------------------------------
create table if not exists public.practice_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  scenario_id text not null check (char_length(scenario_id) between 1 and 40),
  pair        text not null check (char_length(pair) between 1 and 12),
  timeframe   text not null check (char_length(timeframe) between 1 and 8),
  difficulty  int  not null check (difficulty between 1 and 5),
  decision    text not null check (decision in ('buy', 'sell', 'wait')),
  correct     boolean not null,
  xp_earned   int  not null check (xp_earned between 0 and 150 and (correct or xp_earned = 0)),
  created_at  timestamptz not null default now(),
  -- Makes the guest-progress import idempotent: re-sending an attempt is a no-op.
  unique (user_id, scenario_id, created_at)
);

create index if not exists practice_attempts_user_time on public.practice_attempts (user_id, created_at);

-- Imported guest attempts keep their own timestamp, but never one from the
-- future, which would break streaks.
create or replace function public.clamp_practice_attempt_time()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.created_at > now() then
    new.created_at := now();
  end if;
  return new;
end $$;

drop trigger if exists clamp_time on public.practice_attempts;
create trigger clamp_time
  before insert on public.practice_attempts
  for each row execute function public.clamp_practice_attempt_time();

alter table public.practice_attempts enable row level security;

drop policy if exists "own practice read" on public.practice_attempts;
drop policy if exists "own practice insert" on public.practice_attempts;
drop policy if exists "own practice delete" on public.practice_attempts;

create policy "own practice read" on public.practice_attempts
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "own practice insert" on public.practice_attempts
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- "Hapus semua progres" on the dashboard.
create policy "own practice delete" on public.practice_attempts
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- No update: an answer, once given, stays as it was.
revoke all on public.practice_attempts from anon, authenticated;
grant select, insert, delete on public.practice_attempts to authenticated;

-- ---------------------------------------------------------------------------
-- public_stats(): the landing page's counts. Anyone may call it, and it
-- returns two numbers and nothing else, so no row or email ever leaves.
-- A player is an account that confirmed its email.
-- ---------------------------------------------------------------------------
create or replace function public.public_stats()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'players', (
      select count(*) from auth.users
      where email_confirmed_at is not null
        and deleted_at is null
        and not is_anonymous
    ),
    'answers', (select count(*) from public.practice_attempts)
  )
$$;

revoke all on function public.public_stats() from public;
grant execute on function public.public_stats() to anon, authenticated;
