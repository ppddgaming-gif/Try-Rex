"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ArrowUpRight } from "lucide-react"
import { Rex } from "@/components/rex-mascot"

const links = [
  { label: "Product", href: "/#product" },
  { label: "Cara Kerja", href: "/#how" },
  { label: "Fitur", href: "/#features" },
  { label: "Testimoni", href: "/#testimonials" },
]

/**
 * `signedIn` comes from the server (app/page.tsx), so the right button is in
 * the first paint instead of flashing "Masuk" and swapping.
 */
export function MarketingNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false)
  const account = signedIn ? { href: "/dashboard", label: "Dashboard" } : { href: "/login", label: "Masuk" }

  return (
    <header
      className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-[11px]">
          <Rex size={38} />
          <span className="font-display text-[20px] font-extrabold tracking-[-0.02em]">TRY-REX</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={account.href}
            className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            {account.label}
          </Link>
          <Link href="/trading-game" className="btn btn-sm">
            Mulai Sekarang
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="marketing-menu"
        >
          {/* Keyed so the new icon mounts and turns in, instead of popping. */}
          <span key={open ? "close" : "open"} className="icon-swap flex">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </span>
        </button>
      </div>

      {/* Mobile menu: stays mounted so it can animate closed as well as open. */}
      <div
        id="marketing-menu"
        data-open={open}
        className="presence border-t border-border/60 bg-background px-5 py-4 md:hidden"
      >
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <Link
              href={account.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {account.label}
            </Link>
            <Link href="/trading-game" className="btn btn-sm mt-2">
              Mulai Sekarang
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </nav>
      </div>
    </header>
  )
}
