"use client"

import { startTransition, useEffect, useEffectEvent, useMemo, useState, ViewTransition } from "react"
import Link from "next/link"
import { Card } from "@/components/card"
import { CandlestickChart } from "@/components/candlestick-chart"
import { SelectMenu } from "@/components/select-menu"
import { AnswerFeedback } from "@/components/trading-game/answer-feedback"
import { DecisionButtons } from "@/components/trading-game/decision-buttons"
import { QuestionProgress } from "@/components/trading-game/question-progress"
import { RoundSummary } from "@/components/trading-game/round-summary"
import { recordAttempt } from "@/lib/progress/use-progress"
import type { GameLevel } from "@/lib/game-data"
import { FUTURE } from "@/lib/game-logic"
import {
  challengeById,
  decisionLabels,
  frameOf,
  gameLevels,
  roundFor,
  scoreFor,
  type Decision,
} from "@/lib/mock-data"
import { ArrowRight, BrainCircuit, CalendarCheck, RotateCcw, Target } from "lucide-react"

const ROUND_SIZE = 5

const shortcutKeys: Record<string, Decision> = { b: "buy", s: "sell", w: "wait" }

/**
 * The whole game loop. `featuredId` is the dashboard's daily challenge: when
 * given, the round opens on that question at its level, so "Mulai Tantangan"
 * starts the challenge it advertised.
 */
export function TradingGame({ featuredId }: { featuredId?: string }) {
  const featured = challengeById(featuredId)
  const [level, setLevel] = useState<GameLevel>(featured?.level ?? "easy")
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState<Decision | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [xp, setXp] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [seconds, setSeconds] = useState(0)

  const round = useMemo(() => {
    const base = roundFor(level, ROUND_SIZE)
    if (!featured || featured.level !== level) return base
    return [featured, ...base.filter((c) => c.id !== featured.id)].slice(0, ROUND_SIZE)
  }, [level, featured])
  const challenge = round[index]

  // After answering, the 15 future candles are appended so you see what happened.
  const shown = useMemo(
    () => (submitted ? [...challenge.candles, ...challenge.future] : challenge.candles),
    [submitted, challenge]
  )
  const frame = useMemo(() => frameOf(shown), [shown])

  const last = index === round.length - 1
  const finished = last && submitted
  const result = submitted && choice ? scoreFor(challenge, choice) : null

  // Starts at 0 on the server and on first paint, so there is no hydration gap.
  // Stops once the last answer is in: the round is over.
  useEffect(() => {
    if (finished) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [finished])

  // These three run inside startTransition: <ViewTransition> only animates
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

  function reset(nextLevel = level) {
    startTransition(() => {
      setLevel(nextLevel)
      setIndex(0)
      setChoice(null)
      setSubmitted(false)
      setXp(0)
      setResults([])
      setSeconds(0)
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
      else next()
    } else if (key === "n") {
      next()
    }
  })
  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e)
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [])

  const evaluationHref = `/ai-evaluation?c=${challenge.id}&a=${choice ?? challenge.answer}&t=${seconds}`
  const isFeatured = featured?.id === challenge.id

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Trading Game</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data harga asli. Pilih keputusanmu, lalu lihat apa yang sebenarnya terjadi.
          </p>
        </div>
        <SelectMenu
          label="Tingkat kesulitan"
          className="w-full sm:w-60"
          value={level}
          onChange={(v) => reset(v as GameLevel)}
          options={gameLevels.map((l) => ({
            value: l.id,
            label: `${l.label} · ${l.xp} XP`,
            prefix: <Target className="h-4 w-4" />,
          }))}
        />
      </header>

      {/* One grid, two orders. Phones read top to bottom: progress, chart,
          then the decision. From lg the chart spans both rows on the left and
          progress sits above the decision on the right. */}
      <div className="mt-6 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_340px] lg:grid-rows-[auto_1fr]">
        <div className="lg:col-start-2 lg:row-start-1">
          <QuestionProgress
            index={index}
            results={results}
            total={round.length}
            xp={xp}
            seconds={seconds}
          />
        </div>

        {/* Chart */}
        <Card className="flex flex-col self-start p-4 sm:p-[22px] lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-semibold">
              {challenge.pair}
            </span>
            <span className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-semibold">
              {challenge.timeframe}
            </span>
            <span className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
              {challenge.period}
            </span>
            {isFeatured && (
              <span className="flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary">
                <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" /> Tantangan hari ini
              </span>
            )}
            {submitted && (
              <span
                className={[
                  "enter ml-auto rounded-lg px-3 py-1.5 font-mono text-xs font-bold",
                  challenge.changePercent > 0
                    ? "bg-success/15 text-success"
                    : challenge.changePercent < 0
                      ? "bg-danger/15 text-danger"
                      : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {challenge.changePercent > 0 ? "+" : ""}
                {challenge.changePercent.toFixed(2)}% dalam {FUTURE} candle
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
                timeLabels={submitted ? challenge.revealTimeLabels : challenge.timeLabels}
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
              <>
                Candle setelah garis ENTRY ({challenge.currentPrice.toFixed(challenge.digits)}) adalah {FUTURE} candle
                yang tadi disembunyikan.
              </>
            ) : (
              <>
                {FUTURE} candle berikutnya disembunyikan. Menurutmu harga akan ke mana dari{" "}
                <span className="font-mono text-foreground">{challenge.currentPrice.toFixed(challenge.digits)}</span>?
              </>
            )}
          </p>
        </Card>

        {/* Situation + actions */}
        <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-2">
          <ViewTransition key={challenge.id} name="game-situation" share="auto" default="none">
            <Card>
              <h2 className="text-base font-semibold">Situasi Market</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{challenge.situation}</p>
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
                {choice ? `Kirim Jawaban: ${decisionLabels[choice]}` : "Pilih BUY, SELL, atau WAIT"}
              </button>
              {/* Shortcuts only mean something with a keyboard. */}
              <p className="hidden text-center text-xs text-faint [@media(hover:hover)]:block">
                Pintasan: <Kbd>B</Kbd> <Kbd>S</Kbd> <Kbd>W</Kbd> untuk memilih, <Kbd>Enter</Kbd> untuk kirim
              </p>
            </>
          )}

          {submitted && choice && result && (
            <>
              <AnswerFeedback
                correct={result.correct}
                xp={result.xp}
                message={challenge.feedback[choice]}
                answerLabel={decisionLabels[challenge.answer]}
              />

              {finished && (
                <RoundSummary
                  correct={results.filter(Boolean).length}
                  total={round.length}
                  xp={xp}
                  seconds={seconds}
                />
              )}

              <div className="flex flex-col gap-3">
                {last ? (
                  <>
                    <button onClick={() => reset()} className="btn w-full">
                      <RotateCcw className="h-4 w-4" /> Main ronde baru
                    </button>
                    <Link href={evaluationHref} className="btn btn-ghost w-full">
                      <BrainCircuit className="h-4 w-4" /> Bedah soal terakhir
                    </Link>
                  </>
                ) : (
                  <>
                    <button onClick={next} className="btn w-full">
                      Soal Berikutnya <ArrowRight className="h-4 w-4" />
                    </button>
                    <Link href={evaluationHref} className="btn btn-ghost w-full">
                      <BrainCircuit className="h-4 w-4" /> Bedah soal ini dulu
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

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="rounded border border-border bg-inset px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
      {children}
    </kbd>
  )
}
