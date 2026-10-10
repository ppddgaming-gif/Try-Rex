import Link from "next/link"
import { useTranslations } from "next-intl"
import { ArrowRight, CandlestickChart as ChartIcon, GraduationCap, Layers, Wallet } from "lucide-react"
import { Card } from "@/components/card"
import { ResetAccount } from "@/components/akun-latihan/account-actions"
import { DISIPLIN } from "@/lib/demo/config"
import { ledgerLabel, pct, usd } from "@/lib/demo/format"
import { roundMoney } from "@/lib/demo/money"
import type { LedgerRow } from "@/lib/demo/server"
import { progressLabel } from "@/lib/demo/stages"
import type { AccountStats } from "@/lib/demo/stats"
import type { DemoView } from "@/lib/demo/view"

import { INTL_LOCALE, type Locale } from "@/lib/i18n/locale"
import { useLocale } from "next-intl"

/**
 * The account's dashboard, Disiplin first: how the plan was kept, then what
 * it did to the money. Disiplin and the stage are the player's, over every
 * account, so a reset never wipes them; the rest is this account's own
 * trades and ledger. With no trades yet, each reads "—", never 0 or 0%.
 */
export function AccountDashboard({
  view,
  stats,
  ledger,
  startingBalance,
}: {
  view: DemoView
  stats: AccountStats
  ledger: LedgerRow[]
  startingBalance: string
}) {
  const f = view.account.figures
  const none = stats.trades === 0
  const disiplin = view.disiplin
  const net = roundMoney(f.balance - view.account.startingBalance)
  const p = view.stage.progress
  const share = Math.min(1, p.trades / p.needed)
  const t = useTranslations("demo.ui.dashboard")
  const root = useTranslations()
  const label = progressLabel(p, root)
  const NO_TRADES = t("noTrades")
  const dateFmt = new Intl.DateTimeFormat(INTL_LOCALE[useLocale() as Locale], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  })

  return (
    <div className="flex flex-col gap-4">
      {view.graduated && (
        <Link href="/akun-latihan/lulus" className="lift group block">
          <Card className="glow-card flex items-center gap-4 border-primary/40 sm:p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
              <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{t("graduatedTitle")}</span>
              <span className="block text-sm text-muted-foreground">{t("graduatedBody")}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Card>
        </Link>
      )}

      {/* 1. Disiplin, with the way to the next stage. */}
      <Card className="glow-card sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <Wallet className="h-5 w-5 text-primary" aria-hidden="true" /> {t("account", { n: view.account.number })}
          </p>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            {t("stage", { n: view.stage.current })}
          </span>
        </div>
        <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,auto)_minmax(0,1fr)] sm:items-center">
          <div>
            <p className="text-sm text-muted-foreground">{t("disiplin")}</p>
            <p className={`font-mono text-5xl font-bold tracking-tight ${disiplin === null ? "text-muted-foreground" : "text-primary"}`}>
              {disiplin === null ? "—" : `${disiplin}%`}
            </p>
            <p className="mt-1 text-xs text-faint">
              {disiplin === null ? t("disiplinNone") : t("disiplinAvg", { n: DISIPLIN.ROLLING_TRADES })}
            </p>
          </div>
          <div className="rounded-xl bg-inset p-4">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-semibold">
                <Layers className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {t("stage", { n: view.stage.current })}
              </span>
              <span className="text-muted-foreground">
                {view.graduated ? t("graduated") : p.next ? t("toStage", { n: p.next }) : t("toGraduation")}
              </span>
            </div>
            <p className="mt-2 font-mono text-xs font-semibold">{label}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60" aria-hidden="true">
              <div
                className="h-full origin-left rounded-full bg-primary transition-transform duration-500 ease-out-expo"
                style={{ transform: `scaleX(${share})` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 2. How the plans were made. */}
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label={t("avgRisk")}
          value={stats.avgRiskPct === null ? null : t("riskValue", { risk: pct(stats.avgRiskPct) })}
          note={
            stats.withoutSl > 0
              ? t("withoutSl", { n: stats.withoutSl })
              : stats.avgRiskPct !== null
                ? t("limit", { n: DISIPLIN.MAX_RISK_PCT })
                : undefined
          }
          hint={none ? NO_TRADES : t("noSlTrades")}
        />
        <Stat
          label={t("avgRR")}
          value={stats.avgRewardRisk === null ? null : `1 : ${stats.avgRewardRisk.toFixed(2)}`}
          note={stats.avgRewardRisk !== null ? t("min", { n: DISIPLIN.MIN_REWARD_RISK }) : undefined}
          hint={none ? NO_TRADES : t("noSlTpTrades")}
        />
        <Stat label={t("slAtEntry")} value={stats.slAtEntryPct === null ? null : `${stats.slAtEntryPct}%`} note={none ? undefined : t("ofAll")} hint={NO_TRADES} />
        <Stat
          label={t("drawdown")}
          value={stats.drawdown === null ? null : stats.drawdown.amount === 0 ? usd(0) : usd(-stats.drawdown.amount)}
          note={stats.drawdown === null ? undefined : t("fromPeak", { pct: pct(stats.drawdown.pct) })}
          hint={NO_TRADES}
        />
      </dl>

      {/* 3. The money, then 4. win rate and why it isn't the point. */}
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t("balance")} value={usd(f.balance)} note={t("bustBelow", { amount: usd(view.account.bustLine) })} />
        <Stat label={t("equity")} value={usd(f.equity)} />
        <Stat
          label={t("netProfit")}
          value={none ? null : usd(net, { signed: true })}
          tone={net > 0 ? "text-success" : net < 0 ? "text-danger" : ""}
          hint={NO_TRADES}
        />
        <Stat
          label={t("winRate")}
          value={stats.winRate === null ? null : `${stats.winRate}%`}
          note={none ? undefined : t("wins", { wins: stats.wins, trades: stats.trades })}
          hint={NO_TRADES}
          footer={t("winRateNote")}
        />
      </dl>

      <Link href="/akun-latihan/trading" className="lift group block">
        <Card className="flex items-center gap-4 sm:p-7">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
            <ChartIcon className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">
              {view.open.length > 0 ? t("continueTrading", { n: view.open.length }) : t("startTrading")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("stageLine", { n: view.stage.current, progress: label })}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Card>
      </Link>

      <Card className="sm:p-7">
        <h2 className="text-base font-semibold">{t("ledger")}</h2>
        <ul className="mt-3 divide-y divide-border">
          {ledger.map((row) => (
            <li key={row.id} className="flex min-h-12 items-center gap-3 py-2 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{ledgerLabel(row, root)}</span>
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

      <ResetAccount
        number={view.account.number}
        startingBalance={startingBalance}
        blocked={view.open.length > 0 ? t("resetBlocked") : null}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  note,
  footer,
  tone = "",
}: {
  label: string
  /** null shows "—" with `hint` under it. */
  value: string | null
  hint?: string
  /** A short line under a value. */
  note?: string
  footer?: string
  tone?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-1 font-mono text-lg font-bold ${value === null ? "text-muted-foreground" : tone}`}>{value ?? "—"}</dd>
      {value === null && hint && <dd className="mt-0.5 text-[11px] leading-tight text-faint">{hint}</dd>}
      {value !== null && note && <dd className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{note}</dd>}
      {footer && <dd className="mt-2 text-xs text-muted-foreground">{footer}</dd>}
    </div>
  )
}
