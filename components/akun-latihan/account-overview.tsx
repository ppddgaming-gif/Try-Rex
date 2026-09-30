import { CandlestickChart as ChartIcon, Wallet } from "lucide-react"
import { Card } from "@/components/card"
import { accountFigures } from "@/lib/demo/money"
import { usd } from "@/lib/demo/format"
import type { DemoAccount, LedgerRow } from "@/lib/demo/server"

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
export function AccountOverview({ account, ledger }: { account: DemoAccount; ledger: LedgerRow[] }) {
  // No open trades exist before phase B, so equity is the balance.
  const f = accountFigures(account.balance, [])
  const tradeCount = 0

  return (
    <div className="flex flex-col gap-4">
      <Card className="glow-card sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <Wallet className="h-5 w-5 text-primary" aria-hidden="true" /> Akun #{account.number}
          </p>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">Stage 1</span>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Saldo" value={usd(f.balance)} />
          <Stat label="Equity" value={usd(f.equity)} />
          <Stat label="Margin terpakai" value={usd(f.marginUsed)} />
          <Stat label="Margin bebas" value={usd(f.freeMargin)} />
        </dl>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Disiplin" value={null} hint="Muncul setelah trade pertama ditutup" />
          <Stat label="Trade" value={String(tradeCount)} />
          <Stat label="Net profit" value={null} hint="Belum ada trade" />
          <Stat label="Win rate" value={null} hint="Belum ada trade" />
        </dl>
      </Card>

      <Card className="flex items-start gap-4 sm:p-7">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
          <ChartIcon className="h-5 w-5 text-primary" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold">Layar trading sedang disiapkan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chart replay, panel order dengan kalkulator, dan pemeriksaan Disiplin hadir di tahap berikutnya. Akun dan
            materimu sudah tersimpan.
          </p>
        </div>
      </Card>

      <Card className="sm:p-7">
        <h2 className="text-base font-semibold">Riwayat saldo</h2>
        <ul className="mt-3 divide-y divide-border">
          {ledger.map((row) => (
            <li key={row.id} className="flex min-h-12 items-center gap-3 py-2 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{row.label}</span>
                <span className="block text-xs text-muted-foreground">{dateFmt.format(new Date(row.createdAt))}</span>
              </span>
              <span className="font-mono font-semibold">{usd(row.amount, { signed: true })}</span>
              <span className="w-24 text-right font-mono text-xs text-muted-foreground">{usd(row.balanceAfter)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string | null; hint?: string }) {
  return (
    <div className="rounded-xl bg-inset px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-1 font-mono text-lg font-bold ${value === null ? "text-muted-foreground" : ""}`}>{value ?? "—"}</dd>
      {value === null && hint && <dd className="mt-0.5 text-[11px] leading-tight text-faint">{hint}</dd>}
    </div>
  )
}
