"use client"

import { useState } from "react"
import { ArrowRight, Check, LoaderCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { PublicMcq } from "@/lib/assessment/types"
import type { Locale } from "@/lib/i18n/locale"

/** One multiple-choice item. No feedback here: the review comes at the end of the package. */
export function McqItem({ item, busy, onAnswer }: { item: PublicMcq; busy: boolean; onAnswer: (choice: string[]) => void }) {
  const t = useTranslations("assessment.mcq")
  const locale = useLocale() as Locale
  const [picked, setPicked] = useState<string[]>([])
  const multiple = item.type === "mcq_complex"

  const toggle = (id: string) => setPicked((p) => (multiple ? (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]) : [id]))

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <p className="eyebrow">{multiple ? t("complex") : t("basic")}</p>
      <h2 className="mt-2 font-display text-lg font-bold leading-snug sm:text-xl">{item.question[locale]}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{multiple ? t("pickMany") : t("pickOne")}</p>
      <div role={multiple ? "group" : "radiogroup"} aria-label={item.question[locale]} className="mt-4 flex flex-col gap-2">
        {item.options.map((o) => {
          const on = picked.includes(o.id)
          return (
            <button
              key={o.id}
              type="button"
              role={multiple ? "checkbox" : "radio"}
              aria-checked={on}
              disabled={busy}
              onClick={() => toggle(o.id)}
              className={[
                "option flex min-h-11 items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-[15px] transition-colors",
                on ? "is-on border-primary bg-primary/10" : "border-border hover:border-primary/40",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center border-[1.5px] transition-colors",
                  multiple ? "rounded-md" : "rounded-full",
                  on ? "border-primary" : "border-faint",
                ].join(" ")}
              >
                {multiple ? on && <Check className="h-3.5 w-3.5 text-primary" /> : <span className={["radio-dot h-2.5 w-2.5 rounded-full bg-primary", on ? "is-on" : ""].join(" ")} />}
              </span>
              <span className="flex-1">{o.text[locale]}</span>
            </button>
          )
        })}
      </div>
      <div className="mt-5 flex justify-end">
        <button type="button" className="btn" disabled={busy || picked.length === 0} onClick={() => onAnswer(picked)}>
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null} {t("answer")} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  )
}
