-- ===========================================================================
-- Trading screen: nine pairs, four timeframes, drawing tools.
--   1. demo_accounts.last_pair / last_timeframe: the chart reopens where the
--      player left it.
--   2. demo_drawings: the player's drawings per account and pair.
--   3. Storage bucket `live-data`: the candle chunks built by
--      scripts/build-live-data.mjs.
-- Runs after the _akun_latihan_* migrations. Safe to run more than once.
-- ===========================================================================

-- 1. Last pair and timeframe. Not secret: the player can read them.
alter table public.demo_accounts
  add column if not exists last_pair text,
  add column if not exists last_timeframe text;

alter table public.demo_accounts drop constraint if exists demo_accounts_last_pair_check;
alter table public.demo_accounts add constraint demo_accounts_last_pair_check
  check (last_pair is null or last_pair in ('GBPNZD', 'EURAUD', 'GBPCAD', 'USDCAD', 'EURJPY', 'AUDUSD', 'USDJPY', 'GBPUSD', 'EURUSD'));

alter table public.demo_accounts drop constraint if exists demo_accounts_last_timeframe_check;
alter table public.demo_accounts add constraint demo_accounts_last_timeframe_check
  check (last_timeframe is null or last_timeframe in ('M15', 'M30', 'H1', 'H4'));

-- 2. Drawings, one row per account and pair: a JSON list of
-- { id, kind, ...points }, each point { t: absolute unix seconds, p: price }.
-- Never scored. The times are the data's real times, so the row must not be
-- readable from the browser (the data's period must not leak): RLS is on with
-- NO policies, and only server code (service role) reads and writes it. The
-- server sends drawings to the browser with times relative to "now".
create table if not exists public.demo_drawings (
  account_id uuid not null,
  user_id    uuid not null references auth.users on delete cascade,
  pair       text not null check (pair in ('GBPNZD', 'EURAUD', 'GBPCAD', 'USDCAD', 'EURJPY', 'AUDUSD', 'USDJPY', 'GBPUSD', 'EURUSD')),
  drawings   jsonb not null default '[]'::jsonb
    check (jsonb_typeof(drawings) = 'array' and jsonb_array_length(drawings) <= 60 and pg_column_size(drawings) <= 65536),
  updated_at timestamptz not null default now(),
  primary key (account_id, pair),
  constraint demo_drawings_account_owner_fkey
    foreign key (account_id, user_id) references public.demo_accounts (id, user_id) on delete cascade
);

alter table public.demo_drawings enable row level security;
revoke all on public.demo_drawings from anon, authenticated;

-- 3. The candle chunks. Private: no storage policies, so only the service
-- role can read them, and whole files never reach the browser.
insert into storage.buckets (id, name, public)
values ('live-data', 'live-data', false)
on conflict (id) do update set public = false;
