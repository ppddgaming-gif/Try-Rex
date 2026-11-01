"use client"

import { useMemo, useState } from "react"
import { ArrowDownToLine, ArrowUpFromLine, Eraser, Minus, MousePointer2, Slash, Spline, Square, Trash2, Undo2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { INDICATOR_STYLE, LiveChart, type ChartCandle, type ChartLevel, type Tool } from "@/components/akun-latihan/live-chart"
import type { Bar } from "@/lib/assessment/types"
import { DRAWINGS } from "@/lib/live/config"
import type { Drawing } from "@/lib/live/drawings"
import { ema, INDICATORS, rsi, type IndicatorId, type Series } from "@/lib/live/indicators"
import { weekPosition } from "@/lib/live/time"
import { toggleIndicator, useIndicators } from "@/lib/live/use-indicators"

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
 * A scenario's chart as on the trading screen: the same LiveChart, drawing
 * tools and indicators (one priceToY for candles, drawings and levels). Times
 * are relative to Start, so labels read weekday and hour (UTC). Drawings and
 * indicators are aids only: nothing here is scored. The position tool's
 * starting size is deliberately small, so it never suggests an SL.
 */
export function ScenarioDesk({
  pair,
  digits,
  step,
  bars,
  context,
  levels,
  drawings,
  onDrawings,
  startLabel,
}: {
  pair: string
  digits: number
  step: number
  bars: Bar[]
  /** How many of `bars` came before Start. */
  context: number
  levels: ChartLevel[]
  drawings: Drawing[]
  onDrawings: (next: Drawing[]) => void
  startLabel: string
}) {
  const t = useTranslations("demo.ui.desk")
  const ta = useTranslations("assessment.scenario")
  const [tool, setTool] = useState<Tool>("select")
  const [selected, setSelected] = useState<string | null>(null)
  const [history, setHistory] = useState<Drawing[][]>([])
  const indicatorsOn = useIndicators()

  const anchor = bars[context - 1].t
  const candles: ChartCandle[] = useMemo(() => bars.map((b) => ({ t: b.t - anchor, o: b.o, h: b.h, l: b.l, c: b.c })), [bars, anchor])
  const indicators = useMemo(() => {
    const closes = bars.map((b) => b.c)
    const out: Partial<Record<IndicatorId, Series>> = {}
    if (indicatorsOn.includes("ema20")) out.ema20 = ema(closes, 20)
    if (indicatorsOn.includes("ema50")) out.ema50 = ema(closes, 50)
    if (indicatorsOn.includes("rsi14")) out.rsi14 = rsi(closes, 14)
    return out
  }, [bars, indicatorsOn])

  const commit = (next: Drawing[]) => {
    setHistory((h) => [...h.slice(-(DRAWINGS.UNDO - 1)), drawings])
    onDrawings(next.slice(-DRAWINGS.MAX))
  }
  const undo = () => {
    const prev = history[history.length - 1]
    if (!prev) return
    setHistory((h) => h.slice(0, -1))
    onDrawings(prev)
  }
  const removeSelected = () => {
    if (!selected) return
    commit(drawings.filter((d) => d.id !== selected))
    setSelected(null)
  }

  return (
    <section aria-label={t("chartLabel")} className="rounded-2xl border border-border bg-card p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="toolbar" aria-label={t("tools")} className="flex flex-wrap items-center gap-0.5 rounded-xl bg-inset p-0.5">
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
          <button type="button" onClick={() => commit([])} disabled={drawings.length === 0} aria-label={t("clear")} title={t("clear")} className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-35">
            <Eraser className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div role="group" aria-label={t("indicators")} className="flex items-center gap-0.5 rounded-xl bg-inset p-0.5 sm:ml-auto">
          <span className="px-1.5 text-[10px] font-semibold uppercase tracking-wide text-faint">{t("indicators")}</span>
          <span aria-hidden="true" className="mr-0.5 h-6 w-px bg-border" />
          {INDICATORS.map((id) => {
            const on = indicatorsOn.includes(id)
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleIndicator(id)}
                title={t(on ? "indicatorHide" : "indicatorShow", { name: INDICATOR_STYLE[id].label })}
                className={[
                  "flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-mono text-xs font-semibold transition-colors",
                  on ? "bg-muted text-foreground ring-1 ring-inset ring-primary" : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full border-2"
                  style={{ borderColor: INDICATOR_STYLE[id].color, background: on ? INDICATOR_STYLE[id].color : "transparent" }}
                />
                {INDICATOR_STYLE[id].label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-2">
        <LiveChart
          pair={pair}
          digits={digits}
          step={step}
          nowWeek={weekPosition(anchor)}
          candles={candles}
          levels={levels}
          indicators={indicators}
          drawings={drawings}
          tool={tool}
          selected={selected}
          onSelect={setSelected}
          onCommit={commit}
          onToolDone={() => setTool("select")}
          marker={bars.length > context ? { t: bars[context].t - anchor, label: startLabel } : undefined}
          positionSize={0.5}
        />
      </div>
      <p className="mt-2 text-[11px] text-faint">{ta("chartNote")}</p>
      <p className="mt-1 text-[11px] text-faint">{ta("toolsNote")}</p>
    </section>
  )
}
