import { Ban, ChartCandlestick, ListChecks, Wallet } from "lucide-react"
import { useTranslations } from "next-intl"
import { RexArt } from "@/components/rex-mascot"
import { FACTS } from "@/lib/landing-facts"

// Words: landing.about.<key>.title / .body.
const points = [
  { key: "real", icon: ChartCandlestick },
  { key: "virtual", icon: Wallet },
  { key: "process", icon: ListChecks },
  { key: "notBroker", icon: Ban },
]

/** What TRY-REX is, and what it deliberately is not. */
export function About() {
  const t = useTranslations("landing.about")
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="reveal">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{t("body")}</p>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{t("body2")}</p>
          <RexArt size={120} mood="explain" className="mt-6 hidden lg:block" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {points.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.key} className="reveal spotlight rounded-2xl border border-border bg-card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{t(`${p.key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`${p.key}.body`, FACTS)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
