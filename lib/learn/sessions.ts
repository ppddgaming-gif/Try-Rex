// The four forex trading sessions, in WIB (UTC+7), for the "Sesi pasar"
// lesson and its diagram. Approximate opening hours while Europe and the US
// are on summer time; in their winter London and New York open one hour
// later in WIB. DRAFT: to be checked against a cited source before the
// lesson loses its draft banner.

export type Session = { id: "sydney" | "tokyo" | "london" | "newyork"; city: string; open: number; close: number }

/** Hours in WIB, 0–24; `close` past 24 means the next day. */
export const SESSIONS: Session[] = [
  { id: "sydney", city: "Sydney", open: 4, close: 13 },
  { id: "tokyo", city: "Tokyo", open: 6, close: 15 },
  { id: "london", city: "London", open: 14, close: 23 },
  { id: "newyork", city: "New York", open: 19, close: 28 },
]

/** "19.00–04.00": a session's hours in WIB, as Indonesian writes them. */
export const sessionHours = (s: Session) => {
  const h = (n: number) => `${String(n % 24).padStart(2, "0")}.00`
  return `${h(s.open)}–${h(s.close)}`
}
