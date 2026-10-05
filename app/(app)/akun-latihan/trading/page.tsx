import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DemoTabs } from "@/components/akun-latihan/demo-tabs"
import { TradingScreen } from "@/components/akun-latihan/trading-screen"
import { getCurrentUser } from "@/lib/auth"
import { getAccess, loadDemoState } from "@/lib/demo/server"
import { loadTrading } from "@/lib/demo/trading"
import { buildView } from "@/lib/demo/view"

export const metadata: Metadata = { title: "Trading · Akun Latihan" }

/**
 * The replay and the order panel. Same gate as /akun-latihan (account and
 * required lesson first); the browser gets the view, which holds candles up
 * to the current one only.
 */
export default async function TradingPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/akun-latihan")
  const [access, state] = await Promise.all([getAccess(user.id), loadDemoState(user.id)])
  if (!state.ready || !access.open || !state.account || !state.introLessonPassed) redirect("/akun-latihan")
  const loaded = await loadTrading(user.id)
  if (!loaded) redirect("/akun-latihan")

  return (
    <div className="flex flex-col gap-5">
      <DemoTabs />
      <TradingScreen initial={buildView(loaded.state)} />
    </div>
  )
}
