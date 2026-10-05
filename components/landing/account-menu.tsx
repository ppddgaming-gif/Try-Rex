"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, CircleHelp, LogOut, Settings } from "lucide-react"
import { Avatar } from "@/components/avatar"
import { signOut } from "@/lib/auth-actions"

export type LandingProfile = { name: string; avatarUrl: string | null }

const item =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

/**
 * The signed-in player's avatar in the landing header, with a small menu:
 * Pengaturan, Panduan, Keluar. A disclosure (button + list of links), closed
 * by Escape, an outside click, or following a link.
 */
export function AccountMenu({ profile }: { profile: LandingProfile }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointer(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return
      setOpen(false)
      button.current?.focus()
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="account-menu"
        aria-label={`Menu akun ${profile.name}`}
        className="flex min-h-11 items-center gap-1.5 rounded-full p-1 pr-2 transition-colors hover:bg-muted"
      >
        <Avatar src={profile.avatarUrl} name={profile.name} size={36} />
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <div
        id="account-menu"
        data-open={open}
        className="presence glass-card glass-strong absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl p-1.5"
      >
        <p className="truncate px-3 py-2 text-xs text-faint">{profile.name}</p>
        <Link href="/pengaturan" onClick={() => setOpen(false)} className={item}>
          <Settings className="h-4 w-4" aria-hidden="true" /> Pengaturan
        </Link>
        <Link href="/panduan" onClick={() => setOpen(false)} className={item}>
          <CircleHelp className="h-4 w-4" aria-hidden="true" /> Panduan
        </Link>
        <form action={signOut}>
          <button type="submit" className={item}>
            <LogOut className="h-4 w-4" aria-hidden="true" /> Keluar
          </button>
        </form>
      </div>
    </div>
  )
}
