import { describe, expect, it } from "vitest"
import { consentPath, isProvider, oauthCallback, safeNext } from "@/lib/auth-rules"

describe("safeNext: only same-site paths", () => {
  it.each([
    ["/trading-game", "/trading-game"],
    ["/start?next=/dashboard", "/start?next=/dashboard"],
    ["//evil.com", "/dashboard"],
    ["/\\evil.com", "/dashboard"],
    ["https://evil.com", "/dashboard"],
    ["/\t/evil.com", "/dashboard"],
    ["", "/dashboard"],
    [null, "/dashboard"],
    [undefined, "/dashboard"],
  ])("%j", (value, want) => {
    expect(safeNext(value)).toBe(want)
  })
})

describe("isProvider", () => {
  it.each([
    ["google", true],
    ["github", true],
    ["facebook", false],
    ["", false],
    [null, false],
    [{ provider: "google" }, false],
  ])("%j", (value, want) => {
    expect(isProvider(value)).toBe(want)
  })
})

describe("the callback URL", () => {
  const origin = "https://try-rex.com"
  it.each([
    ["a path", "/trading-game", `${origin}/auth/callback?flow=oauth&next=%2Ftrading-game`],
    ["a path with its own query", "/start?next=/x", `${origin}/auth/callback?flow=oauth&next=%2Fstart%3Fnext%3D%2Fx`],
    ["no next", null, `${origin}/auth/callback?flow=oauth&next=%2Fdashboard`],
    ["another site", "//evil.com", `${origin}/auth/callback?flow=oauth&next=%2Fdashboard`],
  ])("%s", (_name, next, want) => {
    expect(oauthCallback(origin, next)).toBe(want)
  })

  it("comes back as the same next", () => {
    const url = new URL(oauthCallback(origin, "/start?next=/x"))
    expect(safeNext(url.searchParams.get("next"))).toBe("/start?next=/x")
  })
})

describe("consentPath", () => {
  it.each([
    ["/dashboard", "/persetujuan?next=%2Fdashboard"],
    ["//evil.com", "/persetujuan?next=%2Fdashboard"],
  ])("%s", (next, want) => {
    expect(consentPath(next)).toBe(want)
  })
})
