"use client"

import { useState } from "react"
import { Calculator } from "lucide-react"
import { useTranslations } from "next-intl"
import { SelectMenu } from "@/components/select-menu"
import { Stepper } from "@/components/akun-latihan/stepper"
import { ACCOUNT, CALCULATOR } from "@/lib/demo/config"
import { examplePrice, exampleExit, profitCalc } from "@/lib/demo/calculator"
import { lot as fmtLot, pct, usd } from "@/lib/demo/format"
import { instrument } from "@/lib/demo/instruments"
import type { Side } from "@/lib/demo/money"

const tone = (v: number) => (v > 0 ? "text-success" : v < 0 ? "text-danger" : "")

/**
 * Kalkulator Profit: what a move from one price to another is worth at a lot
 * size, with costs and margin. The same functions as the order panel and the
 * server's booking. Prices start at examples, never a current price.
 */
export function ProfitCalculator({
  pairs,
  balance,
  balanceLabel,
}: {
  pairs: string[]
  /** For "% of balance": the active account's balance, or the starting balance. */
  balance: number
  balanceLabel: string
}) {
  const [pair, setPair] = useState<string>(CALCULATOR.PAIR)
  const [side, setSide] = useState<Side>("buy")
  const [lot, setLot] = useState<number>(CALCULATOR.LOT)
  const [entry, setEntry] = useState(() => examplePrice(CALCULATOR.PAIR))
  const [exit, setExit] = useState(() => exampleExit(CALCULATOR.PAIR, "buy"))
  const { digits, pipSize } = instrument(pair)
  const r = profitCalc({ pair, side, lot, entry, exit, balance })
  const t = useTranslations("demo.ui.calc")
  const to = useTranslations("demo.ui.order")

  function pickPair(next: string) {
    setPair(next)
    setEntry(examplePrice(next))
    setExit(exampleExit(next, side))
  }

  const priceProps = { step: pipSize, min: pipSize, max: 100_000, decimals: digits }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      <section aria-labelledby="calc-title" className="glass-card flex flex-col gap-4 rounded-2xl p-4 sm:p-6">
        <div>
          <h2 id="calc-title" className="flex items-center gap-2 font-display text-lg font-bold">
            <Calculator className="h-5 w-5 text-primary" aria-hidden="true" /> {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("body")}</p>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{t("pair")}</p>
          <SelectMenu label={t("pair")} value={pair} onChange={pickPair} options={pairs.map((p) => ({ value: p, label: p }))} />
        </div>

        <div role="radiogroup" aria-label={t("direction")} className="grid grid-cols-2 gap-2">
          {(["buy", "sell"] as const).map((s) => {
            const on = side === s
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setSide(s)}
                className={[
                  "min-h-11 rounded-xl border-[1.5px] font-display text-base font-extrabold tracking-wide transition-colors",
                  s === "buy" ? "text-success" : "text-danger",
                  on
                    ? s === "buy"
                      ? "border-success bg-success/13"
                      : "border-danger bg-danger/13"
                    : "border-border bg-inset opacity-70 hover:opacity-100",
                ].join(" ")}
              >
                {s.toUpperCase()}
              </button>
            )
          })}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{t("lot")}</p>
          <Stepper
            id="calc-lot"
            label={to("lotUnit")}
            value={lot}
            onChange={setLot}
            step={ACCOUNT.LOT_STEP}
            min={ACCOUNT.MIN_LOT}
            max={ACCOUNT.MAX_LOT}
            decimals={2}
            unit={to("lotUnit")}
          />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{t("entry")}</p>
          <Stepper id="calc-entry" label={t("entryLabel")} value={entry} onChange={setEntry} {...priceProps} />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{t("exit")}</p>
          <Stepper id="calc-exit" label={t("exitLabel")} value={exit} onChange={setExit} {...priceProps} />
        </div>
        <p className="text-[11px] leading-snug text-faint">{t("note")}</p>
      </section>

      <section aria-labelledby="calc-result" className="glass-card rounded-2xl p-4 sm:p-6" aria-live="polite">
        <h2 id="calc-result" className="text-sm font-semibold">
          {t("result", { side: side.toUpperCase(), lot: fmtLot(r.lot), pair })}
        </h2>
        <p className={`mt-3 font-mono text-4xl font-bold tracking-tight ${tone(r.gross)}`}>{usd(r.gross, { signed: true })}</p>
        <p className="text-xs text-muted-foreground">{t("gross", { pips: `${r.pips > 0 ? "+" : ""}${r.pips.toFixed(1)}` })}</p>

        <dl className="mt-5 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 rounded-xl bg-inset p-3.5 text-sm">
          <Row term={to("pipValue")} value={usd(r.pipValue)} />
          <Row term={to("marginNeeded")} value={usd(r.margin)} />
          <div aria-hidden="true" className="col-span-2 my-0.5 h-px bg-border" />
          <Row term={to("spread", { pips: r.costs.spreadPips })} value={usd(-r.costs.spread)} muted />
          <Row term={to("commission")} value={usd(r.costs.commission)} muted />
          <div aria-hidden="true" className="col-span-2 my-0.5 h-px bg-border" />
          <Row term={t("net")} value={usd(r.net, { signed: true })} tone={tone(r.net)} />
          <Row term={t("pctOf", { label: balanceLabel })} value={pct(r.netPct, { signed: true })} tone={tone(r.netPct)} />
        </dl>
        <p className="mt-3 text-[11px] leading-snug text-faint">
          {t("swapNote")}
          {r.approximate && ` ${to("approx")}`}
        </p>
      </section>
    </div>
  )
}

function Row({ term, value, tone = "", muted }: { term: string; value: string; tone?: string; muted?: boolean }) {
  return (
    <>
      <dt className={muted ? "text-muted-foreground" : ""}>{term}</dt>
      <dd className={`text-right font-mono font-semibold ${muted ? "text-muted-foreground" : tone}`}>{value}</dd>
    </>
  )
}
