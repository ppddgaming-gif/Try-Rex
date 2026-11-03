# Try-Rex — Motion & Screens Spec

*November 2026 · companion to `build-spec.md` and the design canvas ("Try-Rex Landing Redesign"). Written for two readers: you, and Claude Code.*

The canvas shows what every screen looks like. This file says how things move, in what order, how fast, and what to build first. Sections 0–1 are for you. Sections 2–9 are what Claude Code implements. Section 10 has copy-paste prompts.

---

## 0. How to use this file with Claude Code

1. **Put it in the repo.** Save this file as `docs/motion-spec.md`, next to `docs/build-spec.md`.
2. **Tell Claude Code it exists.** Add one line to the "Specs — read before implementing" list in `CLAUDE.md`:
   `- docs/motion-spec.md — motion tokens, every animation, screen notes, motion tickets`
3. **One ticket at a time.** Section 10 has a prompt per ticket. Paste one, nothing more.
4. **Let it plan first.** Your `CLAUDE.md` already tells Claude Code to propose a plan and wait. Read the plan. If you don't understand a line, ask "what does this step do, in simple words?" before saying yes.
5. **Look at it yourself.** Run `npm run dev`, open `http://localhost:3000` in the browser, and go through the "How to check" list under the ticket.
6. **If it looks wrong, describe what you see,** not what you think the code should be. "The candles appear all at once instead of one by one" is a perfect bug report. A screenshot helps.
7. **Commit after every ticket that works.** Then if the next one breaks something, you can go back.
8. **Claude Code can't open the design canvas.** For any screen ticket, take a screenshot of that board in Play mode and attach it to the prompt, so it can see what you see.

---

## 1. Animation in five minutes

An animation is just **a property changing over time**. Every animation in this spec is described with four knobs:

| Knob | Meaning | Example |
|---|---|---|
| **What changes** | Which property moves | opacity 0 → 1, position 12px lower → normal |
| **Duration** | How long it takes | 280ms (about a quarter of a second) |
| **Easing** | The speed curve | starts fast, slows down at the end |
| **Delay** | Wait before starting | candle 5 waits 5 × 70ms |

Five rules that make animation feel good and stay fast on cheap phones:

1. **Only animate `transform` and `opacity`.** Moving, scaling, fading. Phones can do these smoothly. Animating `width`, `height`, `top` or `margin` makes the browser recalculate the whole page every frame, which stutters on mid-range Android phones (most of your audience).
2. **Short is better.** Most UI motion is 120–400ms. Anything over half a second should be telling a story (the chart reveal).
3. **Motion must mean something.** The candle reveal means "here is what happened next". A pulsing node means "start here". A random bounce means nothing; leave it out.
4. **Respect "reduce motion".** Some people get dizzy from animation and turn it off in their phone settings. When that setting is on, everything still works, it just appears instantly.
5. **Never block content.** No loading screens, no waiting for an animation before you can read or tap.

Three tools, from simplest to most powerful:

- **CSS transition:** "when this value changes, change it smoothly." Good for hover, press, selected states.
- **CSS keyframe animation:** "play this movement once (or forever)." Good for reveals and pulses.
- **A little JavaScript:** only to *decide when* to start a CSS animation (when something scrolls into view, when the server answers). JavaScript never moves things frame by frame in this project.

---

## 2. Motion tokens

Like the colour tokens, every animation uses these names instead of raw numbers. Add to `app/globals.css`:

```css
:root {
  /* durations */
  --dur-press: 80ms;      /* button sink */
  --dur-fast: 180ms;      /* popovers, chip toggles, glossary */
  --dur-base: 280ms;      /* panels changing, cards entering */
  --dur-slow: 400ms;      /* headlines, section reveals */
  --dur-draw: 700ms;      /* rings and chart lines drawing */
  --step-candle: 70ms;    /* delay between revealed candles */
  --step-stagger: 80ms;   /* delay between cards in a group */

  /* easing */
  --ease-out: cubic-bezier(.2, .8, .2, 1);   /* almost everything */
  --ease-in-out: cubic-bezier(.65, 0, .35, 1); /* loops: pulse, bob */
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Two registers** (same rule as the visual design in `CLAUDE.md`):

- **Calm** — Trading Game, evaluation, Akun Demo. Only functional motion: state changes, the reveal. No decorative loops, no bouncing.
- **Expressive** — landing, dashboard, Belajar path, session summary. Entrances, count-ups, the mascot.

**No animation library.** Everything here is CSS plus four small hooks (section 3). Do not add Framer Motion, GSAP or Lottie. If a later feature truly needs one, say why first, as `CLAUDE.md` requires.

---

## 3. Shared building blocks (build these first)

All live in `lib/motion/`. Each is small.

### 3.1 `usePrefersReducedMotion()`
Returns `true` when the user has reduce-motion on. Listens for changes. Used by any JS that schedules motion (count-ups, auto-scroll).

### 3.2 `useInView(ref, { threshold = 0.25, once = true })`
Wraps `IntersectionObserver`. When the element enters the viewport, sets `data-inview="true"` on it. CSS does the animating. With `once`, it stops observing after the first time.

### 3.3 `<Reveal index={n}>`
A wrapper that uses `useInView` and sets `--i: n` so children can stagger:

```css
.js [data-reveal]:not([data-inview]) { opacity: 0; transform: translateY(12px); }
[data-reveal] {
  transition: opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
  transition-delay: calc(var(--i, 0) * var(--step-stagger));
}
```

**No flash, no hidden content without JS:** the hiding rule only applies under `.js`, a class added by a one-line inline script at the very top of `<head>` in `app/[locale]/layout.tsx`:
`document.documentElement.classList.add('js')`. If JavaScript fails, everything is simply visible. With reduce-motion on, `<Reveal>` sets `data-inview` immediately.

### 3.4 `useCountUp(target, { duration = 600 })`
Counts a number from its previous value to `target` using `requestAnimationFrame`, easing out. Returns the current display value. With reduce-motion, returns `target` immediately. Always render numbers with `tabular-nums` (already a design rule) so digits don't jiggle while counting.

### 3.5 `useScrollProgress()`
Returns page scroll progress 0–1, updated at most once per animation frame. Used only by the nav XP bar.

### 3.6 Button press (CSS only)
```css
.btn { box-shadow: 0 4px 0 var(--edge); transition: transform var(--dur-press) ease, box-shadow var(--dur-press) ease; }
.btn:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--edge); }
```
Each button sets its own `--edge` (amber buttons `--amber-dim`; BUY/SELL/WAIT their dark shade).

---

## 4. The signature: decision line and reveal

This is the one animation that defines Try-Rex. It appears in the landing hero demo, the Trading Game, and (small, static) on the dashboard and Belajar cards.

### 4.1 Geometry
- The chart shows `NV` visible candles and leaves `NF` empty slots on the right (live game: 30 visible, 15 hidden).
- The decision line sits at `dividerFraction = NV / (NV + NF)` of the plot width.
- Everything — candles, levels, SL/TP lines, the divider, the hero's full-height line — uses the **one** `priceToY()` and the **one** `dividerFraction` exported from `components/chart/` (non-negotiable 4).
- The y-scale is computed from **visible candles only** plus padding (8 pips top, 15 pips bottom), so the scale never hints at the future. If a revealed candle falls outside the plot, clip it at the edge and show a small `↓` marker; never rescale after the reveal.

### 4.2 Before the answer
- The hidden region is covered by a hatched "curtain" with a `?` and "15 candle berikutnya terbuka setelah kamu dinilai".
- The browser does not have the hidden candles at all yet. They arrive only in the grading response (non-negotiable 1).

### 4.3 The sequence (timeline from when the grade arrives)

| Time | What happens | How |
|---|---|---|
| 0ms | Submit button shows "Menilai…", disabled | state change, no spinner unless > 600ms |
| response | Score panel rises in (score, verdict, XP) | `translateY(8px) → 0`, opacity, `--dur-base` |
| response | Curtain wipes away to the right | `clip-path: inset(0 0 0 0) → inset(0 0 0 100%)`, 320ms `--ease-out` |
| +120ms | Hidden candles appear left to right | each `scaleY(.15) → 1` + opacity, 320ms, delay `120ms + i × --step-candle` |
| after last candle (~1.2s) | "SATU SAMPEL, BUKAN BUKTI" tag fades in | opacity, `--dur-fast` |
| ~0.9s | "Yang terjadi kemudian" box rises in | same as score panel, delayed |
| after reveal | Session progress segment fills, XP counter counts up | `scaleX`, `useCountUp` |

Why the score comes first and the outcome second: the order teaches the lesson. You see how well you *decided* before you see what price *did*.

Candle stagger in CSS:
```css
.candle--revealed {
  animation: candleIn 320ms var(--ease-out) both;
  animation-delay: calc(120ms + var(--i) * var(--step-candle));
  transform-origin: center;
}
@keyframes candleIn { from { opacity: 0; transform: scaleY(.15); } to { opacity: 1; transform: none; } }
```

Reduced motion: curtain disappears and all candles show at once, the tag shows immediately.

### 4.4 The landing demo is a special case
The hero demo grades in the browser, which would break non-negotiable 1 if it used a real scenario. So:
- It uses **one dedicated scenario, `sc_demo`, that is never in the real pool.** Its rubric may ship in the page bundle.
- Put a comment at the top of the demo file: *"Demo only. Real scenarios are graded in POST /api/attempt. Do not copy this pattern."*
- It should use the same `grade()` function from `lib/grading.ts`, so the demo and the real game always agree.

### 4.5 Hero full-height line (landing only)
A dashed amber line from the top of the hero to the chart, at the same x as the chart divider: `left: calc((100% - var(--axis-w)) * var(--divider))`, where `--axis-w` is the price axis width (72px) and `--divider` is `dividerFraction`. Labels "SUDAH TERJADI ←" and "→ BELUM TERLIHAT" sit at its top. Hidden below 760px wide; the chart's own divider stays.

---

## 5. Landing page (expressive)

| Element | Trigger | Motion | Timing | Reduced motion |
|---|---|---|---|---|
| Nav XP bar | scroll | fill `transform: scaleX(progress)`, origin left | per frame via `useScrollProgress` | still tracks scroll, no smoothing |
| Hero headline (3 lines) | page load (CSS, no JS gate) | each line `translateY(40%) → 0` + opacity | `--dur-slow`, 80ms stagger | instant |
| Hero chart demo | user | section 4 | — | section 4 |
| "Tempat latihan, bukan tempat bertaruh" | section enters view (threshold .4) | line by line, `translateY(40%) → 0` + opacity | `--dur-slow`, 120ms stagger | instant |
| Competency focus list | hover / tap / focus | inactive → active colour; description opens via `grid-template-rows: 0fr → 1fr` | colour 200ms, open `--dur-base` | instant |
| Product bento cards | enter view | `<Reveal>` | `--dur-base`, 60ms stagger | instant |
| Buttons | press | 3.6 | `--dur-press` | — |
| Rex bubble in hero | idle | gentle bob 4px | 2.4s loop `--ease-in-out` | off |

On phones the competency list can auto-activate the item closest to the screen centre (IntersectionObserver with a thin `rootMargin` band) since there is no hover.

**Do not build:** a preloader, scroll-jacking (taking over the scroll wheel), parallax backgrounds, or video backgrounds. Each looks nice on a fast laptop and costs real visitors on mobile data.

---

## 6. App screens

### 6.1 Dashboard (expressive)
- **First visit of the session only** (remember with a `sessionStorage` flag), cards enter with `<Reveal>`, 60ms stagger. Later visits render instantly — nobody wants the same entrance ten times a day.
- **Target ring:** the progress arc draws with `stroke-dashoffset` from empty to its value, `--dur-draw`.
- **Level XP bar:** `scaleX` fill, `--dur-draw`.
- **Competency chart:** switching competency crossfades the line (old fades out, new draws via `stroke-dasharray`/`stroke-dashoffset`, 600ms). The four numbers above use `useCountUp` on first load.
- **Streak tiles:** pop in left to right, 40ms stagger.
- **Empty state (new account, no data):** all competencies show 50 with the note "Semua mulai dari 50", streak 0 with "Mulai hari ini", calendar empty with "kosong sampai kamu mulai". No sample numbers ever (non-negotiable 6). The canvas shows a user two weeks in; a brand-new account looks like the empty state.

### 6.2 Belajar 101 — the level path (expressive)
Structure: each level is a unit with a banner; its lessons are **candle-shaped nodes** on a zigzag path, with a chart-practice node in the middle and the level exam at the end.

- **Zigzag offsets** (px, repeating): `[0, 56, 92, 56, 0, -56, -92, -56]`. Multiply by 0.6 below 480px wide.
- **Node states:** done (amber, check), current (larger, amber, pulsing ring, "MULAI" bubble), locked (dark, lock), practice (candle icon, links to Trading Game), exam (wide node, trophy).
- **Current node pulse:** a pseudo-element ring that scales 1 → 1.6 and fades out, 1.8s loop, `--ease-out`. Use `transform`/`opacity` on the pseudo-element, not an animated `box-shadow` (cheaper).
- **"MULAI" bubble:** bob 4px, 2.4s loop.
- **Node press:** sinks 4px, `--dur-press`.
- **Popover on tap:** `scale(.96) translateY(-6px) → 1`, `--dur-fast`, origin top centre. Move keyboard focus into it; Escape or a tap outside closes it and returns focus to the node. Only one open at a time.
- **Finishing a lesson** (when returning to the path), one sequence, about 900ms:
  1. the finished node turns amber and its check pops (`scale .6 → 1.1 → 1`, 300ms);
  2. the next node's lock fades out and it grows to "current" size (250ms);
  3. the pulse and "MULAI" bubble move to it;
  4. the page scrolls the new current node to the centre (`scrollIntoView({ block: 'center', behavior: 'smooth' })`; `'auto'` with reduced motion).
- **Passing a level exam:** the level banner changes from amber "in progress" to the compact "SELESAI" row, the next level's banner turns amber, Rex shows his happy expression. No confetti.
- **Locked levels** fade out down the page (opacity steps 0.9 → 0.25) so the path suggests "more ahead" without a wall of locks.

### 6.3 Trading Game (calm)
- **Action → reasons:** the action buttons are replaced by the reasons panel with a 280ms rise (`translateY(8px) → 0` + opacity). "Ganti pilihan" goes back the same way.
- **Reason toggle:** background and border change over `--dur-fast`; the checkbox tick appears instantly (no bounce).
- **Glossary terms** (dotted underline): tap opens the definition box under the prompt, `--dur-fast`.
- **Submit:** section 4.
- **Session progress bar:** 5 segments; the current segment fills (`scaleX`) after the reveal, 400ms.
- **No timers on screen.** The attempt records `seconds`, but a visible countdown adds pressure and rewards fast guessing.

### 6.4 Session summary (expressive)
In order, starting on load:
1. "SESI SELESAI." lines rise (`--dur-slow`, 80ms stagger); Rex hops once (1.1s).
2. The three stat cards enter with 80ms stagger; their numbers count up (`useCountUp`, 600ms).
3. XP bar: the old portion is already there; only the **gained** segment grows (`scaleX`), 900ms, after a 500ms delay.
4. Per-question tiles enter with 90ms stagger; each score bar fills.
5. Competency before → after numbers count up.
6. The "2 / 5" honesty card ("harga bergerak berlawanan dengan keputusan yang dinilai tepat") does **not** animate. It is the most important message on the screen; it should just be there, still.

### 6.5 Akun Demo (calm)
- **Risk and reward bars** follow the order inputs, `transform: scaleX`, `--dur-fast`.
- **Discipline checks** switch state with a 150ms colour change; no animation for failing a check (a failed check should feel serious, not playful).
- **Placing an order:** entry, SL and TP lines appear at once (no slide), the order ticket resets.
- **New journal row:** inserted at the top with a background highlight that fades out over 1.2s.
- **The moving chart:** the latest candle updates in place. No flashing, no green/red pulses on price changes.

---

## 7. Accessibility and performance checklist

- [ ] Every animation has a reduced-motion behaviour (the global rule in §2 covers CSS; JS checks `usePrefersReducedMotion`).
- [ ] Nothing is hidden unless JavaScript is running (`.js` class, §3.3).
- [ ] Only `transform`, `opacity` and `clip-path` are animated. Progress bars use `scaleX`, not `width`.
- [ ] `will-change` only on the element while it animates, never left on.
- [ ] No layout shift: panels that appear later have reserved space or push content below the fold only.
- [ ] Popovers close with Escape and return focus.
- [ ] Test on a slow phone: Chrome DevTools → Performance → CPU 4× slowdown. The reveal must stay smooth.
- [ ] Green and red still mean only market direction (BUY/SELL, candles, TP/SL). Motion never uses them for celebration.

---

## 8. Screen notes and data

What each redesigned screen reads, so Claude Code knows where the numbers come from.

| Screen | Data | Status in `schema.sql` |
|---|---|---|
| Dashboard | `competency_scores`, `competency_history`, `streaks`, `attempts`, `profiles` (XP, level, daily target) | covered |
| Belajar path | lesson progress per user, exam attempts per level | **not in `schema.sql`** — check whether the live repo already has tables; if not, add `lesson_progress (user_id, lesson_id, completed_at)` and `exam_attempts (user_id, level, score, passed, created_at)` with the same RLS approach |
| Trading Game | `scenarios` (public half), `POST /api/attempt` | covered |
| Session summary | `sessions`, `attempts` for that session, `competency_history` | covered |
| Akun Demo | trades, journal, discipline checks, stage | **not in `build-spec.md`** — lives in the live repo; read the existing code before changing it |

All sample numbers on the canvas (streak 6, Level 4, 9/38 lessons, $196.40) are illustrative. Real screens show only the user's own data.

---

## 9. Open questions found while designing

1. **Questions per session: 5 or 20?** The live game uses 5; `plan.md` and `build-spec.md` say 20. The canvas uses 5. Decide and update the specs.
2. **Outcome-based copy on the live site.** The current AI Explanation says SELL "is the answer" because price fell afterwards. That contradicts non-negotiable 3. Replace before the new game ships.
3. **Grading formula.** `build-spec.md` §3 adds points for any picked reason, even one that argues against the chosen action. The mockups give such reasons −1 instead. Decide, then encode it in the `grade()` tests.
4. **Rex.** The canvas uses a stand-in drawing. The real art needs at least: happy, thinking, serious, cheering.
5. **Timeframe in the landing demo.** Landing says H1, the game uses H4. Pick one.

---

## 10. Motion tickets, with prompts for Claude Code

Do them in order. Each prompt assumes this file is at `docs/motion-spec.md`.

### M0 — Tokens and reduced motion (S)
```
Read docs/motion-spec.md §1–2. Add the motion tokens and the reduced-motion rule to app/globals.css exactly as written. No new dependencies. Propose a short plan first and wait for my OK.
```
**How to check:** nothing visible changes yet. Ask Claude Code to show you the lines it added.

### M1 — Motion hooks (S)
```
Read docs/motion-spec.md §3. Create lib/motion/ with usePrefersReducedMotion, useInView, useCountUp and useScrollProgress, plus the <Reveal> component and the .js class script in the root layout. Add small vitest tests for useCountUp's reduced-motion behaviour. Plan first, then run npm run typecheck && npm test.
```
**How to check:** tests pass. Turn on "Reduce motion" in your Mac settings (Accessibility → Display) later to test every ticket.

### M2 — Button press (S)
```
Read docs/motion-spec.md §3.6. Update the Button primitive so every variant has the 4px edge and the press animation using --edge. Plan first.
```
**How to check:** click and hold a button — it sinks 3px and the edge shrinks.

### M3 — Decision line and reveal (M) — needs CandleChart (build-spec 1.3)
```
Read docs/motion-spec.md §4 and CLAUDE.md non-negotiables 1, 3 and 4. Add the curtain, the decision line using a single exported dividerFraction, and the reveal sequence in §4.3 to CandleChart. The hidden candles must come only from the grading response. Plan first, then show me how to trigger it locally.
```
**How to check:** answer a question. Score appears first, the curtain wipes right, candles appear one by one left to right, then the "satu sampel" tag. With Reduce motion on, everything appears at once.

### M4 — Landing (M)
```
Read docs/motion-spec.md §4.4, §4.5 and §5. Implement the landing animations: nav XP bar, hero headline, hero full-height line, the sc_demo scenario for the hero demo, statement reveal, competency list, bento reveals. No preloader, no scroll-jacking. Plan first.
```
**How to check:** scroll the landing slowly on desktop and on your phone. The XP bar under the nav fills as you scroll; the big amber section's lines appear as it comes into view.

### M5 — Belajar level path (L)
```
Read docs/motion-spec.md §6.2. I've attached a screenshot of the Belajar path design. Build the path: level banners, candle-shaped nodes with five states, zigzag offsets, popover with focus handling, and the finish-a-lesson sequence. If lesson progress tables don't exist, propose the schema change first (§8) and wait. Plan first.
```
**How to check:** the current lesson pulses with a "MULAI" bubble; tapping any node opens its card; finishing a lesson moves the pulse to the next node and scrolls to it.

### M6 — Trading Game panels (M)
```
Read docs/motion-spec.md §6.3. Add the action → reasons transition, reason toggles, glossary term popover and the 5-segment session progress bar. Calm register: no decorative motion. Plan first.
```
**How to check:** choose an action, pick reasons, submit. Nothing bounces; everything changes smoothly and quickly.

### M7 — Dashboard and session summary (M)
```
Read docs/motion-spec.md §6.1 and §6.4. Implement the entrances, count-ups, target ring, XP gain segment, competency line crossfade and the empty states. The dashboard entrance plays once per browser session. Plan first.
```
**How to check:** first visit animates; reload the dashboard and it appears instantly. Finish a session: numbers count up, only the new XP segment grows, the "2 / 5" card stays still.

### M8 — Akun Demo micro-interactions (S)
```
Read docs/motion-spec.md §6.5. Read the existing Akun Demo code before changing anything. Add the risk/reward bar transitions, check state changes and the new-journal-row highlight. Plan first.
```
**How to check:** change the stop loss — the risk bar moves smoothly; place an order — a new journal row flashes softly and settles.
