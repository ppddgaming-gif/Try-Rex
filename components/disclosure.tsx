"use client"

import { useId, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"

/**
 * "Show more" footer button for a card. The panel renders above the trigger so
 * the button stays pinned to the bottom edge, matching the closed layout.
 */
export function Disclosure({
  label,
  closeLabel,
  children,
  className = "",
  triggerClassName = "mt-4",
}: {
  label: string
  closeLabel: string
  children: ReactNode
  /** Applied to the revealed panel. */
  className?: string
  /** Spacing for the trigger; clear it when the parent already uses gap. */
  triggerClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <>
      {open && (
        <div id={panelId} className={className}>
          {children}
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-center gap-1 rounded-lg border border-border bg-muted/40 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${triggerClassName}`}
      >
        {open ? closeLabel : label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
    </>
  )
}
