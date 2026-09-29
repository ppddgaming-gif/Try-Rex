"use client"

import { useState } from "react"
import { resetProgress } from "@/lib/progress/use-progress"

/** Small two-step "clear my progress" control at the foot of the dashboard. */
export function ResetProgress() {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex min-h-11 items-center text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
      >
        Hapus semua progres
      </button>
    )
  }

  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 text-xs">
      <span className="text-muted-foreground">
        Hapus semua XP, streak dan riwayat latihanmu? Ini tidak bisa dibatalkan.
      </span>
      <button
        type="button"
        onClick={() => {
          resetProgress()
          setConfirming(false)
        }}
        className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 font-semibold text-foreground transition-colors hover:bg-muted"
      >
        Ya, hapus
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        Batal
      </button>
    </div>
  )
}
