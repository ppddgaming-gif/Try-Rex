"use client"

import { useState } from "react"
import { ChevronDown, Lock } from "lucide-react"
import { RexTipCard } from "@/components/akun-latihan/rex-tip"
import { TIPS, type TipId } from "@/lib/demo/tips"

// A fixed time zone, so the server render and the browser print the same date.
const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })

/**
 * "Tips Rex": every tip, in the order they tend to appear. Seen ones open to
 * be reread; unseen ones only say when they'll show, so nothing is spoiled.
 */
export function TipsList({ seen }: { seen: { id: TipId; seenAt: string }[] }) {
  const seenAt = new Map(seen.map((s) => [s.id, s.seenAt]))
  const [open, setOpen] = useState<TipId | null>(null)

  return (
    <ul className="flex flex-col gap-3">
      {TIPS.map((tip) => {
        const when = seenAt.get(tip.id)
        const isOpen = open === tip.id
        return (
          <li key={tip.id} className="rounded-2xl border border-border bg-card">
            {when ? (
              <>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : tip.id)}
                  aria-expanded={isOpen}
                  className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{tip.title}</span>
                    <span className="block text-xs text-muted-foreground">Dilihat {dateFmt.format(new Date(when))}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ease-spring ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-3 pb-3">
                    <RexTipCard id={tip.id} compact />
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-14 items-center gap-3 px-4 py-3 text-muted-foreground">
                <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground/70">{tip.title}</span>
                  <span className="block text-xs">{tip.when}</span>
                </span>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
