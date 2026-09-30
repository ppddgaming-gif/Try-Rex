"use client"

import { useState } from "react"
import { Lightbulb, X } from "lucide-react"
import { Rex } from "@/components/rex-mascot"
import { postJson } from "@/components/akun-latihan/post-json"
import { tipById, type TipId } from "@/lib/demo/tips"

/** Records a tip as seen on the server. Fire-and-forget; showing it again is harmless. */
export function markTipSeen(tip: TipId) {
  void postJson("/api/akun-latihan/tips", { tip })
}

/**
 * Shows tip `id` once. `seen` is the set the server already has; when the
 * trigger fires and the tip is new, call `show()`. Dismissing marks it seen.
 * Wired to its moment in phase B (order panel, risk, revenge, stop out…).
 */
export function useRexTip(id: TipId, seen: ReadonlySet<TipId>) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(seen.has(id))
  return {
    open,
    show: () => {
      if (!done) setOpen(true)
    },
    dismiss: () => {
      setOpen(false)
      setDone(true)
      markTipSeen(id)
    },
  }
}

/** Rex explaining one thing, at the moment it matters. */
export function RexTipCard({ id, onDismiss, compact = false }: { id: TipId; onDismiss?: () => void; compact?: boolean }) {
  const tip = tipById.get(id)
  if (!tip) return null
  return (
    <aside
      role={onDismiss ? "dialog" : undefined}
      aria-label={onDismiss ? `Tips Rex: ${tip.title}` : undefined}
      className="glass-card glass-strong pop-in relative rounded-2xl border-primary/40 p-4"
    >
      <div className="flex items-start gap-3">
        <Rex size={compact ? 32 : 40} mood="thinking" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" /> Tips Rex
          </p>
          <p className="mt-0.5 font-display font-bold leading-snug">{tip.title}</p>
          <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-foreground/90">
            {tip.body.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </div>
          {onDismiss && (
            <button type="button" onClick={onDismiss} className="btn btn-sm mt-3">
              Oke, paham
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Tutup tips"
            className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
