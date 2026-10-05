"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calculator, CandlestickChart, History, Lightbulb, NotebookPen, Wallet } from "lucide-react"

// Akun Latihan's sections. On a phone the bar scrolls sideways. `tour` is
// the data-tour value the Akun Latihan tour points at (lib/tours.ts).
const TABS = [
  { href: "/akun-latihan", label: "Akun", icon: Wallet, tour: "demo-tab-akun" },
  { href: "/akun-latihan/trading", label: "Trading", icon: CandlestickChart, tour: "demo-tab-trading" },
  { href: "/akun-latihan/jurnal", label: "Jurnal", icon: NotebookPen, tour: "demo-tab-jurnal" },
  { href: "/akun-latihan/riwayat", label: "Riwayat", icon: History, tour: "demo-tab-riwayat" },
  { href: "/akun-latihan/kalkulator", label: "Kalkulator", icon: Calculator, tour: "demo-tab-kalkulator" },
  { href: "/akun-latihan/tips", label: "Tips Rex", icon: Lightbulb, tour: "demo-tab-tips" },
]

export function DemoTabs() {
  const pathname = usePathname()
  return (
    <nav aria-label="Bagian Akun Latihan" className="glass-card glass-strong flex gap-1 overflow-x-auto rounded-2xl p-1.5">
      {TABS.map((t) => {
        const active = pathname === t.href
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            data-tour={t.tour}
            className={[
              "relative isolate flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-colors",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {active && (
              <span aria-hidden="true" className="pop-in absolute inset-0 -z-10 rounded-xl bg-primary shadow-[0_3px_0_var(--primary-dim)]" />
            )}
            <t.icon className="h-4 w-4" aria-hidden="true" />
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
