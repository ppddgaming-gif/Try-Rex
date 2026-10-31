import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Lightbulb,
  ListChecks,
  Lock,
  LockOpen,
  Pause,
  PenLine,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { CandlestickChart } from "@/components/candlestick-chart"
import { RexArt } from "@/components/rex-mascot"
import { challengeText } from "@/lib/challenge-text"
import { candleX, priceToY } from "@/lib/chart-geometry"
import { DISIPLIN } from "@/lib/demo/config"
import { CHECK_IDS } from "@/lib/demo/disiplin"
import type { Locale } from "@/lib/i18n/locale"
import { chartFor } from "@/lib/learn/charts"
import { LEVELS } from "@/lib/learn/content"
import { EXAM } from "@/lib/learn/exam/engine"
import { challenges, decisionLabels, frameOf, type Challenge } from "@/lib/mock-data"

// Product shots for the landing page. Each one is built from the app's own
// data and code (real candles, computed explanations, the real levels and
// checks), so the pictures can't promise anything the app doesn't do.

/**
 * Soft amber glow panel that hosts app UI mockups. Built from the brand
 * tokens: green would read as a market signal, which the brand never is.
 */
export function GlowPanel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border/60 p-6 sm:p-10 ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(120% 120% at 20% 10%, color-mix(in srgb, var(--primary) 34%, transparent) 0%, color-mix(in srgb, var(--primary-dim) 26%, transparent) 38%, color-mix(in srgb, var(--card) 90%, transparent) 78%)",
      }}
    >
      <div className="relative flex items-center justify-center">{children}</div>
    </div>
  )
}

/** Pair, timeframe and period pills, as the game shows them. */
function ChallengeTags({ challenge, period }: { challenge: Challenge; period: string }) {
  return (
    <>
      <span className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-semibold">{challenge.pair}</span>
      <span className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-semibold">
        {challenge.timeframe}
      </span>
      <span className="hidden rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground sm:inline">
        {period}
      </span>
    </>
  )
}

// Subtitles: game.decisions.<id>, the same words as the game's buttons.
const decisionTiles = [
  { id: "buy", label: "BUY", icon: ArrowUpRight, tone: "text-success" },
  { id: "sell", label: "SELL", icon: ArrowDownRight, tone: "text-danger" },
  { id: "wait", label: "WAIT", icon: Pause, tone: "text-wait" },
] as const

/** A question's words in the reader's language (lib/challenge-text.ts). */
function useChallengeText(challenge: Challenge) {
  const tc = useTranslations("game.challenge")
  return challengeText(challenge, tc, useLocale() as Locale)
}

/** The question the reveal and AI Explanation mockups share: a real SELL answer. */
const showcaseChallenge = () => challenges.find((c) => c.answer === "sell") ?? challenges[1]

/**
 * Hero product shot: a real question from the game, with Rex quoting that
 * question's own computed situation, so the picture and the words agree.
 * Decorative: the "buttons" are divs.
 */
export function HeroShowcase() {
  const challenge = challenges[0]
  const frame = frameOf(challenge.candles)
  const text = useChallengeText(challenge)
  const t = useTranslations("landing.showcase")
  const td = useTranslations("game.decisions")

  return (
    <div className="flex w-full max-w-5xl flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
      <div className="glass-card min-w-0 rounded-2xl p-4 sm:p-5 lg:flex-1">
        <div className="flex items-center gap-2">
          <ChallengeTags challenge={challenge} period={text.period} />
          <span className="ml-auto font-mono text-xs text-muted-foreground">{t("question")}</span>
        </div>
        <div className="mt-3 h-[190px] sm:h-[300px]">
          <CandlestickChart
            candles={challenge.candles}
            min={frame.min}
            max={frame.max}
            priceTicks={frame.priceTicks}
            timeLabels={text.timeLabels}
            zones={challenge.zones}
            currentPrice={challenge.currentPrice}
            digits={challenge.digits}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {decisionTiles.map((d) => (
            <div
              key={d.label}
              className={`flex flex-col items-center rounded-xl border border-border bg-inset py-2.5 font-display text-base font-extrabold ${d.tone}`}
            >
              {d.label}
              <span className="font-sans text-[10px] font-medium text-muted-foreground">{td(d.id)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rex reads the chart out loud: under it on phones, beside it from lg. */}
      <div className="glass-card flex items-start gap-3 rounded-2xl p-4 text-left lg:mt-12 lg:w-64 lg:flex-col">
        <RexArt size={44} mood="thinking" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">{t("situation")}</span>
          {text.situation} {t("pick")}
        </p>
      </div>
    </div>
  )
}

/** Mockup: Belajar 101's levels as a new player sees them: Level 1 open, the rest behind the exam before them. */
export function LevelsMockup() {
  const t = useTranslations("landing.showcase")
  const locale = useLocale() as Locale
  return (
    <div className="glass-card w-full max-w-md rounded-2xl p-4 sm:p-5">
      <ol className="flex flex-col gap-2">
        {LEVELS.map((level) => {
          const open = level.id === 1
          return (
            <li key={level.id} className="flex items-center gap-3 rounded-xl border border-border bg-inset px-3 py-2.5">
              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold",
                  open ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {level.id}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${open ? "" : "text-muted-foreground"}`}>{level.title[locale]}</p>
                <p className="font-mono text-[11px] text-faint">{t("levelLessons", { n: level.lessons.length })}</p>
              </div>
              {open ? (
                <LockOpen className="h-4 w-4 shrink-0 text-primary" aria-label={t("open")} />
              ) : (
                <Lock className="h-4 w-4 shrink-0 text-faint" aria-label={t("locked")} />
              )}
            </li>
          )
        })}
      </ol>
      <p className="mt-3 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
        <PenLine className="h-3.5 w-3.5" aria-hidden="true" /> {t("examChip", { q: EXAM.QUESTIONS, pass: EXAM.PASS })}
      </p>
    </div>
  )
}

/** Mockup: the reveal after answering. A real question with its hidden candles shown, and the answer they decided. */
export function RevealMockup() {
  const challenge = showcaseChallenge()
  const candles = [...challenge.candles, ...challenge.future]
  const frame = frameOf(candles)
  const up = challenge.changePercent > 0
  const text = useChallengeText(challenge)
  const t = useTranslations("landing.showcase")

  return (
    <div className="glass-card w-full max-w-md rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <ChallengeTags challenge={challenge} period={text.period} />
        <span
          className={`ml-auto rounded-md px-2 py-1 font-mono text-[11px] font-bold ${up ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}
        >
          {up ? "+" : ""}
          {challenge.changePercent.toFixed(2)}%
        </span>
      </div>
      <div className="mt-3 h-[180px]">
        <CandlestickChart
          candles={candles}
          min={frame.min}
          max={frame.max}
          priceTicks={[]}
          timeLabels={[]}
          zones={challenge.zones}
          digits={challenge.digits}
          dividerAt={challenge.candles.length}
        />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-xs">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
        <span className="text-muted-foreground">
          {t.rich("rightAnswer", {
            answer: decisionLabels[challenge.answer],
            b: (c) => <span className="font-bold text-foreground">{c}</span>,
          })}
        </span>
      </div>
    </div>
  )
}

/**
 * Mockup: the AI Explanation of the same question as RevealMockup, worded by
 * the game's own challengeText, so the reasons match that chart.
 */
export function ExplanationMockup() {
  const challenge = showcaseChallenge()
  const text = useChallengeText(challenge)
  const t = useTranslations("game.explanation")
  return (
    <div className="glass-card w-full max-w-md rounded-2xl p-4 sm:p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <BrainCircuit className="h-4 w-4 text-primary" aria-hidden="true" /> {t("title")}
      </p>
      <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
        <p className="text-xs font-semibold">
          <span className="text-success">{decisionLabels[challenge.answer]}</span> {t("rightBecause")}
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {text.reasons.slice(0, 3).map((r) => (
            <li key={r} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 rounded-xl border border-primary/30 bg-primary/10 p-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" /> {t("suggestion")}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">{text.suggestion}</p>
      </div>
    </div>
  )
}

/**
 * Mockup: Akun Demo. A real H4 chart with EMA 20 and EMA 50 (the trading
 * screen's own indicator code, via chartFor), and the Disiplin checks every
 * trade is scored on: rules, not results.
 */
export function DemoMockup() {
  const chart = chartFor("ema")
  const panel = chart.panels[0]
  const n = panel.candles.length
  const frame = frameOf(panel.candles, (chart.lines ?? []).flatMap((l) => l.values.filter((v): v is number => v !== null)))
  const t = useTranslations("landing.showcase")
  const tc = useTranslations("demo.checks")
  const overlay = (
    <g>
      {chart.lines?.map((line) => (
        <polyline
          key={line.id}
          points={line.values
            .map((v, i) => (v === null ? null : `${candleX(i, n).toFixed(1)},${priceToY(v, frame.min, frame.max).toFixed(1)}`))
            .filter(Boolean)
            .join(" ")}
          fill="none"
          stroke={`var(--ind-${line.id})`}
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  )
  return (
    <div className="glass-card w-full max-w-md rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-semibold">
          {chart.pair.slice(0, 3)}/{chart.pair.slice(3)}
        </span>
        <span className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-semibold">{chart.timeframe}</span>
        <span className="ml-auto flex gap-3 font-mono text-[11px]">
          <span style={{ color: "var(--ind-ema20)" }}>EMA 20</span>
          <span style={{ color: "var(--ind-ema50)" }}>EMA 50</span>
        </span>
      </div>
      <div className="mt-3 h-[170px]">
        <CandlestickChart
          candles={panel.candles}
          min={frame.min}
          max={frame.max}
          priceTicks={[]}
          timeLabels={[]}
          digits={chart.digits}
          overlay={overlay}
        />
      </div>
      <p className="mt-3 text-xs font-semibold">{t("disiplinTitle", { n: CHECK_IDS.length })}</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {CHECK_IDS.map((id) => (
          <li key={id} className="flex items-center gap-2 rounded-lg bg-inset px-3 py-1.5 text-[11px] text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            {tc(id, { max: DISIPLIN.MAX_RISK_PCT, min: DISIPLIN.MIN_REWARD_RISK })}
          </li>
        ))}
      </ul>
    </div>
  )
}
