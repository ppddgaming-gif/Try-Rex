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
 * Each tip once, at its moment. Call `trigger(id)` from the handler where the
 * moment happens (the order panel opens, a stop out comes back…); a tip the
 * player has already seen is ignored. Several moments can land together, so
 * they queue and show one at a time. Dismissing marks the tip seen.
 */
export function useTipQueue(initialSeen: TipId[]) {
  const [seen, setSeen] = useState(() => new Set(initialSeen))
  const [queue, setQueue] = useState<TipId[]>([])
  return {
    current: queue[0] ?? null,
    trigger(id: TipId) {
      if (seen.has(id)) return
      setQueue((q) => (q.includes(id) ? q : [...q, id]))
    },
    dismiss() {
      const id = queue[0]
      if (!id) return
      markTipSeen(id)
      setSeen((s) => new Set(s).add(id))
      setQueue((q) => q.slice(1))
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
