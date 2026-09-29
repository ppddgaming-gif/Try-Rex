import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

/**
 * The one empty-state layout, used by every card that has nothing to show
 * yet: icon in a circle, a title, one line of text, at most one action.
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  children,
}: {
  icon: LucideIcon
  title: string
  body: string
  /** At most one button or link. */
  action?: ReactNode
  /** Extra content under the text, e.g. a progress hint. */
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{body}</p>
      {children}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
