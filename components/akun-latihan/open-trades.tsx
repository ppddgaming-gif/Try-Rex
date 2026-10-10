"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Stepper } from "@/components/akun-latihan/stepper"
import { PLAN } from "@/lib/demo/config"
import { lot, price, usd } from "@/lib/demo/format"
import type { TradeView } from "@/lib/demo/view"

type Editing = { id: string; field: "sl" | "tp"; pips: number }

/** Open trades: live P/L, SL/TP moves (every change is kept) and manual close. */
export function OpenTrades({
  trades,
  pair,
  optional,
  busy,
  suggestedPips,
  onClose,
  onModify,
}: {
  trades: TradeView[]
  pair: string
  /** Where "Pasang SL/TP" starts: the recent average candle range, in pips. */
  suggestedPips: number
  /** SL and TP may be removed (Stage 2+). */
  optional: boolean
  busy: boolean
  onClose: (id: string) => void
  onModify: (id: string, field: "sl" | "tp", pips: number | null) => Promise<boolean>
}) {
  const [editing, setEditing] = useState<Editing | null>(null)
  const t = useTranslations("demo.ui.open")
  const root = useTranslations()
  if (trades.length === 0) return null

  async function save(pips: number | null) {
    if (!editing) return
    if (await onModify(editing.id, editing.field, pips)) setEditing(null)
  }

  return (
    <section aria-labelledby="open-title" className="glass-card rounded-2xl p-4 sm:p-5">
      <h2 id="open-title" className="text-sm font-semibold">
        {t("title", { n: trades.length })}
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {trades.map((tr) => {
          const edit = editing?.id === tr.id ? editing : null
          const current = edit ? (edit.field === "sl" ? tr.slPips : tr.tpPips) : null
          const widening = edit?.field === "sl" && tr.slPips !== null && edit.pips > tr.slPips
          return (
            <li key={tr.id} className="rounded-xl bg-inset p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  #{tr.number}{" "}
                  <span className={tr.side === "buy" ? "text-success" : "text-danger"}>{tr.side.toUpperCase()}</span>{" "}
                  <span className="font-mono">{lot(tr.lot)}</span> {pair}
                </p>
                <p className={`font-mono text-sm font-bold ${tr.pnl > 0 ? "text-success" : tr.pnl < 0 ? "text-danger" : ""}`}>
                  {usd(tr.pnl, { signed: true })}
                </p>
              </div>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <Level label={t("entry")} value={price(pair, tr.entry)} />
                <Level label={t("sl")} value={tr.sl === null ? "—" : price(pair, tr.sl)} sub={tr.slPips === null ? null : t("pips", { n: tr.slPips })} />
                <Level label={t("tp")} value={tr.tp === null ? "—" : price(pair, tr.tp)} sub={tr.tpPips === null ? null : t("pips", { n: tr.tpPips })} />
              </dl>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {tr.reasons.map((r) => root(`common.reasons.${r}`)).join(" · ")}
                {tr.revenge && <span className="ml-1.5 font-semibold text-primary">{t("revenge")}</span>}
              </p>

              {edit ? (
                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">
                    {t("distanceHelp", { field: edit.field === "sl" ? "SL" : "TP" })}
                    {edit.field === "sl" ? t("slNegative") : t("end")}
                  </p>
                  <Stepper
                    id={`edit-${tr.id}`}
                    label={t("distanceLabel", { field: edit.field === "sl" ? "SL" : "TP" })}
                    value={edit.pips}
                    onChange={(v) => setEditing({ ...edit, pips: v })}
                    step={1}
                    min={edit.field === "sl" ? -PLAN.MAX_DISTANCE_PIPS : 0.1}
                    max={PLAN.MAX_DISTANCE_PIPS}
                    decimals={1}
                    unit={t("unit")}
                  />
                  {widening && (
                    <p className="rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-2 text-[11px]">
                      {t("widening")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busy || edit.pips === current} onClick={() => save(edit.pips)} className="btn btn-sm">
                      {t("save")}
                    </button>
                    {edit.field === "sl" && (
                      <button type="button" disabled={busy} onClick={() => setEditing({ ...edit, pips: 0 })} className="btn btn-ghost btn-sm">
                        {t("breakEven")}
                      </button>
                    )}
                    {optional && current !== null && (
                      <button type="button" disabled={busy} onClick={() => save(null)} className="btn btn-ghost btn-sm">
                        {t("remove")}
                      </button>
                    )}
                    <button type="button" onClick={() => setEditing(null)} className="btn btn-ghost btn-sm">
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setEditing({ id: tr.id, field: "sl", pips: tr.slPips ?? suggestedPips })}
                    className="btn btn-ghost btn-sm"
                  >
                    {tr.sl === null ? t("setSl") : t("editSl")}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setEditing({ id: tr.id, field: "tp", pips: tr.tpPips ?? suggestedPips })}
                    className="btn btn-ghost btn-sm"
                  >
                    {tr.tp === null ? t("setTp") : t("editTp")}
                  </button>
                  <button type="button" disabled={busy} onClick={() => onClose(tr.id)} className="btn btn-ghost btn-sm">
                    {t("close")}
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Level({ label, value, sub }: { label: string; value: string; sub?: string | null }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono font-semibold">{value}</dd>
      {sub && <dd className="font-mono text-[10px] text-faint">{sub}</dd>}
    </div>
  )
}
