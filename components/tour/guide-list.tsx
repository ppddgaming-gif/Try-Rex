"use client"

import Link from "next/link"
import { Check, Lock, PlayCircle } from "lucide-react"
import { Skeleton } from "@/components/progress/skeleton"
import { useTours } from "@/components/tour/tour-provider"
import { TOURS } from "@/lib/tours"

/**
 * /panduan: every tour, whether it has been seen ("Selesai") and a button to
 * play it again. A tour whose page needs an account asks a guest to sign in;
 * the Akun Latihan tour waits until Akun Latihan is open.
 */
export function GuideList({ signedIn, akunOpen }: { signedIn: boolean; akunOpen: boolean }) {
  const tours = useTours()
  const seen = tours?.seen ?? null

  return (
    <ul className="flex flex-col gap-3">
      {TOURS.map((tour, i) => {
        const done = seen?.has(tour.id) ?? null
        const needsAccount = tour.account && !signedIn
        const locked = tour.id === "akun-latihan" && signedIn && !akunOpen
        return (
          <li
            key={tour.id}
            className="enter flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5"
            style={{ "--enter-delay": `${i * 40}ms` } as React.CSSProperties}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-base font-bold">{tour.title}</h2>
                {done === null ? (
                  <Skeleton className="h-5 w-16 rounded-md" />
                ) : done ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                    <Check className="h-3 w-3" aria-hidden="true" /> Selesai
                  </span>
                ) : (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">Belum</span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{tour.description}</p>
              <p className="mt-1 font-mono text-xs text-faint">{tour.steps.length} langkah</p>
            </div>

            {needsAccount ? (
              <Link href="/login?next=/panduan" className="btn btn-ghost btn-sm shrink-0">
                <Lock className="h-4 w-4" aria-hidden="true" /> Masuk dulu
              </Link>
            ) : locked ? (
              <p className="flex shrink-0 items-center gap-1.5 text-xs text-faint sm:max-w-48">
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Terbuka bersama Akun Latihan
              </p>
            ) : (
              <button
                type="button"
                onClick={() => tours?.start(tour.id)}
                disabled={!tours || tours.running !== null}
                className="btn btn-sm shrink-0"
              >
                <PlayCircle className="h-4 w-4" aria-hidden="true" /> Putar ulang
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
