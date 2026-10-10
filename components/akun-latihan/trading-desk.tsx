"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Eraser,
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
import { LiveChart, type ChartCandle, type Tool } from "@/components/akun-latihan/live-chart"
import { OrderPanel, sideStyle, type Draft, type Market } from "@/components/akun-latihan/order-panel"
import { usePostJson } from "@/components/akun-latihan/post-json"
import { TutorialVideo } from "@/components/akun-latihan/tutorial-video"
import { ACCOUNT, COSTS, DISIPLIN } from "@/lib/demo/config"
import { baseToUsd, instrument, quoteToUsd } from "@/lib/demo/instruments"
import type { Side } from "@/lib/demo/money"
import type { DemoView } from "@/lib/demo/view"
import { DRAWINGS, LIVE_PAIRS, TIMEFRAMES, type LivePair, type Timeframe } from "@/lib/live/config"
import type { Drawing } from "@/lib/live/drawings"

export type DeskChart = { digits: number; step: number; nowWeek: number; candles: ChartCandle[] }
export type DeskState = { pair: LivePair; timeframe: Timeframe; chart: DeskChart | null; drawings: Drawing[] }

/** Pairs whose costs and USD conversion are configured; others can be charted but not quoted. */
function quotable(pair: string) {
  if (COSTS.SPREAD_PIPS[pair] === undefined) return false
  try {
    baseToUsd(pair, 1)
    quoteToUsd(pair, 1)
    return true
  } catch {
    return false
  }
}

const TOOLS: { id: Tool; icon: React.ElementType }[] = [
  { id: "select", icon: MousePointer2 },
  { id: "position-buy", icon: ArrowUpFromLine },
  { id: "position-sell", icon: ArrowDownToLine },
  { id: "trendline", icon: Slash },
  { id: "rectangle", icon: Square },
  { id: "hline", icon: Minus },
  { id: "path", icon: Spline },
]

/**
 * The trading screen: pick one of nine pairs (the last one is remembered),
 * switch timeframe without losing drawings, draw, and plan a BUY or SELL.
 * There is no WAIT: waiting is not pressing a button. Opening a position
 * needs the live engine (next stage), so the order panel's confirm is off
 * for now and says so.
 */
export function TradingDesk({
  view,
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
  const postJson = usePostJson()
  const [desk, setDesk] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tool, setTool] = useState<Tool>("select")
  const [selected, setSelected] = useState<string | null>(null)
  const [history, setHistory] = useState<Drawing[][]>([])
  const [confirmClear, setConfirmClear] = useState(false)
  const [side, setSide] = useState<Side | null>(null)
  const [order, setOrder] = useState<Draft>({ lot: view.stage.fixedLot ?? ACCOUNT.MIN_LOT, slPips: null, tpPips: null, reasons: [] })
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const chart = desk.chart
  const last = chart?.candles[chart.candles.length - 1]

  /** Positions open on each pair (from the account), for the picker's markers. */
  const openByPair = view.open.reduce<Record<string, number>>((acc, tr) => {
    acc[tr.pair] = (acc[tr.pair] ?? 0) + 1
    return acc
  }, {})

  async function load(pair: LivePair, timeframe: Timeframe) {
    if (pair === desk.pair && timeframe === desk.timeframe) return
    setLoading(true)
    setError(null)
    flushSave()
    const res = await postJson<DeskState>("/api/akun-latihan/chart", { pair, timeframe })
    setLoading(false)
    if (res.error) return setError(res.error)
    if (pair !== desk.pair) {
      // Another pair: its own drawings and its own undo history.
      setHistory([])
      setSelected(null)
      setSide(null)
    }
    setDesk({ pair: res.pair, timeframe: res.timeframe, chart: res.chart, drawings: res.drawings })
  }

  const save = useCallback(
    (pair: LivePair, drawings: Drawing[]) => {
      void postJson("/api/akun-latihan/drawings", { pair, drawings }).then((r) => r.error && setError(r.error))
    },
    [postJson],
  )

  const pending = useRef<{ pair: LivePair; drawings: Drawing[] } | null>(null)
  function flushSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (pending.current) save(pending.current.pair, pending.current.drawings)
    pending.current = null
  }

  function commit(next: Drawing[]) {
    setHistory((h) => [...h, desk.drawings].slice(-DRAWINGS.UNDO))
    setDesk((d) => ({ ...d, drawings: next }))
    pending.current = { pair: desk.pair, drawings: next }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(flushSave, 600)
  }

  function undo() {
    const prev = history[history.length - 1]
    if (!prev) return
    setHistory((h) => h.slice(0, -1))
    setDesk((d) => ({ ...d, drawings: prev }))
    pending.current = { pair: desk.pair, drawings: prev }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(flushSave, 600)
    if (selected && !prev.some((d) => d.id === selected)) setSelected(null)
  }

  function removeSelected() {
    if (!selected) return
    commit(desk.drawings.filter((d) => d.id !== selected))
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

  function openPanel(s: Side) {
    setSide(s)
    // Neutral start: SL and TP one recent candle range away, which the player moves.
    if (chart && order.slPips === null) {
      const recent = chart.candles.slice(-14)
      const range = recent.length ? recent.reduce((a, c) => a + c.h - c.l, 0) / recent.length : 0
      const pips = Math.max(5, Math.round(range / instrument(desk.pair).pipSize))
      setOrder((o) => ({ ...o, slPips: pips, tpPips: pips }))
    }
  }

  const market: Market | null = last ? { pair: desk.pair, price: last.c, candlesLeft: Number.MAX_SAFE_INTEGER } : null

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
                const open = openByPair[p] ?? 0
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={!has || loading}
                    onClick={() => load(p, desk.timeframe)}
                    title={!has ? t("noData") : open > 0 ? t("openOn", { n: open }) : undefined}
                    className={[
                      "relative flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3 font-mono text-xs font-semibold transition-colors disabled:opacity-40",
                      on ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {p}
                    {open > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                        <span className="sr-only">{t("openOn", { n: open })}</span>
                        <span aria-hidden="true">{open}</span>
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

            <div className="mt-2">
              {chart && chart.candles.length > 0 ? (
                <LiveChart
                  pair={desk.pair}
                  digits={chart.digits}
                  step={chart.step}
                  nowWeek={chart.nowWeek}
                  candles={chart.candles}
                  drawings={desk.drawings}
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
            <p className="mt-2 text-[11px] text-faint">{t("toolsNote")}</p>
            {error && (
              <p role="alert" className="mt-2 text-sm text-primary">
                {error}
              </p>
            )}
          </section>

          {/* BUY and SELL only: waiting is not pressing a button. */}
          <section aria-label={t("orderLabel")} className="glass-card rounded-2xl p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-2">
              {(["buy", "sell"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => openPanel(s)}
                  disabled={!market}
                  aria-pressed={side === s}
                  className="btn"
                  style={sideStyle(s)}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-faint">{t("noWait", { risk: DISIPLIN.MAX_RISK_PCT })}</p>
          </section>
        </div>

        <div className="flex flex-col gap-4">
          {side && market && (quotable(desk.pair) ? (
            <OrderPanel
              view={view}
              market={market}
              requireSlTp
              submitNote={t("engineSoon")}
              side={side}
              draft={order}
              onSide={setSide}
              onDraft={setOrder}
              onSubmit={() => undefined}
              onCancel={() => setSide(null)}
              busy={false}
              suggestedPips={order.slPips ?? 10}
            />
          ) : (
            <p className="glass-card rounded-2xl p-4 text-sm text-muted-foreground">{t("costsMissing", { pair: desk.pair })}</p>
          ))}
          <AccountPanel view={view} />
          <StageCard view={view} />
        </div>
      </div>
    </div>
  )
}
