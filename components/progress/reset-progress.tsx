"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { resetProgress } from "@/lib/progress/use-progress"

/** Small two-step "clear my progress" control at the foot of the dashboard. */
export function ResetProgress() {
  const [confirming, setConfirming] = useState(false)
  const t = useTranslations("progress.reset")

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex min-h-11 items-center text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
      >
        {t("open")}
      </button>
    )
  }

  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 text-xs">
      <span className="text-muted-foreground">
        {t("confirm")}
      </span>
      <button
        type="button"
        onClick={() => {
          resetProgress()
          setConfirming(false)
        }}
        className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 font-semibold text-foreground transition-colors hover:bg-muted"
      >
        {t("yes")}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("cancel")}
      </button>
    </div>
  )
}
