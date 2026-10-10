import { useTranslations } from "next-intl"
import { GlowPanel, AspectMockup, RevealMockup, ChatMockup } from "./showcase"

/** Words: landing.features.<key>.eyebrow / .title / .body. */
type Feature = {
  key: string
  mockup: React.ReactNode
  reverse?: boolean
}

const features: Feature[] = [
  { key: "evaluation", mockup: <ChatMockup /> },
  { key: "game", mockup: <RevealMockup />, reverse: true },
  { key: "progress", mockup: <AspectMockup /> },
]

export function FeatureRows() {
  const t = useTranslations("landing.features")
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 pb-16 pt-4 lg:px-8 lg:pb-24 lg:pt-8">
      <div className="flex flex-col gap-16 lg:gap-28">
        {features.map((f) => (
          <div
            key={f.key}
            className="reveal grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
          >
            <div className={f.reverse ? "lg:order-2" : ""}>
              <p className="eyebrow">{t(`${f.key}.eyebrow`)}</p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                {t(`${f.key}.title`)}
              </h2>
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
                {t(`${f.key}.body`)}
              </p>
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
