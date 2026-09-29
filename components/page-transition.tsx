"use client"

import { ViewTransition, type ReactNode } from "react"
import { usePathname } from "next/navigation"

/**
 * Wraps a layout's {children} so moving between pages animates: the old page
 * fades out quickly and the new one rises in (CSS in globals.css, `.page`).
 *
 * Keying by pathname makes each route an exit/enter pair while the layout
 * around it (sidebar, headers, the auth card) stays put. Query-string changes
 * such as the dashboard filters keep the same key, so they don't animate.
 * Route navigations are React transitions, which is what activates
 * <ViewTransition>. Browsers without the View Transitions API swap pages as
 * before.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <ViewTransition key={pathname} enter="page" exit="page" default="none">
      {children}
    </ViewTransition>
  )
}
