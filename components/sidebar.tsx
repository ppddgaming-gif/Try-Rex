import { BrandMark } from "@/components/brand-mark"
import { NavLinks } from "@/components/nav-links"
import { ProfileCard } from "@/components/profile-card"

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card/40 px-4 py-6 lg:flex">
      <BrandMark size="lg" />
      <NavLinks className="mt-10" />
      <ProfileCard className="mt-auto" />
    </aside>
  )
}
