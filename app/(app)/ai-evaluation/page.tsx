import Link from "next/link"
import { Card } from "@/components/card"
import { CandlestickChart } from "@/components/candlestick-chart"
import { EvalStatCards } from "@/components/evaluation/stat-cards"
import { Explanation } from "@/components/evaluation/explanation"
import { AspectPerformance } from "@/components/evaluation/aspect-performance"
import { evaluationCandles } from "@/lib/mock-data"
import { ArrowLeft, ArrowDown, RotateCcw, History, GitCommitHorizontal, Clock, Calendar, ArrowRightLeft } from "lucide-react"

export default function AiEvaluationPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Evaluation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Evaluasi keputusan tradingmu oleh TRY-REX AI Mentor
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </header>

      <div className="mt-6">
        <EvalStatCards />
      </div>

      {/* Chart + explanation */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="flex flex-col">
          <h2 className="text-base font-semibold">Review Keputusanmu</h2>
          <div className="mt-4 h-[360px] w-full">
            <CandlestickChart
              candles={evaluationCandles}
              min={1.078}
              max={1.094}
              priceTicks={[1.078, 1.08, 1.082, 1.084, 1.086, 1.088, 1.09, 1.092, 1.094]}
              timeLabels={["20 May 12:00", "21 May 00:00", "21 May 14:00", "22 May 00:00", "22 May 12:00"]}
              highlightTimeIndex={2}
              zones={[
                { from: 1.09, to: 1.092, variant: "resistance", label: "RESISTANCE" },
                { from: 1.078, to: 1.0795, variant: "support", label: "SUPPORT" },
              ]}
              markers={[
                { price: 1.09, label: "Stop Loss", variant: "danger" },
                { price: 1.08621, label: "Your Entry", variant: "neutral", align: "left" },
                { price: 1.08, label: "Take Profit", variant: "success" },
              ]}
            />
          </div>

          {/* Trade meta row */}
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            <Meta icon={GitCommitHorizontal} label="Pair" value="EURUSD" />
            <Meta icon={Clock} label="Timeframe" value="H1" />
            <Meta icon={Calendar} label="Tanggal" value="21 Mei 2025 14:00" />
            <div className="bg-card p-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ArrowRightLeft className="h-3.5 w-3.5" /> Keputusanmu
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm font-bold text-danger">
                <ArrowDown className="h-4 w-4" /> SELL
              </p>
            </div>
          </div>
        </Card>

        <Explanation />
      </div>

      {/* Bottom row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <AspectPerformance />

        <Card className="flex flex-col">
          <h2 className="text-base font-semibold">Langkah Selanjutnya</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Terus latihan dan perbaiki keputusanmu!
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/trading-game"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:opacity-90"
            >
              <RotateCcw className="h-4 w-4" /> Ulangi Challenge
            </Link>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 py-3 text-sm font-medium transition-colors hover:bg-muted">
              <History className="h-4 w-4" /> Lihat Riwayat
            </button>
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
