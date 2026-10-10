"use client"

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Clock,
  Eraser,
  GraduationCap,
  LoaderCircle,
  Minus,
  MousePointer2,
  Slash,
  Spline,
  Square,
  Trash2,
  Undo2,
} from "lucide-react"
import { AccountPanel, StageCard } from "@/components/akun-latihan/account-panel"
import { FirstTradeGuide, type GuideProgress } from "@/components/akun-latihan/first-trade-guide"
import { LiveChart, type ChartCandle, type ChartLevel, type Tool } from "@/components/akun-latihan/live-chart"
import { OpenTrades } from "@/components/akun-latihan/open-trades"
import { OrderPanel, quoteFor, sideStyle, type Draft, type Market } from "@/components/akun-latihan/order-panel"
import { usePostJson } from "@/components/akun-latihan/post-json"
import { RexTipCard, useTipQueue } from "@/components/akun-latihan/rex-tip"
import { ClosedTrades } from "@/components/akun-latihan/trade-result"
import { TutorialVideo } from "@/components/akun-latihan/tutorial-video"
import { Confetti } from "@/components/confetti"
import { Rex } from "@/components/rex-mascot"
import { ACCOUNT, DISIPLIN } from "@/lib/demo/config"
import { price as fmtPrice, usd } from "@/lib/demo/format"
import { instrument } from "@/lib/demo/instruments"
import type { Side } from "@/lib/demo/money"
import type { ReviewAnswer } from "@/lib/demo/state"
import type { DemoView } from "@/lib/demo/view"
import { DRAWINGS, LIVE, LIVE_PAIRS, TIMEFRAMES, type LivePair, type Timeframe } from "@/lib/live/config"
import { shiftDrawing, type Drawing } from "@/lib/live/drawings"
import { addServerXp } from "@/lib/progress/use-progress"

export type DeskChart = {
  digits: number
  step: number
  nowWeek: number
  /** Real unix seconds the relative times are measured from. */
  anchor: number
  candles: ChartCandle[]
  forming: ChartCandle | null
  closesIn: number | null
  market: { open: boolean; opensIn: number | null }
}
export type DeskQuote = { pair: string; open: boolean; opensIn: number | null; bid: number | null; ask: number | null }
export type DeskState = { pair: LivePair; timeframe: Timeframe; chart: DeskChart | null; drawings: Drawing[]; quote: DeskQuote }

type ChartResponse = { pair: LivePair; timeframe: Timeframe; chart: DeskChart | null; drawings: Drawing[] | null; view: DemoView; quote: DeskQuote }

const TOOLS: { id: Tool; icon: React.ElementType }[] = [
  { id: "select", icon: MousePointer2 },
  { id: "position-buy", icon: ArrowUpFromLine },
  { id: "position-sell", icon: ArrowDownToLine },
  { id: "trendline", icon: Slash },
  { id: "rectangle", icon: Square },
  { id: "hline", icon: Minus },
  { id: "path", icon: Spline },
]

const pad2 = (n: number) => String(n).padStart(2, "0")

/**
 * The live trading screen. The chart runs on real time: it asks the server
 * for "now" every LIVE.POLL_MS while the tab is visible, and the server
 * replays the account first (SL/TP hit while away, the market close). BUY and
 * SELL only (waiting is not pressing a button); the fill price is the
 * server's. Drawings are kept relative to the anchor of the chart they were
 * loaded with and shifted to the current one for display.
 */
export function TradingDesk({
  view: initialView,
  initial,
  available,
  videoSeen,
}: {
  view: DemoView
  initial: DeskState
  /** Pairs whose data exists. */
  available: string[]
  videoSeen: boolean
}) {
  const t = useTranslations("demo.ui.desk")
  const td = useTranslations("demo")
  const postJson = usePostJson()
  const [desk, setDesk] = useState(initial)
  const [view, setView] = useState(initialView)
  // Drawings live in the frame of `base` (the anchor they were loaded with).
  const [base, setBase] = useState(initial.chart?.anchor ?? 0)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [tool, setTool] = useState<Tool>("select")
  const [selected, setSelected] = useState<string | null>(null)
  const [history, setHistory] = useState<Drawing[][]>([])
  const [confirmClear, setConfirmClear] = useState(false)
  const [side, setSide] = useState<Side | null>(null)
  const [order, setOrder] = useState<Draft>({ lot: initialView.stage.fixedLot ?? ACCOUNT.MIN_LOT, slPips: null, tpPips: null, reasons: [] })
  const [stageUp, setStageUp] = useState<number | null>(null)
  const [graduated, setGraduated] = useState(false)
  // Seconds since the last answer, for the countdowns; advanced by a timer.
  const [elapsed, setElapsed] = useState(0)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<{ pair: LivePair; drawings: Drawing[]; anchor: number } | null>(null)
  const polling = useRef(false)
  const tips = useTipQueue(initialView.tipsSeen)

  const chart = desk.chart
  const shift = chart ? chart.anchor - base : 0
  const shown = useMemo(() => (shift ? desk.drawings.map((d) => shiftDrawing(d, -shift)) : desk.drawings), [desk.drawings, shift])
  const candles = useMemo(() => (chart ? (chart.forming ? [...chart.candles, chart.forming] : chart.candles) : []), [chart])
  const position = view.open[0] ?? null
  const bust = view.account.bust
  const quote = desk.quote
  const open = quote.open && quote.bid !== null
  const quotable = quote.ask !== null
  const pipSize = instrument(desk.pair).pipSize

  // Where SL and TP start: the recent average candle range, so a first SL sits outside ordinary noise.
  const recent = candles.slice(-DISIPLIN.SL_CLOSE_RANGE_CANDLES)
  const avgRange = recent.length ? recent.reduce((a, c) => a + c.h - c.l, 0) / recent.length : 0
  const suggestedPips = Math.max(5, Math.round(avgRange / pipSize))

  const market: Market | null =
    open && quote.bid !== null && quote.ask !== null ? { pair: desk.pair, price: quote.bid, ask: quote.ask, candlesLeft: Number.MAX_SAFE_INTEGER } : null

  const levels = useMemo<ChartLevel[]>(() => {
    if (!position || position.pair !== desk.pair) return []
    const out: ChartLevel[] = [{ kind: "entry", price: position.entry, label: `${position.side.toUpperCase()} · ${t("levelEntry")}` }]
    if (position.sl !== null) out.push({ kind: "sl", price: position.sl, label: "SL" })
    if (position.tp !== null) out.push({ kind: "tp", price: position.tp, label: "TP" })
    return out
  }, [position, desk.pair, t])

  /** A new view from the server: XP, tips, stage and graduation cards, closures while away. */
  function apply(next: DemoView) {
    setView(next)
    const closed: string[] = []
    for (const e of next.events) {
      if (e.kind === "xp") addServerXp(e.amount)
      if (e.kind === "stop_out") tips.trigger("stop-out")
      if (e.kind === "closed") {
        tips.trigger("disiplin-score")
        closed.push(t("closedWhileAway", { number: e.number, reason: td(`ui.exit.${e.reason}`) }))
      }
      if (e.kind === "opened" && e.revenge) tips.trigger("revenge-trading")
      if (e.kind === "stage_up") setStageUp(e.stage)
      if (e.kind === "graduated") setGraduated(true)
    }
    if (closed.length) setNotice(closed.join(" "))
  }

  function take(res: ChartResponse, withDrawings: boolean) {
    setDesk((d) => ({
      pair: res.pair,
      timeframe: res.timeframe,
      chart: res.chart,
      quote: res.quote,
      drawings: withDrawings && res.drawings ? res.drawings : d.drawings,
    }))
    if (withDrawings && res.chart) setBase(res.chart.anchor)
    setElapsed(0)
    apply(res.view)
  }

  async function load(pair: LivePair, timeframe: Timeframe) {
    if (pair === desk.pair && timeframe === desk.timeframe) return
    setLoading(true)
    setError(null)
    flushSave()
    const res = await postJson<ChartResponse>("/api/akun-latihan/chart", { pair, timeframe, drawings: true })
    setLoading(false)
    if (res.error) return setError(res.error)
    if (pair !== desk.pair) {
      // Another pair: its own drawings and its own undo history.
      setHistory([])
      setSelected(null)
      setSide(null)
    }
    take(res, true)
  }

  // Ask for "now" while the tab is visible; also right when the countdown runs out.
  const poll = useEffectEvent(async () => {
    if (polling.current || loading || document.visibilityState !== "visible") return
    polling.current = true
    const res = await postJson<ChartResponse>("/api/akun-latihan/chart", { pair: desk.pair, timeframe: desk.timeframe })
    polling.current = false
    if (res.error || res.pair !== desk.pair || res.timeframe !== desk.timeframe) return
    take(res, false)
  })
  useEffect(() => {
    const id = setInterval(() => void poll(), LIVE.POLL_MS)
    const onVisible = () => document.visibilityState === "visible" && void poll()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])
  const tick = useEffectEvent(() => {
    setElapsed((e) => e + 1)
    if (chart?.closesIn != null && chart.closesIn - elapsed <= 0) void poll()
  })
  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const save = useCallback(
    (p: { pair: LivePair; drawings: Drawing[]; anchor: number }) => {
      void postJson("/api/akun-latihan/drawings", p).then((r) => r.error && setError(r.error))
    },
    [postJson],
  )

  function flushSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (pending.current) save(pending.current)
    pending.current = null
  }

  function schedule(drawings: Drawing[]) {
    pending.current = { pair: desk.pair, drawings, anchor: base }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(flushSave, 600)
  }

  /** A change from the chart, in the displayed frame: back to the base frame, kept for undo, saved. */
  function commit(nextShown: Drawing[]) {
    const next = shift ? nextShown.map((d) => shiftDrawing(d, shift)) : nextShown
    setHistory((h) => [...h, desk.drawings].slice(-DRAWINGS.UNDO))
    setDesk((d) => ({ ...d, drawings: next }))
    schedule(next)
  }

  function undo() {
    const prev = history[history.length - 1]
    if (!prev) return
    setHistory((h) => h.slice(0, -1))
    setDesk((d) => ({ ...d, drawings: prev }))
    schedule(prev)
    if (selected && !prev.some((d) => d.id === selected)) setSelected(null)
  }

  function removeSelected() {
    if (!selected) return
    commit(shown.filter((d) => d.id !== selected))
    setSelected(null)
  }

  function clearAll() {
    if (desk.drawings.length > 0) commit([])
    setSelected(null)
    setConfirmClear(false)
  }

  // Save on the way out.
  useEffect(() => () => flushSave())

  // Delete removes the selected drawing; Ctrl/Cmd+Z undoes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable]")) return
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        e.preventDefault()
        removeSelected()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  async function call(path: string, body: object) {
    setBusy(true)
    setError(null)
    const res = await postJson<{ view?: DemoView | null }>(`/api/akun-latihan/trade/${path}`, body)
    setBusy(false)
    if (res.view) apply(res.view)
    if (res.error) {
      setError(res.error)
      return false
    }
    return true
  }

  function changeDraft(d: Draft) {
    setOrder(d)
    if (side && market) {
      const { quote: q } = quoteFor(view, market, side, d, true)
      if (q.risk === "above" || q.risk === "danger") tips.trigger("risk-per-trade")
    }
  }

  function openPanel(s: Side) {
    setSide(s)
    if (side === null) {
      const fresh: Draft = { ...order, lot: view.stage.fixedLot ?? order.lot, slPips: order.slPips ?? suggestedPips, tpPips: order.tpPips ?? suggestedPips }
      setOrder(fresh)
      tips.trigger("stop-loss")
      if (market) {
        const { quote: q } = quoteFor(view, market, s, fresh, true)
        if (q.risk === "above" || q.risk === "danger") tips.trigger("risk-per-trade")
      }
    }
  }

  async function submit() {
    if (!side) return
    const ok = await call("order", {
      pair: desk.pair,
      side,
      lot: order.lot,
      slPips: order.slPips,
      tpPips: order.tpPips,
      reasons: order.reasons,
    })
    if (ok) {
      setSide(null)
      setOrder((o) => ({ ...o, reasons: [] }))
    }
  }

  const duration = (s: number) => {
    const d = Math.floor(s / 86_400)
    const h = Math.floor((s % 86_400) / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (d > 0) return t("dur.days", { d, h })
    if (h > 0) return t("dur.hours", { h, m })
    return t("dur.minutes", { m: Math.max(1, m) })
  }
  const left = chart?.closesIn != null ? Math.max(0, chart.closesIn - elapsed) : null
  const opensIn = quote.opensIn != null ? Math.max(0, quote.opensIn - elapsed) : null

  const hasClosed = view.closed.length > 0
  const planned = side !== null && order.slPips !== null && order.tpPips !== null
  const guide: GuideProgress = {
    looked: desk.drawings.length > 0 || side !== null || position !== null || hasClosed,
    panelOpen: side !== null || position !== null || hasClosed,
    reasons: order.reasons.length > 0 || position !== null || hasClosed,
    levels: planned || position !== null || hasClosed,
    placed: position !== null || hasClosed,
    closed: hasClosed,
    reviewed: view.closed.some((c) => c.review !== null),
  }

  return (
    <div className="flex flex-col gap-4">
      <TutorialVideo seen={videoSeen} />

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <section aria-label={t("chartLabel")} className="glass-card rounded-2xl p-3 sm:p-4">
            {/* Pairs */}
            <div role="radiogroup" aria-label={t("pairs")} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
              {LIVE_PAIRS.map((p) => {
                const on = p === desk.pair
                const has = available.includes(p)
                const here = position?.pair === p
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={!has || loading}
                    onClick={() => load(p, desk.timeframe)}
                    title={!has ? t("noData") : here ? t("openOn", { n: 1 }) : undefined}
                    className={[
                      "relative flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3 font-mono text-xs font-semibold transition-colors disabled:opacity-40",
                      on ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {p}
                    {here && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                        <span className="sr-only">{t("openOn", { n: 1 })}</span>
                        <span aria-hidden="true">1</span>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Timeframe and tools */}
            <div className="flex flex-wrap items-center gap-2">
              <div role="radiogroup" aria-label={t("timeframe")} className="flex gap-0.5 rounded-xl bg-inset p-0.5">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    role="radio"
                    aria-checked={tf === desk.timeframe}
                    disabled={loading}
                    onClick={() => load(desk.pair, tf)}
                    className={[
                      "min-h-11 min-w-11 rounded-lg px-2 font-mono text-xs font-bold transition-colors",
                      tf === desk.timeframe ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              {loading && <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" aria-label={t("loading")} />}

              <div role="toolbar" aria-label={t("tools")} className="flex flex-wrap items-center gap-0.5 rounded-xl bg-inset p-0.5 sm:ml-auto">
                {TOOLS.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={tool === id}
                    onClick={() => setTool(id)}
                    aria-label={t(`tool.${id}`)}
                    title={t(`tool.${id}`)}
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-lg transition-colors",
                      tool === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
                <span aria-hidden="true" className="mx-0.5 h-6 w-px bg-border" />
                <button type="button" onClick={undo} disabled={history.length === 0} aria-label={t("undo")} title={t("undo")} className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-35">
                  <Undo2 className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={removeSelected} disabled={!selected} aria-label={t("delete")} title={t("delete")} className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-35">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setConfirmClear(true)} disabled={desk.drawings.length === 0} aria-label={t("clear")} title={t("clear")} className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-35">
                  <Eraser className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {confirmClear && (
              <div role="alertdialog" aria-label={t("clear")} className="pop-in mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
                <span className="flex-1">{t("clearConfirm", { n: desk.drawings.length, pair: desk.pair })}</span>
                <button type="button" onClick={clearAll} className="btn btn-sm">
                  {t("clearYes")}
                </button>
                <button type="button" onClick={() => setConfirmClear(false)} className="btn btn-ghost btn-sm">
                  {t("cancel")}
                </button>
              </div>
            )}

            {/* Market status and the forming candle's countdown. */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" aria-live="polite">
              <span className={["inline-flex items-center gap-1.5 font-semibold", open ? "text-foreground" : "text-muted-foreground"].join(" ")}>
                <span aria-hidden="true" className={["h-2 w-2 rounded-full", open ? "bg-primary" : "bg-faint"].join(" ")} />
                {open ? t("marketOpen") : t("marketClosed")}
              </span>
              {open && left !== null && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("closesIn", { time: `${pad2(Math.floor(left / 60))}:${pad2(left % 60)}` })}
                </span>
              )}
              {!open && opensIn !== null && <span className="text-muted-foreground">{t("opensIn", { time: duration(opensIn) })}</span>}
              {quote.bid !== null && quote.ask !== null && (
                <span className="font-mono text-muted-foreground sm:ml-auto">
                  {t("bidAsk", { bid: fmtPrice(desk.pair, quote.bid), ask: fmtPrice(desk.pair, quote.ask) })}
                </span>
              )}
            </div>

            <div className="mt-2">
              {chart && candles.length > 0 ? (
                <LiveChart
                  pair={desk.pair}
                  digits={chart.digits}
                  step={chart.step}
                  nowWeek={chart.nowWeek}
                  candles={candles}
                  levels={levels}
                  drawings={shown}
                  tool={tool}
                  selected={selected}
                  onSelect={setSelected}
                  onCommit={commit}
                  onToolDone={() => setTool("select")}
                />
              ) : (
                <p className="flex h-[320px] items-center justify-center rounded-xl bg-inset text-sm text-muted-foreground">{t("noData")}</p>
              )}
            </div>
            <p className="mt-2 text-[11px] text-faint">{t("liveNote")}</p>
            <p className="mt-1 text-[11px] text-faint">{t("toolsNote")}</p>
          </section>

          {notice && (
            <p role="status" className="flex items-start gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
              <Rex size={28} mood="thinking" className="shrink-0" />
              <span className="flex-1">{notice}</span>
              <button type="button" onClick={() => setNotice(null)} className="btn btn-ghost btn-sm">
                {t("cancel")}
              </button>
            </p>
          )}

          {/* BUY and SELL only: waiting is not pressing a button. */}
          <section aria-label={t("orderLabel")} className="glass-card rounded-2xl p-3 sm:p-4">
            {error && (
              <p role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {error}
              </p>
            )}
            {bust ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Rex size={44} mood="thinking" className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{t("bustTitle", { n: view.account.number })}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("bustBody", { balance: usd(view.account.figures.balance), stage: view.stage.current, line: usd(view.account.bustLine) })}
                  </p>
                </div>
                <Link href="/akun-latihan" className="btn btn-sm shrink-0">
                  {t("seeReview")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {(["buy", "sell"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => openPanel(s)}
                      disabled={!market || position !== null || busy}
                      aria-pressed={side === s}
                      className="btn"
                      style={sideStyle(s)}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-faint">
                  {position ? t("closeFirst") : t("noWait", { risk: DISIPLIN.MAX_RISK_PCT })}
                </p>
                <p className="mt-1 text-[11px] text-faint">{t("rulesNote")}</p>
              </>
            )}
          </section>

          {view.guide && <FirstTradeGuide progress={guide} />}

          <ClosedTrades
            trades={view.closed}
            pair={view.closed[0]?.pair ?? desk.pair}
            busy={busy}
            onReview={(id, answer: ReviewAnswer, note) => call("review", { trade: id, answer, note: note || null })}
          />
        </div>

        <div className="flex flex-col gap-4">
          {graduated && (
            <section className="glass-card relative overflow-hidden rounded-2xl border-primary/40 p-4">
              <Confetti />
              <div className="flex items-center gap-3">
                <Rex size={40} mood="happy" className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold">{t("graduatedTitle")}</p>
                  <p className="text-sm text-muted-foreground">{t("graduatedBody", { n: view.stage.current })}</p>
                </div>
              </div>
              <Link href="/akun-latihan/lulus" className="btn btn-sm mt-3 w-full">
                <GraduationCap className="h-4 w-4" aria-hidden="true" /> {t("summary")}
              </Link>
            </section>
          )}
          {stageUp !== null && (
            <section className="glass-card relative overflow-hidden rounded-2xl border-primary/40 p-4">
              <Confetti />
              <div className="flex items-center gap-3">
                <Rex size={40} mood="happy" className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold">{t("stageUpTitle", { n: stageUp })}</p>
                  <p className="text-sm text-muted-foreground">{t("stageUpBody")}</p>
                </div>
              </div>
            </section>
          )}
          {tips.current && <RexTipCard id={tips.current} onDismiss={tips.dismiss} />}

          {side && !position && (market && quotable ? (
            <OrderPanel
              view={view}
              market={market}
              requireSlTp
              side={side}
              draft={order}
              onSide={setSide}
              onDraft={changeDraft}
              onSubmit={submit}
              onCancel={() => setSide(null)}
              busy={busy}
              suggestedPips={suggestedPips}
            />
          ) : (
            <p className="glass-card rounded-2xl p-4 text-sm text-muted-foreground">
              {quotable ? t("marketClosed") : t("costsMissing", { pair: desk.pair })}
            </p>
          ))}

          {position && position.pair !== desk.pair && (
            <p className="glass-card flex flex-wrap items-center gap-2 rounded-2xl p-4 text-sm">
              <span className="flex-1">{t("positionOn", { pair: position.pair })}</span>
              <button type="button" onClick={() => load(position.pair as LivePair, desk.timeframe)} className="btn btn-ghost btn-sm">
                {t("showPair", { pair: position.pair })}
              </button>
            </p>
          )}
          <OpenTrades
            trades={view.open}
            pair={position?.pair ?? desk.pair}
            optional={false}
            busy={busy}
            suggestedPips={suggestedPips}
            onClose={(id) => void call("close", { trade: id })}
            onModify={(id, field, pips) => call("modify", { trade: id, field, pips })}
          />
          <AccountPanel view={view} />
          <StageCard view={view} />
        </div>
      </div>
    </div>
  )
}
