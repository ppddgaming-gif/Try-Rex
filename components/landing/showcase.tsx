import {
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Pause,
  Sparkles,
} from "lucide-react"
import { CandlestickChart } from "@/components/candlestick-chart"
import { Rex } from "@/components/rex-mascot"
import { challenges, decisionLabels, frameOf, type Challenge } from "@/lib/mock-data"

/**
 * Soft amber glow panel that hosts app UI mockups. Built from the brand
 * tokens: green would read as a market signal, which the brand never is.
 */
export function GlowPanel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border/60 p-6 sm:p-10 ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(120% 120% at 20% 10%, color-mix(in srgb, var(--primary) 34%, transparent) 0%, color-mix(in srgb, var(--primary-dim) 26%, transparent) 38%, color-mix(in srgb, var(--card) 90%, transparent) 78%)",
      }}
    >
      <div className="relative flex items-center justify-center">{children}</div>
    </div>
  )
}

/** Mockup: AI evaluation / aspect breakdown list (Dashboard nuance) */
export function AspectMockup() {
  const rows = [
    { icon: TrendingUp, label: "Trend Reading", val: 72, tone: "text-success" },
    { icon: Clock, label: "Entry Timing", val: 64, tone: "text-warning" },
    { icon: ShieldCheck, label: "Risk Management", val: 58, tone: "text-warning" },
  ]
  return (
    <div className="glass-card w-full max-w-md rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold">Pemahaman Berdasarkan Aspek</p>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
          Contoh
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {rows.map((r) => {
          const Icon = r.icon
          return (
            <div key={r.label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className={`h-4 w-4 ${r.tone}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{r.label}</span>
                  <span className="font-semibold">{r.val}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={r.val >= 70 ? "h-full rounded-full bg-success" : "h-full rounded-full bg-warning"}
                    style={{ width: `${r.val}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Pair, timeframe and period pills, as the game shows them. */
function ChallengeTags({ challenge }: { challenge: Challenge }) {
  return (
    <>
      <span className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-semibold">{challenge.pair}</span>
      <span className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-semibold">
        {challenge.timeframe}
      </span>
      <span className="hidden rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground sm:inline">
        {challenge.period}
      </span>
    </>
  )
}

const decisionTiles = [
  { label: "BUY", sub: "Harga naik", icon: ArrowUpRight, tone: "text-success" },
  { label: "SELL", sub: "Harga turun", icon: ArrowDownRight, tone: "text-danger" },
  { label: "WAIT", sub: "Tunggu dulu", icon: Pause, tone: "text-wait" },
]

/**
 * Hero product shot: a real question from the game, with Rex quoting that
 * question's own computed situation, so the picture and the words agree.
 * Decorative: the "buttons" are divs.
 */
export function HeroShowcase() {
  const challenge = challenges[0]
  const frame = frameOf(challenge.candles)

  return (
    <div className="flex w-full max-w-5xl flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
      <div className="glass-card min-w-0 rounded-2xl p-4 sm:p-5 lg:flex-1">
        <div className="flex items-center gap-2">
          <ChallengeTags challenge={challenge} />
          <span className="ml-auto font-mono text-xs text-muted-foreground">Soal 1 / 5</span>
        </div>
        <div className="mt-3 h-[190px] sm:h-[300px]">
          <CandlestickChart
            candles={challenge.candles}
            min={frame.min}
            max={frame.max}
            priceTicks={frame.priceTicks}
            timeLabels={challenge.timeLabels}
            zones={challenge.zones}
            currentPrice={challenge.currentPrice}
            digits={challenge.digits}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {decisionTiles.map((d) => (
            <div
              key={d.label}
              className={`flex flex-col items-center rounded-xl border border-border bg-inset py-2.5 font-display text-base font-extrabold ${d.tone}`}
            >
              {d.label}
              <span className="font-sans text-[10px] font-medium text-muted-foreground">{d.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rex reads the chart out loud: under it on phones, beside it from lg. */}
      <div className="glass-card flex items-start gap-3 rounded-2xl p-4 text-left lg:mt-12 lg:w-64 lg:flex-col">
        <Rex size={36} mood="thinking" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Situasinya begini: </span>
          {challenge.situation} Kamu pilih apa?
        </p>
      </div>
    </div>
  )
}

/**
 * Mockup: the reveal after answering. A real question with its hidden candles
 * shown, and the answer they decided.
 */
export function RevealMockup() {
  const challenge = challenges.find((c) => c.answer === "sell") ?? challenges[1]
  const candles = [...challenge.candles, ...challenge.future]
  const frame = frameOf(candles)
  const up = challenge.changePercent > 0

  return (
    <div className="glass-card w-full max-w-md rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <ChallengeTags challenge={challenge} />
        <span
          className={`ml-auto rounded-md px-2 py-1 font-mono text-[11px] font-bold ${up ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}
        >
          {up ? "+" : ""}
          {challenge.changePercent.toFixed(2)}%
        </span>
      </div>
      <div className="mt-3 h-[180px]">
        <CandlestickChart
          candles={candles}
          min={frame.min}
          max={frame.max}
          priceTicks={[]}
          timeLabels={[]}
          zones={challenge.zones}
          digits={challenge.digits}
          dividerAt={challenge.candles.length}
        />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-xs">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
        <span className="text-muted-foreground">
          Jawaban yang tepat: <span className="font-bold text-foreground">{decisionLabels[challenge.answer]}</span>
        </span>
      </div>
    </div>
  )
}

/** Mockup: TRY-REX AI chat feedback */
export function ChatMockup() {
  return (
    <div className="glass-card w-full max-w-md rounded-2xl p-4">
      {/* user bubble */}
      <div className="mb-3 flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-muted px-3.5 py-2 text-xs">
          Kenapa keputusan SELL aku kurang tepat?
        </div>
      </div>
      {/* assistant */}
      <div className="flex items-start gap-2.5">
        <Rex size={28} />
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Aku cek chart kamu dulu, lalu jelasin alasannya.
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Menganalisis struktur market
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-[11px] text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Harga masih di area resistance 1.0920
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-[11px] text-danger">
              <XCircle className="h-3.5 w-3.5" /> Belum ada konfirmasi reversal
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed">
            Entry terlalu cepat. Tunggu rejection seperti pin bar di resistance dulu, baru ambil SELL.
          </p>
        </div>
      </div>
    </div>
  )
}
