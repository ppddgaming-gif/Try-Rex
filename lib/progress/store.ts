import { levelFromXp, localDateKey, nextStreak } from "@/lib/progress/derive"
import { emptyProgress, PROGRESS_VERSION, type Attempt, type Progress } from "@/lib/progress/types"

/** Emitted once per recorded attempt, so the UI can animate the gain. */
export type ProgressEvent = { xpGained: number; leveledUpTo: number | null }

/**
 * The only way the app reads or writes progress. Components go through the
 * useProgress hook and never touch storage. A Supabase-backed store (next
 * ticket) implements this same interface.
 */
export interface ProgressStore {
  loadProgress(): Progress
  recordAttempt(attempt: Omit<Attempt, "createdAt">): ProgressEvent
  resetProgress(): void
  /** Called on every change, with the event for recorded attempts. */
  subscribe(listener: (event?: ProgressEvent) => void): () => void
}

const KEY = "tryrex:progress:v1"

/** Anything unreadable or from another version becomes empty progress. */
function parse(raw: string | null): Progress {
  if (!raw) return emptyProgress()
  try {
    const data = JSON.parse(raw) as Partial<Progress>
    if (data?.version !== PROGRESS_VERSION || !Array.isArray(data.attempts) || typeof data.xp !== "number") {
      return emptyProgress()
    }
    const base = emptyProgress()
    return {
      ...base,
      xp: data.xp,
      attempts: data.attempts,
      streak: { ...base.streak, ...data.streak },
      competencies: { ...base.competencies, ...data.competencies },
    }
  } catch {
    return emptyProgress()
  }
}

function createLocalStore(): ProgressStore {
  const listeners = new Set<(event?: ProgressEvent) => void>()
  // Cached so useSyncExternalStore gets the same object until something changes.
  let cache: Progress | null = null

  const read = (): Progress => {
    try {
      return parse(window.localStorage.getItem(KEY))
    } catch {
      // Storage disabled (private mode, blocked site data).
      return emptyProgress()
    }
  }

  const write = (p: Progress) => {
    cache = p
    try {
      window.localStorage.setItem(KEY, JSON.stringify(p))
    } catch {
      // Quota or blocked storage: keep going in memory for this tab.
    }
  }

  const emit = (event?: ProgressEvent) => listeners.forEach((l) => l(event))

  // Another tab changed progress: drop the cache so the next read reloads.
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key !== KEY && e.key !== null) return
      cache = null
      emit()
    })
  }

  return {
    loadProgress() {
      if (!cache) cache = read()
      return cache
    },

    recordAttempt(input) {
      const before = this.loadProgress()
      const now = new Date()
      const attempt: Attempt = { ...input, createdAt: now.toISOString() }
      const next: Progress = {
        ...before,
        xp: before.xp + attempt.xpEarned,
        attempts: [...before.attempts, attempt],
        streak: nextStreak(before.streak, localDateKey(now)),
      }
      write(next)

      const levelBefore = levelFromXp(before.xp).level
      const levelAfter = levelFromXp(next.xp).level
      const event: ProgressEvent = {
        xpGained: attempt.xpEarned,
        leveledUpTo: levelAfter > levelBefore ? levelAfter : null,
      }
      emit(event)
      return event
    },

    resetProgress() {
      try {
        window.localStorage.removeItem(KEY)
      } catch {
        // Nothing to clear.
      }
      cache = emptyProgress()
      emit()
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

let store: ProgressStore | null = null

/** The app's progress store. Browser only. */
export function progressStore(): ProgressStore {
  if (!store) store = createLocalStore()
  return store
}
