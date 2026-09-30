"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navItems } from "@/components/nav-items"

// Owns the active-route highlight so its hosts (sidebar, mobile bar) don't each
// need to reach for usePathname. Labels sit in .sb-label so the collapsed
// sidebar can fold them away; data-tip names the icon on hover instead.
export function NavLinks({
  className = "",
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className={`flex flex-col gap-1 ${className}`}>
      {navItems.map((item) => {
        const active =
          pathname === item.href || ("match" in item && item.match === "prefix" && pathname.startsWith(item.href + "/"))
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            data-tip={item.label}
            className={[
              "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            {active && (
              <span aria-hidden="true" className="pop-in absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <Icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-300 ease-spring group-hover:scale-110" />
            <span className="sb-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
