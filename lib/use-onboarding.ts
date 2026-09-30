"use client"

import { useSyncExternalStore } from "react"
import { parseRecord, type OnboardingRecord } from "@/lib/onboarding"

// Guests keep their /start answers on the device, the same way guest progress
// works. Signed-in players get theirs from the server (profiles.onboarding);
// a copy is kept here too, so answers given before signing up carry over.

const KEY = "tryrex:onboarding:v1"
const listeners = new Set<() => void>()

let cachedRaw: string | null | undefined
let cachedRecord: OnboardingRecord | null = null

function readRaw() {
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null
  }
}

/** The stored record, or null. Unreadable data counts as no record. */
export function readLocalOnboarding(): OnboardingRecord | null {
  const raw = readRaw()
  // Cache by the raw string so useSyncExternalStore sees a stable snapshot.
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      cachedRecord = raw ? parseRecord(JSON.parse(raw)) : null
    } catch {
      cachedRecord = null
    }
  }
  return cachedRecord
}

export function saveLocalOnboarding(record: OnboardingRecord) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(record))
  } catch {
    // Blocked storage: the answers still apply for this visit via state.
  }
  listeners.forEach((l) => l())
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  // Another tab finishing /start updates this one too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onStorage)
  }
}

/**
 * The player's onboarding record. `server` is what the page loaded for a
 * signed-in player (a record, or null for "not done yet"); pass undefined for
 * guests to read the device instead. Returns undefined until the device has
 * been read, which never happens on the server: render a skeleton for it.
 */
export function useOnboarding(server?: OnboardingRecord | null): OnboardingRecord | null | undefined {
  const local = useSyncExternalStore(subscribe, readLocalOnboarding, () => undefined)
  if (server !== undefined) return server
  return local
}
