import Link from "next/link"
import { ArrowUpRight, Play } from "lucide-react"
import { GlowPanel, ChatMockup } from "./showcase"

export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 pt-20 pb-10 lg:px-8 lg:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          AI Trading Mentor untuk trader pemula
        </span>

        <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          Belajar trading dengan mentor AI yang tak pernah tidur
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          TRY-REX mengevaluasi setiap keputusanmu, melatihmu lewat simulasi market nyata, dan membuatmu jadi
          trader yang konsisten—satu challenge setiap hari.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/trading-game"
            className="btn btn-lg w-full sm:w-auto"
          >
            Mulai latihan gratis
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/trading-game"
            className="btn btn-ghost btn-lg w-full sm:w-auto"
          >
            <Play className="h-4 w-4 text-primary" />
            Coba Trading Game
          </Link>
        </div>
      </div>

      {/* Hero showcase */}
      <div className="mt-14">
        <GlowPanel className="py-12 sm:py-16">
          <ChatMockup />
        </GlowPanel>
      </div>
    </section>
  )
}
