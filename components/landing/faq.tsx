import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import { FACTS } from "@/lib/landing-facts"

// Words: landing.faq.items.<key>.q / .a. Native <details>, so the answers
// open without any client code.
const items = ["money", "broker", "data", "account", "demo", "scoring", "language"]

export function Faq() {
  const t = useTranslations("landing.faq")
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="reveal text-center">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
      </div>
      <div className="mt-10 flex flex-col gap-3">
        {items.map((key) => (
          <details key={key} className="reveal group rounded-2xl border border-border bg-card px-5 py-1 open:border-primary/40">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
              <span>{t(`items.${key}.q`)}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{t(`items.${key}.a`, FACTS)}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
