"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navItems } from "@/components/nav-items"

// Owns the active-route highlight so its hosts (sidebar, mobile bar) don't each
// need to reach for usePathname.
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
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={[
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            <Icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
