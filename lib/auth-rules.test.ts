import { describe, expect, it } from "vitest"
import { safeNext } from "@/lib/auth-rules"

// ?next= only ever sends a player somewhere on this site: a path that
// starts with exactly one "/".
describe("safeNext", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/trading-game?c=eurusd-1", "/trading-game?c=eurusd-1"],
    ["/pengaturan#profil", "/pengaturan#profil"],
    ["/", "/"],
  ])("keeps %s", (value, out) => {
    expect(safeNext(value)).toBe(out)
  })

  it.each([
    "//evil.example",
    "//evil.example/dashboard",
    "/\\evil.example",
    "https://evil.example",
    "http:/evil.example",
    "javascript:alert(1)",
    "dashboard",
    "",
    "/\t/evil.example",
    "/\n/evil.example",
    " /dashboard",
  ])("refuses %j and falls back", (value) => {
    expect(safeNext(value)).toBe("/dashboard")
    expect(safeNext(value, "/trading-game")).toBe("/trading-game")
  })

  it.each([null, undefined])("falls back for %s", (value) => {
    expect(safeNext(value)).toBe("/dashboard")
  })
})
