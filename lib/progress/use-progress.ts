"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"
import { localDateKey } from "@/lib/progress/derive"
import { progressStore, type ProgressEvent } from "@/lib/progress/store"
import type { Attempt, Progress } from "@/lib/progress/types"

const subscribe = (onChange: () => void) => progressStore().subscribe(onChange)
const getSnapshot = () => progressStore().loadProgress()
// Storage only exists in the browser. The server render and the first client
// render both see null and show skeletons, so hydration always matches; the
// real progress arrives right after.
const getServerSnapshot = () => null

/** Progress, or null while it hasn't loaded yet (render a skeleton). */
export function useProgress(): Progress | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** Run `handler` for each recorded attempt (XP chip, level-up toast). */
export function useProgressEvents(handler: (event: ProgressEvent) => void) {
  // Latest handler in a ref, so callers can pass an inline function without
  // resubscribing on every render.
  const ref = useRef(handler)
  useEffect(() => {
    ref.current = handler
  })
  useEffect(
    () =>
      progressStore().subscribe((event) => {
        if (event) ref.current(event)
      }),
    [],
  )
}

export function recordAttempt(attempt: Omit<Attempt, "createdAt">) {
  return progressStore().recordAttempt(attempt)
}

export function resetProgress() {
  progressStore().resetProgress()
}

/**
 * Today as a local date key, or null on the server and first render. Read
 * after mount so a date never reaches server HTML, where it would mismatch
 * across time zones and midnight. Rechecked every minute so a page left open
 * past midnight rolls over.
 */
export function useToday() {
  return useSyncExternalStore(subscribeToClock, () => localDateKey(new Date()), () => null)
}

/** Current time in ms, refreshed every minute; null before mount. For "2 menit lalu". */
export function useNow() {
  return useSyncExternalStore(subscribeToClock, () => minuteNow(), () => null)
}

// Rounded to the minute so the snapshot is stable between ticks.
const minuteNow = () => Math.floor(Date.now() / 60_000) * 60_000

function subscribeToClock(onChange: () => void) {
  const id = setInterval(onChange, 60_000)
  return () => clearInterval(id)
}
