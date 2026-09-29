"use client"

import { Flame } from "lucide-react"
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
  const hint = current === 0 ? "Mulai streak-mu hari ini" : lit ? "Hari ini sudah latihan" : "Main 1 soal hari ini"
  const flame = lit ? "fill-warning text-warning" : "text-muted-foreground"

  if (compact) {
    return (
      <div
        className="flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-card px-3"
        title={`${hint} · Terbaik: ${progress.streak.best} hari`}
      >
        <Flame className={`h-5 w-5 ${flame}`} aria-hidden="true" />
        <span className="font-mono text-base font-bold tabular-nums">{current}</span>
        <span className="sr-only">hari berturut-turut. {hint}.</span>
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
          <span className="font-mono font-bold tabular-nums">{current}</span> hari berturut-turut
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Terbaik: <span className="font-mono tabular-nums">{progress.streak.best}</span> hari
        </p>
      </div>
    </div>
  )
}
