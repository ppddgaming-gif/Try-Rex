"use client"

import Link from "next/link"
import { ChevronRight, LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import { signOut } from "@/lib/auth-actions"
import { Avatar } from "@/components/avatar"
import { LevelXp } from "@/components/progress/level-xp"
import { Streak } from "@/components/progress/streak"
import { Rex } from "@/components/rex-mascot"

export type ProfileSummary = { name: string; username: string | null; avatarUrl: string | null }

/**
 * Account block at the foot of the sidebar and the mobile menu. `profile` is
 * the signed-in player, or null for a guest. Level, XP and streak come from
 * the player's real progress (lib/progress), guests included, and update the
 * moment an answer is recorded.
 */
export function ProfileCard({
  profile,
  className = "",
  onNavigate,
}: {
  profile: ProfileSummary | null
  className?: string
  onNavigate?: () => void
}) {
  const t = useTranslations("nav.profile")
  return (
    <div className={`profile-card glass-card rounded-2xl p-4 ${className}`}>
      {/* Collapsed sidebar: just the face, linking to Settings (or sign-in). */}
      <Link
        href={profile ? "/pengaturan#profil" : "/login"}
        onClick={onNavigate}
        aria-label={profile ? t("settingsOf", { name: profile.name }) : t("signIn")}
        data-tip={profile ? profile.name : t("signIn")}
        className="sb-mini justify-center"
      >
        <Avatar
          src={profile?.avatarUrl ?? null}
          name={profile?.name ?? t("guest")}
          size={40}
          fallback={profile ? undefined : <Rex size={30} />}
        />
      </Link>

      <div className="sb-full">
      {profile ? (
        <Link
          href="/pengaturan#profil"
          onClick={onNavigate}
          className="group -m-2 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-foreground/5"
        >
          <Avatar src={profile.avatarUrl} name={profile.name} size={40} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold">{profile.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {profile.username ? `@${profile.username}` : t("setUpProfile")}
            </p>
          </div>
          <ChevronRight
            className="h-4 w-4 text-faint transition-transform duration-300 ease-spring group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ) : (
        <div className="flex items-center gap-3">
          <Avatar src={null} name={t("guest")} size={40} fallback={<Rex size={30} />} />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">{t("guest")}</p>
            <p className="text-xs text-muted-foreground">{t("notSignedIn")}</p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <LevelXp />
      </div>
      <div className="mt-4">
        <Streak />
      </div>

      {profile ? (
        <form action={signOut} className="mt-4">
          <button type="submit" className="btn btn-ghost btn-sm w-full">
            <LogOut className="h-4 w-4" /> {t("signOut")}
          </button>
        </form>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("guestNote")}
          </p>
          <Link href="/login" onClick={onNavigate} className="btn btn-sm w-full">
            {t("signIn")}
          </Link>
          <Link href="/signup" onClick={onNavigate} className="btn btn-ghost btn-sm w-full">
            {t("signUp")}
          </Link>
        </div>
      )}
      </div>
    </div>
  )
}
