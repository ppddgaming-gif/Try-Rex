import { Card } from "@/components/card"
import { GlossaryText } from "@/components/glossary/glossary-text"
import { RexMascot } from "@/components/rex-mascot"
import { CheckCircle2, Lightbulb, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { decisionLabels, type Decision } from "@/lib/mock-data"

export function Explanation({
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
  const tone = correct ? "text-success" : "text-danger"
  const dot = correct ? "bg-success" : "bg-danger"
  const t = useTranslations("evaluation.explanation")

  return (
    <Card className="relative flex h-full flex-col overflow-hidden">
      <h2 className="text-base font-semibold">{t("title")}</h2>

      <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          {correct ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-danger" />
          )}
          <span>
            <span className={tone}>{decisionLabels[decision]}</span>{" "}
            {correct ? t("rightBecause") : t("wrongBecause")}
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

      <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Lightbulb className="h-4 w-4" /> {t("suggestion")}
        </p>
        {/* Right padding keeps the text clear of Rex in the corner. */}
        <p className="mt-2 pr-16 text-sm leading-relaxed text-foreground/90 sm:pr-20">
          <GlossaryText text={suggestion} />
        </p>
      </div>

      <RexMascot mood={correct ? "happy" : "sad"} className="absolute -bottom-2 right-0 opacity-90" />
    </Card>
  )
}
