-- Try-Rex — Postgres / Supabase schema
-- Phase 1–2. Run in the Supabase SQL editor, or as the first migration.
--
-- THE ONE RULE THIS SCHEMA EXISTS TO ENFORCE:
--   The rubric and the forward window are the answer key. They must never be
--   readable by the browser. Everything below follows from that.
--   Grading happens in a Next.js Route Handler using the SERVICE ROLE key,
--   which bypasses RLS. The anon/authenticated client never touches
--   scenario_keys at all.

create extension if not exists "pgcrypto";

-- ===========================================================================
-- enums
-- ===========================================================================
create type market_kind      as enum ('forex','stocks','crypto','commodities');
create type action_kind      as enum ('BUY','SELL','WAIT');
create type verdict_kind     as enum ('correct','defensible','risky');
create type scenario_status  as enum ('draft','in_review','published','retired');
create type session_kind     as enum ('full','daily');
create type competency_kind  as enum ('trend_reading','entry_timing','risk_management','market_structure');

-- ===========================================================================
-- profiles
-- ===========================================================================
create table profiles (
  id           uuid primary key references auth.users on delete cascade,
  display_name text,
  locale       text not null default 'id' check (locale in ('id','en')),
  track        market_kind,
  onboarding   jsonb not null default '{}'::jsonb,  -- answers from /start
  created_at   timestamptz not null default now()
);

-- ===========================================================================
-- scenarios — public half
-- ===========================================================================
create table scenarios (
  id             text primary key,                 -- 'sc_0142'
  version        int  not null default 1,
  status         scenario_status not null default 'draft',
  market         market_kind not null,
  symbol         text not null,
  timeframe      text not null,                    -- 'H1', 'H4', 'D1'
  difficulty     int  not null check (difficulty between 1 and 5),
  locale         text not null default 'id',
  context_window jsonb not null,                   -- [[o,h,l,c,ts], ...] what the user sees
  levels         jsonb not null default '[]'::jsonb,
  prompt         jsonb not null,                   -- { text }
  terms          text[] not null default '{}',     -- glossary slugs to make tappable
  concepts       text[] not null default '{}',
  data_source    text not null default 'synthetic-dev',
  authored_at    date,
  reviewed_by    uuid references auth.users,
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now()
);

create index on scenarios (status, difficulty, market);
create index on scenarios using gin (concepts);

-- A published scenario must have been reviewed by a human. A wrong rubric
-- teaches something wrong, so this is a constraint, not a convention.
alter table scenarios add constraint published_needs_review
  check (status <> 'published' or (reviewed_by is not null and reviewed_at is not null));

-- ===========================================================================
-- scenario_keys — the answer key. NO CLIENT ACCESS, EVER.
-- ===========================================================================
create table scenario_keys (
  scenario_id    text primary key references scenarios on delete cascade,
  rubric         jsonb not null,   -- actions{}, reasons[], max_reasons
  forward_window jsonb not null,   -- the reveal
  explanation    jsonb not null    -- outcome_text, key_lesson
);

-- ===========================================================================
-- sessions & attempts
-- ===========================================================================
create table sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  kind          session_kind not null default 'full',
  scenario_ids  text[] not null,
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  process_score int,                       -- mean of attempts, filled on completion
  xp_awarded    int not null default 0
);
create index on sessions (user_id, started_at desc);

create table attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users on delete cascade,
  session_id       uuid references sessions on delete set null,
  scenario_id      text not null references scenarios,
  scenario_version int  not null,
  action           action_kind not null,
  reason_ids       text[] not null check (cardinality(reason_ids) between 1 and 3),
  verdict          verdict_kind not null,
  action_score     int not null check (action_score between 0 and 100),
  reason_score     int not null check (reason_score between 0 and 100),
  process_score    int not null check (process_score between 0 and 100),
  xp               int not null default 0,
  seconds          int,
  created_at       timestamptz not null default now()
);
create index on attempts (user_id, created_at desc);
create index on attempts (session_id);

-- One attempt per scenario per session — stops re-submitting after the reveal.
create unique index attempts_one_per_scenario_per_session
  on attempts (session_id, scenario_id) where session_id is not null;

create table journal_entries (
  attempt_id uuid primary key references attempts on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  note       text not null check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- competency state + history
-- ===========================================================================
create table competency_scores (
  user_id    uuid not null references auth.users on delete cascade,
  competency competency_kind not null,
  score      numeric(5,2) not null default 50 check (score between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, competency)
);

-- One row per user per competency per day. The dashboard's 30-day deltas and
-- the summary's before/after bars both read from here.
create table competency_history (
  user_id     uuid not null references auth.users on delete cascade,
  competency  competency_kind not null,
  recorded_on date not null default current_date,
  score       numeric(5,2) not null,
  primary key (user_id, competency, recorded_on)
);

create table streaks (
  user_id          uuid primary key references auth.users on delete cascade,
  current          int not null default 0,
  longest          int not null default 0,
  last_active_date date
);

-- ===========================================================================
-- glossary
-- ===========================================================================
create table glossary_terms (
  slug     text not null,
  locale   text not null default 'id',
  term     text not null,
  short    text not null,          -- one line, shown in the list
  long     text not null,          -- the definition
  why      text not null,          -- "why this matters" — the part that teaches
  concepts text[] not null default '{}',
  primary key (slug, locale)
);

create table glossary_seen (
  user_id       uuid not null references auth.users on delete cascade,
  term_slug     text not null,
  first_seen_at timestamptz not null default now(),
  primary key (user_id, term_slug)
);

-- ===========================================================================
-- LLM evaluation cache (phase 3)
-- Identical decision on an identical scenario => identical prose, zero cost.
-- ===========================================================================
create table evaluations_cache (
  key         text primary key,      -- sha256(scenario_id|version|action|sorted(reason_ids)|locale)
  scenario_id text not null references scenarios on delete cascade,
  locale      text not null,
  body        jsonb not null,        -- { bullets: [...], next_time: "..." }
  model       text not null,
  created_at  timestamptz not null default now()
);

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================
alter table profiles           enable row level security;
alter table scenarios          enable row level security;
alter table scenario_keys      enable row level security;
alter table sessions           enable row level security;
alter table attempts           enable row level security;
alter table journal_entries    enable row level security;
alter table competency_scores  enable row level security;
alter table competency_history enable row level security;
alter table streaks            enable row level security;
alter table glossary_terms     enable row level security;
alter table glossary_seen      enable row level security;
alter table evaluations_cache  enable row level security;

-- scenario_keys and evaluations_cache get NO policies at all.
-- RLS with zero policies denies everything to anon and authenticated.
-- The service role bypasses RLS, so only server code can read them.

create policy "read published scenarios"
  on scenarios for select to authenticated
  using (status = 'published');

create policy "read glossary"
  on glossary_terms for select to authenticated using (true);

-- Own-row access for everything user-scoped.
create policy "own profile"      on profiles           for all to authenticated using (id = auth.uid())      with check (id = auth.uid());
create policy "own sessions"     on sessions           for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own attempts"     on attempts           for select to authenticated using (user_id = auth.uid());
create policy "own journal"      on journal_entries    for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own competency"   on competency_scores  for select to authenticated using (user_id = auth.uid());
create policy "own history"      on competency_history for select to authenticated using (user_id = auth.uid());
create policy "own streak"       on streaks            for select to authenticated using (user_id = auth.uid());
create policy "own glossary seen" on glossary_seen     for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Note there is deliberately NO insert policy on attempts, competency_scores,
-- competency_history or streaks. Those are written only by the grading route
-- with the service role. A client that could insert its own attempt row could
-- award itself any score it liked.

-- ===========================================================================
-- helper: apply one graded attempt to a user's competency state
-- Called by the grading route (service role) inside a transaction.
-- EWMA with alpha 0.15 — recent performance moves the needle without erasing
-- history. Only competencies the scenario actually touches are updated.
-- ===========================================================================
create or replace function apply_competency(
  p_user uuid, p_competency competency_kind, p_observed numeric, p_alpha numeric default 0.15
) returns numeric language plpgsql security definer as $$
declare v_old numeric; v_new numeric;
begin
  select score into v_old from competency_scores
    where user_id = p_user and competency = p_competency;
  if v_old is null then v_old := 50; end if;

  v_new := round(greatest(0, least(100, v_old + p_alpha * (p_observed - v_old))), 2);

  insert into competency_scores (user_id, competency, score, updated_at)
    values (p_user, p_competency, v_new, now())
  on conflict (user_id, competency)
    do update set score = excluded.score, updated_at = now();

  insert into competency_history (user_id, competency, recorded_on, score)
    values (p_user, p_competency, current_date, v_new)
  on conflict (user_id, competency, recorded_on)
    do update set score = excluded.score;

  return v_new;
end $$;

-- ===========================================================================
-- helper: advance a streak. Idempotent within a day.
-- ===========================================================================
create or replace function touch_streak(p_user uuid)
returns streaks language plpgsql security definer as $$
declare r streaks;
begin
  insert into streaks (user_id, current, longest, last_active_date)
    values (p_user, 1, 1, current_date)
  on conflict (user_id) do update set
    current = case
      when streaks.last_active_date = current_date then streaks.current
      when streaks.last_active_date = current_date - 1 then streaks.current + 1
      else 1 end,
    longest = greatest(streaks.longest, case
      when streaks.last_active_date = current_date then streaks.current
      when streaks.last_active_date = current_date - 1 then streaks.current + 1
      else 1 end),
    last_active_date = current_date
  returning * into r;
  return r;
end $$;
