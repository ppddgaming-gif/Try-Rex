"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { BrandMark } from "@/components/brand-mark"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { NavLinks, type NavLocks } from "@/components/nav-links"
import { ProfileCard, type ProfileSummary } from "@/components/profile-card"

// The sidebar is desktop-only, so this is the sole way to move between app
// routes below the lg breakpoint.
export function AppNavMobile({ profile, locks }: { profile: ProfileSummary | null; locks: NavLocks }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const t = useTranslations("nav")

  return (
    <header className="glass-bar sticky top-0 z-40 border-b border-border lg:hidden" style={{ viewTransitionName: "app-header" }}>
      <div className="flex h-16 items-center justify-between px-5">
        <BrandMark onNavigate={close} />
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          aria-controls="app-nav-menu"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          {/* Keyed so the new icon mounts and turns in, instead of popping. */}
          <span key={open ? "close" : "open"} className="icon-swap flex">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </span>
        </button>
        </div>
      </div>

      {/* Stays mounted so the drawer animates closed as well as open. */}
      <div id="app-nav-menu" data-open={open} className="presence border-t border-border px-5 py-4">
        <NavLinks onNavigate={close} locks={locks} />
        <ProfileCard profile={profile} onNavigate={close} className="mt-4" />
      </div>
    </header>
  )
}
