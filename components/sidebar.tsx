import { BrandMark } from "@/components/brand-mark"
import { NavLinks } from "@/components/nav-links"
import { ProfileCard, type ProfileSummary } from "@/components/profile-card"

export function Sidebar({ profile }: { profile: ProfileSummary | null }) {
  return (
    <aside
      className="glass-rail fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto border-r border-border px-4 py-6 lg:flex"
      style={{ viewTransitionName: "app-sidebar" }}
    >
      <BrandMark size="lg" />
      <NavLinks className="mt-10" />
      <ProfileCard profile={profile} className="mt-auto" />
    </aside>
  )
}
