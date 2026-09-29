import { getPublicStats } from "@/lib/public-stats"

const count = (n: number) => n.toLocaleString("id-ID")

// Real counts from Supabase. Before there is anything to count, or if it
// can't be reached, it says what is true instead of showing a number.
export async function StatsBanner() {
  const stats = await getPublicStats()
  const players = stats?.players ?? 0
  const answers = stats?.answers ?? 0

  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8">
      <p className="reveal rounded-2xl border border-border bg-card px-6 py-6 text-center text-sm font-semibold text-muted-foreground sm:text-base">
        <span className="text-primary">Beta terbuka</span>
        {players > 0 ? (
          <>
            {" — "}
            <span className="font-mono text-foreground">{count(players)}</span> trader sudah bergabung
            {answers > 0 && (
              <>
                {", "}
                <span className="font-mono text-foreground">{count(answers)}</span> soal sudah dijawab
              </>
            )}
            .
          </>
        ) : (
          " — jadi trader pertama yang mencoba."
        )}
      </p>
    </section>
  )
}
