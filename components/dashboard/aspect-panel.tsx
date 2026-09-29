import { Card } from "@/components/card"
import { Disclosure } from "@/components/disclosure"
import { aspectMetrics } from "@/lib/mock-data"
import { BarChart3, Clock, Shield, TrendingUp } from "lucide-react"

const icons = {
  trend: TrendingUp,
  entry: Clock,
  risk: Shield,
  structure: BarChart3,
}

function band(v: number) {
  if (v >= 70) return { label: "Kuat", tone: "text-success", bar: "var(--success)" }
  if (v >= 60) return { label: "Cukup", tone: "text-warning", bar: "var(--warning)" }
  return { label: "Perlu latihan", tone: "text-danger", bar: "var(--danger)" }
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
                    style={{ width: `${m.value}%`, background: band(m.value).bar }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Disclosure
        label="Lihat Detail"
        closeLabel="Sembunyikan Detail"
        className="mt-5 flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4"
        triggerClassName="mt-3"
      >
        {aspectMetrics.map((m) => {
          const b = band(m.value)
          return (
            <div key={m.key} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold">{m.label}</p>
                <span className={`text-xs font-bold ${b.tone}`}>
                  {m.value}% · {b.label}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
            </div>
          )
        })}
      </Disclosure>
    </Card>
  )
}
