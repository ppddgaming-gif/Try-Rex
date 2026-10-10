import { Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { Rex } from "@/components/rex-mascot"
import { DISIPLIN, PLAN } from "@/lib/demo/config"

export type GuideProgress = {
  looked: boolean
  panelOpen: boolean
  reasons: boolean
  levels: boolean
  placed: boolean
  closed: boolean
  reviewed: boolean
}

/**
 * The first trade, step by step. Each step ticks off as the player does it;
 * Rex's tips appear at the moments they matter along the way.
 */
export function FirstTradeGuide({ progress }: { progress: GuideProgress }) {
  const t = useTranslations("demo.ui.guide")
  const values = { min: PLAN.MIN_REASONS, max: PLAN.MAX_REASONS, risk: DISIPLIN.MAX_RISK_PCT }
  const keys: (keyof GuideProgress)[] = ["looked", "panelOpen", "reasons", "levels", "placed", "closed", "reviewed"]
  const steps = keys.map((key) => [key, t(key, values)] as const)
  const next = steps.findIndex(([key]) => !progress[key])

  return (
    <section aria-labelledby="guide-title" className="glass-card rounded-2xl border-primary/40 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Rex size={36} mood="thinking" className="shrink-0" />
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="guide-title" className="font-display font-bold leading-tight">
            {t("title")}
          </h2>
        </div>
      </div>
      <ol className="mt-3 flex flex-col gap-1.5">
        {steps.map(([key, text], i) => {
          const done = progress[key]
          const current = i === next
          return (
            <li
              key={key}
              aria-current={current ? "step" : undefined}
              className={[
                "flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm",
                current ? "bg-primary/10 font-semibold" : done ? "text-muted-foreground" : "text-faint",
              ].join(" ")}
            >
              <span
                className={[
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  done ? "bg-primary text-primary-foreground" : current ? "border border-primary text-primary" : "border border-border",
                ].join(" ")}
              >
                {done ? <Check className="h-3 w-3" aria-label={t("done")} /> : i + 1}
              </span>
              {text}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
