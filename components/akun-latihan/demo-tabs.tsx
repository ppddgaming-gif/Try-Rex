"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calculator, CandlestickChart, History, Lightbulb, NotebookPen, Wallet } from "lucide-react"
import { useTranslations } from "next-intl"

// Akun Latihan's sections. On a phone the bar scrolls sideways. Labels:
// demo.ui.tabs.<key>.
const TABS = [
  { href: "/akun-latihan", key: "akun", icon: Wallet },
  { href: "/akun-latihan/trading", key: "trading", icon: CandlestickChart },
  { href: "/akun-latihan/jurnal", key: "jurnal", icon: NotebookPen },
  { href: "/akun-latihan/riwayat", key: "riwayat", icon: History },
  { href: "/akun-latihan/kalkulator", key: "kalkulator", icon: Calculator },
  { href: "/akun-latihan/tips", key: "tips", icon: Lightbulb },
]

export function DemoTabs() {
  const pathname = usePathname()
  const t = useTranslations("demo.ui.tabs")
  return (
    <nav aria-label={t("label")} className="glass-card glass-strong flex gap-1 overflow-x-auto rounded-2xl p-1.5">
      {TABS.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={[
              "relative isolate flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-colors",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {active && (
              <span aria-hidden="true" className="pop-in absolute inset-0 -z-10 rounded-xl bg-primary shadow-[0_3px_0_var(--primary-dim)]" />
            )}
            <tab.icon className="h-4 w-4" aria-hidden="true" />
            {t(tab.key)}
          </Link>
        )
      })}
    </nav>
  )
}
