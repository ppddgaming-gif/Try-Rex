"use client"

import { useState } from "react"
import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Confetti } from "@/components/confetti"
import { RexArt } from "@/components/rex-mascot"

/**
 * A one-question check at the end of a lesson. Nothing is recorded: it is
 * there to test yourself, so a wrong pick simply explains and lets you retry.
 */
export function Quiz({
  question,
  options,
  answer,
  explain,
}: {
  question: string
  options: string[]
  answer: number
  explain: string
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const done = picked !== null
  const right = picked === answer
  const t = useTranslations("learn.quiz")

  return (
    <div className="glow-card relative rounded-2xl border border-primary/30 p-5 sm:p-6">
      {done && right && <Confetti pieces={20} />}
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
        <HelpCircle className="h-4 w-4" aria-hidden="true" /> {t("eyebrow")}
      </p>
      <p className="mt-2 font-display text-lg font-bold leading-snug">{question}</p>

      <div role="radiogroup" aria-label={question} className="mt-4 flex flex-col gap-2">
        {options.map((o, i) => {
          const isAnswer = i === answer
          const isPicked = i === picked
          const tone = !done
            ? "border-border bg-card hover:border-faint"
            : isAnswer
              ? "border-success/60 bg-success/10"
              : isPicked
                ? "border-danger/60 bg-danger/10"
                : "border-border bg-card opacity-60"
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={isPicked}
              disabled={done}
              onClick={() => setPicked(i)}
              className={`option flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium ${tone}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-inset font-mono text-xs text-muted-foreground">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{o}</span>
              {done && isAnswer && <CheckCircle2 className="pop-in h-5 w-5 text-success" aria-label={t("right")} />}
              {done && isPicked && !isAnswer && <XCircle className="pop-in h-5 w-5 text-danger" aria-label={t("picked")} />}
            </button>
          )
        })}
      </div>

      {done && (
        <div role="status" className="enter mt-4 flex items-start gap-3 rounded-xl bg-inset p-4">
          <RexArt size={48} mood={right ? "happy" : "thinking"} />
          <div className="min-w-0 flex-1 text-sm leading-relaxed">
            <p className="font-semibold">{right ? t("correct") : t("wrong")}</p>
            <p className="mt-0.5 text-muted-foreground">{explain}</p>
            {!right && (
              <button
                type="button"
                onClick={() => setPicked(null)}
                className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hi"
              >
                <RotateCcw className="h-3.5 w-3.5" /> {t("retry")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
