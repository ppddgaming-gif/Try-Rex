"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, LogOut } from "lucide-react"
import { AvatarUploader } from "@/components/account/avatar-uploader"
import { ProfileForm } from "@/components/account/account-forms"
import { BrandMark } from "@/components/brand-mark"
import { QuestionStep } from "@/components/onboarding/onboarding-flow"
import { Rex } from "@/components/rex-mascot"
import { signOut } from "@/lib/auth-actions"
import { ONBOARDING_VERSION, QUESTIONS, type Answers, type OnboardingRecord } from "@/lib/onboarding"
import { completeProfile, saveOnboarding } from "@/lib/profile-actions"
import { readLocalOnboarding, saveLocalOnboarding } from "@/lib/use-onboarding"

type Account = {
  id: string
  displayName: string
  username: string | null
  avatarUrl: string | null
  profileExtras: boolean
}

type Stage = { kind: "profile" } | { kind: "photo" } | { kind: "quiz"; index: number } | { kind: "finish" }

/**
 * /lengkapi-profil. Step 1: name, username (required) and an optional photo.
 * Step 2: the /start quiz, skipped when the account already has answers or
 * this device has a guest's. Then the profile is marked complete on the
 * server and the player goes on to `next`, where the welcome tour starts.
 */
export function CompleteProfile({ account, needsQuiz, next }: { account: Account; needsQuiz: boolean; next: string }) {
  const router = useRouter()
  // Decided once, so the router.refresh() after a photo upload can't move
  // the player to another step.
  const [withProfile] = useState(() => !account.username)
  const [quizDue, setQuizDue] = useState(needsQuiz)
  const [stage, setStage] = useState<Stage>(() =>
    !account.username ? { kind: "profile" } : needsQuiz ? { kind: "quiz", index: 0 } : { kind: "finish" },
  )
  const [answers, setAnswers] = useState<Answers>({})
  const [direction, setDirection] = useState<1 | -1>(1)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const imported = useRef(false)

  // Did the quiz as a guest on this device, then signed up: keep those
  // answers instead of asking again.
  useEffect(() => {
    if (imported.current || !needsQuiz) return
    imported.current = true
    const local = readLocalOnboarding()
    if (!local) return
    saveOnboarding(local).then(({ ok }) => {
      if (!ok) return
      setQuizDue(false)
      setNotice("Jawaban kuismu sebelumnya sudah tersimpan di akunmu, jadi tinggal satu langkah.")
      setStage((s) => (s.kind === "quiz" ? { kind: "finish" } : s))
    })
  }, [needsQuiz])

  // The last step: record that the profile is complete, then go on.
  const finishing = stage.kind === "finish"
  useEffect(() => {
    if (!finishing) return
    let live = true
    completeProfile().then((res) => {
      if (!live) return
      if (!res.ok) return setError(res.error ?? "Gagal menyimpan. Coba lagi.")
      router.replace(next)
      router.refresh()
    })
    return () => {
      live = false
    }
  }, [finishing, attempt, next, router])

  async function finishQuiz(skipped: boolean) {
    const record: OnboardingRecord = {
      version: ONBOARDING_VERSION,
      answers: skipped ? {} : answers,
      skipped,
      completedAt: new Date().toISOString(),
    }
    saveLocalOnboarding(record)
    const { ok } = await saveOnboarding(record)
    if (!ok) return setError("Jawabanmu belum tersimpan. Coba lagi.")
    setError(null)
    setStage({ kind: "finish" })
  }

  function go(to: Stage, dir: 1 | -1) {
    setDirection(dir)
    setStage(to)
  }

  const total = (withProfile ? 1 : 0) + (quizDue || stage.kind === "quiz" ? 1 : 0)
  const current = stage.kind === "quiz" || (stage.kind === "finish" && total === 2) ? total : 1
  const progressLabel = total <= 1 ? "Satu langkah lagi" : `Langkah ${current} dari ${total}`
  const progress =
    stage.kind === "finish" ? 1 : stage.kind === "quiz" ? (total === 2 ? 0.5 : 0) + (stage.index / QUESTIONS.length) / total : stage.kind === "photo" ? 0.5 / total : 0

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="glass-bar sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <BrandMark />
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Keluar
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:py-12">
        <div className="flex items-baseline justify-between font-mono text-xs">
          <span className="text-muted-foreground">{progressLabel}</span>
          {stage.kind === "quiz" && (
            <span className="text-faint">
              Pertanyaan {stage.index + 1} dari {QUESTIONS.length}
            </span>
          )}
        </div>
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-inset ring-1 ring-border"
          role="progressbar"
          aria-label="Progres melengkapi profil"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div
            className="h-full origin-left rounded-full bg-primary transition-transform duration-700 ease-spring"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>

        {notice && (
          <p role="status" className="mt-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
            {notice}
          </p>
        )}

        <div className="mt-8">
          {stage.kind === "profile" && (
            <div key="profile" className={direction === 1 ? "step-forward" : "step-back"}>
              <p className="eyebrow font-mono">Kenalan dulu</p>
              <h1 className="mt-3 text-[32px] font-extrabold leading-[1.1] sm:text-[40px]">Siapa namamu di TRY-REX?</h1>
              <p className="mt-3 text-muted-foreground">
                Nama dan username tampil di profilmu. Keduanya bisa diubah kapan saja di Pengaturan.
              </p>
              <div className="glass-card mt-8 rounded-2xl p-5 sm:p-7">
                <ProfileForm
                  name={account.displayName}
                  username={account.username}
                  disabledUsername={!account.profileExtras}
                  requireUsername
                  submitLabel="Simpan dan lanjut"
                  onSaved={() => go({ kind: "photo" }, 1)}
                />
              </div>
            </div>
          )}

          {stage.kind === "photo" && (
            <div key="photo" className={direction === 1 ? "step-forward" : "step-back"}>
              <p className="eyebrow font-mono">Opsional</p>
              <h1 className="mt-3 text-[32px] font-extrabold leading-[1.1] sm:text-[40px]">Tambah foto profil?</h1>
              <p className="mt-3 text-muted-foreground">Tanpa foto, profilmu memakai inisial namamu. Bisa diatur nanti.</p>
              <div className="glass-card mt-8 rounded-2xl p-5 sm:p-7">
                <AvatarUploader
                  userId={account.id}
                  name={account.displayName}
                  src={account.avatarUrl}
                  disabled={!account.profileExtras}
                />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                {account.avatarUrl ? (
                  <button type="button" onClick={() => go(quizDue ? { kind: "quiz", index: 0 } : { kind: "finish" }, 1)} className="btn">
                    Lanjut <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => go(quizDue ? { kind: "quiz", index: 0 } : { kind: "finish" }, 1)}
                    className="btn btn-ghost"
                  >
                    Nanti saja
                  </button>
                )}
              </div>
            </div>
          )}

          {stage.kind === "quiz" && (
            <>
              <QuestionStep
                key={stage.index}
                index={stage.index}
                direction={direction}
                value={answers[QUESTIONS[stage.index].id]}
                onPick={(v) => setAnswers((a) => ({ ...a, [QUESTIONS[stage.index].id]: v }))}
                onNext={() =>
                  stage.index === QUESTIONS.length - 1
                    ? void finishQuiz(false)
                    : go({ kind: "quiz", index: stage.index + 1 }, 1)
                }
                onBack={
                  stage.index > 0
                    ? () => go({ kind: "quiz", index: stage.index - 1 }, -1)
                    : withProfile
                      ? () => go({ kind: "photo" }, -1)
                      : null
                }
              />
              <button
                type="button"
                onClick={() => void finishQuiz(true)}
                className="mt-6 inline-flex min-h-11 items-center text-sm text-faint transition-colors hover:text-foreground"
              >
                Lewati kuis, pakai pengaturan standar
              </button>
            </>
          )}

          {stage.kind === "finish" && (
            <div key="finish" className="step-forward flex flex-col items-start">
              <Rex size={72} mood={error ? "grimace" : "thinking"} />
              <h1 className="mt-4 text-[28px] font-extrabold leading-[1.1]">
                {error ? "Belum tersimpan" : "Menyiapkan akunmu…"}
              </h1>
              {error && (
                <>
                  <p role="alert" className="mt-3 text-muted-foreground">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null)
                      setAttempt((n) => n + 1)
                    }}
                    className="btn mt-6"
                  >
                    Coba lagi
                  </button>
                </>
              )}
            </div>
          )}

          {error && stage.kind === "quiz" && (
            <p role="alert" className="mt-4 text-sm text-primary">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
