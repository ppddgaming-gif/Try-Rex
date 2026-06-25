import { Card } from "@/components/card"
import { XCircle } from "lucide-react"

export function EvalStatCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
        <p className="text-sm text-muted-foreground">Hasil Keputusan</p>
        <p className="mt-2 flex items-center gap-2 text-2xl font-extrabold text-danger">
          <XCircle className="h-6 w-6" /> SELL
        </p>
        <span className="mt-2 inline-block rounded-md bg-danger/15 px-2 py-0.5 text-xs font-semibold text-danger">
          Kurang Tepat
        </span>
      </Card>

      <Card>
        <p className="text-sm text-muted-foreground">Akurasi Keputusan</p>
        <p className="mt-2 text-3xl font-extrabold text-warning">55%</p>
        <p className="mt-2 text-xs text-muted-foreground">Di bawah rata-rata</p>
      </Card>

      <Card>
        <p className="text-sm text-muted-foreground">Score</p>
        <p className="mt-2 text-3xl font-extrabold text-primary">+20 XP</p>
        <p className="mt-2 text-xs text-muted-foreground">Total XP didapat</p>
      </Card>

      <Card>
        <p className="text-sm text-muted-foreground">Waktu Penyelesaian</p>
        <p className="mt-2 font-mono text-3xl font-extrabold">00:28</p>
        <p className="mt-2 text-xs text-muted-foreground">Menit : Detik</p>
      </Card>
    </div>
  )
}
