import { BrainCircuit, CheckCircle2, Lightbulb, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card } from "@/components/card"
import { GlossaryText } from "@/components/glossary/glossary-text"
import { decisionLabels, type Decision } from "@/lib/mock-data"

/**
 * AI Explanation: why the answer is what it is, shown on the game page right
 * after an answer. The reasons and the suggestion are computed from the
 * question's own candles (challengeText), so they can't contradict the chart.
 */
export function AiExplanation({
  decision,
  correct,
  reasons,
  suggestion,
}: {
  decision: Decision
  correct: boolean
  reasons: string[]
  suggestion: string
}) {
  const t = useTranslations("game.explanation")
  const tone = correct ? "text-success" : "text-danger"
  const dot = correct ? "bg-success" : "bg-danger"

  return (
    <Card className="enter" style={{ "--enter-delay": "120ms" } as React.CSSProperties}>
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <BrainCircuit className="h-5 w-5 text-primary" aria-hidden="true" /> {t("title")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("lead")}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_minmax(0,380px)]">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            {correct ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-danger" />
            )}
            <span>
              <span className={tone}>{decisionLabels[decision]}</span> {correct ? t("rightBecause") : t("wrongBecause")}
            </span>
          </p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {reasons.map((r) => (
              <li key={r} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                <span>
                  <GlossaryText text={r} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="self-start rounded-xl border border-primary/30 bg-primary/10 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Lightbulb className="h-4 w-4" /> {t("suggestion")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            <GlossaryText text={suggestion} />
          </p>
        </div>
      </div>
    </Card>
  )
}
