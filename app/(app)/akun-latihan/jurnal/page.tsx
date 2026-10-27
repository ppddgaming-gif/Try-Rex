import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Card } from "@/components/card"
import { DemoTabs } from "@/components/akun-latihan/demo-tabs"
import { JournalList, type JournalItem } from "@/components/akun-latihan/journal-list"
import { EmptyState } from "@/components/progress/empty-state"
import { getCurrentUser } from "@/lib/auth"
import { accountStatus } from "@/lib/demo/format"
import { loadJournal } from "@/lib/demo/history"
import { sectionState } from "@/lib/demo/server"
import { INTL_LOCALE, type Locale } from "@/lib/i18n/locale"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("demo.ui.meta"))("jurnal") }
}

// Replay trades: historical candle times, in UTC like the chart's data.
// Live-chart trades: real times, in WIB (never the data's period).
const candleFormat = (locale: Locale, timeZone: string) =>
  new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  })

/**
 * The Trading Journal of one account (`?akun=<n>`; the active or latest one
 * by default). Every closed trade is written here automatically.
 */
export default async function JurnalPage({ searchParams }: { searchParams: Promise<{ akun?: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect("/akun-latihan")
  const state = await sectionState(user.id)
  if (!state) redirect("/akun-latihan")

  const { akun } = await searchParams
  const [t, root, locale] = await Promise.all([getTranslations("demo.ui.journal"), getTranslations(), getLocale()])
  const utcFmt = candleFormat(locale as Locale, "UTC")
  const wibFmt = candleFormat(locale as Locale, "Asia/Jakarta")
  const candleLabel = (s: number | null, real: boolean) =>
    s === null
      ? null
      : real
        ? t("wib", { time: wibFmt.format(new Date(s * 1000)) })
        : t("utc", { time: utcFmt.format(new Date(s * 1000)) })
  const account = state.accounts.find((a) => String(a.number) === akun) ?? state.account ?? state.accounts[0]
  const rows: JournalItem[] = (await loadJournal(user.id, account.id)).map((r) => ({
    ...r,
    entryLabel: candleLabel(r.entryTime, r.realTime),
    exitLabel: candleLabel(r.exitTime, r.realTime),
  }))

  return (
    <div className="flex flex-col gap-5">
      <DemoTabs />
      <Card className="sm:p-7">
        <h2 className="text-base font-semibold">{t("title", { n: account.number })}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("body")}</p>
        {state.accounts.length > 1 && (
          <nav aria-label={t("pickAccount")} className="mt-4 flex flex-wrap gap-1.5">
            {state.accounts.map((a) => {
              const on = a.id === account.id
              return (
                <Link
                  key={a.id}
                  href={`/akun-latihan/jurnal?akun=${a.number}`}
                  aria-current={on ? "page" : undefined}
                  className={[
                    "flex min-h-10 items-center rounded-full border px-3.5 text-xs font-semibold transition-colors",
                    on ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {t("accountChip", { n: a.number, status: accountStatus(a.status, root) })}
                </Link>
              )
            })}
          </nav>
        )}
      </Card>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            title={t("emptyTitle")}
            body={account.status === "active" ? t("emptyActive") : t("emptyClosed", { n: account.number })}
          />
        </Card>
      ) : (
        <JournalList rows={rows} />
      )}
    </div>
  )
}
