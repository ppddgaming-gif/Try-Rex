import Link from "next/link"
import { Card } from "@/components/card"
import { CandlestickChart } from "@/components/candlestick-chart"
import { ChevronRight, Star, Target } from "lucide-react"
import { frameOf, type Challenge } from "@/lib/mock-data"

const levelLabels: Record<string, string> = { easy: "Mudah", medium: "Menengah", hard: "Sulit" }

export function DailyChallenge({ challenge }: { challenge: Challenge }) {
  const preview = challenge.candles.slice(-24)
  const frame = frameOf(preview)

  return (
    <Card className="flex flex-col">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Target className="h-4 w-4 text-primary" />
        Tantangan Hari Ini
      </h2>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
            Daily Challenge
          </span>
          <h3 className="mt-2 text-lg font-bold">
            {challenge.pair} &ndash; {challenge.timeframe}
          </h3>
          <p className="text-xs text-muted-foreground">{challenge.period}</p>
          <p className="mt-1 text-sm text-muted-foreground">{challenge.situation}</p>
        </div>
        <div className="hidden h-20 w-40 shrink-0 overflow-hidden rounded-lg border border-border sm:block">
          <CandlestickChart
            candles={preview}
            min={frame.min}
            max={frame.max}
            priceTicks={[]}
            timeLabels={[]}
            zones={challenge.zones}
            digits={challenge.digits}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-8">
        <div>
          <p className="text-xs text-muted-foreground">Reward</p>
          <p className="mt-1 flex items-center gap-1 text-sm font-bold text-warning">
            <Star className="h-4 w-4 fill-warning text-warning" /> +{challenge.xp} XP
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Difficulty</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex gap-1" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`h-2 w-3 rounded-sm ${i <= challenge.difficulty ? "bg-warning" : "bg-muted"}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {levelLabels[challenge.level] ?? challenge.level}
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/trading-game"
        className="mt-5 flex items-center justify-center gap-1 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Mulai Tantangan <ChevronRight className="h-4 w-4" />
      </Link>
    </Card>
  )
}
