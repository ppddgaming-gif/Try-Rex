import { AlertTriangle, Lightbulb, Quote } from "lucide-react"
import { CandlestickChart } from "@/components/candlestick-chart"
import { GlossaryParts } from "@/components/glossary/glossary-text"
import { DIAGRAMS } from "@/components/learn/diagrams"
import { Quiz } from "@/components/learn/quiz"
import { splitTerms } from "@/lib/glossary"
import { chartFor } from "@/lib/learn/charts"
import type { Block } from "@/lib/learn/types"
import { frameOf } from "@/lib/mock-data"

// Red and green mean price direction only, so warnings are amber and tips
// the calm blue-grey.
const calloutStyle = {
  tip: { icon: Lightbulb, box: "border-wait/30 bg-wait/10", title: "text-wait" },
  warning: { icon: AlertTriangle, box: "border-primary/40 bg-primary/10", title: "text-primary" },
  example: { icon: Quote, box: "border-border bg-inset", title: "text-foreground" },
} as const

/** Renders a lesson's content blocks, top to bottom, with tappable terms. */
export function LessonBlocks({ blocks }: { blocks: Block[] }) {
  // One set for the whole lesson: each term is underlined where it first
  // appears, not again in every paragraph.
  const seen = new Set<string>()
  const terms = (text: string) => <GlossaryParts parts={splitTerms(text, seen)} />

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((b, i) => {
        const delay = { "--rise": "20px" } as React.CSSProperties
        switch (b.kind) {
          case "p":
            return (
              <p key={i} className="reveal text-[17px] leading-[1.75] text-foreground/90" style={delay}>
                {terms(b.text)}
              </p>
            )
          case "heading":
            return (
              <h2 key={i} className="reveal mt-2 text-xl font-bold">
                {b.text}
              </h2>
            )
          case "points":
            return (
              <div key={i} className="reveal rounded-2xl border border-border bg-card p-5">
                {b.title && <p className="mb-3 font-display font-bold">{b.title}</p>}
                <ul className="flex flex-col gap-2.5">
                  {b.items.map((it) => (
                    <li key={it} className="flex gap-3 text-[15px] leading-relaxed text-foreground/90">
                      <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>
                        {terms(it)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          case "callout": {
            const s = calloutStyle[b.tone]
            return (
              <aside key={i} className={`reveal rounded-2xl border p-5 ${s.box}`}>
                <p className={`flex items-center gap-2 font-display font-bold ${s.title}`}>
                  <s.icon className="h-4 w-4" aria-hidden="true" /> {b.title}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
                  {terms(b.text)}
                </p>
              </aside>
            )
          }
          case "diagram": {
            const D = DIAGRAMS[b.name]
            return (
              <div key={i} className="reveal">
                <D />
              </div>
            )
          }
          case "chart": {
            const c = chartFor(b.pick)
            const candles = b.reveal ? [...c.candles, ...c.future] : c.candles
            const frame = frameOf(candles)
            return (
              <figure key={i} className="reveal rounded-2xl border border-border bg-card p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md border border-border bg-muted/40 px-2 py-1 font-semibold">{c.pair}</span>
                  <span className="rounded-md border border-border bg-muted/40 px-2 py-1 font-semibold">{c.timeframe}</span>
                  <span className="text-muted-foreground">{c.period} · data harga asli</span>
                </div>
                {/* Fixed height: the chart stretches to its box, text included. */}
                <div className="h-[220px] sm:h-[280px]">
                  <CandlestickChart
                    candles={candles}
                    min={frame.min}
                    max={frame.max}
                    priceTicks={frame.priceTicks}
                    timeLabels={b.reveal ? c.revealTimeLabels : c.timeLabels}
                    zones={c.zones}
                    digits={c.digits}
                    currentPrice={b.reveal ? undefined : c.currentPrice}
                    dividerAt={b.reveal ? c.candles.length : undefined}
                  />
                </div>
                <figcaption className="mt-2 text-xs text-muted-foreground">{b.caption}</figcaption>
              </figure>
            )
          }
          case "quiz":
            return (
              <div key={i} className="reveal">
                <Quiz question={b.question} options={b.options} answer={b.answer} explain={b.explain} />
              </div>
            )
        }
      })}
    </div>
  )
}
