// Browser-side helpers for the guided tours: finding targets, knowing when
// the page is busy, and the device's list of seen tours. Every storage access
// is wrapped, so blocked storage only means the device remembers nothing.

import { parseSeen } from "@/lib/tours"

const KEY = "tryrex:tours:v1"
const listeners = new Set<() => void>()
let cachedRaw: string | null | undefined
let cachedList: string[] = []

function readRaw() {
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null
  }
}

/** This device's seen tours, as a stable snapshot for useSyncExternalStore. */
export function localSeenSnapshot(): string[] {
  const raw = readRaw()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      cachedList = raw ? parseSeen(JSON.parse(raw)) : []
    } catch {
      cachedList = []
    }
  }
  return cachedList
}

export function writeLocalSeen(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(parseSeen(ids)))
  } catch {
    // Blocked storage: the account (if any) still remembers.
  }
  listeners.forEach((l) => l())
}

export function subscribeLocalSeen(onChange: () => void) {
  listeners.add(onChange)
  // A tour seen in another tab counts here too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onStorage)
  }
}

/** On screen: laid out, not hidden by display:none or a hidden ancestor, and not empty. */
export function isVisible(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false
  if (el.getClientRects().length === 0) return false
  const r = el.getBoundingClientRect()
  if (r.width < 1 || r.height < 1) return false
  return getComputedStyle(el).visibility !== "hidden"
}

/** The first visible element for these data-tour values, in order. */
export function findTarget(targets: readonly string[]): HTMLElement | null {
  for (const id of targets) {
    for (const el of document.querySelectorAll(`[data-tour="${id}"]`)) {
      if (isVisible(el)) return el
    }
  }
  return null
}

/**
 * Why a tour can't start now: an open trade in Akun Latihan, or a dialog,
 * popover or the phone menu already open. null when the page is free.
 */
export function pageBusy(): "trade" | "dialog" | null {
  for (const el of document.querySelectorAll("[data-tour-busy]")) {
    if (isVisible(el)) return "trade"
  }
  const open = document.querySelectorAll(
    'dialog[open], [role="dialog"], [role="alertdialog"], [role="listbox"], #app-nav-menu[data-open="true"]',
  )
  for (const el of open) {
    if (!el.closest("[data-tour-card]") && isVisible(el)) return "dialog"
  }
  return null
}

export function reducedMotion() {
  try {
    return (
      document.documentElement.dataset.motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
  } catch {
    return false
  }
}

/** Bring the element into its own scrolling boxes (a tab bar that scrolls sideways, the sidebar). */
export function revealInScrollers(el: HTMLElement) {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const s = getComputedStyle(p)
    const pr = p.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    if (/(auto|scroll)/.test(s.overflowX) && p.scrollWidth > p.clientWidth && (er.left < pr.left || er.right > pr.right)) {
      p.scrollLeft += er.left - pr.left - (pr.width - er.width) / 2
    }
    if (/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight && (er.top < pr.top || er.bottom > pr.bottom)) {
      p.scrollTop += er.top - pr.top - (pr.height - er.height) / 2
    }
  }
}

/**
 * Calls `onReady` once `check()` holds, re-checking as the page changes, or
 * gives up after `timeout` ms. Returns a cancel function.
 */
export function whenReady(check: () => boolean, timeout: number, onReady: () => void, onTimeout?: () => void) {
  let done = false
  const finish = (ready: boolean) => {
    if (done) return
    done = true
    observer.disconnect()
    clearInterval(poll)
    clearTimeout(timer)
    if (ready) onReady()
    else onTimeout?.()
  }
  const test = () => {
    if (check()) finish(true)
  }
  const observer = new MutationObserver(test)
  observer.observe(document.body, { childList: true, subtree: true, attributes: true })
  // Layout can change without a DOM mutation (fonts, a resize), so poll too.
  const poll = setInterval(test, 300)
  const timer = setTimeout(() => finish(false), timeout)
  queueMicrotask(test)
  return () => {
    done = true
    observer.disconnect()
    clearInterval(poll)
    clearTimeout(timer)
  }
}
