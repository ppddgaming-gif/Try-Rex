import { useTranslations } from "next-intl"
import { FACTS } from "@/lib/landing-facts"
import { DemoMockup, ExplanationMockup, GlowPanel, LevelsMockup, RevealMockup } from "./showcase"

/** Words: landing.features.<key>.eyebrow / .title / .body / .points.<n>. */
type Feature = {
  key: string
  mockup: React.ReactNode
  /** How many bullet points the catalogue has under .points. */
  points: number
  reverse?: boolean
}

const features: Feature[] = [
  { key: "learn", mockup: <LevelsMockup />, points: 3 },
  { key: "game", mockup: <RevealMockup />, points: 3, reverse: true },
  { key: "explanation", mockup: <ExplanationMockup />, points: 3 },
  { key: "demo", mockup: <DemoMockup />, points: 4, reverse: true },
]

export function FeatureRows() {
  const t = useTranslations("landing.features")
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="reveal mx-auto max-w-2xl text-center">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
      </div>
      <div className="mt-16 flex flex-col gap-16 lg:gap-28">
        {features.map((f) => (
          <div key={f.key} className="reveal grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div className={f.reverse ? "lg:order-2" : ""}>
              <p className="eyebrow">{t(`${f.key}.eyebrow`)}</p>
              <h3 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{t(`${f.key}.title`)}</h3>
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">{t(`${f.key}.body`, FACTS)}</p>
              <ul className="mt-5 flex max-w-md flex-col gap-2.5">
                {Array.from({ length: f.points }, (_, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <span>{t(`${f.key}.points.${i + 1}`, FACTS)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={f.reverse ? "lg:order-1" : ""}>
              <GlowPanel className="reveal-tilt">{f.mockup}</GlowPanel>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
