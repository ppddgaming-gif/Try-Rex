import type { Locale } from "@/lib/i18n/locale"
import { WEEK } from "@/lib/live/config"

// Time on the trading screen. The browser never receives an absolute time:
// every candle and drawing carries seconds relative to the account's "now"
// (`rel`), plus `nowWeek`, where "now" falls in its week. That is enough to
// print a weekday and an hour, and not enough to recover a date or a year
// (the data's period must not leak). The server converts both ways. Pure.

/** Seconds since Monday 00:00 of the same week (1970-01-01 was a Thursday). */
export const weekPosition = (absolute: number) => (((absolute + 3 * 86_400) % WEEK) + WEEK) % WEEK

/** The browser's form of an absolute time. */
export const toRelative = (absolute: number, now: number) => absolute - now

/** The server's form of a browser time. */
export const toAbsolute = (relative: number, now: number) => relative + now

const DAYS: Record<Locale, readonly string[]> = {
  id: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
}

/** "Sel 14:00" / "Tue 14:00": weekday and time only, never a date. */
export function dayTimeLabel(relative: number, nowWeek: number, locale: Locale) {
  const pos = (((nowWeek + relative) % WEEK) + WEEK) % WEEK
  const day = Math.floor(pos / 86_400)
  const minutes = Math.floor((pos % 86_400) / 60)
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0")
  const mm = String(minutes % 60).padStart(2, "0")
  return `${DAYS[locale][day]} ${hh}:${mm}`
}

/**
 * Fractional candle index of time `t` on a chart whose candles open at
 * `times` (ascending, one timeframe of `step` seconds). Inside the data it
 * interpolates between neighbouring candles, so a point drawn on M15 lands at
 * the same moment on H4; before the first or after the last candle it carries
 * on at one candle per `step`. Works on relative and absolute times alike.
 */
export function timeToIndex(times: readonly number[], step: number, t: number) {
  const n = times.length
  if (n === 0) return 0
  if (t <= times[0]) return (t - times[0]) / step
  if (t >= times[n - 1]) return n - 1 + (t - times[n - 1]) / step
  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (times[mid] <= t) lo = mid
    else hi = mid
  }
  // Inside a candle: its share of `step`. A weekend gap counts as the time the
  // candle covers, then the remainder of the gap squeezes onto its far edge.
  return lo + Math.min(1, (t - times[lo]) / step)
}

/** The inverse of timeToIndex, for points placed by a tap or a drag. */
export function indexToTime(times: readonly number[], step: number, index: number) {
  const n = times.length
  if (n === 0) return 0
  if (index <= 0) return times[0] + index * step
  if (index >= n - 1) return times[n - 1] + (index - (n - 1)) * step
  const i = Math.floor(index)
  return times[i] + (index - i) * step
}
