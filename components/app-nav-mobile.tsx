"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import { NavLinks } from "@/components/nav-links"
import { ProfileCard } from "@/components/profile-card"

// The sidebar is desktop-only, so this is the sole way to move between app
// routes below the lg breakpoint.
export function AppNavMobile({ userName }: { userName: string | null }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center justify-between px-5">
        <BrandMark onNavigate={close} />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="app-nav-menu"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="app-nav-menu" className="border-t border-border bg-background px-5 py-4">
          <NavLinks onNavigate={close} />
          <ProfileCard name={userName} className="mt-4" />
        </div>
      )}
    </header>
  )
}
