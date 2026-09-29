import { Clock, Star, Target } from "lucide-react"

function clock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function QuestionProgress({
  index,
  answered,
  total,
  xp,
  correctCount,
  seconds,
}: {
  index: number
  /** Questions submitted so far, so the bar reaches 100% on the last answer. */
  answered: number
  total: number
  xp: number
  correctCount: number
  seconds: number
}) {
  const pct = Math.round((answered / total) * 100)

  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 sm:w-72">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">
          Soal <span className="font-bold text-primary">{index + 1}</span>{" "}
          <span className="text-muted-foreground">/ {total}</span>
        </span>
        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> {clock(seconds)}
        </span>
      </div>

      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progres challenge"
      >
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-warning">
          <Star className="h-3.5 w-3.5 fill-warning" /> {xp} XP
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Target className="h-3.5 w-3.5" /> {correctCount} benar
        </span>
      </div>
    </div>
  )
}
