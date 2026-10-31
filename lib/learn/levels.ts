"use client"

import { useSyncExternalStore } from "react"
import type { LevelId } from "@/lib/learn/types"

// Which Belajar 101 exams this device has passed, like lesson completion
// (lib/learn/progress.ts): per device, every read and write in try/catch.
// The exam is graded on the server; this only remembers the passes it
// returned. Level 1 is always open; each later level opens once the exam of
// the level before it is passed.

const KEY = "tryrex:learn-levels:v1"
const listeners = new Set<() => void>()
type Record_ = { passed: LevelId[]; best: Partial<Record<LevelId, number>> }
const EMPTY: Record_ = { passed: [], best: {} }

let cachedRaw: string | null | undefined
let cached: Record_ = EMPTY

const isLevel = (v: unknown): v is LevelId => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 6

function read(): Record_ {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(KEY)
  } catch {
    return cached
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      const parsed = raw ? JSON.parse(raw) : null
      const passed = Array.isArray(parsed?.passed) ? (parsed.passed as unknown[]).filter(isLevel) : []
      const best: Record_["best"] = {}
      for (const [k, v] of Object.entries(parsed?.best ?? {})) {
        const level = Number(k)
        if (isLevel(level) && Number.isInteger(v)) best[level] = v as number
      }
      cached = { passed, best }
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

/** Passed levels and best scores, or null until the device has been read. */
export function useLevelProgress(): Record_ | null {
  return useSyncExternalStore(subscribe, read, () => null)
}

export const isUnlocked = (progress: Record_, level: LevelId) => level === 1 || progress.passed.includes((level - 1) as LevelId)

/** Remembers an exam result returned by the server. */
export function recordExam(level: LevelId, correct: number, passed: boolean) {
  const current = read()
  const next: Record_ = {
    passed: passed && !current.passed.includes(level) ? [...current.passed, level].sort() : current.passed,
    best: { ...current.best, [level]: Math.max(current.best[level] ?? 0, correct) },
  }
  cached = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
    cachedRaw = window.localStorage.getItem(KEY)
  } catch {
    // Blocked storage: the pass still counts for this page.
  }
  listeners.forEach((l) => l())
}
