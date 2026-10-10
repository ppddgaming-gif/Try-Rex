import Link from "next/link"
import { useTranslations } from "next-intl"
import { BrandMark } from "@/components/brand-mark"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { NavLinks, type NavLocks } from "@/components/nav-links"
import { ProfileCard, type ProfileSummary } from "@/components/profile-card"
import { Rex } from "@/components/rex-mascot"
import { SidebarToggle } from "@/components/sidebar-toggle"

/**
 * Desktop navigation. Collapses to a 76px icon rail with the burger toggle;
 * the width comes from --sidebar-w, which the main column's margin shares
 * (.sidebar / .app-main in globals.css).
 */
export function Sidebar({ profile, locks }: { profile: ProfileSummary | null; locks: NavLocks }) {
  const t = useTranslations("nav")
  return (
    <aside
      className="sidebar glass-rail fixed inset-y-0 left-0 z-40 hidden flex-col overflow-y-auto border-r border-border px-3.5 py-6 lg:flex"
      style={{ viewTransitionName: "app-sidebar" }}
    >
      <div className="sb-head flex items-center justify-between gap-2">
        <div className="sb-full min-w-0">
          <BrandMark size="lg" />
        </div>
        <Link href="/" aria-label={t("home")} className="sb-mini h-11 w-11 items-center justify-center">
          <Rex size={34} />
        </Link>
        <SidebarToggle />
      </div>
      {/* The collapsed rail has no room for it; Settings has it too. */}
      <div className="sb-full mt-5 px-2">
        <LocaleSwitcher />
      </div>
      <NavLinks className="mt-5" locks={locks} />
      <ProfileCard profile={profile} className="mt-auto" />
    </aside>
  )
}
