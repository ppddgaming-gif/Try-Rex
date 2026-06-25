"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LineChart, BrainCircuit, Trophy } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/trading-game", label: "Trading Game", icon: LineChart },
  { href: "/ai-evaluation", label: "AI Evaluation", icon: BrainCircuit },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card/40 px-4 py-6 lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
          <span className="text-2xl" aria-hidden="true">
            🦖
          </span>
        </div>
        <div className="leading-tight">
          <p className="text-lg font-extrabold tracking-tight">
            TRY<span className="text-primary">-REX</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            AI Trading Mentor
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-10 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
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

      {/* Profile / Level card */}
      <div className="mt-auto rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">RexTrader</p>
            <p className="text-xs text-muted-foreground">Novice Trader</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-primary">Level 12</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: "72%" }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">720 / 1000 XP</p>
        </div>
      </div>
    </aside>
  )
}
