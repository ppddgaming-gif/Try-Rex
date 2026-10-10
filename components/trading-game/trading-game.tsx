"use client"

import { startTransition, useEffect, useEffectEvent, useMemo, useState, ViewTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Card } from "@/components/card"
import { GlossaryText } from "@/components/glossary/glossary-text"
import { CandlestickChart } from "@/components/candlestick-chart"
import { Skeleton } from "@/components/progress/skeleton"
import { SelectMenu } from "@/components/select-menu"
import { AnswerFeedback } from "@/components/trading-game/answer-feedback"
import { DecisionButtons } from "@/components/trading-game/decision-buttons"
import { QuestionProgress } from "@/components/trading-game/question-progress"
import { RoundSummary } from "@/components/trading-game/round-summary"
import { recordAttempt, useProgress } from "@/lib/progress/use-progress"
import { challengeText } from "@/lib/challenge-text"
import type { Locale } from "@/lib/i18n/locale"
import type { GameLevel } from "@/lib/game-data"
import { FUTURE } from "@/lib/game-logic"
import {
  challengeById,
  challenges,
  decisionLabels,
  frameOf,
  gameLevels,
  scoreFor,
  type Challenge,
  type Decision,
} from "@/lib/mock-data"
import { answerLabelKey, planFrom, type OnboardingRecord } from "@/lib/onboarding"
import { buildRound, newSeed } from "@/lib/round"
import { useOnboarding } from "@/lib/use-onboarding"
import { ArrowRight, BrainCircuit, CalendarCheck, RotateCcw, Sparkles, Target } from "lucide-react"

const ROUND_SIZE = 5
/** How many recent answers count as "seen" when picking fresh questions. */
const SEEN_WINDOW = 150
/** Stop waiting for account progress after this long and play anyway. */
const PROGRESS_WAIT_MS = 2500

const shortcutKeys: Record<string, Decision> = { b: "buy", s: "sell", w: "wait" }

type Game = { seed: number; level: GameLevel; round: Challenge[] }

/**
 * Sets up each round: waits for the player's onboarding answers and history,
 * then asks lib/round.ts for five fresh questions. The round is built in the
 * browser after mount (the seed is random), so the server renders a skeleton
 * and nothing can mismatch on hydration.
 *
 * `featuredId` is the dashboard's daily challenge: the first round opens on it.
 * `serverOnboarding` is the account's record; undefined for guests, who are
 * read from the device and sent to /start if they haven't done the quiz.
 */
export function TradingGame({
  featuredId,
  serverOnboarding,
}: {
  featuredId?: string
  serverOnboarding?: OnboardingRecord | null
}) {
  const router = useRouter()
  const record = useOnboarding(serverOnboarding)
  const progress = useProgress()
  const [waited, setWaited] = useState(false)
  const [game, setGame] = useState<Game | null>(null)
  const featured = challengeById(featuredId)
  const plan = planFrom(record ?? null)
  const tOnboarding = useTranslations("onboarding")

  useEffect(() => {
    if (record !== null) return
    const back = featuredId ? `/trading-game?c=${encodeURIComponent(featuredId)}` : "/trading-game"
    router.replace(`/start?next=${encodeURIComponent(back)}`)
  }, [record, featuredId, router])

  useEffect(() => {
    const id = setTimeout(() => setWaited(true), PROGRESS_WAIT_MS)
    return () => clearTimeout(id)
  }, [])

  // Deals a round. Reads the latest history, so questions answered a moment
  // ago count as seen for the next round.
  function deal(level: GameLevel, first?: Challenge) {
    const seen = new Set(progress?.attempts.slice(-SEEN_WINDOW).map((a) => a.scenarioId))
    const seed = newSeed()
    const round = buildRound({ level, seed, seen, focusPairs: plan.focusPairs, first, size: ROUND_SIZE })
    startTransition(() => setGame({ seed, level, round }))
  }

  // The first round, once onboarding and history are in.
  const dealFirst = useEffectEvent(() => deal(featured?.level ?? plan.level, featured))
  const ready = Boolean(record) && (progress !== null || waited)
  useEffect(() => {
    if (ready && !game) dealFirst()
  }, [ready, game])

  if (!game) return <GameSkeleton />
  const labelOf = (key: string | null) => (key ? tOnboarding(key) : null)

  return (
    <GameRound
      key={game.seed}
      game={game}
      featuredId={featured?.id}
      focusLabel={record && !record.skipped ? labelOf(answerLabelKey("focus", record.answers.focus)) : null}
      onNewRound={(level) => deal(level)}
    />
  )
}

function GameRound({
  game,
  featuredId,
  focusLabel,
  onNewRound,
}: {
  game: Game
  featuredId?: string
  focusLabel: string | null
  onNewRound: (level: GameLevel) => void
}) {
  const { round, level } = game
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState<Decision | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [xp, setXp] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [seconds, setSeconds] = useState(0)

  const challenge = round[index]
  const t = useTranslations("game")
  const tc = useTranslations("game.challenge")
  const locale = useLocale() as Locale
  const text = useMemo(() => challengeText(challenge, tc, locale), [challenge, tc, locale])

  // After answering, the 15 future candles are appended so you see what happened.
  const shown = useMemo(
    () => (submitted ? [...challenge.candles, ...challenge.future] : challenge.candles),
    [submitted, challenge]
  )
  const frame = useMemo(() => frameOf(shown), [shown])

  const last = index === round.length - 1
  const finished = last && submitted
  const result = submitted && choice ? scoreFor(challenge, choice) : null

  // Stops once the last answer is in: the round is over.
  useEffect(() => {
    if (finished) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [finished])

  // These run inside startTransition: <ViewTransition> only animates
  // transitions, so plain state updates would make the chart jump.
  function submit() {
    if (!choice || submitted) return
    const { correct, xp: earned } = scoreFor(challenge, choice)
    // Saved to the player's progress right away, outside the transition, so
    // the sidebar's XP bar and the streak update with the answer.
    recordAttempt({
      scenarioId: challenge.id,
      pair: challenge.pair,
      timeframe: challenge.timeframe,
      difficulty: challenge.difficulty,
      decision: choice,
      correct,
      xpEarned: earned,
    })
    startTransition(() => {
      setSubmitted(true)
      setXp((v) => v + earned)
      setResults((r) => [...r, correct])
    })
  }

  function next() {
    if (!submitted || last) return
    startTransition(() => {
      setIndex((i) => Math.min(i + 1, round.length - 1))
      setChoice(null)
      setSubmitted(false)
    })
  }

  // Keyboard play: B / S / W pick, Enter submits, N moves on. Enter is left
  // alone on buttons and links so it never fires twice.
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
    const target = e.target instanceof Element ? e.target : document.body
    if (target.closest("input, textarea, select, [role=listbox]")) return
    const key = e.key.toLowerCase()
    if (!submitted && key in shortcutKeys) {
      e.preventDefault()
      setChoice(shortcutKeys[key])
    } else if (key === "enter" && !target.closest("button, a")) {
      if (!submitted) submit()
      else if (last) onNewRound(level)
      else next()
    } else if (key === "n") {
      if (finished) onNewRound(level)
      else next()
    }
  })
  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e)
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [])

  const evaluationHref = `/ai-evaluation?c=${encodeURIComponent(challenge.id)}&a=${choice ?? challenge.answer}&t=${seconds}`
  const isFeatured = featuredId === challenge.id

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <GameHeader
        level={level}
        onLevel={(v) => onNewRound(v)}
        focusLabel={focusLabel}
      />

      {/* One grid, two orders. Phones read top to bottom: progress, chart,
          then the decision. From lg the chart spans both rows on the left and
          progress sits above the decision on the right. */}
      <div className="mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_340px] lg:grid-rows-[auto_1fr]">
        <div className="enter lg:col-start-2 lg:row-start-1">
          <QuestionProgress index={index} results={results} total={round.length} xp={xp} seconds={seconds} />
        </div>

        {/* Chart */}
        <Card className="enter flex flex-col self-start p-4 sm:p-[22px] lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-semibold">
              {challenge.pair}
            </span>
            <span className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-semibold">
              {challenge.timeframe}
            </span>
            <span className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
              {text.period}
            </span>
            {isFeatured && (
              <span className="flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary">
                <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" /> {t("todaysChallenge")}
              </span>
            )}
            {submitted && (
              <span
                className={[
                  "pop-in ml-auto rounded-lg px-3 py-1.5 font-mono text-xs font-bold",
                  challenge.changePercent > 0
                    ? "bg-success/15 text-success"
                    : challenge.changePercent < 0
                      ? "bg-danger/15 text-danger"
                      : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {t("moveIn", {
                  change: `${challenge.changePercent > 0 ? "+" : ""}${challenge.changePercent.toFixed(2)}%`,
                  n: FUTURE,
                })}
              </span>
            )}
          </div>

          {/* Submitting appends the future candles and rescales the chart;
              moving to the next question swaps it. Both happen in a transition,
              so the chart morphs instead of jumping (CSS: game-chart), and the
              revealed candles cascade in on top. */}
          <ViewTransition key={challenge.id} name="game-chart" share="auto" update="auto" default="none">
            {/* Fixed height: the SVG stretches to its box, text included. */}
            <div className="mt-4 h-[280px] w-full sm:h-[400px] lg:h-[440px]">
              <CandlestickChart
                candles={shown}
                min={frame.min}
                max={frame.max}
                priceTicks={frame.priceTicks}
                timeLabels={submitted ? text.revealTimeLabels : text.timeLabels}
                zones={challenge.zones}
                currentPrice={challenge.currentPrice}
                digits={challenge.digits}
                revealFrom={submitted ? challenge.candles.length : undefined}
                dividerAt={submitted ? challenge.candles.length : undefined}
              />
            </div>
          </ViewTransition>
          <p className="mt-2 text-xs text-muted-foreground">
            {submitted ? (
              t("revealNote", { price: challenge.currentPrice.toFixed(challenge.digits), n: FUTURE })
            ) : (
              t.rich("hiddenNote", {
                n: FUTURE,
                price: challenge.currentPrice.toFixed(challenge.digits),
                mono: (c) => <span className="font-mono text-foreground">{c}</span>,
              })
            )}
          </p>
        </Card>

        {/* Situation + actions */}
        <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-2">
          <ViewTransition key={challenge.id} name="game-situation" share="auto" default="none">
            <Card className="enter" style={{ "--enter-delay": "80ms" } as React.CSSProperties}>
              <h2 className="text-base font-semibold">{t("situationTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                <GlossaryText text={text.situation} />
              </p>
              <p className="mt-3 text-[11px] text-faint">{t("tapHint")}</p>
            </Card>
          </ViewTransition>

          <DecisionButtons
            value={choice}
            onChange={setChoice}
            disabled={submitted}
            answer={submitted ? challenge.answer : undefined}
          />

          {!submitted && (
            <>
              <button onClick={submit} disabled={!choice} className="btn w-full">
                {choice ? t("submit", { decision: decisionLabels[choice] }) : t("pick")}
              </button>
              {/* Shortcuts only mean something with a keyboard. */}
              <p className="hidden text-center text-xs text-faint [@media(hover:hover)]:block">
                {t.rich("shortcuts", { k: (c) => <Kbd>{String(c)}</Kbd> })}
              </p>
            </>
          )}

          {submitted && choice && result && (
            <>
              <AnswerFeedback
                correct={result.correct}
                xp={result.xp}
                message={text.feedback[choice]}
                answerLabel={decisionLabels[challenge.answer]}
              />

              {finished && (
                <RoundSummary correct={results.filter(Boolean).length} total={round.length} xp={xp} seconds={seconds} />
              )}

              <div className="flex flex-col gap-3">
                {last ? (
                  <>
                    <button onClick={() => onNewRound(level)} className="btn w-full">
                      <RotateCcw className="h-4 w-4" /> {t("newRound")}
                    </button>
                    <Link href={evaluationHref} className="btn btn-ghost w-full">
                      <BrainCircuit className="h-4 w-4" /> {t("reviewLast")}
                    </Link>
                  </>
                ) : (
                  <>
                    <button onClick={next} className="btn w-full">
                      {t("next")} <ArrowRight className="h-4 w-4" />
                    </button>
                    <Link href={evaluationHref} className="btn btn-ghost w-full">
                      <BrainCircuit className="h-4 w-4" /> {t("reviewThis")}
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function GameHeader({
  level,
  onLevel,
  focusLabel,
}: {
  level: GameLevel | null
  onLevel?: (level: GameLevel) => void
  focusLabel?: string | null
}) {
  const pool = level ? challenges.filter((c) => c.level === level).length : null
  const t = useTranslations("game")
  const tl = useTranslations("common.levels")
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("lead")}</p>
        {(focusLabel || pool) && (
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
            {pool && (
              <span>{t.rich("pool", { n: pool, num: (c) => <span className="font-mono text-muted-foreground">{c}</span> })}</span>
            )}
            {focusLabel && (
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" /> {t("focus", { label: focusLabel })}
              </span>
            )}
          </p>
        )}
      </div>
      {level && onLevel ? (
        <SelectMenu
          label={t("difficulty")}
          className="w-full sm:w-60"
          value={level}
          onChange={(v) => onLevel(v as GameLevel)}
          options={gameLevels.map((l) => ({
            value: l.id,
            label: t("levelOption", { label: tl(l.id), xp: l.xp }),
            prefix: <Target className="h-4 w-4" />,
          }))}
        />
      ) : (
        <Skeleton className="h-10 w-full rounded-lg sm:w-60" />
      )}
    </header>
  )
}

/** Same footprint as the game, shown while the round is being dealt. */
function GameSkeleton() {
  const t = useTranslations("game")
  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8" aria-busy="true" aria-label={t("preparing")}>
      <GameHeader level={null} />
      <div className="mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_340px] lg:grid-rows-[auto_1fr]">
        <div className="lg:col-start-2 lg:row-start-1">
          <Skeleton className="h-[98px] w-full rounded-2xl" />
        </div>
        <Card className="flex flex-col p-4 sm:p-[22px] lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-12 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <Skeleton className="mt-4 h-[280px] w-full rounded-xl sm:h-[400px] lg:h-[440px]" />
          <Skeleton className="mt-2 h-4 w-64" />
        </Card>
        <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-2">
          <Skeleton className="h-[150px] w-full rounded-2xl" />
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[74px] rounded-[13px]" />
            ))}
          </div>
          <Skeleton className="h-[52px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="rounded border border-border bg-inset px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
      {children}
    </kbd>
  )
}
