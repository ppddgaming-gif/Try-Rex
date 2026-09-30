"use client"

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { Check, ChevronDown } from "lucide-react"

export type SelectOption = {
  value: string
  label: string
  /** Optional leading icon. Use a lucide icon, never an emoji. */
  prefix?: ReactNode
}

/**
 * Small listbox popover. Closes on Escape, on outside click, and on select;
 * arrow keys move through the options while it is open.
 */
export function SelectMenu({
  value,
  options,
  onChange,
  label,
  className = "",
}: {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  /** Accessible name — the trigger only shows the current value. */
  label: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)))
  const root = useRef<HTMLDivElement>(null)
  const listId = useId()

  const current = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  function pick(next: string) {
    setOpen(false)
    if (next !== value) onChange(next)
  }

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${label}: ${current.label}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        {current.prefix && <span className="flex text-muted-foreground">{current.prefix}</span>}
        {current.label}
        <ChevronDown
          className={`ml-auto h-4 w-4 text-muted-foreground transition-transform duration-300 ease-out-expo ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault()
              const step = e.key === "ArrowDown" ? 1 : -1
              setActive((i) => (i + step + options.length) % options.length)
            }
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              pick(options[active].value)
            }
          }}
          className="pop glass-card glass-strong absolute right-0 z-50 mt-1.5 min-w-full overflow-hidden rounded-xl p-1"
        >
          {options.map((o, i) => {
            const selected = o.value === value
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(o.value)}
                  className={[
                    "flex w-full items-center gap-2 whitespace-nowrap rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    i === active ? "bg-muted" : "",
                    selected ? "font-semibold text-primary" : "text-foreground",
                  ].join(" ")}
                >
                  {o.prefix && <span className="flex text-muted-foreground">{o.prefix}</span>}
                  {o.label}
                  {selected && <Check className="ml-auto h-4 w-4" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
