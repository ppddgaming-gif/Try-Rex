import "server-only"
import { randomUUID } from "node:crypto"
import { getTranslations } from "next-intl/server"
import { llmReply } from "@/lib/ai/groq"
import { AI_EVAL } from "@/lib/demo/config"
import {
  evalDay,
  evaluationMessages,
  journalComplete,
  monthOf,
  parseEvaluation,
  PROMPT_VERSION,
  runEvaluation,
  runsLeft,
  type AiReply,
  type Candidate,
  type EvalText,
  type Evaluation,
  type LogEntry,
  type RunResult,
  type Scores,
} from "@/lib/demo/evaluation"
import { commentsFor } from "@/lib/demo/journal"
import { tradeFacts, type LlmMessage } from "@/lib/demo/rex-chat"
import type { TradeRow } from "@/lib/demo/state"
import { TRADE_COLUMNS, toTradeRow, type Row } from "@/lib/demo/trading"
import type { T } from "@/lib/i18n/translator"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// AI Evaluation, server side (the rules are in lib/demo/evaluation.ts).
// Reads go through the player's own session, so RLS limits them to their
// rows; the evaluations and the call log are written with the service role,
// evaluations only after a complete reply, in one statement.

const MAX_ENTRIES = 1000
/** An evaluation reply is long (two languages for every entry); give it more time than a chat reply. */
const EVAL_TIMEOUT_MS = 90_000

export type Entry = { trade: TradeRow; closedAt: string; month: string; accountId: string; evaluated: boolean; complete: boolean }

/** Every closed trade of the player with its month and whether it was evaluated; null before the migration. */
export async function loadEntries(userId: string): Promise<Entry[] | null> {
  const supabase = await createClient()
  const [trades, evals] = await Promise.all([
    supabase
      .from("demo_trades")
      .select(`${TRADE_COLUMNS}, closed_at, account_id`)
      .eq("user_id", userId)
      .eq("status", "closed")
      .order("closed_at", { ascending: false })
      .limit(MAX_ENTRIES),
    supabase.from("demo_journal_evaluations").select("journal_id").eq("user_id", userId).limit(MAX_ENTRIES),
  ])
  if (trades.error) throw new Error("AI Evaluation: could not load the trades")
  if (evals.error) return null
  const done = new Set((evals.data ?? []).map((e) => String(e.journal_id)))
  return ((trades.data ?? []) as unknown as Row[]).map((r) => {
    const trade = toTradeRow(r)
    const closedAt = String(r.closed_at)
    return {
      trade,
      closedAt,
      month: monthOf(closedAt),
      accountId: String(r.account_id),
      evaluated: done.has(trade.id),
      complete: journalComplete({ review: trade.review, note: trade.reviewNote }),
    }
  })
}

export type SavedEvaluation = { month: string; scores: Scores; text: { id: EvalText; en: EvalText }; createdAt: string }

/** The player's saved evaluations by trade id; null before the migration. */
export async function loadEvaluations(userId: string): Promise<Map<string, SavedEvaluation> | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("demo_journal_evaluations")
    .select("journal_id, month, result_id, result_en, score_risk, score_sl, score_rr, score_entry, score_management, created_at")
    .eq("user_id", userId)
    .limit(MAX_ENTRIES)
  if (error) return null
  return new Map(
    (data ?? []).map((r) => [
      String(r.journal_id),
      {
        month: String(r.month),
        scores: { risk: r.score_risk, sl: r.score_sl, rr: r.score_rr, entry: r.score_entry, management: r.score_management },
        text: { id: r.result_id as EvalText, en: r.result_en as EvalText },
        createdAt: String(r.created_at),
      },
    ]),
  )
}

/** Successful player runs since `since` (failed calls and admin re-runs don't count). */
async function runsSince(userId: string, since: Date) {
  const { count, error } = await createAdminClient()
    .from("demo_journal_eval_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "ok")
    .eq("admin", false)
    .gte("created_at", since.toISOString())
  if (error) throw new Error("AI Evaluation: could not count today's runs")
  return count ?? 0
}

/** Today's remaining runs and when the count resets. */
export async function quotaOf(userId: string, nowMs = Date.now()) {
  const { start, resetAt } = evalDay(nowMs)
  return { left: runsLeft(await runsSince(userId, start)), limit: AI_EVAL.RUNS_PER_DAY, resetAt: resetAt.toISOString() }
}

async function askModel(messages: LlmMessage[]): Promise<AiReply> {
  const r = await llmReply(messages, AI_EVAL.REPLY_MAX_TOKENS, EVAL_TIMEOUT_MS)
  return r.ok ? { ok: true, text: r.text, model: r.model, usage: r.usage } : { ok: false, busy: r.reason === "busy", model: r.model }
}

/** One log row per model call: who, which entries, tokens, time, status. Never the journal text. */
async function writeLog(userId: string, e: LogEntry, admin = false) {
  console.info(
    `AI Evaluation ${e.status}: user=${userId} journals=${e.journalIds.length} model=${e.model ?? "-"} tokens=${e.usage ? e.usage.prompt + e.usage.completion : "-"} ms=${e.durationMs}${admin ? " admin" : ""}`,
  )
  const { error } = await createAdminClient()
    .from("demo_journal_eval_log")
    .insert({
      user_id: userId,
      journal_ids: e.journalIds,
      status: e.status,
      model: e.model,
      prompt_version: PROMPT_VERSION,
      prompt_tokens: e.usage?.prompt ?? null,
      completion_tokens: e.usage?.completion ?? null,
      duration_ms: Math.max(0, Math.round(e.durationMs)),
      admin,
    })
  if (error) console.error("AI Evaluation: could not write the log", error.message)
}

const rowOf = (userId: string, batchId: string, e: Evaluation, meta: { model: string; promptVersion: string }) => ({
  user_id: userId,
  journal_id: e.tradeId,
  batch_id: batchId,
  month: e.month,
  result_id: e.text.id,
  result_en: e.text.en,
  score_risk: e.scores.risk,
  score_sl: e.scores.sl,
  score_rr: e.scores.rr,
  score_entry: e.scores.entry,
  score_management: e.scores.management,
  model: meta.model,
  prompt_version: meta.promptVersion,
  updated_at: new Date().toISOString(),
})

const factsOf = async (trades: TradeRow[]) => {
  const t = (await getTranslations()) as unknown as T
  return trades.map((trade) => tradeFacts(trade, commentsFor(trade) ?? [], t))
}

/** One Evaluate press by the player. */
export async function evaluateJournals(userId: string, ids: string[]): Promise<RunResult | "not-ready"> {
  const entries = await loadEntries(userId)
  if (!entries) return "not-ready"
  const byId = new Map(entries.map((e) => [e.trade.id, e]))
  const candidates: Candidate[] = entries.map((e) => ({ id: e.trade.id, number: e.trade.number, month: e.month, complete: e.complete, evaluated: e.evaluated }))

  return runEvaluation(ids, {
    candidates: async () => candidates,
    runsToday: (since) => runsSince(userId, since),
    facts: (picked) => factsOf(picked.map((c) => byId.get(c.id)!.trade)),
    ai: askModel,
    save: async (evaluations, meta) => {
      const batch = randomUUID()
      const { error } = await createAdminClient()
        .from("demo_journal_evaluations")
        .insert(evaluations.map((e) => rowOf(userId, batch, e, meta)))
      if (!error) return "ok"
      // 23505: the unique journal_id. The statement saved nothing.
      if (error.code === "23505") return "conflict"
      throw new Error(`AI Evaluation: could not save (${error.message})`)
    },
    log: (e) => writeLog(userId, e),
    now: () => Date.now(),
  })
}

/**
 * For the admin re-run after PROMPT_VERSION changes: up to `batches` groups
 * of saved evaluations made with an older prompt are evaluated again and
 * replaced. Not reachable by players; doesn't count toward anyone's limit.
 */
export async function reevaluateStale(batches: number) {
  const db = createAdminClient()
  const { data, error } = await db
    .from("demo_journal_evaluations")
    .select("journal_id, user_id, batch_id, month")
    .neq("prompt_version", PROMPT_VERSION)
    .order("created_at")
    .limit(batches * AI_EVAL.MAX_PER_RUN)
  if (error) throw new Error(`AI Evaluation re-run: ${error.message}`)
  const groups = new Map<string, { userId: string; month: string; ids: string[] }>()
  for (const r of data ?? []) {
    const g = groups.get(String(r.batch_id)) ?? { userId: String(r.user_id), month: String(r.month), ids: [] }
    g.ids.push(String(r.journal_id))
    groups.set(String(r.batch_id), g)
  }

  const results: { batch: string; status: LogEntry["status"] }[] = []
  for (const [batch, g] of [...groups].slice(0, batches)) {
    const { data: rows, error: tradeError } = await db
      .from("demo_trades")
      .select(TRADE_COLUMNS)
      .eq("user_id", g.userId)
      .in("id", g.ids)
    if (tradeError) throw new Error(`AI Evaluation re-run: ${tradeError.message}`)
    const trades = ((rows ?? []) as unknown as Row[]).map(toTradeRow)
    const picked: Candidate[] = trades.map((t) => ({ id: t.id, number: t.number, month: g.month, complete: true, evaluated: true }))
    const began = Date.now()
    const reply = await askModel(evaluationMessages(g.month, await factsOf(trades)))
    const durationMs = Date.now() - began
    const evaluations = reply.ok ? parseEvaluation(reply.text, picked, g.month) : null
    const status: LogEntry["status"] = !reply.ok ? "ai_failed" : evaluations ? "ok" : "invalid"
    if (evaluations && reply.ok) {
      const { error: saveError } = await db
        .from("demo_journal_evaluations")
        .upsert(evaluations.map((e) => rowOf(g.userId, batch, e, { model: reply.model, promptVersion: PROMPT_VERSION })), { onConflict: "journal_id" })
      if (saveError) throw new Error(`AI Evaluation re-run: ${saveError.message}`)
    }
    await writeLog(g.userId, { journalIds: g.ids, status, model: reply.model ?? null, usage: reply.ok ? reply.usage : null, durationMs }, true)
    results.push({ batch, status })
  }
  return { promptVersion: PROMPT_VERSION, processed: results, more: groups.size > batches }
}


/** Account number by account id, for labelling entries. */
export async function accountNumbers(userId: string): Promise<Map<string, number>> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("demo_accounts").select("id, number").eq("user_id", userId)
  if (error) throw new Error("AI Evaluation: could not load the accounts")
  return new Map((data ?? []).map((a) => [String(a.id), Number(a.number)]))
}

/** The WIB month each closed trade of one account belongs to (by when it closed, not the chart's period). */
export async function closedMonths(userId: string, accountId: string): Promise<Map<string, string>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("demo_trades")
    .select("id, closed_at")
    .eq("user_id", userId)
    .eq("account_id", accountId)
    .eq("status", "closed")
    .limit(MAX_ENTRIES)
  if (error) throw new Error("AI Evaluation: could not load the trades")
  return new Map((data ?? []).filter((r) => r.closed_at).map((r) => [String(r.id), monthOf(String(r.closed_at))]))
}
