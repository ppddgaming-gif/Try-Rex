// Builds the pilot assessment packages from assessment/src/P-0X.mjs:
//   assessment/packages/P-0X.json       questions only, safe to send to the browser
//   assessment/keys/P-0X.keys.json      answers, rubric, explanations, feedback (server only)
// Scenario windows, ATR, invalidation levels and suggested lots are computed
// from the "DATA FOR LIVE" CSV files; options are shuffled with a seed per
// question so the right answer doesn't sit in the same place.
//
// Usage: node assessment/scripts/build.mjs   (DATA_FOR_LIVE=<folder> to override the data path)

import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { brokerToUtc, DATA_DIR, iso, load, REPO, utcToBroker } from "./lib/data.mjs"
import { CONTEXT, contextOf, windowOf } from "./lib/features.mjs"
import { feedbackFor, scenarioNumbers } from "./lib/scenario.mjs"
import { drift, spike } from "./lib/verify.mjs"
import { CLOSE_REASONS, MECHANICS, REASONS, RUBRIC } from "../src/common.mjs"

const ROOT = join(REPO, "assessment")
export const PACKAGES = ["P-01", "P-02", "P-03", "P-04", "P-05"]

/** mulberry32: the same seed always gives the same order. */
function prng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const hash = (s) => [...s].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7)
function shuffled(list, seed) {
  const out = [...list]
  const rnd = prng(seed)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
const LETTERS = "abcdef"

/** Re-checks a scenario's claims against the data; returns the evidence for the key. */
function verifyClaims(s, mulaiUtcIso) {
  const out = []
  for (const c of s.claims ?? []) {
    if (c.type === "spike") {
      const r = spike(s.pair, c.utc, c.minutes ?? 180, c.minRatio ?? 2.5)
      out.push({ ...c, result: r, ok: r.ok })
    } else if (c.type === "drift") {
      const r = drift(s.pair, mulaiUtcIso, c.days)
      out.push({ ...c, result: r, ok: Math.sign(r.pips) === c.sign })
    }
  }
  return out
}

function buildScenario(pkg, s, order) {
  const tf = s.tf
  const startBroker = utcToBroker(Date.parse(s.start_utc + "Z") / 1000)
  const w = windowOf(s.pair, tf, startBroker, s.play)
  if (!w) throw new Error(`${pkg} ${s.id}: no candle at ${s.start_utc} UTC (${iso(startBroker)} broker) on ${s.pair} ${tf}`)
  const bars = load(s.pair, tf)
  const point = (i) => ({ index: i, time_broker: iso(bars[i].t), time_utc: iso(brokerToUtc(bars[i].t)) })
  const ctx = contextOf(s.pair, tf, w.s)
  const n = scenarioNumbers(s, ctx)
  const id = `${pkg}-${s.id}`
  const pub = {
    id,
    type: "scenario",
    order,
    title: s.title,
    pair: s.pair,
    timeframe: tf,
    balance: s.balance,
    currency: "USD",
    briefing: s.briefing,
    data_window: {
      file: `DATA FOR LIVE/${s.pair}/${s.pair}_${tf}.csv`,
      clock: "MT4 broker clock (GMT+2/+3, EU summer time); time_utc converted",
      context_candles: CONTEXT,
      play_candles: s.play,
      context_start: point(w.from),
      start: point(w.s),
      end: point(w.e),
    },
    reason_options: Object.keys(REASONS),
  }
  const key = {
    id,
    type: "scenario",
    kind: s.kind,
    event: s.event ? { name: s.event.name, utc: s.event.utc } : null,
    claims_verified: verifyClaims(s, pub.data_window.start.time_utc.replace(" ", "T")),
    context: { expected_trend: s.expect_trend, ...ctx },
    decision: {
      ideal: s.decision.ideal,
      entry: s.decision.entry ?? null,
      acceptable: s.decision.acceptable ?? [],
      valid_reasons: s.decision.valid_reasons,
    },
    numbers: n,
    feedback: feedbackFor(s, n),
  }
  // The window's candles for the app's server (context, then play), UTC seconds.
  // Server-only like the keys: the play part is the future until the player commits.
  const span = bars.slice(w.from, w.e + 1)
  const candles = {
    digits: s.pair.endsWith("JPY") ? 3 : 5,
    context: w.s - w.from,
    t: span.map((b) => brokerToUtc(b.t)),
    o: span.map((b) => b.o),
    h: span.map((b) => b.h),
    l: span.map((b) => b.l),
    c: span.map((b) => b.c),
  }
  return { pub, key, candles }
}

function buildMcq(pkg, q, order, kind) {
  const id = `${pkg}-${q.id}`
  const opts = shuffled(q.options, hash(id))
  const lettered = opts.map((o, i) => ({ ...o, letter: LETTERS[i] }))
  const pub = {
    id,
    type: kind,
    order,
    level: q.level,
    select: kind === "mcq_complex" ? "multiple" : "single",
    question: q.question,
    options: lettered.map((o) => ({ id: o.letter, text: o.text })),
  }
  const correct = lettered.filter((o) => o.correct).map((o) => o.letter)
  const key =
    kind === "mcq_complex"
      ? { id, type: kind, level: q.level, source: q.source, correct, explanations: Object.fromEntries(lettered.map((o) => [o.letter, o.why])) }
      : { id, type: kind, level: q.level, source: q.source, correct: correct[0], explanation: q.why }
  return { pub, key }
}

export async function buildPackage(pkg) {
  const src = (await import(pathToFileURL(join(ROOT, "src", `${pkg}.mjs`)).href)).default
  const items = []
  const keys = {}
  const candles = {}
  let order = 1
  for (const s of src.scenarios) {
    const built = buildScenario(pkg, s, order++)
    items.push(built.pub)
    keys[built.pub.id] = built.key
    candles[built.pub.id] = built.candles
  }
  for (const q of src.complex) {
    const { pub, key } = buildMcq(pkg, q, order++, "mcq_complex")
    items.push(pub)
    keys[pub.id] = key
  }
  for (const q of src.basic) {
    const { pub, key } = buildMcq(pkg, q, order++, "mcq_basic")
    items.push(pub)
    keys[pub.id] = key
  }
  const questions = {
    schema_version: 1,
    package_id: pkg,
    title: src.title,
    show_risk: src.show_risk,
    languages: ["id", "en"],
    review: "end_of_package",
    result: { ranking: false, report: "per_aspect_and_learn101_level" },
    mechanics: MECHANICS,
    reasons: REASONS,
    close_reasons: CLOSE_REASONS,
    items,
  }
  const answer = { schema_version: 1, package_id: pkg, confidential: true, rubric: RUBRIC, items: keys }
  return { questions, answer, candles }
}

async function main() {
  for (const dir of ["packages", "keys", "candles"]) mkdirSync(join(ROOT, dir), { recursive: true })
  console.log(`Data: ${DATA_DIR}`)
  for (const pkg of PACKAGES) {
    const { questions, answer, candles } = await buildPackage(pkg)
    writeFileSync(join(ROOT, "packages", `${pkg}.json`), JSON.stringify(questions, null, 2) + "\n")
    writeFileSync(join(ROOT, "keys", `${pkg}.keys.json`), JSON.stringify(answer, null, 2) + "\n")
    writeFileSync(join(ROOT, "candles", `${pkg}.candles.json`), JSON.stringify(candles) + "\n")
    const failed = Object.values(answer.items).flatMap((k) => (k.claims_verified ?? []).filter((c) => !c.ok))
    console.log(`${pkg}: ${questions.items.length} items, ${failed.length} failed claims`)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main()
