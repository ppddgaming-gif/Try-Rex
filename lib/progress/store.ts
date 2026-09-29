import type { SupabaseClient } from "@supabase/supabase-js"
import type { Decision } from "@/lib/mock-data"
import { levelFromXp, localDateKey, nextStreak, progressFromAttempts } from "@/lib/progress/derive"
import { emptyProgress, PROGRESS_VERSION, type Attempt, type Progress } from "@/lib/progress/types"
import { createClient } from "@/lib/supabase/client"

/** Emitted once per recorded attempt, so the UI can animate the gain. */
export type ProgressEvent = { xpGained: number; leveledUpTo: number | null }

/**
 * The only way the app reads or writes progress. Components go through the
 * useProgress hook and never touch storage. Guests are backed by
 * localStorage, signed-in players by Supabase; both implement this.
 */
export interface ProgressStore {
  /** null while progress is still loading: render a skeleton. */
  loadProgress(): Progress | null
  recordAttempt(attempt: Omit<Attempt, "createdAt">): ProgressEvent
  resetProgress(): void
  /** Called on every change, with the event for recorded attempts. */
  subscribe(listener: (event?: ProgressEvent) => void): () => void
}

type Listener = (event?: ProgressEvent) => void

function gainEvent(before: Progress | null, after: Progress | null, xpGained: number): ProgressEvent {
  // Without both totals there is no honest level-up to announce.
  if (!before || !after) return { xpGained, leveledUpTo: null }
  const levelBefore = levelFromXp(before.xp).level
  const levelAfter = levelFromXp(after.xp).level
  return { xpGained, leveledUpTo: levelAfter > levelBefore ? levelAfter : null }
}

// ---------------------------------------------------------------------------
// Local storage helpers. Every access is guarded: private mode and blocked
// site data throw on the storage object itself.
// ---------------------------------------------------------------------------

function readKey(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeKey(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Quota or blocked storage: keep going in memory for this tab.
  }
}

const attemptKey = (a: Attempt) => `${a.scenarioId}|${a.createdAt}`

const byTime = (a: Attempt, b: Attempt) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0)

// ---------------------------------------------------------------------------
// Guest: localStorage
// ---------------------------------------------------------------------------

const GUEST_KEY = "tryrex:progress:v1"

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

function createGuestStore(): ProgressStore & { reload(): void } {
  const listeners = new Set<Listener>()
  // Cached so useSyncExternalStore gets the same object until something changes.
  let cache: Progress | null = null

  const write = (p: Progress) => {
    cache = p
    writeKey(GUEST_KEY, JSON.stringify(p))
  }

  const emit = (event?: ProgressEvent) => listeners.forEach((l) => l(event))

  // Another tab changed progress: drop the cache so the next read reloads.
  window.addEventListener("storage", (e) => {
    if (e.key !== GUEST_KEY && e.key !== null) return
    cache = null
    emit()
  })

  return {
    loadProgress() {
      if (!cache) cache = parse(readKey(GUEST_KEY))
      return cache
    },

    recordAttempt(input) {
      const before = this.loadProgress()!
      const now = new Date()
      const attempt: Attempt = { ...input, createdAt: now.toISOString() }
      const next: Progress = {
        ...before,
        xp: before.xp + attempt.xpEarned,
        attempts: [...before.attempts, attempt],
        streak: nextStreak(before.streak, localDateKey(now)),
      }
      write(next)
      const event = gainEvent(before, next, attempt.xpEarned)
      emit(event)
      return event
    },

    resetProgress() {
      writeKey(GUEST_KEY, null)
      cache = emptyProgress()
      emit()
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    /** Re-read storage, e.g. after sign-in carried the guest attempts away. */
    reload() {
      cache = null
      emit()
    },
  }
}

// ---------------------------------------------------------------------------
// Account: Supabase `practice_attempts` (supabase/migrations/*_progress_sync.sql)
//
// Only attempts are stored; XP and streak are rebuilt from them. Attempts
// show up immediately and are saved in the background. One that fails to
// save waits in a per-account outbox in localStorage and is sent again on
// the next load.
// ---------------------------------------------------------------------------

type Row = {
  scenario_id: string
  pair: string
  timeframe: string
  difficulty: number
  decision: Decision
  correct: boolean
  xp_earned: number
  created_at: string
}

const COLUMNS = "scenario_id,pair,timeframe,difficulty,decision,correct,xp_earned,created_at"

const toRow = (a: Attempt): Row => ({
  scenario_id: a.scenarioId,
  pair: a.pair,
  timeframe: a.timeframe,
  difficulty: a.difficulty,
  decision: a.decision,
  correct: a.correct,
  xp_earned: a.xpEarned,
  created_at: a.createdAt,
})

const fromRow = (r: Row): Attempt => ({
  scenarioId: r.scenario_id,
  pair: r.pair,
  timeframe: r.timeframe,
  difficulty: r.difficulty,
  decision: r.decision,
  correct: r.correct,
  xpEarned: r.xp_earned,
  // Postgres answers "…+00:00"; normalize so keys match what we sent.
  createdAt: new Date(r.created_at).toISOString(),
})

const outboxKey = (userId: string) => `tryrex:outbox:${userId}`

function readOutbox(userId: string): Attempt[] {
  try {
    const list = JSON.parse(readKey(outboxKey(userId)) ?? "[]")
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

/** Drop the given attempts from the outbox, keeping any added since. */
function removeFromOutbox(userId: string, sent: Attempt[]) {
  const done = new Set(sent.map(attemptKey))
  const rest = readOutbox(userId).filter((a) => !done.has(attemptKey(a)))
  writeKey(outboxKey(userId), rest.length ? JSON.stringify(rest) : null)
}

function addToOutbox(userId: string, attempt: Attempt) {
  writeKey(outboxKey(userId), JSON.stringify([...readOutbox(userId), attempt]))
}

/** Idempotent: an attempt already saved is skipped, not duplicated. */
async function upload(supabase: SupabaseClient, attempts: Attempt[]) {
  if (attempts.length === 0) return
  const { error } = await supabase
    .from("practice_attempts")
    .upsert(attempts.map(toRow), { onConflict: "user_id,scenario_id,created_at", ignoreDuplicates: true })
  if (error) throw error
}

async function fetchAttempts(supabase: SupabaseClient, userId: string) {
  // PostgREST caps a response at 1000 rows, so page through.
  const PAGE = 1000
  const all: Attempt[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("practice_attempts")
      .select(COLUMNS)
      .eq("user_id", userId)
      .order("created_at")
      .order("id")
      .range(from, from + PAGE - 1)
    if (error) throw error
    all.push(...(data as Row[]).map(fromRow))
    if (data.length < PAGE) return all
  }
}

type AccountStore = ProgressStore & { userId: string; stop(): void }

function createAccountStore(supabase: SupabaseClient, userId: string): AccountStore {
  const listeners = new Set<Listener>()
  /** Confirmed in the database; null until the first load succeeds. */
  let saved: Attempt[] | null = null
  /** Recorded in this tab and not confirmed yet. */
  let unsaved: Attempt[] = []
  let cache: Progress | null = null
  let stopped = false
  let failures = 0
  let retryTimer: ReturnType<typeof setTimeout> | undefined

  const emit = (event?: ProgressEvent) => {
    if (!stopped) listeners.forEach((l) => l(event))
  }

  const rebuild = () => {
    if (!saved) {
      cache = null
      return
    }
    const known = new Set(saved.map(attemptKey))
    cache = progressFromAttempts([...saved, ...unsaved.filter((a) => !known.has(attemptKey(a)))].sort(byTime))
  }

  async function load() {
    try {
      // Carry over what was played as a guest on this device, then anything
      // an earlier visit failed to save.
      const guest = parse(readKey(GUEST_KEY)).attempts
      if (guest.length) {
        await upload(supabase, guest)
        writeKey(GUEST_KEY, null)
      }
      const outbox = readOutbox(userId)
      if (outbox.length) {
        await upload(supabase, outbox)
        removeFromOutbox(userId, outbox)
      }

      const attempts = await fetchAttempts(supabase, userId)
      if (stopped) return
      saved = attempts
      failures = 0
      rebuild()
      emit()
    } catch (error) {
      if (stopped) return
      console.error("Progress: could not load from the account", error)
      // Keep the skeleton and try again, backing off to once a minute.
      retryTimer = setTimeout(load, Math.min(60_000, 2_000 * 2 ** failures++))
    }
  }

  load()

  return {
    userId,

    loadProgress() {
      return cache
    },

    recordAttempt(input) {
      const attempt: Attempt = { ...input, createdAt: new Date().toISOString() }
      const before = cache
      unsaved = [...unsaved, attempt]
      rebuild()
      const event = gainEvent(before, cache, attempt.xpEarned)
      emit(event)

      upload(supabase, [attempt]).then(
        () => {
          // Once loaded, move it across. The totals are unchanged, so there is
          // nothing to rebuild. Before that, the load's dedupe handles it.
          if (!saved) return
          saved = [...saved, attempt]
          unsaved = unsaved.filter((a) => a !== attempt)
        },
        (error) => {
          console.error("Progress: could not save an attempt; will retry on next load", error)
          addToOutbox(userId, attempt)
        },
      )
      return event
    },

    resetProgress() {
      saved = []
      unsaved = []
      writeKey(outboxKey(userId), null)
      rebuild()
      emit()
      supabase
        .from("practice_attempts")
        .delete()
        .eq("user_id", userId)
        .then(({ error }) => {
          if (!error) return
          console.error("Progress: could not clear the account", error)
          // Show what is really stored rather than a reset that didn't happen.
          saved = null
          rebuild()
          emit()
          load()
        })
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    stop() {
      stopped = true
      clearTimeout(retryTimer)
    },
  }
}

// ---------------------------------------------------------------------------
// The app's store: guest or account, whichever the server says is playing.
// ---------------------------------------------------------------------------

type AppStore = ProgressStore & {
  /** Called by <ProgressAccount> with the server-rendered user; null for guests. */
  setAccount(userId: string | null): void
}

function createAppStore(): AppStore {
  const listeners = new Set<Listener>()
  const emit = (event?: ProgressEvent) => listeners.forEach((l) => l(event))

  const guest = createGuestStore()
  // Until we know who is playing, reads show a skeleton. A write in that
  // moment goes to the guest store, and is carried to the account on load.
  let active: ProgressStore | null = null
  let account: AccountStore | null = null

  guest.subscribe((event) => {
    if (active === guest) emit(event)
  })

  return {
    setAccount(userId) {
      if (userId ? account?.userId === userId : active === guest) return
      account?.stop()
      account = null
      if (userId) {
        let supabase: SupabaseClient
        try {
          supabase = createClient()
        } catch (error) {
          // Missing Supabase env: play on as a guest rather than break the game.
          console.error("Progress: Supabase is not configured", error)
          active = guest
          emit()
          return
        }
        account = createAccountStore(supabase, userId)
        account.subscribe(emit)
        active = account
      } else {
        guest.reload()
        active = guest
      }
      emit()
    },

    loadProgress() {
      return active ? active.loadProgress() : null
    },

    recordAttempt(input) {
      return (active ?? guest).recordAttempt(input)
    },

    resetProgress() {
      const target = active ?? guest
      target.resetProgress()
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

let store: AppStore | null = null

/** The app's progress store. Browser only. */
export function progressStore(): AppStore {
  if (!store) store = createAppStore()
  return store
}
