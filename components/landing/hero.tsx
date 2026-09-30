import type { CSSProperties } from "react"
import Link from "next/link"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { GlowPanel, HeroShowcase } from "./showcase"

// The hero builds in on load, top to bottom, each line a beat after the last.
const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

export function Hero() {
  return (
    <section className="relative isolate mx-auto max-w-7xl px-5 pt-20 pb-10 lg:px-8 lg:pt-28">
      {/* Slow-drifting warm light behind the headline. */}
      <div className="aurora" aria-hidden="true" />
      <div className="mx-auto max-w-3xl text-center">
        <span
          className="enter glass-card inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground"
          style={delay(0)}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          AI Trading Mentor untuk trader pemula
        </span>

        <h1
          className="enter-focus mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          style={delay(80)}
        >
          Belajar trading dengan mentor AI yang tak pernah tidur
        </h1>

        <p
          className="enter mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={delay(160)}
        >
          TRY-REX mengevaluasi setiap keputusanmu, melatihmu lewat simulasi market nyata, dan membuatmu jadi
          trader yang konsisten—satu challenge setiap hari.
        </p>

        <div className="enter mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" style={delay(240)}>
          <Link href="/trading-game" className="btn btn-lg w-full sm:w-auto">
            Mulai latihan gratis
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <a href="#how" className="btn btn-ghost btn-lg w-full sm:w-auto">
            Lihat cara kerjanya
            <ArrowDown className="h-4 w-4 text-primary" />
          </a>
        </div>
        <p className="enter mt-4 text-xs text-faint" style={delay(300)}>
          Tanpa daftar, tanpa uang sungguhan. Langsung main.
        </p>
      </div>

      {/* Hero showcase: a real question from the game */}
      <div className="enter-focus mt-12" style={delay(360)}>
        <GlowPanel className="sm:py-12 lg:px-16">
          <HeroShowcase />
        </GlowPanel>
      </div>
    </section>
  )
}
