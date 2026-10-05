"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, CalendarCheck, Gauge, LineChart } from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import { Rex } from "@/components/rex-mascot"
import {
  LEVEL_LABELS,
  MOTIVATION_LINES,
  ONBOARDING_VERSION,
  QUESTIONS,
  answerLabel,
  planFrom,
  type Answers,
  type OnboardingRecord,
} from "@/lib/onboarding"
import { saveOnboarding } from "@/lib/profile-actions"
import { readLocalOnboarding, saveLocalOnboarding, useOnboarding } from "@/lib/use-onboarding"

type Step = { kind: "question"; index: number } | { kind: "result" }

const TOTAL = QUESTIONS.length
const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties

/**
 * /start: five questions, then the plan. Accounts fill in their profile on
 * /lengkapi-profil, which reuses QuestionStep; here they only retake the quiz.
 * Layout follows the "Try-Rex Screens" design: a left rail with the promise
 * and the progress, the question on the right.
 */
export function OnboardingFlow({
  signedIn,
  existing,
  redo,
  next,
}: {
  signedIn: boolean
  /** The record already on the account, if any. */
  existing: OnboardingRecord | null
  /** ?ulang=1: answer again even though a record exists. */
  redo: boolean
  next: string
}) {
  const router = useRouter()
  // Decided once on mount, so a router.refresh() mid-flow (after a photo
  // upload) can't bounce the player to another step.
  const [step, setStep] = useState<Step>(() =>
    existing && !redo ? { kind: "result" } : { kind: "question", index: 0 },
  )
  const [answers, setAnswers] = useState<Answers>(() => (redo && existing ? { ...existing.answers } : {}))
  const [record, setRecord] = useState<OnboardingRecord | null>(existing && !redo ? existing : null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [restarted, setRestarted] = useState(false)
  const synced = useRef(false)

  // A guest who already finished the quiz on this device sees their plan
  // rather than the first question, until they choose to redo it.
  const local = useOnboarding()
  const answered = QUESTIONS.filter((q) => answers[q.id]).length
  const showLocal =
    !signedIn && !redo && !restarted && Boolean(local) && step.kind === "question" && step.index === 0 && answered === 0
  const view: Step = showLocal ? { kind: "result" } : step
  const shownRecord = showLocal ? (local ?? null) : record

  // Answered as a guest, then signed up: carry the device's answers over to
  // the account instead of asking again.
  useEffect(() => {
    if (synced.current || !signedIn || existing || redo) return
    synced.current = true
    const saved = readLocalOnboarding()
    if (!saved) return
    const local = saved
    saveOnboarding(local).then(({ ok }) => {
      if (!ok) return
      setRecord(local)
      setAnswers(local.answers)
      setStep({ kind: "result" })
    })
  }, [signedIn, existing, redo])

  async function finish(skipped: boolean) {
    const done: OnboardingRecord = {
      version: ONBOARDING_VERSION,
      answers: skipped ? {} : answers,
      skipped,
      completedAt: new Date().toISOString(),
    }
    saveLocalOnboarding(done)
    setRecord(done)
    // A retake only replaces the stored answers once the new ones are complete.
    if (signedIn) await saveOnboarding(done)
    setDirection(1)
    setStep({ kind: "result" })
  }

  function go(to: Step, dir: 1 | -1) {
    setDirection(dir)
    setStep(to)
  }

  const progress = view.kind === "question" ? answered / TOTAL : 1

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Left rail: the promise and the progress. A slim top bar on phones. */}
      <aside className="glass-rail relative flex flex-col border-b border-border px-5 py-4 lg:sticky lg:top-0 lg:h-dvh lg:w-[29%] lg:min-w-[340px] lg:max-w-[420px] lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <BrandMark />
          <span className="font-mono text-xs text-muted-foreground lg:hidden">
            {view.kind === "question" ? `${view.index + 1} dari ${TOTAL}` : "Selesai"}
          </span>
        </div>

        <div className="hidden flex-1 flex-col justify-center lg:flex">
          <h2 className="enter text-[34px] font-extrabold leading-[1.08]">Lima pertanyaan, lalu kita mulai.</h2>
          <p className="enter mt-5 leading-relaxed text-muted-foreground" style={delay(80)}>
            Jawabannya menentukan jalur latihan dan tingkat kesulitan soal pertamamu. Tidak ada jawaban salah —
            termasuk &ldquo;belum tahu&rdquo;.
          </p>
        </div>

        <div className="mt-3 lg:mt-0">
          <div className="hidden items-baseline justify-between font-mono text-xs lg:flex">
            <span className="text-muted-foreground">
              {view.kind === "question" ? `${view.index + 1} dari ${TOTAL}` : `${TOTAL} dari ${TOTAL}`}
            </span>
            <span className="text-primary">{Math.round(progress * 100)}%</span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-inset ring-1 ring-border lg:mt-3"
            role="progressbar"
            aria-label="Progres kuis"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <div
              className="h-full origin-left rounded-full bg-primary transition-transform duration-700 ease-spring"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
          {view.kind === "question" && (
            <button
              type="button"
              onClick={() => finish(true)}
              className="mt-3 inline-flex min-h-11 items-center text-xs text-faint transition-colors hover:text-foreground lg:mt-5"
            >
              Lewati kuis, pakai pengaturan standar
            </button>
          )}
        </div>
      </aside>

      <main className="flex flex-1 items-start justify-center px-5 py-8 sm:py-14 lg:items-center lg:px-16">
        <div className="w-full max-w-[694px]">
          {view.kind === "question" && (
            <QuestionStep
              key={view.index}
              index={view.index}
              direction={direction}
              value={answers[QUESTIONS[view.index].id]}
              onPick={(v) => setAnswers((a) => ({ ...a, [QUESTIONS[view.index].id]: v }))}
              onNext={() => (view.index === TOTAL - 1 ? finish(false) : go({ kind: "question", index: view.index + 1 }, 1))}
              onBack={view.index > 0 ? () => go({ kind: "question", index: view.index - 1 }, -1) : null}
            />
          )}

          {view.kind === "result" && (
            <ResultStep
              record={shownRecord}
              signedIn={signedIn}
              onStart={() => {
                router.push(next)
                router.refresh()
              }}
              onRedo={() => {
                setRestarted(true)
                setAnswers({})
                go({ kind: "question", index: 0 }, -1)
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export function QuestionStep({
  index,
  direction,
  value,
  onPick,
  onNext,
  onBack,
}: {
  index: number
  direction: 1 | -1
  value: string | undefined
  onPick: (value: string) => void
  onNext: () => void
  onBack: (() => void) | null
}) {
  const q = QUESTIONS[index]
  const group = useRef<HTMLDivElement>(null)

  // 1–4 pick an option, Enter moves on: the whole quiz works from the keyboard.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const n = Number(e.key)
      if (n >= 1 && n <= q.options.length) {
        e.preventDefault()
        onPick(q.options[n - 1].value)
      } else if (e.key === "Enter" && value && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault()
        onNext()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [q, value, onPick, onNext])

  return (
    <div className={direction === 1 ? "step-forward" : "step-back"}>
      <p className="eyebrow font-mono">Pertanyaan {index + 1}</p>
      <h1 id={`q-${q.id}`} className="mt-3 text-[32px] font-extrabold leading-[1.1] sm:text-[42px]">
        {q.title}
      </h1>

      <div ref={group} role="radiogroup" aria-labelledby={`q-${q.id}`} className="mt-8 flex flex-col gap-3">
        {q.options.map((o, i) => {
          const selected = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (!value && i === 0) ? 0 : -1}
              onClick={() => onPick(o.value)}
              onKeyDown={(e) => {
                if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return
                e.preventDefault()
                const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1
                const nextIndex = (i + step + q.options.length) % q.options.length
                onPick(q.options[nextIndex].value)
                group.current?.querySelectorAll<HTMLButtonElement>("[role=radio]")[nextIndex]?.focus()
              }}
              style={delay(60 + i * 45)}
              className={[
                "option enter flex items-center gap-4 rounded-2xl border px-5 py-4 text-left",
                selected ? "border-primary/70 bg-primary/10" : "border-border bg-card hover:border-faint hover:bg-muted/60",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
                  selected ? "border-primary" : "border-faint",
                ].join(" ")}
              >
                <span className={`radio-dot h-2.5 w-2.5 rounded-full bg-primary ${selected ? "is-on" : ""}`} />
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] font-semibold">{o.label}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{o.sub}</span>
              </span>
              <kbd className="ml-auto hidden font-mono text-[11px] text-faint [@media(hover:hover)]:inline">{i + 1}</kbd>
            </button>
          )
        })}
      </div>

      <div className="mt-8 flex items-center gap-5">
        <button type="button" onClick={onNext} disabled={!value} className="btn">
          {index === TOTAL - 1 ? "Selesai" : "Lanjut"}
          <ArrowRight className="h-4 w-4" />
        </button>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Kembali
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        )}
      </div>
    </div>
  )
}

function ResultStep({
  record,
  signedIn,
  onStart,
  onRedo,
}: {
  record: OnboardingRecord | null
  signedIn: boolean
  onStart: () => void
  onRedo: () => void
}) {
  const plan = planFrom(record)
  const skipped = !record || record.skipped
  const items = [
    { icon: Gauge, label: "Mulai di tingkat", value: LEVEL_LABELS[plan.level] },
    {
      icon: LineChart,
      label: "Fokus pair",
      value: skipped ? "Semua pair" : (answerLabel("focus", record?.answers.focus) ?? "Semua pair"),
    },
    { icon: CalendarCheck, label: "Target harian", value: plan.dailyGoal ? `${plan.dailyGoal} soal` : "Tanpa target" },
  ]

  return (
    <div className="step-forward">
      <Rex size={84} mood="happy" className="pop-in" />
      <p className="eyebrow mt-6 font-mono">{skipped ? "Pengaturan standar" : "Jalurmu siap"}</p>
      <h1 className="mt-3 text-[32px] font-extrabold leading-[1.1] sm:text-[42px]">
        {skipped ? "Oke, kita mulai dari dasar." : "Ini jalur latihanmu."}
      </h1>

      <dl className="mt-8 grid gap-3 sm:grid-cols-3">
        {items.map((it, i) => (
          <div key={it.label} className="glass-card enter rounded-2xl p-4" style={delay(120 + i * 70)}>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <it.icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {it.label}
            </dt>
            <dd className="mt-1.5 font-display text-lg font-bold">{it.value}</dd>
          </div>
        ))}
      </dl>

      {plan.motivation && MOTIVATION_LINES[plan.motivation] && (
        <p className="enter mt-6 flex gap-3 rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground" style={delay(360)}>
          <Rex size={28} className="mt-0.5" />
          {MOTIVATION_LINES[plan.motivation]}
        </p>
      )}

      <div className="enter mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={delay(420)}>
        <button type="button" onClick={onStart} className="btn btn-lg">
          Mulai soal pertama <ArrowRight className="h-4 w-4" />
        </button>
        {!signedIn && (
          <Link href="/signup" className="btn btn-ghost btn-lg">
            Buat akun untuk simpan profil
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={onRedo}
        className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        Ulangi kuis
      </button>
    </div>
  )
}
