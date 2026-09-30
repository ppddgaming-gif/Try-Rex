"use client"

import { useRef, useState } from "react"
import { PartyPopper } from "lucide-react"
import { useProgressEvents } from "@/lib/progress/use-progress"
import { Confetti } from "@/components/confetti"

const TOAST_MS = 3000

/**
 * "Naik ke Level N!" at the top centre for 3s, only when an answer crosses a
 * level boundary (never on load, never on an ordinary answer). Its lifetime
 * is a timer, so under reduced motion it still appears for 3s, just without
 * moving.
 */
export function LevelUpToast() {
  const [toast, setToast] = useState<{ id: number; level: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextId = useRef(0)

  useProgressEvents((event) => {
    if (event.leveledUpTo === null) return
    if (timer.current) clearTimeout(timer.current)
    setToast({ id: nextId.current++, level: event.leveledUpTo })
    timer.current = setTimeout(() => setToast(null), TOAST_MS)
  })

  return (
    <div role="status" aria-live="polite" className="pointer-events-none">
      {toast && (
        <div
          key={toast.id}
          className="toast-life glass-card glass-strong fixed left-1/2 top-4 z-[60] flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold"
        >
          <Confetti pieces={22} />
          <PartyPopper className="h-5 w-5 text-primary" aria-hidden="true" />
          Naik ke Level <span className="font-mono tabular-nums">{toast.level}</span>!
        </div>
      )}
    </div>
  )
}
