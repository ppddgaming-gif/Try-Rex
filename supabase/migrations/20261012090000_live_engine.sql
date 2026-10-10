-- Akun Latihan: the live chart engine.
--
-- The chart runs on real time over historical data: data time = market time
-- − offset (whole weeks). Each account's clock is kept here, and SL/TP are
-- checked by replaying the M15 candles since the last check whenever the
-- account is read (no cron). Run after _trading_pairs.
--
-- Security: the clock is in its own table with RLS on and NO policies, and
-- nothing is granted to anon/authenticated. demo_accounts and demo_trades are
-- readable by their owner through the API; an offset there (or a data-time
-- stamp on a trade) would let a player work out the data's period. Live
-- trades store real times only. Only the service role writes prices and
-- results, through the functions below.

-- ---------------------------------------------------------------------------
-- The clock: one per account.
-- ---------------------------------------------------------------------------
create table if not exists public.demo_live_clock (
  account_id      uuid primary key,
  user_id         uuid not null references auth.users on delete cascade,
  -- data time = (real UTC + market offset) − offset_weeks × 7 days
  offset_weeks    int  not null check (offset_weeks > 0),
  -- Real time the open position was last replayed and booked up to.
  last_checked_at timestamptz not null,
  created_at      timestamptz not null default now(),
  constraint demo_live_clock_account_owner_fkey
    foreign key (account_id, user_id) references public.demo_accounts (id, user_id) on delete cascade
);
create index if not exists demo_live_clock_user on public.demo_live_clock (user_id, created_at desc);

alter table public.demo_live_clock enable row level security;
revoke all on public.demo_live_clock from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Live trades: no replay session; entry_index / exit_index hold real unix
-- seconds, opened_clock / closed_clock real M15 candles. A new exit reason
-- for the automatic close before the market closes. One open position per
-- account, enforced here and not only in code.
-- ---------------------------------------------------------------------------
alter table public.demo_trades alter column session_id drop not null;

alter table public.demo_trades drop constraint if exists demo_trades_exit_reason_check;
alter table public.demo_trades add constraint demo_trades_exit_reason_check
  check (exit_reason in ('sl', 'tp', 'manual', 'stop_out', 'segment_end', 'market_close'));

-- Fails if an account already has two open trades from the replay engine;
-- run the check query in the PR description first.
create unique index if not exists demo_trades_one_open on public.demo_trades (account_id) where status = 'open';

-- entry_index now holds unix seconds for live trades (about 1.8e9), still
-- inside int; exit_index the same.

-- ---------------------------------------------------------------------------
-- Writes (service role only).
-- ---------------------------------------------------------------------------

-- A live market order. Price, costs and risk are the server's (lib/live/
-- execute.ts); the trade number comes from the database. The clock's last
-- check moves to the fill, so the replay starts there.
create or replace function public.demo_live_open(
  p_user uuid, p_account uuid, p_version bigint, p_trade jsonb, p_checked_at timestamptz)
returns public.demo_trades
language plpgsql
set search_path = ''
as $$
declare
  v_trade public.demo_trades;
begin
  perform public.demo_claim(p_user, p_account, p_version);
  if exists (select 1 from public.demo_trades
             where account_id = p_account and user_id = p_user and status = 'open') then
    raise exception 'demo_open_trades';
  end if;

  insert into public.demo_trades (
    user_id, account_id, session_id, number, pair, side, lot, stage, reasons,
    entry_price, entry_index, opened_clock, sl_initial, tp_initial, sl, tp,
    balance_at_entry, margin, spread, commission, risk_amount, risk_pct, reward_risk, range_avg, revenge)
  values (
    p_user, p_account, null,
    (select coalesce(max(number), 0) + 1 from public.demo_trades where account_id = p_account),
    p_trade ->> 'pair',
    p_trade ->> 'side',
    (p_trade ->> 'lot')::numeric,
    (p_trade ->> 'stage')::smallint,
    array(select jsonb_array_elements_text(p_trade -> 'reasons')),
    (p_trade ->> 'entry_price')::numeric,
    (p_trade ->> 'entry_index')::int,
    (p_trade ->> 'opened_clock')::int,
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

  update public.demo_live_clock set last_checked_at = p_checked_at
   where account_id = p_account and user_id = p_user;
  if not found then
    raise exception 'demo_no_clock';
  end if;
  return v_trade;
end $$;

-- A replay or a manual close on the live chart: exits, swap, ledger, balance
-- and stage through demo_settle (which claims the account's version and
-- checks the ledger arithmetic), then the clock's last check, in the same
-- transaction.
create or replace function public.demo_live_settle(
  p_user uuid, p_account uuid, p_version bigint, p_checked_at timestamptz,
  p_updates jsonb, p_ledger jsonb, p_balance numeric, p_stage smallint)
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform public.demo_settle(p_user, p_account, p_version, null, false, p_updates, p_ledger, p_balance, false, p_stage);
  update public.demo_live_clock set last_checked_at = p_checked_at
   where account_id = p_account and user_id = p_user;
  if not found then
    raise exception 'demo_no_clock';
  end if;
end $$;

revoke execute on function public.demo_live_open(uuid, uuid, bigint, jsonb, timestamptz) from public, anon, authenticated;
revoke execute on function public.demo_live_settle(uuid, uuid, bigint, timestamptz, jsonb, jsonb, numeric, smallint) from public, anon, authenticated;
grant execute on function public.demo_live_open(uuid, uuid, bigint, jsonb, timestamptz) to service_role;
grant execute on function public.demo_live_settle(uuid, uuid, bigint, timestamptz, jsonb, jsonb, numeric, smallint) to service_role;
