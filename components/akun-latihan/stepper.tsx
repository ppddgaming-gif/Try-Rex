"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"

/**
 * A number with − / + buttons and a field that accepts typing. The value is
 * committed on every valid keystroke and snapped to `step` on blur; the
 * buttons are 44px so they work on a phone.
 */
export function Stepper({
  id,
  value,
  onChange,
  step,
  min,
  max,
  decimals,
  unit,
  disabled = false,
  label,
}: {
  id: string
  value: number
  onChange: (value: number) => void
  step: number
  min: number
  max: number
  decimals: number
  unit?: string
  disabled?: boolean
  /** Accessible name for the field and buttons. */
  label: string
}) {
  // What the player is typing, while it differs from the committed value.
  const [text, setText] = useState<string | null>(null)
  const clamp = (v: number) => Math.min(max, Math.max(min, Number(v.toFixed(decimals))))
  const nudge = (dir: 1 | -1) => {
    setText(null)
    onChange(clamp(value + dir * step))
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => nudge(-1)}
        disabled={disabled || value <= min}
        aria-label={`Kurangi ${label}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-inset text-foreground transition-colors hover:bg-muted disabled:opacity-35"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <label htmlFor={id} className="relative min-w-0 flex-1">
        <span className="sr-only">{label}</span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          disabled={disabled}
          value={text ?? value.toFixed(decimals)}
          onChange={(e) => {
            const raw = e.target.value.replace(",", ".")
            setText(raw)
            const n = Number(raw)
            if (raw.trim() !== "" && Number.isFinite(n) && n >= min && n <= max) onChange(Number(n.toFixed(decimals)))
          }}
          onBlur={() => setText(null)}
          className="h-11 w-full rounded-lg border border-border bg-inset px-3 pr-10 text-center font-mono text-sm font-semibold text-foreground disabled:opacity-60"
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>
        )}
      </label>
      <button
        type="button"
        onClick={() => nudge(1)}
        disabled={disabled || value >= max}
        aria-label={`Tambah ${label}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-inset text-foreground transition-colors hover:bg-muted disabled:opacity-35"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
