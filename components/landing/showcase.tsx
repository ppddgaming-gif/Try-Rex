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
import { Rex } from "@/components/rex-mascot"

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
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold">Pemahaman Berdasarkan Aspek</p>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
          Live
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

/** Mockup: Trading Game decision buttons — decorative, not interactive */
export function TradingMockup() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">EURUSD · H1</p>
          <p className="text-xs text-muted-foreground">Price di area resistance kuat</p>
        </div>
        <span className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground">
          Soal 15 / 20
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-left">
          <ArrowUpRight className="h-5 w-5 text-success" />
          <div>
            <p className="text-sm font-bold text-success">BUY</p>
            <p className="text-[11px] text-muted-foreground">Harga akan naik</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-left">
          <ArrowDownRight className="h-5 w-5 text-danger" />
          <div>
            <p className="text-sm font-bold text-danger">SELL</p>
            <p className="text-[11px] text-muted-foreground">Harga akan turun</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-wait/40 bg-wait/10 px-4 py-3 text-left">
          <Pause className="h-5 w-5 text-wait" />
          <div>
            <p className="text-sm font-bold text-wait">WAIT</p>
            <p className="text-[11px] text-muted-foreground">Tunggu konfirmasi</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Mockup: TRY-REX AI chat feedback */
export function ChatMockup() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur">
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
