import { Gamepad2, ScanSearch, TrendingUp } from "lucide-react"

const steps = [
  {
    icon: Gamepad2,
    step: "01",
    title: "Ambil keputusan",
    body: "Hadapi situasi market di Trading Game dan tentukan BUY, SELL, atau WAIT.",
  },
  {
    icon: ScanSearch,
    step: "02",
    title: "Dievaluasi AI",
    body: "TRY-REX menilai keputusanmu, memberi skor, dan menjelaskan alasannya.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Naik level",
    body: "Perbaiki kelemahan, kumpulkan XP, dan jadi trader yang makin konsisten.",
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Belajar lewat siklus latihan yang terbukti
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Praktik, feedback, perbaikan—berulang setiap hari sampai jadi kebiasaan.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.step} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-3xl font-extrabold text-muted">{s.step}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
