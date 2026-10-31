"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, LoaderCircle, RotateCcw, XCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Confetti } from "@/components/confetti"
import { RexArt } from "@/components/rex-mascot"
import { Skeleton } from "@/components/progress/skeleton"
import type { Locale } from "@/lib/i18n/locale"
import { EXAM, type ExamResult, type PublicQuestion } from "@/lib/learn/exam/engine"
import { isUnlocked, recordExam, useLevelProgress } from "@/lib/learn/levels"
import type { LevelId } from "@/lib/learn/types"

type Paper = { token: string; questions: PublicQuestion[] }

/**
 * A level exam. The server deals the paper (no answers) and grades it; this
 * only shows questions, collects picks and, after the player submits, the
 * result with explanations. A pass is remembered on this device.
 */
export function ExamRunner({ level, hasNext }: { level: LevelId; hasNext: boolean }) {
  const t = useTranslations("learn.exam")
  const locale = useLocale() as Locale
  const progress = useLevelProgress()
  const [paper, setPaper] = useState<Paper | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [result, setResult] = useState<ExamResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function post<T>(body: object): Promise<T | null> {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/belajar/ujian", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok) {
        setError(res.status === 410 ? t("expired") : t("failed"))
        return null
      }
      return json as T
    } catch {
      setError(t("failed"))
      return null
    } finally {
      setBusy(false)
    }
  }

  async function start() {
    const res = await post<Paper>({ action: "start", level })
    if (!res) return
    setPaper(res)
    setAnswers(res.questions.map(() => null))
    setResult(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function submit() {
    if (!paper) return
    const res = await post<ExamResult>({ action: "submit", token: paper.token, answers })
    if (!res) return
    setResult(res)
    recordExam(level, res.correct, res.passed)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!progress) return <Skeleton className="h-72 w-full rounded-2xl" />
  if (!isUnlocked(progress, level)) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="font-semibold">{t("locked", { prev: level - 1 })}</p>
        <Link href={`/belajar/ujian/${level - 1}`} className="btn mt-4">
          {t("toPrev", { prev: level - 1 })}
        </Link>
      </div>
    )
  }

  // Before the paper: the rules.
  if (!paper) {
    return (
      <div className="glow-card flex flex-col items-center gap-4 rounded-2xl border border-border p-6 text-center sm:p-10">
        <RexArt size={140} mood="explain" />
        <p className="max-w-md text-muted-foreground">{t("intro", { n: EXAM.QUESTIONS, pass: EXAM.PASS })}</p>
        <p className="max-w-md text-xs text-faint">{t("introNote")}</p>
        <button type="button" onClick={start} disabled={busy} className="btn">
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} {t("start")}
        </button>
        {error && <p role="alert" className="text-sm text-primary">{error}</p>}
      </div>
    )
  }

  const answered = answers.filter((a) => a !== null).length

  return (
    <div className="flex flex-col gap-5">
      {result && (
        <section aria-live="polite" className="glow-card relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border p-6 text-center">
          {result.passed && <Confetti pieces={28} />}
          <RexArt size={120} mood={result.passed ? "happy" : "thinking"} />
          <p className="font-mono text-4xl font-bold tabular-nums">
            {result.correct}/{result.total}
          </p>
          <p className="font-display text-xl font-bold">{result.passed ? t("passTitle") : t("failTitle")}</p>
          <p className="max-w-md text-sm text-muted-foreground">{result.passed ? (hasNext ? t("passBody", { next: level + 1 }) : t("passLast")) : t("failBody", { pass: EXAM.PASS })}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {result.passed && hasNext && (
              <Link href="/belajar" className="btn">
                {t("toNext", { next: level + 1 })} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <button type="button" onClick={start} disabled={busy} className={result.passed ? "btn btn-ghost" : "btn"}>
              <RotateCcw className="h-4 w-4" /> {t("again")}
            </button>
          </div>
        </section>
      )}

      <ol className="flex flex-col gap-4">
        {paper.questions.map((q, i) => {
          const r = result?.results[i]
          return (
            <li key={q.id} className="rounded-2xl border border-border bg-card p-5">
              <p className="font-mono text-xs text-faint">{t("number", { n: i + 1, total: paper.questions.length })}</p>
              <p className="mt-1 font-display text-lg font-bold leading-snug">{q.prompt[locale]}</p>
              <div role="radiogroup" aria-label={q.prompt[locale]} className="mt-3 flex flex-col gap-2">
                {q.options.map((o, k) => {
                  const picked = answers[i] === k
                  const isRight = r ? r.answer === k : false
                  const wrongPick = r ? picked && !isRight : false
                  return (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={picked}
                      disabled={!!result || busy}
                      onClick={() => setAnswers((a) => a.map((v, j) => (j === i ? k : v)))}
                      className={[
                        "flex min-h-11 items-center gap-3 rounded-xl border px-4 py-2 text-left text-[15px] transition-colors",
                        r && isRight ? "border-success bg-success/10" : wrongPick ? "border-danger bg-danger/10" : picked ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden="true"
                        className={["flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors", picked ? "border-primary" : "border-faint"].join(" ")}
                      >
                        <span className={["radio-dot h-2.5 w-2.5 rounded-full bg-primary", picked ? "is-on" : ""].join(" ")} />
                      </span>
                      <span className="flex-1">{o[locale]}</span>
                      {r && isRight && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label={t("right")} />}
                      {wrongPick && <XCircle className="h-4 w-4 shrink-0 text-danger" aria-label={t("wrong")} />}
                    </button>
                  )
                })}
              </div>
              {r && <p className="mt-3 rounded-xl bg-inset px-4 py-3 text-sm leading-relaxed text-foreground/90">{r.explain[locale]}</p>}
            </li>
          )
        })}
      </ol>

      {!result && (
        <div className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
          <p className="font-mono text-sm tabular-nums text-muted-foreground">{t("progress", { done: answered, total: paper.questions.length })}</p>
          <button type="button" onClick={submit} disabled={busy || answered < paper.questions.length} className="btn">
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {t("submit")}
          </button>
          {error && <p role="alert" className="w-full text-sm text-primary">{error}</p>}
        </div>
      )}
    </div>
  )
}
