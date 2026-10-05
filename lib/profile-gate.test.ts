import { describe, expect, it } from "vitest"
import { ONBOARDING_VERSION, parseRecord } from "@/lib/onboarding"
import { isGatedPath, profileComplete, profileGate } from "@/lib/profile-gate"

const incomplete = { profileDone: false }
const complete = { profileDone: true }
const unknown = { profileDone: null }

describe("profileGate", () => {
  it.each([
    ["/dashboard", "/lengkapi-profil?next=%2Fdashboard"],
    ["/trading-game?c=eurusd-1", "/lengkapi-profil?next=%2Ftrading-game%3Fc%3Deurusd-1"],
    ["/ai-evaluation", "/lengkapi-profil?next=%2Fai-evaluation"],
    ["/akun-latihan/jurnal", "/lengkapi-profil?next=%2Fakun-latihan%2Fjurnal"],
    ["/belajar/kamus", "/lengkapi-profil?next=%2Fbelajar%2Fkamus"],
    ["/pengaturan", "/lengkapi-profil?next=%2Fpengaturan"],
    ["/panduan", "/lengkapi-profil?next=%2Fpanduan"],
  ])("sends an incomplete profile from %s to %s", (path, to) => {
    expect(profileGate(incomplete, path)).toBe(to)
  })

  it.each(["/dashboard", "/trading-game", "/pengaturan"])("lets a complete profile through to %s", (path) => {
    expect(profileGate(complete, path)).toBeNull()
  })

  it("never gates a guest", () => {
    expect(profileGate(null, "/trading-game")).toBeNull()
  })

  it("holds nobody up when the flag can't be read (migration not applied)", () => {
    expect(profileGate(unknown, "/dashboard")).toBeNull()
  })

  it("falls back to the dashboard when the path is missing or unsafe", () => {
    expect(profileGate(incomplete, null)).toBe("/lengkapi-profil?next=%2Fdashboard")
    expect(profileGate(incomplete, "//evil.example")).toBe("/lengkapi-profil?next=%2Fdashboard")
  })
})

describe("isGatedPath", () => {
  it.each([
    "/",
    "/?ref=x",
    "/lengkapi-profil",
    "/lengkapi-profil?next=/dashboard",
    "/login",
    "/login?next=/dashboard",
    "/signup",
    "/lupa-password",
    "/reset-password",
    "/auth/callback?code=x",
    "/privacy",
    "/terms",
    "/disclaimer",
    "/start?ulang=1",
  ])("never gates %s", (path) => {
    expect(isGatedPath(path)).toBe(false)
  })

  it.each(["/dashboard", "/trading-game", "/ai-evaluation", "/akun-latihan", "/belajar", "/pengaturan", "/startup"])(
    "gates %s",
    (path) => {
      expect(isGatedPath(path)).toBe(true)
    },
  )
})

describe("profileComplete", () => {
  const skipped = parseRecord({ version: ONBOARDING_VERSION, answers: {}, skipped: true, completedAt: "2026-10-05T00:00:00Z" })
  const answered = parseRecord({
    version: ONBOARDING_VERSION,
    answers: { motivation: "income" },
    skipped: false,
    completedAt: "2026-10-05T00:00:00Z",
  })

  it.each([
    [{ username: "budi", onboarding: answered }, true],
    [{ username: "budi", onboarding: skipped }, true],
    [{ username: null, onboarding: answered }, false],
    [{ username: "", onboarding: answered }, false],
    [{ username: "budi", onboarding: null }, false],
  ])("%o → %s", (profile, done) => {
    expect(profileComplete(profile)).toBe(done)
  })

  it("a skipped quiz is stored as a full record, never {} (the database refuses {} on a complete profile)", () => {
    expect(skipped).not.toBeNull()
    expect(JSON.stringify(skipped)).not.toBe("{}")
    expect(skipped?.skipped).toBe(true)
  })
})
