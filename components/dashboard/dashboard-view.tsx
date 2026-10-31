"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { recentAttempts, totalChallenges } from "@/lib/progress/derive"
import { COMPETENCIES } from "@/lib/progress/types"
import { useProgress } from "@/lib/progress/use-progress"
import { Avatar } from "@/components/avatar"
import { Card } from "@/components/card"
import { ActivityRows } from "@/components/progress/activity-rows"
import { DailyGoal } from "@/components/progress/daily-goal"
import { AiInsight } from "@/components/progress/ai-insight"
import { CompetencyMeter } from "@/components/progress/competency-meter"
import { EmptyState } from "@/components/progress/empty-state"
import { FirstSessionHero } from "@/components/progress/first-session-hero"
import { LevelXp } from "@/components/progress/level-xp"
import { PracticeCalendar } from "@/components/progress/practice-calendar"
import { ResetProgress } from "@/components/progress/reset-progress"
import { Skeleton } from "@/components/progress/skeleton"
import { StatRow } from "@/components/progress/stat-row"
import { Streak } from "@/components/progress/streak"

/**
 * Every number here is derived from the player's own attempts. DOM order is
 * the mobile order (next action, level + streak, calendar, competencies,
 * activity, insight, daily challenge); from lg the cards pair up in two
 * columns and level + streak move to the sidebar.
 */
export function DashboardView({
  name,
  avatarUrl,
  dailyGoal,
  motivation,
  dailyChallenge,
  nextLesson,
}: {
  name: string
  avatarUrl: string | null
  /** From the /start quiz; null when the player chose no target. */
  dailyGoal: number | null
  motivation: string | null
  dailyChallenge: ReactNode
  /** The Belajar 101 card, built on the server so lesson content stays out of this bundle. */
  nextLesson: ReactNode
}) {
  const progress = useProgress()
  const started = progress !== null && totalChallenges(progress) > 0
  const t = useTranslations("dashboard")
  const tp = useTranslations("progress")

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <header className="enter flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/pengaturan#profil" aria-label={t("accountSettings")} className="rounded-full transition-transform duration-300 ease-spring hover:scale-105">
            <Avatar src={avatarUrl} name={name} size={52} />
          </Link>
          <div className="min-w-0">
            {progress ? (
              <h1 className="text-2xl font-bold tracking-tight">
                {started ? t("welcomeBack", { name }) : t("welcome", { name })}
              </h1>
            ) : (
              <Skeleton className="h-8 w-56" />
            )}
            <p className="mt-1 text-sm text-muted-foreground">{t("lead")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <Streak compact />
          </div>
          {started && (
            <Link href="/trading-game" className="btn btn-sm">
              {t("continue")} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>

      {/* 1. The next action: the first-session hero, then the stat row. */}
      <div className="enter mt-6" style={{ "--enter-delay": "60ms" } as React.CSSProperties}>
        {progress && !started ? <FirstSessionHero motivation={motivation} /> : <StatRow progress={progress} />}
      </div>

      {/* 1b. Today's target from the /start quiz. */}
      <div className="enter mt-4" style={{ "--enter-delay": "120ms" } as React.CSSProperties}>
        <DailyGoal goal={dailyGoal} />
      </div>

      {/* 2. Level + streak. The sidebar carries these from lg. */}
      <Card className="mt-4 flex flex-col gap-5 lg:hidden">
        <LevelXp />
        <Streak />
      </Card>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {/* 3. */}
        <PracticeCalendar />

        {/* 4. */}
        <Card>
          <h2 className="text-base font-semibold">{t("skills")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("skillsHint")}</p>
          <div className="mt-5 flex flex-col gap-5">
            {COMPETENCIES.map((key) => (
              <CompetencyMeter key={key} label={tp(`competencies.${key}`)} value={progress?.competencies[key] ?? null} />
            ))}
          </div>
        </Card>

        {/* 5. */}
        <Card>
          <h2 className="text-base font-semibold">{t("recent")}</h2>
          {!progress ? (
            <div className="mt-3 flex flex-col">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex min-h-14 items-center gap-3 py-2">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-8 w-28" />
                </div>
              ))}
            </div>
          ) : started ? (
            <div className="mt-2">
              <ActivityRows attempts={recentAttempts(progress, 5)} />
            </div>
          ) : (
            <EmptyState
              title={t("noActivity")}
              body={t("noActivityBody")}
              action={
                <Link href="/trading-game" className="btn btn-sm">
                  {t("firstSession")}
                </Link>
              }
            />
          )}
        </Card>

        {/* 6. */}
        <AiInsight />

        {/* 6b. Belajar 101 */}
        {nextLesson}

        {/* 7. */}
        <div className="lg:col-span-2">{dailyChallenge}</div>
      </div>

      <div className="mt-8 flex justify-center border-t border-border pt-4">
        <ResetProgress />
      </div>
    </div>
  )
}
