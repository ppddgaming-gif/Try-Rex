-- ===========================================================================
-- Akun Latihan, phase C: running out, resetting, and the next account.
-- Runs after _akun_latihan_b. Safe to run more than once. No new tables: the
-- journal, the dashboard, notes, the risk lesson and graduation use columns
-- phases A and B already made (demo_trades.review_note,
-- demo_profile.recovery_lesson_due and graduated_at, demo_accounts.status
-- 'habis' / 'reset' and closed_at).
--
-- Same rules as before: only service_role may call these, and each starts
-- with demo_claim, so a write built on a stale read is refused.
-- ===========================================================================

-- Close the active account: 'habis' when it has run out (the server checks
-- that before calling; the risk lesson becomes due), or 'reset' by the
-- player's choice. Refused while a trade is open. Its chart ends with it; its
-- trades, ledger and journal stay.
create or replace function public.demo_close_account(p_user uuid, p_account uuid, p_version bigint, p_status text)
returns public.demo_accounts
language plpgsql
set search_path = ''
as $$
declare
  v_account public.demo_accounts;
begin
  if p_status not in ('habis', 'reset') then
    raise exception 'demo_bad_status';
  end if;
  perform public.demo_claim(p_user, p_account, p_version);
  if exists (select 1 from public.demo_trades
             where account_id = p_account and user_id = p_user and status = 'open') then
    raise exception 'demo_open_trades';
  end if;

  update public.demo_sessions set status = 'ended', ended_at = now()
   where account_id = p_account and user_id = p_user and status = 'active';
  update public.demo_accounts set status = p_status, closed_at = now()
   where id = p_account and user_id = p_user
  returning * into v_account;

  if p_status = 'habis' then
    insert into public.demo_profile (user_id, recovery_lesson_due) values (p_user, true)
      on conflict (user_id) do update set recovery_lesson_due = true;
  end if;
  return v_account;
end $$;

-- Opening an account, as in phase A, plus the database's own check that a
-- player whose account ran out has passed the risk lesson first.
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
  if exists (select 1 from public.demo_profile where user_id = p_user and recovery_lesson_due) then
    raise exception 'demo_lesson_due';
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
revoke execute on function public.demo_close_account(uuid, uuid, bigint, text) from public, anon, authenticated;
revoke execute on function public.demo_open_account(uuid, numeric) from public, anon, authenticated;
grant execute on function public.demo_close_account(uuid, uuid, bigint, text) to service_role;
grant execute on function public.demo_open_account(uuid, numeric) to service_role;
