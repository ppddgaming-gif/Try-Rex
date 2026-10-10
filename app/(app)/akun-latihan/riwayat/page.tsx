import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/card"
import { DemoTabs } from "@/components/akun-latihan/demo-tabs"
import { getCurrentUser } from "@/lib/auth"
import { ACCOUNT } from "@/lib/demo/config"
import { accountStatus, usd } from "@/lib/demo/format"
import { tradeCounts } from "@/lib/demo/history"
import { sectionState, type DemoAccount } from "@/lib/demo/server"
import { INTL_LOCALE, type Locale } from "@/lib/i18n/locale"
import type { T } from "@/lib/i18n/translator"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("demo.ui.meta"))("riwayat") }
}

/** "Akun #1: habis dalam 11 trade". `t` is demo.ui.history. */
function story(a: DemoAccount, trades: number, t: T) {
  if (a.status === "habis") return t("storyHabis", { n: trades })
  if (a.status === "reset") return trades === 0 ? t("storyResetNone") : t("storyReset", { n: trades })
  return t("storyActive", { n: trades })
}

/** Every account the player has opened, newest first, each with its journal. */
export default async function RiwayatPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/akun-latihan")
  const state = await sectionState(user.id)
  if (!state) redirect("/akun-latihan")
  const [counts, t, root, locale] = await Promise.all([
    tradeCounts(user.id),
    getTranslations("demo.ui.history"),
    getTranslations(),
    getLocale(),
  ])
  const dateFmt = new Intl.DateTimeFormat(INTL_LOCALE[locale as Locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  })

  return (
    <div className="flex flex-col gap-5">
      <DemoTabs />
      <Card className="sm:p-7">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("body", { balance: usd(ACCOUNT.STARTING_BALANCE) })}</p>
        <ol className="mt-5 flex flex-col gap-2.5">
          {state.accounts.map((a) => {
            const trades = counts.get(a.id) ?? 0
            const active = a.status === "active"
            return (
              <li key={a.id}>
                <Link
                  href={`/akun-latihan/jurnal?akun=${a.number}`}
                  className="lift group flex min-h-16 items-center gap-4 rounded-xl border border-border bg-inset px-4 py-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{t("account", { n: a.number })}</span>
                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                        ].join(" ")}
                      >
                        {accountStatus(a.status, root)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm">{story(a, trades, t)}</span>
                    <span className="block text-xs text-muted-foreground">
                      {t.rich(active ? "lineActive" : "lineClosed", {
                        dates: `${dateFmt.format(new Date(a.createdAt))}${a.closedAt ? ` – ${dateFmt.format(new Date(a.closedAt))}` : ""}`,
                        amount: usd(a.balance),
                        num: (c) => <span className="font-mono">{c}</span>,
                      })}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
                    {t("journal")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      </Card>
    </div>
  )
}
