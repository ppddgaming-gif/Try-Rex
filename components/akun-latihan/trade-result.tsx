"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { ACCOUNT, REVIEW } from "@/lib/demo/config"
import { CHECK_IDS, CHECK_LABELS } from "@/lib/demo/disiplin"
import type { ExitReason } from "@/lib/demo/fills"
import { lot, price, usd } from "@/lib/demo/format"
import { roundMoney } from "@/lib/demo/money"
import type { ReviewAnswer } from "@/lib/demo/state"
import type { TradeView } from "@/lib/demo/view"

const ANSWERS: { id: ReviewAnswer; label: string }[] = [
  { id: "ya", label: "Ya" },
  { id: "sebagian", label: "Sebagian" },
  { id: "tidak", label: "Tidak" },
]

/** Why the trade closed, in plain words. */
function exitText(t: TradeView, pair: string) {
  const at = price(pair, t.exit!.price)
  const reason: ExitReason = t.exit!.reason
  if (reason === "sl") {
    return t.sl !== null && t.exit!.price !== t.sl
      ? `Harga membuka candle melewati stop loss, jadi terisi di open candle itu: ${at}.`
      : `Stop loss kena di ${at}.`
  }
  if (reason === "tp") {
    return t.tp !== null && t.exit!.price !== t.tp
      ? `Harga membuka candle melewati take profit, jadi terisi di open candle itu: ${at}.`
      : `Take profit kena di ${at}.`
  }
  if (reason === "manual") return `Kamu menutupnya di ${at}.`
  if (reason === "stop_out") {
    return `Stop out: equity turun sampai ${ACCOUNT.STOP_OUT_LEVEL}% dari margin yang dipakai, jadi semua trade ditutup di ${at} supaya saldo tidak minus.`
  }
  return `Segmen habis: trade ditutup di close candle terakhir, ${at}.`
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
  if (trades.length === 0) return null
  return (
    <section aria-labelledby="closed-title" className="flex flex-col gap-3">
      <h2 id="closed-title" className="text-sm font-semibold">
        Trade selesai di chart ini
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
  const [note, setNote] = useState("")
  const exit = t.exit!
  const d = t.disiplin
  const tone = (v: number) => (v > 0 ? "text-success" : v < 0 ? "text-danger" : "")
  const asPlanned = exit.reason === "sl" && t.plannedLoss !== null && t.sl === t.slInitial && exit.price === t.sl

  return (
    <article className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">
          Trade #{t.number}{" "}
          <span className={t.side === "buy" ? "text-success" : "text-danger"}>{t.side.toUpperCase()}</span>{" "}
          <span className="font-mono">{lot(t.lot)}</span>
        </p>
        <p className={`font-mono text-lg font-bold ${tone(t.pnl)}`}>{usd(t.pnl, { signed: true })}</p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{exitText(t, pair)}</p>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-inset px-2.5 py-2">
          <dt className="text-muted-foreground">Hasil trade</dt>
          <dd className={`font-mono font-semibold ${tone(exit.net)}`}>{usd(exit.net, { signed: true })}</dd>
        </div>
        <div className="rounded-lg bg-inset px-2.5 py-2">
          <dt className="text-muted-foreground">Swap</dt>
          <dd className={`font-mono font-semibold ${tone(t.swap)}`}>{usd(t.swap, { signed: true })}</dd>
        </div>
        <div className="rounded-lg bg-inset px-2.5 py-2">
          <dt className="text-muted-foreground">Total</dt>
          <dd className={`font-mono font-semibold ${tone(t.pnl)}`}>{usd(roundMoney(exit.net + t.swap), { signed: true })}</dd>
        </div>
      </dl>
      {asPlanned && (
        <p className="mt-2 text-xs text-muted-foreground">
          Panel order memperkirakan {usd(-t.plannedLoss!)} jika SL kena. Hasil trade: {usd(exit.net)}.
        </p>
      )}

      {d && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">
              Disiplin <span className="font-mono text-primary">{d.score}%</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {d.counted ? `+${d.xp} XP dari Disiplin` : "Tidak dihitung: ditutup di candle yang sama saat dibuka"}
            </p>
          </div>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            {CHECK_IDS.map((id) => {
              const ok = d.checks[id]
              return (
                <li key={id} className="flex items-center gap-2">
                  {ok ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-label="Lolos" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-muted-foreground" aria-label="Tidak lolos" />
                  )}
                  <span className={ok ? "" : "text-muted-foreground"}>{CHECK_LABELS[id]}</span>
                </li>
              )
            })}
          </ul>
          <p className="mt-2 text-[11px] text-faint">Untung atau rugi tidak mengubah skor ini.</p>
        </div>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <p id={`review-${t.id}`} className="text-sm font-semibold">
          Apakah kamu mengikuti rencanamu?
        </p>
        {t.review ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Jawabanmu: <span className="font-semibold text-foreground">{ANSWERS.find((a) => a.id === t.review!.answer)?.label}</span>
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
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={answer === a.id}
                  onClick={() => setAnswer(a.id)}
                  className={[
                    "min-h-11 rounded-xl border text-sm font-semibold transition-colors",
                    answer === a.id ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <label className="text-xs text-muted-foreground" htmlFor={`note-${t.id}`}>
              Catatan singkat (opsional)
            </label>
            <input
              id={`note-${t.id}`}
              value={note}
              maxLength={REVIEW.NOTE_MAX_CHARS}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Misalnya: masuk terlalu cepat"
              className="h-11 rounded-lg border border-border bg-inset px-3 text-sm"
            />
            <button type="submit" disabled={!answer || busy} className="btn btn-sm self-start">
              Simpan jawaban
            </button>
            <p className="text-[11px] text-faint">Jawaban ini hanya untuk jurnalmu. Tidak dinilai.</p>
          </form>
        )}
      </div>
    </article>
  )
}
