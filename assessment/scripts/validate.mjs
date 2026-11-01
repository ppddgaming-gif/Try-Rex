// Validates the built pilot packages (assessment/packages, assessment/keys)
// against the brief and the "DATA FOR LIVE" CSV files. Exits 1 on any
// failure; warnings are printed for the report but don't fail the run.
//
// Usage: node assessment/scripts/validate.mjs

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { ALLOWED_PAIRS, brokerToUtc, closesBetween, DATA_END_UTC, FORBIDDEN_PAIRS, iso, load, REPO, TF_SECONDS } from "./lib/data.mjs"
import { contextOf } from "./lib/features.mjs"
import { drift, spike } from "./lib/verify.mjs"
import { REASONS } from "../src/common.mjs"

const ROOT = join(REPO, "assessment")
const PACKAGES = ["P-01", "P-02", "P-03", "P-04", "P-05"]
const COUNTS = { scenario: 10, mcq_complex: 10, mcq_basic: 15 }
const LEVELS = { mcq_complex: { 3: 3, 4: 2, 5: 3, 6: 2 }, mcq_basic: { 1: 3, 2: 3, 3: 3, 4: 2, 5: 2, 6: 2 } }
/** Field names that only belong in key files. */
const KEY_FIELDS = ["correct", "explanation", "explanations", "why", "feedback", "rubric", "valid_reasons", "ideal", "acceptable", "numbers", "claims_verified", "invalidation_level", "pending_zone", "decision", "context"]

const failures = []
const warnings = []
const fail = (msg) => failures.push(msg)
const warn = (msg) => warnings.push(msg)
const read = (p) => JSON.parse(readFileSync(p, "utf8"))

// --- Learn 101 lessons, for the MCQ source check -------------------------
const lessons = new Map()
for (const f of readdirSync(join(REPO, "lib/learn/lessons")).filter((f) => /^l\d.*\.ts$/.test(f))) {
  const s = readFileSync(join(REPO, "lib/learn/lessons", f), "utf8")
  for (const m of s.matchAll(/slug: "([^"]+)",\s*level: (\d)/g)) lessons.set(m[1], Number(m[2]))
}
if (lessons.size < 30) fail(`Learn 101 lessons not found (got ${lessons.size})`)

// --- Bilingual text ------------------------------------------------------
/** Every object with an "en" key must be exactly { id, en }, both non-empty strings. */
function checkTexts(node, path) {
  if (Array.isArray(node)) return node.forEach((x, i) => checkTexts(x, `${path}[${i}]`))
  if (!node || typeof node !== "object") return
  const keys = Object.keys(node)
  if ("en" in node || (keys.length === 1 && keys[0] === "id")) {
    const ok = keys.length === 2 && typeof node.id === "string" && typeof node.en === "string" && node.id.trim() && node.en.trim()
    if (!ok) fail(`${path}: text must be exactly { id, en } and non-empty`)
    else {
      // The numbers in both languages should match (id writes 1.000,5 where en writes 1,000.5).
      // Indonesian writes clock times as 18.00 where English writes 18:00 (its thousands always have three digits).
      const nums = (s, lang) =>
        ((lang === "id" ? s.replace(/\b(\d{1,2})\.(\d{2})\b(?!\d)/g, "$1:$2") : s).match(/\d[\d.,]*/g) ?? [])
          .map((x) => (lang === "id" ? x.replace(/\.(?=\d{3}\b)/g, "").replace(",", ".") : x.replace(/,(?=\d{3}\b)/g, "")))
          .map((x) => x.replace(/[.,]$/, ""))
          .sort()
          .join(" ")
      if (nums(node.id, "id") !== nums(node.en, "en")) warn(`${path}: numbers differ between id and en (${nums(node.id, "id")} | ${nums(node.en, "en")})`)
    }
    return
  }
  for (const k of keys) checkTexts(node[k], `${path}.${k}`)
}

/** Field names that must never reach the browser. */
function checkNoKeys(node, path) {
  if (Array.isArray(node)) return node.forEach((x, i) => checkNoKeys(x, `${path}[${i}]`))
  if (!node || typeof node !== "object" || ("en" in node && "id" in node && Object.keys(node).length === 2)) return
  for (const [k, v] of Object.entries(node)) {
    if (KEY_FIELDS.includes(k)) fail(`${path}.${k}: answer field in a question file`)
    checkNoKeys(v, `${path}.${k}`)
  }
}

// --- Near-duplicate questions ---------------------------------------------
// Function words in either language say nothing about what a question asks.
const STOPWORDS = new Set(
  "yang dan atau di ke dari untuk dengan pada saat ini itu adalah akan bisa sudah tidak mana saja sesuai materi menurut benar kamu mu pernyataan dalam lebih the and for with that this which are what does match lesson true your you its".split(" "),
)
const words = (s) =>
  new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9à-ÿ ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
  )
function jaccard(a, b) {
  let inter = 0
  for (const w of a) if (b.has(w)) inter++
  return inter / (a.size + b.size - inter || 1)
}

// --- Main ----------------------------------------------------------------
const allMcq = []
const allWindows = []
const allEvents = []

for (const pkg of PACKAGES) {
  const qPath = join(ROOT, "packages", `${pkg}.json`)
  const kPath = join(ROOT, "keys", `${pkg}.keys.json`)
  if (!existsSync(qPath) || !existsSync(kPath)) {
    fail(`${pkg}: missing ${existsSync(qPath) ? "keys" : "questions"} file (run build.mjs)`)
    continue
  }
  const q = read(qPath)
  const k = read(kPath)
  if (q.package_id !== pkg || k.package_id !== pkg) fail(`${pkg}: package_id mismatch`)
  if (typeof q.show_risk !== "boolean") fail(`${pkg}: show_risk must be a boolean`)
  else if (q.show_risk !== true) fail(`${pkg}: show_risk must be true for P-01..P-05`)
  if (JSON.stringify(Object.keys(q.reasons ?? {})) !== JSON.stringify(Object.keys(REASONS))) fail(`${pkg}: reason list differs from src/common.mjs`)
  checkTexts(q, pkg)
  checkTexts(k, `${pkg}.keys`)
  checkNoKeys(q, pkg)

  // Counts and levels
  const byType = {}
  for (const it of q.items) (byType[it.type] ??= []).push(it)
  for (const [type, n] of Object.entries(COUNTS)) if ((byType[type]?.length ?? 0) !== n) fail(`${pkg}: ${byType[type]?.length ?? 0} ${type}, expected ${n}`)
  if (q.items.length !== 35) fail(`${pkg}: ${q.items.length} items, expected 35`)
  for (const type of ["mcq_complex", "mcq_basic"]) {
    const got = {}
    for (const it of byType[type] ?? []) got[it.level] = (got[it.level] ?? 0) + 1
    if (JSON.stringify(got) !== JSON.stringify(LEVELS[type])) fail(`${pkg}: ${type} levels ${JSON.stringify(got)}, expected ${JSON.stringify(LEVELS[type])}`)
  }
  const ids = new Set(q.items.map((i) => i.id))
  if (ids.size !== q.items.length) fail(`${pkg}: duplicate item ids`)
  for (const id of ids) if (!k.items[id]) fail(`${pkg}: no key for ${id}`)
  for (const id of Object.keys(k.items)) if (!ids.has(id)) fail(`${pkg}: key without a question: ${id}`)

  // MCQs
  const basicPositions = []
  for (const it of [...(byType.mcq_complex ?? []), ...(byType.mcq_basic ?? [])]) {
    const key = k.items[it.id]
    const letters = it.options.map((o) => o.id)
    if (lessons.get(key.source) !== it.level) fail(`${it.id}: source "${key.source}" is not a Level ${it.level} Learn 101 lesson`)
    if (it.type === "mcq_basic") {
      if (it.options.length !== 4) fail(`${it.id}: basic MCQ needs 4 options`)
      if (!letters.includes(key.correct)) fail(`${it.id}: correct answer is not an option`)
      if (!key.explanation) fail(`${it.id}: missing explanation`)
      basicPositions.push(key.correct)
    } else {
      if (it.options.length < 4 || it.options.length > 6) fail(`${it.id}: complex MCQ needs 4–6 options`)
      if (!Array.isArray(key.correct) || key.correct.length < 2 || key.correct.length >= it.options.length) fail(`${it.id}: complex MCQ needs 2+ right options and at least one wrong`)
      for (const l of letters) if (!key.explanations?.[l]) fail(`${it.id}: no explanation for option ${l}`)
    }
    allMcq.push({ id: it.id, pkg, text: it.question.id + " " + it.options.map((o) => o.text.id).join(" "), q: it.question.id })
  }
  const distinct = new Set(basicPositions)
  if (distinct.size < 3) fail(`${pkg}: right answers of basic MCQs use only ${distinct.size} positions`)

  // Scenarios
  const scen = byType.scenario ?? []
  let events = 0
  let noTrade = 0
  const entries = new Set()
  const balances = new Set()
  for (const it of scen) {
    const key = k.items[it.id]
    balances.add(it.balance)
    if (key.kind === "event") {
      events++
      allEvents.push({ pkg, id: it.id, name: key.event?.name?.en, utc: key.event?.utc })
    }
    if (key.decision.ideal === "no_trade") noTrade++
    else entries.add(key.decision.entry)
    for (const r of key.decision.valid_reasons) if (!(r in REASONS)) fail(`${it.id}: unknown reason "${r}"`)
    if (!ALLOWED_PAIRS.includes(it.pair) || FORBIDDEN_PAIRS.includes(it.pair)) fail(`${it.id}: pair ${it.pair} is not allowed`)
    if (!(it.timeframe in TF_SECONDS)) fail(`${it.id}: unknown timeframe ${it.timeframe}`)

    // The window, against the CSV itself.
    const bars = load(it.pair, it.timeframe)
    const w = it.data_window
    for (const p of ["context_start", "start", "end"]) {
      const b = bars[w[p].index]
      if (!b || iso(b.t) !== w[p].time_broker) fail(`${it.id}: ${p} index ${w[p].index} is not ${w[p].time_broker} in ${w.file}`)
      else if (iso(brokerToUtc(b.t)) !== w[p].time_utc) fail(`${it.id}: ${p} UTC time doesn't match the broker time`)
    }
    if (w.start.index - w.context_start.index !== 100) fail(`${it.id}: context must be 100 candles`)
    const play = w.end.index - w.start.index + 1
    if (play < 100 || play > 200 || play !== w.play_candles) fail(`${it.id}: ${play} candles after Start, expected 100–200 (${w.play_candles} declared)`)
    const closes = closesBetween(bars, w.start.index, w.end.index)
    if (closes.length) fail(`${it.id}: the trading part crosses a market close after ${iso(bars[closes[0]].t)} (Friday night or a holiday)`)
    if (brokerToUtc(bars[w.end.index].t) > DATA_END_UTC) fail(`${it.id}: window runs past March 2022`)
    allWindows.push({ id: it.id, pair: it.pair, from: brokerToUtc(bars[w.context_start.index].t), to: brokerToUtc(bars[w.end.index].t) })

    // The stated condition and the rubric numbers.
    const ctx = contextOf(it.pair, it.timeframe, w.start.index)
    if (ctx.trend !== key.context.expected_trend) fail(`${it.id}: chart before Start is "${ctx.trend}", the scenario says "${key.context.expected_trend}"`)
    if (key.decision.ideal === "buy" && ctx.trend !== "up") fail(`${it.id}: a buy is expected but the context isn't an uptrend`)
    if (key.decision.ideal === "sell" && ctx.trend !== "down") fail(`${it.id}: a sell is expected but the context isn't a downtrend`)
    if (key.decision.ideal !== "no_trade") {
      const r = key.numbers.expected_sl_atr
      if (key.numbers.structure_sl_pips === null) warn(`${it.id}: no structure level found; the SL rubric falls back to ATR`)
      if (r < 1 || r > 3) fail(`${it.id}: expected SL is ${r}× ATR, outside 1–3× ATR`)
      if (key.decision.entry === "pending" && !key.numbers.pending_zone) fail(`${it.id}: pending entry without a pending zone`)
    }

    // Every claim in the briefing, re-checked against the candles.
    const startIso = w.start.time_utc.replace(" ", "T")
    const claims = key.claims_verified ?? []
    for (const c of claims) {
      if (c.type === "spike") {
        const r = spike(it.pair, c.utc, c.minutes ?? 180, c.minRatio ?? 2.5)
        if (!r.ok) fail(`${it.id}: event at ${c.utc} not visible in ${it.pair} (×${r.ratio})`)
      } else if (c.type === "drift") {
        const r = drift(it.pair, startIso, c.days)
        if (Math.sign(r.pips) !== c.sign) fail(`${it.id}: briefing says ${c.sign > 0 ? "up" : "down"} over ${c.days} days, data says ${r.pips} pips`)
      }
    }
    if (key.kind === "event" && !claims.some((c) => c.type === "spike" && c.utc === key.event.utc)) fail(`${it.id}: event without a verified spike`)

    // Unmentioned big moves inside the trading part of normal scenarios, for the report.
    if (key.kind === "normal") {
      const from = bars[w.start.index].t
      const to = bars[w.end.index].t + TF_SECONDS[it.timeframe]
      let worst = { ratio: 0, at: "" }
      for (let s = from; s + 7200 <= to; s += 3600) {
        const u = iso(brokerToUtc(s)).replace(" ", "T")
        const r = spike(it.pair, u, 105, 99)
        if (r.ratio > worst.ratio) worst = { ratio: r.ratio, at: u }
      }
      if (worst.ratio >= 4 && !claims.some((c) => c.type === "spike")) warn(`${it.id}: unmentioned move ×${worst.ratio} at ${worst.at} UTC inside the trading part`)
    }
  }
  if (events < 3) fail(`${pkg}: ${events} event scenarios, need at least 3`)
  if (noTrade < 2) fail(`${pkg}: ${noTrade} NO TRADE scenarios, need at least 2`)
  if (!entries.has("market") || !entries.has("pending")) fail(`${pkg}: needs both market and pending entries (has ${[...entries].join(", ")})`)
  if (balances.size < 8) fail(`${pkg}: balances barely vary (${balances.size} distinct)`)
  console.log(`${pkg}: ${q.items.length} items · ${scen.length} scenarios (${events} events, ${noTrade} NO TRADE, entries ${[...entries].join("/")}) · balances $${Math.min(...balances)}–$${Math.max(...balances)}`)
}

// Across packages: no repeated event, no overlapping window on the same pair, no near-duplicate question.
const seen = new Map()
for (const e of allEvents) {
  const key = `${e.name}|${e.utc}`
  if (seen.has(key)) fail(`event repeated: ${e.name} (${seen.get(key)} and ${e.id})`)
  seen.set(key, e.id)
}
for (let i = 0; i < allWindows.length; i++)
  for (let j = i + 1; j < allWindows.length; j++) {
    const a = allWindows[i]
    const b = allWindows[j]
    if (a.pair === b.pair && a.from <= b.to && b.from <= a.to) fail(`windows overlap on ${a.pair}: ${a.id} and ${b.id}`)
  }
const sets = allMcq.map((m) => ({ ...m, w: words(m.text), qw: words(m.q) }))
for (let i = 0; i < sets.length; i++)
  for (let j = i + 1; j < sets.length; j++) {
    const a = sets[i]
    const b = sets[j]
    if (a.q.trim().toLowerCase() === b.q.trim().toLowerCase()) fail(`same question: ${a.id} and ${b.id}`)
    const sim = Math.max(jaccard(a.w, b.w), jaccard(a.qw, b.qw))
    if (sim >= 0.6) fail(`near-duplicate questions (${sim.toFixed(2)}): ${a.id} and ${b.id}`)
    else if (sim >= 0.45) warn(`similar questions (${sim.toFixed(2)}): ${a.id} and ${b.id}`)
  }

for (const w of warnings) console.log("WARN", w)
for (const f of failures) console.log("FAIL", f)
console.log(failures.length ? `\n${failures.length} failure(s), ${warnings.length} warning(s).` : `\nAll checks passed. ${warnings.length} warning(s).`)
process.exit(failures.length ? 1 : 0)
