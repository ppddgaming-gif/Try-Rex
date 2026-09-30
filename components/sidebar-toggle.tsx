"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { setPreference, usePreferences } from "@/lib/use-preferences"

/**
 * The desktop sidebar's collapse button. The state is a display preference
 * (html[data-sidebar]), so it survives reloads without a flash and the CSS
 * does the folding.
 */
export function SidebarToggle() {
  const { sidebar } = usePreferences()
  const collapsed = sidebar === "collapsed"

  return (
    <button
      type="button"
      onClick={() => setPreference("sidebar", collapsed ? "expanded" : "collapsed")}
      aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
      aria-expanded={!collapsed}
      data-tip={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <span key={sidebar} className="icon-swap flex">
        {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
      </span>
    </button>
  )
}
