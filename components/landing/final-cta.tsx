import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <div
        className="relative overflow-hidden rounded-3xl border border-border/60 px-6 py-20 text-center sm:py-28"
        style={{
          backgroundImage:
            "radial-gradient(100% 120% at 50% 120%, oklch(0.7 0.16 160 / 0.4) 0%, oklch(0.5 0.12 175 / 0.2) 40%, oklch(0.18 0.012 155 / 0.95) 80%)",
        }}
      >
        <div className="relative mx-auto max-w-2xl">
          <span className="text-4xl" aria-hidden="true">
            🦖
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">
            Mulai jadi trader yang konsisten hari ini
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Gratis untuk memulai. Latih satu challenge setiap hari dan biarkan TRY-REX memandumu.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
            >
              Mulai latihan gratis
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/trading-game"
              className="inline-flex w-full items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted sm:w-auto"
            >
              Coba Trading Game
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
