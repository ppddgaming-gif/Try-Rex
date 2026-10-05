"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import { TourOverlay } from "@/components/tour/tour-overlay"
import {
  findTarget,
  localSeenSnapshot,
  pageBusy,
  subscribeLocalSeen,
  whenReady,
  writeLocalSeen,
} from "@/components/tour/tour-dom"
import { markToursSeen } from "@/lib/tour-actions"
import { mergeSeen, tourById, tourForPath, unsynced, type Tour, type TourContext, type TourId } from "@/lib/tours"

type TourApi = {
  /** Seen tours; null until the device has been read. */
  seen: ReadonlySet<string> | null
  running: TourId | null
  /** The tour for the page that's open, if it has one. */
  pageTour: Tour | null
  /** Starts a tour on request ("?" or Putar ulang), even one already seen. */
  start: (id: TourId) => void
}

const Ctx = createContext<TourApi | null>(null)

export const useTours = () => useContext(Ctx)

/** How long to wait for a page's targets (the game deals its round after mount). */
const WAIT_MS = 8000
/** A beat after the page appears, so its own entrance has settled first. */
const SETTLE_MS = 500
const NOTICE_MS = 3500

const NOT_ON_SCREEN = "Bagian yang dijelaskan tur ini belum tampil di halaman ini."

/**
 * Runs the guided tours in the app shell. Remembers what has been seen (the
 * device for guests; the profile for accounts, with the device's list merged
 * in), starts a page's tour the first time it's opened (the welcome tour
 * first, for accounts), and starts any tour on request. One tour at a time,
 * at most one automatic tour per page visit, and never over an open dialog,
 * menu or trade.
 */
export function TourProvider({
  signedIn,
  serverSeen,
  context,
  children,
}: {
  signedIn: boolean
  /** The account's list; null for guests, or when the database can't store it yet. */
  serverSeen: string[] | null
  context: TourContext
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  // null on the server and the first client render; the device's list after.
  const local = useSyncExternalStore(subscribeLocalSeen, localSeenSnapshot, () => null)
  // Seen this visit, in case the device can't store it.
  const [marked, setMarked] = useState<string[]>([])
  const [running, setRunning] = useState<Tour | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const runningRef = useRef(false)
  /** The page that has had its automatic tour this visit. */
  const autoFor = useRef<string | null>(null)
  const toAccount = signedIn && serverSeen !== null

  const seen = useMemo(
    () => (local === null ? null : new Set(mergeSeen(mergeSeen(serverSeen ?? [], local), marked))),
    [local, serverSeen, marked],
  )

  // Tours seen on this device before signing in count for the account too.
  const synced = useRef(false)
  useEffect(() => {
    if (synced.current || local === null || !toAccount) return
    synced.current = true
    const missing = unsynced(local, serverSeen ?? [])
    if (missing.length > 0) void markToursSeen(missing)
  }, [local, toAccount, serverSeen])

  const markSeen = useCallback(
    (id: TourId) => {
      setMarked((m) => (m.includes(id) ? m : [...m, id]))
      writeLocalSeen(mergeSeen(localSeenSnapshot(), [id]))
      if (toAccount) void markToursSeen([id])
    },
    [toAccount],
  )

  const say = useCallback((text: string) => {
    setNotice(text)
    window.setTimeout(() => setNotice((n) => (n === text ? null : n)), NOTICE_MS)
  }, [])

  /** Shows the tour if one of its steps is on screen. Seen from the moment it shows. */
  const begin = useCallback(
    (tour: Tour) => {
      if (runningRef.current) return false
      if (!tour.steps.some((s) => s.targets.length === 0 || findTarget(s.targets))) return false
      runningRef.current = true
      setRunning(tour)
      markSeen(tour.id)
      return true
    },
    [markSeen],
  )

  // Each page visit: a requested replay (?tur=), else the welcome tour for an
  // account that hasn't seen it, else this page's tour the first time.
  useEffect(() => {
    if (!seen) return
    const params = new URLSearchParams(window.location.search)
    const requested = tourById(params.get("tur") ?? "")
    if (params.has("tur")) {
      params.delete("tur")
      const query = params.toString()
      window.history.replaceState(window.history.state, "", pathname + (query ? `?${query}` : "") + window.location.hash)
    }

    let tour: Tour | null = null
    const manual = Boolean(requested && (requested.page === null || requested.paths.includes(pathname)))
    if (manual) tour = requested
    else if (autoFor.current !== pathname) {
      const page = tourForPath(pathname)
      if (signedIn && !seen.has("welcome")) tour = tourById("welcome")
      else if (page && !seen.has(page.id)) tour = page
    }
    if (!tour) return

    const chosen = tour
    const ready = () =>
      !runningRef.current && pageBusy() === null && chosen.steps.some((s) => s.targets.length > 0 && findTarget(s.targets))
    let settle = 0
    const cancel = whenReady(
      ready,
      WAIT_MS,
      () => {
        settle = window.setTimeout(() => {
          if (!ready()) return
          // A replay counts as this visit's tour too: nothing else follows it.
          autoFor.current = pathname
          begin(chosen)
        }, SETTLE_MS)
      },
      () => {
        if (manual) say(NOT_ON_SCREEN)
      },
    )
    return () => {
      cancel()
      window.clearTimeout(settle)
    }
  }, [pathname, seen, signedIn, begin, say])

  const start = useCallback(
    (id: TourId) => {
      const tour = tourById(id)
      if (!tour || runningRef.current) return
      if (tour.page !== null && !tour.paths.includes(pathname)) {
        const [path, hash] = tour.page.split("#")
        router.push(`${path}?tur=${tour.id}${hash ? `#${hash}` : ""}`)
        return
      }
      const busy = pageBusy()
      if (busy === "trade") return say("Tur bisa diputar setelah trade-mu ditutup.")
      if (busy === "dialog") return say("Tutup dulu jendela yang sedang terbuka, lalu coba lagi.")
      if (begin(tour)) autoFor.current = pathname
      else say(NOT_ON_SCREEN)
    },
    [pathname, router, begin, say],
  )

  const close = useCallback(() => {
    runningRef.current = false
    setRunning(null)
  }, [])

  const finish = useCallback(
    (href: string) => {
      close()
      router.push(href)
    },
    [close, router],
  )

  const api = useMemo<TourApi>(
    () => ({ seen, running: running?.id ?? null, pageTour: tourForPath(pathname), start }),
    [seen, running, pathname, start],
  )

  return (
    <Ctx.Provider value={api}>
      {children}
      {running && <TourOverlay key={running.id} tour={running} context={context} onClose={close} onFinish={finish} />}
      {notice && (
        <p
          role="status"
          className="glass-card glass-strong pop-in fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-sm rounded-2xl px-4 py-3 text-center text-sm"
        >
          {notice}
        </p>
      )}
    </Ctx.Provider>
  )
}
