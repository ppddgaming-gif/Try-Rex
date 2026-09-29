import Link from "next/link"
import { Home, LineChart, BrainCircuit, ArrowUpRight } from "lucide-react"

const surfaces = [
  {
    icon: Home,
    title: "Dashboard",
    body: "Lihat ringkasan pemahaman, akurasi, dan tantangan harianmu dalam satu tempat.",
    cta: "Buka Dashboard",
    href: "/dashboard",
  },
  {
    icon: LineChart,
    title: "Trading Game",
    body: "Uji keputusanmu di simulasi market dan kumpulkan XP di setiap soal.",
    cta: "Main sekarang",
    href: "/trading-game",
  },
  {
    icon: BrainCircuit,
    title: "AI Evaluation",
    body: "Dapatkan feedback mendetail dari TRY-REX untuk setiap keputusan trading.",
    cta: "Lihat evaluasi",
    href: "/ai-evaluation",
  },
]

export function Surfaces() {
  return (
    <section id="product" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="reveal mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Satu mentor, di setiap langkah belajarmu
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          Tiga ruang yang saling terhubung untuk membentuk kebiasaan trading yang sehat.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {surfaces.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.title}
              className="reveal flex flex-col rounded-2xl border border-border bg-card p-6 transition-[translate,border-color] duration-300 ease-out-expo hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              <Link
                href={s.href}
                className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
              >
                {s.cta}
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}
