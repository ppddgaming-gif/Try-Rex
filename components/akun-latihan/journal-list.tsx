"use client"

import { useId, useState } from "react"
import Link from "next/link"
import { BrainCircuit, ChevronDown, LoaderCircle, PencilLine } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { usePostJson } from "@/components/akun-latihan/post-json"
import { AskRex } from "@/components/akun-latihan/rex-chat"
import { CheckList, RexComments, useExitLabel } from "@/components/akun-latihan/trade-parts"
import { REVIEW } from "@/lib/demo/config"
import { ASPECTS, journalComplete, type EvalText, type Scores } from "@/lib/demo/evaluation"
import { lot, pct, price, usd } from "@/lib/demo/format"
import type { JournalRow } from "@/lib/demo/journal"
import { REVIEW_ANSWERS, type ReviewAnswer } from "@/lib/demo/state"
import type { Locale } from "@/lib/i18n/locale"
import type { T } from "@/lib/i18n/translator"

/** A saved AI Evaluation, both languages: switching language only picks the other text. */
export type JournalEvaluation = { scores: Scores; text: { id: EvalText; en: EvalText } }

/** A journal row with its candle times already formatted on the server (no clock or locale in the browser). */
export type JournalItem = JournalRow & { entryLabel: string | null; exitLabel: string | null; evaluation: JournalEvaluation | null }

/** One month's entries (the month the trades closed, WIB). */
export type JournalGroup = { month: string; label: string; rows: JournalItem[] }

const tone = (v: number) => (v > 0 ? "text-success" : v < 0 ? "text-danger" : "")

/**
 * The Trading Journal: one row per closed trade, newest first, one group per
 * month. A row opens to the whole plan, the result, the Disiplin checks,
 * Rex's comment, the player's own answer and note, and the saved AI
 * Evaluation when there is one. With `evaluable` (the evaluations table and
 * the model are both there), a month with written, unevaluated entries links
 * to AI Evaluation with them picked.
 */
export function JournalList({ groups, askRex, evaluable }: { groups: JournalGroup[]; askRex: boolean; evaluable: boolean }) {
  const t = useTranslations("evaluation.journal")
  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => {
        const ready = g.rows.filter((r) => !r.evaluation && journalComplete(r)).length
        return (
          <section key={g.month} aria-labelledby={`month-${g.month}`}>
            <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2 px-1">
              <h3 id={`month-${g.month}`} className="font-display text-lg font-bold">
                {g.label}
              </h3>
              <p className="flex flex-wrap items-baseline gap-x-3 text-xs text-muted-foreground">
                {t("monthCount", { n: g.rows.length, done: g.rows.filter((r) => r.evaluation).length })}
                {evaluable && ready > 0 && g.month !== "—" && (
                  <Link href={`/ai-evaluation?month=${g.month}`} className="font-semibold text-primary underline-offset-4 hover:underline">
                    {t("evaluateMonth", { n: ready })}
                  </Link>
                )}
              </p>
            </div>
            <ol className="flex flex-col gap-2.5">
              {g.rows.map((r) => (
                <JournalEntry key={r.id} row={r} askRex={askRex} />
              ))}
            </ol>
          </section>
        )
      })}
    </div>
  )
}

function JournalEntry({ row: r, askRex }: { row: JournalItem; askRex: boolean }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const t = useTranslations("demo.ui.journal")
  const root = useTranslations()
  const te = useTranslations("evaluation.journal")
  const exitLabel = useExitLabel()

  return (
    <li className="glass-card overflow-hidden rounded-2xl">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 sm:px-5"
      >
        <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">#{r.number}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold">
            {r.pair}
            <span className={r.side === "buy" ? "text-success" : "text-danger"}>{r.side.toUpperCase()}</span>
            <span className="font-mono text-xs font-normal text-muted-foreground">{lot(r.lot)} lot</span>
          </span>
          <span className="block text-xs text-muted-foreground">
            {r.entryLabel ?? t("candleMissing")} · {exitLabel(r.exitReason)}
          </span>
          <span
            className={[
              "mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
              r.evaluation ? "border-primary/50 text-primary" : "border-border text-muted-foreground",
            ].join(" ")}
          >
            <BrainCircuit className="h-3 w-3" aria-hidden="true" />
            {r.evaluation ? te("evaluated") : te("notEvaluated")}
          </span>
        </span>
        <span className="text-right">
          <span className={`block font-mono text-sm font-bold ${tone(r.total)}`}>{usd(r.total, { signed: true })}</span>
          <span className="block font-mono text-xs text-primary">{t.rich("disiplin", { score: r.score, num: (c) => <>{c}</> })}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out-expo ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <div id={panelId} data-open={open} className="expand">
        <div>
          <div className="flex flex-col gap-4 border-t border-border px-4 py-4 sm:px-5">
            <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <Field label={t("entry")} value={price(r.pair, r.entry)} sub={r.entryLabel ?? undefined} />
              <Field label={t("exit")} value={price(r.pair, r.exit)} sub={r.exitLabel ?? exitLabel(r.exitReason)} />
              <Field
                label={t("stopLoss")}
                value={level(r.pair, r.slInitial, r.sl, t)}
                sub={r.riskPct === null ? t("noSl") : t("risk", { risk: pct(r.riskPct) })}
              />
              <Field
                label={t("takeProfit")}
                value={level(r.pair, r.tpInitial, r.tp, t)}
                sub={r.rewardRisk === null ? t("noRR") : t("rr", { rr: r.rewardRisk.toFixed(2) })}
              />
              <Field label={t("pips")} value={`${r.pips > 0 ? "+" : ""}${r.pips.toFixed(1)}`} tone={tone(r.pips)} />
              <Field label={t("result")} value={usd(r.net, { signed: true })} tone={tone(r.net)} />
              <Field label={t("swap")} value={usd(r.swap, { signed: true })} tone={tone(r.swap)} />
              <Field label={t("total")} value={usd(r.total, { signed: true })} tone={tone(r.total)} />
            </dl>

            <div>
              <p className="text-xs font-semibold text-muted-foreground">{t("reasons")}</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {r.reasons.map((id) => (
                  <li key={id} className="rounded-full border border-border px-2.5 py-1 text-xs">
                    {root(`common.reasons.${id}`)}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">
                  {t.rich("disiplin", { score: r.score, num: (c) => <span className="font-mono text-primary">{c}</span> })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.counted ? t("xp", { xp: r.xp }) : t("notCounted")}
                </p>
              </div>
              <div className="mt-2">
                <CheckList checks={r.checks} />
              </div>
            </div>

            <RexComments comments={r.rex} />
            {askRex && <AskRex tradeId={r.id} number={r.number} />}

            <Review tradeId={r.id} initial={r.review} />

            <Note tradeId={r.id} initial={r.note} />

            <EvaluationResult evaluation={r.evaluation} />
          </div>
        </div>
      </div>
    </li>
  )
}

/**
 * "Apakah kamu mengikuti rencanamu?": shown as answered, or, for a trade that
 * was never reviewed on the trading screen, the same three answers to give it
 * here (the same route; self-reported, never scored).
 */
function Review({ tradeId, initial }: { tradeId: string; initial: ReviewAnswer | null }) {
  const [answer, setAnswer] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const postJson = usePostJson()
  const t = useTranslations("demo.ui.journal")
  const root = useTranslations()

  async function save(a: ReviewAnswer) {
    setBusy(true)
    setError(null)
    const res = await postJson("/api/akun-latihan/trade/review", { trade: tradeId, answer: a })
    setBusy(false)
    if (res.error) return setError(res.error)
    setAnswer(a)
  }

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{t("followed")}</p>
      {answer ? (
        <p className="mt-1 text-sm">{root(`demo.ui.review.${answer}`)}</p>
      ) : (
        <div role="group" aria-label={t("followed")} className="mt-1.5 flex flex-wrap gap-2">
          {REVIEW_ANSWERS.map((a) => (
            <button key={a} type="button" disabled={busy} onClick={() => void save(a)} className="btn btn-ghost btn-sm">
              {root(`demo.ui.review.${a}`)}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-1 text-sm text-primary">
          {error}
        </p>
      )}
    </div>
  )
}

/** The saved AI Evaluation in the page's language, or "not evaluated yet" with the way there. */
function EvaluationResult({ evaluation }: { evaluation: JournalEvaluation | null }) {
  const t = useTranslations("evaluation.journal")
  const locale = useLocale() as Locale
  if (!evaluation) {
    return (
      <div className="rounded-xl border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
        {t("notEvaluatedBody")}{" "}
        <Link href="/ai-evaluation" className="font-semibold text-primary underline-offset-4 hover:underline">
          {t("toEvaluation")}
        </Link>
      </div>
    )
  }
  const text = evaluation.text[locale] ?? evaluation.text.id
  return (
    <section aria-label={t("title")} className="rounded-xl border border-primary/30 bg-inset p-3 sm:p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <BrainCircuit className="h-4 w-4 text-primary" aria-hidden="true" /> {t("title")}
      </p>
      <p className="mt-2 text-sm leading-relaxed">{text.summary}</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {ASPECTS.map((a) => (
          <li key={a}>
            <div className="flex items-baseline justify-between gap-3 text-xs font-semibold">
              <span>{t(`aspects.${a}`)}</span>
              <span className="font-mono tabular-nums">{evaluation.scores[a]}/100</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-card" aria-hidden="true">
              <div className="h-full origin-left rounded-full bg-primary" style={{ transform: `scaleX(${evaluation.scores[a] / 100})` }} />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text.aspects[a]}</p>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-border pt-3 text-xs leading-relaxed">
        <p className="font-semibold">{t("journalHeading")}</p>
        <p className="mt-0.5 text-muted-foreground">{text.journal}</p>
        <p className="mt-2 font-semibold">{t("patterns")}</p>
        <ul className="mt-0.5 list-disc pl-4 text-muted-foreground">
          {text.patterns.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="mt-2 font-semibold">{t("practice")}</p>
        <p className="mt-0.5 text-muted-foreground">{text.practice}</p>
      </div>
      <p className="mt-3 text-[11px] text-faint">
        {t("scoresNote")} {t("disclaimer")}
      </p>
    </section>
  )
}

/** "1.16700", or "1.16700 → 1.16900" when it was moved, or "—". `t` is demo.ui.journal. */
function level(pair: string, initial: number | null, final: number | null, t: T) {
  if (initial === null && final === null) return "—"
  if (initial === final) return price(pair, initial!)
  const fmt = (v: number | null) => (v === null ? t("without") : price(pair, v))
  return `${fmt(initial)} → ${fmt(final)}`
}

function Field({ label, value, sub, tone = "" }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="rounded-lg bg-inset px-2.5 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`break-words font-mono text-[13px] font-semibold ${tone}`}>{value}</dd>
      {sub && <dd className="mt-0.5 text-[11px] text-faint">{sub}</dd>}
    </div>
  )
}

/** "Tambah catatan": the player's own note on the trade. Saved on the server; never scored. */
function Note({ tradeId, initial }: { tradeId: string; initial: string | null }) {
  const [note, setNote] = useState(initial)
  const [draft, setDraft] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fieldId = useId()
  const postJson = usePostJson()
  const t = useTranslations("demo.ui.journal")

  async function save() {
    if (draft === null) return
    setBusy(true)
    setError(null)
    const res = await postJson<{ note?: string | null }>("/api/akun-latihan/trade/note", { trade: tradeId, note: draft })
    setBusy(false)
    if (res.error) return setError(res.error)
    setNote(res.note ?? null)
    setDraft(null)
  }

  if (draft !== null) {
    return (
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void save()
        }}
      >
        <label htmlFor={fieldId} className="text-xs font-semibold text-muted-foreground">
          {t("note")}
        </label>
        <input
          id={fieldId}
          value={draft}
          maxLength={REVIEW.NOTE_MAX_CHARS}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("notePlaceholder")}
          autoFocus
          className="h-11 rounded-lg border border-border bg-inset px-3 text-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={busy} className="btn btn-sm">
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {t("saveNote")}
          </button>
          <button type="button" onClick={() => setDraft(null)} disabled={busy} className="btn btn-ghost btn-sm">
            {t("cancel")}
          </button>
          <span className="ml-auto font-mono text-[11px] text-faint">
            {draft.length}/{REVIEW.NOTE_MAX_CHARS}
          </span>
        </div>
        {error && (
          <p role="alert" className="text-sm text-primary">
            {error}
          </p>
        )}
      </form>
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{t("note")}</p>
      {note && <p className="mt-1 text-sm">&ldquo;{note}&rdquo;</p>}
      <button
        type="button"
        onClick={() => setDraft(note ?? "")}
        className="mt-1.5 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-primary hover:bg-primary/10 -ml-2"
      >
        <PencilLine className="h-4 w-4" aria-hidden="true" /> {note ? t("editNote") : t("addNote")}
      </button>
    </div>
  )
}
