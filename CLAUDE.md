# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build
npm start        # serve the production build
npm run typecheck # tsc --noEmit, strict mode
npm run lint      # eslint . (flat config in eslint.config.mjs)
npm test          # vitest run: table-driven unit tests for pure logic (lib/**/*.test.ts)
```

- **Tests are vitest**, for pure logic only (`vitest.config.mts`, `@/` alias included). Components aren't tested. Money, Disiplin, fills and stage logic in `lib/demo/` must have table-driven tests. A module that imports `server-only` can't be imported by a test, so keep testable logic in plain files and the server-only parts thin.
- If `tsc` complains about `.next/dev/types/validator.ts` after adding a route or layout, the generated types are stale: run `npx next typegen`.
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

## Branches and deploys
- main = the live site (tryrex-iota.vercel.app). Vercel publishes every push to main automatically, about a minute later.
- For every new task, create a branch from main named feat/<short-name> and push it. Vercel gives it its own private preview link; tell me that link so I can check it.
- Only merge a feat branch into main after I've said it looks good, because merging into main publishes it.
- dev is no longer used. Don't push to it.

## Non-negotiables
1. Answer keys and future candles never reach the browser. Anything that decides a score, or shows what price does next, stays on the server until the player has committed.
2. Scores, XP and money are calculated on the server. Players can read their own rows; only server code writes them.
3. Scores come from process, never outcome. What price did next is shown afterwards, labelled as one sample, and never adds XP.
4. Chart overlays use the same priceToY() as the candles. Never position a line with hand-picked pixels.
5. Green and red mean market direction (BUY/SELL, profit/loss). The brand accent is amber. A green button that isn't BUY is wrong.
6. Never invent statistics, testimonials or user counts. If a real number isn't available, leave [ISI SUMBER + ANGKA RESMI] or wire it to a real query.
Known exception to rules 1–2: the Trading Game still grades in the browser and ships its candles there. A separate ticket moves it to the server.

## Architecture

Next.js 16 App Router + React 19, TypeScript strict, Tailwind CSS v4. The `@/*` path alias maps to the repo root (so `@/components/card` → `components/card.tsx`).

### UI shells

Routing splits into four surfaces:

- **`app/page.tsx`** — public landing page. Composes ~8 section components from `components/landing/` (hero, stats banner, feature rows, testimonials, footer…) in top-to-bottom order. No sidebar.
- **`app/(app)/`** — the authenticated-style product shell. Its `layout.tsx` wraps children in a fixed 64-unit `Sidebar` plus `lg:ml-64` main area, with `AppNavMobile` (a `lg:hidden` sticky bar + drawer) covering navigation below the `lg` breakpoint where the sidebar is hidden. Contains `dashboard`, `trading-game`, `ai-evaluation`, `belajar` (Belajar 101) and `pengaturan` (Settings) routes; `/akun` only redirects to `/pengaturan#profil`. The layout loads the signed-in user once (`getCurrentUser()`) and passes a `ProfileSummary` (name, username, avatar URL) down; guests see a sign-in prompt in `ProfileCard` instead.
- **`app/start/`**: the onboarding quiz (build spec ticket 1.12), full-screen with no shell, laid out as in the "Try-Rex Screens" PDF. See **Onboarding** below.
- **`app/(auth)/`**: `/login`, `/signup`, `/lupa-password` (request a reset email) and `/reset-password` (set the new password), as one centred card with no sidebar.
- **`app/(legal)/`**: `/privacy`, `/terms` and `/disclaimer`, using the landing nav and footer. They are **drafts**: `<Isi>` and `<Tinjau>` from `components/legal-doc.tsx` render the `[PERLU DIISI]` / `[PERLU DITINJAU]` markers that must be resolved (and the text legally reviewed) before launch.

Every page that reads the session is **dynamic** (server-rendered per request), which now includes `/` and everything under `app/(app)/`. `/dashboard` has no filters. Its server page resolves only the user's name and today's challenge; everything else is `DashboardView`, a client component reading the player's progress. `/ai-evaluation` takes `?c=<dataset id, e.g. eurusd-1>&a=<decision>&t=<seconds>` — the Trading Game handoff — and falls back to a representative example when the params are absent or invalid, so the page still stands alone. The fallback shows a banner that labels it as an example, so it never passes as the player's own result. `/trading-game` takes `?c=<dataset id>`: the round opens on that question at its level. The dashboard's "Mulai Tantangan" uses this to start the daily challenge. The game keeps a per-question `results` array, which drives the segmented progress bar and the end-of-round `RoundSummary`, and it can be played from the keyboard (B / S / W, Enter, N).

Page titles are short (`"Dashboard"`); the root layout's `title.template` appends `| TRY-REX`. `app/not-found.tsx` is the branded 404. `<html lang>` follows the chosen language (see **Languages** below).

Adding a product page means creating it under `app/(app)/` (it inherits the shell automatically) and registering it in the `navItems` array in `components/nav-items.ts` — the single source both nav surfaces read. `match: "prefix"` keeps an item highlighted on its sub-pages.

The desktop sidebar **collapses** to a 76px icon rail (`SidebarToggle`, a burger-style button in its header). Width lives in `--sidebar-w`, shared by `.sidebar` and `.app-main`'s margin. When collapsed, `.sb-full` parts hide, `.sb-mini` parts show, labels fold (`.sb-label`), and `[data-tip]` shows a hover label. The state is a display preference (below), so it survives reloads without a flash.

The shell's chrome is split into small shared pieces so the desktop and mobile surfaces cannot drift: `components/brand-mark.tsx` (logo lockup, `size="lg"` for the sidebar), `components/nav-links.tsx` (the link list; it owns the `usePathname` active-route highlight), and `components/profile-card.tsx` (the level/XP block). `Sidebar` and `AppNavMobile` are thin compositions of those three.

### Game data is real historical price data

The Trading Game runs on **real H4 forex candles**, not generated series. Three layers:

1. **`lib/game-data.ts` — GENERATED, do not hand-edit.** 39 datasets (8 pairs across `easy`/`medium`/`hard`), each `{ id, pair, level, timeframe, period, digits, candles }` with candles as `{t,o,h,l,c,v}` (`t` = unix seconds UTC). Regenerate with `node scripts/generate-game-data.mjs`, which reads `Game-data-main/src/data/pairs/**/*.js`.
2. **`lib/game-logic.ts`** — the game rules, ported to typed TS from `Game-data-main/src/utils/*`: `sliceGame` (30 history + 15 future), `outcomeOf` (their ±0.1% threshold), `detectSupportResistance` (swing points clustered, top 3 by touches), `trendSlope`, `xpForLevel` (their `EXP_TABLE`: 25/75/150), plus `pipSize`.
3. **`lib/mock-data.ts`** — despite the name, it now holds no fake content. It assembles `challenges` from the datasets via `buildChallenge`, plus `frameOf`, `scoreFor` and `tradePlanFor`. The old dashboard mocks (`aspectMetrics`, `recentActivities`, `recommendations`, `dataAsOf` …) were removed, so don't bring them back. Player stats come from `lib/progress/` (below).

**The correct answer is derived, never authored.** It is whatever price actually did over the 15 hidden candles. Every explanation is likewise computed from the candles: `buildChallenge` stores the numbers in `challenge.facts` (trend, slope in pips, detected level distances, position in range, real change %), and `challengeText(challenge, t, locale)` in `lib/challenge-text.ts` turns them into the situation, reasons, suggestion, feedback, period and time-axis labels in either language, so the prose can never contradict the chart. Do not hand-write per-dataset narrative.

**188 questions from 39 datasets.** Each dataset holds ~65 candles and a question needs 45, so `challenges` slides the window along in steps of `WINDOW_STRIDE` (5): starts 30, 35, 40, 45, 50. A dataset's first window keeps the bare dataset id (`eurusd-1`) so older attempts and links still resolve; later ones are `eurusd-1@35`. Each window's `period` comes from its own first candle. Across the windows the answers are far better balanced than the old 27/9/3 (easy 33/30/7, medium 36/33/6, hard 29/9/5). Never add synthetic or mirrored candles to grow the pool.

**Rounds: `lib/round.ts`.** `buildRound({ level, seed, seen, focusPairs, first })` deals 5 questions with a seeded PRNG (mulberry32). Rules, most important first: never two windows of one dataset in a round (never relaxed); at most 3 of one answer; unseen questions first (the game passes the last 150 attempt ids); onboarding focus pairs fill ~60%; no same pair back to back. Rules relax from the bottom when the pool can't satisfy them. The order is then chosen over all 120 permutations: never one answer three times running, fewest same-pair neighbours. A simulation of 15,000 rounds holds every rule; on easy a player gets 13 rounds (65 questions) before any repeat. The seed comes from `newSeed()` (`Math.random`), so call it only from effects and handlers: the game deals its first round after mount and the server renders `GameSkeleton`.

Everything rendered is deterministic so server and client agree — no `Math.random()` and no `Date.now()` in render paths (round seeds are drawn in effects and handlers only). Anything that needs the clock (today's date for streaks and the calendar, "2 menit lalu") reads it through `useToday()` / `useNow()` from `lib/progress/use-progress.ts`. Those return null on the server and on the first client render, so no date ever reaches server HTML. The game's elapsed timer starts at `0` in `useState` and only advances in a `useEffect`. The dashboard's daily challenge is picked by the Jakarta date in a *server* component, which never hydrates.

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
  - **Signed in:** Supabase `practice_attempts`. Only attempts are stored; XP and streak are rebuilt with `progressFromAttempts`, and XP adds the Disiplin XP of Akun Latihan trades (`demo_trades.xp`, booked by the server). Attempts appear at once and save in the background; a failed save waits in `tryrex:outbox:<userId>` and is resent on the next load. On load, any guest attempts on the device are imported into the account (idempotent) and cleared locally.
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
- `proxy.ts` (Next 16's name for middleware) calls `lib/supabase/middleware.ts`, which refreshes the session and holds the route rules: `/dashboard` and `/akun` need an account (guests go to `/login?next=…`), signed-in users are bounced off `/login` and `/signup`, and `/trading-game`, `/ai-evaluation` and `/start` stay open to guests.
- `lib/auth-actions.ts` holds the server actions (login, signup, reset request, new password, sign-out). `app/auth/callback/route.ts` turns email links into a session.
- `lib/auth-rules.ts` is pure and client-safe: `safeNext()` (only same-site paths starting with a single "/"; always run `next` through it), the Indonesian error messages, `MIN_PASSWORD`. `lib/auth.ts` is server-only (`getCurrentUser()`, `isSignedIn()`); never import it from a client component.
- **Profiles are created by the `handle_new_user` trigger, never by the client.** It also seeds the four competencies at 50. SQL: `docs/schema.sql`, then `supabase/migrations/*.sql` in filename order (`_accounts`, `_progress_sync`, `_lock_down_functions`, `_profile_customization`, the `_akun_latihan_*` three, `_profile_locale`, `_trading_pairs`, `_live_engine`). The build spec lives in `docs/build-spec.md`.
- **Revoke EXECUTE on every server-only function.** Postgres grants it to PUBLIC by default, and Supabase exposes each `public` function at `/rest/v1/rpc/<name>`. `apply_competency` and `touch_streak` were callable by anyone for any user until `_lock_down_functions`.
- `ProfileCard` shows the player's avatar, name and @username (linking to `/akun`) plus real level, XP and streak from `lib/progress` (guests included, as "Tamu"), so it is a client component.
- **Settings (`/pengaturan`)**: hash-driven tabs (`SettingsTabs`: `#tampilan`, `#profil`, `#keamanan`, `#latihan`). Tampilan works for guests; Profil and Keamanan show a sign-in card to guests. Profil: photo, display name, username. Keamanan: email, password. Latihan: the training plan, retake quiz, reset progress. Server actions live in `lib/profile-actions.ts`; pure rules (`USERNAME_RULE`, `initials`) in `lib/profile-rules.ts`.
  - **Username**: `^[a-z0-9_]{3,20}$`, enforced in the form, the action and a DB check, unique by index. The live availability check calls the `username_available()` RPC (definer, EXECUTE for `authenticated` only).
  - **Avatar**: the browser center-crops to 256px WebP and uploads straight to the public `avatars` bucket at `<uid>/avatar-<ts>.webp`; storage policies confine writes to the player's own folder. `profiles.avatar_path` stores that *path*, never a URL (a check keeps it inside the player's folder), and `getCurrentUser()` turns it into a public URL. `setAvatar()` deletes the previous file. `next.config.mjs` allows exactly the Supabase avatars path for `next/image`, derived from `NEXT_PUBLIC_SUPABASE_URL`. `components/avatar.tsx` falls back to initials.
  - **Email** changes go through `auth.updateUser` with a confirmation link back to `/auth/callback?next=/akun`. **Password** changes re-check the current password first.
  - `_profile_customization` is applied to the live project (username/avatar columns, `username_available`, the `avatars` bucket and its four policies). `getCurrentUser()` still reports `profileExtras: false` if it's ever missing (the username/avatar select fails, and it falls back to the original columns). The UI then disables those two fields and says why, instead of erroring.
- **Functions run in `icn1` (Seoul)** (`vercel.json` `regions`), next to the Supabase project in `ap-northeast-2`. From the default `iad1` each database call cost about 0.6 s, and an Akun Latihan action makes several in a row.
- The Supabase MCP server is configured at user scope (plain `https://mcp.supabase.com/mcp`). A project-scoped URL with `?project_ref=…&features=…` failed OAuth with "Resource must be a valid MCP endpoint", so pass the project id (`dfcnpbnnmgaspjodxete`) per call instead.

### Languages: Indonesian (default) and English

`next-intl` 4.4.0, pinned (later 4.x loads `@swc/core` in its plugin, whose install script npm's `allowScripts` blocks here), with `use-intl` pinned to match through `overrides`. **No locale in the URL**: `i18n/request.ts` reads the `NEXT_LOCALE` cookie and loads one JSON file per namespace from `messages/<locale>/` (the list is `NAMESPACES` in `lib/i18n/locale.ts`). Reading the cookie makes every page dynamic.

- **Switching**: `components/locale-switcher.tsx` (ID | EN: sidebar, mobile bar, landing nav, auth pages, Settings > Tampilan) calls `setLocale()` in `lib/i18n/actions.ts`, which writes the cookie and, when signed in, `profiles.locale`, then `router.refresh()`. Login copies `profiles.locale` back into the cookie; the email callback copies the guest's cookie into a new account.
- **Pure modules never build sentences.** They return facts or messages and take a `t` (`lib/i18n/translator.ts`: `T`, `Msg`/`msg`/`say`, `joinList`). Refusals from `lib/demo` planners and routes are `Msg`s, put into words by `errorJson()`/`respond()` in `lib/demo/route.ts`. Rex's comments are data (`RexComment`), worded by `rexCommentText()`. Tips are ids plus paragraph counts (`tips.<id>.*`). Server actions translate with `getTranslations`.
- **Catalogues**: every key exists in both languages with the same placeholders and tags; `lib/i18n/messages.test.ts` enforces it and parses every message as ICU. English counts use ICU plurals (`{n, plural, one {# day} other {# days}}`). Pass numbers, not pre-formatted strings, to plurals and `{x, number}`.
- **Kept in English in both**: BUY, SELL, WAIT, SL, TP, pip, lot, ATR, support, resistance, spread, and the feature names Trading Game, AI Evaluation, Disiplin, Stage.
- **Formatting**: dates and grouped numbers use `INTL_LOCALE` (id-ID / en-US); prices keep dot decimals in both. Chart month labels come from `lib/challenge-text.ts` (`timeLabel`, `periodLabel`), UTC.
- **Not translated yet**: lesson bodies in `lib/learn/content.ts` (titles and summaries are in `learn.lessons.*`; `bodyAvailableIn()` decides the "Not yet available in English" label) and the legal documents. Future content authored per language uses `LocalizedText` / `pickText()` (`lib/i18n/localized-text.ts`). Open questions for the owner live in `docs/i18n-review.md`.
- **LLM calls** (none yet): put `languageInstruction(locale)` from `lib/i18n/llm.ts` in the system prompt.
- In `next dev`, edits to `messages/*.json` can stay cached; restart the dev server if a change doesn't show.

### Display preferences (Settings > Tampilan)

Theme (`dark` default, `light`, `system`), reading font (`default`, `dyslexic` = OpenDyslexic self-hosted from `@fontsource/opendyslexic`, `readable` = Atkinson Hyperlegible), text size (`normal`/`large`/`xlarge` = 100/112.5/125% root size), motion (`system` or `reduce`), sidebar (`expanded`/`collapsed`). They belong to the **device**, not the account: localStorage `tryrex:prefs:v1`, applied as `data-theme`, `data-font`, `data-size`, `data-motion` and `data-sidebar` on `<html>`.

- `lib/preferences.ts` holds the types, `parsePrefs()`, `applyPrefs()` and `PREFS_BOOT`, an inline `<head>` script in `app/layout.tsx` that applies saved prefs before first paint (Next's "preventing flash" guide) and follows the OS live for `system`. `<html>` carries `suppressHydrationWarning` for this. `lib/use-preferences.ts` has `usePreferences()` / `setPreference()`.
- **Light theme**: `:root[data-theme="light"]` in `globals.css` redefines every token (deeper amber and market colours for contrast on white). Anything built on the tokens just works; don't hardcode colours. Shadows mix from `--shadow`. The only fixed colours are the theme preview swatches in `appearance-settings.tsx`, on purpose.
- **Fonts** swap by overriding `--font-jakarta` / `--font-bricolage` on `:root[data-font]`; mono stays. The extra fonts use `preload: false`, so they download only when chosen.
- **Motion "Kurangi"** mirrors the `prefers-reduced-motion` block under `:root[data-motion="reduce"]`. Add new looping animations to **both** blocks.

### Glossary: tap-to-explain terms

`lib/glossary.ts` holds ~44 entries (`slug`, `category`, `aliases` per language, optional `example` flag and `lesson`); the words are in the glossary catalogue (`entries.<slug>.term/short/example`). `splitTerms(text, locale, seen)` finds that language's aliases as whole words, longest first, linking each term once per `seen` set. Lesson bodies are Indonesian, so they are split with `"id"` even when the page is in English. `components/glossary/glossary-text.tsx`:

- `<GlossaryText text>` for one string, or `<GlossaryParts parts>` when a server component splits a whole article with one shared `seen` (see `LessonBlocks`).
- `<Term>` is a dotted-underline button (`.term`) opening a portal popover (`glass-card glass-strong`), placed by writing to the DOM in a layout effect and flipped above when there's no room. One is open at a time; Escape, an outside click and scrolling close it. It links to the lesson and to `/belajar/kamus#slug` (`.term-card:target` flashes).
- Used in the game's Situasi Market, `AnswerFeedback`, the evaluation `Explanation`, and every lesson. Definitions are draft copy: keep them definitional, never add statistics.

### Belajar 101 (`/belajar`)

**Mock content, pending sources.** `lib/learn/types.ts` defines `Track`, `Lesson`, `Block` (`p`, `heading`, `points`, `callout`, `diagram`, `chart`, `quiz`) and `Source` (`needed` with a note, or `added` with title/publisher/url/accessed). `lib/learn/content.ts` has 5 tracks and 15 lessons, all `draft: true`, each listing the sources it still needs. `DraftNote` and `SourceList` (`[PERLU SUMBER]` markers) show that on every page. Replace copy and add sources there; the UI needs no change.

- Pages: the hub `/belajar`, lessons `/belajar/[slug]` (`generateStaticParams`, previous/next, quiz, "Tandai selesai"), and the searchable Kamus at `/belajar/kamus`.
- `chart` blocks show **real game charts** picked by what they show (`chartFor(pick)` in `lib/learn/charts.ts`: uptrend, downtrend, sideways, levels), with fixed-height boxes. `diagram` blocks are aspect-ratio-safe SVGs in `components/learn/diagrams.tsx` (candle anatomy, trend shapes, risk-reward, leverage), coloured from tokens.
- Lesson completion is per device (`lib/learn/progress.ts`, localStorage `tryrex:learn:v1`). The counts on `/belajar` and the dashboard's `NextLesson` card are exactly those marks. Quizzes record nothing.
- Callouts: `tip` is blue-grey (`wait`) and `warning` is amber. Red and green stay reserved for price direction.

### Akun Latihan (`/akun-latihan`): virtual trading on historical data

On screen it is called **Akun Demo** (ID) / **Demo Account** (EN); the route, folders and code keep the internal name Akun Latihan. Signed-in players only. It opens after 3 Trading Game sessions. Virtual money, historical candles, no live prices, no payments, and **no broker names, links, referral codes or "buka akun real" prompts, ever**. Every screen carries the disclaimer (`demo.disclaimer`; the section layout renders it). It is built in phases on `feat/akun-latihan`: phase A is accounts, the required lesson and Rex tips; phase B is the trading screen (`/akun-latihan/trading`); phase C is the journal, the account dashboard, the Kalkulator page, running out and resetting (Rex's review, the risk lesson, Akun #n), Riwayat akun and graduation.

The tabs (`DemoTabs`): Akun (the dashboard, or the end-of-account flow), Trading, Jurnal (`?akun=<n>`), Riwayat, Kalkulator, Tips Rex, plus `/akun-latihan/lulus` once graduated.

- **Every number lives in `lib/demo/config.ts`**: balance, leverage, lots, costs ("perkiraan"), margin call and stop out, replay lengths, plan rules, lines, Disiplin limits, stages, the "akun habis" line, graduation, unlock and XP. Change values there, never at call sites.
- **Pure and tested** in `lib/demo/` (each has a table-driven `*.test.ts`):
  - `money.ts`: pip value, margin, pips, gross P/L, opening costs, swap, account figures, the "akun habis" line (`bustLine`, `isBust`). Rounds to cents with `roundMoney`, so the order panel's prediction equals what gets booked.
  - `instruments.ts`: pair specs and USD conversion (exact when USD is a side, `APPROX_USD_RATE` for crosses).
  - `orders.ts`: the order panel's calculator (`quoteOrder`) and the rules an order must pass (`orderProblems`). The panel and the server run the same functions.
  - `fills.ts`: one candle's effect (`stepBar`): swap per midnight crossed, gap fills at the open, SL before TP, stop out where the margin level reaches the limit (traced from the open), "segmen habis" at the last close, negative balance protection.
  - `disiplin.ts`: the five checks, SL widening, revenge detection (on the account's candle clock, across charts), score, rolling average, XP. Outcome is never an input.
  - `stages.ts`: stage progress and unlocks ("7/10 trade · Disiplin 76% (butuh 80%)"). Only counted trades (held at least 1 candle) count. Stage 3's progress leads to graduation (`graduationReached`: `GRADUATION.TRADES` counted Stage 3 trades, averaging `MIN_DISIPLIN` over the last `TRADES` of them).
  - `segments.ts`: cuts datasets into windows (`HISTORY_CANDLES` shown plus up to `MAX_FORWARD_CANDLES`) and picks the least-seen segment at the player's stage.
  - `actions.ts`: one planner per action (`planStep`, `planOrder`, `planClose`, `planModify`, `planStart`), from the loaded `TradingState` (`state.ts`) to exactly what the database function writes.
  - `view.ts`: `buildView()`, the only thing the browser receives. Candles stop at the cursor; the segment id never leaves the server.
  - `rex-comments.ts`: every rule Rex comments with, in one file: on a trade (revenge, SL widened, no SL or risk above the limit, a reason that contradicts the side, SL closer than the average candle, "ikut feeling", otherwise what went well) and in an account review (`reviewAdvice`). Process only; a test checks the words never judge the result.
  - `stats.ts`: the dashboard's numbers (`accountStats`: win rate, rolling Disiplin, average risk and reward:risk, % with SL, `maxDrawdown` from the ledger) and Rex's review of a finished account (`accountReview`: biggest loss, average risk, checks failed most often, revenge count).
  - `journal.ts`: a closed trade as a journal row (`journalRow`, with `commentsFor`) and as a `StatTrade`.
  - `calculator.ts`: the Kalkulator page (`profitCalc`; example prices from `CALCULATOR` and `APPROX_USD_RATE`, never a current price).
  - `state.ts` `accountBust()`: "akun habis" = nothing open and the balance below the stage's fixed line, `AKUN_HABIS` in config ($17 in every stage: the 0.01-lot margin of the most expensive pair at its highest price in the data, GBPUSD 1.62122, rounded up; `money.test.ts` recomputes it from the data). The dashboard and the Stage card show it in advance. The planners refuse a candle, an order or a new chart then (`BUST_REFUSAL`).
  - **A reset never wipes the record.** Stage progress, the Disiplin average (`DemoView.disiplin`, the dashboard's big number) and graduation count counted trades on every account the player has had (`TradingState.history` is per player). Per-account numbers are only the dashboard's other stats, Rex's review and the revenge window.
  - `access.ts` (the unlock: `practice_attempts` ÷ 5, counted on the server) and `lesson-math.ts` (both lessons' numbers; the risk lesson's `maxLotWithin` runs `quoteOrder`, so it can't teach a lot the risk check would fail).
- **Server-only**: `lib/supabase/admin.ts` (the service-role client, the only writer), `lib/demo/server.ts` and `lib/demo/trading.ts` (reads through the player's own session, so RLS applies; writes through the functions below), `lib/demo/candles.ts` (the only module that touches game candles), `lib/demo/lessons.ts` (both lessons' text plus their answer keys), `lib/demo/history.ts` (closed trades, the journal with candle times, ledger balances, trade counts), `lib/demo/accounts.ts` (`openAccount`, `closeAccount`) and `lib/demo/route.ts` (`authed()`: session plus JSON-only bodies; `respond()`).
- **Tables** (`supabase/migrations/*_akun_latihan_*.sql`): `demo_profile` (stage per player), `demo_accounts` (one active per player; `version`, `candles_played`), `demo_ledger` (every balance change with `balance_after`, ordered by `seq`), `demo_tips_seen`, `demo_sessions` (one active chart per account: segment id and cursor only), `demo_trades`, `demo_trade_changes` (every SL/TP move) and `demo_lines`. RLS gives SELECT on own rows only; there are no write policies. Rows reference their account, session or trade through `(…_id, user_id)`, so no row can point at another player's.
- **Writes** go through service-role-only functions: `demo_open_account` (refuses with `demo_lesson_due` until the risk lesson is passed), `demo_close_account` (phase C: `habis` or `reset`; ends the chart, sets `recovery_lesson_due` when habis), `demo_start_session`, `demo_open_trade`, `demo_settle` (a candle or a close: exits, swap, ledger, balance, end of segment, stage; it re-checks that every ledger row equals the previous balance plus its amount, or refuses with `demo_ledger_mismatch`) and `demo_modify_trade`. Each starts with `demo_claim`, which bumps the account's `version` and refuses (`demo_stale`) if it changed since the server read it, so a double tap can't act twice. Refusals come back with the current view so the screen catches up.
- **Routes** (`app/api/akun-latihan/*`, POST, JSON): `account` (`action`: `open`, the default; `close`, which the server allows only when the account is habis; `reset`), `lesson` (a right risk-lesson answer clears `recovery_lesson_due`), `tips`, and `trade/{session,step,order,close,modify,review,lines,note}`. The trade routes return the whole new `DemoView`. Money, prices and fills never come from the request. `note` is the journal's "Tambah catatan", stored in `review_note`; a review saved without a note keeps it.
- **Gate order** on `/akun-latihan`: signed in → tables exist (phase B's included) → access (sessions done, **or** an account already exists) → first account → intro lesson → the dashboard. Then the end of an account, in order: bust but still open (review, "Lanjut ke materi risiko" closes it as habis) → `recovery_lesson_due` (review plus the required risk lesson) → no active account (review plus "Buka Akun #n"; after a reset the lesson is optional). `/akun-latihan/trading` needs an active account. Jurnal, Riwayat, Kalkulator and Tips use `sectionState()`: unlocked with at least one account, active or not. The sidebar item shows the lock and "(n/3)" through `NavLinks`' `locks`.
- **Graduation** is recorded once in `demo_profile.graduated_at` by `lib/demo/trading.ts` after the settle that reaches it (the `graduated` event shows a card on the trading screen). The summary page uses the player's own numbers; the retail loss statistic stays `[ISI SUMBER + ANGKA RESMI]`, and there is no broker or "open an account" link.
- **The trading screen** (`components/akun-latihan/trading-screen.tsx`) posts each action and renders the view: `TradeChart` (the shared chart plus an overlay drawn with `priceToY()`: SL/TP/entry markers, entry and exit marks, the horizontal-line tool), replay controls (play sends one request at a time), BUY/SELL/WAIT, `OrderPanel` (calculator built in), `AccountPanel`, `OpenTrades`, `ClosedTrades` (Disiplin checks, Rex's comments and the never-scored self-review) and `StageCard`. When the view says `account.bust`, the controls give way to a card linking to Rex's review. On phones both columns dissolve (`contents`) and `order-*` interleaves them.
- **Rex tips** (`lib/demo/tips.ts`): `useTipQueue` in `rex-tip.tsx` shows each tip once, at the moment its handler triggers it (order panel opens, risk above the limit, no TP in Stage 2+, a revenge flag, a stop out, the first Disiplin result), and records it in `demo_tips_seen`. `FirstTradeGuide` walks the first trade until it has been reviewed.
- **XP**: each trade stores its Disiplin XP (`demo_trades.xp`); the progress store adds that to game XP, and `addServerXp` announces a gain as it happens.
- The Trading Game ships its candles to the browser (the known exception to rules 1–2). Akun Latihan code must never import `lib/game-data.ts` or `lib/mock-data.ts` into a client component; client code uses `lib/chart-geometry.ts` for the chart.

### Trading screen (`/akun-latihan/trading`): nine pairs, four timeframes, drawing tools

Built on the **"DATA FOR LIVE"** MT4 exports (9 pairs × M15/M30/H1/H4, ±2012-11 to 2022-03, broker clock, no header: `YYYY.MM.DD,HH:MM,o,h,l,c,v`). EURAUD and GBPCAD are cross rates computed from the real pairs (exact closes, approximate wicks); GBPNZD is labelled synthetic and couldn't be checked; the owner chose to use all three.

- **Data pipeline**: `node scripts/build-live-data.mjs "<DATA FOR LIVE>" live-data-out` checks that every M30/H1/H4 candle equals its M15 aggregate (all nine pairs match exactly), then packs **M15 only**, one gzipped chunk per pair and month, plus `manifest.json` (≈22 MB); `scripts/upload-live-data.mjs` puts them in the private Storage bucket `live-data` (service role only). `lib/live/store.ts` (server-only) reads them, or a local folder when `LIVE_DATA_DIR` is set. Every timeframe is built from M15 on the server (`lib/live/market.ts aggregate`).
- **The live clock** (`lib/live/clock.ts`): the chart runs on real time. data time = market time − `offset_weeks` × 7 days, market time = real UTC + `MARKET.UTC_OFFSET_HOURS` (2: the data's broker clock, so the week runs Monday 05:00 to Saturday ~04:45 WIB). Whole weeks keep weekdays aligned; a weekend or holiday in the data is simply a closed market. A new account's clock is a random week inside `CLEAN_RANGES` (complete in all pairs, clear of SNB Jan 2015, Brexit Jun 2016, Covid Feb–Apr 2020, Ukraine 2022), at least `LIVE.LEAD_WEEKS` in; Akun #n inherits the previous offset. At a range's end (always a Monday) the clock jumps to the next range at the weekend (`advanceClock`), wrapping after the last; drawings are cleared then. Labels and the countdown are in WIB (`MARKET.DISPLAY_UTC_OFFSET_HOURS`).
- **The clock is secret**: it lives in `demo_live_clock` (RLS on, no policies), never in `demo_accounts`, because an offset readable by the player would reveal the period. Live trades store **real** times only: `entry_index` / `exit_index` = real unix seconds, `opened_clock` / `closed_clock` = real M15 candles (`liveClock`).
- **No future**: the browser gets closed candles before "now" plus the forming candle as `{open, high/low so far, current price}` (`chartAt`), with times relative to the chart's `anchor` (real seconds) and `nowWeek`. The forming M15 candle follows a deterministic path (`lib/live/path.ts`, seeded by pair + candle time): open → extreme → extreme → close, inside [low, high].
- **Lazy replay, no cron** (`lib/live/replay.ts`, `lib/live/engine.ts syncLive`): every read of the account (trading page, the Akun dashboard, every poll and action) replays the M15 candles since `last_checked_at` against the open position, through `lib/demo/fills stepBar`: SL before TP in the same candle, gaps at the open, stop out, swap. A close is booked at the candle that hit it (`exit_index` = that candle's real time) via `demo_live_settle`. In the forming candle a level only counts once the path has reached it. The last candle before a gap of `MARKET.CLOSE_GAP_SECONDS` (weekend, holiday) closes the position at its close: `exit_reason = 'market_close'`, "ditutup otomatis (pasar tutup)". SL/TP moves take a checkpoint first, so a new level never applies to candles before it.
- **Orders** (`lib/live/execute.ts`): BUY and SELL only, SL and TP always required, **one open position** (also a unique index). The server sets the price: bid from the path at the moment the order arrives, BUY at bid + `COSTS.SPREAD_PIPS` (the ask), SELL at the bid; positions close on the other side. The spread is in the price, so the quote passes `spreadInPrice` and books no separate spread cost. `parseOrderBody` refuses any body field beyond the plan. GBPNZD's spread (3.5 pips) and NZD→USD rate (0.70, the median of GBPUSD ÷ GBPNZD in the data) are owner-approved estimates.
- **Polling**: the screen POSTs `/api/akun-latihan/chart` every `LIVE.POLL_MS` (10 s) while the tab is visible, and when the countdown ends. Disiplin on the live chart: revenge window `LIVE.REVENGE_WINDOW_M15` (48 M15 = 12 h); a trade counts once held across one M15 candle.
- **Drawings** (`lib/live/drawings.ts`, `components/akun-latihan/live-chart.tsx`): position (buy/sell with SL, TP, RR), trendline, rectangle, horizontal line, path. Points are (time, price), placed with `timeToIndex`/`indexToTime`, so they stay put across timeframes. Stored per account and pair in `demo_drawings` with absolute data times (RLS on, no policies). The desk keeps them relative to the anchor they were loaded with and shifts them for display. Never scored, never advise.
- The chart draws at real pixel size with one scale (`lib/live/geometry.ts makeScale`) for candles, drawings and the open position's entry/SL/TP lines.
- **Zoom and pan** (`lib/live/geometry.ts` `ChartView`, `clampView`, `zoomView`, `panView`, tested in `geometry.test.ts`): the scale's window moves (`makeScale(..., offset)`), nothing else, so candles, drawings and position lines stay together. Wheel zooms around the cursor (a native non-passive listener, so the page doesn't scroll), a horizontal trackpad swipe pans, two fingers pinch, dragging empty chart in Select mode pans, `+`/`−` keys and the bottom-right buttons zoom, "Ke harga terkini" shows while looking at older candles. Between `CHART.MIN_VISIBLE` (20) and `CHART.BARS` (240, what the server sends); opens at `CHART.DEFAULT_VISIBLE` (120). `offset: null` follows the latest candle; a held place in history stays put through polls. Empty slots on the right scale with the zoom (`rightSlots`, a tenth, 2 to `CHART.RIGHT_SLOTS`). The price axis fits the visible candles; the view resets when the pair or timeframe changes.
- Tutorial video slot: `TUTORIAL_VIDEO` in `lib/live/config.ts` (`src: null` until the video exists); watched is stored in `demo_tips_seen` as `tools-video`.
- The replay routes (`trade/session`, `trade/step`) are gone; `order`, `close` and `modify` run on the live engine. Before the `_live_engine` migration the trading page shows the not-ready card and the Akun dashboard falls back to the replay view.
- Migrations: `_trading_pairs` (`demo_accounts.last_pair/last_timeframe`, `demo_drawings`, the `live-data` bucket) and `_live_engine` (`demo_live_clock`, nullable `demo_trades.session_id`, `market_close`, one open trade per account, `demo_live_open`, `demo_live_settle`).

### Onboarding: `/start`

Five questions (`lib/onboarding.ts` `QUESTIONS`): why trading (question 1 is verbatim from the design PDF), experience, chart skill, focus pairs, daily time. **No answer is wrong**: every option is a preference or a self-assessment, never a test. `planFrom(record)` turns answers into a `Plan`: experience + skill (0–6) picks the starting level (≤2 Mudah, ≤4 Menengah, else Sulit), focus picks `focusPairs` for the shuffle, time sets `dailyGoal` (5/15/30 or none), and motivation picks Rex's line (`onboarding.motivationLines.<value>`). "Lewati" stores `skipped: true` and the defaults apply.

- **Storage**: an `OnboardingRecord` (`version`, `answers`, `skipped`, `completedAt`) goes in `profiles.onboarding` (existing jsonb, size-capped) for accounts, and always in localStorage `tryrex:onboarding:v1`. `parseRecord()` validates both ways, so only known question/option keys are ever stored. Guest answers are copied to the account on the first visit to `/start` after signing up.
- **Gate**: `/dashboard` and `/trading-game` redirect signed-in players without a record to `/start?next=…` on the server; the game sends guests there from the browser (`useOnboarding()` reads the device via `useSyncExternalStore`). `/start?ulang=1` retakes the quiz.
- **Flow**: questions, then (accounts) a profile step with photo, name and username, then the plan. The starting step is decided once on mount, so the `router.refresh()` after a photo upload can't bounce the player. Keys 1–4 pick, Enter continues.
- **Where the answers show up**: the game's starting level and focus (named under its title), `DailyGoal` on the dashboard (today's answers against the chosen target), `FirstSessionHero`'s line, and the plan card on `/akun`.

### Charts are hand-rolled SVG

There is no charting library. `components/candlestick-chart.tsx`, `components/donut.tsx`, and `components/sparkline.tsx` emit raw SVG.

`CandlestickChart` is a pure, fully prop-driven server component with a fixed `1000×460` viewBox (its geometry, `priceToY()`/`yToPrice()` and `frameOf` live in `lib/chart-geometry.ts`, which carries no data) and `preserveAspectRatio="none"` (it stretches to its container). It performs **no autoscaling** — the caller must supply `min`, `max`, `priceTicks`, and `timeLabels` that agree with the data, or candles will clip. **Do not hand-tune those three:** call `frameOf(candles, extraPrices?)` (from `lib/chart-geometry.ts`, re-exported by `lib/mock-data.ts`), which derives a frame guaranteed to contain the highs, lows and zones, and snaps ticks to a round step. Its step selection is scale-free, so it works for both 1.08-scale majors and 85-scale JPY crosses. Pass `digits` too (5 for majors, 3 for JPY crosses — each dataset carries its own); the chart renders axis ticks one decimal shorter than markers, per FX convention. Optional overlays: `zones` (support/resistance bands), `markers` (labeled horizontal price lines for entry/SL/TP — build these with `tradePlanFor`), `currentPrice` (right-edge badge), `overlay` (extra SVG in the same viewBox, positioned with `priceToY()`, never hand-picked pixels) and `dividerAt` (a dashed ENTRY line before that candle index, with the candles after it on a lifted backdrop: pass `challenge.candles.length` whenever the future is shown). The chart box must have a **fixed height**. With `preserveAspectRatio="none"`, a box that grows with its grid row stretches the axis text too. See `app/(app)/ai-evaluation/page.tsx` for the fullest usage.

The `Candle`, `Zone` and `Marker` types live in `lib/chart-geometry.ts` (re-exported by `lib/mock-data.ts`), not in the chart, so data helpers can construct them.

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

- **Curves:** `ease-out-expo` (arrivals), `ease-out-quart` (hovers, small moves), `ease-in-quick` (exits), `ease-spring` (a `linear()` spring with ~2% overshoot: buttons, cards, the quiz) and `ease-bounce` (small pops). Bare `transition-*` utilities default to 200ms on the quart curve via `--default-transition-*`. Animate `transform`/`translate` and `opacity`; avoid animating `width`, `height` or `top` (the progress bar uses `scaleX`, not `width`).
- **Classes:**
  - `enter`: fade-up on mount, staggered with `--enter-delay`
  - `reveal`: scroll-driven fade-up on the compositor, behind `@supports`
  - `presence` + `data-open`: menus that animate out as well as in. Keep them mounted; closing flips `display` at the end.
  - `pop`: dropdown grow-in
  - `expand` + `data-open`: the "show more" height reveal used by `Disclosure`
  - `icon-swap`: a keyed icon that turns in
  - `candle-reveal`: the chart's staggered reveal, via `CandlestickChart`'s `revealFrom`
  - `enter-focus`: blur-to-sharp rise, for headlines and the hero shot
  - `reveal-tilt`: scroll-scrubbed 3D tilt-up for product shots (the feature-row panels)
  - `step-forward` / `step-back`: direction-aware quiz steps
  - `option`, `radio-dot` + `is-on`: spring lift on answer cards, and a radio centre that springs in
  - `pop-in`, `float` (Rex idling), `lift` (link cards), `aurora` (drifting light behind the hero; its box must stay within its section or the page scrolls sideways)
  - `confetti` via `components/confetti.tsx` (golden-ratio spread, no randomness; a good round, level-up, a right quiz answer), `flicker` (lit streak flame, combo chip), `shimmer` (a light sweep), `spotlight` (a cursor-following glow on cards, fed by the single `SpotlightRoot` listener in the root layout)
  - In the game: `QuestionProgress` shows a combo chip after 2+ right answers in a row, and `AnswerFeedback` has Rex reacting
- **Glass** is for chrome and floating panels only (`glass-bar` top bars, `glass-rail` side rails, `glass-card` floating panels, profile card and mockups, `glass` overlays). Anything floating over text (popovers, menus, toasts, sticky tab and search bars) adds `glass-strong`, a near-opaque tint that stays readable. Chart screens stay solid. A fixed amber glow on `body::before` gives the glass something to blur, which is why the page colour sits on `<html>` and not `<body>`. `prefers-reduced-transparency` swaps every glass surface for solid `--card`.
- **Always-mounted panels take up zero height, not zero space.** A parent with `gap` still reserves a slot for a closed `Disclosure`, so use margins around one (see `ai-evaluation`).
- **Page transitions:** `<PageTransition>` (`components/page-transition.tsx`) wraps `{children}` in each group layout and on the landing page. It is keyed by pathname, so a query-string change (dashboard filters) doesn't animate. The sidebar and headers carry `viewTransitionName` (`app-sidebar`, `app-header`, `site-header`) and stay pinned.
- **Game transitions:**
  - `<ViewTransition>` only animates React transitions, which is why the game's `submit`/`next`/`reset` run inside `startTransition`. Without it, the chart jumps.
  - `ViewTransition` types come from `react/canary`, referenced in `react-canary.d.ts`.
  - A dev-console `InvalidStateError: Transition was aborted … Document hidden` just means a transition fired while the tab was in the background, which is harmless.
- **Reduced motion:** the `prefers-reduced-motion` block switches all of this off, including scroll-driven, looping (`float`, `aurora`) and view-transition animations. Keep new motion inside it.
- **Hover lifts** only apply on devices with a real hover. Tailwind v4's `hover:` already does this, and `btn` does it by hand. On touch, `:hover` sticks after a tap.

### Conventions

- **Server components by default.** These files carry `"use client"`: everything that reads player progress (`lib/progress/use-progress.ts`, most of `components/progress/`, `components/dashboard/dashboard-view.tsx`, `components/profile-card.tsx`), the four forms in `components/auth/` (they need `useActionState`) and their shared `form-parts.tsx` (the password show/hide toggle), `components/account/*` and `components/onboarding/onboarding-flow.tsx`, `lib/use-onboarding.ts`, the settings panels (`components/settings/*`), `components/sidebar-toggle.tsx`, `components/spotlight-root.tsx`, the glossary (`components/glossary/glossary-text.tsx`), the interactive Belajar pieces (`quiz`, `lesson-done`, `glossary-browser`, `next-lesson` in `components/learn/`), `lib/use-preferences.ts`, `lib/learn/progress.ts`, `components/page-transition.tsx` (reads the pathname), `components/nav-links.tsx` (uses `usePathname`), `components/app-nav-mobile.tsx` (drawer state), `components/landing/marketing-nav.tsx`, `components/disclosure.tsx` and `components/select-menu.tsx` (the two shared interactive primitives), and `components/trading-game/trading-game.tsx` (the whole game loop; `app/(app)/trading-game/page.tsx` is a thin server page that sets the title and reads `?c=`). Note `components/sidebar.tsx` is a *server* component — it delegates the only hook it needs to `NavLinks`. The other `components/trading-game/*` parts carry no directive: they are pure and land in the client bundle only because the game component imports them. Add the directive only when a component genuinely needs hooks or handlers.
- **No dead controls.** Every `<button>` either does something or is not a button. Decorative product shots in `components/landing/showcase.tsx` use `<div>` for what look like buttons, and "show more" affordances use the shared `Disclosure` rather than linking nowhere.
- **Focus rings are global.** `app/globals.css` defines one `:focus-visible` outline for the whole app, so individual controls should *not* re-declare `focus-visible:outline-*` — only override it where the ring sits on a tinted surface (see the decision buttons' `outline-success` / `outline-danger` / `outline-wait`).
- **Icons** come from `lucide-react` exclusively. Never use an emoji as an icon; `SelectMenu`'s `prefix` takes a lucide element.
- **UI copy goes through the message catalogues** (`messages/id` and `messages/en`), never into components. Indonesian is the default and the source; code identifiers and types are English. See **Languages**.
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
