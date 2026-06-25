import { Card } from "@/components/card"
import { aspectMetrics } from "@/lib/mock-data"
import { TrendingUp, Clock, Shield, BarChart3, ChevronRight } from "lucide-react"

const icons = {
  trend: TrendingUp,
  entry: Clock,
  risk: Shield,
  structure: BarChart3,
}

function barColor(v: number) {
  if (v >= 70) return "var(--success)"
  if (v >= 60) return "var(--warning)"
  return "var(--warning)"
}

export function AspectPanel() {
  return (
    <Card className="flex flex-col">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <BarChart3 className="h-4 w-4 text-primary" />
        Pemahaman Berdasarkan Aspek
      </h2>

      <div className="mt-5 flex flex-col gap-5">
        {aspectMetrics.map((m) => {
          const Icon = icons[m.key as keyof typeof icons]
          return (
            <div key={m.key} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{m.label}</p>
                  <span className="text-sm font-semibold">{m.value}%</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{m.desc}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${m.value}%`, background: barColor(m.value) }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button className="mt-5 flex items-center justify-center gap-1 rounded-lg border border-border bg-muted/40 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
        Lihat Detail <ChevronRight className="h-4 w-4" />
      </button>
    </Card>
  )
}
