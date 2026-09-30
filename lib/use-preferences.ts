"use client"

import { useSyncExternalStore } from "react"
import { DEFAULT_PREFS, PREFS_KEY, applyPrefs, parsePrefs, type Preferences } from "@/lib/preferences"

const listeners = new Set<() => void>()
let cachedRaw: string | null | undefined
let cached: Preferences = DEFAULT_PREFS

function read(): Preferences {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(PREFS_KEY)
  } catch {
    // Blocked storage: defaults, plus whatever was set this visit.
  }
  // Cache by the raw string so useSyncExternalStore sees a stable snapshot.
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      cached = parsePrefs(raw ? JSON.parse(raw) : null)
    } catch {
      cached = DEFAULT_PREFS
    }
  }
  return cached
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  // Another tab changing a setting updates this one too.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== PREFS_KEY) return
    applyPrefs(read())
    onChange()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onStorage)
  }
}

/**
 * The device's display preferences. The server and the first client render
 * see the defaults (the <html> attributes were already corrected by
 * PREFS_BOOT, so nothing visibly changes); the saved values arrive right after.
 */
export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_PREFS)
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  const next = { ...read(), [key]: value }
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(next))
  } catch {
    cached = next
  }
  applyPrefs(next)
  listeners.forEach((l) => l())
}
