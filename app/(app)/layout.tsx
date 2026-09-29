import { AppNavMobile } from "@/components/app-nav-mobile"
import { Sidebar } from "@/components/sidebar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 lg:ml-64">
        <AppNavMobile />
        {children}
      </main>
    </div>
  )
}
