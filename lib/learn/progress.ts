"use client"

import { useSyncExternalStore } from "react"

// Which lessons this device has finished. Counted, never estimated: the
// numbers on /belajar are exactly the lessons marked done here.

const KEY = "tryrex:learn:v1"
const listeners = new Set<() => void>()
const EMPTY: readonly string[] = []

let cachedRaw: string | null | undefined
let cached: readonly string[] = EMPTY

function read(): readonly string[] {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(KEY)
  } catch {
    // Blocked storage: nothing recorded.
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      const parsed = raw ? JSON.parse(raw) : null
      cached = Array.isArray(parsed?.done) ? parsed.done.filter((s: unknown): s is string => typeof s === "string") : EMPTY
    } catch {
      cached = EMPTY
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

/** Finished lesson slugs, or null until the device has been read. */
export function useLessonsDone(): readonly string[] | null {
  return useSyncExternalStore(subscribe, read, () => null)
}

export function setLessonDone(slug: string, done: boolean) {
  const current = new Set(read())
  if (done) current.add(slug)
  else current.delete(slug)
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ done: [...current] }))
  } catch {
    cached = [...current]
  }
  listeners.forEach((l) => l())
}
