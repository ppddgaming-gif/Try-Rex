import { getTranslations } from "next-intl/server"
import { getPublicStats } from "@/lib/public-stats"

// Real counts from Supabase. Before there is anything to count, or if it
// can't be reached, it says what is true instead of showing a number.
export async function StatsBanner() {
  const stats = await getPublicStats()
  const players = stats?.players ?? 0
  const answers = stats?.answers ?? 0
  // Numbers are formatted by the message (ICU), in the reader's locale.
  const t = await getTranslations("landing.stats")
  const num = (c: React.ReactNode) => <span className="font-mono text-foreground">{c}</span>

  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8">
      <p className="reveal rounded-2xl border border-border bg-card px-6 py-6 text-center text-sm font-semibold text-muted-foreground sm:text-base">
        <span className="text-primary">{t("beta")}</span>
        {players > 0 ? (
          <>
            {t("dash")}
            {t.rich("players", { players, num })}
            {answers > 0 && t.rich("answers", { answers, num })}
            {t("end")}
          </>
        ) : (
          t("first")
        )}
      </p>
    </section>
  )
}
