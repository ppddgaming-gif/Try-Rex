import { Layers, Wallet } from "lucide-react"
import { useTranslations } from "next-intl"
import { ACCOUNT } from "@/lib/demo/config"
import { lot, usd } from "@/lib/demo/format"
import { progressLabel } from "@/lib/demo/stages"
import type { DemoView } from "@/lib/demo/view"

/** Balance, Equity, Open P/L, Margin used and Free margin, updated every candle. */
export function AccountPanel({ view }: { view: DemoView }) {
  const f = view.account.figures
  const marginCall = f.marginLevel !== null && f.marginLevel <= ACCOUNT.MARGIN_CALL_LEVEL
  const t = useTranslations("demo.ui.panel")
  return (
    <section aria-labelledby="account-title" className="glass-card rounded-2xl p-4 sm:p-5">
      <h2 id="account-title" className="flex items-center gap-2 text-sm font-semibold">
        <Wallet className="h-4 w-4 text-primary" aria-hidden="true" /> {t("account", { n: view.account.number })}
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-2">
        <Figure label={t("balance")} value={usd(f.balance)} />
        <Figure label={t("equity")} value={usd(f.equity)} />
        <Figure
          label={t("openPnl")}
          value={usd(f.openPnl, { signed: true })}
          tone={f.openPnl > 0 ? "text-success" : f.openPnl < 0 ? "text-danger" : ""}
        />
        <Figure label={t("marginUsed")} value={usd(f.marginUsed)} />
        <Figure label={t("freeMargin")} value={usd(f.freeMargin)} />
        <Figure
          label={t("marginLevel")}
          value={f.marginLevel === null ? "—" : `${f.marginLevel.toFixed(0)}%`}
          tone={marginCall ? "text-primary" : f.marginLevel === null ? "text-muted-foreground" : ""}
        />
      </dl>
      {marginCall && (
        <p className="mt-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs">
          {t("marginCall", { call: ACCOUNT.MARGIN_CALL_LEVEL, out: ACCOUNT.STOP_OUT_LEVEL })}
        </p>
      )}
    </section>
  )
}

function Figure({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-inset px-3 py-2">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className={`font-mono text-sm font-bold ${tone}`}>{value}</dd>
    </div>
  )
}

/**
 * The player's stage and the way to the next one, or in Stage 3 to
 * graduation: "7/10 trade · Disiplin 76% (butuh 80%)".
 */
export function StageCard({ view }: { view: DemoView }) {
  const { stage } = view
  const p = stage.progress
  const share = Math.min(1, p.trades / p.needed)
  const t = useTranslations("demo.ui.stageCard")
  const td = useTranslations("demo.ui.dashboard")
  const root = useTranslations()
  return (
    <section aria-labelledby="stage-title" className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 id="stage-title" className="flex items-center gap-2 text-sm font-semibold">
          <Layers className="h-4 w-4 text-primary" aria-hidden="true" /> {t("stage", { n: stage.current })}
        </h2>
        <span className="text-[11px] text-muted-foreground">
          {view.graduated ? td("graduated") : p.next ? td("toStage", { n: p.next }) : td("toGraduation")}
        </span>
      </div>
      <p className="mt-2 font-mono text-xs font-semibold">{progressLabel(p, root)}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-inset" aria-hidden="true">
        <div
          className="h-full origin-left rounded-full bg-primary transition-transform duration-500 ease-out-expo"
          style={{ transform: `scaleX(${share})` }}
        />
      </div>
      <ul className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
        <li>{t("pairs", { pairs: stage.pairs.join(", ") })}</li>
        <li>{stage.fixedLot !== null ? t("lotFixed", { lot: lot(stage.fixedLot) }) : t("lotFree")}</li>
        <li>{t("maxOpen", { n: stage.maxOpenTrades })}</li>
        <li>{stage.slTpRequired ? t("slTpRequired") : t("slTpOptional")}</li>
        <li>{t("bust", { amount: usd(view.account.bustLine) })}</li>
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-faint">
        {t("counted")}
      </p>
    </section>
  )
}
