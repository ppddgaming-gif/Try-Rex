import { CheckCircle2, Star, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { GlossaryText } from "@/components/glossary/glossary-text"
import { RexArt } from "@/components/rex-mascot"

/**
 * The verdict after an answer. Rex reacts (happy or grimacing) and the
 * explanation's trading terms are tappable, so a wrong answer turns straight
 * into a lesson.
 */
export function AnswerFeedback({
  correct,
  xp,
  message,
  answerLabel,
}: {
  correct: boolean
  xp: number
  message: string
  answerLabel: string
}) {
  const t = useTranslations("game.feedbackCard")
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "enter relative overflow-hidden rounded-2xl border p-4",
        correct ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <RexArt size={56} mood={correct ? "happy" : "sad"} className="pop-in -ml-1 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className={`flex items-center gap-2 text-sm font-bold ${correct ? "text-success" : "text-danger"}`}>
              {correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {correct ? t("correct") : t("incorrect")}
            </p>
            {xp > 0 && (
              <span className="pop-in flex items-center gap-1 text-xs font-bold text-warning" style={{ "--enter-delay": "200ms" } as React.CSSProperties}>
                <Star className="h-3.5 w-3.5 fill-warning" /> +{xp} XP
              </span>
            )}
          </div>

          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
            <GlossaryText text={message} />
          </p>

          {!correct && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t.rich("rightAnswer", { answer: answerLabel, b: (c) => <span className="font-semibold text-foreground">{c}</span> })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
