import { AccountDashboard } from "@/components/akun-latihan/account-dashboard"
import { AccountEnd } from "@/components/akun-latihan/account-end"
import { CreateAccount } from "@/components/akun-latihan/create-account"
import { DemoTabs } from "@/components/akun-latihan/demo-tabs"
import { RequiredLesson } from "@/components/akun-latihan/intro-lesson"
import { GuestLockedCard, SessionsLockedCard } from "@/components/akun-latihan/locked-card"
import { NotReadyCard } from "@/components/akun-latihan/not-ready"
import { getCurrentUser } from "@/lib/auth"
import { ACCOUNT } from "@/lib/demo/config"
import { usd } from "@/lib/demo/format"
import { loadBalances, loadClosedTrades } from "@/lib/demo/history"
import { statTrade } from "@/lib/demo/journal"
import { publicLesson } from "@/lib/demo/lessons"
import { getAccess, loadDemoState, loadLedger } from "@/lib/demo/server"
import { accountReview, accountStats } from "@/lib/demo/stats"
import { loadTrading } from "@/lib/demo/trading"
import { buildView } from "@/lib/demo/view"

/**
 * One route, in order: sign in → finish 3 game sessions → create Akun #1 →
 * pass the required lesson → the account's dashboard. When an account runs
 * out (or is reset), the same route walks through Rex's review, the risk
 * lesson and the next account. Each step is decided on the server from the
 * player's own rows.
 */
export default async function AkunLatihanPage() {
  const user = await getCurrentUser()
  if (!user) return <GuestLockedCard />

  const [access, state] = await Promise.all([getAccess(user.id), loadDemoState(user.id)])
  if (!state.ready) return <NotReadyCard />
  if (!access.open) return <SessionsLockedCard unlock={access.unlock} />
  const startingBalance = usd(ACCOUNT.STARTING_BALANCE)
  if (state.accountCount === 0) return <CreateAccount startingBalance={startingBalance} leverage={ACCOUNT.LEVERAGE} />
  if (!state.introLessonPassed) return <RequiredLesson lesson={publicLesson("intro")} />

  const risk = publicLesson("risk")

  // Between accounts: the last one ran out or was reset.
  if (!state.account) {
    const last = state.accounts[0]
    const trades = await loadClosedTrades(user.id, last.id)
    return (
      <div className="flex flex-col gap-5">
        <DemoTabs />
        <AccountEnd
          number={last.number}
          ending={last.status === "reset" ? "reset" : "habis"}
          review={accountReview(trades.map(statTrade))}
          step={state.recoveryLessonDue ? "lesson" : "open"}
          lesson={risk}
          startingBalance={startingBalance}
        />
      </div>
    )
  }

  const account = state.account
  const [trading, trades, balances, ledger] = await Promise.all([
    loadTrading(user.id),
    loadClosedTrades(user.id, account.id),
    loadBalances(account.id),
    loadLedger(account.id),
  ])
  if (!trading) return <NotReadyCard />
  const view = buildView(trading.state)

  return (
    <div className="flex flex-col gap-5">
      <DemoTabs />
      {view.account.bust ? (
        // Run out but still open: the review, then closing it leads to the lesson.
        <AccountEnd
          number={account.number}
          ending="habis"
          review={accountReview(trades.map(statTrade))}
          step="close"
          lesson={risk}
          startingBalance={startingBalance}
        />
      ) : (
        <AccountDashboard
          view={view}
          stats={accountStats(trades.map(statTrade), balances)}
          ledger={ledger}
          startingBalance={startingBalance}
        />
      )}
    </div>
  )
}
