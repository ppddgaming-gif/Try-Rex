-- ===========================================================================
-- Akun Latihan, phase B: replay sessions, trades, SL/TP history, drawn lines.
-- Runs after _akun_latihan_a. Safe to run more than once.
--
-- Same rules as phase A: players read their own rows, only the server writes
-- (non-negotiable #2). Every write goes through one of the functions at the
-- bottom, which only service_role may call. Each takes the account's version
-- as the server read it and refuses if anything changed since, so a double
-- tap can't advance a candle or book a trade twice.
--
-- Every row that belongs to an account references demo_accounts (id,
-- user_id), a trade references its session (id, user_id), and a ledger row
-- or SL/TP change references its trade (id, user_id): no row can point at
-- another player's account, chart or trade.
-- ===========================================================================

-- Per player: the stage (lib/demo/config.ts STAGES). It survives a new account.
alter table public.demo_profile
  add column if not exists stage smallint not null default 1 check (stage between 1 and 3);

-- Per account: the version every write bumps, and the candle clock the
-- revenge-trade window counts on (it runs across charts).
alter table public.demo_accounts add column if not exists version bigint not null default 0;
alter table public.demo_accounts
  add column if not exists candles_played int not null default 0 check (candles_played >= 0);

-- The ledger's order. Rows booked in one transaction share created_at, so the
-- "last row" (whose balance_after equals the balance) is the highest seq.
alter table public.demo_ledger add column if not exists seq bigint generated always as identity;
create index if not exists demo_ledger_account_seq on public.demo_ledger (account_id, seq);

-- "adjustment": negative balance protection, when a gap loses more than the
-- account holds.
alter table public.demo_ledger drop constraint if exists demo_ledger_kind_check;
alter table public.demo_ledger add constraint demo_ledger_kind_check
  check (kind in ('deposit', 'trade', 'swap', 'commission', 'adjustment'));

-- ---------------------------------------------------------------------------
-- A chart being replayed: one segment of the historical H4 data
-- (lib/demo/segments.ts). The candles themselves stay in the server's code;
-- only the cursor is stored. One active session per account.
-- ---------------------------------------------------------------------------
create table if not exists public.demo_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  account_id uuid not null,
  segment_id text not null check (segment_id ~ '^[a-z0-9@-]{1,40}$'),
  pair       text not null check (pair ~ '^[A-Z]{6}$'),
  -- Index of the last candle shown, within the segment.
  cursor     int  not null check (cursor >= 0),
  last_index int  not null,
  status     text not null default 'active' check (status in ('active', 'ended')),
  created_at timestamptz not null default now(),
  ended_at   timestamptz,
  check (cursor <= last_index),
  check ((status = 'active') = (ended_at is null)),
  constraint demo_sessions_id_user_key unique (id, user_id),
  constraint demo_sessions_account_owner_fkey
    foreign key (account_id, user_id) references public.demo_accounts (id, user_id) on delete cascade
);
create unique index if not exists demo_sessions_one_active on public.demo_sessions (account_id) where status = 'active';
-- "Seen least often" when picking the next chart.
create index if not exists demo_sessions_user_segment on public.demo_sessions (user_id, segment_id);

-- ---------------------------------------------------------------------------
-- Trades. Everything about the plan is fixed at entry; the exit, the Disiplin
-- checks and the XP are fixed at close. All of it is calculated on the server
-- (lib/demo/actions.ts).
-- ---------------------------------------------------------------------------
create table if not exists public.demo_trades (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users on delete cascade,
  account_id       uuid not null,
  session_id       uuid not null,
  -- Trade #n within the account.
  number           int  not null check (number >= 1),
  pair             text not null check (pair ~ '^[A-Z]{6}$'),
  side             text not null check (side in ('buy', 'sell')),
  lot              numeric(6, 2) not null check (lot > 0),
  -- The player's stage when it opened; stage unlocks count trades by it.
  stage            smallint not null check (stage between 1 and 3),
  -- 1–3 ids from lib/reasons.ts.
  reasons          text[] not null check (
                     cardinality(reasons) between 1 and 3
                     and array_to_string(reasons, ',') ~ '^[a-z-]+(,[a-z-]+)*$'),
  -- Entry, at the close of candle entry_index. opened_clock is the account's
  -- candle clock at that moment.
  entry_price      numeric(16, 6) not null,
  entry_index      int  not null,
  opened_clock     int  not null,
  sl_initial       numeric(16, 6),
  tp_initial       numeric(16, 6),
  sl               numeric(16, 6),
  tp               numeric(16, 6),
  balance_at_entry numeric(12, 2) not null,
  margin           numeric(12, 2) not null,
  spread           numeric(12, 2) not null,
  commission       numeric(12, 2) not null,
  -- Lost if SL is hit, costs included; null without SL.
  risk_amount      numeric(12, 2),
  risk_pct         numeric(7, 1),
  reward_risk      numeric(8, 2),
  -- Average candle range of the last candles seen at entry (Rex's "SL too close").
  range_avg        numeric(16, 6) not null,
  revenge          boolean not null default false,
  -- Accrued while open; booked as its own ledger row at close.
  swap             numeric(12, 2) not null default 0,
  status           text not null default 'open' check (status in ('open', 'closed')),
  opened_at        timestamptz not null default now(),
  exit_price       numeric(16, 6),
  exit_index       int,
  closed_clock     int,
  exit_reason      text check (exit_reason in ('sl', 'tp', 'manual', 'stop_out', 'segment_end')),
  pips             numeric(9, 1),
  gross            numeric(12, 2),
  -- gross − spread − commission: what the order panel predicted.
  net              numeric(12, 2),
  -- Held at least one candle: only then does it earn XP and count toward stages.
  counted          boolean,
  checks           jsonb,
  disiplin         smallint check (disiplin between 0 and 100),
  xp               smallint not null default 0 check (xp >= 0),
  -- "Apakah kamu mengikuti rencanamu?" Self-reported, never scored.
  review           text check (review in ('ya', 'sebagian', 'tidak')),
  review_note      text check (char_length(review_note) <= 120),
  closed_at        timestamptz,
  check ((status = 'open') = (closed_at is null)),
  check (status = 'open' or (exit_price is not null and exit_reason is not null and net is not null
                             and disiplin is not null and counted is not null)),
  constraint demo_trades_account_number_key unique (account_id, number),
  constraint demo_trades_id_user_key unique (id, user_id),
  constraint demo_trades_account_owner_fkey
    foreign key (account_id, user_id) references public.demo_accounts (id, user_id) on delete cascade,
  constraint demo_trades_session_owner_fkey
    foreign key (session_id, user_id) references public.demo_sessions (id, user_id) on delete cascade
);
create index if not exists demo_trades_account_status on public.demo_trades (account_id, status);
create index if not exists demo_trades_user_closed on public.demo_trades (user_id, closed_at) where status = 'closed';
create index if not exists demo_trades_session on public.demo_trades (session_id);

-- Ledger rows booked for a trade point at it, owner included.
do $$
begin
  if not exists (select 1 from pg_constraint
                 where conrelid = 'public.demo_ledger'::regclass and conname = 'demo_ledger_trade_owner_fkey') then
    alter table public.demo_ledger add constraint demo_ledger_trade_owner_fkey
      foreign key (trade_id, user_id) references public.demo_trades (id, user_id) on delete cascade;
  end if;
end $$;

-- Every SL or TP move, kept for the journal and the "SL never widened" check.
create table if not exists public.demo_trade_changes (
  id         uuid primary key default gen_random_uuid(),
  trade_id   uuid not null,
  user_id    uuid not null references auth.users on delete cascade,
  field      text not null check (field in ('sl', 'tp')),
  old_price  numeric(16, 6),
  new_price  numeric(16, 6),
  -- Segment candle index when the change was made.
  at_index   int  not null,
  created_at timestamptz not null default now(),
  seq        bigint generated always as identity,
  constraint demo_trade_changes_trade_owner_fkey
    foreign key (trade_id, user_id) references public.demo_trades (id, user_id) on delete cascade
);
create index if not exists demo_trade_changes_trade on public.demo_trade_changes (trade_id, seq);

-- Horizontal lines the player drew, per segment. Never scored.
create table if not exists public.demo_lines (
  user_id    uuid not null references auth.users on delete cascade,
  segment_id text not null check (segment_id ~ '^[a-z0-9@-]{1,40}$'),
  prices     numeric(16, 6)[] not null default '{}' check (cardinality(prices) <= 10),
  updated_at timestamptz not null default now(),
  primary key (user_id, segment_id)
);

-- ---------------------------------------------------------------------------
-- Row level security: read own rows, write nothing.
-- ---------------------------------------------------------------------------
alter table public.demo_sessions      enable row level security;
alter table public.demo_trades        enable row level security;
alter table public.demo_trade_changes enable row level security;
alter table public.demo_lines         enable row level security;

drop policy if exists "own demo sessions" on public.demo_sessions;
drop policy if exists "own demo trades" on public.demo_trades;
drop policy if exists "own demo trade changes" on public.demo_trade_changes;
drop policy if exists "own demo lines" on public.demo_lines;

create policy "own demo sessions"      on public.demo_sessions      for select to authenticated using (user_id = (select auth.uid()));
create policy "own demo trades"        on public.demo_trades        for select to authenticated using (user_id = (select auth.uid()));
create policy "own demo trade changes" on public.demo_trade_changes for select to authenticated using (user_id = (select auth.uid()));
create policy "own demo lines"         on public.demo_lines         for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.demo_sessions, public.demo_trades, public.demo_trade_changes, public.demo_lines from anon, authenticated;
grant select on public.demo_sessions, public.demo_trades, public.demo_trade_changes, public.demo_lines to authenticated;

-- ---------------------------------------------------------------------------
-- Writes. Each function starts with demo_claim, which locks the player's
-- active account and bumps its version, or refuses with 'demo_stale' when the
-- version isn't the one the server read. Everything a function does happens
-- in one transaction.
-- ---------------------------------------------------------------------------
create or replace function public.demo_claim(p_user uuid, p_account uuid, p_version bigint)
returns public.demo_accounts
language plpgsql
set search_path = ''
as $$
declare
  v_account public.demo_accounts;
begin
  update public.demo_accounts
     set version = version + 1
   where id = p_account and user_id = p_user and status = 'active' and version = p_version
  returning * into v_account;
  if not found then
    raise exception 'demo_stale';
  end if;
  return v_account;
end $$;

-- A new chart. Ends the account's current session; refused while a trade is open.
create or replace function public.demo_start_session(
  p_user uuid, p_account uuid, p_version bigint,
  p_segment text, p_pair text, p_cursor int, p_last int)
returns public.demo_sessions
language plpgsql
set search_path = ''
as $$
declare
  v_session public.demo_sessions;
begin
  perform public.demo_claim(p_user, p_account, p_version);
  if exists (select 1 from public.demo_trades
             where account_id = p_account and user_id = p_user and status = 'open') then
    raise exception 'demo_open_trades';
  end if;
  update public.demo_sessions set status = 'ended', ended_at = now()
   where account_id = p_account and user_id = p_user and status = 'active';
  insert into public.demo_sessions (user_id, account_id, segment_id, pair, cursor, last_index)
    values (p_user, p_account, p_segment, p_pair, p_cursor, p_last)
    returning * into v_session;
  return v_session;
end $$;

-- A new trade at the session's current candle. The session, the pair, the
-- trade number and the clocks come from the database, not the payload.
create or replace function public.demo_open_trade(p_user uuid, p_account uuid, p_version bigint, p_trade jsonb)
returns public.demo_trades
language plpgsql
set search_path = ''
as $$
declare
  v_account public.demo_accounts;
  v_session public.demo_sessions;
  v_trade public.demo_trades;
begin
  v_account := public.demo_claim(p_user, p_account, p_version);
  select * into v_session from public.demo_sessions
   where id = (p_trade ->> 'session_id')::uuid and user_id = p_user and account_id = p_account
     and status = 'active' and cursor < last_index;
  if not found then
    raise exception 'demo_no_session';
  end if;

  insert into public.demo_trades (
    user_id, account_id, session_id, number, pair, side, lot, stage, reasons,
    entry_price, entry_index, opened_clock, sl_initial, tp_initial, sl, tp,
    balance_at_entry, margin, spread, commission, risk_amount, risk_pct, reward_risk, range_avg, revenge)
  values (
    p_user, p_account, v_session.id,
    (select coalesce(max(number), 0) + 1 from public.demo_trades where account_id = p_account),
    v_session.pair,
    p_trade ->> 'side',
    (p_trade ->> 'lot')::numeric,
    (p_trade ->> 'stage')::smallint,
    array(select jsonb_array_elements_text(p_trade -> 'reasons')),
    (p_trade ->> 'entry_price')::numeric,
    v_session.cursor,
    v_account.candles_played,
    (p_trade ->> 'sl')::numeric,
    (p_trade ->> 'tp')::numeric,
    (p_trade ->> 'sl')::numeric,
    (p_trade ->> 'tp')::numeric,
    (p_trade ->> 'balance_at_entry')::numeric,
    (p_trade ->> 'margin')::numeric,
    (p_trade ->> 'spread')::numeric,
    (p_trade ->> 'commission')::numeric,
    (p_trade ->> 'risk_amount')::numeric,
    (p_trade ->> 'risk_pct')::numeric,
    (p_trade ->> 'reward_risk')::numeric,
    (p_trade ->> 'range_avg')::numeric,
    coalesce((p_trade ->> 'revenge')::boolean, false))
  returning * into v_trade;
  return v_trade;
end $$;

-- A candle played (p_advance) or a manual close: trade exits and swap, the
-- ledger rows, the new balance, the end of the segment and the stage. The
-- balance must equal the last ledger row booked.
create or replace function public.demo_settle(
  p_user uuid, p_account uuid, p_version bigint, p_session uuid, p_advance boolean,
  p_updates jsonb, p_ledger jsonb, p_balance numeric, p_end_session boolean, p_stage smallint)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_account public.demo_accounts;
  u jsonb;
  c jsonb;
  l record;
begin
  v_account := public.demo_claim(p_user, p_account, p_version);

  if p_advance then
    update public.demo_sessions set cursor = cursor + 1
     where id = p_session and user_id = p_user and account_id = p_account
       and status = 'active' and cursor < last_index;
    if not found then
      raise exception 'demo_no_session';
    end if;
    update public.demo_accounts set candles_played = candles_played + 1 where id = p_account;
  end if;

  for u in select value from jsonb_array_elements(coalesce(p_updates, '[]'::jsonb)) loop
    c := u -> 'close';
    if c is null or jsonb_typeof(c) = 'null' then
      update public.demo_trades set swap = (u ->> 'swap')::numeric
       where id = (u ->> 'id')::uuid and user_id = p_user and account_id = p_account and status = 'open';
    else
      update public.demo_trades set
        swap         = (u ->> 'swap')::numeric,
        status       = 'closed',
        closed_at    = now(),
        exit_price   = (c ->> 'exit_price')::numeric,
        exit_index   = (c ->> 'exit_index')::int,
        closed_clock = (c ->> 'closed_clock')::int,
        exit_reason  = c ->> 'exit_reason',
        pips         = (c ->> 'pips')::numeric,
        gross        = (c ->> 'gross')::numeric,
        net          = (c ->> 'net')::numeric,
        counted      = (c ->> 'counted')::boolean,
        checks       = c -> 'checks',
        disiplin     = (c ->> 'disiplin')::smallint,
        xp           = (c ->> 'xp')::smallint
       where id = (u ->> 'id')::uuid and user_id = p_user and account_id = p_account and status = 'open';
    end if;
    if not found then
      raise exception 'demo_trade_missing';
    end if;
  end loop;

  -- In order: seq follows insertion.
  for l in select value, ordinality from jsonb_array_elements(coalesce(p_ledger, '[]'::jsonb)) with ordinality
           order by ordinality loop
    insert into public.demo_ledger (account_id, user_id, kind, label, amount, balance_after, trade_id)
      values (p_account, p_user, l.value ->> 'kind', l.value ->> 'label', (l.value ->> 'amount')::numeric,
              (l.value ->> 'balance_after')::numeric, (l.value ->> 'trade_id')::uuid);
  end loop;

  if jsonb_array_length(coalesce(p_ledger, '[]'::jsonb)) = 0 then
    if p_balance <> v_account.balance then
      raise exception 'demo_ledger_mismatch';
    end if;
  elsif (p_ledger -> -1 ->> 'balance_after')::numeric <> p_balance then
    raise exception 'demo_ledger_mismatch';
  end if;
  update public.demo_accounts set balance = p_balance where id = p_account;

  if p_end_session then
    if exists (select 1 from public.demo_trades
               where account_id = p_account and user_id = p_user and status = 'open') then
      raise exception 'demo_open_trades';
    end if;
    update public.demo_sessions set status = 'ended', ended_at = now()
     where id = p_session and user_id = p_user and status = 'active';
  end if;

  if p_stage is not null then
    update public.demo_profile set stage = greatest(stage, p_stage) where user_id = p_user;
  end if;
end $$;

-- Move or remove SL or TP on an open trade, keeping the old value.
create or replace function public.demo_modify_trade(
  p_user uuid, p_account uuid, p_version bigint,
  p_trade uuid, p_field text, p_price numeric, p_at int)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_old numeric;
begin
  perform public.demo_claim(p_user, p_account, p_version);
  if p_field not in ('sl', 'tp') then
    raise exception 'demo_bad_field';
  end if;
  select case when p_field = 'sl' then sl else tp end into v_old
    from public.demo_trades
   where id = p_trade and user_id = p_user and account_id = p_account and status = 'open';
  if not found then
    raise exception 'demo_trade_missing';
  end if;
  insert into public.demo_trade_changes (trade_id, user_id, field, old_price, new_price, at_index)
    values (p_trade, p_user, p_field, v_old, p_price, p_at);
  if p_field = 'sl' then
    update public.demo_trades set sl = p_price where id = p_trade;
  else
    update public.demo_trades set tp = p_price where id = p_trade;
  end if;
end $$;

-- Server-only. Postgres grants EXECUTE to PUBLIC by default and Supabase
-- exposes public functions at /rest/v1/rpc/<name>.
revoke execute on function public.demo_claim(uuid, uuid, bigint) from public, anon, authenticated;
revoke execute on function public.demo_start_session(uuid, uuid, bigint, text, text, int, int) from public, anon, authenticated;
revoke execute on function public.demo_open_trade(uuid, uuid, bigint, jsonb) from public, anon, authenticated;
revoke execute on function public.demo_settle(uuid, uuid, bigint, uuid, boolean, jsonb, jsonb, numeric, boolean, smallint) from public, anon, authenticated;
revoke execute on function public.demo_modify_trade(uuid, uuid, bigint, uuid, text, numeric, int) from public, anon, authenticated;
grant execute on function public.demo_claim(uuid, uuid, bigint) to service_role;
grant execute on function public.demo_start_session(uuid, uuid, bigint, text, text, int, int) to service_role;
grant execute on function public.demo_open_trade(uuid, uuid, bigint, jsonb) to service_role;
grant execute on function public.demo_settle(uuid, uuid, bigint, uuid, boolean, jsonb, jsonb, numeric, boolean, smallint) to service_role;
grant execute on function public.demo_modify_trade(uuid, uuid, bigint, uuid, text, numeric, int) to service_role;
