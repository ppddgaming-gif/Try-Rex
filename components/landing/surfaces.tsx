import Link from "next/link"
import { ArrowUpRight, BookA, BookOpen, Compass, Home, LineChart, Wallet } from "lucide-react"
import { useTranslations } from "next-intl"
import { FACTS } from "@/lib/landing-facts"

// Words: landing.surfaces.<key>.title / .body / .cta. In the order a new
// player meets them; every number in the copy comes from FACTS.
const surfaces = [
  { key: "start", icon: Compass, href: "/start" },
  { key: "learn", icon: BookOpen, href: "/belajar" },
  { key: "game", icon: LineChart, href: "/trading-game" },
  { key: "demo", icon: Wallet, href: "/akun-latihan" },
  { key: "dashboard", icon: Home, href: "/dashboard" },
  { key: "kamus", icon: BookA, href: "/belajar/kamus" },
]

export function Surfaces() {
  const t = useTranslations("landing.surfaces")
  return (
    <section id="product" className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{t("body")}</p>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {surfaces.map((s, i) => {
            const Icon = s.icon
            return (
              <li
                key={s.key}
                className="reveal lift spotlight flex flex-col rounded-2xl border border-border bg-card p-6 hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-2xl font-extrabold text-muted" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{t(`${s.key}.title`)}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t(`${s.key}.body`, FACTS)}</p>
                <Link
                  href={s.href}
                  className="group mt-6 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  {t(`${s.key}.cta`)}
                  <ArrowUpRight className="h-4 w-4 text-primary transition-transform duration-300 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
