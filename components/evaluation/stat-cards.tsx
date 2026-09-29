import { Card } from "@/components/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { decisionLabels, type Decision } from "@/lib/mock-data"

function clock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

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
  seconds: number
}) {
  const tone = correct ? "text-success" : "text-danger"

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
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

      <Card>
        <p className="text-sm text-muted-foreground">Akurasi Keputusan</p>
        <p className={`mt-2 text-3xl font-extrabold ${accuracy >= 70 ? "text-success" : "text-warning"}`}>
          {accuracy}%
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {accuracy >= 70 ? "Di atas rata-rata" : "Di bawah rata-rata"}
        </p>
      </Card>

      <Card>
        <p className="text-sm text-muted-foreground">Score</p>
        <p className="mt-2 text-3xl font-extrabold text-primary">+{xp} XP</p>
        <p className="mt-2 text-xs text-muted-foreground">Total XP didapat</p>
      </Card>

      <Card>
        <p className="text-sm text-muted-foreground">Waktu Penyelesaian</p>
        <p className="mt-2 font-mono text-3xl font-extrabold">{clock(seconds)}</p>
        <p className="mt-2 text-xs text-muted-foreground">Menit : Detik</p>
      </Card>
    </div>
  )
}
