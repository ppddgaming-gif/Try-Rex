# Try-Rex — Build Spec

*August 2026 · companion to the plan. This is the part you can't figure out while coding.*

Ships with three files:

- `schema.sql` — runnable Postgres/Supabase schema
- `gen-seed.mjs` — generator for the development seed data
- `scenarios.seed.json` — 5 fully authored scenarios

---

## 1. What a scenario is

A scenario is **one decision, one rubric, one reveal.** It splits across two tables for a security reason (§4).

### Public half — what the browser may see

| Field | Type | Notes |
|---|---|---|
| `id` | text | `sc_0142` |
| `version` | int | Bump when the rubric changes; attempts record the version they were graded against |
| `status` | enum | `draft · in_review · published · retired` |
| `market` `symbol` `timeframe` | | `forex` / `EURUSD` / `H1` |
| `difficulty` | 1–5 | Drives XP and scenario selection |
| `context_window` | `[[o,h,l,c,ts], …]` | 26 candles — what the chart draws |
| `levels` | `[{kind, price, touches, label}]` | **Derived from the candle data, never hand-typed** (see §3) |
| `prompt` | `{text}` | The situation sentence |
| `terms` | `text[]` | Glossary slugs to make tappable in the prompt |
| `concepts` | `text[]` | `resistance`, `confirmation`, `false-breakout` — used to pick the daily challenge |

### Private half — `scenario_keys`, server only

`rubric`, `forward_window` (10 candles), `explanation`.

---

## 2. The rubric

Two parts: what each **action** is worth, and what each **reason** is worth.

```jsonc
"rubric": {
  "max_reasons": 3,

  "actions": {
    "WAIT": { "verdict": "correct",    "action_score": 100, "why": "…" },
    "SELL": { "verdict": "defensible", "action_score": 55,  "why": "…" },
    "BUY":  { "verdict": "risky",      "action_score": 30,  "why": "…" }
  },

  "reasons": [
    { "id": "r_no_confirm",
      "label": "Belum ada konfirmasi pembalikan",
      "weight": 3,                          // −3 … +3
      "valid_for": ["WAIT"],                // which actions this justifies
      "competencies": { "entry_timing": 3 },
      "feedback": "Ini alasan terkuat di skenario ini." },

    { "id": "r_gambler",
      "label": "Sudah naik banyak, pasti turun",
      "weight": -3,
      "valid_for": [],                      // justifies nothing
      "competencies": { "trend_reading": -3 },
      "feedback": "Bias penjudi…",
      "flag": "fallacy" }
  ]
}
```

**Invariants** (enforced in `gen-seed.mjs`, and worth keeping as a test):

1. Exactly one action has `verdict: "correct"`.
2. Every `valid_for` names a real action.
3. Reason ids are unique within a scenario.
4. Every level lies inside the visible price range.
5. Any action that isn't `risky` has at least one positively-weighted reason that justifies it — otherwise it's unreachable, which is a rubric bug.

That last one caught two real mistakes while writing the seed data.

### Reason design

Every scenario carries **6–7 reasons**: 3–4 that genuinely justify something, and 2–3 that are the specific wrong thinking this scenario is built to catch. The wrong ones are the point. `r_gambler` ("it's gone up a lot, it must come down"), `r_bored` ("I haven't had a position in a while"), `r_gap_fill` ("spikes always get filled") — these are the beliefs that empty accounts, and a rubric that names them is doing more teaching than any lesson page.

Reasons are **shuffled per-attempt** so position carries no signal.

---

## 3. Grading

Runs server-side, in a Route Handler with the service-role key. Deterministic — the same decision always produces the same score.

```ts
const rule = rubric.actions[action];
const actionScore = rule.action_score;                       // 0–100

const picked   = rubric.reasons.filter(r => reasonIds.includes(r.id));
const points   = sum(picked.map(r => r.weight));             // may be negative

// Best case: the three highest positive weights that justify THIS action.
const best     = rubric.reasons
                   .filter(r => r.weight > 0 && r.valid_for.includes(action))
                   .map(r => r.weight).sort(desc).slice(0, 3);
const ceiling  = Math.max(sum(best), 3);   // floor of 3 — see note below

let reasonScore = clamp(0, 100, 50 + (points / ceiling) * 50);

let processScore = Math.round(0.4 * actionScore + 0.6 * reasonScore);

// A named fallacy caps the score no matter how right the action was.
if (picked.some(r => r.flag === 'fallacy')) processScore = Math.min(processScore, 60);
```

**Why 40/60.** Reasoning outweighs the action deliberately. The whole thesis is that a right answer for the wrong reason should not score well — invert this and you're back to grading outcomes.

**Why the ceiling floor of 3.** A `risky` action can have *no* positively-weighted reasons — that's intentional, it can't be justified. Without the floor, `ceiling` is 0 and you divide by zero. With it, a user who picks BUY in a range-bound scenario still gets a sane score driven by penalties.

**The outcome never enters the score.** `forward_window` is shown after grading, labelled as one sample. Sometimes the right decision loses; showing that is the most valuable thing on the site.

### XP

```
xpMax = { 1: 20, 2: 30, 3: 40, 4: 50, 5: 60 }[difficulty]
xp    = Math.round(processScore / 100 * xpMax)
```

### Competency update

For each competency the attempt touched:

```
observed = clamp(0, 100, processScore + 5 × Σ(competency deltas from picked reasons))
new      = old + 0.15 × (observed − old)          // EWMA
```

Untouched competencies don't move. `apply_competency()` in `schema.sql` does this and writes the daily history row in the same call.

**Seed everyone at 50, not 0.** A new user seeing four zeroes reads it as failure before they've done anything.

---

## 4. The security constraint that shapes the architecture

**The rubric and the forward window are the answer key.** If either reaches the browser before submission, the game is over — anyone can open the network tab.

Three consequences, all already in `schema.sql`:

1. They live in `scenario_keys`, which has **RLS enabled and zero policies** — that denies everything to `anon` and `authenticated`. Only the service role reads it.
2. `attempts`, `competency_scores`, `competency_history` and `streaks` have **no client insert policy**. A client that could write its own attempt row could award itself any score.
3. Grading is a Route Handler, not a client call. Request: `{scenarioId, action, reasonIds, seconds}`. Response: score, verdict, per-reason feedback, the four competency values, **and only then** the forward window.

Everything else — reading published scenarios, the glossary, your own history — goes direct to Supabase from the client, which is what makes the rest of the app fast to build.

---

## 5. Scenario pipeline

Hand-authoring 20 scenarios is an afternoon. Two hundred is a job. The pipeline:

1. **Fetch** historical OHLC for the symbols in scope.
2. **Slice** candidate 36-candle windows programmatically — filter for interesting structure (level tests, failed breakouts, range chop, post-news volatility). Most windows are boring; the filter is what makes this tractable.
3. **Derive levels from the data**, never by hand. Support = the low of the pullback region; resistance = the high of the visible window. Hand-typed levels drift out of the visible range — this was a real bug in the first seed pass, caught by invariant 4.
4. **Draft** the prompt, rubric and explanation. An LLM can propose; it cannot approve.
5. **Human review, every one.** A wrong rubric teaches something wrong. `schema.sql` enforces this: a scenario cannot reach `published` without `reviewed_by` and `reviewed_at` set.

**Volume:** ~200 to launch. At 20 per session, anything less and a returning user sees repeats inside a week.

**Difficulty ladder:** level 1–2 unambiguous (clean trend, obvious level, one right answer). Level 4–5 genuinely uncertain, where `WAIT` is often correct and the lesson is that no-trade is a trade. `sc_0004` in the seed file is the template for this.

### About the seed data

`scenarios.seed.json` holds 5 scenarios covering BUY / WAIT / SELL / no-trade / volatility-trap, difficulty 1→4. **The candles are synthetic**, produced by a seeded generator so runs are reproducible; they exist so you can build the loop before the data pipeline is real. The rubrics, prompts, reasons and explanations are the actual work and carry over unchanged. Regenerate with `node gen-seed.mjs`.

(The mockup screens use their own illustrative price data — they aren't reading this file.)

---

## 6. The AI layer — phase 3, and smaller than it sounds

**The rubric decides the score. The LLM only writes the prose.**

Input: the prompt text, the action, the picked reasons with their `feedback` strings, the rubric's `why` for that action, the outcome summary, and the already-computed score. Output: 3 bullets and one "next time" line. The system prompt says, in as many words: *you are given the score; do not compute or contradict it.*

Cache key: `sha256(scenario_id | version | action | sorted(reason_ids) | locale)`. Identical decisions produce identical prose at zero marginal cost, and two users who did the same thing see the same feedback — which matters more than it sounds when they compare notes.

**Build phase 1 without this.** Concatenating the `feedback` strings from the rubric already produces decent feedback. The LLM makes it read better; it isn't what makes the product work.

---

## 7. Build backlog

Dependency-ordered. Sizes are rough half-days (S ≈ ½ day, M ≈ 1–2 days, L ≈ 3+).

### Phase 0 — foundation

| # | Ticket | Size | Blocks |
|---|---|---|---|
| 0.1 | `create-next-app` (App Router, TS), Tailwind, ESLint, deploy to Vercel on the real domain | S | all |
| 0.2 | Design tokens as CSS variables + Tailwind theme; fonts (Bricolage Grotesque, Plus Jakarta Sans, JetBrains Mono) | S | 0.3 |
| 0.3 | Primitives: `Button` (with the 4px pressed edge), `Card`, `Chip`, `CompetencyMeter`, `ScoreRing`, `Mascot` (4 expressions) | M | most UI |
| 0.4 | `next-intl`, `/id` default + `/en` scaffold, all copy through the message catalogue from day one | S | all copy |
| 0.5 | App shell: nav, footer, risk disclaimer, `/disclaimer` `/privacy` `/terms` | S | — |
| 0.6 | Landing page | M | — |

### Phase 1 — the loop

| # | Ticket | Size | Depends on |
|---|---|---|---|
| 1.1 | Run `schema.sql` on Supabase; typed client; generate DB types | S | 0.1 |
| 1.2 | Scenario JSON validator (the five invariants) + `seed.ts` importer, splitting public/private halves | M | 1.1 |
| 1.3 | `CandleChart` — renders `context_window`, **overlays positioned from the same price-to-pixel scale as the candles** | M | 0.3 |
| 1.4 | `grade()` as a pure function + unit tests. Test the edge cases: zero ceiling, fallacy cap, all-negative reasons, single reason | M | 1.2 |
| 1.5 | `POST /api/attempt` — service-role route: grade, persist attempt, `apply_competency`, `touch_streak`, return result + reveal | M | 1.4 |
| 1.6 | Game screen: chart → action → reasons → submit → inline verdict → reveal animation on the chart | L | 1.3, 1.5 |
| 1.7 | Evaluation screen: full breakdown, four competencies, the "what happened next" panel with its honest caveat | M | 1.6 |
| 1.8 | Session runner: 20 scenarios, progress, resume after a refresh | M | 1.6 |
| 1.9 | Session summary: deltas, weakest competency, per-question strip | M | 1.8 |
| 1.10 | Author + review 50 scenarios | L | 1.2 |
| 1.11 | Glossary: 50 terms, list, detail sheet, tappable terms inside prompts | M | 1.1 |
| 1.12 | `/start` onboarding quiz → track + difficulty, `localStorage` pre-account | M | 0.3 |

### Phase 2 — accounts

| # | Ticket | Size |
|---|---|---|
| 2.1 | Supabase auth (email + Google), `profiles` row on signup | M |
| 2.2 | Migrate `localStorage` progress into the account on first login | S |
| 2.3 | Dashboard reading real data | L |
| 2.4 | Daily challenge: 5 scenarios picked from the weakest competency's concepts | M |
| 2.5 | Journal note per attempt, surfaced again on similar scenarios | M |

**Phase 1 ends with a working product and no AI in it.** That's the milestone worth protecting.

### Tests worth writing early

Only two areas justify tests before launch, and they're both cheap:

- **`grade()`** — pure function, no I/O, and it's the thing users would notice being wrong. Table-driven test per seed scenario × 3 actions × several reason sets.
- **Scenario validation** — run the five invariants in CI over every scenario file. This is what stops a bad rubric reaching `published`.

Skip UI tests for now.

---

## 8. Name and domain

I searched for collisions. What I found, and what I couldn't check:

**No trading product called Try-Rex or TryRex.** The name looks clear in the category.

**One thing to look at before you print anything: [Taurex](https://apps.apple.com/us/app/taurex-mobile-trading-broker/id6475347049).** It's a live retail forex broker with a mobile app — same category, same audience, and phonetically close to "Try-Rex" once spoken aloud. That's a brand-confusion risk and a possible trademark obstacle in the financial-services class. It doesn't make the name unusable, but it's worth 20 minutes with someone who can search the trademark register (DJKI in Indonesia) before you commit to signage, an app-store listing, or paid acquisition.

**`TRYX` is a crypto token ticker.** Minor, but it means shortening to "tryx" anywhere will surface crypto-price pages in search.

**Pronunciation.** An Indonesian reader may well say *"tri-reks"* rather than *"trai-reks"* — which lands on "T-Rex" and is arguably the better outcome, since the mascot carries it either way. Worth checking with ten people in your audience rather than assuming; if it splits, the wordmark can settle it.

**Hyphen.** Your mock uses `TRY-REX` in the wordmark and `tryrex` in the URL. Pick one and use it everywhere in text — inconsistent spelling of your own name costs you search traffic. My suggestion: `TRY-REX` as the wordmark only, `tryrex` everywhere it's typed.

**Domains — I can't check availability from here**, so this is a list for you to run through a registrar rather than an answer:

- `tryrex.id` — for an Indonesia-first product, `.id` reads as local and credible, and short names are more likely to be free
- `tryrex.com` — worth checking even if only defensively
- `tryrex.co.id` — requires an Indonesian business entity, which is a signal of legitimacy in this category
- `tryrex.app` — fine fallback, reads as a product

Grab the matching handles at the same time. If `tryrex.id` is available, that would be my pick.

---

## 9. Still open

Monetization is the one that changes the build — it determines whether Phase 2 needs a paywall, entitlement checks, and a payment provider, or none of that. Worth deciding before you start Phase 2, not before Phase 1.
