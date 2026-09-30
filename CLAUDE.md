# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build
npm start        # serve the production build
npm run typecheck # tsc --noEmit, strict mode
npm run lint      # eslint . (flat config in eslint.config.mjs)
```

- **No test suite exists** — no test runner, config, or test files. If asked to add tests, pick a framework and say so explicitly.
- `node scripts/generate-game-data.mjs` regenerates `lib/game-data.ts` from `Game-data-main/`. It is plain Node with no dependencies and prints a report of what it skipped and repaired.
- Lint is the ESLint CLI with `eslint-config-next` (core-web-vitals + typescript). `next lint` no longer exists in Next 16. `Game-data-main/` and the generated `lib/game-data.ts` are ignored.

### Note on `&` in the checkout path

This repo is checked out at `C:\Try-Rex`, so **the normal `npm run` and `npx` commands above work.** No workaround is needed.

Earlier revisions of this file documented a breakage, and it is real but conditional: if the checkout is ever moved under a path containing `&` (for example `C:\Users\A&J\...`), the unescaped `&` breaks the Windows `.cmd` shims npm generates, and `npm run dev`/`build`/`start` plus any `npx <bin>` fail with a mangled-path `MODULE_NOT_FOUND` or `'...' is not recognized as an internal or external command`. That hits every terminal, including VS Code's integrated one.

If you see those errors, check `git rev-parse --show-toplevel` for special characters first, then bypass the shim by calling the binary's JS entry point through `node`:

```bash
node node_modules/next/dist/bin/next dev
node node_modules/typescript/bin/tsc --noEmit
```

## Architecture

Next.js 16 App Router + React 19, TypeScript strict, Tailwind CSS v4. The `@/*` path alias maps to the repo root (so `@/components/card` → `components/card.tsx`).

### UI shells

Routing splits into four surfaces:

- **`app/page.tsx`** — public landing page. Composes ~8 section components from `components/landing/` (hero, stats banner, feature rows, testimonials, footer…) in top-to-bottom order. No sidebar.
- **`app/(app)/`** — the authenticated-style product shell. Its `layout.tsx` wraps children in a fixed 64-unit `Sidebar` plus `lg:ml-64` main area, with `AppNavMobile` (a `lg:hidden` sticky bar + drawer) covering navigation below the `lg` breakpoint where the sidebar is hidden. Contains `dashboard`, `trading-game`, and `ai-evaluation` routes. The layout loads the signed-in user once (`getCurrentUser()`) and passes the name down; guests see a sign-in prompt in `ProfileCard` instead.
- **`app/(auth)/`**: `/login`, `/signup`, `/lupa-password` (request a reset email) and `/reset-password` (set the new password), as one centred card with no sidebar.
- **`app/(legal)/`**: `/privacy`, `/terms` and `/disclaimer`, using the landing nav and footer. They are **drafts**: `<Isi>` and `<Tinjau>` from `components/legal-doc.tsx` render the `[PERLU DIISI]` / `[PERLU DITINJAU]` markers that must be resolved (and the text legally reviewed) before launch.

Every page that reads the session is **dynamic** (server-rendered per request), which now includes `/` and everything under `app/(app)/`. `/dashboard` has no filters. Its server page resolves only the user's name and today's challenge; everything else is `DashboardView`, a client component reading the player's progress. `/ai-evaluation` takes `?c=<dataset id, e.g. eurusd-1>&a=<decision>&t=<seconds>` — the Trading Game handoff — and falls back to a representative example when the params are absent or invalid, so the page still stands alone. The fallback shows a banner that labels it as an example, so it never passes as the player's own result. `/trading-game` takes `?c=<dataset id>`: the round opens on that question at its level. The dashboard's "Mulai Tantangan" uses this to start the daily challenge. The game keeps a per-question `results` array, which drives the segmented progress bar and the end-of-round `RoundSummary`, and it can be played from the keyboard (B / S / W, Enter, N).

Page titles are short (`"Dashboard"`); the root layout's `title.template` appends `| TRY-REX`. `app/not-found.tsx` is the branded 404. `<html lang="id">`.

Adding a product page means creating it under `app/(app)/` (it inherits the shell automatically) and registering it in the `navItems` array in `components/nav-items.ts` — the single source both nav surfaces read.

The shell's chrome is split into small shared pieces so the desktop and mobile surfaces cannot drift: `components/brand-mark.tsx` (logo lockup, `size="lg"` for the sidebar), `components/nav-links.tsx` (the link list; it owns the `usePathname` active-route highlight), and `components/profile-card.tsx` (the level/XP block). `Sidebar` and `AppNavMobile` are thin compositions of those three.

### Game data is real historical price data

The Trading Game runs on **real H4 forex candles**, not generated series. Three layers:

1. **`lib/game-data.ts` — GENERATED, do not hand-edit.** 39 datasets (8 pairs across `easy`/`medium`/`hard`), each `{ id, pair, level, timeframe, period, digits, candles }` with candles as `{t,o,h,l,c,v}` (`t` = unix seconds UTC). Regenerate with `node scripts/generate-game-data.mjs`, which reads `Game-data-main/src/data/pairs/**/*.js`.
2. **`lib/game-logic.ts`** — the game rules, ported to typed TS from `Game-data-main/src/utils/*`: `sliceGame` (30 history + 15 future), `outcomeOf` (their ±0.1% threshold), `detectSupportResistance` (swing points clustered, top 3 by touches), `trendSlope`, `xpForLevel` (their `EXP_TABLE`: 25/75/150), plus `timeLabelsFor` and `pipSize`.
3. **`lib/mock-data.ts`** — despite the name, it now holds no fake content. It assembles `challenges` from the datasets via `buildChallenge`, plus `frameOf`, `scoreFor`, `tradePlanFor` and `roundFor`. The old dashboard mocks (`aspectMetrics`, `recentActivities`, `recommendations`, `dataAsOf` …) were removed, so don't bring them back. Player stats come from `lib/progress/` (below).

**The correct answer is derived, never authored.** It is whatever price actually did over the 15 hidden candles. Every explanation string (`situation`, `reasons`, `suggestion`, `feedback`) is likewise computed from the candles — trend slope in pips, detected level distances, position in range, real change % — so the prose can never contradict the chart. Do not hand-write per-dataset narrative.

`roundFor(level)` builds a 5-question round. It rotates through answers rather than reading file order, because the source data is 27 buy / 9 sell / 3 wait and a naive round would be five BUYs in a row.

Everything is deterministic so server and client agree — no `Math.random()` (their `GameChart` picked a random start index; we fix it at 30) and no `Date.now()` in render paths. Anything that needs the clock (today's date for streaks and the calendar, "2 menit lalu") reads it through `useToday()` / `useNow()` from `lib/progress/use-progress.ts`. Those return null on the server and on the first client render, so no date ever reaches server HTML. The game's elapsed timer starts at `0` in `useState` and only advances in a `useEffect`. The dashboard's daily challenge is picked by the Jakarta date in a *server* component, which never hydrates.

### Player progress: `lib/progress/`

**Never invent a statistic.** Every number the player sees (XP, level, streak, accuracy, counts, the calendar, the insight line) is derived from their own recorded attempts. No component contains a literal stat. When there is nothing yet, show "—" in muted text with a one-line hint, never a big `0` or `0%`.

- `types.ts`: the `Progress` shape (`version`, `xp`, `attempts`, `streak`, `competencies`) and `emptyProgress()`. **Competencies stay `null`** ("Belum diuji") until scenarios record which skill they test (the rubric ticket). Never fill them with a computed stand-in.
- `derive.ts`: small pure functions.
  - `levelFromXp`: Level 1 at 0 XP, each level needs 100 × level more.
  - `accuracy`, which returns null with no attempts
  - `nextStreak` / `liveStreak`, on the player's local day
  - `attemptsPerDay`
  - `insightLine`: counted facts only, no advice
- `store.ts`: the `ProgressStore` interface (`loadProgress`, `recordAttempt`, `resetProgress`, `subscribe`) with two implementations, picked by `setAccount(userId)`.
  - **Guests:** localStorage under `tryrex:progress:v1`. Every read and write is in try/catch, and unreadable data means empty progress.
  - **Signed in:** Supabase `practice_attempts`. Only attempts are stored; XP and streak are rebuilt with `progressFromAttempts`. Attempts appear at once and save in the background; a failed save waits in `tryrex:outbox:<userId>` and is resent on the next load. On load, any guest attempts on the device are imported into the account (idempotent) and cleared locally.
  - `loadProgress()` returns null until the account has loaded, and before `setAccount` has run.
  - `<ProgressAccount>` in `app/(app)/layout.tsx` calls `setAccount` with the **server-rendered** user id. Don't drive it from the browser's `onAuthStateChange`: sign-out is a server action, so the browser client never hears about it.
- `use-progress.ts`: the only thing components use.
  - `useProgress()` (`useSyncExternalStore`) returns null until the browser has loaded, so render a skeleton for null.
  - `useProgressEvents()` delivers the XP-gain / level-up events.
  - `recordAttempt()` is called by the game on submit.
- Progress follows the **account** when signed in, and the device for guests.
- `practice_attempts` rows are self-reported (the game grades in the browser), which is why they are separate from the graded `attempts` table. RLS lets a player read, insert and delete only their own rows; table checks keep the values in the game's shape.
- The landing `StatsBanner` shows real counts from the `public_stats()` RPC (confirmed accounts, answered questions) via `lib/public-stats.ts`, and falls back to plain copy when there is nothing to count or Supabase is unreachable.
- UI pieces live in `components/progress/`:
  - `EmptyState` is the one empty layout; use it for every empty card.
  - `Skeleton` must be sized exactly like the content it stands in for.
  - The rest: `LevelXp`, `Streak`, `LevelUpToast` (mounted in the app layout), `PracticeCalendar`, `CompetencyMeter`, `ActivityRows`, `StatRow`, `FirstSessionHero`, `AiInsight`, `ResetProgress`, `ProgressAccount` (renders nothing; see `store.ts`).

**Known gaps in the source data** (the generator skips these and prints why): `hard/gbpnzd_1–5.js` are 0 bytes, and `hard/euraud_5.js` has only 30 candles (needs 45). It also drops 8 rows with malformed dates (e.g. `"2000:01:17"`) and clamps 9 candles whose wicks did not contain their bodies. Because gbpnzd is missing, `hard` has only 2 usable pairs, so a hard round can repeat a pair.

**The README is aspirational, not descriptive.** It documents Firebase Auth, Firestore and a `src/` layout. None of that exists: auth is Supabase (below). Trust the code over the README.

### Accounts: Supabase Auth

Cookie sessions via `@supabase/ssr`, email + password only. Env: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`). **No service-role key exists anywhere in the app yet**; the grading route in the spec will be the first user.

- `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (Server Components, Route Handlers, Server Actions) both use the anon key.
- `proxy.ts` (Next 16's name for middleware) calls `lib/supabase/middleware.ts`, which refreshes the session and holds the route rules: `/dashboard` needs an account (guests go to `/login?next=…`), signed-in users are bounced off `/login` and `/signup`, and `/trading-game` and `/ai-evaluation` stay open to guests.
- `lib/auth-actions.ts` holds the server actions (login, signup, reset request, new password, sign-out). `app/auth/callback/route.ts` turns email links into a session.
- `lib/auth-rules.ts` is pure and client-safe: `safeNext()` (only same-site paths starting with a single "/"; always run `next` through it), the Indonesian error messages, `MIN_PASSWORD`. `lib/auth.ts` is server-only (`getCurrentUser()`, `isSignedIn()`); never import it from a client component.
- **Profiles are created by the `handle_new_user` trigger, never by the client.** It also seeds the four competencies at 50. SQL: `docs/schema.sql`, then `supabase/migrations/*.sql` in filename order (`_accounts`, `_progress_sync`, `_lock_down_functions`). The build spec lives in `docs/build-spec.md`.
- **Revoke EXECUTE on every server-only function.** Postgres grants it to PUBLIC by default, and Supabase exposes each `public` function at `/rest/v1/rpc/<name>`. `apply_competency` and `touch_streak` were callable by anyone for any user until `_lock_down_functions`.
- `ProfileCard` shows the player's real level, XP and streak from `lib/progress` (guests included, as "Tamu"), so it is a client component.
- The Supabase MCP server is configured at user scope (plain `https://mcp.supabase.com/mcp`). A project-scoped URL with `?project_ref=…&features=…` failed OAuth with "Resource must be a valid MCP endpoint", so pass the project id (`dfcnpbnnmgaspjodxete`) per call instead.

### Charts are hand-rolled SVG

There is no charting library. `components/candlestick-chart.tsx`, `components/donut.tsx`, and `components/sparkline.tsx` emit raw SVG.

`CandlestickChart` is a pure, fully prop-driven server component with a fixed `1000×460` viewBox and `preserveAspectRatio="none"` (it stretches to its container). It performs **no autoscaling** — the caller must supply `min`, `max`, `priceTicks`, and `timeLabels` that agree with the data, or candles will clip. **Do not hand-tune those three:** call `frameOf(candles)` from `lib/mock-data.ts`, which derives a frame guaranteed to contain the highs, lows and zones, and snaps ticks to a round step. Its step selection is scale-free, so it works for both 1.08-scale majors and 85-scale JPY crosses. Pass `digits` too (5 for majors, 3 for JPY crosses — each dataset carries its own); the chart renders axis ticks one decimal shorter than markers, per FX convention. Optional overlays: `zones` (support/resistance bands), `markers` (labeled horizontal price lines for entry/SL/TP — build these with `tradePlanFor`), `currentPrice` (right-edge badge), and `dividerAt` (a dashed ENTRY line before that candle index, with the candles after it on a lifted backdrop: pass `challenge.candles.length` whenever the future is shown). The chart box must have a **fixed height**. With `preserveAspectRatio="none"`, a box that grows with its grid row stretches the axis text too. See `app/(app)/ai-evaluation/page.tsx` for the fullest usage.

The `Zone` and `Marker` types live in `lib/mock-data.ts`, not in the chart, so data helpers can construct them.

SVG fills and strokes reference CSS custom properties directly (`fill="var(--danger)"`), so charts inherit the theme rather than hardcoding hex values. Keep this pattern.

### Styling: Tailwind v4, CSS-first

**There is no `tailwind.config.js`** — v4 configuration lives entirely in `app/globals.css` via an `@theme inline` block. PostCSS uses only `@tailwindcss/postcss`.

The palette is defined as semantic hex tokens on `:root`, taken 1:1 from the "Try-Rex Screens" design artifact, and exposed to Tailwind as utility colors: `background`, `foreground`, `card`, `muted`, `muted-foreground`, `faint`, `inset`, `border`, `primary` (plus `primary-hi` / `primary-dim`), `success`, `danger`, `warning`, `wait`. Use these utilities (`bg-card`, `text-muted-foreground`, `border-border`) rather than raw Tailwind palette colors like `bg-gray-800`, since hardcoded colors break the theme. There is no light mode.

**Amber is the brand; green and red mean market direction and nothing else.** `primary` is amber. `success` (buy) and `danger` (sell) are reserved for market data and outcomes: never paint a brand element green, and never paint a price move with `primary`. A positive delta or a correct answer is `success`. **WAIT has its own blue-grey `wait` token**, deliberately not a neutral grey, so it reads as a real answer rather than "didn't answer". `warning` is also amber and marks mid-tier scores and XP. `inset` is the deep well behind charts, meter tracks and popovers.

To change a color globally, edit the token in `:root`, not the call sites. Even gradients must go through the tokens (`color-mix(in srgb, var(--primary) 32%, transparent)`), never through raw `oklch()` or hex.

Type is three families loaded via `next/font` in `app/layout.tsx`: **Bricolage Grotesque** for headings (`font-display`, and `h1`–`h3` by default), **Plus Jakarta Sans** for body text (`font-sans`), and **JetBrains Mono** for numbers (`font-mono`, which also turns on `tabular-nums` so prices and percentages line up).

Buttons use the `btn` utility defined in `globals.css`. It draws a solid 4px bottom edge that sinks on press; the minimum height is 52px, or 56px on mobile. Modifiers are `btn-ghost` (secondary), `btn-sm` (nav, 44px) and `btn-lg` (hero). They work on both `<button>` and `<Link>`. The modifiers only set custom properties, so they never fight `btn` over utility order. Don't hand-roll `bg-primary text-primary-foreground` CTAs. `eyebrow` is the amber uppercase section label.

Radii: 8, 12 for controls (`rounded-xl` / `rounded-lg`), and 18 for cards (`rounded-2xl` is overridden to 18px), plus full.

**No emoji anywhere in the UI.** The mascot is `components/rex-mascot.tsx`: `<Rex>` is the SVG (colored from `--primary` and the `--rex-*` tokens), and `<RexMascot>` is the large decorative corner figure. Rex has four moods and should react to results rather than sit there as a static logo: `neutral` for chrome and idle screens, `happy` for a good score, `grimace` for a risky or wrong call, and `thinking` while an answer or an evaluation is pending.

### Motion

All motion is CSS plus React's built-in `<ViewTransition>`, with no animation library. It lives in `app/globals.css`, so extend that rather than adding one-off keyframes.

- **Curves:** `ease-out-expo` (arrivals), `ease-out-quart` (hovers, small moves), `ease-in-quick` (exits). Bare `transition-*` utilities default to 200ms on the quart curve via `--default-transition-*`. Animate `transform`/`translate` and `opacity`; avoid animating `width`, `height` or `top` (the progress bar uses `scaleX`, not `width`).
- **Classes:**
  - `enter`: fade-up on mount, staggered with `--enter-delay`
  - `reveal`: scroll-driven fade-up on the compositor, behind `@supports`
  - `presence` + `data-open`: menus that animate out as well as in. Keep them mounted; closing flips `display` at the end.
  - `pop`: dropdown grow-in
  - `expand` + `data-open`: the "show more" height reveal used by `Disclosure`
  - `icon-swap`: a keyed icon that turns in
  - `candle-reveal`: the chart's staggered reveal, via `CandlestickChart`'s `revealFrom`
- **Always-mounted panels take up zero height, not zero space.** A parent with `gap` still reserves a slot for a closed `Disclosure`, so use margins around one (see `ai-evaluation`).
- **Page transitions:** `<PageTransition>` (`components/page-transition.tsx`) wraps `{children}` in each group layout and on the landing page. It is keyed by pathname, so a query-string change (dashboard filters) doesn't animate. The sidebar and headers carry `viewTransitionName` (`app-sidebar`, `app-header`, `site-header`) and stay pinned.
- **Game transitions:**
  - `<ViewTransition>` only animates React transitions, which is why the game's `submit`/`next`/`reset` run inside `startTransition`. Without it, the chart jumps.
  - `ViewTransition` types come from `react/canary`, referenced in `react-canary.d.ts`.
  - A dev-console `InvalidStateError: Transition was aborted … Document hidden` just means a transition fired while the tab was in the background, which is harmless.
- **Reduced motion:** the `prefers-reduced-motion` block switches all of this off, including scroll-driven and view-transition animations. Keep new motion inside it.
- **Hover lifts** only apply on devices with a real hover. Tailwind v4's `hover:` already does this, and `btn` does it by hand. On touch, `:hover` sticks after a tap.

### Conventions

- **Server components by default.** These files carry `"use client"`: everything that reads player progress (`lib/progress/use-progress.ts`, most of `components/progress/`, `components/dashboard/dashboard-view.tsx`, `components/profile-card.tsx`), the four forms in `components/auth/` (they need `useActionState`) and their shared `form-parts.tsx` (the password show/hide toggle), `components/page-transition.tsx` (reads the pathname), `components/nav-links.tsx` (uses `usePathname`), `components/app-nav-mobile.tsx` (drawer state), `components/landing/marketing-nav.tsx`, `components/disclosure.tsx` and `components/select-menu.tsx` (the two shared interactive primitives), and `components/trading-game/trading-game.tsx` (the whole game loop; `app/(app)/trading-game/page.tsx` is a thin server page that sets the title and reads `?c=`). Note `components/sidebar.tsx` is a *server* component — it delegates the only hook it needs to `NavLinks`. The other `components/trading-game/*` parts carry no directive: they are pure and land in the client bundle only because the game component imports them. Add the directive only when a component genuinely needs hooks or handlers.
- **No dead controls.** Every `<button>` either does something or is not a button. Decorative product shots in `components/landing/showcase.tsx` use `<div>` for what look like buttons, and "show more" affordances use the shared `Disclosure` rather than linking nowhere.
- **Focus rings are global.** `app/globals.css` defines one `:focus-visible` outline for the whole app, so individual controls should *not* re-declare `focus-visible:outline-*` — only override it where the ring sits on a tinted surface (see the decision buttons' `outline-success` / `outline-danger` / `outline-wait`).
- **Icons** come from `lucide-react` exclusively. Never use an emoji as an icon; `SelectMenu`'s `prefix` takes a lucide element.
- **UI copy is Indonesian** (headings, descriptions, button labels), while code identifiers and types are English. Match this when adding user-facing strings.
- Conditional class names are composed with array `.join(" ")` — there is no `clsx`/`cn` helper.
- `components/card.tsx` is the shared surface primitive (`rounded-2xl border border-border bg-card p-[22px]`); prefer it over re-declaring that class string.
- Files use kebab-case; components are named exports (pages are default exports per App Router).
- No semicolons, double quotes.

### Images

`next.config.mjs` whitelists exactly one remote host for `next/image`: `hebbkx1anhila5yf.public.blob.vercel-storage.com` (Vercel Blob). Any new remote image domain must be added to `images.remotePatterns` or the build will reject it. There is no `public/` directory.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
