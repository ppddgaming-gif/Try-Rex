import { Clock, Flame, Star, Target } from "lucide-react"

function clock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/**
 * One segment per question: answered ones show right or wrong, the current
 * one is amber, the rest wait on the track. The round reads at a glance.
 */
export function QuestionProgress({
  index,
  results,
  total,
  xp,
  seconds,
}: {
  index: number
  /** Right/wrong for each submitted question, in order. */
  results: boolean[]
  total: number
  xp: number
  seconds: number
}) {
  const correct = results.filter(Boolean).length
  // Right answers in a row, counted back from the latest.
  let combo = 0
  for (let i = results.length - 1; i >= 0 && results[i]; i--) combo++

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">
          Soal{" "}
          <span className="font-mono">
            <span className="font-bold text-primary">{index + 1}</span>
            <span className="text-muted-foreground">/{total}</span>
          </span>
        </span>
        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Waktu</span> {clock(seconds)}
        </span>
      </div>

      <ol
        className="mt-3 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
        aria-label={`${results.length} dari ${total} soal dijawab, ${correct} benar`}
      >
        {Array.from({ length: total }, (_, i) => {
          const done = i < results.length
          const tone = done ? (results[i] ? "bg-success" : "bg-danger") : i === index ? "bg-primary" : "bg-muted"
          return (
            <li
              key={i}
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-colors duration-500 ${tone} ${!done && i === index ? "opacity-70" : ""}`}
            />
          )
        })}
      </ol>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-warning">
          <Star className="h-3.5 w-3.5 fill-warning" aria-hidden="true" /> <span className="font-mono">{xp}</span> XP
        </span>
        {combo >= 2 ? (
          // Keyed by the count so each new link in the chain pops again.
          <span
            key={combo}
            className="pop-in shimmer flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-semibold text-primary"
          >
            <Flame className="flicker h-3.5 w-3.5 fill-primary" aria-hidden="true" />
            <span className="font-mono">{combo}x</span> beruntun
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Target className="h-3.5 w-3.5" aria-hidden="true" /> <span className="font-mono">{correct}</span> benar
          </span>
        )}
      </div>
    </div>
  )
}
