"use client"

import { useSyncExternalStore } from "react"
import type { PackageId } from "@/lib/assessment/types"

// Per device, like Belajar 101's exam marks: the token of a run in progress
// (so a reload resumes it) and the last finished result of each package.
// Every read and write is in try/catch; unreadable data counts as nothing.

const RUNS = "tryrex:asesmen-run:v1"
const RESULTS = "tryrex:asesmen:v1"

export type PackageResult = { scenarios: number; complex: number; complexMax: number; basic: number; basicMax: number }

function read<T>(key: string): Record<string, T> {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? "{}")
    return v && typeof v === "object" && !Array.isArray(v) ? v : {}
  } catch {
    return {}
  }
}

function write<T>(key: string, value: Record<string, T>) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
  listeners.forEach((l) => l())
}

export const loadRunToken = (pkg: PackageId) => read<string>(RUNS)[pkg] ?? null
export const saveRunToken = (pkg: PackageId, token: string) => write(RUNS, { ...read<string>(RUNS), [pkg]: token })
export function clearRunToken(pkg: PackageId) {
  const all = read<string>(RUNS)
  delete all[pkg]
  write(RUNS, all)
}

export const saveResult = (pkg: PackageId, r: PackageResult) => write(RESULTS, { ...read<PackageResult>(RESULTS), [pkg]: r })

const listeners = new Set<() => void>()
let snapshot: string | null = null
let parsed: { results: Record<string, PackageResult>; running: string[] } | null = null

function subscribe(l: () => void) {
  listeners.add(l)
  window.addEventListener("storage", l)
  return () => {
    listeners.delete(l)
    window.removeEventListener("storage", l)
  }
}

function getSnapshot() {
  let raw = ""
  try {
    raw = `${localStorage.getItem(RESULTS) ?? ""}|${localStorage.getItem(RUNS) ?? ""}`
  } catch {}
  if (raw !== snapshot || !parsed) {
    snapshot = raw
    parsed = { results: read<PackageResult>(RESULTS), running: Object.keys(read<string>(RUNS)) }
  }
  return parsed
}

/** Last results and runs in progress on this device; null on the server and first render. */
export function useAssessmentDevice() {
  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}
