"use client"

import { useState } from "react"
import { ArrowRight, FastForward, LoaderCircle, Play, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { ChartLevel } from "@/components/akun-latihan/live-chart"
import { ScenarioDesk } from "@/components/assessment/scenario-desk"
import { decisionProblem, entryOf, LOT, pipsBetween, pnlUsd, REASONS_PER_DECISION } from "@/lib/assessment/sim"
import type { Action, Bar, Decision, EntryType, PublicPackage, PublicScenario, ScenarioRun } from "@/lib/assessment/types"
import { INTL_LOCALE, type Locale } from "@/lib/i18n/locale"
import type { Drawing } from "@/lib/live/drawings"

export type ScenarioView = { context: Bar[]; revealed: Bar[]; run: ScenarioRun | null }

type Position = Extract<Drawing, { kind: "position" }>

const STEP: Record<string, number> = { M15: 900, M30: 1800, H1: 3600, H4: 14_400 }

const num = (s: string) => {
  const v = Number(s.trim().replace(",", "."))
  return s.trim() && Number.isFinite(v) ? v : undefined
}

/** BUY, SELL and NO TRADE as solid buttons in their market colours (WAIT's blue-grey for NO TRADE). */
const actionStyle = (a: Action) => {
  const c = a === "buy" ? "success" : a === "sell" ? "danger" : "wait"
  return {
    "--btn-bg": `var(--${c})`,
    "--btn-hover-bg": `color-mix(in srgb, var(--${c}) 88%, white)`,
    "--btn-edge": `color-mix(in srgb, var(--${c}) 55%, var(--shadow))`,
    "--btn-fg": "var(--primary-foreground)",
  } as React.CSSProperties
}

/**
 * One scenario, laid out like the trading screen: the briefing, the chart
 * with its tools and indicators, then the decision. The Buy/Sell position
 * tool and the SL/TP fields are one order: drawing it fills the fields and
 * typing moves it. Start commits the decision; then the candles arrive one by
 * one from the server at a fixed pace. A position closes in full, by hand with
 * a reason, or at its SL, TP or the window's last candle.
 */
export function ScenarioItem({
  item,
  pkg,
  number,
  of,
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
  number: number
  of: number
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
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [linked, setLinked] = useState<string | null>(null)

  const ref = view.context[view.context.length - 1].c
  const run = view.run
  const fmt = (p: number) => p.toFixed(item.digits)
  const money = (v: number, sign = false) =>
    new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol", signDisplay: sign ? "exceptZero" : "auto" }).format(v)

  // --- The order and its position drawing, kept in step -----------------------
  const position = drawings.find((d): d is Position => d.kind === "position" && d.id === linked) ?? null

  /** Writes form values into the linked position drawing. */
  const syncDrawing = (patch: { sl?: number; tp?: number; entry?: number }) => {
    if (!position) return
    setDrawings((ds) =>
      ds.map((d) =>
        d.id === position.id && d.kind === "position"
          ? {
              ...d,
              sl: patch.sl ?? d.sl,
              tp: patch.tp ?? d.tp,
              a: patch.entry !== undefined ? { ...d.a, p: patch.entry } : d.a,
              b: patch.entry !== undefined ? { ...d.b, p: patch.entry } : d.b,
            }
          : d,
      ),
    )
  }

  /** A drawing change from the chart: a new or moved position becomes the order (market entries sit at the Start price). */
  const onDrawings = (next: Drawing[]) => {
    if (run) return setDrawings(next)
    const before = new Map(drawings.map((d) => [d.id, JSON.stringify(d)]))
    const changed = [...next].reverse().find((d): d is Position => d.kind === "position" && before.get(d.id) !== JSON.stringify(d))
    if (!changed) {
      if (linked && !next.some((d) => d.id === linked)) setLinked(null)
      return setDrawings(next)
    }
    // One trade per scenario: the newest position replaces any other.
    // A market entry sits at the last close (t = 0, Start): the whole position moves there, keeping its distances and width.
    const shift = entry === "market" ? ref - changed.a.p : 0
    const round = (p: number) => Number(p.toFixed(item.digits))
    const width = changed.b.t - changed.a.t
    const pos: Position =
      entry === "market"
        ? { ...changed, a: { t: 0, p: ref }, b: { t: width, p: ref }, sl: round(changed.sl + shift), tp: round(changed.tp + shift) }
        : changed
    setDrawings(next.filter((d) => d.kind !== "position" || d.id === pos.id).map((d) => (d.id === pos.id ? pos : d)))
    setLinked(pos.id)
    setAction(pos.side)
    setSl(fmt(pos.sl))
    setTp(fmt(pos.tp))
    if (entry === "pending") setPrice(fmt(pos.a.p))
  }

  const chooseAction = (a: Action) => {
    setAction(a)
    if (position && a !== position.side) {
      setDrawings((ds) => ds.filter((d) => d.id !== position.id))
      setLinked(null)
    }
  }
  const chooseEntry = (k: EntryType) => {
    setEntry(k)
    if (k === "market") syncDrawing({ entry: ref })
    else if (position) setPrice(fmt(position.a.p))
  }
  const typeLevel = (field: "sl" | "tp" | "price", v: string) => {
    if (field === "sl") setSl(v)
    if (field === "tp") setTp(v)
    if (field === "price") setPrice(v)
    const n = num(v)
    if (n === undefined) return
    syncDrawing(field === "price" ? { entry: n } : { [field]: n })
  }

  // --- The decision ------------------------------------------------------------
  const draft: Decision = run
    ? run.d
    : action === "no_trade" || !action
      ? { action: action ?? "no_trade", reasons }
      : { action, entry, price: entry === "pending" ? num(price) : undefined, lot: num(lot), sl: num(sl), tp: num(tp), reasons }
  const problem = action ? decisionProblem(draft, { ref, pipSize: item.pipSize, reasonOptions: item.reasonOptions }) : "action"
  const trade = draft.action !== "no_trade"
  const e = entryOf(draft, ref)
  const slPips = trade && draft.sl !== undefined ? pipsBetween(e, draft.sl, item.pipSize) : null
  const tpPips = trade && draft.tp !== undefined ? pipsBetween(e, draft.tp, item.pipSize) : null
  const riskUsd = slPips !== null && draft.lot !== undefined ? slPips * item.pipValue * draft.lot : null

  const decide = () => {
    // From here the committed order is drawn as levels; the plan drawing goes.
    setDrawings((ds) => ds.filter((d) => d.id !== linked))
    setLinked(null)
    onDecide(draft)
  }

  // Levels: the order while it is typed without a drawing, then the committed one.
  const levels: ChartLevel[] = []
  if (trade && (run || !position)) {
    const entryPrice = run?.f ? run.f.p : draft.entry === "pending" ? draft.price : ref
    if (entryPrice !== undefined) levels.push({ kind: "entry", price: entryPrice, label: run?.f || draft.entry !== "pending" ? t("lineEntry") : t("linePending") })
    if (draft.sl !== undefined) levels.push({ kind: "sl", price: draft.sl, label: "SL" })
    if (draft.tp !== undefined) levels.push({ kind: "tp", price: draft.tp, label: "TP" })
  }

  // --- While it plays ------------------------------------------------------------
  const bars = [...view.context, ...view.revealed]
  const last = bars[bars.length - 1]
  const state = !run || !trade ? null : run.x ? "closed" : run.f ? "open" : run.end ? "unfilled" : "pending"
  const floating =
    run && trade && run.f && draft.lot !== undefined
      ? pnlUsd(draft.action as "buy" | "sell", run.f.p, run.x ? run.x.p : last.c, draft.lot, item.pipSize, item.pipValue)
      : null

  return (
    <article className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-primary/50 px-2.5 py-1 font-display text-[11px] font-semibold uppercase tracking-wider text-primary">
            {t("chip", { n: number, total: of })}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] font-semibold text-muted-foreground">
            {item.pair.slice(0, 3)}/{item.pair.slice(3)} · {item.timeframe}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] font-semibold text-muted-foreground">{t("balance", { v: money(item.balance) })}</span>
        </div>
        <h2 className="mt-3 font-display text-xl font-bold leading-snug">{item.title[locale]}</h2>
        <p className="mt-2 max-w-4xl text-[15px] leading-relaxed text-foreground/90">{item.briefing[locale]}</p>
      </section>

      <ScenarioDesk
        pair={item.pair}
        digits={item.digits}
        step={STEP[item.timeframe] ?? 900}
        bars={bars}
        context={view.context.length}
        levels={levels}
        drawings={drawings}
        onDrawings={onDrawings}
        startLabel={t("startLine")}
      />

      {!run ? (
        <section aria-label={t("action")} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div role="group" aria-label={t("action")} className="grid grid-cols-3 gap-2">
            {(["buy", "sell", "no_trade"] as const).map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={action === a}
                onClick={() => chooseAction(a)}
                className={["btn font-display tracking-wider", action === a ? "" : "btn-ghost"].join(" ")}
                style={action === a ? actionStyle(a) : undefined}
              >
                {t(`actions.${a}`)}
              </button>
            ))}
          </div>

          {action && action !== "no_trade" && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div role="radiogroup" aria-label={t("orderType")} className="flex gap-0.5 rounded-xl bg-inset p-0.5">
                  {(["market", "pending"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={entry === k}
                      onClick={() => chooseEntry(k)}
                      className={[
                        "min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors",
                        entry === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {t(`orderTypes.${k}`)}
                    </button>
                  ))}
                </div>
                <p className="min-w-0 flex-1 text-xs text-muted-foreground">
                  {entry === "market" ? t("marketAt", { price: fmt(ref) }) : t("pendingHint", { price: fmt(ref) })}
                </p>
              </div>

              <div className={["grid grid-cols-2 gap-3", entry === "pending" ? "sm:grid-cols-4" : "sm:grid-cols-3"].join(" ")}>
                {entry === "pending" && <Field label={t("entryPrice")} value={price} onChange={(v) => typeLevel("price", v)} placeholder={fmt(ref)} />}
                <Field label={t("lot", { min: LOT.MIN })} value={lot} onChange={setLot} placeholder="0.01" />
                <Field label={t("sl")} value={sl} onChange={(v) => typeLevel("sl", v)} placeholder={fmt(ref)} />
                <Field label={t("tp")} value={tp} onChange={(v) => typeLevel("tp", v)} placeholder={fmt(ref)} />
              </div>
              <p className="-mt-1 text-xs text-muted-foreground">{position ? t("toolLinked") : t("toolHint")}</p>

              {pkg.showRisk && (
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Stat label={t("pipValue")} value={money(item.pipValue)} />
                  <Stat label={t("slDistance")} value={slPips === null ? "—" : t("pips", { n: Math.round(slPips * 10) / 10 })} />
                  <Stat label={t("risk")} value={riskUsd === null ? "—" : `${money(riskUsd)} · ${((riskUsd / item.balance) * 100).toFixed(2)}%`} />
                  <Stat label={t("rr")} value={slPips && tpPips !== null ? `1 : ${(tpPips / slPips).toFixed(2)}` : "—"} />
                </dl>
              )}
            </>
          )}

          {action && (
            <fieldset>
              <legend className="text-sm font-semibold">{t("reasons", { min: REASONS_PER_DECISION.MIN, max: REASONS_PER_DECISION.MAX })}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {item.reasonOptions.map((r) => {
                  const on = reasons.includes(r)
                  const full = !on && reasons.length >= REASONS_PER_DECISION.MAX
                  return (
                    <label
                      key={r}
                      className={[
                        "flex min-h-11 cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                        on ? "border-primary bg-primary/10" : "border-border bg-inset hover:border-primary/40",
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

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-faint sm:max-w-md">{problem && action ? t(`problems.${problem}`) : t("startNote")}</p>
            <button type="button" className="btn sm:min-w-44" disabled={busy || !!problem} onClick={decide}>
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} {t("start")}
            </button>
          </div>
        </section>
      ) : (
        <section aria-live="polite" className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("yourDecision")}</p>
              <p className="mt-1 font-mono text-sm tabular-nums">
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
            <div className="text-right">
              {state && <p className="text-sm font-semibold">{t(`position.${state}`)}</p>}
              {floating !== null && (
                <p className={["font-mono text-xl font-bold tabular-nums", floating >= 0 ? "text-success" : "text-danger"].join(" ")}>{money(floating, true)}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs tabular-nums text-muted-foreground">
              <span>{t("candle", { n: run.n, total: item.playCandles })}</span>
              {run.x && <span>{t(`exit.${run.x.why}`, { price: fmt(run.x.p) })}</span>}
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-inset" aria-hidden="true">
              <div className="h-full origin-left rounded-full bg-primary transition-transform duration-300" style={{ transform: `scaleX(${run.n / item.playCandles})` }} />
            </div>
            <p className="mt-2 text-xs text-faint">{t("outcomeNote")}</p>
          </div>

          {closing && (
            <fieldset>
              <legend className="text-sm font-semibold">{t("closeWhy")}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {Object.entries(pkg.closeReasons).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    disabled={busy}
                    onClick={() => onClose(k)}
                    className="min-h-11 rounded-xl border border-border bg-inset px-3 py-2 text-left text-sm hover:border-primary/40"
                  >
                    {label[locale]}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-faint sm:max-w-md">{run.end || closing ? "" : t("skipNote")}</p>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {state === "open" && !run.end && !closing && (
                <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setClosing(true)}>
                  <X className="h-4 w-4" /> {t("close")}
                </button>
              )}
              {closing && (
                <button type="button" className="btn btn-ghost" onClick={() => setClosing(false)}>
                  {t("closeCancel")}
                </button>
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
            </div>
          </div>
        </section>
      )}
    </article>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
      <input
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(ev) => onChange(ev.target.value)}
        className="min-h-11 w-full min-w-0 rounded-xl border border-border bg-inset px-3 font-mono text-sm normal-case tracking-normal text-foreground tabular-nums placeholder:text-faint focus:border-primary"
      />
    </label>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-inset px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
