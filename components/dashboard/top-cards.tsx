import { Card } from "@/components/card"
import { Donut } from "@/components/donut"
import { Sparkline } from "@/components/sparkline"
import { TrendingUp, Trophy, Target } from "lucide-react"

export function TopCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Overall Understanding
            </p>
            <p className="mt-3 text-4xl font-extrabold text-primary">68%</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Level: <span className="text-foreground">Intermediate</span>
            </p>
          </div>
          <Donut value={68} />
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4 text-primary" />
              Total Challenges
            </p>
            <p className="mt-3 text-4xl font-extrabold">48</p>
            <p className="mt-2 text-xs text-muted-foreground">Selesai</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Sparkline data={[20, 22, 19, 26, 24, 30, 28, 36, 40]} />
            <span className="font-mono text-xs font-bold text-success">↑ 12% dari minggu lalu</span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4 text-warning" />
              Accuracy
            </p>
            <p className="mt-3 text-4xl font-extrabold text-warning">72%</p>
            <p className="mt-2 text-xs text-muted-foreground">Rata-rata Akurasi</p>
            <p className="mt-1 text-xs font-semibold text-primary">↑ 8% dari minggu lalu</p>
          </div>
          <Donut value={72} color="var(--warning)" />
        </div>
      </Card>
    </div>
  )
}
