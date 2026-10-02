import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DemoTabs } from "@/components/akun-latihan/demo-tabs"
import { ProfitCalculator } from "@/components/akun-latihan/profit-calculator"
import { getCurrentUser } from "@/lib/auth"
import { ACCOUNT, STAGES } from "@/lib/demo/config"
import { usd } from "@/lib/demo/format"
import { sectionState } from "@/lib/demo/server"

export const metadata: Metadata = { title: "Kalkulator · Akun Latihan" }

/** The standalone Kalkulator Profit. The order panel has the same calculator built in. */
export default async function KalkulatorPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/akun-latihan")
  const state = await sectionState(user.id)
  if (!state) redirect("/akun-latihan")

  const account = state.account
  return (
    <div className="flex flex-col gap-5">
      <DemoTabs />
      <ProfitCalculator
        pairs={[...STAGES[3].pairs]}
        balance={account?.balance ?? ACCOUNT.STARTING_BALANCE}
        balanceLabel={account ? `saldo Akun #${account.number} (${usd(account.balance)})` : `saldo awal (${usd(ACCOUNT.STARTING_BALANCE)})`}
      />
    </div>
  )
}
