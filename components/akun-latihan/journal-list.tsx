"use client"

import { useId, useState } from "react"
import { ChevronDown, LoaderCircle, PencilLine } from "lucide-react"
import { postJson } from "@/components/akun-latihan/post-json"
import { CheckList, EXIT_LABELS, RexComments } from "@/components/akun-latihan/trade-parts"
import { REVIEW } from "@/lib/demo/config"
import { lot, pct, price, usd } from "@/lib/demo/format"
import type { JournalRow } from "@/lib/demo/journal"
import type { ReviewAnswer } from "@/lib/demo/state"
import { reasonLabel } from "@/lib/reasons"

/** A journal row with its candle times already formatted on the server (no clock or locale in the browser). */
export type JournalItem = JournalRow & { entryLabel: string | null; exitLabel: string | null }

const REVIEW_LABELS: Record<ReviewAnswer, string> = { ya: "Ya", sebagian: "Sebagian", tidak: "Tidak" }

const tone = (v: number) => (v > 0 ? "text-success" : v < 0 ? "text-danger" : "")

/**
 * The Trading Journal: one row per closed trade, newest first. A row opens
 * to the whole plan, the result, the Disiplin checks, Rex's comment and the
 * player's own note ("Tambah catatan").
 */
export function JournalList({ rows }: { rows: JournalItem[] }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <JournalEntry key={r.id} row={r} />
      ))}
    </ol>
  )
}

function JournalEntry({ row: r }: { row: JournalItem }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <li className="glass-card overflow-hidden rounded-2xl">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 sm:px-5"
      >
        <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">#{r.number}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold">
            {r.pair}
            <span className={r.side === "buy" ? "text-success" : "text-danger"}>{r.side.toUpperCase()}</span>
            <span className="font-mono text-xs font-normal text-muted-foreground">{lot(r.lot)} lot</span>
          </span>
          <span className="block text-xs text-muted-foreground">
            {r.entryLabel ?? "Candle tidak tersedia"} · {EXIT_LABELS[r.exitReason]}
          </span>
        </span>
        <span className="text-right">
          <span className={`block font-mono text-sm font-bold ${tone(r.total)}`}>{usd(r.total, { signed: true })}</span>
          <span className="block font-mono text-xs text-primary">Disiplin {r.score}%</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out-expo ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <div id={panelId} data-open={open} className="expand">
        <div>
          <div className="flex flex-col gap-4 border-t border-border px-4 py-4 sm:px-5">
            <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <Field label="Entry" value={price(r.pair, r.entry)} sub={r.entryLabel ?? undefined} />
              <Field label="Exit" value={price(r.pair, r.exit)} sub={r.exitLabel ?? EXIT_LABELS[r.exitReason]} />
              <Field label="Stop loss" value={level(r.pair, r.slInitial, r.sl)} sub={r.riskPct === null ? "Tanpa SL" : `Risiko ${pct(r.riskPct)}`} />
              <Field
                label="Take profit"
                value={level(r.pair, r.tpInitial, r.tp)}
                sub={r.rewardRisk === null ? "Tanpa R:R" : `R:R 1 : ${r.rewardRisk.toFixed(2)}`}
              />
              <Field label="Pips" value={`${r.pips > 0 ? "+" : ""}${r.pips.toFixed(1)}`} tone={tone(r.pips)} />
              <Field label="Hasil trade" value={usd(r.net, { signed: true })} tone={tone(r.net)} />
              <Field label="Swap" value={usd(r.swap, { signed: true })} tone={tone(r.swap)} />
              <Field label="Total" value={usd(r.total, { signed: true })} tone={tone(r.total)} />
            </dl>

            <div>
              <p className="text-xs font-semibold text-muted-foreground">Alasan</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {r.reasons.map((id) => (
                  <li key={id} className="rounded-full border border-border px-2.5 py-1 text-xs">
                    {reasonLabel(id)}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">
                  Disiplin <span className="font-mono text-primary">{r.score}%</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.counted ? `+${r.xp} XP` : "Tidak dihitung: ditutup di candle yang sama saat dibuka"}
                </p>
              </div>
              <div className="mt-2">
                <CheckList checks={r.checks} />
              </div>
            </div>

            <RexComments comments={r.rex} />

            <div>
              <p className="text-xs font-semibold text-muted-foreground">Apakah kamu mengikuti rencanamu?</p>
              <p className="mt-1 text-sm">{r.review ? REVIEW_LABELS[r.review] : <span className="text-muted-foreground">Belum dijawab</span>}</p>
            </div>

            <Note tradeId={r.id} initial={r.note} />
          </div>
        </div>
      </div>
    </li>
  )
}

/** "1.16700", or "1.16700 → 1.16900" when it was moved, or "—". */
function level(pair: string, initial: number | null, final: number | null) {
  if (initial === null && final === null) return "—"
  if (initial === final) return price(pair, initial!)
  const fmt = (v: number | null) => (v === null ? "tanpa" : price(pair, v))
  return `${fmt(initial)} → ${fmt(final)}`
}

function Field({ label, value, sub, tone = "" }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="rounded-lg bg-inset px-2.5 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`break-words font-mono text-[13px] font-semibold ${tone}`}>{value}</dd>
      {sub && <dd className="mt-0.5 text-[11px] text-faint">{sub}</dd>}
    </div>
  )
}

/** "Tambah catatan": the player's own note on the trade. Saved on the server; never scored. */
function Note({ tradeId, initial }: { tradeId: string; initial: string | null }) {
  const [note, setNote] = useState(initial)
  const [draft, setDraft] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fieldId = useId()

  async function save() {
    if (draft === null) return
    setBusy(true)
    setError(null)
    const res = await postJson<{ note?: string | null }>("/api/akun-latihan/trade/note", { trade: tradeId, note: draft })
    setBusy(false)
    if (res.error) return setError(res.error)
    setNote(res.note ?? null)
    setDraft(null)
  }

  if (draft !== null) {
    return (
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void save()
        }}
      >
        <label htmlFor={fieldId} className="text-xs font-semibold text-muted-foreground">
          Catatan
        </label>
        <input
          id={fieldId}
          value={draft}
          maxLength={REVIEW.NOTE_MAX_CHARS}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Misalnya: masuk sebelum candle konfirmasi selesai"
          autoFocus
          className="h-11 rounded-lg border border-border bg-inset px-3 text-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={busy} className="btn btn-sm">
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Simpan catatan
          </button>
          <button type="button" onClick={() => setDraft(null)} disabled={busy} className="btn btn-ghost btn-sm">
            Batal
          </button>
          <span className="ml-auto font-mono text-[11px] text-faint">
            {draft.length}/{REVIEW.NOTE_MAX_CHARS}
          </span>
        </div>
        {error && (
          <p role="alert" className="text-sm text-primary">
            {error}
          </p>
        )}
      </form>
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">Catatan</p>
      {note && <p className="mt-1 text-sm">&ldquo;{note}&rdquo;</p>}
      <button
        type="button"
        onClick={() => setDraft(note ?? "")}
        className="mt-1.5 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-primary hover:bg-primary/10 -ml-2"
      >
        <PencilLine className="h-4 w-4" aria-hidden="true" /> {note ? "Ubah catatan" : "Tambah catatan"}
      </button>
    </div>
  )
}
