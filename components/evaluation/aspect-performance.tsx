import { Card } from "@/components/card"
import { BarChart3, Clock, Shield, Star, StarHalf, TrendingUp } from "lucide-react"
import type { AspectKey } from "@/lib/mock-data"

const icons: Record<string, React.ElementType> = {
  trend: TrendingUp,
  entry: Clock,
  risk: Shield,
  structure: BarChart3,
}

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
    <div className="flex items-center gap-0.5 text-warning" aria-label={`${score.toFixed(1)} dari 5 bintang`}>
      {[0, 1, 2, 3, 4].map((i) => {
        if (i < full) return <Star key={i} className="h-4 w-4 fill-current" />
        if (i === full && half) return <StarHalf key={i} className="h-4 w-4 fill-current" />
        return <Star key={i} className="h-4 w-4 text-muted" />
      })}
    </div>
  )
}

export function AspectPerformance({
  aspects,
  focus,
}: {
  aspects: { key: string; label: string; value: number }[]
  /** The aspect this challenge tested — called out so the score shift is legible. */
  focus: AspectKey
}) {
  return (
    <Card>
      <h2 className="text-base font-semibold">Performa Aspek</h2>
      <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {aspects.map((a) => {
          const Icon = icons[a.key] ?? BarChart3
          const isFocus = a.key === focus
          return (
            <div key={a.key} className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    isFocus ? "bg-primary/15 ring-1 ring-primary/30" : "bg-muted",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-medium">{a.label}</p>
              </div>
              <div className="mt-3">
                <Stars value={a.value} />
              </div>
              <p className={`mt-2 text-sm font-bold ${color(a.value)}`}>{a.value}%</p>
              {isFocus && (
                <span className="mt-1 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Diuji di soal ini
                </span>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
