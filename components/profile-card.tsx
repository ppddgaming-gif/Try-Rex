import Link from "next/link"
import { LogOut, Trophy } from "lucide-react"
import { signOut } from "@/lib/auth-actions"

/**
 * Account block at the foot of the sidebar and the mobile menu. `name` is the
 * signed-in user's display name, or null for a guest.
 *
 * Level and XP are fixed at Level 1 / 0 XP until progress is saved to the
 * account (next ticket). Don't put invented numbers back here.
 */
export function ProfileCard({ name, className = "" }: { name: string | null; className?: string }) {
  if (!name) {
    return (
      <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>
        <p className="text-sm font-semibold">Kamu belum masuk</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Masuk untuk menyimpan progres latihanmu.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link href="/login" className="btn btn-sm w-full">
            Masuk
          </Link>
          <Link href="/signup" className="btn btn-ghost btn-sm w-full">
            Daftar gratis
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">Trader pemula</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-primary">Level 1</span>
          <span className="font-mono text-muted-foreground">0 XP</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true" />
      </div>

      <form action={signOut} className="mt-4">
        <button type="submit" className="btn btn-ghost btn-sm w-full">
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </form>
    </div>
  )
}
