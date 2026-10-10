import { CLEAN_RANGES, LIVE, MARKET, WEEK } from "@/lib/live/config"
import { weekPosition } from "@/lib/live/time"

// The live clock: which moment of the data an account sees at a real moment.
// data time = market time − offsetWeeks × 7 days, market time = real UTC +
// MARKET.UTC_OFFSET_HOURS. Whole weeks keep weekdays aligned, so a real
// weekend is a weekend in the data and a holiday in the data is simply a
// closed market. Pure; times are unix seconds.

const MARKET_SHIFT = MARKET.UTC_OFFSET_HOURS * 3600

/** Real unix seconds → the data's clock, for an account with this offset. */
export const dataTime = (real: number, offsetWeeks: number) => real + MARKET_SHIFT - offsetWeeks * WEEK

/** The data's clock → real unix seconds. */
export const realTime = (data: number, offsetWeeks: number) => data - MARKET_SHIFT + offsetWeeks * WEEK

/** Monday 00:00 of the week `t` falls in. */
export const mondayOf = (t: number) => t - weekPosition(t)

const parseDay = (day: string) => Date.parse(`${day}T00:00:00Z`) / 1000

export type Range = { from: number; to: number }

/** CLEAN_RANGES as unix seconds, data time. */
export const RANGES: Range[] = CLEAN_RANGES.map((r) => ({ from: parseDay(r.from), to: parseDay(r.to) }))

/** Index of the range `data` falls in, or -1. */
export const rangeIndex = (data: number, ranges: Range[] = RANGES) => ranges.findIndex((r) => data >= r.from && data < r.to)

/**
 * A new clock: a random week inside the clean ranges (at least LEAD_WEEKS in
 * and MIN_RUN_WEEKS before the end), keeping the real moment's place in its
 * week. `random` is 0..1.
 */
export function pickOffset(real: number, random: number, ranges: Range[] = RANGES) {
  const weeks: number[] = []
  for (const r of ranges) {
    for (let m = r.from + LIVE.LEAD_WEEKS * WEEK; m + LIVE.MIN_RUN_WEEKS * WEEK <= r.to; m += WEEK) weeks.push(m)
  }
  if (weeks.length === 0) throw new Error("No clean range is long enough")
  const pick = weeks[Math.min(weeks.length - 1, Math.floor(Math.max(0, random) * weeks.length))]
  return (mondayOf(real + MARKET_SHIFT) - pick) / WEEK
}

/** Where a clock jumped: at `real`, from one offset to the next. */
export type Jump = { real: number; from: number; to: number }

/**
 * The offset in force at `real`, and the jumps made since. A clock that has
 * reached the end of its range (or sits outside every range) moves to the
 * next range's start + LEAD_WEEKS, same place in the week; after the last
 * range it wraps to the first. Range ends are Mondays, so a jump always falls
 * on a weekend, when no position can be open.
 */
export function advanceClock(real: number, offsetWeeks: number, ranges: Range[] = RANGES) {
  const jumps: Jump[] = []
  let offset = offsetWeeks
  for (let guard = 0; guard < 10_000; guard++) {
    const data = dataTime(real, offset)
    const i = rangeIndex(data, ranges)
    if (i >= 0) return { offsetWeeks: offset, jumps }
    // The range this clock left (the last one starting at or before it), or none yet.
    let left = -1
    for (let k = 0; k < ranges.length; k++) if (ranges[k].from <= data) left = k
    const next = ranges[(left + 1) % ranges.length]
    const end = left >= 0 && data >= ranges[left].to ? ranges[left].to : data
    const target = next.from + LIVE.LEAD_WEEKS * WEEK
    const weeks = Math.round((target - mondayOf(end)) / WEEK)
    const to = offset - weeks
    jumps.push({ real: realTime(end, offset), from: offset, to })
    offset = to
  }
  throw new Error("Live clock did not settle")
}

/** The real moment the account's current range ends: the replay never runs past it. */
export function rangeEndReal(real: number, offsetWeeks: number, ranges: Range[] = RANGES) {
  const i = rangeIndex(dataTime(real, offsetWeeks), ranges)
  return i >= 0 ? realTime(ranges[i].to, offsetWeeks) : real
}
