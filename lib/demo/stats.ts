import { ACCOUNT_REVIEW } from "@/lib/demo/config"
import { CHECK_IDS, rollingDisiplin, type CheckId, type Checks } from "@/lib/demo/disiplin"
import { roundMoney, type Side } from "@/lib/demo/money"

// The numbers on the account dashboard, in Rex's review of a finished
// account and in the graduation summary. Every one is counted from the
// player's own closed trades and ledger; with no trades, the callers show
// "—". Pure.

/** A closed trade, reduced to what the statistics need. */
export type StatTrade = {
  number: number
  pair: string
  side: Side
  lot: number
  /** The trade's own result (gross − costs); swap is separate. */
  net: number
  swap: number
  slInitial: number | null
  riskPct: number | null
  rewardRisk: number | null
  counted: boolean
  disiplin: number
  checks: Checks
  revenge: boolean
}

/** What the trade did to the balance: its result plus swap. */
export const tradeTotal = (t: Pick<StatTrade, "net" | "swap">) => roundMoney(t.net + t.swap)

const average = (values: number[], decimals: number) => {
  if (values.length === 0) return null
  const f = 10 ** decimals
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * f) / f
}

const share = (part: number, whole: number) => (whole === 0 ? null : Math.round((part / whole) * 100))

export type Drawdown = { amount: number; pct: number }

/** The biggest drop from a peak balance to a later low, in USD and in % of that peak. */
export function maxDrawdown(balances: number[]): Drawdown {
  let peak = -Infinity
  let worst: Drawdown = { amount: 0, pct: 0 }
  for (const b of balances) {
    if (b > peak) {
      peak = b
      continue
    }
    const drop = roundMoney(peak - b)
    if (drop > worst.amount) worst = { amount: drop, pct: peak > 0 ? Math.round((drop / peak) * 1000) / 10 : 0 }
  }
  return worst
}

export type AccountStats = {
  trades: number
  wins: number
  /** Whole %; null with no trades. */
  winRate: number | null
  /** Rolling Disiplin of the counted trades; null before the first. */
  disiplin: number | null
  /** Average risk at entry, % of balance, over trades opened with SL. */
  avgRiskPct: number | null
  /** Trades opened without SL: their risk had no limit, so they sit outside the average. */
  withoutSl: number
  /** Average reward:risk over trades opened with both SL and TP. */
  avgRewardRisk: number | null
  /** Whole % of trades opened with SL. */
  slAtEntryPct: number | null
  /** From the ledger's balances in order; null with no trades. */
  drawdown: Drawdown | null
}

/** The dashboard's numbers for one account: `trades` oldest first, `balances` every ledger row's balance_after in order. */
export function accountStats(trades: StatTrade[], balances: number[]): AccountStats {
  const withSl = trades.filter((t) => t.slInitial !== null)
  const wins = trades.filter((t) => tradeTotal(t) > 0).length
  return {
    trades: trades.length,
    wins,
    winRate: share(wins, trades.length),
    disiplin: rollingDisiplin(trades.filter((t) => t.counted).map((t) => t.disiplin)),
    avgRiskPct: average(withSl.flatMap((t) => (t.riskPct === null ? [] : [t.riskPct])), 1),
    withoutSl: trades.length - withSl.length,
    avgRewardRisk: average(trades.flatMap((t) => (t.rewardRisk === null ? [] : [t.rewardRisk])), 2),
    slAtEntryPct: share(withSl.length, trades.length),
    drawdown: trades.length === 0 ? null : maxDrawdown(balances),
  }
}

export type AccountReview = {
  trades: number
  /** The trade that cost the most (result plus swap); null without a losing trade. */
  biggestLoss: { number: number; pair: string; side: Side; lot: number; amount: number } | null
  avgRiskPct: number | null
  withoutSl: number
  /** The Disiplin checks failed most often, most first; only checks that failed at least once. */
  failed: { id: CheckId; count: number }[]
  /** Trades flagged as revenge trades. */
  revenge: number
}

/** Rex's review of an account that ran out or was reset. */
export function accountReview(trades: StatTrade[]): AccountReview {
  const stats = accountStats(trades, [])
  let biggestLoss: AccountReview["biggestLoss"] = null
  for (const t of trades) {
    const amount = tradeTotal(t)
    if (amount < 0 && (biggestLoss === null || amount < biggestLoss.amount)) {
      biggestLoss = { number: t.number, pair: t.pair, side: t.side, lot: t.lot, amount }
    }
  }
  const failed = CHECK_IDS.map((id) => ({ id, count: trades.filter((t) => !t.checks[id]).length }))
    .filter((f) => f.count > 0)
    // Stable: equal counts keep the order of CHECK_IDS.
    .sort((a, b) => b.count - a.count)
    .slice(0, ACCOUNT_REVIEW.TOP_FAILED_CHECKS)
  return {
    trades: trades.length,
    biggestLoss,
    avgRiskPct: stats.avgRiskPct,
    withoutSl: stats.withoutSl,
    failed,
    revenge: trades.filter((t) => t.revenge).length,
  }
}
