import { Clock, Star, Target } from "lucide-react"
import { Confetti } from "@/components/confetti"
import { Rex } from "@/components/rex-mascot"

function clock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/**
 * End of a round: the three numbers the player just earned, counted from this
 * round only. Rex is happy from a majority of right answers, otherwise he
 * thinks it over with you.
 */
export function RoundSummary({
  correct,
  total,
  xp,
  seconds,
}: {
  correct: number
  total: number
  xp: number
  seconds: number
}) {
  const good = correct * 2 > total

  return (
    <div
      className="enter glow-card relative rounded-2xl border border-primary/30 p-4"
      style={{ "--enter-delay": "120ms" } as React.CSSProperties}
    >
      {good && <Confetti />}
      <div className="flex items-center gap-3">
        <Rex size={44} mood={good ? "happy" : "thinking"} className={good ? "pop-in" : "float"} />
        <div className="min-w-0 leading-tight">
          <p className="eyebrow">Ronde selesai</p>
          <p className="mt-1 text-sm font-semibold">
            {good ? "Mantap, bacaan chart-mu makin tajam." : "Setiap soal yang meleset adalah bahan belajar."}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <SummaryStat icon={Target} label="Benar" value={`${correct}/${total}`} />
        <SummaryStat icon={Star} label="XP" value={`+${xp}`} tone={xp > 0 ? "text-warning" : undefined} />
        <SummaryStat icon={Clock} label="Waktu" value={clock(seconds)} />
      </dl>
    </div>
  )
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType
  label: string
  value: string
  tone?: string
}) {
  return (
    <div className="rounded-xl bg-inset px-2 py-2.5">
      <dt className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
        <Icon className="h-3 w-3" aria-hidden="true" /> {label}
      </dt>
      <dd className={`mt-1 font-mono text-lg font-bold tabular-nums ${tone ?? ""}`}>{value}</dd>
    </div>
  )
}
