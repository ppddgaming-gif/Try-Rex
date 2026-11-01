import { AI_EVAL } from "@/lib/demo/config"
import { dayStart, type LlmMessage } from "@/lib/demo/rex-chat"
import type { ReviewAnswer } from "@/lib/demo/state"

// AI Evaluation of journal entries. A journal entry is one closed Akun
// Latihan trade plus what the player wrote about it (the self-review answer
// and the note). The player picks unevaluated entries from one month; the
// server checks everything, asks the model once for the whole group, and
// saves one evaluation per entry, in both languages, only if the reply is
// complete. An entry is evaluated at most once (a unique constraint in the
// database too). The scores are a report card: they never touch XP or
// Disiplin, and the outcome of a trade never decides them. Pure; the I/O is
// passed in (lib/demo/evaluation-server.ts), so the rules are tested here.

/** Bump when the prompt or the reply's shape changes; the admin re-run looks for older rows. */
export const PROMPT_VERSION = "journal-eval-v1"

export const ASPECTS = ["risk", "sl", "rr", "entry", "management"] as const
export type Aspect = (typeof ASPECTS)[number]
export type Scores = Record<Aspect, number>

/** The saved text of one entry's evaluation, in one language. */
export type EvalText = {
  summary: string
  aspects: Record<Aspect, string>
  /** About what the player wrote: thin or missing writing is said here, never guessed at. */
  journal: string
  /** The month's recurring patterns, shared by every entry of the run. */
  patterns: string[]
  /** One process to practise, shared by the run. */
  practice: string
}

export type Evaluation = { tradeId: string; month: string; scores: Scores; text: { id: EvalText; en: EvalText } }

// --- Entries ----------------------------------------------------------------

/** "2026-11": the month a trade closed, on the WIB calendar like the rest of Akun Latihan. */
export function monthOf(closedAt: string | Date, offsetHours: number = AI_EVAL.DAY_UTC_OFFSET_HOURS): string {
  const ms = new Date(closedAt).getTime() + offsetHours * 3_600_000
  return new Date(ms).toISOString().slice(0, 7)
}

/** "November 2026" for "2026-11"; `intlLocale` is a BCP 47 tag (INTL_LOCALE). */
export const monthLabel = (month: string, intlLocale: string) =>
  new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`))

/** Written enough to evaluate: the self-review answered and a note. */
export const journalComplete = (e: { review: ReviewAnswer | null; note: string | null }) => e.review !== null && Boolean(e.note?.trim())

/** An entry as the checks see it. */
export type Candidate = { id: string; number: number; month: string; complete: boolean; evaluated: boolean }

export type Refusal =
  | "empty"
  | "tooMany"
  | "notFound"
  | "evaluated"
  | "incomplete"
  | "mixedMonths"
  | "limit"
  | "aiFailed"
  | "aiBusy"
  | "unconfigured"

/**
 * The run's month when `ids` can be evaluated together, or why not. Every id
 * must be the player's own closed trade, not yet evaluated, written enough,
 * and from one month; at most MAX_PER_RUN at once.
 */
export function checkSelection(ids: string[], candidates: Candidate[]): { month: string; picked: Candidate[] } | { refusal: Refusal } {
  const unique = [...new Set(ids)]
  if (unique.length === 0) return { refusal: "empty" }
  if (unique.length > AI_EVAL.MAX_PER_RUN) return { refusal: "tooMany" }
  const byId = new Map(candidates.map((c) => [c.id, c]))
  const picked = unique.map((id) => byId.get(id))
  if (picked.some((c) => !c)) return { refusal: "notFound" }
  const list = picked as Candidate[]
  if (list.some((c) => c.evaluated)) return { refusal: "evaluated" }
  if (new Set(list.map((c) => c.month)).size > 1) return { refusal: "mixedMonths" }
  if (list.some((c) => !c.complete)) return { refusal: "incomplete" }
  return { month: list[0].month, picked: list }
}

// --- The daily limit ----------------------------------------------------------

/** When today's count started and when it resets (midnight WIB). */
export function evalDay(nowMs: number) {
  const start = dayStart(nowMs, AI_EVAL.DAY_UTC_OFFSET_HOURS)
  return { start, resetAt: new Date(start.getTime() + 86_400_000) }
}

export const runsLeft = (runsToday: number, limit: number = AI_EVAL.RUNS_PER_DAY) => Math.max(0, limit - runsToday)

// --- The prompt ----------------------------------------------------------------

const RULES = `You are Rex, the mentor in TRY-REX, a forex practice app for beginners in Indonesia. You evaluate the player's TRADING JOURNAL for one month: closed practice trades on historical data with virtual money, and what the player wrote about each one.

Score the PROCESS, never the outcome. A trade that hit its stop loss with a sound plan scores well; a profitable trade with a poor plan does not score well because it made money.

For each trade give a whole-number score from 0 to 100 for five aspects:
- risk: how much of the balance was at risk (about 1-2% is sound; no SL or far above 2% is poor)
- sl: whether there was a stop loss, whether it was moved further away, and its distance compared with the average candle range
- rr: the reward:risk of the plan (at least 1:1.5 is sound; no TP or below 1:1 is poor)
- entry: whether the reasons given fit the decision, revenge trading, trading on feeling
- management: how the position was handled and closed, and SL/TP moves

Rules:
- Use ONLY the facts given. Never invent numbers, prices, reasons or events. If a fact is missing, say it is missing.
- Praise and advice must point to a specific fact in the data or the journal.
- If the player's writing (self-review and note) is thin or missing, say so plainly in "journal" and ask them to write more next time. Never guess why they traded.
- Never give a signal, an instrument, a direction or an entry technique for future trades. Never say what price will do.
- "patterns": 1 to 3 things that repeat across this month's trades, from the facts. If there is only one trade, say there is not enough to see a pattern.
- "practice": exactly one PROCESS habit to practise (for example "write the SL level before choosing the lot"), never a trade idea.
- Keep these terms as they are in both languages: BUY, SELL, SL, TP, pip, lot, R:R, ATR, Disiplin, Stage.
- Write each explanation in one or two short sentences.

Reply with ONE JSON object and nothing else, in exactly this shape:
{"trades":[{"trade":<trade number>,"scores":{"risk":0,"sl":0,"rr":0,"entry":0,"management":0},"id":{"summary":"","aspects":{"risk":"","sl":"","rr":"","entry":"","management":""},"journal":""},"en":{same keys as "id"}}],"month":{"id":{"patterns":[""],"practice":""},"en":{same keys as "id"}}}
"id" is Bahasa Indonesia (plain, friendly) and "en" is English; both say the same thing. Include every trade exactly once.`

/** The request: the rules, then the month's trades as facts. */
export function evaluationMessages(month: string, facts: string[]): LlmMessage[] {
  return [
    { role: "system", content: RULES },
    { role: "user", content: `Month: ${month}\n\n${facts.join("\n\n---\n\n")}` },
  ]
}

// --- The reply -------------------------------------------------------------------

const MAX_TEXT = 1200
const isText = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= MAX_TEXT
const isScore = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 100

function tradeText(v: unknown): Omit<EvalText, "patterns" | "practice"> | null {
  if (!v || typeof v !== "object") return null
  const o = v as Record<string, unknown>
  const a = o.aspects as Record<string, unknown> | undefined
  if (!isText(o.summary) || !isText(o.journal) || !a || typeof a !== "object") return null
  if (Object.keys(a).length !== ASPECTS.length || !ASPECTS.every((k) => isText(a[k]))) return null
  return { summary: o.summary.trim(), journal: o.journal.trim(), aspects: Object.fromEntries(ASPECTS.map((k) => [k, (a[k] as string).trim()])) as Record<Aspect, string> }
}

function monthText(v: unknown): Pick<EvalText, "patterns" | "practice"> | null {
  if (!v || typeof v !== "object") return null
  const o = v as Record<string, unknown>
  if (!Array.isArray(o.patterns) || o.patterns.length < 1 || o.patterns.length > 3 || !o.patterns.every(isText) || !isText(o.practice)) return null
  return { patterns: (o.patterns as string[]).map((p) => p.trim()), practice: o.practice.trim() }
}

/** The JSON object in a reply, tolerating a code fence or words around it. */
function jsonIn(text: string): unknown {
  const a = text.indexOf("{")
  const b = text.lastIndexOf("}")
  if (a < 0 || b <= a) return null
  try {
    return JSON.parse(text.slice(a, b + 1))
  } catch {
    return null
  }
}

/**
 * The evaluations in the model's reply, one per picked entry, or null when
 * anything is missing or malformed: every picked trade exactly once, five
 * whole-number scores 0-100, and the same keys in Indonesian and English.
 * Null means nothing is saved.
 */
export function parseEvaluation(text: string, picked: Candidate[], month: string): Evaluation[] | null {
  const root = jsonIn(text) as { trades?: unknown; month?: unknown } | null
  if (!root || !Array.isArray(root.trades) || !root.month || typeof root.month !== "object") return null
  const m = root.month as Record<string, unknown>
  const monthId = monthText(m.id)
  const monthEn = monthText(m.en)
  if (!monthId || !monthEn || monthId.patterns.length !== monthEn.patterns.length) return null

  const byNumber = new Map(picked.map((c) => [c.number, c]))
  const seen = new Set<number>()
  const out: Evaluation[] = []
  for (const raw of root.trades as unknown[]) {
    if (!raw || typeof raw !== "object") return null
    const r = raw as Record<string, unknown>
    const c = typeof r.trade === "number" ? byNumber.get(r.trade) : undefined
    if (!c || seen.has(c.number)) return null
    seen.add(c.number)
    const s = r.scores as Record<string, unknown> | undefined
    if (!s || typeof s !== "object" || Object.keys(s).length !== ASPECTS.length || !ASPECTS.every((k) => isScore(s[k]))) return null
    const id = tradeText(r.id)
    const en = tradeText(r.en)
    if (!id || !en) return null
    out.push({
      tradeId: c.id,
      month,
      scores: Object.fromEntries(ASPECTS.map((k) => [k, s[k] as number])) as Scores,
      text: { id: { ...id, ...monthId }, en: { ...en, ...monthEn } },
    })
  }
  return seen.size === picked.length ? out : null
}

// --- One run ----------------------------------------------------------------------

export type AiReply = { ok: true; text: string; model: string; usage: { prompt: number; completion: number } | null } | { ok: false; busy: boolean; model?: string }

export type LogEntry = {
  journalIds: string[]
  status: "ok" | "ai_failed" | "invalid" | "conflict"
  model: string | null
  usage: { prompt: number; completion: number } | null
  durationMs: number
}

/** The I/O one run needs; the server passes the real ones, the tests fakes. */
export type RunDeps = {
  candidates: () => Promise<Candidate[]>
  runsToday: (since: Date) => Promise<number>
  facts: (picked: Candidate[]) => Promise<string[]>
  ai: (messages: LlmMessage[]) => Promise<AiReply>
  /** Saves every evaluation in one statement; "conflict" when one already exists (nothing saved). */
  save: (evaluations: Evaluation[], meta: { model: string; promptVersion: string }) => Promise<"ok" | "conflict">
  log: (entry: LogEntry) => Promise<void>
  now: () => number
}

export type RunResult = { ok: true; evaluated: string[]; runsLeft: number } | { ok: false; refusal: Refusal; resetAt?: string }

/**
 * One Evaluate press: check the selection and the day's limit, ask the model,
 * save only a complete reply. A failed call or a malformed reply saves nothing
 * and doesn't count toward the limit (only "ok" runs are counted).
 */
export async function runEvaluation(ids: string[], deps: RunDeps): Promise<RunResult> {
  const checked = checkSelection(ids, await deps.candidates())
  if ("refusal" in checked) return { ok: false, refusal: checked.refusal }

  const { start, resetAt } = evalDay(deps.now())
  const today = await deps.runsToday(start)
  if (runsLeft(today) === 0) return { ok: false, refusal: "limit", resetAt: resetAt.toISOString() }

  const journalIds = checked.picked.map((c) => c.id)
  const began = deps.now()
  const reply = await deps.ai(evaluationMessages(checked.month, await deps.facts(checked.picked)))
  const durationMs = deps.now() - began
  if (!reply.ok) {
    await deps.log({ journalIds, status: "ai_failed", model: reply.model ?? null, usage: null, durationMs })
    return { ok: false, refusal: reply.busy ? "aiBusy" : "aiFailed" }
  }
  const evaluations = parseEvaluation(reply.text, checked.picked, checked.month)
  if (!evaluations) {
    await deps.log({ journalIds, status: "invalid", model: reply.model, usage: reply.usage, durationMs })
    return { ok: false, refusal: "aiFailed" }
  }
  const saved = await deps.save(evaluations, { model: reply.model, promptVersion: PROMPT_VERSION })
  if (saved === "conflict") {
    await deps.log({ journalIds, status: "conflict", model: reply.model, usage: reply.usage, durationMs })
    return { ok: false, refusal: "evaluated" }
  }
  await deps.log({ journalIds, status: "ok", model: reply.model, usage: reply.usage, durationMs })
  return { ok: true, evaluated: journalIds, runsLeft: runsLeft(today + 1) }
}
