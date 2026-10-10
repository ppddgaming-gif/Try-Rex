"use client"

import { Lock, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { INSIGHT_UNLOCK, insightLine, totalChallenges } from "@/lib/progress/derive"
import { useProgress } from "@/lib/progress/use-progress"
import { Card } from "@/components/card"
import { EmptyState } from "@/components/progress/empty-state"
import { Skeleton } from "@/components/progress/skeleton"
import { Rex } from "@/components/rex-mascot"

/**
 * Locked until INSIGHT_UNLOCK answers. After that, one line counted from the
 * attempts. It reports what happened and invents no advice.
 */
export function AiInsight() {
  const progress = useProgress()
  const t = useTranslations("progress.insight")

  return (
    <Card>
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        {t("title")}
      </h2>

      {!progress ? (
        <div className="flex flex-col items-center py-8">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="mt-3 h-5 w-32" />
          <Skeleton className="mt-1 h-5 w-56" />
        </div>
      ) : totalChallenges(progress) < INSIGHT_UNLOCK ? (
        <Locked done={totalChallenges(progress)} />
      ) : (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-border bg-muted/40 p-4">
          <p className="flex-1 text-sm leading-relaxed">{insightLine(progress, t)}</p>
          <Rex size={48} mood="thinking" />
        </div>
      )}
    </Card>
  )
}

function Locked({ done }: { done: number }) {
  const t = useTranslations("progress.insight")
  return (
    <EmptyState icon={Lock} title={t("lockedTitle")} body={t("lockedBody", { n: INSIGHT_UNLOCK })}>
      <div className="mt-4 flex w-40 items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="h-full rounded-full bg-primary" style={{ width: `${(done / INSIGHT_UNLOCK) * 100}%` }} />
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {done} / {INSIGHT_UNLOCK}
        </span>
      </div>
    </EmptyState>
  )
}
