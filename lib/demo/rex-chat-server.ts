import "server-only"
import { getTranslations } from "next-intl/server"
import { llmReply } from "@/lib/ai/groq"
import { REX_CHAT } from "@/lib/demo/config"
import { commentsFor } from "@/lib/demo/journal"
import {
  chatMessages,
  chatQuota,
  chatRefusal,
  cleanReply,
  dayStart,
  tradeFacts,
  type ChatState,
  type ChatTurn,
} from "@/lib/demo/rex-chat"
import { TRADE_COLUMNS, toTradeRow, type Row } from "@/lib/demo/trading"
import type { Locale } from "@/lib/i18n/locale"
import { msg, type Msg, type T } from "@/lib/i18n/translator"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// "Tanya Rex", server side. Reads go through the player's own session (RLS);
// the messages are written with the service role, only after the model has
// replied, so a failed call costs the player nothing. See lib/demo/rex-chat.ts.

export type ChatResult = { chat: ChatState } | { error: Msg; status: number }

const fail = (key: string, status: number, values?: Record<string, string | number>): ChatResult => ({
  error: msg(key, values),
  status,
})

/** More than one trade's chat can hold: the opening, then a question and a reply each. */
const MAX_TURNS = 1 + REX_CHAT.QUESTIONS_PER_TRADE * 2

async function loadTrade(userId: string, tradeId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("demo_trades")
    .select(TRADE_COLUMNS)
    .eq("id", tradeId)
    .eq("user_id", userId)
    .eq("status", "closed")
    .maybeSingle()
  if (error) throw new Error("Tanya Rex: could not load the trade")
  return data ? toTradeRow(data as unknown as Row) : null
}

/** The trade's conversation and the counts the limits need; null before the migration. */
async function readChat(userId: string, tradeId: string) {
  const supabase = await createClient()
  const [turns, today] = await Promise.all([
    supabase.from("demo_rex_chat").select("role, content").eq("user_id", userId).eq("trade_id", tradeId).order("id").limit(MAX_TURNS),
    supabase
      .from("demo_rex_chat")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("role", "assistant")
      .gte("created_at", dayStart(Date.now()).toISOString()),
  ])
  if (turns.error || today.error) return null
  const list = (turns.data ?? []).map((r) => ({ role: r.role === "user" ? "user" : "assistant", content: String(r.content) }) as ChatTurn)
  return { turns: list, callsToday: today.count ?? 0 }
}

const stateOf = (turns: ChatTurn[], callsToday: number): ChatState => ({
  turns,
  quota: chatQuota(turns.filter((t) => t.role === "user").length, callsToday),
})

/** The chat so far, for opening the pop-up. */
export async function loadChat(userId: string, tradeId: string): Promise<ChatResult> {
  if (!(await loadTrade(userId, tradeId))) return fail("errors.tradeMissing", 404)
  const chat = await readChat(userId, tradeId)
  if (!chat) return fail("errors.needsDbUpdate", 503)
  return { chat: stateOf(chat.turns, chat.callsToday) }
}

/**
 * Rex's opening explanation (`question` null) or the answer to a question.
 * The opening is made once; asking again returns the chat as it is.
 */
export async function askRex(userId: string, tradeId: string, question: string | null, locale: Locale): Promise<ChatResult> {
  const trade = await loadTrade(userId, tradeId)
  if (!trade) return fail("errors.tradeMissing", 404)
  const chat = await readChat(userId, tradeId)
  if (!chat) return fail("errors.needsDbUpdate", 503)

  if (question === null && chat.turns.length > 0) return { chat: stateOf(chat.turns, chat.callsToday) }
  if (question !== null && chat.turns.length === 0) return fail("errors.badRequest", 409)
  const refusal = chatRefusal(stateOf(chat.turns, chat.callsToday).quota, question === null ? "intro" : "question")
  if (refusal) return { error: refusal, status: 429 }

  const t = (await getTranslations()) as unknown as T
  const facts = tradeFacts(trade, commentsFor(trade) ?? [], t)
  const result = await llmReply(chatMessages({ facts, locale, turns: chat.turns, question }), REX_CHAT.REPLY_MAX_TOKENS)
  if (!result.ok) {
    if (result.reason === "unconfigured") return fail("errors.rexChatOff", 503)
    if (result.reason === "busy") return fail("errors.rexChatBusy", 429)
    return fail("errors.rexChatFailed", 502)
  }
  const reply = cleanReply(result.text)
  if (!reply) return fail("errors.rexChatFailed", 502)

  const added: ChatTurn[] = [...(question === null ? [] : [{ role: "user" as const, content: question }]), { role: "assistant", content: reply }]
  const { error } = await createAdminClient()
    .from("demo_rex_chat")
    .insert(added.map((m) => ({ user_id: userId, trade_id: tradeId, role: m.role, content: m.content })))
  if (error) return fail("errors.saveFailedShort", 500)
  return { chat: stateOf([...chat.turns, ...added], chat.callsToday + 1) }
}
