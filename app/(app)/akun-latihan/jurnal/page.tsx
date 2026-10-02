import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { NotebookPen } from "lucide-react"
import { Card } from "@/components/card"
import { DemoTabs } from "@/components/akun-latihan/demo-tabs"
import { JournalList, type JournalItem } from "@/components/akun-latihan/journal-list"
import { EmptyState } from "@/components/progress/empty-state"
import { getCurrentUser } from "@/lib/auth"
import { ACCOUNT_STATUS } from "@/lib/demo/format"
import { loadJournal } from "@/lib/demo/history"
import { sectionState } from "@/lib/demo/server"

export const metadata: Metadata = { title: "Jurnal · Akun Latihan" }

// Candle times are historical and in UTC, like the chart's data.
const candleFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
})
const candleLabel = (t: number | null) => (t === null ? null : `${candleFmt.format(new Date(t * 1000))} UTC`)

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
  const account = state.accounts.find((a) => String(a.number) === akun) ?? state.account ?? state.accounts[0]
  const rows: JournalItem[] = (await loadJournal(user.id, account.id)).map((r) => ({
    ...r,
    entryLabel: candleLabel(r.entryTime),
    exitLabel: candleLabel(r.exitTime),
  }))

  return (
    <div className="flex flex-col gap-5">
      <DemoTabs />
      <Card className="sm:p-7">
        <h2 className="text-base font-semibold">Jurnal trading · Akun #{account.number}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Setiap trade yang ditutup tercatat otomatis: rencananya, hasilnya, pemeriksaan Disiplin dan komentar Rex. Ketuk
          satu baris untuk melihat semuanya.
        </p>
        {state.accounts.length > 1 && (
          <nav aria-label="Pilih akun" className="mt-4 flex flex-wrap gap-1.5">
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
                  Akun #{a.number} · {ACCOUNT_STATUS[a.status]}
                </Link>
              )
            })}
          </nav>
        )}
      </Card>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={NotebookPen}
            title="Jurnal masih kosong"
            body={
              account.status === "active"
                ? "Belum ada trade. Trade pertamamu akan tercatat di sini otomatis."
                : `Akun #${account.number} ditutup sebelum ada trade.`
            }
          />
        </Card>
      ) : (
        <JournalList rows={rows} />
      )}
    </div>
  )
}
