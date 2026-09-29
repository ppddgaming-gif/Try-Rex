import { CheckCircle2, Star, XCircle } from "lucide-react"

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
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "enter rounded-xl border p-4",
        correct ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={`flex items-center gap-2 text-sm font-bold ${correct ? "text-success" : "text-danger"}`}>
          {correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          {correct ? "Tepat!" : "Kurang tepat"}
        </p>
        <span className="flex items-center gap-1 text-xs font-bold text-warning">
          <Star className="h-3.5 w-3.5 fill-warning" /> +{xp} XP
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{message}</p>

      {!correct && (
        <p className="mt-2 text-xs text-muted-foreground">
          Jawaban yang tepat: <span className="font-semibold text-foreground">{answerLabel}</span>
        </p>
      )}
    </div>
  )
}
