import { Card } from "@/components/card"
import { TrendingUp, Clock, Shield, BarChart3, Star, StarHalf } from "lucide-react"

const aspects = [
  { label: "Trend Reading", value: 60, Icon: TrendingUp },
  { label: "Entry Timing", value: 40, Icon: Clock },
  { label: "Risk Management", value: 70, Icon: Shield },
  { label: "Market Structure", value: 60, Icon: BarChart3 },
]

function color(v: number) {
  if (v >= 70) return "text-success"
  if (v >= 60) return "text-warning"
  return "text-danger"
}

function Stars({ value }: { value: number }) {
  const score = value / 20 // out of 5
  const full = Math.floor(score)
  const half = score - full >= 0.5
  return (
    <div className="flex items-center gap-0.5 text-warning">
      {[0, 1, 2, 3, 4].map((i) => {
        if (i < full) return <Star key={i} className="h-4 w-4 fill-current" />
        if (i === full && half) return <StarHalf key={i} className="h-4 w-4 fill-current" />
        return <Star key={i} className="h-4 w-4 text-muted" />
      })}
    </div>
  )
}

export function AspectPerformance() {
  return (
    <Card>
      <h2 className="text-base font-semibold">Performa Aspek</h2>
      <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {aspects.map((a) => {
          const Icon = a.Icon
          return (
            <div key={a.label} className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-medium">{a.label}</p>
              </div>
              <div className="mt-3">
                <Stars value={a.value} />
              </div>
              <p className={`mt-2 text-sm font-bold ${color(a.value)}`}>{a.value}%</p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
