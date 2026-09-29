"use client"

import Link from "next/link"
import { LogOut } from "lucide-react"
import { signOut } from "@/lib/auth-actions"
import { LevelXp } from "@/components/progress/level-xp"
import { Streak } from "@/components/progress/streak"
import { Rex } from "@/components/rex-mascot"

/**
 * Account block at the foot of the sidebar and the mobile menu. `name` is the
 * signed-in display name, or null for a guest. Level, XP and streak come from
 * the player's real progress (lib/progress), guests included, and update the
 * moment an answer is recorded.
 */
export function ProfileCard({ name, className = "" }: { name: string | null; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Rex size={36} />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">{name ?? "Tamu"}</p>
          <p className="text-xs text-muted-foreground">{name ? "Trader" : "Belum masuk"}</p>
        </div>
      </div>

      <div className="mt-4">
        <LevelXp />
      </div>
      <div className="mt-4">
        <Streak />
      </div>

      {name ? (
        <form action={signOut} className="mt-4">
          <button type="submit" className="btn btn-ghost btn-sm w-full">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </form>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs leading-relaxed text-muted-foreground">Progres tersimpan di perangkat ini.</p>
          <Link href="/login" className="btn btn-sm w-full">
            Masuk
          </Link>
          <Link href="/signup" className="btn btn-ghost btn-sm w-full">
            Daftar gratis
          </Link>
        </div>
      )}
    </div>
  )
}
