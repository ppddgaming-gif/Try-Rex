# Try-Rex redesign: design

*2026-11-03. Branch `feat/redesign`, cut from `origin/main` at 8147364.*

Sources, in order of authority when they disagree:

1. `CLAUDE.md` (the non-negotiables and the area guides)
2. This document
3. [`docs/motion-spec.md`](../../motion-spec.md) (how things move, per screen)
4. The design canvas "Try-Rex Landing Redesign": https://claude.ai/artifact/H5FnxhxKQPfCteEGWrxAg5 (boards: `Main`, `Mobile`, `Sidebar`, `Dashboard`, `Belajar`, `Game`, `Summary`, `AkunDemo`). Read them with the Artifact tool's `read` action and `path: "project/<Board>.dc.html"`.

## Intent

The owner wants the whole product to look and move like the canvas and the motion spec, while **working exactly as it does today**. This is a change of look, not of behaviour: same features, same pages, same questions, same scoring, same data. Nothing a player can do today may disappear.

The canvas was drawn before Asesmen, the guided tours, the AI Evaluation journal changes, the real skill meters and social login shipped. Where it is missing something the product has, the product wins and the thing gets restyled. Where it shows something the product lacks, the thing does not get built, unless this document says so.

## Goals

- Every one of the 29 pages uses the new visual language in both themes, at phone width and at desktop width.
- The motion in `docs/motion-spec.md` §2–6 exists, adapted as listed below.
- Belajar's hub becomes the level path.
- The landing page gets the playable hero with the decision line.

## Non-goals

- **The "Kenapa?" reasons step and process scoring in the Trading Game.** The owner decided this is a separate project afterwards. Today's BUY/SELL/WAIT flow and `scoreFor()` stay. Also out, because they depend on it: "Bias penjudi" flags, "Satu hal untuk dilatih", and reason lists on the result panel.
- Moving Trading Game grading to the server (already a separate ticket; see CLAUDE.md's known exception).
- New database tables or migrations. Belajar progress stays per-device, as it is.
- New routes, or changes to any API route's behaviour.

## Anti-goals: the redesign has failed if

- A feature, control, page, setting or language disappears, even if the screen looks right.
- A guided tour step silently stops working because its `data-tour` target was lost.
- A number on screen did not come from the player's data, config or a real query.
- The site claims something the product does not do.
- A hidden candle or answer reaches the browser where it does not today.
- The light theme, the Tampilan settings or reduced motion break.
- Mid-range Android phones stutter.

## Decisions

### The owner's

- Look only; every feature stays. Trading Game keeps BUY/SELL/WAIT and today's scoring.
- Landing copy: keep the headline "Chart berhenti di garis ini." and **remove** the claims that players name their reasons and that the Trading Game grades the decision rather than the price. Remove them everywhere on the landing page (hero, skills section, product cards, trust strip, final CTA). Akun Demo's Disiplin is truly process-based and may still say so, as `landing.json`'s `process` block does today.
- Commit and push the work to `feat/redesign`. Merge to `main` only after the owner has seen the preview and said so, because merging publishes.

### Approved calls

- Screens with no canvas board take the same style (list below). The light theme stays.
- The sidebar keeps every current `navItems` entry and the Asesmen child, not the canvas's five.
- Confetti comes off the Belajar exam pass (`exam-runner`) and the calm screens (`trading-desk`, `intro-lesson`). It stays on `level-up-toast`, `round-summary` and `akun-latihan/lulus`. Its colours are already non-market.
- Sample numbers on the canvas never appear, and the landing chart uses real candles.
- Everything ships on one branch with one preview link.

### Builder's calls made here, for the owner to check

- **Skill meters are real now** (`lib/progress/skills.ts`). Show them with their real value and "Belum diuji" below `SKILLS.MIN_SAMPLES`. This replaces what the owner was told earlier ("stay — until tracked"). Never show the canvas and spec's "Semua mulai dari 50", or "Skor awal 50/100".
- **No fake history.** There is no 30-day skill history, so the dashboard shows the meters' current values rather than the canvas's line chart, and the crossfade in §6.1 is dropped. Before → after numbers on the summary appear only if a before value really exists at that moment; otherwise they are left out.
- **Timer:** spec §6.3 says no timers on screen, so the ticking `seconds` display in `QuestionProgress` is hidden during a question. The elapsed time is still measured and still shown in `RoundSummary`.
- **Timeframe:** H4 everywhere, because the data is H4 (spec §9 question 5; the canvas landing says H1).
- **Questions per session:** 5, as the code does (spec §9 question 1).
- **Bracket placeholders stay out of public pages.** The canvas's "[ISI ANGKA]%" block is not rendered. "Sebagian besar trader ritel merugi" stays as words, until the owner supplies a real figure and source.
- **Rex** is the real art (`Rex`, `RexArt`), not the canvas's stand-in. Moods follow CLAUDE.md.

## Visual language

The palette and all three font families already match the canvas. `:root` and the canvas agree, so **do not change existing colour values**. What actually changes:

- **Display type:** Bricolage Grotesque, condensed (`font-stretch: 75%`), weight 800, uppercase, tight line height (0.84–0.98), and much larger than today. `app/layout.tsx` must add `wdth` to the font's `axes`. Provide this as a utility or `h1`–`h2` default in `globals.css`. It must yield to the Tampilan font settings: with the Atkinson or OpenDyslexic preference on, headlines use that font without the uppercase-condensed treatment, and the text-size setting still applies.
- **Labels:** small JetBrains Mono uppercase with letter spacing (canvas's section labels), beside the existing amber `eyebrow`.
- **Surfaces:** flat. Cards use a 1px inset ring rather than a border, solid `card`. Glass effects go: change `glass-bar`, `glass-rail`, `glass-card` and `glass` in `globals.css` to solid surfaces rather than editing each call site. `aurora` and `reveal-tilt` come off the landing. Radii stay.
- **Big colour moments:** the full-width amber "Tempat latihan, bukan tempat bertaruh" section, and amber-filled stat cards as on `Summary`.
- **Buttons:** the `btn` utility keeps its role; press behaviour per spec §3.6 with `--edge`. BUY, SELL and WAIT keep their colours.
- **New shades:** the canvas uses a few colours that aren't tokens (`#C9D6C3`, `#3A4733`, `#45525E`, `#1D6E48`, `#8A2E2E`, `#B87A30`). Add semantic tokens for those that are needed, with values for both themes. Never hardcode a hex.
- **Colour meaning is unchanged.** CLAUDE.md's rules hold: correct answers and positive deltas stay `success` where they are today, even where a canvas board paints them amber.
- **Icons:** the canvas's inline SVGs become `lucide-react` equivalents. No emoji.
- **Copy:** every new string goes in `messages/id` and `messages/en`. The canvas is Indonesian only, so write the English too. Facts and counts come from `lib/landing-facts.ts` and config, never typed into copy. Existing copy stays unless a board replaces it and it is true.

## Adapting the motion spec to this repo

The spec assumes files that don't exist. Follow its intent, using these:

| Spec says | Here |
|---|---|
| `app/[locale]/layout.tsx` | `app/layout.tsx`. There is no locale segment. Add the `.js` class in the existing inline preferences script in `lib/preferences.ts`. |
| Button primitive | The `btn` utility in `globals.css` |
| `CandleChart`, `components/chart/` | `components/candlestick-chart.tsx` and `lib/chart-geometry.ts`. Export `dividerFraction` there. |
| `POST /api/attempt`, `lib/grading.ts`, `grade()`, `sc_demo` | Don't exist. The landing demo uses `scoreFor()` and the game's own logic. |
| Hidden candles come only from the grading response | Not true for the Trading Game (the known exception). The order on screen still follows §4.3. |
| Reduce-motion global rule | Also apply under `:root[data-motion="reduce"]`, as CLAUDE.md requires for every looping animation. |
| Vitest tests for hooks | Vitest covers pure logic only. Put the count-up's easing and reduced-motion decision in a pure function and test that. |
| New curves | Add the duration tokens and `--ease-out`; keep existing curves, since other motion uses them. |
| `lesson_progress`, `exam_attempts` tables | Not needed. Use `lib/learn/progress.ts` and `lib/learn/levels.ts`. |

Keep existing motion that the spec doesn't contradict: `<ViewTransition>`, `PageTransition`, the game's `startTransition`, `presence`, `expand`, `candle-reveal`. Extend `candle-reveal` rather than adding a second one. Don't add an animation library.

**Reveal scale:** `trading-game.tsx` computes `frameOf(shown)`, so the scale changes when the hidden candles appear. Spec §4.1 wants a scale that never hints at the future and never rescales. Frame from the visible candles, clip revealed candles at the plot edge with the `↓` marker, and check that nothing else reads that frame expecting all 45.

## Screens

### With a canvas board

**Landing (`Main`, `Mobile`).** Keep every current section: `MarketingNav`, `Hero`, `StatsBanner`, `About`, `Surfaces`, `FeatureRows`, `HowItWorks`, `Faq`, `FinalCta`, `SiteFooter`, restyled or merged into the board's sections with their content kept. FAQ and How it works are not on the board and stay.

The hero demo: one real 45-candle window, chosen off-stride so it isn't one of the 188 questions and the count stays true. Ship only that window to the page, never `lib/game-data.ts`. BUY/SELL/WAIT, then the §4 reveal, using the game's scoring and the game's honest wording. Add spec §4.4's comment at the top of the file. Stats come from `getPublicStats()`. Spec §5 "Do not build" holds.

**Sidebar (`Sidebar`).** All `navItems` and children, `tour` targets, `TourButton`, `SidebarToggle`, the mobile drawer, and the real profile, level and streak. "3 SESI" uses the real unlock rule.

**Dashboard (`Dashboard`).** Keep `DailyGoal`, `Streak`, `CompetencyMeter` with its caption, `LevelXp`, `PracticeCalendar`, `ActivityRows`, `StatRow`, `FirstSessionHero`, `AiInsight`, `NextLesson` and the AI Evaluation lead-in. Canvas parts without data don't get built: a "weakest skill" practice set, and "Rekor terpanjang" unless the data already has it. The empty state follows CLAUDE.md's Player stats rule: "—" and a hint, never a big 0.

**Belajar (`Belajar`).** Levels, the candle-shaped path and popovers per spec §6.2, with lessons and exams from `lib/learn/`. Practice nodes link to the Trading Game. Keep links to Asesmen and Kamus. "Istilah hari ini" is a real glossary entry chosen from `useToday()`. Detect "just finished a lesson" with the existing local marks. Exam pass replaces confetti with the banner change and happy Rex.

**Trading Game (`Game`).** Calm register. Keep the 5-question round, levels and focus, combo chip, `AnswerFeedback`, AI Explanation, glossary terms and the existing decision flow. The "Situasinya" block uses `challengeText()`. Use the board's chart header, curtain and decision line. The result panel shows today's real result, followed by "Yang terjadi kemudian" with the "satu sampel" wording wherever it is true.

**Round summary (`Summary`).** Keep what `RoundSummary` shows today. Use the board's type, stat cards, XP gain segment and per-question tiles with real data (pair, choice, right or wrong). Leave out the process-score average, the "2 / 5" honesty card and "Satu hal untuk dilatih", which all need the reasons project.

**Akun Demo (`AkunDemo`).** Calm register. Read `CLAUDE.md`'s two Akun Latihan sections first. The real `TradingDesk` has far more than the board: nine pairs, four timeframes, indicators, drawing tools, the tutorial video, Tanya Rex, guides, tips. All stay. Stage text uses the real numbers from `lib/demo/config.ts`, not the board's "6 / 8". The disclaimer stays on every screen, and no broker wording is added.

### Without a board: same language, same behaviour

`/start`, login, signup, `lupa-password`, `reset-password`, `persetujuan`, social buttons (Google's "G" keeps its colours), `/ai-evaluation`, `/pengaturan`, `/akun`, `/panduan`, lesson pages, exam pages, `/belajar/kamus`, `/belajar/asesmen` and its runner, Akun Demo's `riwayat`, `jurnal`, `kalkulator`, `tips` and `lulus`, the legal pages, 404, and the tour overlay.

## Constraints that are easy to break

- Keep every `data-tour` attribute and `tour` key on an element that is visible at the same time. When a screen is restructured, update `lib/tours.ts` targets and run the tour. `Card` carries `data-tour`, so keep that prop.
- Charts: overlays use `priceToY()`, `frameOf()` for scales, fixed chart height, fills through tokens.
- Determinism: no `Math.random()` or `Date.now()` in render paths. `sessionStorage` reads for the dashboard's "first visit" belong in effects.
- Server components by default. A restyle shouldn't add `"use client"` unless motion needs it; put client hooks in small wrappers.
- Every interactive element keeps its keyboard behaviour and focus handling. Touch targets ≥44px.
- `lib/game-data.ts` stays generated, and never reaches Akun Latihan client code.
- `main` keeps moving (`feat/streak-bonus` is in progress). Merge `origin/main` into this branch regularly, and restyle whatever arrives.

## Order of work

One commit per ticket, pushed to `feat/redesign`, so each step shows on the same preview link.

1. **Foundations:** M0, M1, M2, display type, surfaces, tokens, shell and sidebar. Everything inherits this, so check every page afterwards.
2. **Landing:** M4, and the decision line's shared geometry.
3. **Trading Game and summary:** M3, M6, and §6.4.
4. **Dashboard:** M7.
5. **Belajar path:** M5.
6. **Akun Demo:** M8, restyling the desk and its tabs.
7. **Everything without a board.**
8. **Docs and sweep:** add `docs/motion-spec.md` to CLAUDE.md, update its Styling and Motion sections, and check the feature list below.

The spec's "wait for my OK after each plan" is replaced by one approved plan for the whole redesign; the owner reviews on the preview link.

## How we know it's done

- `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` all pass, including the message catalogue parity test.
- Every page checked in a browser, in dark and light, at phone and desktop width, with reduced motion both ways, and in both languages.
- All six guided tours run to the end.
- The feature list holds: for every section of CLAUDE.md's Architecture, each thing it says a page does still works. Compare with `origin/main`'s preview side by side for the Trading Game, the trading desk, Asesmen and AI Evaluation.
- A search finds no raw hex in components (except Google's "G"), no emoji, and no canvas sample number (`196.40`, `1.240`).
- CPU 4× slowdown: the reveal stays smooth.

## Left to the builder

Exact component structure, utility names, token names, which landing sections merge, spacing, and which window the hero demo uses. Where a board and a real feature collide in layout, keep the feature and stay in the board's spirit.
