"use client"

import { AlertTriangle, Check, Info, X } from "lucide-react"
import { Stepper } from "@/components/akun-latihan/stepper"
import { ACCOUNT, DISIPLIN, PLAN, REPLAY } from "@/lib/demo/config"
import { lot as fmtLot, pct, price as fmtPrice, usd } from "@/lib/demo/format"
import type { Side } from "@/lib/demo/money"
import { fewCandlesLeft, orderProblems, quoteOrder } from "@/lib/demo/orders"
import type { DemoView } from "@/lib/demo/view"
import { TRADE_REASONS, type ReasonId } from "@/lib/reasons"

export type Draft = { lot: number; slPips: number | null; tpPips: number | null; reasons: ReasonId[] }

/** The side's colours: green BUY, red SELL (non-negotiable #5). */
export const sideStyle = (side: Side) =>
  ({
    "--btn-bg": `var(--${side === "buy" ? "success" : "danger"})`,
    "--btn-hover-bg": `color-mix(in srgb, var(--${side === "buy" ? "success" : "danger"}) 88%, white)`,
    "--btn-edge": `color-mix(in srgb, var(--${side === "buy" ? "success" : "danger"}) 55%, var(--shadow))`,
    "--btn-fg": "var(--primary-foreground)",
  }) as React.CSSProperties

/** The plan and its numbers, before every trade. Same functions the server books with. */
export function quoteFor(view: DemoView, side: Side, draft: Draft) {
  const session = view.session!
  const f = view.account.figures
  const quote = quoteOrder({
    pair: session.pair,
    side,
    lot: draft.lot,
    entry: session.candles[session.candles.length - 1].c,
    slPips: draft.slPips,
    tpPips: draft.tpPips,
    balance: f.balance,
    freeMargin: f.freeMargin,
  })
  const problems = orderProblems(
    { side, ...draft },
    { pair: session.pair, stage: view.stage.current, openTrades: view.open.length, candlesLeft: session.remaining },
    quote,
  )
  return { quote, problems }
}

export function OrderPanel({
  view,
  side,
  draft,
  onSide,
  onDraft,
  onSubmit,
  onCancel,
  busy,
  suggestedPips,
}: {
  view: DemoView
  side: Side
  draft: Draft
  /** Where "Pasang SL/TP" starts: the recent average candle range, in pips. */
  suggestedPips: number
  onSide: (side: Side) => void
  onDraft: (draft: Draft) => void
  onSubmit: () => void
  onCancel: () => void
  busy: boolean
}) {
  const session = view.session!
  const pair = session.pair
  const entry = session.candles[session.candles.length - 1].c
  const { quote, problems } = quoteFor(view, side, draft)
  const fixedLot = view.stage.fixedLot
  const optional = !view.stage.slTpRequired
  const revenge = view.lossWindow !== null && quote.lot > view.lossWindow.lot + 1e-9
  const set = (patch: Partial<Draft>) => onDraft({ ...draft, ...patch })
  const toggleReason = (id: ReasonId) =>
    set({ reasons: draft.reasons.includes(id) ? draft.reasons.filter((r) => r !== id) : [...draft.reasons, id] })

  return (
    <section aria-labelledby="order-title" className="glass-card glass-strong pop-in flex flex-col gap-4 rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="order-title" className="font-display text-lg font-bold">
            Rencana trade · {pair}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Masuk di close candle terakhir, <span className="font-mono">{fmtPrice(pair, entry)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup panel order"
          className="-m-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div role="radiogroup" aria-label="Arah trade" className="grid grid-cols-2 gap-2">
        {(["buy", "sell"] as const).map((s) => {
          const on = side === s
          const tone = s === "buy" ? "success" : "danger"
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onSide(s)}
              className={[
                "min-h-11 rounded-xl border-[1.5px] font-display text-base font-extrabold tracking-wide transition-colors",
                tone === "success" ? "text-success" : "text-danger",
                on
                  ? tone === "success"
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

      {/* Lot */}
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Lot</p>
        {fixedLot !== null ? (
          <p className="rounded-lg bg-inset px-3 py-2.5 text-sm">
            <span className="font-mono font-semibold">{fmtLot(fixedLot)}</span>
            <span className="text-muted-foreground"> · tetap di Stage {view.stage.current}</span>
          </p>
        ) : (
          <Stepper
            id="order-lot"
            label="lot"
            value={draft.lot}
            onChange={(v) => set({ lot: v })}
            step={ACCOUNT.LOT_STEP}
            min={ACCOUNT.MIN_LOT}
            max={ACCOUNT.MAX_LOT}
            decimals={2}
            unit="lot"
          />
        )}
      </div>

      <LevelField
        id="order-sl"
        name="Stop loss"
        short="SL"
        pips={draft.slPips}
        level={quote.sl}
        pair={pair}
        optional={optional}
        suggested={suggestedPips}
        onChange={(v) => set({ slPips: v })}
      />
      <LevelField
        id="order-tp"
        name="Take profit"
        short="TP"
        pips={draft.tpPips}
        level={quote.tp}
        pair={pair}
        optional={optional}
        suggested={suggestedPips}
        onChange={(v) => set({ tpPips: v })}
      />

      {/* Reasons */}
      <fieldset>
        <legend className="mb-1.5 text-xs font-semibold text-muted-foreground">
          Alasan ({PLAN.MIN_REASONS}–{PLAN.MAX_REASONS}) · {draft.reasons.length} dipilih
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {TRADE_REASONS.map((r) => {
            const on = draft.reasons.includes(r.id)
            const full = !on && draft.reasons.length >= PLAN.MAX_REASONS
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={on}
                disabled={full}
                onClick={() => toggleReason(r.id)}
                className={[
                  "min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors",
                  on ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                  full ? "opacity-40" : "",
                ].join(" ")}
              >
                {on && <Check className="-ml-0.5 mr-1 inline h-3 w-3" aria-hidden="true" />}
                {r.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* The calculator */}
      <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 rounded-xl bg-inset p-3.5 text-sm">
        <Row term="Nilai 1 pip" value={usd(quote.pipValue)} />
        <Row term="Margin dibutuhkan" value={usd(quote.margin)} />
        <Row term="Margin bebas setelah trade" value={usd(quote.freeMarginAfter)} />
        <Divider />
        <Row
          term="Jika SL kena"
          value={quote.loss === null ? "Tanpa batas" : `${usd(-quote.loss)} (${pct(quote.lossPct!)})`}
          tone={quote.loss === null ? undefined : "danger"}
        />
        <Row
          term="Jika TP kena"
          value={quote.gain === null ? "—" : `${usd(quote.gain, { signed: true })} (${pct(quote.gainPct!)})`}
          tone={quote.gain === null ? undefined : quote.gain >= 0 ? "success" : "danger"}
        />
        <Row term="Reward : risk" value={quote.rewardRisk === null ? "—" : `1 : ${quote.rewardRisk.toFixed(2)}`} />
        <Divider />
        <Row term={`Spread (perkiraan, ${quote.costs.spreadPips} pip)`} value={usd(quote.costs.spread)} muted />
        <Row term="Komisi" value={usd(quote.costs.commission)} muted />
        <Row term="Swap per malam (perkiraan)" value={usd(quote.swapPerNight)} muted />
        {quote.approximate && (
          <p className="col-span-2 mt-1 text-[11px] leading-snug text-faint">
            Nilai dolar pair silang memakai kurs konversi tetap (perkiraan).
          </p>
        )}
      </dl>

      <Warnings
        risk={quote.risk}
        lossPct={quote.lossPct}
        rewardRisk={quote.rewardRisk}
        optional={optional}
        hasTp={draft.tpPips !== null}
        candlesLeft={session.remaining}
        revenge={revenge ? view.lossWindow : null}
      />

      <div className="flex flex-col gap-2">
        {problems.length > 0 && (
          <ul className="flex flex-col gap-1 text-xs text-muted-foreground" aria-live="polite">
            {problems.map((p) => (
              <li key={p.field} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" /> {p.message}
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy || problems.length > 0}
          className="btn w-full"
          style={sideStyle(side)}
        >
          Konfirmasi {side.toUpperCase()} {fmtLot(quote.lot)} lot
        </button>
      </div>
    </section>
  )
}

function LevelField({
  id,
  name,
  short,
  pips,
  level,
  pair,
  optional,
  suggested,
  onChange,
}: {
  id: string
  name: string
  short: string
  pips: number | null
  level: number | null
  pair: string
  optional: boolean
  suggested: number
  onChange: (pips: number | null) => void
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-muted-foreground">{name}</span>
        {level !== null && <span className="font-mono text-muted-foreground">{fmtPrice(pair, level)}</span>}
      </div>
      {pips === null ? (
        <button type="button" onClick={() => onChange(suggested)} className="btn btn-ghost btn-sm w-full">
          Pasang {short}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <Stepper
              id={id}
              label={`jarak ${short} dalam pip`}
              value={pips}
              onChange={onChange}
              step={1}
              min={0.1}
              max={PLAN.MAX_DISTANCE_PIPS}
              decimals={1}
              unit="pip"
            />
          </div>
          {optional && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="h-11 shrink-0 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Tanpa {short}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Row({ term, value, tone, muted }: { term: string; value: string; tone?: "success" | "danger"; muted?: boolean }) {
  return (
    <>
      <dt className={muted ? "text-muted-foreground" : ""}>{term}</dt>
      <dd
        className={[
          "text-right font-mono font-semibold",
          tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : muted ? "text-muted-foreground" : "",
        ].join(" ")}
      >
        {value}
      </dd>
    </>
  )
}

const Divider = () => <div aria-hidden="true" className="col-span-2 my-0.5 h-px bg-border" />

function Warnings({
  risk,
  lossPct,
  rewardRisk,
  optional,
  hasTp,
  candlesLeft,
  revenge,
}: {
  risk: "none" | "ok" | "above" | "danger"
  lossPct: number | null
  rewardRisk: number | null
  optional: boolean
  hasTp: boolean
  candlesLeft: number
  revenge: { lot: number; candlesAgo: number } | null
}) {
  const items: { strong?: boolean; text: string }[] = []
  if (risk === "danger") {
    items.push({
      strong: true,
      text: `Risiko ${pct(lossPct!)} saldo dalam satu trade, jauh di atas batas ${DISIPLIN.MAX_RISK_PCT}%. Beberapa kekalahan seperti ini bisa menghabiskan akun.`,
    })
  } else if (risk === "above") {
    items.push({ text: `Risiko ${pct(lossPct!)} saldo, di atas batas ${DISIPLIN.MAX_RISK_PCT}%. Perkecil lot atau dekatkan SL.` })
  } else if (risk === "none" && optional) {
    items.push({ text: "Tanpa SL, kerugian trade ini tidak dibatasi sampai stop out." })
  }
  if (optional && !hasTp) items.push({ text: "Tanpa TP, reward:risk tidak bisa diperiksa." })
  if (rewardRisk !== null && rewardRisk < DISIPLIN.MIN_REWARD_RISK) {
    items.push({ text: `Target baru ${rewardRisk.toFixed(2)}× risiko. Disiplin meminta minimal ${DISIPLIN.MIN_REWARD_RISK}×.` })
  }
  if (revenge) {
    items.push({
      text: `Kamu rugi ${revenge.candlesAgo} candle lalu dengan lot ${fmtLot(revenge.lot)}. Lot lebih besar dalam ${DISIPLIN.REVENGE_WINDOW_CANDLES} candle setelah rugi dihitung revenge trade.`,
    })
  }
  if (candlesLeft > 0 && fewCandlesLeft(candlesLeft)) {
    items.push({ text: `Hanya ${candlesLeft} candle tersisa di chart ini (kurang dari ${REPLAY.LOW_CANDLES_WARNING}). Trade yang masih terbuka ditutup saat segmen habis.` })
  }
  if (items.length === 0) return null

  return (
    <ul className="flex flex-col gap-2" aria-live="polite">
      {items.map((w) => (
        <li
          key={w.text}
          className={[
            "flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs leading-relaxed",
            w.strong ? "bg-primary font-semibold text-primary-foreground" : "border border-primary/40 bg-primary/10 text-foreground",
          ].join(" ")}
        >
          {w.strong ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          )}
          {w.text}
        </li>
      ))}
    </ul>
  )
}
