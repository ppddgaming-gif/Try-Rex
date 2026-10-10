"use client"

import Link from "next/link"
import { CircleCheck, Target } from "lucide-react"
import { useTranslations } from "next-intl"
import { attemptsPerDay } from "@/lib/progress/derive"
import { useProgress, useToday } from "@/lib/progress/use-progress"
import { Card } from "@/components/card"
import { Skeleton } from "@/components/progress/skeleton"

const SIZE = 88
const STROKE = 9
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R

/**
 * Today's answers against the target the player chose on /start. Both
 * numbers are theirs: the count from their attempts, the goal from their
 * answer. With no target set, the card says so and offers the quiz.
 */
export function DailyGoal({ goal }: { goal: number | null }) {
  const progress = useProgress()
  const today = useToday()
  const ready = progress && today
  const done = ready ? (attemptsPerDay(progress.attempts).get(today) ?? 0) : 0
  const ratio = goal ? Math.min(1, done / goal) : 0
  const met = goal !== null && done >= goal
  const t = useTranslations("progress.goal")

  return (
    <Card className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        {ready ? (
          <>
            <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden="true">
              <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--inset)" strokeWidth={STROKE} />
              {goal && (
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - ratio)}
                  className="transition-[stroke-dashoffset] duration-1000 ease-spring"
                />
              )}
            </svg>
            <span className="absolute inset-0 flex items-center justify-center">
              {met ? (
                <CircleCheck className="pop-in h-8 w-8 text-primary" aria-hidden="true" />
              ) : (
                <span className="font-mono text-xl font-bold tabular-nums">{done}</span>
              )}
            </span>
          </>
        ) : (
          <Skeleton className="h-full w-full rounded-full" />
        )}
      </div>

      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Target className="h-4 w-4 text-primary" aria-hidden="true" /> {t("title")}
        </h2>
        {!ready ? (
          <Skeleton className="mt-2 h-4 w-40" />
        ) : goal ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {t.rich("count", {
              done: Math.min(done, goal),
              goal,
              b: (c) => <span className="font-mono font-semibold text-foreground">{c}</span>,
            })}
            {met ? t("met") : ""}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            {t("none")}{" "}
            <Link href="/start?ulang=1&next=/dashboard" className="font-semibold text-primary hover:text-primary-hi">
              {t("setUp")}
            </Link>
          </p>
        )}
        {ready && goal && !met && (
          <p className="mt-0.5 text-xs text-faint">
            {t("left", { n: goal - done })}
          </p>
        )}
      </div>
    </Card>
  )
}
