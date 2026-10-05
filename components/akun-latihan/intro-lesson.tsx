"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, BookOpen, CheckCircle2, LoaderCircle, XCircle } from "lucide-react"
import { Card } from "@/components/card"
import { Confetti } from "@/components/confetti"
import { GlossaryText } from "@/components/glossary/glossary-text"
import { Rex } from "@/components/rex-mascot"
import { postJson } from "@/components/akun-latihan/post-json"
import type { PublicLesson } from "@/lib/demo/lessons"

/**
 * A lesson with its check question. The browser has the options but not the
 * answer: the server checks it. Required, only a right answer moves on;
 * optional (the risk lesson after a reset), it's there to practise.
 */
export function RequiredLesson({
  lesson,
  optional = false,
  doneLabel = "Lanjut ke akunku",
}: {
  lesson: PublicLesson
  optional?: boolean
  /** The button after a right answer, which reloads the page's next step. */
  doneLabel?: string
}) {
  const router = useRouter()
  const [picked, setPicked] = useState<number | null>(null)
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [, startTransition] = useTransition()

  async function submit() {
    if (picked === null) return
    setBusy(true)
    setError(null)
    const res = await postJson<{ correct: boolean; message: string }>("/api/akun-latihan/lesson", {
      lesson: lesson.id,
      answer: picked,
    })
    setBusy(false)
    if (res.error) return setError(res.error)
    setResult({ correct: res.correct, message: res.message })
  }

  return (
    <article className="flex flex-col gap-5">
      <Card className="sm:p-8">
        <p className="eyebrow flex items-center gap-2">
          <BookOpen className="h-4 w-4" aria-hidden="true" /> {optional ? "Materi opsional" : "Materi wajib"}
        </p>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{lesson.title}</h2>
        <p className="mt-2 text-muted-foreground">{lesson.summary}</p>
      </Card>

      {lesson.sections.map((s, i) => (
        <Card key={s.title} className="enter sm:p-8" style={{ "--enter-delay": `${60 + i * 60}ms` } as React.CSSProperties}>
          <h3 className="text-lg font-bold">{s.title}</h3>
          {s.paragraphs.map((p) => (
            <p key={p} className="mt-3 leading-relaxed text-foreground/90">
              <GlossaryText text={p} />
            </p>
          ))}
          {s.table && (
            <figure className="mt-5 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[460px] text-sm">
                <thead className="bg-inset text-left text-xs text-muted-foreground">
                  <tr>
                    {s.table.head.map((h) => (
                      <th key={h} scope="col" className="px-4 py-2.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row) => (
                    <tr key={row[0]} className="border-t border-border">
                      {row.map((cell, c) => (
                        <td key={c} className={`px-4 py-2.5 font-mono ${c === 0 ? "font-semibold" : ""}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <figcaption className="border-t border-border px-4 py-2 text-xs text-muted-foreground">{s.table.caption}</figcaption>
            </figure>
          )}
        </Card>
      ))}

      <Card className="glow-card relative border-primary/30 sm:p-8">
        {result?.correct && <Confetti pieces={20} />}
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {optional ? "Cek pemahaman" : "Cek pemahaman · wajib benar"}
        </p>
        <p className="mt-2 font-display text-lg font-bold leading-snug">{lesson.question}</p>

        <div role="radiogroup" aria-label={lesson.question} className="mt-4 grid gap-2 sm:grid-cols-2">
          {lesson.options.map((o, i) => {
            const selected = picked === i
            const locked = result?.correct === true
            return (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={locked || busy}
                onClick={() => {
                  setPicked(i)
                  if (result && !result.correct) setResult(null)
                }}
                className={[
                  "option flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-left font-mono text-sm font-semibold",
                  selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-faint",
                ].join(" ")}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-inset text-xs text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </span>
                {o}
              </button>
            )
          })}
        </div>

        {result && (
          <div role="status" className="enter mt-4 flex items-start gap-3 rounded-xl bg-inset p-4 text-sm leading-relaxed">
            <Rex size={36} mood={result.correct ? "happy" : "thinking"} />
            <p className="flex-1">
              {result.correct ? (
                <CheckCircle2 className="mr-1 inline h-4 w-4 text-primary" aria-hidden="true" />
              ) : (
                <XCircle className="mr-1 inline h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
              {result.message}
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-5">
          {result?.correct ? (
            !optional && (
              <button type="button" onClick={() => startTransition(() => router.refresh())} className="btn">
                {doneLabel} <ArrowRight className="h-4 w-4" />
              </button>
            )
          ) : (
            <button type="button" onClick={submit} disabled={picked === null || busy} className="btn">
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {result && !result.correct ? "Coba jawaban lain" : "Periksa jawaban"}
            </button>
          )}
        </div>
      </Card>
    </article>
  )
}
