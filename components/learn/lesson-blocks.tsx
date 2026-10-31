import { AlertTriangle, BookMarked, Calculator, HelpCircle, Lightbulb, Quote } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { CandlestickChart } from "@/components/candlestick-chart"
import { GlossaryParts } from "@/components/glossary/glossary-text"
import { DIAGRAMS } from "@/components/learn/diagrams"
import { CHART, PLOT_W, candleX, frameOf, priceToY } from "@/lib/chart-geometry"
import { periodLabel, timeLabel } from "@/lib/challenge-text"
import { splitTerms } from "@/lib/glossary"
import type { Locale } from "@/lib/i18n/locale"
import { chartFor, type LearnChart, type Panel } from "@/lib/learn/charts"
import type { Block, Text } from "@/lib/learn/types"

// Red and green mean price direction only, so warnings are amber, tips the
// calm blue-grey, definitions plain.
const calloutStyle = {
  definition: { icon: BookMarked, box: "border-border bg-card", title: "text-foreground" },
  tip: { icon: Lightbulb, box: "border-wait/30 bg-wait/10", title: "text-wait" },
  warning: { icon: AlertTriangle, box: "border-primary/40 bg-primary/10", title: "text-primary" },
  note: { icon: Quote, box: "border-border bg-inset", title: "text-foreground" },
} as const

const LINE_COLOR = { ema20: "var(--ind-ema20)", ema50: "var(--ind-ema50)" } as const

/**
 * A lesson's blocks, top to bottom, in the page's language, with tappable
 * glossary terms. Server component: charts are built here from real
 * historical candles and never shipped as data.
 */
export function LessonBlocks({ blocks }: { blocks: Block[] }) {
  const locale = useLocale() as Locale
  const t = useTranslations("learn")
  // One set for the whole lesson: each term is underlined where it first appears.
  const seen = new Set<string>()
  const say = (text: Text) => text[locale]
  const terms = (text: Text) => <GlossaryParts parts={splitTerms(say(text), locale, seen)} />

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "p":
            return (
              <p key={i} className="reveal text-[17px] leading-[1.75] text-foreground/90">
                {terms(b.text)}
              </p>
            )
          case "heading":
            return (
              <h2 key={i} className="reveal mt-2 text-xl font-bold">
                {say(b.text)}
              </h2>
            )
          case "points":
          case "steps": {
            const List = b.kind === "steps" ? "ol" : "ul"
            return (
              <div key={i} className="reveal rounded-2xl border border-border bg-card p-5">
                {b.title && <p className="mb-3 font-display font-bold">{say(b.title)}</p>}
                <List className="flex flex-col gap-2.5">
                  {b.items.map((it, k) => (
                    <li key={k} className="flex gap-3 text-[15px] leading-relaxed text-foreground/90">
                      {b.kind === "steps" ? (
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary">
                          {k + 1}
                        </span>
                      ) : (
                        <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      <span>{terms(it)}</span>
                    </li>
                  ))}
                </List>
              </div>
            )
          }
          case "callout": {
            const s = calloutStyle[b.tone]
            return (
              <aside key={i} className={`reveal rounded-2xl border p-5 ${s.box}`}>
                <p className={`flex items-center gap-2 font-display font-bold ${s.title}`}>
                  <s.icon className="h-4 w-4 shrink-0" aria-hidden="true" /> {say(b.title)}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{terms(b.text)}</p>
              </aside>
            )
          }
          case "calc":
            return (
              <figure key={i} className="reveal rounded-2xl border border-border bg-inset p-5">
                <figcaption className="flex items-center gap-2 font-display font-bold">
                  <Calculator className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {say(b.title)}
                </figcaption>
                <ol className="mt-3 flex flex-col gap-1.5 font-mono text-[13px] leading-relaxed tabular-nums text-foreground/90">
                  {b.lines.map((l, k) => (
                    <li key={k}>{say(l)}</li>
                  ))}
                </ol>
                {b.note && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{say(b.note)}</p>}
              </figure>
            )
          case "table":
            return (
              <figure key={i} className="reveal">
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                    <thead className="bg-inset">
                      <tr>
                        {b.head.map((h, k) => (
                          <th key={k} scope="col" className="px-4 py-2.5 font-semibold text-foreground">
                            {say(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b.rows.map((row, r) => (
                        <tr key={r} className="border-t border-border">
                          {row.map((cell, k) => (
                            <td key={k} className={["px-4 py-2.5 align-top leading-relaxed", k === 0 ? "font-semibold text-foreground" : "text-foreground/85"].join(" ")}>
                              {say(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {b.note && <figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">{say(b.note)}</figcaption>}
              </figure>
            )
          case "diagram": {
            const D = DIAGRAMS[b.name]
            return (
              <div key={i} className="reveal">
                <D />
              </div>
            )
          }
          case "chart":
            return <LearnChartFigure key={i} chart={chartFor(b.pick)} caption={say(b.caption)} locale={locale} realLabel={(period) => t("chart.real", { period })} />
          case "check":
            return (
              <section key={i} className="reveal rounded-2xl border border-primary/30 p-5" aria-label={t("check.title")}>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <HelpCircle className="h-4 w-4" aria-hidden="true" /> {t("check.title")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{t("check.hint")}</p>
                <div className="mt-3 flex flex-col gap-2">
                  {b.items.map((it, k) => (
                    <details key={k} className="group rounded-xl border border-border bg-card px-4 py-3">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                        <span>{say(it.q)}</span>
                        <span className="shrink-0 text-xs font-semibold text-primary group-open:hidden">{t("check.show")}</span>
                      </summary>
                      <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{say(it.a)}</p>
                    </details>
                  ))}
                </div>
              </section>
            )
        }
      })}
    </div>
  )
}

/** One real chart (or two, for timeframes) with every overlay computed from its candles. */
function LearnChartFigure({ chart, caption, locale, realLabel }: { chart: LearnChart; caption: string; locale: Locale; realLabel: (period: string) => string }) {
  return (
    <figure className="reveal rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md border border-border bg-muted/40 px-2 py-1 font-mono font-semibold">
          {chart.pair.slice(0, 3)}/{chart.pair.slice(3)}
        </span>
        {chart.panels.length === 1 && <span className="rounded-md border border-border bg-muted/40 px-2 py-1 font-semibold">{chart.timeframe}</span>}
        <span className="text-muted-foreground">{realLabel(periodLabel(chart.start, locale))}</span>
      </div>
      <div className={chart.panels.length > 1 ? "flex flex-col gap-4" : ""}>
        {chart.panels.map((p, k) => (
          <PanelChart key={k} panel={p} chart={chart} locale={locale} small={chart.panels.length > 1} />
        ))}
      </div>
      {chart.sub && <SubChart chart={chart} />}
      <figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">{caption}</figcaption>
    </figure>
  )
}

function PanelChart({ panel, chart, locale, small }: { panel: Panel; chart: LearnChart; locale: Locale; small: boolean }) {
  const n = panel.candles.length
  const extra = [
    ...(chart.lines ?? []).flatMap((l) => l.values.filter((v): v is number => v !== null)),
    ...(chart.trendline ? [chart.trendline.p1 + ((chart.trendline.p2 - chart.trendline.p1) / (chart.trendline.i2 - chart.trendline.i1)) * (n - 1 - chart.trendline.i1)] : []),
  ]
  const frame = frameOf(panel.candles, extra)
  const y = (p: number) => priceToY(p, frame.min, frame.max)
  const x = (i: number) => candleX(i, n)
  const tl = chart.trendline
  const overlay = (
    <g>
      {chart.lines?.map((line) => {
        const d = line.values
          .map((v, i) => (v === null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`))
          .filter(Boolean)
          .join(" ")
        return <polyline key={line.id} points={d} fill="none" stroke={LINE_COLOR[line.id]} strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
      })}
      {tl && (
        <line
          x1={x(tl.i1)}
          y1={y(tl.p1)}
          x2={x(n - 1)}
          y2={y(tl.p1 + ((tl.p2 - tl.p1) / (tl.i2 - tl.i1)) * (n - 1 - tl.i1))}
          stroke="var(--primary)"
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
        />
      )}
      {chart.swings?.map((s) => (
        <g key={`${s.kind}-${s.index}`}>
          <circle cx={x(s.index)} cy={y(s.price)} r={4} fill={s.kind === "high" ? "var(--primary)" : "var(--wait)"} />
          {s.label && (
            <text x={x(s.index)} y={y(s.price) + (s.kind === "high" ? -10 : 20)} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--foreground)" fontFamily="var(--font-mono)">
              {s.label}
            </text>
          )}
        </g>
      ))}
    </g>
  )
  return (
    <div>
      {panel.label && <p className="mb-1 font-mono text-xs font-semibold text-muted-foreground">{panel.label}</p>}
      {/* Fixed height: the chart stretches to its box, text included. */}
      <div className={small ? "h-[180px] sm:h-[220px]" : "h-[220px] sm:h-[280px]"}>
        <CandlestickChart
          candles={panel.candles}
          min={frame.min}
          max={frame.max}
          priceTicks={frame.priceTicks}
          timeLabels={panel.times.map((s) => timeLabel(s, locale))}
          zones={chart.zones}
          digits={chart.digits}
          overlay={overlay}
        />
      </div>
      {chart.lines && (
        <p className="mt-1 flex gap-4 font-mono text-[11px]">
          {chart.lines.map((l) => (
            <span key={l.id} style={{ color: LINE_COLOR[l.id] }}>
              {l.id === "ema20" ? "EMA 20" : "EMA 50"}
            </span>
          ))}
        </p>
      )}
    </div>
  )
}

/** RSI or ATR under the chart: same width and candle positions as the chart above (candleX), its own 0–max scale. */
function SubChart({ chart }: { chart: LearnChart }) {
  const sub = chart.sub!
  const n = sub.values.length
  const H = 140
  const top = 10
  const bottom = 14
  const y = (v: number) => top + ((sub.max - v) / (sub.max - sub.min)) * (H - top - bottom)
  const points = sub.values
    .map((v, i) => (v === null ? null : `${candleX(i, n).toFixed(1)},${y(v).toFixed(1)}`))
    .filter(Boolean)
    .join(" ")
  const ticks = sub.guides.length ? sub.guides : [sub.min, (sub.min + sub.max) / 2, sub.max]
  const last = [...sub.values].reverse().find((v): v is number => v !== null)
  return (
    <div className="mt-1 h-[90px] sm:h-[110px]">
      <svg viewBox={`0 0 ${CHART.W} ${H}`} className="h-full w-full" preserveAspectRatio="none" role="img" aria-label={sub.kind === "rsi" ? "RSI 14" : "ATR 14"}>
        {ticks.map((g) => (
          <g key={g}>
            <line x1={0} x2={PLOT_W} y1={y(g)} y2={y(g)} stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
            <text x={PLOT_W + 8} y={y(g) + 4} fontSize={11} fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
              {g}
            </text>
          </g>
        ))}
        <polyline points={points} fill="none" stroke={sub.kind === "rsi" ? "var(--ind-rsi)" : "var(--ind-ema20)"} strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        <text x={8} y={top + 12} fontSize={12} fontWeight={700} fill={sub.kind === "rsi" ? "var(--ind-rsi)" : "var(--ind-ema20)"} fontFamily="var(--font-mono)">
          {sub.kind === "rsi" ? "RSI 14" : "ATR 14 (pip)"} {last !== undefined ? last.toFixed(sub.kind === "rsi" ? 1 : 1) : ""}
        </text>
      </svg>
    </div>
  )
}
