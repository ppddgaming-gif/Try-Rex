"use client"

import Link from "next/link"
import { CircleCheck, Lock, PenLine } from "lucide-react"
import { useTranslations } from "next-intl"
import { RexArt } from "@/components/rex-mascot"
import { Skeleton } from "@/components/progress/skeleton"
import { isUnlocked, useLevelProgress } from "@/lib/learn/levels"
import type { LevelId } from "@/lib/learn/types"

/** A level's lessons, or a lock card until the previous level's exam is passed (on this device). */
export function LevelGate({ level, children }: { level: LevelId; children: React.ReactNode }) {
  const progress = useLevelProgress()
  const t = useTranslations("learn.gate")
  if (!progress) return <Skeleton className="h-64 w-full rounded-2xl" />
  if (isUnlocked(progress, level)) return <>{children}</>
  const prev = (level - 1) as LevelId
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center">
      <RexArt size={120} mood="thinking" />
      <p className="flex items-center gap-2 font-display text-xl font-bold">
        <Lock className="h-5 w-5 text-primary" aria-hidden="true" /> {t("lockedTitle", { level })}
      </p>
      <p className="max-w-md text-sm text-muted-foreground">{t("lockedBody", { prev })}</p>
      <Link href={`/belajar/ujian/${prev}`} className="btn">
        <PenLine className="h-4 w-4" /> {t("takeExam", { level: prev })}
      </Link>
    </div>
  )
}

/** A level's state on the hub: locked, open with its exam, or passed with the best score. */
export function LevelStatus({ level, questions }: { level: LevelId; questions: number }) {
  const progress = useLevelProgress()
  const t = useTranslations("learn.gate")
  if (!progress) return <Skeleton className="h-11 w-44 rounded-xl" />
  const open = isUnlocked(progress, level)
  const passed = progress.passed.includes(level)
  const best = progress.best[level]
  if (!open) {
    return (
      <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" aria-hidden="true" /> {t("lockedShort", { prev: level - 1 })}
      </span>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      {passed && (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <CircleCheck className="h-4 w-4" aria-hidden="true" /> {t("passed", { best: best ?? 0, total: questions })}
        </span>
      )}
      <Link href={`/belajar/ujian/${level}`} className={passed ? "btn btn-ghost btn-sm" : "btn btn-sm"}>
        <PenLine className="h-4 w-4" /> {passed ? t("retake") : t("exam", { n: questions })}
      </Link>
    </div>
  )
}

/** Whether a level is open, for small badges on lesson cards. */
export function LockBadge({ level }: { level: LevelId }) {
  const progress = useLevelProgress()
  if (!progress || isUnlocked(progress, level)) return null
  return <Lock className="h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
}
