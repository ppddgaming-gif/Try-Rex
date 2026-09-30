"use client"

import { useState } from "react"
import { Stepper } from "@/components/akun-latihan/stepper"
import { PLAN } from "@/lib/demo/config"
import { lot, price, usd } from "@/lib/demo/format"
import type { TradeView } from "@/lib/demo/view"
import { reasonLabel } from "@/lib/reasons"

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
  if (trades.length === 0) return null

  async function save(pips: number | null) {
    if (!editing) return
    if (await onModify(editing.id, editing.field, pips)) setEditing(null)
  }

  return (
    <section aria-labelledby="open-title" className="glass-card rounded-2xl p-4 sm:p-5">
      <h2 id="open-title" className="text-sm font-semibold">
        Trade terbuka · {trades.length}
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {trades.map((t) => {
          const edit = editing?.id === t.id ? editing : null
          const current = edit ? (edit.field === "sl" ? t.slPips : t.tpPips) : null
          const widening = edit?.field === "sl" && t.slPips !== null && edit.pips > t.slPips
          return (
            <li key={t.id} className="rounded-xl bg-inset p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  #{t.number}{" "}
                  <span className={t.side === "buy" ? "text-success" : "text-danger"}>{t.side.toUpperCase()}</span>{" "}
                  <span className="font-mono">{lot(t.lot)}</span> {pair}
                </p>
                <p className={`font-mono text-sm font-bold ${t.pnl > 0 ? "text-success" : t.pnl < 0 ? "text-danger" : ""}`}>
                  {usd(t.pnl, { signed: true })}
                </p>
              </div>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <Level label="Entry" value={price(pair, t.entry)} />
                <Level label="SL" value={t.sl === null ? "—" : price(pair, t.sl)} sub={t.slPips === null ? null : `${t.slPips} pip`} />
                <Level label="TP" value={t.tp === null ? "—" : price(pair, t.tp)} sub={t.tpPips === null ? null : `${t.tpPips} pip`} />
              </dl>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {t.reasons.map(reasonLabel).join(" · ")}
                {t.revenge && <span className="ml-1.5 font-semibold text-primary">· ditandai revenge</span>}
              </p>

              {edit ? (
                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">
                    Jarak {edit.field === "sl" ? "SL" : "TP"} dari entry, dalam pip
                    {edit.field === "sl" ? ". Angka negatif = melewati entry (mengunci profit)." : "."}
                  </p>
                  <Stepper
                    id={`edit-${t.id}`}
                    label={`jarak ${edit.field === "sl" ? "SL" : "TP"}`}
                    value={edit.pips}
                    onChange={(v) => setEditing({ ...edit, pips: v })}
                    step={1}
                    min={edit.field === "sl" ? -PLAN.MAX_DISTANCE_PIPS : 0.1}
                    max={PLAN.MAX_DISTANCE_PIPS}
                    decimals={1}
                    unit="pip"
                  />
                  {widening && (
                    <p className="rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-2 text-[11px]">
                      Menjauhkan SL dari entry menggagalkan pemeriksaan Disiplin &ldquo;SL tidak dijauhkan&rdquo;.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busy || edit.pips === current} onClick={() => save(edit.pips)} className="btn btn-sm">
                      Simpan
                    </button>
                    {edit.field === "sl" && (
                      <button type="button" disabled={busy} onClick={() => setEditing({ ...edit, pips: 0 })} className="btn btn-ghost btn-sm">
                        Break-even
                      </button>
                    )}
                    {optional && current !== null && (
                      <button type="button" disabled={busy} onClick={() => save(null)} className="btn btn-ghost btn-sm">
                        Hapus
                      </button>
                    )}
                    <button type="button" onClick={() => setEditing(null)} className="btn btn-ghost btn-sm">
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setEditing({ id: t.id, field: "sl", pips: t.slPips ?? suggestedPips })}
                    className="btn btn-ghost btn-sm"
                  >
                    {t.sl === null ? "Pasang SL" : "Ubah SL"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setEditing({ id: t.id, field: "tp", pips: t.tpPips ?? suggestedPips })}
                    className="btn btn-ghost btn-sm"
                  >
                    {t.tp === null ? "Pasang TP" : "Ubah TP"}
                  </button>
                  <button type="button" disabled={busy} onClick={() => onClose(t.id)} className="btn btn-ghost btn-sm">
                    Tutup trade
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
