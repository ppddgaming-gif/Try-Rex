"use client"

import { useState } from "react"
import { ArrowRight, FastForward, LoaderCircle, Play, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { ScenarioChart } from "@/components/assessment/scenario-chart"
import { decisionProblem, entryOf, LOT, pipsBetween, pnlUsd, REASONS_PER_DECISION } from "@/lib/assessment/sim"
import type { Action, Bar, Decision, EntryType, PublicPackage, PublicScenario, ScenarioRun } from "@/lib/assessment/types"
import type { Marker } from "@/lib/chart-geometry"
import { INTL_LOCALE, type Locale } from "@/lib/i18n/locale"

export type ScenarioView = { context: Bar[]; revealed: Bar[]; run: ScenarioRun | null }

const num = (s: string) => {
  const v = Number(s.trim().replace(",", "."))
  return s.trim() && Number.isFinite(v) ? v : undefined
}

const ACTION_STYLE: Record<Action, string> = {
  buy: "border-success bg-success/10 text-success outline-success",
  sell: "border-danger bg-danger/10 text-danger outline-danger",
  no_trade: "border-wait bg-wait/10 text-wait outline-wait",
}

/**
 * One scenario. Before Start the chart is still and the player sets a
 * decision: BUY, SELL or NO TRADE, market or pending, lot, SL, TP and 1–3
 * reasons. Start commits it; then the candles arrive one by one from the
 * server at a fixed pace. An open position can only be closed in full, by
 * hand with a reason, or runs to its SL, TP or the window's last candle.
 */
export function ScenarioItem({
  item,
  pkg,
  view,
  busy,
  closing,
  setClosing,
  onDecide,
  onClose,
  onNext,
}: {
  item: PublicScenario
  pkg: PublicPackage
  view: ScenarioView
  busy: boolean
  closing: boolean
  setClosing: (v: boolean) => void
  onDecide: (d: Decision) => void
  onClose: (reason: string) => void
  onNext: () => void
}) {
  const t = useTranslations("assessment.scenario")
  const locale = useLocale() as Locale
  const [action, setAction] = useState<Action | null>(null)
  const [entry, setEntry] = useState<EntryType>("market")
  const [price, setPrice] = useState("")
  const [lot, setLot] = useState("")
  const [sl, setSl] = useState("")
  const [tp, setTp] = useState("")
  const [reasons, setReasons] = useState<string[]>([])

  const ref = view.context[view.context.length - 1].c
  const run = view.run
  const fmt = (p: number) => p.toFixed(item.digits)
  const money = (v: number) => new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" }).format(v)

  // The decision being edited, or the committed one.
  const draft: Decision = run
    ? run.d
    : action === "no_trade" || !action
      ? { action: action ?? "no_trade", reasons }
      : { action, entry, price: entry === "pending" ? num(price) : undefined, lot: num(lot), sl: num(sl), tp: num(tp), reasons }
  const problem = action ? decisionProblem(draft, { ref, pipSize: item.pipSize, reasonOptions: item.reasonOptions }) : "action"

  const trade = draft.action !== "no_trade"
  const e = entryOf(draft, ref)
  const markers: Marker[] = []
  if (trade) {
    if (draft.entry === "pending" && draft.price !== undefined)
      markers.push({ price: draft.price, label: run?.f ? t("lineEntry") : t("linePending"), variant: "neutral" })
    else if (run?.f) markers.push({ price: run.f.p, label: t("lineEntry"), variant: "neutral" })
    if (draft.sl !== undefined) markers.push({ price: draft.sl, label: "SL", variant: "danger" })
    if (draft.tp !== undefined) markers.push({ price: draft.tp, label: "TP", variant: "success" })
  }

  const slPips = trade && draft.sl !== undefined ? pipsBetween(e, draft.sl, item.pipSize) : null
  const tpPips = trade && draft.tp !== undefined ? pipsBetween(e, draft.tp, item.pipSize) : null
  const riskUsd = slPips !== null && draft.lot !== undefined ? slPips * item.pipValue * draft.lot : null

  const bars = [...view.context, ...view.revealed]
  const last = bars[bars.length - 1]
  const position = !run || !trade ? null : run.x ? "closed" : run.f ? "open" : run.end ? "unfilled" : "pending"
  const floating =
    run && trade && run.f && draft.lot !== undefined
      ? pnlUsd(draft.action as "buy" | "sell", run.f.p, run.x ? run.x.p : last.c, draft.lot, item.pipSize, item.pipValue)
      : null

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-card p-5">
        <p className="eyebrow">
          {item.pair.slice(0, 3)}/{item.pair.slice(3)} · {item.timeframe} · {t("balance", { v: money(item.balance) })}
        </p>
        <h2 className="mt-2 font-display text-xl font-bold leading-snug">{item.title[locale]}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{item.briefing[locale]}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-2 lg:sticky lg:top-4 lg:self-start">
          <div className="h-[300px] rounded-2xl border border-border bg-inset p-2 sm:h-[400px]">
            <ScenarioChart bars={bars} startAt={view.context.length} digits={item.digits} markers={markers} startLabel={t("startLine")} locale={locale} />
          </div>
          <p className="text-xs text-faint">{t("chartNote")}</p>
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          {!run ? (
            <>
              <fieldset>
                <legend className="text-sm font-semibold">{t("action")}</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["buy", "sell", "no_trade"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      aria-pressed={action === a}
                      onClick={() => setAction(a)}
                      className={[
                        "min-h-11 rounded-xl border px-2 text-sm font-bold transition-colors",
                        action === a ? ACTION_STYLE[a] : "border-border text-muted-foreground hover:border-primary/40",
                      ].join(" ")}
                    >
                      {t(`actions.${a}`)}
                    </button>
                  ))}
                </div>
              </fieldset>

              {action && action !== "no_trade" && (
                <>
                  <fieldset>
                    <legend className="text-sm font-semibold">{t("orderType")}</legend>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {(["market", "pending"] as const).map((k) => (
                        <button
                          key={k}
                          type="button"
                          aria-pressed={entry === k}
                          onClick={() => setEntry(k)}
                          className={[
                            "min-h-11 rounded-xl border px-2 text-sm font-semibold transition-colors",
                            entry === k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                          ].join(" ")}
                        >
                          {t(`orderTypes.${k}`)}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {entry === "market" ? t("marketAt", { price: fmt(ref) }) : t("pendingHint", { price: fmt(ref) })}
                    </p>
                  </fieldset>
                  <div className="grid grid-cols-2 gap-3">
                    {entry === "pending" && <PriceField label={t("entryPrice")} value={price} onChange={setPrice} placeholder={fmt(ref)} wide />}
                    <PriceField label={t("lot", { min: LOT.MIN })} value={lot} onChange={setLot} placeholder="0.01" wide={entry !== "pending"} />
                    <PriceField label={t("sl")} value={sl} onChange={setSl} placeholder={fmt(ref)} />
                    <PriceField label={t("tp")} value={tp} onChange={setTp} placeholder={fmt(ref)} />
                  </div>
                  {pkg.showRisk && (
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-xl bg-inset p-3 text-xs">
                      <dt className="text-muted-foreground">{t("pipValue")}</dt>
                      <dd className="text-right font-mono tabular-nums">{money(item.pipValue)}</dd>
                      <dt className="text-muted-foreground">{t("slDistance")}</dt>
                      <dd className="text-right font-mono tabular-nums">{slPips === null ? "—" : t("pips", { n: Math.round(slPips * 10) / 10 })}</dd>
                      <dt className="text-muted-foreground">{t("risk")}</dt>
                      <dd className="text-right font-mono tabular-nums">
                        {riskUsd === null ? "—" : `${money(riskUsd)} · ${((riskUsd / item.balance) * 100).toFixed(2)}%`}
                      </dd>
                      <dt className="text-muted-foreground">{t("rr")}</dt>
                      <dd className="text-right font-mono tabular-nums">{slPips && tpPips !== null ? `1 : ${(tpPips / slPips).toFixed(2)}` : "—"}</dd>
                    </dl>
                  )}
                </>
              )}

              {action && (
                <fieldset>
                  <legend className="text-sm font-semibold">{t("reasons", { min: REASONS_PER_DECISION.MIN, max: REASONS_PER_DECISION.MAX })}</legend>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {item.reasonOptions.map((r) => {
                      const on = reasons.includes(r)
                      const full = !on && reasons.length >= REASONS_PER_DECISION.MAX
                      return (
                        <label
                          key={r}
                          className={[
                            "flex min-h-11 cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2 text-sm transition-colors",
                            on ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                            full ? "cursor-not-allowed opacity-50" : "",
                          ].join(" ")}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                            checked={on}
                            disabled={full}
                            onChange={() => setReasons((rs) => (on ? rs.filter((x) => x !== r) : [...rs, r]))}
                          />
                          <span>{pkg.reasons[r]?.[locale] ?? r}</span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              )}

              {problem && action && <p className="text-xs text-muted-foreground">{t(`problems.${problem}`)}</p>}
              <button type="button" className="btn" disabled={busy || !!problem} onClick={() => onDecide(draft)}>
                {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} {t("start")}
              </button>
              <p className="text-xs text-faint">{t("startNote")}</p>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-semibold">{t("yourDecision")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {trade
                    ? t("decisionLine", {
                        action: t(`actions.${draft.action}`),
                        type: t(`orderTypes.${draft.entry ?? "market"}`),
                        lot: draft.lot ?? 0,
                        sl: fmt(draft.sl ?? 0),
                        tp: fmt(draft.tp ?? 0),
                      })
                    : t("actions.no_trade")}
                </p>
              </div>
              <div className="rounded-xl bg-inset p-3">
                <p className="font-mono text-xs tabular-nums text-muted-foreground">{t("candle", { n: run.n, total: item.playCandles })}</p>
                {position && <p className="mt-1 text-sm font-semibold">{t(`position.${position}`)}</p>}
                {floating !== null && (
                  <p className={["mt-1 font-mono text-lg font-bold tabular-nums", floating >= 0 ? "text-success" : "text-danger"].join(" ")}>
                    {floating >= 0 ? "+" : ""}
                    {money(floating)}
                  </p>
                )}
                {run.x && <p className="mt-1 text-xs text-muted-foreground">{t(`exit.${run.x.why}`, { price: fmt(run.x.p) })}</p>}
                <p className="mt-2 text-xs text-faint">{t("outcomeNote")}</p>
              </div>

              {position === "open" && !run.end && !closing && (
                <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setClosing(true)}>
                  <X className="h-4 w-4" /> {t("close")}
                </button>
              )}
              {closing && (
                <fieldset className="flex flex-col gap-1.5">
                  <legend className="text-sm font-semibold">{t("closeWhy")}</legend>
                  {Object.entries(pkg.closeReasons).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      disabled={busy}
                      onClick={() => onClose(k)}
                      className="min-h-11 rounded-xl border border-border px-3 py-2 text-left text-sm hover:border-primary/40"
                    >
                      {label[locale]}
                    </button>
                  ))}
                  <button type="button" className="mt-1 text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => setClosing(false)}>
                    {t("closeCancel")}
                  </button>
                </fieldset>
              )}

              {run.end ? (
                <button type="button" className="btn" disabled={busy} onClick={onNext}>
                  {t("next")} <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                !closing && (
                  <button type="button" className="btn btn-ghost" disabled={busy} onClick={onNext}>
                    <FastForward className="h-4 w-4" /> {t("skip")}
                  </button>
                )
              )}
              {!run.end && !closing && <p className="text-xs text-faint">{t("skipNote")}</p>}
            </>
          )}
        </aside>
      </div>
    </div>
  )
}

function PriceField({
  label,
  value,
  onChange,
  placeholder,
  wide,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  wide?: boolean
}) {
  return (
    <label className={["flex flex-col gap-1 text-xs font-semibold text-muted-foreground", wide ? "col-span-2" : ""].join(" ")}>
      {label}
      <input
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(ev) => onChange(ev.target.value)}
        className="min-h-11 rounded-xl border border-border bg-inset px-3 font-mono text-sm text-foreground tabular-nums placeholder:text-faint focus:border-primary"
      />
    </label>
  )
}
