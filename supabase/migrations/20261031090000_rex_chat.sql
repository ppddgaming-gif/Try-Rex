-- ===========================================================================
-- "Tanya Rex": the AI chat about one closed Akun Latihan trade
-- (lib/demo/rex-chat-server.ts). One row per message, Rex's and the player's.
-- The rows are also the limits' counter: questions per trade, Rex's replies
-- per day. Same rules as every demo table: the player reads their own rows,
-- only the server (service role) writes. Run after _akun_latihan_b. Safe to
-- run more than once.
-- ===========================================================================

create table if not exists public.demo_rex_chat (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users on delete cascade,
  trade_id   uuid not null,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now(),
  -- Through (trade, user), so a row can never point at another player's trade.
  constraint demo_rex_chat_trade_fk foreign key (trade_id, user_id)
    references public.demo_trades (id, user_id) on delete cascade
);

create index if not exists demo_rex_chat_trade_idx on public.demo_rex_chat (trade_id, id);
create index if not exists demo_rex_chat_day_idx on public.demo_rex_chat (user_id, created_at) where role = 'assistant';

alter table public.demo_rex_chat enable row level security;
drop policy if exists "own rex chat" on public.demo_rex_chat;
create policy "own rex chat" on public.demo_rex_chat for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.demo_rex_chat from anon, authenticated;
grant select on public.demo_rex_chat to authenticated;
