-- ===========================================================================
-- Akun Latihan, phase A: accounts, ledger, the required lesson, Rex tips.
-- Runs after _profile_customization. Safe to run more than once.
--
-- Non-negotiable #2: players read their own rows; only server code writes.
-- Every table below grants SELECT to `authenticated` under an own-row
-- policy and nothing else. Writes come from Next.js route handlers using the
-- service role, which bypasses RLS. There are no insert/update/delete
-- policies on purpose: a client that could write here could hand itself money.
-- Tables use the demo_ prefix (practice_ belongs to the Trading Game).
-- ===========================================================================

-- Per player: things that outlive any one account.
create table if not exists public.demo_profile (
  user_id                uuid primary key references auth.users on delete cascade,
  -- The required lesson before the first trade.
  intro_lesson_passed_at timestamptz,
  -- Set when an account runs out; the risk lesson clears it (phase C).
  recovery_lesson_due    boolean not null default false,
  graduated_at           timestamptz,
  created_at             timestamptz not null default now()
);

-- Akun #1, #2, …: one active at a time.
create table if not exists public.demo_accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users on delete cascade,
  number           int  not null check (number >= 1),
  status           text not null default 'active' check (status in ('active', 'habis', 'reset')),
  starting_balance numeric(12, 2) not null check (starting_balance > 0),
  balance          numeric(12, 2) not null,
  created_at       timestamptz not null default now(),
  closed_at        timestamptz,
  unique (user_id, number),
  check ((status = 'active') = (closed_at is null))
);
create unique index if not exists demo_accounts_one_active on public.demo_accounts (user_id) where status = 'active';

-- Every change to a balance, with the balance after it. The account's
-- balance must always equal its last ledger row.
create table if not exists public.demo_ledger (
  id            uuid primary key default gen_random_uuid(),
  -- Foreign key together with user_id, below.
  account_id    uuid not null,
  user_id       uuid not null references auth.users on delete cascade,
  kind          text not null check (kind in ('deposit', 'trade', 'swap', 'commission')),
  label         text not null check (char_length(label) between 1 and 80),
  amount        numeric(12, 2) not null,
  balance_after numeric(12, 2) not null,
  -- Points at demo_trades once phase B adds it.
  trade_id      uuid,
  created_at    timestamptz not null default now()
);
create index if not exists demo_ledger_account_time on public.demo_ledger (account_id, created_at);

-- A row can only point at an account owned by the same player: the ledger's
-- foreign key is (account_id, user_id) → demo_accounts (id, user_id), which
-- needs that pair to be unique. Service-role writes skip RLS, so this is the
-- database's own guarantee. Added under guards, not inline, so a re-run also
-- upgrades tables made by an earlier draft of this file, which had a foreign
-- key on account_id alone.
do $$
begin
  if not exists (select 1 from pg_constraint
                 where conrelid = 'public.demo_accounts'::regclass and conname = 'demo_accounts_id_user_key') then
    alter table public.demo_accounts add constraint demo_accounts_id_user_key unique (id, user_id);
  end if;
  if not exists (select 1 from pg_constraint
                 where conrelid = 'public.demo_ledger'::regclass and conname = 'demo_ledger_account_owner_fkey') then
    alter table public.demo_ledger add constraint demo_ledger_account_owner_fkey
      foreign key (account_id, user_id) references public.demo_accounts (id, user_id) on delete cascade;
  end if;
end $$;
alter table public.demo_ledger drop constraint if exists demo_ledger_account_id_fkey;

-- Rex tips a player has already seen (each shows once; the list rereads them).
create table if not exists public.demo_tips_seen (
  user_id uuid not null references auth.users on delete cascade,
  tip_id  text not null check (tip_id ~ '^[a-z0-9-]{1,40}$'),
  seen_at timestamptz not null default now(),
  primary key (user_id, tip_id)
);

-- ---------------------------------------------------------------------------
-- Row level security: read own rows, write nothing.
-- ---------------------------------------------------------------------------
alter table public.demo_profile   enable row level security;
alter table public.demo_accounts  enable row level security;
alter table public.demo_ledger    enable row level security;
alter table public.demo_tips_seen enable row level security;

drop policy if exists "own demo profile" on public.demo_profile;
drop policy if exists "own demo accounts" on public.demo_accounts;
drop policy if exists "own demo ledger" on public.demo_ledger;
drop policy if exists "own demo tips" on public.demo_tips_seen;

create policy "own demo profile"  on public.demo_profile   for select to authenticated using (user_id = (select auth.uid()));
create policy "own demo accounts" on public.demo_accounts  for select to authenticated using (user_id = (select auth.uid()));
create policy "own demo ledger"   on public.demo_ledger    for select to authenticated using (user_id = (select auth.uid()));
create policy "own demo tips"     on public.demo_tips_seen for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.demo_profile, public.demo_accounts, public.demo_ledger, public.demo_tips_seen from anon, authenticated;
grant select on public.demo_profile, public.demo_accounts, public.demo_ledger, public.demo_tips_seen to authenticated;

-- ---------------------------------------------------------------------------
-- Open a new account and book its first deposit in one transaction, so an
-- account never exists without its "Setoran awal" row. The starting balance
-- comes from the server's config (lib/demo/config.ts), not from the player.
-- The one-active index makes a second call while an account is open fail.
-- ---------------------------------------------------------------------------
create or replace function public.demo_open_account(p_user uuid, p_balance numeric)
returns public.demo_accounts
language plpgsql
set search_path = ''
as $$
declare
  v_number int;
  v_account public.demo_accounts;
begin
  if p_balance is null or p_balance <= 0 then
    raise exception 'starting balance must be positive';
  end if;

  select coalesce(max(number), 0) + 1 into v_number
    from public.demo_accounts where user_id = p_user;

  insert into public.demo_accounts (user_id, number, status, starting_balance, balance)
    values (p_user, v_number, 'active', p_balance, p_balance)
    returning * into v_account;

  insert into public.demo_ledger (account_id, user_id, kind, label, amount, balance_after)
    values (v_account.id, p_user, 'deposit', 'Setoran awal', p_balance, p_balance);

  insert into public.demo_profile (user_id) values (p_user)
    on conflict (user_id) do nothing;

  return v_account;
end $$;

-- Server-only. Postgres grants EXECUTE to PUBLIC by default and Supabase
-- exposes public functions at /rest/v1/rpc/<name>.
revoke execute on function public.demo_open_account(uuid, numeric) from public, anon, authenticated;
grant execute on function public.demo_open_account(uuid, numeric) to service_role;
