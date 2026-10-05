"use client"

import { useState } from "react"
import Link from "next/link"
import { CircleHelp, LayoutDashboard, LogOut, Menu, Settings, X } from "lucide-react"
import { Avatar } from "@/components/avatar"
import { AccountMenu, type LandingProfile } from "@/components/landing/account-menu"
import { Rex } from "@/components/rex-mascot"
import { signOut } from "@/lib/auth-actions"

const links = [
  { label: "Product", href: "/#product" },
  { label: "Cara Kerja", href: "/#how" },
  { label: "Fitur", href: "/#features" },
]

const menuLink =
  "flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

/**
 * `profile` comes from the server (app/page.tsx), so the right buttons are in
 * the first paint instead of flashing "Masuk" and swapping. Guests get Masuk
 * and Daftar; a signed-in player gets Dashboard and their avatar menu.
 */
export function MarketingNav({ profile }: { profile: LandingProfile | null }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header
      className="glass-bar sticky top-0 z-50 border-b border-border/60"
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
          {profile ? (
            <>
              <Link href="/dashboard" className="btn btn-sm">
                Dashboard
              </Link>
              <AccountMenu profile={profile} />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Masuk
              </Link>
              <Link href="/signup" className="btn btn-sm">
                Daftar
              </Link>
            </>
          )}
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
        className="presence border-t border-border/60 px-5 py-4 md:hidden"
      >
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={close}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {profile ? (
          <div className="mt-3 flex flex-col gap-1 border-t border-border/60 pt-4">
            <div className="flex items-center gap-3 px-3 pb-2">
              <Avatar src={profile.avatarUrl} name={profile.name} size={36} />
              <span className="truncate text-sm font-semibold">{profile.name}</span>
            </div>
            <Link href="/dashboard" onClick={close} className="btn w-full">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/pengaturan" onClick={close} className={`${menuLink} mt-2`}>
              <Settings className="h-4 w-4" aria-hidden="true" /> Pengaturan
            </Link>
            <Link href="/panduan" onClick={close} className={menuLink}>
              <CircleHelp className="h-4 w-4" aria-hidden="true" /> Panduan
            </Link>
            <form action={signOut}>
              <button type="submit" className={`${menuLink} w-full`}>
                <LogOut className="h-4 w-4" aria-hidden="true" /> Keluar
              </button>
            </form>
          </div>
        ) : (
          // Full-size buttons (52px, 56px on phones): Daftar first, Masuk under it.
          <div className="mt-3 flex flex-col gap-3 border-t border-border/60 pt-4">
            <Link href="/signup" onClick={close} className="btn w-full">
              Daftar
            </Link>
            <Link href="/login" onClick={close} className="btn btn-ghost w-full">
              Masuk
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
