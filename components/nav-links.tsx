"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Lock } from "lucide-react"
import { navItems } from "@/components/nav-items"

/** Locked nav items: href → the line explaining how to open it. */
export type NavLocks = Partial<Record<string, string>>

// Owns the active-route highlight so its hosts (sidebar, mobile bar) don't each
// need to reach for usePathname. Labels sit in .sb-label so the collapsed
// sidebar can fold them away; data-tip names the icon on hover instead.
// A locked item still links (its page explains the lock) but shows a lock and
// the reason under its label.
export function NavLinks({
  className = "",
  onNavigate,
  locks = {},
}: {
  className?: string
  onNavigate?: () => void
  locks?: NavLocks
}) {
  const pathname = usePathname()

  return (
    <nav className={`flex flex-col gap-1 ${className}`}>
      {navItems.map((item) => {
        const active =
          pathname === item.href || ("match" in item && item.match === "prefix" && pathname.startsWith(item.href + "/"))
        const Icon = item.icon
        const lock = locks[item.href]
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            aria-label={lock ? `${item.label}, terkunci. ${lock}` : item.label}
            data-tip={lock ? `${item.label} · terkunci` : item.label}
            data-tour={item.tour}
            className={[
              "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            {active && (
              <span aria-hidden="true" className="pop-in absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <Icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-300 ease-spring group-hover:scale-110" />
            <span className="sb-label min-w-0 flex-1 leading-tight">
              <span className="block">{item.label}</span>
              {lock && <span className="mt-0.5 block whitespace-normal text-[11px] font-normal text-faint">{lock}</span>}
            </span>
            {lock && <Lock className="sb-label h-3.5 w-3.5 shrink-0 text-faint" aria-hidden="true" />}
          </Link>
        )
      })}
    </nav>
  )
}
