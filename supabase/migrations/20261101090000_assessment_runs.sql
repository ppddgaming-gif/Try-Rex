-- Asesmen: each run's state, kept on the server (lib/assessment/runs.ts).
--
-- The browser holds only a signed token naming its run. Before this table the
-- whole state travelled in the token, so a player could send back a token
-- from before a decision after watching the future candles and decide again.
-- Now every action reads the run from here and saves it with a version check
-- (a double tap or a second tab can't act twice), so an old token is simply
-- the same run as it is now.
--
-- Runs are open to guests, like Belajar 101, so there is no user_id. RLS on,
-- NO policies, nothing granted to anon/authenticated: only the service role
-- reads or writes. Rows past the token's 24 h are deleted when a new run
-- starts. Safe to run more than once.

create table if not exists public.assessment_runs (
  id         uuid primary key default gen_random_uuid(),
  package_id text not null check (package_id ~ '^P-[0-9]{2}$'),
  state      jsonb not null check (pg_column_size(state) < 65536),
  version    int  not null default 0 check (version >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists assessment_runs_created on public.assessment_runs (created_at);

alter table public.assessment_runs enable row level security;
revoke all on public.assessment_runs from anon, authenticated;
