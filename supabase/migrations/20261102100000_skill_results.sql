-- ===========================================================================
-- Skill results from finished Asesmen packages, for the dashboard's four
-- skill meters (lib/progress/skills.ts, lib/assessment/skills.ts).
--
-- One row per (run, item, skill): the rubric's process score for that skill,
-- 0 to 1. Saved by the server when a signed-in player asks for a finished
-- package's report; the unique key credits a run once. The other sources
-- (Trading Game answers, Disiplin checks, AI Evaluation scores) are read from
-- their own tables, so nothing else is copied here.
--
-- Players read their own rows; only the service role writes. Run after
-- _assessment_runs. Safe to run more than once.
-- ===========================================================================

create table if not exists public.assessment_skill_results (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users on delete cascade,
  run_id     uuid not null,
  package_id text not null check (package_id ~ '^P-[0-9]{2}$'),
  item_id    text not null check (char_length(item_id) between 1 and 40),
  skill      text not null check (skill in ('trend_reading', 'entry_timing', 'risk_management', 'market_structure')),
  value      numeric(4, 3) not null check (value between 0 and 1),
  created_at timestamptz not null default now(),
  constraint assessment_skill_results_once unique (run_id, item_id, skill)
);

create index if not exists assessment_skill_results_user_time on public.assessment_skill_results (user_id, created_at desc);

alter table public.assessment_skill_results enable row level security;
drop policy if exists "own skill results" on public.assessment_skill_results;
create policy "own skill results" on public.assessment_skill_results
  for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.assessment_skill_results from anon, authenticated;
grant select on public.assessment_skill_results to authenticated;
