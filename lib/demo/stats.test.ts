import { describe, expect, it } from "vitest"
import type { Checks } from "@/lib/demo/disiplin"
import { accountReview, accountStats, maxDrawdown, type StatTrade } from "@/lib/demo/stats"

const pass: Checks = { slAtEntry: true, riskWithinLimit: true, rewardRisk: true, slNotWidened: true, notRevenge: true }

let n = 0
function trade(over: Partial<StatTrade> = {}): StatTrade {
  n += 1
  return {
    number: n,
    pair: "EURUSD",
    side: "buy",
    lot: 0.01,
    net: -3,
    swap: 0,
    slInitial: 1.167,
    riskPct: 1.5,
    rewardRisk: 1.5,
    counted: true,
    disiplin: 100,
    checks: pass,
    revenge: false,
    ...over,
  }
}

describe("maxDrawdown: biggest drop from a peak to a later low", () => {
  it.each([
    ["only the deposit", [200], { amount: 0, pct: 0 }],
    ["only up", [200, 204.38, 210], { amount: 0, pct: 0 }],
    ["one drop from the start", [200, 190, 195], { amount: 10, pct: 5 }],
    ["a new peak, then a bigger drop", [200, 190, 220, 187], { amount: 33, pct: 15 }],
    ["the deeper of two drops", [200, 150, 260, 230], { amount: 50, pct: 25 }],
    ["run down to zero", [200, 120, 0], { amount: 200, pct: 100 }],
    ["cents stay exact", [200, 196.9, 193.8], { amount: 6.2, pct: 3.1 }],
  ])("%s", (_name, balances, expected) => {
    expect(maxDrawdown(balances)).toEqual(expected)
  })
})

describe("accountStats", () => {
  it("a new account has nothing to count", () => {
    expect(accountStats([], [200])).toEqual({
      trades: 0,
      wins: 0,
      winRate: null,
      disiplin: null,
      avgRiskPct: null,
      withoutSl: 0,
      avgRewardRisk: null,
      slAtEntryPct: null,
      drawdown: null,
    })
  })

  it("counts the account's own trades", () => {
    const trades = [
      trade({ net: 4.38, riskPct: 2.1, rewardRisk: 1.1, disiplin: 60 }),
      trade({ net: -3.1, riskPct: 1.5, rewardRisk: 2 }),
      // Opened without SL or TP: outside the risk and reward averages.
      trade({ net: 1, slInitial: null, riskPct: null, rewardRisk: null, disiplin: 40 }),
      // Closed in the candle it opened: no Disiplin average.
      trade({ net: -0.5, swap: 0, counted: false, disiplin: 0, riskPct: 0.9 }),
    ]
    const s = accountStats(trades, [200, 204.38, 201.28, 202.28, 201.78])
    expect(s).toEqual({
      trades: 4,
      wins: 2,
      winRate: 50,
      disiplin: 67,
      avgRiskPct: 1.5,
      withoutSl: 1,
      avgRewardRisk: 1.53,
      slAtEntryPct: 75,
      drawdown: { amount: 3.1, pct: 1.5 },
    })
  })

  it("swap decides a win: a $0.40 trade that paid $0.50 swap lost", () => {
    expect(accountStats([trade({ net: 0.4, swap: -0.5 })], [200, 199.9]).wins).toBe(0)
  })
})

describe("accountReview", () => {
  it("an account reset before any trade", () => {
    expect(accountReview([])).toEqual({ trades: 0, biggestLoss: null, avgRiskPct: null, withoutSl: 0, failed: [], revenge: 0 })
  })

  it("biggest loss, average risk, checks failed most often, revenge count", () => {
    const risky: Checks = { ...pass, riskWithinLimit: false }
    const trades = [
      trade({ net: 5, riskPct: 5, checks: { ...risky, rewardRisk: false } }),
      trade({ net: -12.4, swap: -0.5, riskPct: 6, lot: 0.04, checks: risky }),
      trade({ net: -10, riskPct: 5, lot: 0.05, side: "sell", revenge: true, checks: { ...risky, notRevenge: false } }),
      trade({ net: -1, slInitial: null, riskPct: null, checks: { ...pass, slAtEntry: false, riskWithinLimit: false, rewardRisk: false } }),
    ]
    const r = accountReview(trades)
    expect(r.trades).toBe(4)
    expect(r.biggestLoss).toEqual({ number: trades[1].number, pair: "EURUSD", side: "buy", lot: 0.04, amount: -12.9 })
    expect(r.avgRiskPct).toBe(5.3)
    expect(r.withoutSl).toBe(1)
    expect(r.failed).toEqual([
      { id: "riskWithinLimit", count: 4 },
      { id: "rewardRisk", count: 2 },
    ])
    expect(r.revenge).toBe(1)
  })

  it("no losing trade means no biggest loss, and a tie keeps the checks' order", () => {
    const r = accountReview([
      trade({ net: 2, checks: { ...pass, rewardRisk: false } }),
      trade({ net: 3, checks: { ...pass, slNotWidened: false } }),
      trade({ net: 1, checks: { ...pass, slAtEntry: false } }),
    ])
    expect(r.biggestLoss).toBeNull()
    expect(r.failed.map((f) => f.id)).toEqual(["slAtEntry", "rewardRisk"])
  })
})
