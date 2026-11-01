"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRight, LoaderCircle, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import { McqItem } from "@/components/assessment/mcq-item"
import { Review } from "@/components/assessment/review"
import { ScenarioItem, type ScenarioView } from "@/components/assessment/scenario-item"
import { RexArt } from "@/components/rex-mascot"
import { clearRunToken, loadRunToken, saveResult, saveRunToken, useAssessmentDevice } from "@/lib/assessment/device"
import type { Report } from "@/lib/assessment/report"
import type { Bar, Decision, PublicPackage, ScenarioRun } from "@/lib/assessment/types"

/** Fixed autoplay pace: one candle per this many ms, at most (the request takes its own time too). */
const STEP_MS = 350

type Res = { token: string; index: number; scenario?: ScenarioView | null; bar?: Bar; run?: ScenarioRun; report?: Report; error?: string }

/**
 * A package from start to review. The server holds the keys and the future
 * candles; this keeps the signed run token (also on the device, so a reload
 * resumes), shows the current item and asks for the next candle at a fixed
 * pace while a scenario plays.
 */
export function AssessmentRunner({ pkg }: { pkg: PublicPackage }) {
  const t = useTranslations("assessment.runner")
  const [token, setToken] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [scenario, setScenario] = useState<ScenarioView | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const [started, setStarted] = useState(false)
  const device = useAssessmentDevice()
  // Requests go one at a time, each with the newest token: a click during a
  // candle request waits for it instead of acting on an older state.
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const tokenRef = useRef<string | null>(null)
  const inFlight = useRef(false)
  const hold = useRef(false)

  const send = useCallback(
    async (body: Record<string, unknown>): Promise<Res | null> => {
      inFlight.current = true
      setBusy(true)
      setError(null)
      try {
        const payload = body.action === "start" ? body : { ...body, token: tokenRef.current }
        const res = await fetch("/api/belajar/asesmen", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
        const json = (await res.json()) as Res
        if (!res.ok) {
          if (res.status === 410) {
            clearRunToken(pkg.id)
            tokenRef.current = null
            setToken(null)
            setStarted(false)
          }
          setError(t(`errors.${json.error?.startsWith("problem.") ? "problem" : res.status === 410 ? "expired" : "failed"}`))
          return null
        }
        tokenRef.current = json.token
        setToken(json.token)
        saveRunToken(pkg.id, json.token)
        setIndex(json.index)
        return json
      } catch {
        setError(t("errors.failed"))
        return null
      } finally {
        inFlight.current = false
        setBusy(false)
      }
    },
    [pkg.id, t],
  )

  const post = useCallback(
    (body: Record<string, unknown>) => {
      const next = queue.current.then(() => send(body))
      queue.current = next.catch(() => null)
      return next
    },
    [send],
  )

  const begin = useCallback(
    async (resume: boolean) => {
      const res = await post({ action: "start", pkg: pkg.id, token: resume ? loadRunToken(pkg.id) : undefined })
      if (!res) return
      setScenario(res.scenario ?? null)
      setReport(null)
      setClosing(false)
      setStarted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [pkg.id, post],
  )

  // The review, once every item is answered.
  useEffect(() => {
    if (!token || index < pkg.items.length || report) return
    void (async () => {
      const res = await post({ action: "report" })
      if (!res?.report) return
      setReport(res.report)
      saveResult(pkg.id, {
        scenarios: res.report.scenarios.average,
        complex: res.report.complex.score,
        complexMax: res.report.complex.max,
        basic: res.report.basic.score,
        basicMax: res.report.basic.max,
      })
      clearRunToken(pkg.id)
      window.scrollTo({ top: 0, behavior: "smooth" })
    })()
  }, [index, pkg.id, pkg.items.length, post, report, token])

  // Autoplay: the next candle, one request at a time, at a fixed pace. Paused while choosing a close reason.
  const run = scenario?.run
  const playing = !!run && !run.end && !closing && !error
  useEffect(() => {
    if (!playing || !token) return
    const id = window.setTimeout(async () => {
      if (inFlight.current || hold.current) return
      const res = await post({ action: "step" })
      if (!res?.bar || !res.run) return
      setScenario((s) => (s ? { ...s, revealed: [...s.revealed, res.bar as Bar], run: res.run as ScenarioRun } : s))
    }, STEP_MS)
    return () => window.clearTimeout(id)
  }, [playing, token, post, run?.n])

  const act = async (body: Record<string, unknown>) => {
    hold.current = true
    const res = await post(body)
    hold.current = false
    if (!res) return
    setScenario(res.scenario ?? null)
    setClosing(false)
    if (res.index !== index) window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!started) {
    // The device store reads null on the server and the first render.
    if (!device) return <div className="h-72 w-full animate-pulse rounded-2xl bg-card" />
    const saved = device.running.includes(pkg.id)
    return (
      <div className="glow-card flex flex-col items-center gap-4 rounded-2xl border border-border p-6 text-center sm:p-10">
        <RexArt size={140} mood="explain" />
        <p className="max-w-lg text-muted-foreground">{saved ? t("saved") : t("intro", { n: pkg.items.length })}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {saved && (
            <button type="button" onClick={() => begin(true)} disabled={busy} className="btn">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} {t("resume")}
            </button>
          )}
          <button type="button" onClick={() => begin(false)} disabled={busy} className={saved ? "btn btn-ghost" : "btn"}>
            {busy && !saved ? <LoaderCircle className="h-4 w-4 animate-spin" /> : saved ? <RotateCcw className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}{" "}
            {saved ? t("restart") : t("start")}
          </button>
        </div>
        {error && <p role="alert" className="text-sm text-primary">{error}</p>}
      </div>
    )
  }

  if (report) {
    return (
      <div className="flex flex-col gap-5">
        <Review pkg={pkg} report={report} />
        <div className="flex justify-center">
          <button type="button" onClick={() => begin(false)} disabled={busy} className="btn btn-ghost">
            <RotateCcw className="h-4 w-4" /> {t("again")}
          </button>
        </div>
      </div>
    )
  }

  const item = pkg.items[index]
  const scenarios = pkg.items.filter((i) => i.type === "scenario").length
  return (
    <div className="flex flex-col gap-4">
      <QuestionStrip pkg={pkg} index={index} />
      {error && (
        <p role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
          {error}
          <button type="button" className="font-semibold underline-offset-4 hover:underline" onClick={() => setError(null)}>
            {t("dismiss")}
          </button>
        </p>
      )}
      {!item ? (
        <div className="flex justify-center p-10">
          <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" aria-label={t("loading")} />
        </div>
      ) : item.type === "scenario" ? (
        scenario && (
          <ScenarioItem
            key={item.id}
            item={item}
            pkg={pkg}
            number={pkg.items.slice(0, index + 1).filter((i) => i.type === "scenario").length}
            of={scenarios}
            view={scenario}
            busy={busy && !playing}
            closing={closing}
            setClosing={setClosing}
            onDecide={(d: Decision) => act({ action: "decide", decision: d })}
            onClose={(reason) => act({ action: "close", reason })}
            onNext={() => act({ action: "next" })}
          />
        )
      ) : (
        <McqItem key={item.id} item={item} busy={busy} onAnswer={(choice) => act({ action: "answer", choice })} />
      )}
    </div>
  )
}

/**
 * Every item as a numbered cell: answered, current, still to come. Items go
 * in order and can't be revisited (a scenario's future is shown once), so the
 * cells are a map, not buttons.
 */
function QuestionStrip({ pkg, index }: { pkg: PublicPackage; index: number }) {
  const t = useTranslations("assessment.runner")
  return (
    <section aria-label={t("strip")} className="rounded-2xl border border-border bg-card p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">{t("progress", { n: Math.min(index + 1, pkg.items.length), total: pkg.items.length })}</p>
        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-foreground" /> {t("legendScenario")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-faint" /> {t("legendMcq")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-primary" /> {t("legendDone")}
          </span>
        </div>
      </div>
      <ol className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-1.5">
        {pkg.items.map((it, i) => {
          const done = i < index
          const current = i === index
          return (
            <li
              key={it.id}
              aria-current={current ? "step" : undefined}
              className={[
                "relative flex h-9 items-center justify-center rounded-lg border font-mono text-xs font-semibold tabular-nums",
                current ? "border-primary bg-primary/15 text-primary" : it.type === "scenario" ? "border-border bg-inset text-foreground" : "border-border bg-inset text-faint",
              ].join(" ")}
            >
              {i + 1}
              {done && <span aria-label={t("legendDone")} className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
