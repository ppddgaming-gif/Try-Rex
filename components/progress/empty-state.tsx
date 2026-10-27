import type { ReactNode } from "react"
import { RexArt, type RexArtMood } from "@/components/rex-mascot"

/**
 * The one empty-state layout, used by every card that has nothing to show
 * yet: Rex (tired by default: nothing has happened here yet), a title, one
 * line of text, at most one action.
 */
export function EmptyState({
  mood = "tired",
  title,
  body,
  action,
  children,
}: {
  /** Rex's expression; "thinking" suits "nothing matches your search". */
  mood?: RexArtMood
  title: string
  body: string
  /** At most one button or link. */
  action?: ReactNode
  /** Extra content under the text, e.g. a progress hint. */
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <RexArt mood={mood} size={88} />
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{body}</p>
      {children}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
