import Link from "next/link"
import { ActivityList } from "@/components/activity-list"
import { Card } from "@/components/card"
import { CandlestickChart } from "@/components/candlestick-chart"
import { Disclosure } from "@/components/disclosure"
import { AspectPerformance } from "@/components/evaluation/aspect-performance"
import { EvalStatCards } from "@/components/evaluation/stat-cards"
import { Explanation } from "@/components/evaluation/explanation"
import {
  aspectScoresFor,
  challengeById,
  challenges,
  decisionLabels,
  frameOf,
  isDecision,
  recentActivities,
  scoreFor,
  tradePlanFor,
  type Decision,
} from "@/lib/mock-data"
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  GitCommitHorizontal,
  History,
  Pause,
  RotateCcw,
} from "lucide-react"

type Search = { c?: string; a?: string; t?: string }

const decisionIcons: Record<Decision, React.ElementType> = {
  buy: ArrowUpRight,
  sell: ArrowDown,
  wait: Pause,
}

export default async function AiEvaluationPage({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  const sp = await searchParams

  // Driven by the Trading Game handoff (?c=id&a=decision&t=seconds), with a
  // representative fallback so the page still stands alone.
  const challenge = challengeById(sp.c) ?? challenges[0]
  const decision: Decision = isDecision(sp.a) ? sp.a : "sell"
  const parsedTime = Number(sp.t)
  const seconds = Number.isFinite(parsedTime) && parsedTime >= 0 ? Math.floor(parsedTime) : 28

  const { correct, xp, accuracy } = scoreFor(challenge, decision)
  // The review chart shows what the question hid: history plus the 15 future candles.
  const revealed = [...challenge.candles, ...challenge.future]
  const frame = frameOf(revealed)
  const DecisionIcon = decisionIcons[decision]

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Evaluation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Evaluasi keputusan tradingmu oleh TRY-REX AI Mentor
          </p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 self-start rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </header>

      <div className="mt-6">
        <EvalStatCards
          decision={decision}
          correct={correct}
          accuracy={accuracy}
          xp={xp}
          seconds={seconds}
        />
      </div>

      {/* Chart + explanation */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="flex flex-col">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold">Review Keputusanmu</h2>
            <span
              className={[
                "rounded-md px-2 py-0.5 text-xs font-bold",
                challenge.changePercent > 0
                  ? "bg-success/15 text-success"
                  : challenge.changePercent < 0
                    ? "bg-danger/15 text-danger"
                    : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {challenge.changePercent > 0 ? "+" : ""}
              {challenge.changePercent.toFixed(2)}% setelah entry
            </span>
          </div>
          <div className="mt-4 h-[280px] w-full sm:h-[360px]">
            <CandlestickChart
              candles={revealed}
              min={frame.min}
              max={frame.max}
              priceTicks={frame.priceTicks}
              timeLabels={challenge.revealTimeLabels}
              highlightTimeIndex={3}
              zones={challenge.zones}
              markers={tradePlanFor(challenge, decision)}
              digits={challenge.digits}
            />
          </div>

          {/* Trade meta row */}
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            <Meta icon={GitCommitHorizontal} label="Pair" value={challenge.pair} />
            <Meta icon={Clock} label="Timeframe" value={challenge.timeframe} />
            <Meta icon={Calendar} label="Periode" value={challenge.period} />
            <div className="bg-card p-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <DecisionIcon className="h-3.5 w-3.5" /> Keputusanmu
              </p>
              <p
                className={`mt-1 flex items-center gap-1 text-sm font-bold ${correct ? "text-success" : "text-danger"}`}
              >
                <DecisionIcon className="h-4 w-4" /> {decisionLabels[decision]}
              </p>
            </div>
          </div>
        </Card>

        <Explanation
          decision={decision}
          correct={correct}
          reasons={challenge.reasons}
          suggestion={challenge.suggestion}
        />
      </div>

      {/* Bottom row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <AspectPerformance aspects={aspectScoresFor(challenge.focus, correct)} focus={challenge.focus} />

        <Card className="flex flex-col">
          <h2 className="text-base font-semibold">Langkah Selanjutnya</h2>
          <p className="mt-2 text-sm text-muted-foreground">Terus latihan dan perbaiki keputusanmu!</p>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/trading-game"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <RotateCcw className="h-4 w-4" /> Ulangi Challenge
            </Link>
            <Disclosure
              label="Lihat Riwayat"
              closeLabel="Sembunyikan Riwayat"
              className="rounded-lg border border-border bg-muted/20 p-3"
              triggerClassName=""
            >
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <History className="h-3.5 w-3.5" /> 5 challenge terakhir
              </p>
              <ActivityList activities={recentActivities.slice(0, 5)} />
            </Disclosure>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="bg-card p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}
