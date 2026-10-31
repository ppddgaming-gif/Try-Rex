// The forex trading sessions in WIB (UTC+7), for the Level 1 "Jam
// perdagangan dan sesi pasar" lesson and its diagram. From the session table
// in "14_ATR_Average_True_Range.pdf" (Materi Basic): approximate hours; shift
// about an hour when the countries concerned are on summer time (DST), which
// Indonesia doesn't use.

export type Session = { id: "tokyo" | "london" | "newyork"; city: string; open: number; close: number }

/** Hours in WIB, 0–24; `close` past 24 means the next day. */
export const SESSIONS: Session[] = [
  { id: "tokyo", city: "Tokyo / Asia", open: 7, close: 16 },
  { id: "london", city: "London", open: 14, close: 23 },
  { id: "newyork", city: "New York", open: 19, close: 28 },
]

/** "19.00–04.00": a session's hours in WIB, as Indonesian writes them. */
export const sessionHours = (s: Session) => {
  const h = (n: number) => `${String(n % 24).padStart(2, "0")}.00`
  return `${h(s.open)}–${h(s.close)}`
}
