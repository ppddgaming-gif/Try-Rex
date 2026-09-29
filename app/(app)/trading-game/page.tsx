"use client"

import { startTransition, useEffect, useMemo, useState, ViewTransition } from "react"
import Link from "next/link"
import { Card } from "@/components/card"
import { CandlestickChart } from "@/components/candlestick-chart"
import { SelectMenu } from "@/components/select-menu"
import { AnswerFeedback } from "@/components/trading-game/answer-feedback"
import { DecisionButtons } from "@/components/trading-game/decision-buttons"
import { QuestionProgress } from "@/components/trading-game/question-progress"
import type { GameLevel } from "@/lib/game-data"
import { FUTURE } from "@/lib/game-logic"
import {
  decisionLabels,
  frameOf,
  gameLevels,
  roundFor,
  scoreFor,
  type Decision,
} from "@/lib/mock-data"
import { ArrowRight, BrainCircuit, RotateCcw, Target } from "lucide-react"

const ROUND_SIZE = 5

export default function TradingGamePage() {
  const [level, setLevel] = useState<GameLevel>("easy")
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState<Decision | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [xp, setXp] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [seconds, setSeconds] = useState(0)

  const round = useMemo(() => roundFor(level, ROUND_SIZE), [level])
  const challenge = round[index]

  // After answering, the 15 future candles are appended so you see what happened.
  const shown = useMemo(
    () => (submitted ? [...challenge.candles, ...challenge.future] : challenge.candles),
    [submitted, challenge]
  )
  const frame = useMemo(() => frameOf(shown), [shown])

  const last = index === round.length - 1
  const result = submitted && choice ? scoreFor(challenge, choice) : null

  // Starts at 0 on the server and on first paint, so there is no hydration gap.
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // These three run inside startTransition: <ViewTransition> only animates
  // transitions, so plain state updates would make the chart jump.
  function submit() {
    if (!choice || submitted) return
    const { correct, xp: earned } = scoreFor(challenge, choice)
    startTransition(() => {
      setSubmitted(true)
      setXp((v) => v + earned)
      if (correct) setCorrectCount((v) => v + 1)
    })
  }

  function next() {
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
      setCorrectCount(0)
      setSeconds(0)
    })
  }

  const evaluationHref = `/ai-evaluation?c=${challenge.id}&a=${choice ?? challenge.answer}&t=${seconds}`

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trading Game Simulator</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data harga asli. Pilih keputusanmu, lalu lihat apa yang sebenarnya terjadi.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-72">
          <SelectMenu
            label="Tingkat kesulitan"
            value={level}
            onChange={(v) => reset(v as GameLevel)}
            options={gameLevels.map((l) => ({
              value: l.id,
              label: `${l.label} · ${l.xp} XP`,
              prefix: <Target className="h-4 w-4" />,
            }))}
          />
          <QuestionProgress
            index={index}
            answered={index + (submitted ? 1 : 0)}
            total={round.length}
            xp={xp}
            correctCount={correctCount}
            seconds={seconds}
          />
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        {/* Chart */}
        <Card className="flex flex-col">
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
            {submitted && (
              <span
                className={[
                  "ml-auto rounded-lg px-3 py-1.5 text-xs font-bold",
                  challenge.changePercent > 0
                    ? "bg-success/15 text-success"
                    : challenge.changePercent < 0
                      ? "bg-danger/15 text-danger"
                      : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {FUTURE} candle berikutnya: {challenge.changePercent > 0 ? "+" : ""}
                {challenge.changePercent.toFixed(2)}%
              </span>
            )}
          </div>

          {/* Submitting appends the future candles and rescales the chart;
              moving to the next question swaps it. Both happen in a transition,
              so the chart morphs instead of jumping (CSS: game-chart), and the
              revealed candles cascade in on top. */}
          <ViewTransition key={challenge.id} name="game-chart" share="auto" update="auto" default="none">
            <div className="mt-4 h-[320px] w-full sm:h-[420px]">
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
              />
            </div>
          </ViewTransition>
          {submitted && (
            <p className="mt-2 text-xs text-muted-foreground">
              Bagian setelah harga entry ({challenge.currentPrice.toFixed(challenge.digits)}) adalah{" "}
              {FUTURE} candle yang tadi disembunyikan.
            </p>
          )}
        </Card>

        {/* Situation + actions */}
        <div className="flex flex-col gap-4">
          <ViewTransition key={challenge.id} name="game-situation" share="auto" default="none">
            <Card>
              <h2 className="text-base font-semibold">Situasi Market</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{challenge.situation}</p>
            </Card>
          </ViewTransition>

          <DecisionButtons
            value={choice}
            onChange={setChoice}
            disabled={submitted}
            answer={submitted ? challenge.answer : undefined}
          />

          {!submitted && (
            <button
              onClick={submit}
              disabled={!choice}
              className="btn w-full"
            >
              {choice ? `Kirim Jawaban: ${decisionLabels[choice]}` : "Pilih salah satu dulu"}
            </button>
          )}

          {submitted && choice && result && (
            <>
              <AnswerFeedback
                correct={result.correct}
                xp={result.xp}
                message={challenge.feedback[choice]}
                answerLabel={decisionLabels[challenge.answer]}
              />

              <div className="flex flex-col gap-3">
                {last ? (
                  <>
                    <Link
                      href={evaluationHref}
                      className="btn w-full"
                    >
                      <BrainCircuit className="h-4 w-4" /> Lihat Evaluasi AI
                    </Link>
                    <button onClick={() => reset()} className="btn btn-ghost w-full">
                      <RotateCcw className="h-4 w-4" /> Main dari Awal
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={next}
                      className="btn w-full"
                    >
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
