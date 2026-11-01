"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import { navItems, type NavItem } from "@/components/nav-items"

/** Locked nav items: href → the line explaining how to open it. */
export type NavLocks = Partial<Record<string, string>>

const rowClass = (active: boolean) =>
  [
    "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
    active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
  ].join(" ")

const ActiveBar = () => <span aria-hidden="true" className="pop-in absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />

const within = (pathname: string, href: string) => pathname === href || pathname.startsWith(href + "/")

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
  return (
    <nav className={`flex flex-col gap-1 ${className}`}>
      {navItems.map((item) => (
        <NavRow key={item.href} item={item} onNavigate={onNavigate} lock={locks[item.href]} />
      ))}
    </nav>
  )
}

/**
 * One item, and its children behind an arrow. The children show while the
 * player is on one of them, or after the arrow opens them; the collapsed
 * sidebar hides them (.sb-full), since the parent page links to them too.
 */
function NavRow({ item, onNavigate, lock }: { item: NavItem; onNavigate?: () => void; lock?: string }) {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const [toggled, setToggled] = useState<boolean | null>(null)

  const children = item.children ?? []
  const childActive = children.some((c) => within(pathname, c.href))
  const active = !childActive && (pathname === item.href || (item.match === "prefix" && pathname.startsWith(item.href + "/")))
  const open = toggled ?? childActive
  const Icon = item.icon
  const label = t(`items.${item.key}`)
  const listId = `nav-children-${item.key}`

  return (
    <div>
      <div className="relative flex items-center">
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          aria-label={lock ? t("locked", { label, reason: lock }) : label}
          data-tip={lock ? t("lockedTip", { label }) : label}
          className={[rowClass(active), "min-w-0 flex-1", children.length ? "pr-11" : ""].join(" ")}
        >
          {active && <ActiveBar />}
          <Icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-300 ease-spring group-hover:scale-110" />
          <span className="sb-label min-w-0 flex-1 leading-tight">
            <span className="block">{label}</span>
            {lock && <span className="mt-0.5 block whitespace-normal text-[11px] font-normal text-faint">{lock}</span>}
          </span>
          {lock && <Lock className="sb-label h-3.5 w-3.5 shrink-0 text-faint" aria-hidden="true" />}
        </Link>
        {children.length > 0 && (
          <button
            type="button"
            onClick={() => setToggled(!open)}
            aria-expanded={open}
            aria-controls={listId}
            aria-label={t(open ? "collapseSection" : "expandSection", { label })}
            className="sb-full absolute right-1 flex h-11 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronDown className={["h-4 w-4 transition-transform duration-300 ease-spring", open ? "rotate-180" : ""].join(" ")} aria-hidden="true" />
          </button>
        )}
      </div>
      {children.length > 0 && (
        <div id={listId} hidden={!open} className="sb-full mt-1 space-y-1 pl-5">
          {children.map((c) => {
            const on = within(pathname, c.href)
            const ChildIcon = c.icon
            const childLabel = t(`items.${c.key}`)
            return (
              <Link key={c.href} href={c.href} onClick={onNavigate} aria-current={on ? "page" : undefined} className={rowClass(on)}>
                {on && <ActiveBar />}
                <ChildIcon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 leading-tight">{childLabel}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
