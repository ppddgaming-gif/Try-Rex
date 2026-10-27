import { describe, expect, it } from "vitest"
import { COSTS } from "@/lib/demo/config"
import type { OpenTrade } from "@/lib/demo/fills"
import type { OrderInput } from "@/lib/demo/orders"
import type { TradeRow, TradingState } from "@/lib/demo/state"
import { translator } from "@/lib/i18n/test-messages"
import { msg, say, type Msg } from "@/lib/i18n/translator"
import { advanceClock, dataTime, mondayOf, pickOffset, rangeIndex, RANGES, realTime } from "@/lib/live/clock"
import { M15, MARKET, WEEK } from "@/lib/live/config"
import { askOf, parseOrderBody, planLiveOrder, spreadPrice, type LiveMarket } from "@/lib/live/execute"
import fixture from "@/lib/live/fixtures/eurusd-2019-03-04.json"
import { aggregate, chartAt, closesAfter, formingBar, marketStatus, type Bar } from "@/lib/live/market"
import { extremes, firstTouch, priceAt } from "@/lib/live/path"
import { replay, type ReplayResult } from "@/lib/live/replay"
import { weekPosition } from "@/lib/live/time"

// The live engine's required tests. Candles are one real EURUSD week from
// "DATA FOR LIVE" (Mon 2019-03-04 to Fri 2019-03-08, M15, H1 and H4 rows as
// exported), so aggregation, SL/TP and the market close run on real data.

const demo = translator("id", "demo")
const words = (r: object) => ("error" in r ? say(demo, (r as { error: Msg }).error) : null)

const parse = (rows: string[]): Bar[] =>
  rows.map((row) => {
    const [d, hm, o, h, l, c] = row.split(",")
    const [y, m, day] = d.split(".").map(Number)
    const [hh, mm] = hm.split(":").map(Number)
    return { t: Date.UTC(y, m - 1, day, hh, mm) / 1000, o: Number(o), h: Number(h), l: Number(l), c: Number(c) }
  })

const M15_BARS = parse(fixture.M15)
const MON = Date.UTC(2019, 2, 4) / 1000
const PAIR = "EURUSD"
const DIGITS = 5
const at = (day: number, hh: number, mm = 0, ss = 0) => MON + day * 86_400 + hh * 3600 + mm * 60 + ss
const indexAt = (t: number) => M15_BARS.findIndex((b) => b.t === t)

/** A real moment whose data time, on a clock pointed at the fixture's week, is `data`. */
function clockOn(data: number) {
  // Any real week works: weekdays line up because the offset is whole weeks.
  const realMonday = Date.UTC(2026, 9, 5) / 1000 - MARKET.UTC_OFFSET_HOURS * 3600
  const offset = (mondayOf(realMonday + MARKET.UTC_OFFSET_HOURS * 3600) - MON) / WEEK
  return { offset, real: realTime(data, offset) }
}

function buy(entry: number, sl: number | null, tp: number | null): OpenTrade {
  return { id: "t1", pair: PAIR, side: "buy", lot: 0.01, entry, sl, tp, costs: 0, margin: 11, swap: 0 }
}

function run(trade: OpenTrade, openedAt: number, from: number, now: number, bars: readonly Bar[] = M15_BARS, balance = 200): ReplayResult {
  return replay({ pair: PAIR, digits: DIGITS, position: { trade, openedAt }, balance, spread: spreadPrice(PAIR)!, bars, from, now })
}

/** Poll every `every` seconds from `openedAt` to `until`, carrying the result like the server does. */
function polled(trade: OpenTrade, openedAt: number, until: number, every: number) {
  let open: OpenTrade | null = trade
  let balance = 200
  let from = openedAt
  for (let now = openedAt + every; now <= until && open; now += every) {
    const r = run(open, openedAt, from, now, M15_BARS, balance)
    if (r.close) return r
    // The server books (and moves its last check) only when the swap changed.
    if (r.open && r.open.swap !== open.swap) from = now
    open = r.open
    balance = r.balance
  }
  return { open, close: null, stopOut: null, balance }
}

describe("time mapping", () => {
  it("keeps weekdays aligned: data time is market time minus whole weeks", () => {
    for (const random of [0, 0.13, 0.5, 0.87, 0.999]) {
      const real0 = Date.UTC(2026, 9, 11, 3) / 1000
      const off = pickOffset(real0, random)
      expect(Number.isInteger(off)).toBe(true)
      for (let real = real0; real < real0 + WEEK; real += 3600) {
        expect(weekPosition(dataTime(real, off))).toBe(weekPosition(real + MARKET.UTC_OFFSET_HOURS * 3600))
      }
    }
  })

  it("closes the market on a real weekend and opens it on a real weekday", () => {
    const { offset } = clockOn(MON)
    // Wednesday 15:07 WIB = Wednesday 10:07 on the market clock.
    const wed = Date.UTC(2026, 9, 7, 8, 7) / 1000
    expect(dataTime(wed, offset)).toBe(at(2, 10, 7))
    expect(marketStatus(M15_BARS, dataTime(wed, offset)).open).toBe(true)
    // Saturday 10:00 WIB = Saturday 05:00 on the market clock: no candle.
    const sat = Date.UTC(2026, 9, 10, 3) / 1000
    expect(weekPosition(dataTime(sat, offset))).toBe(5 * 86_400 + 5 * 3600)
    expect(marketStatus(M15_BARS, dataTime(sat, offset)).open).toBe(false)
    expect(formingBar(M15_BARS, dataTime(sat, offset))).toBeNull()
  })

  it("keeps clean ranges on Mondays and new clocks clear of the extreme-news months", () => {
    for (const r of RANGES) {
      expect(weekPosition(r.from)).toBe(0)
      expect(weekPosition(r.to)).toBe(0)
    }
    const banned = [
      [Date.UTC(2015, 0, 1), Date.UTC(2015, 1, 1)],
      [Date.UTC(2016, 5, 1), Date.UTC(2016, 6, 1)],
      [Date.UTC(2020, 1, 1), Date.UTC(2020, 4, 1)],
      [Date.UTC(2022, 1, 1), Date.UTC(2030, 0, 1)],
    ].map(([a, b]) => [a / 1000, b / 1000])
    const real = Date.UTC(2026, 9, 11, 3) / 1000
    for (let random = 0; random < 1; random += 0.01) {
      const data = dataTime(real, pickOffset(real, random))
      const i = rangeIndex(data)
      expect(i).toBeGreaterThanOrEqual(0)
      // Far enough in that the chart's history stays inside the range.
      expect(data - RANGES[i].from).toBeGreaterThanOrEqual(5 * WEEK - 7 * 86_400)
      for (const [a, b] of banned) expect(data >= a && data < b).toBe(false)
    }
  })

  it("moves to the next clean range at the weekend, and wraps after the last", () => {
    const A = RANGES[0]
    const B = RANGES[1]
    // One day before range A ends (a Sunday).
    const off = 600
    const real = realTime(A.to - 86_400, off)
    expect(advanceClock(real, off).jumps).toEqual([])
    const later = real + 2 * 86_400
    const moved = advanceClock(later, off)
    expect(moved.jumps).toHaveLength(1)
    // The jump is at A's end, a Monday 00:00 on the data clock: the weekend just ended.
    expect(weekPosition(dataTime(moved.jumps[0].real, off))).toBe(0)
    const data = dataTime(later, moved.offsetWeeks)
    expect(rangeIndex(data)).toBe(1)
    expect(data).toBeGreaterThanOrEqual(B.from + 5 * WEEK)
    expect(weekPosition(data)).toBe(weekPosition(dataTime(later, off)))

    const D = RANGES[RANGES.length - 1]
    const wrap = advanceClock(realTime(D.to + 3600, off), off)
    expect(rangeIndex(dataTime(realTime(D.to + 3600, off), wrap.offsetWeeks))).toBe(0)
  })
})

describe("M15 is the only source", () => {
  it("builds H1 and H4 that equal the exported files", () => {
    expect(aggregate(M15_BARS, 3600)).toEqual(parse(fixture.H1))
    expect(aggregate(M15_BARS, 14_400)).toEqual(parse(fixture.H4))
  })
})

describe("the forming candle's path", () => {
  it("starts at the open, stays inside the range, touches high and low, ends on the close, the same every time", () => {
    for (const bar of M15_BARS.slice(0, 120)) {
      expect(priceAt(PAIR, bar, 0, DIGITS)).toBe(bar.o)
      expect(priceAt(PAIR, bar, M15, DIGITS)).toBe(bar.c)
      const all = extremes(PAIR, bar, 0, M15 - 1, DIGITS)
      expect(all.h).toBe(bar.h)
      expect(all.l).toBe(bar.l)
      for (let s = 0; s <= M15; s += 37) {
        const p = priceAt(PAIR, bar, s, DIGITS)
        expect(p).toBeGreaterThanOrEqual(bar.l)
        expect(p).toBeLessThanOrEqual(bar.h)
        expect(priceAt(PAIR, { ...bar }, s, DIGITS)).toBe(p)
      }
    }
  })
})

describe("lazy replay", () => {
  // BUY on Monday 08:00:30. SL at the lowest low of the next two and a half
  // days: the first candle reaching it is where it must close.
  const openedAt = at(0, 8, 0, 30)
  const entryBar = M15_BARS[indexAt(at(0, 8))]
  const bid = priceAt(PAIR, entryBar, 30, DIGITS)
  const window = M15_BARS.filter((b) => b.t > openedAt && b.t < at(2, 12))
  const low = Math.min(...window.map((b) => b.l))
  const hitBar = window.find((b) => b.l <= low)!
  const trade = buy(askOf(PAIR, bid), low, 1.2)

  it("closes a stop loss hit while offline at the candle that hit it, not when the player comes back", () => {
    expect(low).toBeLessThan(bid)
    const back = at(3, 12)
    const r = run(trade, openedAt, openedAt, back)
    expect(r.close?.reason).toBe("sl")
    expect(r.close?.barT).toBe(hitBar.t)
    expect(r.close?.price).toBe(low)
    expect(r.open).toBeNull()
  })

  it("gives the same close online (checked every 10 minutes) as offline", () => {
    const offline = run(trade, openedAt, openedAt, at(3, 12))
    const online = polled(trade, openedAt, hitBar.t + M15 + 60, 600)
    expect(online.close).toEqual(offline.close)
    expect(online.balance).toBe(offline.balance)
  })

  it("counts SL first when SL and TP are both reached in the same M15 candle", () => {
    let checked = 0
    let sawTpFirst = false
    for (let k = 1; k < M15_BARS.length - 1; k++) {
      const bar = M15_BARS[k]
      const prev = M15_BARS[k - 1]
      if (prev.t + M15 !== bar.t || !(bar.l < bar.o && bar.o < bar.h)) continue
      const opened = prev.t + M15 - 1
      const entry = priceAt(PAIR, prev, M15 - 1, DIGITS)
      const tail = extremes(PAIR, prev, M15 - 1, M15, DIGITS)
      if (!(bar.l < Math.min(entry, tail.l) && Math.max(entry, tail.h) < bar.h)) continue
      const t = buy(entry, bar.l, bar.h)
      const done = run(t, opened, opened, bar.t + M15 + 1)
      expect(done.close?.reason).toBe("sl")
      expect(done.close?.barT).toBe(bar.t)
      // While forming: TP reached first on the path still doesn't close it.
      const tpAt = firstTouch(PAIR, bar, 0, M15, DIGITS, (p) => p >= bar.h)!
      const slAt = firstTouch(PAIR, bar, 0, M15, DIGITS, (p) => p <= bar.l)!
      if (tpAt < slAt) {
        sawTpFirst = true
        const mid = run(t, opened, opened, bar.t + tpAt + 1)
        expect(mid.close).toBeNull()
        expect(mid.open).not.toBeNull()
        const after = run(t, opened, opened, bar.t + slAt)
        expect(after.close?.reason).toBe("sl")
      }
      checked++
      if (checked > 20 && sawTpFirst) break
    }
    expect(checked).toBeGreaterThan(0)
    expect(sawTpFirst).toBe(true)
  })

  it("closes automatically at the last candle before the weekend, marked market_close", () => {
    const last = M15_BARS[M15_BARS.length - 1]
    // The next week opens on Monday: a gap far longer than CLOSE_GAP_SECONDS.
    const bars = [...M15_BARS, { t: at(7, 0), o: last.c, h: last.c, l: last.c, c: last.c }]
    const opened = at(4, 20, 0, 10)
    const fri = M15_BARS[indexAt(at(4, 20))]
    const t = buy(askOf(PAIR, priceAt(PAIR, fri, 10, DIGITS)), 1.0, 1.3)
    // Still open while the last candle is forming…
    expect(run(t, opened, opened, last.t + 300, bars).open).not.toBeNull()
    // …closed at its close once it has.
    const r = run(t, opened, opened, at(7, 1), bars)
    expect(r.close?.reason).toBe("market_close")
    expect(r.close?.barT).toBe(last.t)
    expect(r.close?.price).toBe(last.c)
  })

  it("doesn't close for a short gap of a few missing candles mid-week", () => {
    const gapFrom = indexAt(at(1, 10))
    const bars = M15_BARS.filter((_, i) => i < gapFrom || i >= gapFrom + 4)
    expect(closesAfter(bars, gapFrom - 1)).toBe(false)
    const opened = at(1, 9, 0, 5)
    const t = buy(askOf(PAIR, priceAt(PAIR, M15_BARS[indexAt(at(1, 9))], 5, DIGITS)), 1.0, 1.3)
    const r = run(t, opened, opened, at(1, 14), bars)
    expect(r.close).toBeNull()
    expect(r.open).not.toBeNull()
  })
})

describe("no future candles", () => {
  const marker = 9.87654
  // A candle after "now" with a price nothing else has: it must never appear.
  const withFuture = (now: number) =>
    M15_BARS.map((b) => (b.t > now + M15 ? { ...b, h: marker } : b))

  it("returns closed candles that ended by now and a forming candle only as far as now", () => {
    for (const now of [at(0, 9, 7, 13), at(2, 13, 44, 59), at(3, 23, 59), at(4, 22, 1)]) {
      for (const step of [900, 1800, 3600, 14_400]) {
        const bars = withFuture(now)
        const { closed, forming } = chartAt(PAIR, bars.filter((b) => b.t <= now), now, step, 120, DIGITS)
        expect(JSON.stringify({ closed, forming })).not.toContain(String(marker))
        expect(closed.every((b) => b.t + step <= now)).toBe(true)
        if (forming) expect(forming.t).toBeLessThanOrEqual(now)
        const live = formingBar(M15_BARS, now)
        if (live && step === M15) {
          const s = now - live.t
          expect(forming).toEqual({ t: live.t, o: live.o, ...extremes(PAIR, live, 0, s, DIGITS), c: priceAt(PAIR, live, s, DIGITS) })
        }
      }
    }
  })

  it("never shows the forming candle's real high or low before the path reaches them", () => {
    const bar = M15_BARS[indexAt(at(2, 14))]
    const early = chartAt(PAIR, M15_BARS.filter((b) => b.t <= bar.t + 10), bar.t + 10, M15, 120, DIGITS).forming!
    const full = extremes(PAIR, bar, 0, 10, DIGITS)
    expect(early.h).toBe(full.h)
    expect(early.l).toBe(full.l)
    expect(early.h < bar.h || early.l > bar.l).toBe(true)
  })
})

describe("the server sets the entry price", () => {
  const liveState = (open: TradeRow[] = []): TradingState => ({
    account: { id: "acc", number: 1, balance: 200, startingBalance: 200, version: 1, candlesPlayed: 0 },
    stage: 1,
    session: null,
    segment: null,
    segmentCandles: [],
    open,
    sessionClosed: [],
    history: [],
    slChanges: {},
    lines: [],
    tipsSeen: [],
    graduated: false,
  })
  const market: LiveMarket = { pair: PAIR, open: true, bid: 1.13, real: 1_791_000_000, rangeAvg: 0.0008 }
  const plan: OrderInput = { side: "buy", lot: 0.01, slPips: 20, tpPips: 30, reasons: ["trend-naik"] }

  it("refuses an order body that carries a price or any other extra field", () => {
    const body = { pair: PAIR, side: "buy", lot: 0.01, slPips: 20, tpPips: 30, reasons: ["trend-naik"] }
    expect(parseOrderBody(body)).toEqual({ pair: PAIR, input: plan })
    expect(parseOrderBody({ ...body, entry_price: 1.0 })).toBeNull()
    expect(parseOrderBody({ ...body, price: 1.0 })).toBeNull()
    expect(parseOrderBody({ ...body, entry: 1.0 })).toBeNull()
    expect(parseOrderBody({ ...body, time: 0 })).toBeNull()
  })

  it("fills BUY at the bid plus the fixed spread and SELL at the bid", () => {
    const spread = COSTS.SPREAD_PIPS[PAIR] * 0.0001
    const b = planLiveOrder(liveState(), plan, market)
    const s = planLiveOrder(liveState(), { ...plan, side: "sell" }, market)
    if ("error" in b || "error" in s) throw new Error(words("error" in b ? b : s) ?? "")
    expect(b.trade.entry_price).toBeCloseTo(1.13 + spread, 10)
    expect(s.trade.entry_price).toBe(1.13)
    // The spread is in the price, so it isn't charged again.
    expect(b.trade.spread).toBe(0)
    expect(b.trade.entry_index).toBe(market.real)
  })

  it("refuses when the market is closed, without SL/TP, or with a position already open", () => {
    expect(words(planLiveOrder(liveState(), plan, { ...market, open: false }))).toBe(say(demo, msg("errors.marketClosed")))
    expect(words(planLiveOrder(liveState(), { ...plan, tpPips: null }, market))).toBe(say(demo, msg("problems.needTp")))
    const row = { id: "x", pair: PAIR, status: "open" } as unknown as TradeRow
    expect(words(planLiveOrder(liveState([row]), plan, market))).toBe(say(demo, msg("errors.onePosition")))
  })
})
