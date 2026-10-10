"use client"

import { Flame } from "lucide-react"
import { useTranslations } from "next-intl"
import { liveStreak, playedToday } from "@/lib/progress/derive"
import { useProgress, useToday } from "@/lib/progress/use-progress"
import { Skeleton } from "@/components/progress/skeleton"

/**
 * Daily streak: the flame lights up (warning colour, filled) once a question
 * is answered today. `compact` is the one-line header version.
 */
export function Streak({ compact = false }: { compact?: boolean }) {
  const progress = useProgress()
  const today = useToday()
  const t = useTranslations("progress.streak")
  const num = (c: React.ReactNode) => <span className="font-mono font-bold tabular-nums">{c}</span>

  if (!progress || !today) {
    return compact ? (
      <Skeleton className="h-11 w-16 rounded-xl" />
    ) : (
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    )
  }

  const current = liveStreak(progress.streak, today)
  const lit = playedToday(progress.streak, today)
  const hint = current === 0 ? t("start") : lit ? t("doneToday") : t("playOne")
  const flame = lit ? "flicker fill-warning text-warning" : "text-muted-foreground"

  if (compact) {
    return (
      <div
        className="flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-card px-3"
        title={t("compactTitle", { hint, best: progress.streak.best })}
      >
        <Flame className={`h-5 w-5 ${flame}`} aria-hidden="true" />
        <span className="font-mono text-base font-bold tabular-nums">{current}</span>
        <span className="sr-only">{t("srDays", { hint })}</span>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <Flame className={`h-5 w-5 ${flame}`} aria-hidden="true" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-sm">
          {t.rich("days", { n: current, num })}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t.rich("best", { n: progress.streak.best, num: (c) => <span className="font-mono tabular-nums">{c}</span> })}
        </p>
      </div>
    </div>
  )
}
