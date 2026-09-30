import { describe, expect, it } from "vitest"
import { planClose, planModify, planOrder, planStart, planStep, type NewTrade, type SettlePlan } from "@/lib/demo/actions"
import type { Bar } from "@/lib/demo/fills"
import { roundMoney } from "@/lib/demo/money"
import type { OrderInput } from "@/lib/demo/orders"
import type { Segment } from "@/lib/demo/segments"
import type { ClosedSummary, TradeRow, TradingState } from "@/lib/demo/state"
import { buildView } from "@/lib/demo/view"

// A flat EURUSD segment around 1.1700: 40 H4 candles, the first 30 shown.
const H4 = 4 * 3600
const T0 = 1_280_000_000 - (1_280_000_000 % 86_400) + 4 * H4
const flat = (i: number): Bar => ({ t: T0 + i * H4, o: 1.17, h: 1.1705, l: 1.1695, c: 1.17 })

function state(over: Partial<TradingState> = {}, candles: Record<number, Partial<Bar>> = {}): TradingState {
  return {
    account: { id: "acc", number: 1, balance: 200, startingBalance: 200, version: 3, candlesPlayed: 0 },
    stage: 1,
    session: { id: "ses", segmentId: "eurusd-1", pair: "EURUSD", cursor: 29, lastIndex: 39, status: "active" },
    segment: { pair: "EURUSD", digits: 5, timeframe: "H4", period: "Jan 2000" },
    segmentCandles: Array.from({ length: 40 }, (_, i) => ({ ...flat(i), ...candles[i] })),
    open: [],
    sessionClosed: [],
    history: [],
    slChanges: {},
    lines: [],
    tipsSeen: [],
    ...over,
  }
}

const plan: OrderInput = { side: "buy", lot: 0.01, slPips: 30, tpPips: 45, reasons: ["trend-naik"] }

/** The row the database would store for `t` (lib/demo/trading.ts inserts it). */
function rowFrom(t: NewTrade, over: Partial<TradeRow> = {}): TradeRow {
  return {
    id: "trade-1",
    number: 1,
    sessionId: t.session_id,
    pair: "EURUSD",
    side: t.side,
    lot: t.lot,
    stage: t.stage,
    reasons: t.reasons,
    entryPrice: t.entry_price,
    entryIndex: 29,
    openedClock: 0,
    slInitial: t.sl,
    tpInitial: t.tp,
    sl: t.sl,
    tp: t.tp,
    balanceAtEntry: t.balance_at_entry,
    margin: t.margin,
    spread: t.spread,
    commission: t.commission,
    riskAmount: t.risk_amount,
    riskPct: t.risk_pct,
    rewardRisk: t.reward_risk,
    rangeAvg: t.range_avg,
    revenge: t.revenge,
    swap: 0,
    status: "open",
    exitPrice: null,
    exitIndex: null,
    closedClock: null,
    exitReason: null,
    pips: null,
    gross: null,
    net: null,
    counted: null,
    checks: null,
    disiplin: null,
    xp: 0,
    review: null,
    reviewNote: null,
    ...over,
  }
}

function open(s: TradingState, input: OrderInput = plan, over: Partial<TradeRow> = {}) {
  const r = planOrder(s, input)
  if ("error" in r) throw new Error(r.error)
  return rowFrom(r.trade, over)
}

const settled = (r: SettlePlan | { error: string }) => {
  if ("error" in r) throw new Error(r.error)
  return r
}

describe("planOrder", () => {
  it("won't confirm a Stage 1 trade without reasons, SL and TP", () => {
    expect(planOrder(state(), { ...plan, reasons: [], slPips: null, tpPips: null })).toEqual({ error: "Pilih minimal 1 alasan." })
    expect(planOrder(state(), { ...plan, slPips: null })).toEqual({ error: "Pasang stop loss." })
    expect(planOrder(state(), { ...plan, tpPips: null })).toEqual({ error: "Pasang take profit." })
  })

  it("books the order at the current close with the panel's numbers", () => {
    const r = planOrder(state(), plan)
    if ("error" in r) throw new Error(r.error)
    expect(r.trade).toMatchObject({
      entry_price: 1.17,
      sl: 1.167,
      tp: 1.1745,
      margin: 11.7,
      spread: 0.1,
      commission: 0,
      risk_amount: 3.1,
      risk_pct: 1.6,
      reward_risk: 1.5,
      revenge: false,
    })
  })

  it("refuses when the segment has ended", () => {
    const s = state({ session: { id: "ses", segmentId: "eurusd-1", pair: "EURUSD", cursor: 39, lastIndex: 39, status: "ended" } })
    expect(planOrder(s, plan)).toEqual({ error: "Mulai chart dulu." })
  })

  it("flags a bigger lot within 3 candles of a loss as revenge", () => {
    const loss: ClosedSummary = { accountId: "acc", stage: 2, counted: true, disiplin: 100, net: -3.1, swap: 0, lot: 0.01, closedClock: 5 }
    const s = state({ stage: 2, history: [loss], account: { ...state().account, candlesPlayed: 7 } })
    const r = planOrder(s, { ...plan, lot: 0.03 })
    if ("error" in r) throw new Error(r.error)
    expect(r.trade.revenge).toBe(true)
    expect(r.events[0]).toMatchObject({ kind: "opened", revenge: true })
    const calm = planOrder(state({ ...s, account: { ...s.account, candlesPlayed: 9 } }), { ...plan, lot: 0.03 })
    expect("error" in calm ? null : calm.trade.revenge).toBe(false)
  })
})

describe("planStep", () => {
  it("a BUY whose SL is hit books exactly the predicted loss, scores 100 and earns full XP", () => {
    const s0 = state({}, { 30: { o: 1.1699, h: 1.17, l: 1.1665, c: 1.1668 } })
    const row = open(s0)
    const p = settled(planStep(state({ open: [row] }, { 30: { o: 1.1699, h: 1.17, l: 1.1665, c: 1.1668 } })))
    expect(p.updates[0].close).toMatchObject({ exit_reason: "sl", exit_price: 1.167, net: -3.1, disiplin: 100, counted: true, xp: 20 })
    expect(p.ledger).toEqual([{ kind: "trade", label: "Trade #1 · BUY EURUSD", amount: -3.1, balance_after: 196.9, trade_id: "trade-1" }])
    expect(p.balance).toBe(196.9)
    expect(p.events).toEqual([
      { kind: "closed", number: 1, reason: "sl" },
      { kind: "xp", amount: 20 },
    ])
  })

  it("a profitable trade with risk above the limit still scores low", () => {
    const s = state({ stage: 2 }, { 30: { o: 1.1701, h: 1.1731, l: 1.17, c: 1.173 } })
    // 0.05 lot with a 30-pip SL risks $15.50 (7.8%); a 30-pip TP is only 1:1.
    const row = open(s, { ...plan, lot: 0.05, tpPips: 30 })
    const p = settled(planStep({ ...s, open: [row] }))
    expect(p.updates[0].close).toMatchObject({ exit_reason: "tp", disiplin: 60, xp: 12 })
    expect(p.updates[0].close!.net).toBeGreaterThan(0)
  })

  it("charges swap when a candle crosses midnight", () => {
    const s = state()
    const row = open(s)
    // Candle 30 starts a new UTC day.
    const midnight = { t: T0 + 30 * H4 + (86_400 - ((T0 + 30 * H4) % 86_400)) }
    const p = settled(planStep(state({ open: [row] }, { 30: midnight })))
    expect(p.updates).toEqual([{ id: "trade-1", swap: -0.05, close: null }])
  })

  it("closes open trades at the last close when the segment ends", () => {
    const s = state({ session: { id: "ses", segmentId: "eurusd-1", pair: "EURUSD", cursor: 38, lastIndex: 39, status: "active" } })
    const row = open(s, plan, { entryIndex: 38 })
    const p = settled(planStep({ ...s, open: [row] }))
    expect(p.endSession).toBe(true)
    expect(p.updates[0].close).toMatchObject({ exit_reason: "segment_end", exit_price: 1.17 })
    expect(p.events.map((e) => e.kind)).toEqual(["closed", "segment_end", "xp"])
  })

  it("stops out and says so first", () => {
    const s = state({ stage: 2 }, { 30: { o: 1.17, h: 1.1702, l: 1.16, c: 1.161 } })
    const row = open(s, { ...plan, lot: 0.15, slPips: null, tpPips: null })
    const p = settled(planStep({ ...s, open: [row] }))
    expect(p.events[0]).toMatchObject({ kind: "stop_out" })
    expect(p.updates[0].close?.exit_reason).toBe("stop_out")
  })

  it("won't step past the end", () => {
    const s = state({ session: { id: "ses", segmentId: "eurusd-1", pair: "EURUSD", cursor: 39, lastIndex: 39, status: "active" } })
    expect(planStep(s)).toEqual({ error: "Segmen ini sudah habis. Ganti chart." })
  })

  it("opens Stage 2 after the tenth counted trade at 80%", () => {
    const history: ClosedSummary[] = Array.from({ length: 9 }, (_, i) => ({
      accountId: "acc",
      stage: 1,
      counted: true,
      disiplin: 100,
      net: 1,
      swap: 0,
      lot: 0.01,
      closedClock: i,
    }))
    const s0 = state({ history }, { 30: { o: 1.1699, h: 1.17, l: 1.1665, c: 1.1668 } })
    const p = settled(planStep({ ...s0, open: [open(s0)] }))
    expect(p.stage).toBe(2)
    expect(p.events).toContainEqual({ kind: "stage_up", stage: 2 })
  })
})

describe("the ledger adds up (the rule demo_settle enforces)", () => {
  // Starting from the account's balance, each row's balance_after is the
  // previous balance plus its amount, and the new balance is the last one.
  function expectChained(start: number, p: SettlePlan) {
    let running = start
    for (const row of p.ledger) {
      expect(row.balance_after).toBe(roundMoney(running + row.amount))
      running = row.balance_after
    }
    expect(p.balance).toBe(running)
  }

  const midnight = T0 + 30 * H4 + (86_400 - ((T0 + 30 * H4) % 86_400))
  const cases: [string, () => SettlePlan][] = [
    ["an SL hit", () => {
      const s = state({}, { 30: { o: 1.1699, h: 1.17, l: 1.1665, c: 1.1668 } })
      return settled(planStep({ ...s, open: [open(s)] }))
    }],
    ["a close with swap: trade row, then swap row", () => {
      const s = state({}, { 30: { t: midnight, o: 1.1699, h: 1.17, l: 1.1665, c: 1.1668 } })
      return settled(planStep({ ...s, open: [open(s)] }))
    }],
    ["a manual close", () => {
      const s = state()
      return settled(planClose(state({ open: [open(s)] }), "trade-1"))
    }],
    ["a candle with nothing to book", () => settled(planStep(state()))],
    ["a gap past the stop-out level: trade row, then negative balance protection", () => {
      const s = state({ stage: 2 }, { 30: { o: 1.145, h: 1.146, l: 1.144, c: 1.145 } })
      return settled(planStep({ ...s, open: [open(s, { ...plan, lot: 0.15, slPips: null, tpPips: null })] }))
    }],
  ]

  it.each(cases)("%s", (_name, run) => {
    const p = run()
    expectChained(200, p)
  })

  it("books swap as its own row and protects the balance at zero", () => {
    expect(cases[1][1]().ledger.map((r) => r.kind)).toEqual(["trade", "swap"])
    const gap = cases[4][1]()
    expect(gap.ledger.map((r) => r.kind)).toEqual(["trade", "adjustment"])
    expect(gap.balance).toBe(0)
  })
})

describe("planClose", () => {
  it("a trade closed in the candle it opened doesn't count and earns no XP", () => {
    const s = state()
    const p = settled(planClose(state({ open: [open(s)] }), "trade-1"))
    expect(p.updates[0].close).toMatchObject({ exit_reason: "manual", counted: false, xp: 0, net: -0.1 })
    expect(p.events).toEqual([{ kind: "closed", number: 1, reason: "manual" }])
  })
})

describe("planModify", () => {
  const row = open(state())
  // One candle later, price has risen 20 pips above the 1.1700 entry.
  const withTrade = state(
    { open: [row], session: { id: "ses", segmentId: "eurusd-1", pair: "EURUSD", cursor: 30, lastIndex: 39, status: "active" } },
    { 30: { o: 1.17, h: 1.1725, l: 1.1698, c: 1.172 } },
  )

  it.each([
    ["SL closer", "sl", 20, 1.168],
    ["SL to break-even", "sl", 0, 1.17],
    ["SL past entry, locking in profit", "sl", -10, 1.171],
    ["TP further", "tp", 60, 1.176],
  ] as const)("%s", (_name, field, pips, price) => {
    expect(planModify(withTrade, "trade-1", field, pips)).toEqual({ tradeId: "trade-1", field, price, atIndex: 30 })
  })

  it.each([
    ["SL above the current price on a BUY", "sl", -30, "SL harus di bawah harga sekarang."],
    ["removing SL in Stage 1", "sl", null, "Stage 1: SL dan TP wajib."],
    ["no change", "tp", 45, "Tidak ada perubahan."],
    ["a TP on the losing side", "tp", -10, "Jarak TP tidak valid."],
  ] as const)("refuses %s", (_name, field, pips, error) => {
    expect(planModify(withTrade, "trade-1", field, pips)).toEqual({ error })
  })

  it("a widened SL fails its Disiplin check at close", () => {
    const widened = state(
      { open: [{ ...row, sl: 1.166 }], slChanges: { "trade-1": [{ from: 1.167, to: 1.166 }] } },
      { 30: { o: 1.1699, h: 1.17, l: 1.1655, c: 1.166 } },
    )
    const p = settled(planStep(widened))
    expect(p.updates[0].close).toMatchObject({ exit_price: 1.166, disiplin: 80 })
    expect(p.updates[0].close!.checks.slNotWidened).toBe(false)
  })
})

describe("planStart", () => {
  const pool = ["eurusd-1", "eurusd-2"].map(
    (id): Segment => ({ id, datasetId: id, pair: "EURUSD", offset: 0, length: 40, startCursor: 29, lastIndex: 39 }),
  )

  it("refuses to change the chart with a trade open", () => {
    const s = state()
    expect(planStart(state({ open: [open(s)] }), pool, new Map(), () => 0)).toEqual({
      error: "Tutup trade yang terbuka dulu sebelum ganti chart.",
    })
  })

  it("always gives a different chart", () => {
    expect(planStart(state(), pool, new Map(), () => 0)).toMatchObject({ id: "eurusd-2" })
  })
})

describe("buildView never sends a candle past the cursor", () => {
  it.each([29, 33, 39])("cursor %i", (cursor) => {
    const s = state({ session: { id: "ses", segmentId: "eurusd-1", pair: "EURUSD", cursor, lastIndex: 39, status: "active" } })
    const v = buildView(s)
    expect(v.session!.candles).toHaveLength(cursor + 1)
    expect(v.session!.candles.at(-1)!.t).toBe(s.segmentCandles[cursor].t)
    expect(v.session!.remaining).toBe(39 - cursor)
    const later = new Set(s.segmentCandles.slice(cursor + 1).map((c) => c.t))
    expect(v.session!.candles.some((c) => later.has(c.t))).toBe(false)
    // Nothing else in the view carries the segment's length or its id.
    expect(JSON.stringify(v)).not.toContain("eurusd-1")
  })

  it("shows a new account's starting balance and — for every stat", () => {
    const v = buildView(state({ session: null, segment: null }))
    expect(v.account.figures).toMatchObject({ balance: 200, equity: 200, openPnl: 0, marginUsed: 0, freeMargin: 200 })
    expect(v.stats).toEqual({ trades: 0, wins: 0, net: 0, disiplin: null })
    expect(v.stage.label).toBe("0/10 trade · Disiplin — (butuh 80%)")
    expect(v.guide).toBe(true)
  })
})
