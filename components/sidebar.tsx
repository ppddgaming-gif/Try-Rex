import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"
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
  return (
    <aside
      className="sidebar glass-rail fixed inset-y-0 left-0 z-40 hidden flex-col overflow-y-auto border-r border-border px-3.5 py-6 lg:flex"
      style={{ viewTransitionName: "app-sidebar" }}
    >
      <div className="sb-head flex items-center justify-between gap-2">
        <div className="sb-full min-w-0">
          <BrandMark size="lg" />
        </div>
        <Link href="/" aria-label="TRY-REX beranda" className="sb-mini h-11 w-11 items-center justify-center">
          <Rex size={34} />
        </Link>
        <SidebarToggle />
      </div>
      <NavLinks className="mt-8" locks={locks} />
      <ProfileCard profile={profile} className="mt-auto" />
    </aside>
  )
}
