import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Card } from "@/components/card"
import { DemoTabs } from "@/components/akun-latihan/demo-tabs"
import { TipsList } from "@/components/akun-latihan/tips-list"
import { getCurrentUser } from "@/lib/auth"
import { getAccess, loadDemoState } from "@/lib/demo/server"

export const metadata: Metadata = { title: "Tips Rex · Akun Latihan" }

export default async function TipsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/akun-latihan")
  const [access, state] = await Promise.all([getAccess(user.id), loadDemoState(user.id)])
  if (!state.ready || !access.open || !state.account) redirect("/akun-latihan")

  return (
    <div className="flex flex-col gap-5">
      <DemoTabs />
      <Card className="sm:p-7">
        <h2 className="text-base font-semibold">Tips Rex</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Rex muncul sekali, tepat saat sebuah hal penting terjadi. Tips yang sudah muncul bisa dibaca lagi di sini.
        </p>
        <div className="mt-5">
          <TipsList seen={state.tipsSeen} />
        </div>
      </Card>
    </div>
  )
}
