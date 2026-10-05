import type { CSSProperties, ReactNode } from "react"

export function Card({
  children,
  className = "",
  style,
  tour,
}: {
  children: ReactNode
  className?: string
  /** For motion variables such as --enter-delay. */
  style?: CSSProperties
  /** data-tour value, for a guided tour step that points at this card (lib/tours.ts). */
  tour?: string
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-[22px] ${className}`} style={style} data-tour={tour}>
      {children}
    </div>
  )
}
