import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import pkg from "@/assessment/packages/P-01.json"

describe("the assessment keys and future candles stay on the server", () => {
  // Files under components/ and every "use client" module must never import
  // the keys, the candles, or the modules that read them.
  const files: string[] = []
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.tsx?$/.test(name) && !name.endsWith(".test.ts")) files.push(p)
    }
  }
  ;["components", "lib", "app"].forEach(walk)

  it("no client module imports them", () => {
    const offenders = files.filter((f) => {
      const src = readFileSync(f, "utf8")
      const client = src.startsWith('"use client"') || f.startsWith("components")
      return client && /assessment\/(keys|candles)\/|lib\/assessment\/(data|token|runs|skill-results)/.test(src)
    })
    expect(offenders).toEqual([])
  })

  it("the question files carry no answer fields", () => {
    const text = JSON.stringify(pkg)
    for (const field of ['"correct"', '"explanations"', '"explanation"', '"ideal"', '"valid_reasons"', '"feedback"', '"numbers"']) expect(text).not.toContain(field)
  })
})
