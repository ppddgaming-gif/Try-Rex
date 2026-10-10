import Link from "next/link"
import { Home, LineChart, BrainCircuit, ArrowUpRight, BookOpen } from "lucide-react"
import { useTranslations } from "next-intl"

// Words: landing.surfaces.<key>.title / .body / .cta.
const surfaces = [
  { key: "dashboard", icon: Home, href: "/dashboard" },
  { key: "game", icon: LineChart, href: "/trading-game" },
  { key: "evaluation", icon: BrainCircuit, href: "/ai-evaluation" },
  { key: "learn", icon: BookOpen, href: "/belajar" },
]

export function Surfaces() {
  const t = useTranslations("landing.surfaces")
  return (
    <section id="product" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="reveal mx-auto max-w-2xl text-center">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          {t("body")}
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {surfaces.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.key}
              className="reveal lift spotlight flex flex-col rounded-2xl border border-border bg-card p-6 hover:border-primary/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{t(`${s.key}.title`)}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t(`${s.key}.body`)}</p>
              <Link
                href={s.href}
                className="group mt-6 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
              >
                {t(`${s.key}.cta`)}
                <ArrowUpRight className="h-4 w-4 text-primary transition-transform duration-300 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}
