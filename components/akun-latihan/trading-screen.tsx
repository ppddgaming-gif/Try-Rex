"use client"

import { useEffect, useEffectEvent, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  CandlestickChart as ChartIcon,
  GraduationCap,
  Pause,
  PencilLine,
  Play,
  RefreshCw,
  SkipForward,
  X,
} from "lucide-react"
import { Confetti } from "@/components/confetti"
import { Rex } from "@/components/rex-mascot"
import { AccountPanel, StageCard } from "@/components/akun-latihan/account-panel"
import { FirstTradeGuide, type GuideProgress } from "@/components/akun-latihan/first-trade-guide"
import { OpenTrades } from "@/components/akun-latihan/open-trades"
import { OrderPanel, quoteFor, sideStyle, type Draft } from "@/components/akun-latihan/order-panel"
import { postJson } from "@/components/akun-latihan/post-json"
import { RexTipCard, useTipQueue } from "@/components/akun-latihan/rex-tip"
import { TradeChart } from "@/components/akun-latihan/trade-chart"
import { ClosedTrades } from "@/components/akun-latihan/trade-result"
import { ACCOUNT, DISIPLIN, REPLAY } from "@/lib/demo/config"
import { price, usd } from "@/lib/demo/format"
import { instrument } from "@/lib/demo/instruments"
import type { Side } from "@/lib/demo/money"
import type { ReviewAnswer } from "@/lib/demo/state"
import type { DemoView } from "@/lib/demo/view"
import { addServerXp } from "@/lib/progress/use-progress"

type Speed = (typeof REPLAY.SPEEDS)[number]

/**
 * The trading screen. Every number on it comes from the server's view
 * (lib/demo/view.ts), which holds candles up to the current one only; each
 * action posts to a route and gets the whole new view back. The order
 * panel's calculator runs the same pure functions the server books with.
 */
export function TradingScreen({ initial }: { initial: DemoView }) {
  const [view, setView] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)
  const [side, setSide] = useState<Side | null>(null)
  const [draft, setDraft] = useState<Draft>({ lot: ACCOUNT.MIN_LOT, slPips: null, tpPips: null, reasons: [] })
  const [revealFrom, setRevealFrom] = useState<number | undefined>()
  const [drawing, setDrawing] = useState(false)
  // A chart change is in flight: the screen still shows the old chart, so the
  // line tool is held until the new one arrives (lines belong to a chart).
  const [switching, setSwitching] = useState(false)
  const [drawn, setDrawn] = useState<{ session: string; prices: number[] } | null>(null)
  const [stageUp, setStageUp] = useState<number | null>(null)
  const [graduated, setGraduated] = useState(false)
  const tips = useTipQueue(initial.tipsSeen)

  const session = view.session
  // "Akun habis", decided on the server: no candle, order or new chart.
  const bust = view.account.bust
  const live = session !== null && !session.ended && session.remaining > 0 && !bust
  const lines = session && drawn?.session === session.id ? drawn.prices : view.lines
  const pipSize = session ? instrument(session.pair).pipSize : 0.0001

  // Where SL and TP start: the average candle range of the recent candles, so
  // a first SL sits outside ordinary noise. The player moves it from there.
  const recent = session?.candles.slice(-DISIPLIN.SL_CLOSE_RANGE_CANDLES) ?? []
  const avgRange = recent.length ? recent.reduce((s, c) => s + c.h - c.l, 0) / recent.length : 0
  const suggestedPips = Math.max(5, Math.round(avgRange / pipSize))

  const quote = side && session && live ? quoteFor(view, side, draft).quote : null
  const full = view.open.length >= view.stage.maxOpenTrades

  function apply(next: DemoView) {
    const before = view.session
    const grew = before && next.session && before.id === next.session.id && next.session.candles.length > before.candles.length
    setRevealFrom(grew ? before.candles.length : undefined)
    setView(next)
    for (const e of next.events) {
      if (e.kind === "xp") addServerXp(e.amount)
      if (e.kind === "stop_out") tips.trigger("stop-out")
      if (e.kind === "closed") tips.trigger("disiplin-score")
      if (e.kind === "opened" && e.revenge) tips.trigger("revenge-trading")
      if (e.kind === "opened" && e.noTp) tips.trigger("reward-risk")
      if (e.kind === "stage_up") setStageUp(e.stage)
      if (e.kind === "graduated") setGraduated(true)
    }
    if (next.events.some((e) => e.kind === "closed" || e.kind === "stop_out" || e.kind === "segment_end")) setPlaying(false)
  }

  async function call(path: string, body: object = {}) {
    setBusy(true)
    setError(null)
    const res = await postJson<{ view?: DemoView | null }>(`/api/akun-latihan/trade/${path}`, body)
    setBusy(false)
    if (res.view) apply(res.view)
    if (res.error) {
      setError(res.error)
      setPlaying(false)
      return false
    }
    return true
  }

  const next = () => void call("step")

  async function changeChart() {
    setSwitching(true)
    await call("session")
    setSwitching(false)
  }

  function changeDraft(d: Draft) {
    setDraft(d)
    if (side && session) {
      const { quote: q } = quoteFor(view, side, d)
      if (q.risk === "above" || q.risk === "danger") tips.trigger("risk-per-trade")
    }
  }

  function openPanel(s: Side) {
    setPlaying(false)
    setSide(s)
    if (side === null) {
      const fresh: Draft = { lot: view.stage.fixedLot ?? ACCOUNT.MIN_LOT, slPips: suggestedPips, tpPips: suggestedPips, reasons: [] }
      setDraft(fresh)
      tips.trigger("stop-loss")
      const { quote: q } = quoteFor(view, s, fresh)
      if (q.risk === "above" || q.risk === "danger") tips.trigger("risk-per-trade")
    }
  }

  async function submit() {
    if (!side) return
    const ok = await call("order", { side, lot: draft.lot, slPips: draft.slPips, tpPips: draft.tpPips, reasons: draft.reasons })
    if (ok) setSide(null)
  }

  function saveLines(prices: number[]) {
    if (!session) return
    setDrawn({ session: session.id, prices })
    void postJson("/api/akun-latihan/trade/lines", { session: session.id, prices }).then((r) => {
      if (r.error) setError(r.error)
    })
  }

  // Play: one candle per MS_PER_CANDLE ÷ speed, one request at a time.
  const tick = useEffectEvent(() => void call("step"))
  useEffect(() => {
    if (!playing || busy || !live) return
    const id = setTimeout(tick, REPLAY.MS_PER_CANDLE / speed)
    return () => clearTimeout(id)
  }, [playing, busy, live, speed])

  // Keyboard: N or → for the next candle, P to play or pause.
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null
    if (e.metaKey || e.ctrlKey || e.altKey || target?.closest("input, textarea, select, [contenteditable]")) return
    if ((e.key === "n" || e.key === "N" || e.key === "ArrowRight") && live && !busy) {
      e.preventDefault()
      next()
    } else if ((e.key === "p" || e.key === "P") && live) {
      setPlaying((p) => !p)
    }
  })
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e)
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const hasOpen = view.open.length > 0
  const hasClosed = view.closed.length > 0
  const planned = side !== null && draft.slPips !== null && draft.tpPips !== null && quote?.risk === "ok"
  const guide: GuideProgress = {
    looked: lines.length > 0 || side !== null || hasOpen || hasClosed,
    panelOpen: side !== null || hasOpen || hasClosed,
    reasons: draft.reasons.length > 0 || hasOpen || hasClosed,
    levels: planned || hasOpen || hasClosed,
    placed: hasOpen || hasClosed,
    closed: hasClosed,
    reviewed: view.closed.some((t) => t.review !== null),
  }

  if (!session) {
    return (
      <div className="glass-card flex flex-col items-center rounded-2xl px-6 py-12 text-center">
        <ChartIcon className="h-10 w-10 text-primary" aria-hidden="true" />
        <h2 className="mt-4 font-display text-xl font-bold">Siap trading?</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Rex memilih chart H4 historis dari pair di stage-mu. Kamu melihat {REPLAY.HISTORY_CANDLES} candle, lalu memutar maju
          candle demi candle.
        </p>
        {error && <p className="mt-3 text-sm text-primary">{error}</p>}
        <button type="button" onClick={() => void changeChart()} disabled={busy} className="btn mt-6">
          Mulai chart
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      {/* Left column on desktop. On a phone both columns dissolve into one
          list and `order` interleaves them: chart, controls, the order
          panel and Rex right under them, then the rest. */}
      <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-4">
        <section aria-label="Chart" className="glass-card order-1 rounded-2xl p-3 sm:p-4 lg:order-none">
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 px-1">
            <p className="font-display text-lg font-bold">{session.pair}</p>
            <p className="text-xs text-muted-foreground">
              {session.timeframe} · {session.period} · data historis
            </p>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                aria-pressed={drawing}
                onClick={() => setDrawing((d) => !d)}
                disabled={switching}
                className={[
                  "flex min-h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:opacity-40",
                  drawing ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <PencilLine className="h-3.5 w-3.5" aria-hidden="true" /> Garis
              </button>
              <button
                type="button"
                onClick={() => void changeChart()}
                disabled={busy || hasOpen || bust}
                title={hasOpen ? "Tutup trade yang terbuka dulu" : undefined}
                className="flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Ganti chart
              </button>
            </div>
          </div>
          <TradeChart
            candles={session.candles}
            digits={session.digits}
            open={view.open}
            closed={view.closed}
            draft={quote ? { sl: quote.sl, tp: quote.tp } : null}
            lines={lines}
            drawing={drawing && !switching}
            onLinesChange={saveLines}
            revealFrom={revealFrom}
          />
          {(drawing || lines.length > 0) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 px-1">
              {drawing && (
                <p className="mr-1 text-xs text-muted-foreground">Ketuk chart untuk menaruh garis, geser untuk memindahkan.</p>
              )}
              {lines.map((p, i) => (
                <span key={i} className="flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 py-0.5 pl-2.5 pr-1 font-mono text-xs text-primary">
                  {price(session.pair, p)}
                  <button
                    type="button"
                    onClick={() => saveLines(lines.filter((_, j) => j !== i))}
                    disabled={switching}
                    aria-label={`Hapus garis ${price(session.pair, p)}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-primary/20"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        <section aria-label="Kontrol replay" className="glass-card order-2 rounded-2xl p-3 sm:p-4 lg:order-none">
          {error && (
            <p role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {error}
            </p>
          )}
          {bust ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Rex size={44} mood="thinking" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Akun #{view.account.number} habis</p>
                <p className="text-sm text-muted-foreground">
                  Saldo {usd(view.account.figures.balance)} di bawah batas akun habis Stage {view.stage.current} (
                  {usd(view.account.bustLine)}) dan tidak ada trade terbuka. Tidak ada tombol tambah saldo: Rex sudah
                  menyiapkan review akunmu.
                </p>
              </div>
              <Link href="/akun-latihan" className="btn btn-sm shrink-0">
                Lihat review Rex <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : live ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={next} disabled={busy} className="btn btn-ghost btn-sm">
                  <SkipForward className="h-4 w-4" aria-hidden="true" /> Candle berikutnya
                </button>
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  aria-pressed={playing}
                  className="btn btn-ghost btn-sm"
                >
                  {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
                  {playing ? "Jeda" : "Putar"}
                </button>
                <div role="radiogroup" aria-label="Kecepatan" className="flex gap-1 rounded-xl bg-inset p-1">
                  {REPLAY.SPEEDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={speed === s}
                      onClick={() => setSpeed(s)}
                      className={[
                        "min-h-9 min-w-10 rounded-lg px-2 font-mono text-xs font-bold transition-colors",
                        speed === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
                <p className="ml-auto font-mono text-xs text-muted-foreground" aria-live="polite">
                  {session.remaining} candle tersisa
                </p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["buy", "sell"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => openPanel(s)}
                    disabled={busy || full}
                    aria-pressed={side === s}
                    className="btn"
                    style={sideStyle(s)}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={next}
                  disabled={busy}
                  className="btn"
                  style={
                    {
                      "--btn-bg": "var(--wait)",
                      "--btn-hover-bg": "color-mix(in srgb, var(--wait) 88%, white)",
                      "--btn-edge": "color-mix(in srgb, var(--wait) 55%, var(--shadow))",
                      "--btn-fg": "var(--primary-foreground)",
                    } as React.CSSProperties
                  }
                >
                  WAIT
                </button>
              </div>
              <p className="mt-2 text-[11px] text-faint">
                WAIT memajukan satu candle tanpa trading.
                {full && ` Stage ${view.stage.current}: maksimal ${view.stage.maxOpenTrades} trade terbuka.`} Tombol: N candle
                berikutnya, P putar/jeda.
              </p>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Segmen selesai</p>
                <p className="text-sm text-muted-foreground">Semua candle chart ini sudah diputar. Lanjut ke chart lain.</p>
              </div>
              <button type="button" onClick={() => void changeChart()} disabled={busy} className="btn btn-sm">
                Chart baru
              </button>
            </div>
          )}
        </section>

        {view.guide && (
          <div className="order-5 lg:order-none">
            <FirstTradeGuide progress={guide} />
          </div>
        )}
        <div className="order-8 lg:order-none">
          <ClosedTrades
            trades={view.closed}
            pair={session.pair}
            busy={busy}
            onReview={(id, answer: ReviewAnswer, note) => call("review", { trade: id, answer, note: note || null })}
          />
        </div>
      </div>

      {/* Right column on desktop. */}
      <div className="contents lg:flex lg:flex-col lg:gap-4">
        {graduated && (
          <section className="glass-card relative order-3 overflow-hidden rounded-2xl border-primary/40 p-4 lg:order-none">
            <Confetti />
            <div className="flex items-center gap-3">
              <Rex size={40} mood="happy" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold">Kamu lulus Akun Latihan!</p>
                <p className="text-sm text-muted-foreground">
                  Disiplinmu konsisten di Stage {view.stage.current}. Latihan tetap terbuka.
                </p>
              </div>
            </div>
            <Link href="/akun-latihan/lulus" className="btn btn-sm mt-3 w-full">
              <GraduationCap className="h-4 w-4" aria-hidden="true" /> Lihat ringkasan
            </Link>
          </section>
        )}
        {stageUp !== null && (
          <section className="glass-card relative order-3 overflow-hidden rounded-2xl border-primary/40 p-4 lg:order-none">
            <Confetti />
            <div className="flex items-center gap-3">
              <Rex size={40} mood="happy" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold">Stage {stageUp} terbuka!</p>
                <p className="text-sm text-muted-foreground">Aturan baru berlaku untuk trade berikutnya. Lihat kartu Stage.</p>
              </div>
              <button
                type="button"
                onClick={() => setStageUp(null)}
                aria-label="Tutup"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}
        {side && live && (
          <div className="order-3 lg:order-none">
            <OrderPanel
              view={view}
              side={side}
              draft={draft}
              onSide={setSide}
              onDraft={changeDraft}
              onSubmit={submit}
              onCancel={() => setSide(null)}
              busy={busy}
              suggestedPips={suggestedPips}
            />
          </div>
        )}
        {tips.current && (
          <div className="order-4 lg:order-none">
            <RexTipCard id={tips.current} onDismiss={tips.dismiss} />
          </div>
        )}
        <div className="order-6 lg:order-none">
          <AccountPanel view={view} />
        </div>
        <div className="order-7 lg:order-none">
          <OpenTrades
            trades={view.open}
            pair={session.pair}
            optional={!view.stage.slTpRequired}
            busy={busy}
            suggestedPips={suggestedPips}
            onClose={(id) => void call("close", { trade: id })}
            onModify={(id, field, pips) => call("modify", { trade: id, field, pips })}
          />
        </div>
        <div className="order-9 lg:order-none">
          <StageCard view={view} />
        </div>
      </div>
    </div>
  )
}
