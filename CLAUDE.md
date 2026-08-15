# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build
npm start        # serve the production build
npx tsc --noEmit # typecheck (strict mode)
```

- **No test suite exists** — no test runner, config, or test files. If asked to add tests, pick a framework and say so explicitly.
- **`npm run lint` does not work.** `package.json` declares `"lint": "next lint"`, but neither `eslint` nor `eslint-config-next` is installed and there is no eslint config file. Use `npx tsc --noEmit` as the real static check.

### Windows path bug: this checkout lives under a path containing `&`

This machine's checkout path is `C:\Users\A&J\...`. The unescaped `&` breaks every Windows `.cmd` shim npm generates, so **`npm run dev`/`build`/`start` and any `npx <bin>` command fail** with a mangled-path `MODULE_NOT_FOUND` error, in both PowerShell and Git Bash (confirmed by reproduction). This hits any terminal, including VS Code's integrated terminal — it is not a shell-specific issue.

Workaround: invoke the local binary's JS entry point through `node` directly, which bypasses the broken shim entirely:

```bash
node node_modules/next/dist/bin/next dev
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next start
node node_modules/typescript/bin/tsc --noEmit
```

Use these instead of the `npm run`/`npx` forms above whenever a command mysteriously fails with `'...' is not recognized as an internal or external command` or `Cannot find module`. This is a property of the checkout path on this machine, not the code — if the project is ever moved to a path without special characters, the normal `npm run`/`npx` commands will work again.

## Architecture

Next.js 16 App Router + React 19, TypeScript strict, Tailwind CSS v4. The `@/*` path alias maps to the repo root (so `@/components/card` → `components/card.tsx`).

### Two distinct UI shells

Routing splits into a marketing surface and an app surface:

- **`app/page.tsx`** — public landing page. Composes ~8 section components from `components/landing/` (hero, stats banner, feature rows, testimonials, footer…) in top-to-bottom order. No sidebar.
- **`app/(app)/`** — the authenticated-style product shell. Its `layout.tsx` wraps children in a fixed 64-unit `Sidebar` plus `lg:ml-64` main area. Contains `dashboard`, `trading-game`, and `ai-evaluation` routes.

Adding a product page means creating it under `app/(app)/` (it inherits the sidebar automatically) and registering it in the `navItems` array in `components/sidebar.tsx`.

### Everything is static mock data

`lib/mock-data.ts` is the single data source for the entire app. It contains a seeded LCG (`buildSeries`) that generates **deterministic** OHLC candle series at module load, plus hardcoded `aspectMetrics` and `recentActivities` arrays. There is no backend, no API routes, no database, and no auth.

The candle series are deterministic by design so charts render identically across server and client — do not replace the seeded `rand()` with `Math.random()`, and do not introduce `Date.now()` into render paths, or you'll cause hydration mismatches.

**The README is aspirational, not descriptive.** It documents Firebase Auth, Firestore collections, a `.env.local` with `NEXT_PUBLIC_FIREBASE_*` keys, and a `src/` directory structure. None of that exists in the code. Trust the code over the README.

### Charts are hand-rolled SVG

There is no charting library. `components/candlestick-chart.tsx`, `components/donut.tsx`, and `components/sparkline.tsx` emit raw SVG.

`CandlestickChart` is a pure, fully prop-driven server component with a fixed `1000×460` viewBox and `preserveAspectRatio="none"` (it stretches to its container). It performs **no autoscaling** — the caller must supply `min`, `max`, `priceTicks`, and `timeLabels` that agree with the data, or candles will clip. Optional overlays: `zones` (support/resistance bands), `markers` (labeled horizontal price lines for entry/SL/TP), and `currentPrice` (right-edge badge). See `app/(app)/ai-evaluation/page.tsx` for the fullest usage.

SVG fills and strokes reference CSS custom properties directly (`fill="var(--danger)"`), so charts inherit the theme rather than hardcoding hex values. Keep this pattern.

### Styling: Tailwind v4, CSS-first

**There is no `tailwind.config.js`** — v4 configuration lives entirely in `app/globals.css` via an `@theme inline` block. PostCSS uses only `@tailwindcss/postcss`.

The palette is defined as semantic OKLCH tokens on `:root` and exposed to Tailwind as utility colors: `background`, `foreground`, `card`, `muted`, `muted-foreground`, `border`, `primary`, `success`, `danger`, `warning`. Use these utilities (`bg-card`, `text-muted-foreground`, `border-border`) rather than raw Tailwind palette colors like `bg-gray-800` — the design is a single dark theme with a green brand tint, and hardcoded colors break it. There is no light mode.

To change a color globally, edit the token in `:root`, not the call sites.

### Conventions

- **Server components by default.** Only three files carry `"use client"`: `components/sidebar.tsx` (uses `usePathname`), `components/landing/marketing-nav.tsx`, and `app/(app)/trading-game/page.tsx` (holds buy/sell/wait selection state). Add the directive only when a component genuinely needs hooks or handlers.
- **Icons** come from `lucide-react` exclusively.
- **UI copy is Indonesian** (headings, descriptions, button labels), while code identifiers and types are English. Match this when adding user-facing strings.
- Conditional class names are composed with array `.join(" ")` — there is no `clsx`/`cn` helper.
- `components/card.tsx` is the shared surface primitive (`rounded-xl border border-border bg-card p-5`); prefer it over re-declaring that class string.
- Files use kebab-case; components are named exports (pages are default exports per App Router).
- No semicolons, double quotes.

### Images

`next.config.mjs` whitelists exactly one remote host for `next/image`: `hebbkx1anhila5yf.public.blob.vercel-storage.com` (Vercel Blob). Any new remote image domain must be added to `images.remotePatterns` or the build will reject it. There is no `public/` directory.
