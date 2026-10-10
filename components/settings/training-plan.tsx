"use client"

import Link from "next/link"
import { RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card } from "@/components/card"
import { ResetProgress } from "@/components/progress/reset-progress"
import { Skeleton } from "@/components/progress/skeleton"
import { answerLabelKey, planFrom, type OnboardingRecord } from "@/lib/onboarding"
import { useOnboarding } from "@/lib/use-onboarding"

/**
 * Settings > Latihan: what the /start quiz decided, a way to retake it, and
 * the reset. Accounts pass their record; guests read the device.
 */
export function TrainingPlan({ serverRecord }: { serverRecord?: OnboardingRecord | null }) {
  const record = useOnboarding(serverRecord)
  const plan = planFrom(record ?? null)
  const t = useTranslations("onboarding")
  const tl = useTranslations("common.levels")
  const label = (key: string | null, fallback: string) => (key ? t(key) : fallback)

  return (
    <>
      <Card className="sm:p-7">
        <h2 className="text-base font-semibold">{t("plan.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("plan.lead")}</p>
        {record === undefined ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[62px] rounded-xl" />
            ))}
          </div>
        ) : record && !record.skipped ? (
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <Item label={t("result.startLevel")} value={tl(plan.level)} />
            <Item
              label={t("result.dailyGoal")}
              value={plan.dailyGoal ? t("result.goalCount", { n: plan.dailyGoal }) : t("result.noGoal")}
            />
            <Item label={t("result.focus")} value={label(answerLabelKey("focus", record.answers.focus), t("result.allPairs"))} />
            <Item label={t("result.experience")} value={label(answerLabelKey("experience", record.answers.experience), "—")} />
          </dl>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">
            {record?.skipped ? t("plan.skipped") : t("plan.notTaken")}
          </p>
        )}
        <Link href="/start?ulang=1&next=/pengaturan%23latihan" className="btn btn-ghost btn-sm mt-5">
          <RotateCcw className="h-4 w-4" /> {t("plan.retake")}
        </Link>
      </Card>

      <Card className="sm:p-7">
        <h2 className="text-base font-semibold">{t("plan.dataTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("plan.dataLead")}</p>
        <div className="mt-3">
          <ResetProgress />
        </div>
      </Card>
    </>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-inset px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  )
}
