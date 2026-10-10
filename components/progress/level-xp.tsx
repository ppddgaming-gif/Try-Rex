"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { levelFromXp } from "@/lib/progress/derive"
import { useProgress, useProgressEvents } from "@/lib/progress/use-progress"
import { Skeleton } from "@/components/progress/skeleton"

const COUNT_MS = 500
const CHIP_MS = 700

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * "Level 1 · 25 / 100 XP" with its bar. When an answer earns XP the bar
 * grows, the number counts up, and a "+25 XP" chip floats away. None of that
 * runs when stored progress first loads, only on a real gain.
 */
export function LevelXp() {
  const progress = useProgress()
  const { level, into, needed } = levelFromXp(progress?.xp ?? 0)
  const t = useTranslations("progress")

  const [chips, setChips] = useState<{ id: number; xp: number }[]>([])
  // Where the count-up starts; null when not animating.
  const [countFrom, setCountFrom] = useState<number | null>(null)
  const [display, setDisplay] = useState<number | null>(null)
  const shownInto = useRef(into)
  const nextChip = useRef(0)

  useEffect(() => {
    shownInto.current = display ?? into
  })

  useProgressEvents((event) => {
    if (event.xpGained <= 0) return
    const id = nextChip.current++
    setChips((c) => [...c, { id, xp: event.xpGained }])
    // Removed on a timer, not animationend, so it also clears under reduced motion.
    setTimeout(() => setChips((c) => c.filter((x) => x.id !== id)), CHIP_MS)
    setCountFrom(shownInto.current)
  })

  useEffect(() => {
    if (countFrom === null) return
    const from = countFrom
    const to = into
    // A level-up wraps the number back down; jump rather than count backwards.
    const instant = to <= from || prefersReducedMotion()
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const k = instant ? 1 : Math.min(1, (now - start) / COUNT_MS)
      if (k < 1) {
        const eased = 1 - Math.pow(1 - k, 3)
        setDisplay(Math.round(from + (to - from) * eased))
        raf = requestAnimationFrame(tick)
      } else {
        setDisplay(null)
        setCountFrom(null)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [countFrom, into])

  if (!progress) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="mt-2 h-2 w-full rounded-full" />
      </div>
    )
  }

  const value = display ?? countFrom ?? into

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-primary">{t("level", { level })}</span>
        <span className="relative font-mono tabular-nums text-muted-foreground">
          <span className="text-foreground">{value}</span> / {needed} XP
          {/* Positioned out of flow so the chip never nudges the layout. */}
          {chips.map((c) => (
            <span
              key={c.id}
              aria-hidden="true"
              className="xp-chip pointer-events-none absolute -top-5 right-0 rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground"
            >
              +{c.xp} XP
            </span>
          ))}
        </span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={t("level", { level })}
        aria-valuemin={0}
        aria-valuemax={needed}
        aria-valuenow={into}
        aria-valuetext={t("xpOf", { into, needed })}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-[400ms] ease-out"
          style={{ width: `${(into / needed) * 100}%` }}
        />
      </div>
    </div>
  )
}
