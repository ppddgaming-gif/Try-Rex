import Link from "next/link"
import { ArrowRight, CandlestickChart as ChartIcon, Wallet } from "lucide-react"
import { Card } from "@/components/card"
import { usd } from "@/lib/demo/format"
import type { LedgerRow } from "@/lib/demo/server"
import type { DemoView } from "@/lib/demo/view"

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
})

/**
 * The account at a glance. Every number is the account's own state; with no
 * trades yet, trade statistics read "—", never 0 or 0%.
 */
export function AccountOverview({ view, ledger }: { view: DemoView; ledger: LedgerRow[] }) {
  const f = view.account.figures
  const s = view.stats
  const none = s.trades === 0

  return (
    <div className="flex flex-col gap-4">
      <Card className="glow-card sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <Wallet className="h-5 w-5 text-primary" aria-hidden="true" /> Akun #{view.account.number}
          </p>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            Stage {view.stage.current}
          </span>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Saldo" value={usd(f.balance)} />
          <Stat label="Equity" value={usd(f.equity)} />
          <Stat label="Margin terpakai" value={usd(f.marginUsed)} />
          <Stat label="Margin bebas" value={usd(f.freeMargin)} />
        </dl>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Disiplin"
            value={s.disiplin === null ? null : `${s.disiplin}%`}
            hint="Muncul setelah trade pertama ditutup"
          />
          <Stat label="Trade" value={String(s.trades)} />
          <Stat
            label="Net profit"
            value={none ? null : usd(s.net, { signed: true })}
            tone={s.net > 0 ? "text-success" : s.net < 0 ? "text-danger" : ""}
            hint="Belum ada trade"
          />
          <Stat
            label="Win rate"
            value={none ? null : `${Math.round((s.wins / s.trades) * 100)}%`}
            hint="Belum ada trade"
          />
        </dl>
        {!none && (
          <p className="mt-3 text-xs text-muted-foreground">Win rate tinggi belum tentu untung — lihat rasio reward:risk.</p>
        )}
      </Card>

      <Link href="/akun-latihan/trading" className="lift group block">
        <Card className="flex items-center gap-4 sm:p-7">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
            <ChartIcon className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              {view.open.length > 0 ? `Lanjut trading · ${view.open.length} trade terbuka` : "Mulai trading"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Stage {view.stage.current} · {view.stage.label}</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Card>
      </Link>

      <Card className="sm:p-7">
        <h2 className="text-base font-semibold">Riwayat saldo</h2>
        <ul className="mt-3 divide-y divide-border">
          {ledger.map((row) => (
            <li key={row.id} className="flex min-h-12 items-center gap-3 py-2 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{row.label}</span>
                <span className="block text-xs text-muted-foreground">{dateFmt.format(new Date(row.createdAt))}</span>
              </span>
              <span
                className={`font-mono font-semibold ${row.kind === "deposit" ? "" : row.amount > 0 ? "text-success" : row.amount < 0 ? "text-danger" : ""}`}
              >
                {usd(row.amount, { signed: true })}
              </span>
              <span className="w-24 text-right font-mono text-xs text-muted-foreground">{usd(row.balanceAfter)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function Stat({ label, value, hint, tone = "" }: { label: string; value: string | null; hint?: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-inset px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-1 font-mono text-lg font-bold ${value === null ? "text-muted-foreground" : tone}`}>{value ?? "—"}</dd>
      {value === null && hint && <dd className="mt-0.5 text-[11px] leading-tight text-faint">{hint}</dd>}
    </div>
  )
}
