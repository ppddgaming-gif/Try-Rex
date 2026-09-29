const stats = [
  { value: "12K+", label: "Trader aktif belajar" },
  { value: "850K+", label: "Keputusan dievaluasi" },
  { value: "20", label: "Soal simulasi per sesi" },
  { value: "4.8/5", label: "Rating dari pengguna" },
]

export function StatsBanner() {
  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8">
      <div className="reveal grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card px-6 py-8 text-center">
            <p className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">{s.value}</p>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
