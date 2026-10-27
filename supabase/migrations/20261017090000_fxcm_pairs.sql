-- ===========================================================================
-- Live chart: EURAUD, GBPCAD and GBPNZD back, from real FXCM data (moved onto
-- the MT4 broker clock by scripts/build-live-data.mjs). Widens the pair checks
-- _trading_pairs set to six. Run after _trading_pairs. Safe to run more than
-- once.
-- ===========================================================================

alter table public.demo_accounts drop constraint if exists demo_accounts_last_pair_check;
alter table public.demo_accounts add constraint demo_accounts_last_pair_check
  check (last_pair is null or last_pair in ('GBPNZD', 'EURAUD', 'GBPCAD', 'USDCAD', 'EURJPY', 'AUDUSD', 'USDJPY', 'GBPUSD', 'EURUSD'));

-- The inline check _trading_pairs created on demo_drawings.pair gets Postgres's default name.
alter table public.demo_drawings drop constraint if exists demo_drawings_pair_check;
alter table public.demo_drawings add constraint demo_drawings_pair_check
  check (pair in ('GBPNZD', 'EURAUD', 'GBPCAD', 'USDCAD', 'EURJPY', 'AUDUSD', 'USDJPY', 'GBPUSD', 'EURUSD'));
