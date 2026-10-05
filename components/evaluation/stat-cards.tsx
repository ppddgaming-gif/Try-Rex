import { Card } from "@/components/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { decisionLabels, type Decision } from "@/lib/mock-data"

function clock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/**
 * The four numbers for one evaluated answer. Nothing here compares against
 * other players (there is no real average to compare with), and a zero shows
 * as "—" with a hint rather than as a big 0.
 */
export function EvalStatCards({
  decision,
  correct,
  accuracy,
  xp,
  seconds,
}: {
  decision: Decision
  correct: boolean
  accuracy: number
  xp: number
  /** null when the time wasn't passed from the game. */
  seconds: number | null
}) {
  const tone = correct ? "text-success" : "text-danger"

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card tour="eval-result">
        <p className="text-sm text-muted-foreground">Hasil Keputusan</p>
        <p className={`mt-2 flex items-center gap-2 text-2xl font-extrabold ${tone}`}>
          {correct ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
          {decisionLabels[decision]}
        </p>
        <span
          className={[
            "mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-semibold",
            correct ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
          ].join(" ")}
        >
          {correct ? "Tepat" : "Kurang Tepat"}
        </span>
      </Card>

      <Card tour="eval-score">
        <p className="text-sm text-muted-foreground">Akurasi Keputusan</p>
        <p
          className={`mt-2 font-mono text-3xl font-extrabold tabular-nums ${accuracy >= 70 ? "text-success" : "text-warning"}`}
        >
          {accuracy}%
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Dari besarnya gerak harga sesudahnya</p>
      </Card>

      <Card>
        <p className="text-sm text-muted-foreground">XP</p>
        {xp > 0 ? (
          <>
            <p className="mt-2 font-mono text-3xl font-extrabold tabular-nums text-primary">+{xp}</p>
            <p className="mt-2 text-xs text-muted-foreground">Didapat dari soal ini</p>
          </>
        ) : (
          <>
            <p className="mt-2 font-mono text-3xl font-extrabold text-muted-foreground">—</p>
            <p className="mt-2 text-xs text-muted-foreground">Jawaban kurang tepat tidak memberi XP</p>
          </>
        )}
      </Card>

      <Card>
        <p className="text-sm text-muted-foreground">Waktu Penyelesaian</p>
        {seconds !== null ? (
          <>
            <p className="mt-2 font-mono text-3xl font-extrabold tabular-nums">{clock(seconds)}</p>
            <p className="mt-2 text-xs text-muted-foreground">Menit : Detik</p>
          </>
        ) : (
          <>
            <p className="mt-2 font-mono text-3xl font-extrabold text-muted-foreground">—</p>
            <p className="mt-2 text-xs text-muted-foreground">Mainkan soal untuk mencatat waktumu</p>
          </>
        )}
      </Card>
    </div>
  )
}
