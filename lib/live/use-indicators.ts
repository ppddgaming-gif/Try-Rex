"use client"

import { useSyncExternalStore } from "react"
import { INDICATORS, type IndicatorId } from "@/lib/live/indicators"

// Which indicators the trading chart shows. A display preference of this
// device, like the theme: localStorage, every read and write in try/catch,
// and all off when nothing is saved or storage is blocked.

const KEY = "tryrex:indicators:v1"
const listeners = new Set<() => void>()
const NONE: readonly IndicatorId[] = []

let cachedRaw: string | null | undefined
let cached: readonly IndicatorId[] = NONE

const isIndicator = (v: unknown): v is IndicatorId => typeof v === "string" && (INDICATORS as readonly string[]).includes(v)

function read(): readonly IndicatorId[] {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(KEY)
  } catch {
    // Blocked storage: keep what this page has toggled.
    return cached
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      const parsed = raw ? JSON.parse(raw) : null
      cached = Array.isArray(parsed?.on) ? INDICATORS.filter((id) => parsed.on.some((v: unknown) => isIndicator(v) && v === id)) : NONE
    } catch {
      cached = NONE
    }
  }
  return cached
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onStorage)
  }
}

/** The indicators switched on; none on the server and the first render. */
export function useIndicators(): readonly IndicatorId[] {
  return useSyncExternalStore(subscribe, read, () => NONE)
}

export function toggleIndicator(id: IndicatorId) {
  const current = read()
  const next = current.includes(id) ? current.filter((x) => x !== id) : INDICATORS.filter((x) => x === id || current.includes(x))
  cached = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ on: next }))
    cachedRaw = window.localStorage.getItem(KEY)
  } catch {
    // Blocked storage: the toggle still works for this page.
  }
  listeners.forEach((l) => l())
}
