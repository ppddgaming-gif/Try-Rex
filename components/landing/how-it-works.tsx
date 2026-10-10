import { Gamepad2, ScanSearch, TrendingUp } from "lucide-react"
import { useTranslations } from "next-intl"

// Words: landing.how.<key>.title / .body.
const steps = [
  { key: "s1", icon: Gamepad2, step: "01" },
  { key: "s2", icon: ScanSearch, step: "02" },
  { key: "s3", icon: TrendingUp, step: "03" },
]

export function HowItWorks() {
  const t = useTranslations("landing.how")
  return (
    <section id="how" className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            {t("body")}
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.step}
                className="reveal lift spotlight rounded-2xl border border-border bg-card p-6 hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-3xl font-extrabold text-muted">{s.step}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{t(`${s.key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`${s.key}.body`)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
