"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, BrainCircuit, CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { ReviewAnswer } from "@/lib/demo/state"
import { lot } from "@/lib/demo/format"
import { INTL_LOCALE, type Locale } from "@/lib/i18n/locale"

export type PickerEntry = {
  id: string
  number: number
  account: number | null
  pair: string
  side: "buy" | "sell"
  lot: number
  closed: string
  review: ReviewAnswer | null
  note: string | null
  complete: boolean
}
export type PickerMonth = { month: string; label: string; entries: PickerEntry[] }
type Quota = { left: number; limit: number; resetAt: string; resetLabel: string }

/**
 * The unevaluated journal entries by month. Picking is limited to one month
 * (the other months lock until the pick is cleared) and to `maxPerRun`;
 * entries not written enough can be picked but block Evaluate with "isi
 * jurnal dulu". The server checks all of it again.
 */
export function EvaluationPicker({ months, quota, maxPerRun, aiReady }: { months: PickerMonth[]; quota: Quota | null; maxPerRun: number; aiReady: boolean }) {
  const t = useTranslations("evaluation")
  const root = useTranslations()
  const locale = useLocale() as Locale
  const router = useRouter()
  const [picked, setPicked] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<{ text: string; retry: boolean } | null>(null)
  const [done, setDone] = useState<number | null>(null)

  const all = months.flatMap((m) => m.entries.map((e) => ({ ...e, month: m.month })))
  const chosen = all.filter((e) => picked.includes(e.id))
  const month = chosen[0]?.month ?? null
  const incomplete = chosen.some((e) => !e.complete)
  const limitReached = quota !== null && quota.left === 0

  const toggle = (id: string) => {
    setDone(null)
    setError(null)
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }

  async function evaluate() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/akun-latihan/evaluate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ journals: picked }),
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string; resetAt?: string | null; evaluated?: string[] }
      if (!res.ok) {
        const reset = body.resetAt
          ? new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(body.resetAt))
          : null
        setError({
          text: reset ? `${body.error ?? t("errors.saveFailed")} ${t("resetsAt", { time: reset })}` : (body.error ?? t("errors.saveFailed")),
          retry: body.code === "aiFailed" || body.code === "aiBusy" || body.code === "saveFailed" || res.status >= 500,
        })
        return
      }
      setDone(body.evaluated?.length ?? picked.length)
      setPicked([])
      router.refresh()
    } catch {
      setError({ text: t("errors.network"), retry: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <BrainCircuit className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-muted-foreground">
          {quota ? (limitReached ? t("quotaNone", { time: quota.resetLabel }) : t("quotaLeft", { left: quota.left, limit: quota.limit })) : t("quotaUnknown")}
        </p>
        <Link href="/akun-latihan/jurnal" className="font-semibold text-primary underline-offset-4 hover:underline">
          {t("toJournal")}
        </Link>
      </section>

      {!aiReady && <p className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm">{t("errors.unconfigured")}</p>}

      {done !== null && (
        <p role="status" className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="flex-1">{t("done", { n: done })}</span>
          <Link href="/akun-latihan/jurnal" className="btn btn-sm">
            {t("seeInJournal")}
          </Link>
        </p>
      )}

      {months.map((m) => {
        const locked = month !== null && month !== m.month
        return (
          <section key={m.month} aria-labelledby={`m-${m.month}`} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`m-${m.month}`} className="font-display text-lg font-bold">
                {m.label}
              </h2>
              <p className="text-xs text-muted-foreground">{locked ? t("otherMonth") : t("count", { n: m.entries.length })}</p>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {m.entries.map((e) => {
                const on = picked.includes(e.id)
                const full = !on && picked.length >= maxPerRun
                const disabled = busy || locked || full
                return (
                  <li key={e.id}>
                    <label
                      className={[
                        "flex min-h-14 items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                        on ? "border-primary bg-primary/10" : "border-border bg-inset",
                        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary/40",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                        checked={on}
                        disabled={disabled}
                        onChange={() => toggle(e.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold">
                          <span className="font-mono text-xs text-muted-foreground">
                            {e.account !== null ? t("tradeOf", { n: e.number, account: e.account }) : `#${e.number}`}
                          </span>
                          {e.pair}
                          <span className={e.side === "buy" ? "text-success" : "text-danger"}>{e.side.toUpperCase()}</span>
                          <span className="font-mono text-xs font-normal text-muted-foreground">{lot(e.lot)} lot</span>
                        </span>
                        <span className="block text-xs text-muted-foreground">{e.closed}</span>
                        <span className="mt-1 block text-xs">
                          {e.review ? root(`demo.ui.review.${e.review}`) : <span className="text-faint">{t("noReview")}</span>}
                          {" · "}
                          {e.note ? <span>&ldquo;{e.note}&rdquo;</span> : <span className="text-faint">{t("noNote")}</span>}
                        </span>
                      </span>
                      {!e.complete && (
                        <span className="shrink-0 rounded-full border border-primary/50 px-2 py-0.5 text-[11px] font-semibold text-primary">{t("fillFirst")}</span>
                      )}
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      <section className="sticky bottom-3 flex flex-col gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold">{picked.length ? t("picked", { n: picked.length, max: maxPerRun }) : t("pickHint")}</p>
          {incomplete && (
            <p className="mt-0.5 text-xs text-primary">
              {t("fillFirstLong")}{" "}
              <Link href="/akun-latihan/jurnal" className="font-semibold underline underline-offset-4">
                {t("toJournal")}
              </Link>
            </p>
          )}
          {error && (
            <p role="alert" className="mt-1 flex items-start gap-1.5 text-xs text-primary">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {error.text}
            </p>
          )}
        </div>
        <button
          type="button"
          className="btn shrink-0"
          disabled={busy || picked.length === 0 || incomplete || limitReached || !aiReady}
          onClick={() => void evaluate()}
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : error?.retry ? <RotateCcw className="h-4 w-4" aria-hidden="true" /> : <BrainCircuit className="h-4 w-4" aria-hidden="true" />}
          {busy ? t("evaluating") : error?.retry ? t("retry") : t("evaluate")}
        </button>
      </section>

      <p className="text-xs text-faint">{t("disclaimer")}</p>
    </div>
  )
}
