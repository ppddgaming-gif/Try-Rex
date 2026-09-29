import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Rex } from "@/components/rex-mascot"

export function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <div
        className="relative overflow-hidden rounded-3xl border border-border/60 px-6 py-20 text-center sm:py-28"
        style={{
          backgroundImage:
            "radial-gradient(100% 120% at 50% 120%, color-mix(in srgb, var(--primary) 32%, transparent) 0%, color-mix(in srgb, var(--primary-dim) 22%, transparent) 40%, color-mix(in srgb, var(--card) 95%, transparent) 80%)",
        }}
      >
        <div className="relative mx-auto max-w-2xl">
          <Rex size={60} className="mx-auto" />
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">
            Mulai jadi trader yang konsisten hari ini
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Gratis untuk memulai. Latih satu challenge setiap hari dan biarkan TRY-REX memandumu.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="btn btn-lg w-full sm:w-auto"
            >
              Mulai latihan gratis
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/trading-game"
              className="btn btn-ghost btn-lg w-full sm:w-auto"
            >
              Coba Trading Game
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
