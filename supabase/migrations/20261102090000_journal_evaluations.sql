-- ===========================================================================
-- AI Evaluation of Akun Latihan journal entries (lib/demo/evaluation.ts).
--
-- demo_journal_evaluations: one row per evaluated entry (a closed trade).
-- The trade itself is never copied here; it is read from demo_trades. The
-- UNIQUE on journal_id is what guarantees one evaluation per entry, whatever
-- the browser does. Same rules as every demo table: the player reads their
-- own rows, only the server (service role) writes.
--
-- demo_journal_eval_log: one row per call to the model (status, tokens,
-- timing, which entries), never the journal text. Its "ok" rows are the daily
-- limit's counter. Service role only: RLS on, no policies.
--
-- Run after _akun_latihan_b. Safe to run more than once.
-- ===========================================================================

create table if not exists public.demo_journal_evaluations (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users on delete cascade,
  journal_id       uuid not null,
  batch_id         uuid not null,
  month            text not null check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  result_id        jsonb not null check (pg_column_size(result_id) < 32768),
  result_en        jsonb not null check (pg_column_size(result_en) < 32768),
  score_risk       smallint not null check (score_risk between 0 and 100),
  score_sl         smallint not null check (score_sl between 0 and 100),
  score_rr         smallint not null check (score_rr between 0 and 100),
  score_entry      smallint not null check (score_entry between 0 and 100),
  score_management smallint not null check (score_management between 0 and 100),
  model            text not null,
  prompt_version   text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint demo_journal_evaluations_journal_key unique (journal_id),
  -- Through (trade, user), so an evaluation can never point at another player's trade.
  constraint demo_journal_evaluations_trade_fk foreign key (journal_id, user_id)
    references public.demo_trades (id, user_id) on delete cascade
);

create index if not exists demo_journal_evaluations_user_month on public.demo_journal_evaluations (user_id, month);
create index if not exists demo_journal_evaluations_version on public.demo_journal_evaluations (prompt_version);

alter table public.demo_journal_evaluations enable row level security;
drop policy if exists "own journal evaluations" on public.demo_journal_evaluations;
create policy "own journal evaluations" on public.demo_journal_evaluations
  for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.demo_journal_evaluations from anon, authenticated;
grant select on public.demo_journal_evaluations to authenticated;

create table if not exists public.demo_journal_eval_log (
  id                bigint generated always as identity primary key,
  user_id           uuid references auth.users on delete set null,
  journal_ids       uuid[] not null,
  status            text not null check (status in ('ok', 'ai_failed', 'invalid', 'conflict')),
  model             text,
  prompt_version    text not null,
  prompt_tokens     int,
  completion_tokens int,
  duration_ms       int not null check (duration_ms >= 0),
  admin             boolean not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists demo_journal_eval_log_day on public.demo_journal_eval_log (user_id, created_at) where status = 'ok' and not admin;

alter table public.demo_journal_eval_log enable row level security;
revoke all on public.demo_journal_eval_log from anon, authenticated;
