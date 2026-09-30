import type { CSSProperties, ReactNode } from "react"

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode
  className?: string
  /** For motion variables such as --enter-delay. */
  style?: CSSProperties
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-[22px] ${className}`} style={style}>
      {children}
    </div>
  )
}
