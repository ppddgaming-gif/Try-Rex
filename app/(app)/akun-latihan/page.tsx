import { AccountOverview } from "@/components/akun-latihan/account-overview"
import { CreateAccount } from "@/components/akun-latihan/create-account"
import { DemoTabs } from "@/components/akun-latihan/demo-tabs"
import { RequiredLesson } from "@/components/akun-latihan/intro-lesson"
import { GuestLockedCard, SessionsLockedCard } from "@/components/akun-latihan/locked-card"
import { NotReadyCard } from "@/components/akun-latihan/not-ready"
import { getCurrentUser } from "@/lib/auth"
import { ACCOUNT } from "@/lib/demo/config"
import { usd } from "@/lib/demo/format"
import { publicLesson } from "@/lib/demo/lessons"
import { getAccess, loadDemoState, loadLedger } from "@/lib/demo/server"

/**
 * One route, in order: sign in → finish 3 game sessions → create Akun #1 →
 * pass the required lesson → the account. Each step is decided on the
 * server from the player's own rows.
 */
export default async function AkunLatihanPage() {
  const user = await getCurrentUser()
  if (!user) return <GuestLockedCard />

  const [access, state] = await Promise.all([getAccess(user.id), loadDemoState(user.id)])
  if (!state.ready) return <NotReadyCard />
  if (!access.open) return <SessionsLockedCard unlock={access.unlock} />
  if (!state.account) return <CreateAccount startingBalance={usd(ACCOUNT.STARTING_BALANCE)} leverage={ACCOUNT.LEVERAGE} />
  if (!state.introLessonPassed) return <RequiredLesson lesson={publicLesson("intro")} />

  const ledger = await loadLedger(state.account.id)
  return (
    <div className="flex flex-col gap-5">
      <DemoTabs />
      <AccountOverview account={state.account} ledger={ledger} />
    </div>
  )
}
