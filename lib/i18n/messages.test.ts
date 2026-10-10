import { readdirSync } from "node:fs"
import { join } from "node:path"
import { parse, TYPE, type MessageFormatElement } from "@formatjs/icu-messageformat-parser"
import { describe, expect, it } from "vitest"
import { LOCALES, NAMESPACES } from "@/lib/i18n/locale"
import { loadCatalogue, type Catalogue } from "@/lib/i18n/test-messages"

// The id and en catalogues must have exactly the same keys, the same
// placeholders and rich-text tags in every message, valid ICU syntax, and no
// empty strings. A missing English key would show the raw key on screen; a
// missing placeholder would drop a number.

function flatten(obj: Catalogue, prefix = ""): Map<string, string> {
  const out = new Map<string, string>()
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === "object") for (const [kk, vv] of flatten(v as Catalogue, key)) out.set(kk, vv)
    else out.set(key, String(v))
  }
  return out
}

/** Every argument and tag name in a message, branches included: "arg:count", "tag:b". */
function names(elements: MessageFormatElement[], out = new Set<string>()) {
  for (const el of elements) {
    if (el.type === TYPE.literal || el.type === TYPE.pound) continue
    if (el.type === TYPE.tag) {
      out.add(`tag:${el.value}`)
      names(el.children, out)
      continue
    }
    out.add(`arg:${el.value}`)
    if (el.type === TYPE.plural || el.type === TYPE.select) {
      for (const option of Object.values(el.options)) names(option.value, out)
    }
  }
  return out
}

const signature = (message: string) => [...names(parse(message))].sort().join(" ")

const catalogues = Object.fromEntries(LOCALES.map((l) => [l, flatten(loadCatalogue(l))]))
const [base, ...others] = LOCALES

describe("message catalogues", () => {
  it("has one file per namespace in every locale, and nothing else", () => {
    for (const locale of LOCALES) {
      const files = readdirSync(join(process.cwd(), "messages", locale)).filter((f) => f.endsWith(".json"))
      expect(files.map((f) => f.replace(/\.json$/, "")).sort()).toEqual([...NAMESPACES].sort())
    }
  })

  it("parses every message as ICU", () => {
    const broken: string[] = []
    for (const locale of LOCALES) {
      for (const [key, value] of catalogues[locale]) {
        try {
          parse(value)
        } catch {
          broken.push(`${locale}:${key}`)
        }
      }
    }
    expect(broken).toEqual([])
  })

  for (const locale of others) {
    it(`${locale} has exactly the keys of ${base}`, () => {
      const onlyHere = [...catalogues[locale].keys()].filter((k) => !catalogues[base].has(k))
      const missing = [...catalogues[base].keys()].filter((k) => !catalogues[locale].has(k))
      expect(onlyHere, `keys only in ${locale}`).toEqual([])
      expect(missing, `keys missing from ${locale}`).toEqual([])
    })

    it(`${locale} keeps every placeholder and tag of ${base}`, () => {
      const mismatched: string[] = []
      for (const [key, value] of catalogues[base]) {
        const other = catalogues[locale].get(key)
        if (other === undefined) continue
        try {
          if (signature(value) !== signature(other)) mismatched.push(key)
        } catch {
          // Reported by the ICU test.
        }
      }
      expect(mismatched).toEqual([])
    })
  }

  it("has no empty messages", () => {
    for (const locale of LOCALES) {
      const empty = [...catalogues[locale]].filter(([, v]) => v.trim() === "").map(([k]) => k)
      expect(empty, locale).toEqual([])
    }
  })
})
