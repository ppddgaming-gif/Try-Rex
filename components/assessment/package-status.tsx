"use client"

import { useTranslations } from "next-intl"
import { useAssessmentDevice } from "@/lib/assessment/device"
import type { PackageId } from "@/lib/assessment/types"

/** A package's state on this device: not started, in progress, or its last result. */
export function PackageStatus({ id }: { id: PackageId }) {
  const t = useTranslations("assessment.hub")
  const device = useAssessmentDevice()
  if (!device) return <span className="h-5 w-24 animate-pulse rounded bg-inset" aria-hidden="true" />
  const r = device.results[id]
  if (device.running.includes(id)) return <span className="text-sm font-semibold text-primary">{t("inProgress")}</span>
  if (!r) return <span className="text-sm text-muted-foreground">{t("notStarted")}</span>
  return (
    <span className="font-mono text-sm tabular-nums text-muted-foreground">
      {t("last", { scenarios: r.scenarios, complex: r.complex, complexMax: r.complexMax, basic: r.basic, basicMax: r.basicMax })}
    </span>
  )
}
