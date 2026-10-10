"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { CheckList, RexComments } from "@/components/akun-latihan/trade-parts"
import { ACCOUNT, REVIEW } from "@/lib/demo/config"
import type { ExitReason } from "@/lib/demo/fills"
import { lot, price, usd } from "@/lib/demo/format"
import { roundMoney } from "@/lib/demo/money"
import type { ReviewAnswer } from "@/lib/demo/state"
import type { TradeView } from "@/lib/demo/view"
import type { T } from "@/lib/i18n/translator"

/** Labels: demo.ui.review.<id>. */
const ANSWERS: ReviewAnswer[] = ["ya", "sebagian", "tidak"]

/** Why the trade closed, in plain words. `tx` is demo.ui.result. */
function exitText(t: TradeView, pair: string, tx: T) {
  const at = price(pair, t.exit!.price)
  const reason: ExitReason = t.exit!.reason
  if (reason === "sl") {
    return t.sl !== null && t.exit!.price !== t.sl ? tx("exitSlGap", { price: at }) : tx("exitSl", { price: at })
  }
  if (reason === "tp") {
    return t.tp !== null && t.exit!.price !== t.tp ? tx("exitTpGap", { price: at }) : tx("exitTp", { price: at })
  }
  if (reason === "manual") return tx("exitManual", { price: at })
  if (reason === "stop_out") return tx("exitStopOut", { level: ACCOUNT.STOP_OUT_LEVEL, price: at })
  return tx("exitSegment", { price: at })
}

/** This chart's closed trades, newest first: result, Disiplin and the self-review. */
export function ClosedTrades({
  trades,
  pair,
  busy,
  onReview,
}: {
  trades: TradeView[]
  pair: string
  busy: boolean
  onReview: (id: string, answer: ReviewAnswer, note: string) => Promise<boolean>
}) {
  const tx = useTranslations("demo.ui.result")
  if (trades.length === 0) return null
  return (
    <section aria-labelledby="closed-title" className="flex flex-col gap-3">
      <h2 id="closed-title" className="text-sm font-semibold">
        {tx("title")}
      </h2>
      {trades.map((t) => (
        <ClosedTrade key={t.id} trade={t} pair={pair} busy={busy} onReview={onReview} />
      ))}
    </section>
  )
}

function ClosedTrade({
  trade: t,
  pair,
  busy,
  onReview,
}: {
  trade: TradeView
  pair: string
  busy: boolean
  onReview: (id: string, answer: ReviewAnswer, note: string) => Promise<boolean>
}) {
  const [answer, setAnswer] = useState<ReviewAnswer | null>(null)
  // A note added from the journal first carries over.
  const [note, setNote] = useState(t.note ?? "")
  const exit = t.exit!
  const d = t.disiplin
  const tone = (v: number) => (v > 0 ? "text-success" : v < 0 ? "text-danger" : "")
  const asPlanned = exit.reason === "sl" && t.plannedLoss !== null && t.sl === t.slInitial && exit.price === t.sl
  const tx = useTranslations("demo.ui.result")
  const tj = useTranslations("demo.ui.journal")
  const tr = useTranslations("demo.ui.review")

  return (
    <article className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">
          {tx("trade", { n: t.number })}{" "}
          <span className={t.side === "buy" ? "text-success" : "text-danger"}>{t.side.toUpperCase()}</span>{" "}
          <span className="font-mono">{lot(t.lot)}</span>
        </p>
        <p className={`font-mono text-lg font-bold ${tone(t.pnl)}`}>{usd(t.pnl, { signed: true })}</p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{exitText(t, pair, tx)}</p>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-inset px-2.5 py-2">
          <dt className="text-muted-foreground">{tx("result")}</dt>
          <dd className={`font-mono font-semibold ${tone(exit.net)}`}>{usd(exit.net, { signed: true })}</dd>
        </div>
        <div className="rounded-lg bg-inset px-2.5 py-2">
          <dt className="text-muted-foreground">{tx("swap")}</dt>
          <dd className={`font-mono font-semibold ${tone(t.swap)}`}>{usd(t.swap, { signed: true })}</dd>
        </div>
        <div className="rounded-lg bg-inset px-2.5 py-2">
          <dt className="text-muted-foreground">{tx("total")}</dt>
          <dd className={`font-mono font-semibold ${tone(t.pnl)}`}>{usd(roundMoney(exit.net + t.swap), { signed: true })}</dd>
        </div>
      </dl>
      {asPlanned && (
        <p className="mt-2 text-xs text-muted-foreground">
          {tx("planned", { planned: usd(-t.plannedLoss!), net: usd(exit.net) })}
        </p>
      )}

      {d && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">
              {tj.rich("disiplin", { score: d.score, num: (c) => <span className="font-mono text-primary">{c}</span> })}
            </p>
            <p className="text-xs text-muted-foreground">
              {d.counted ? tx("xpFromDisiplin", { xp: d.xp }) : tj("notCounted")}
            </p>
          </div>
          <div className="mt-2">
            <CheckList checks={d.checks} />
          </div>
          <p className="mt-2 text-[11px] text-faint">{tx("noScoreEffect")}</p>
        </div>
      )}
      {t.rex && (
        <div className="mt-3">
          <RexComments comments={t.rex} />
        </div>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <p id={`review-${t.id}`} className="text-sm font-semibold">
          {tj("followed")}
        </p>
        {t.review ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {tx.rich("yourAnswer", { answer: tr(t.review.answer), b: (c) => <span className="font-semibold text-foreground">{c}</span> })}
            {t.review.note && <> · &ldquo;{t.review.note}&rdquo;</>}
          </p>
        ) : (
          <form
            className="mt-2 flex flex-col gap-2"
            onSubmit={async (e) => {
              e.preventDefault()
              if (answer) await onReview(t.id, answer, note)
            }}
          >
            <div role="radiogroup" aria-labelledby={`review-${t.id}`} className="grid grid-cols-3 gap-2">
              {ANSWERS.map((a) => (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={answer === a}
                  onClick={() => setAnswer(a)}
                  className={[
                    "min-h-11 rounded-xl border text-sm font-semibold transition-colors",
                    answer === a ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {tr(a)}
                </button>
              ))}
            </div>
            <label className="text-xs text-muted-foreground" htmlFor={`note-${t.id}`}>
              {tx("noteOptional")}
            </label>
            <input
              id={`note-${t.id}`}
              value={note}
              maxLength={REVIEW.NOTE_MAX_CHARS}
              onChange={(e) => setNote(e.target.value)}
              placeholder={tx("notePlaceholder")}
              className="h-11 rounded-lg border border-border bg-inset px-3 text-sm"
            />
            <button type="submit" disabled={!answer || busy} className="btn btn-sm self-start">
              {tx("saveAnswer")}
            </button>
            <p className="text-[11px] text-faint">{tx("notScored")}</p>
          </form>
        )}
      </div>
    </article>
  )
}
