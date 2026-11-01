import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { LOCALES } from "@/lib/i18n/locale"
import { translator } from "@/lib/i18n/test-messages"
import { say } from "@/lib/i18n/translator"
import {
  MAX_SEEN,
  MAX_STEPS,
  TOUR_ID_RULE,
  TOURS,
  mergeSeen,
  parseSeen,
  stepCopy,
  tourById,
  tourForPath,
  unsynced,
  type TourContext,
} from "@/lib/tours"

/** Every .ts/.tsx source under app/ and components/. */
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sources(path)
    return /\.tsx?$/.test(name) && !name.endsWith(".test.ts") ? [readFileSync(path, "utf8")] : []
  })
}
const code = [...sources("app"), ...sources("components")].join("\n")

/**
 * Where a target can be declared: a data-tour attribute (literal or inside an
 * expression on that line), the `tour` prop of Card and the settings
 * sections, or a `tour:` field in a nav or tab list that renders data-tour.
 */
function declared(id: string) {
  const quoted = `["']${id}["']`
  return new RegExp(`data-tour=\\{?[^\\n]*${quoted}|\\btour(=|:\\s*)${quoted}`).test(code)
}

const targets = [...new Set(TOURS.flatMap((t) => t.steps.flatMap((s) => s.targets)))]

describe("every tour step points at something that exists", () => {
  it.each(targets)("data-tour %s is declared in app/ or components/", (id) => {
    expect(declared(id)).toBe(true)
  })

  it("the components behind the `tour` prop and field render data-tour", () => {
    for (const file of [
      "components/card.tsx",
      "components/nav-links.tsx",
      "components/akun-latihan/demo-tabs.tsx",
      "components/settings/settings-tabs.tsx",
    ]) {
      expect(readFileSync(file, "utf8"), file).toMatch(/data-tour=\{/)
    }
    expect(readFileSync("components/nav-items.ts", "utf8")).toMatch(/tour: "nav-/)
  })
})

const contexts: TourContext[] = [
  { name: "Budi", unlock: { sessions: 1, needed: 3, open: false } },
  { name: "Budi", unlock: { sessions: 3, needed: 3, open: true } },
  { name: null, unlock: null },
]

describe("tour definitions", () => {
  it.each(TOURS.map((t) => [t.id, t] as const))("%s has 1 to MAX_STEPS steps", (_, tour) => {
    expect(tour.steps.length).toBeGreaterThan(0)
    expect(tour.steps.length).toBeLessThanOrEqual(MAX_STEPS)
  })

  it.each(LOCALES)("every title, description, finish and step has words in %s", (locale) => {
    const t = translator(locale, "tours")
    for (const tour of TOURS) {
      // next-intl returns the key path itself for a missing message.
      for (const key of [`${tour.id}.title`, `${tour.id}.description`, ...(tour.finish ? [`${tour.id}.finish`] : [])]) {
        expect(t(key), key).not.toContain(`${tour.id}.`)
      }
      for (const step of tour.steps) {
        for (const ctx of contexts) {
          const copy = stepCopy(tour, step, ctx)
          for (const m of [copy.title, copy.text]) expect(say(t, m), `${locale} ${m.key}`).not.toContain(".steps.")
        }
      }
    }
  })

  it("ids are unique and fit the format the database checks", () => {
    const ids = TOURS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(TOUR_ID_RULE)
    expect(ids.length).toBeLessThanOrEqual(MAX_SEEN)
  })

  it("the rule matches the migration's check", () => {
    const sql = readFileSync("supabase/migrations/20261101100000_guided_tours.sql", "utf8")
    expect(sql).toContain("^[a-z0-9-]{1,40}(,[a-z0-9-]{1,40})*$")
    expect(sql).toContain(`cardinality(tours_seen) <= ${MAX_SEEN}`)
    expect(TOUR_ID_RULE.source).toBe("^[a-z0-9-]{1,40}$")
  })

  it("each page tour opens on a page it runs on", () => {
    for (const tour of TOURS) {
      if (tour.page === null) {
        expect(tour.paths).toEqual([])
        continue
      }
      expect(tour.paths).toContain(tour.page.split("#")[0])
    }
  })

  it("the welcome tour ends by sending the player to the Trading Game", () => {
    expect(tourById("welcome")?.finish).toEqual({ href: "/trading-game" })
  })
})

describe("the welcome tour's copy follows the player", () => {
  const t = translator("id", "tours")
  const welcome = tourById("welcome")!
  const step = (id: string) => welcome.steps.find((s) => s.id === id)!
  const title = (id: string, ctx: TourContext) => say(t, stepCopy(welcome, step(id), ctx).title)
  const text = (id: string, ctx: TourContext) => say(t, stepCopy(welcome, step(id), ctx).text)

  it.each([
    [{ name: "Budi", unlock: null }, "Hai, Budi!"],
    [{ name: null, unlock: null }, "Hai!"],
  ] as const)("greets %o as %s", (ctx, expected) => {
    expect(title("hello", ctx)).toBe(expected)
  })
  it.each([
    [{ sessions: 1, needed: 3, open: false }, "(1/3)"],
    [{ sessions: 3, needed: 3, open: true }, "Sudah terbuka untukmu."],
  ])("Akun Demo with %o says %s", (unlock, phrase) => {
    expect(text("demo", { name: "Budi", unlock })).toContain(phrase)
  })
  it("tells a guest to sign in first", () => {
    expect(text("demo", { name: null, unlock: null })).toContain("Masuk dulu")
  })
})

describe("tourForPath", () => {
  it.each([
    ["/trading-game", "trading-game"],
    ["/dashboard", "dashboard"],
    ["/belajar", "belajar"],
    ["/belajar/candlestick", null],
    ["/akun-latihan", "akun-latihan"],
    ["/akun-latihan/trading", null],
    ["/pengaturan", "pengaturan"],
    ["/panduan", null],
    ["/ai-evaluation", null],
  ])("%s → %s", (path, id) => {
    expect(tourForPath(path)?.id ?? null).toBe(id)
  })
})

describe("seen lists", () => {
  it.each([
    [["welcome", "dashboard"], ["welcome", "dashboard"]],
    [["welcome", "welcome"], ["welcome"]],
    [["unknown-tour", "dashboard"], ["dashboard"]],
    [["ai-evaluation", "dashboard"], ["dashboard"]],
    [["Dashboard", "", 3, null], []],
    ["welcome", []],
    [null, []],
  ])("parseSeen(%j) → %j", (input, out) => {
    expect(parseSeen(input)).toEqual(out)
  })

  it("merges in first-seen order without repeats", () => {
    expect(mergeSeen(["dashboard"], ["welcome", "dashboard"])).toEqual(["dashboard", "welcome"])
  })

  it("uploads only what the account doesn't have", () => {
    expect(unsynced(["welcome", "trading-game"], ["welcome"])).toEqual(["trading-game"])
    expect(unsynced([], ["welcome"])).toEqual([])
  })
})
