"use client"

import { useState } from "react"
import { Card } from "@/components/card"
import { CandlestickChart } from "@/components/candlestick-chart"
import { tradingGameCandles } from "@/lib/mock-data"
import { ChevronDown, ArrowUpRight, ArrowDown, Pause } from "lucide-react"

type Choice = "buy" | "sell" | "wait" | null

const actions = [
  {
    id: "buy" as const,
    label: "BUY",
    sub: "Harga akan naik",
    Icon: ArrowUpRight,
    classes: "border-success/40 bg-success/10 hover:bg-success/20 text-success",
    ring: "ring-2 ring-success",
  },
  {
    id: "sell" as const,
    label: "SELL",
    sub: "Harga akan turun",
    Icon: ArrowDown,
    classes: "border-danger/40 bg-danger/10 hover:bg-danger/20 text-danger",
    ring: "ring-2 ring-danger",
  },
  {
    id: "wait" as const,
    label: "WAIT",
    sub: "Tunggu konfirmasi",
    Icon: Pause,
    classes: "border-warning/40 bg-warning/10 hover:bg-warning/20 text-warning",
    ring: "ring-2 ring-warning",
  },
]

export default function TradingGamePage() {
  const [choice, setChoice] = useState<Choice>(null)

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trading Game Simulator</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih keputusan terbaikmu berdasarkan situasi market!
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">
          Soal <span className="font-bold text-primary">15</span>{" "}
          <span className="text-muted-foreground">/ 20</span>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Chart */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-semibold">
              EURUSD <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-semibold">
              H1
            </span>
          </div>

          <div className="mt-4 h-[420px] w-full">
            <CandlestickChart
              candles={tradingGameCandles}
              min={1.076}
              max={1.096}
              priceTicks={[1.076, 1.078, 1.08, 1.082, 1.084, 1.086, 1.088, 1.09, 1.092, 1.094, 1.096]}
              timeLabels={["16 May 12:00", "17 May 12:00", "20 May 12:00", "21 May 12:00", "22 May 12:00"]}
              zones={[
                { from: 1.0905, to: 1.092, variant: "resistance" },
                { from: 1.0795, to: 1.08, variant: "support", label: "1.08000" },
              ]}
              currentPrice={1.08621}
            />
          </div>
        </Card>

        {/* Situation + actions */}
        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="text-base font-semibold">Situasi Market</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Price sedang berada di area resistance kuat setelah trend turun.
            </p>
          </Card>

          <div className="flex flex-col gap-3">
            {actions.map((a) => {
              const selected = choice === a.id
              const Icon = a.Icon
              return (
                <button
                  key={a.id}
                  onClick={() => setChoice(a.id)}
                  className={[
                    "flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all",
                    a.classes,
                    selected ? a.ring : "",
                  ].join(" ")}
                >
                  <Icon className="h-7 w-7 shrink-0" />
                  <div>
                    <p className="text-lg font-extrabold leading-none">{a.label}</p>
                    <p className="mt-1 text-xs opacity-80">{a.sub}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {choice && (
            <p className="text-center text-xs text-muted-foreground">
              Kamu memilih <span className="font-semibold uppercase text-foreground">{choice}</span>.
              Lanjut ke evaluasi untuk melihat hasilnya.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
