"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { LoaderCircle, MessageCircleQuestion, Send, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { usePostJson } from "@/components/akun-latihan/post-json"
import { RexArt } from "@/components/rex-mascot"
import { REX_CHAT } from "@/lib/demo/config"
import type { ChatState } from "@/lib/demo/rex-chat"

const URL = "/api/akun-latihan/trade/ask"
const SUGGESTIONS = ["fix", "failed", "rr"] as const

/**
 * "Tanya Rex" on a closed trade: a button that opens the chat pop-up. Rex
 * explains the trade's process first, then answers the player's questions
 * about it (lib/demo/rex-chat.ts). Never scored.
 */
export function AskRex({ tradeId, number }: { tradeId: string; number: number }) {
  const [open, setOpen] = useState(false)
  const t = useTranslations("demo.ui.rexChat")
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost btn-sm self-start">
        <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
        {t("open")}
      </button>
      {open && <RexChatDialog tradeId={tradeId} number={number} onClose={() => setOpen(false)} />}
    </>
  )
}

type Pending = "load" | "intro" | "ask" | null

function RexChatDialog({ tradeId, number, onClose }: { tradeId: string; number: number; onClose: () => void }) {
  const t = useTranslations("demo.ui.rexChat")
  const post = usePostJson()
  const dialog = useRef<HTMLDialogElement>(null)
  const end = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  const titleId = useId()
  const inputId = useId()
  const [chat, setChat] = useState<ChatState | null>(null)
  const [pending, setPending] = useState<Pending>("load")
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  /** The question on its way, shown before Rex answers. */
  const [asking, setAsking] = useState<string | null>(null)

  const run = useCallback(
    async (action: Exclude<Pending, null>, question?: string) => {
      setPending(action)
      setError(null)
      const res = await post<{ chat?: ChatState }>(URL, { trade: tradeId, action, question })
      setPending(null)
      if (res.chat) setChat(res.chat)
      if (res.error) setError(res.error)
      return res
    },
    [post, tradeId],
  )

  // Open as a modal, then load the chat and ask for Rex's opening once.
  useEffect(() => {
    const el = dialog.current
    if (el && !el.open) el.showModal()
    if (started.current) return
    started.current = true
    void (async () => {
      const res = await run("load")
      if (res.chat && res.chat.turns.length === 0 && res.chat.quota.todayLeft > 0) await run("intro")
    })()
  }, [run])

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" })
  }, [chat, asking, pending])

  async function ask(text: string) {
    const question = text.replace(/\s+/g, " ").trim()
    if (!question || pending) return
    setAsking(question)
    setDraft("")
    const res = await run("ask", question)
    setAsking(null)
    if (res.error) setDraft(question)
  }

  const turns = chat?.turns ?? []
  const quota = chat?.quota
  const asked = turns.some((m) => m.role === "user")
  const canAsk = Boolean(quota && quota.questionsLeft > 0 && quota.todayLeft > 0 && turns.length > 0)

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialog.current?.close()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg bg-transparent p-0 text-foreground backdrop:bg-background/70 backdrop:backdrop-blur-sm"
    >
      <div className="glass-card glass-strong enter flex max-h-[85dvh] flex-col rounded-2xl">
        <header className="flex items-start gap-3 border-b border-border p-4">
          <RexArt size={48} mood="explain" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-display text-base font-bold">
              {t("title", { n: number })}
            </h2>
            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label={t("close")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex min-h-40 flex-1 flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
          {turns.map((m, i) => (
            <Bubble key={i} role={m.role} label={m.role === "user" ? t("you") : t("rex")} text={m.content} />
          ))}
          {asking && <Bubble role="user" label={t("you")} text={asking} />}
          {(pending === "load" || pending === "intro" || pending === "ask") && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              {pending === "ask" ? t("thinking") : t("reading")}
            </p>
          )}
          {error && (
            <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-primary">
              <span>{error}</span>
              {turns.length === 0 && pending === null && quota && quota.todayLeft > 0 && (
                <button type="button" onClick={() => void run("intro")} className="btn btn-ghost btn-sm">
                  {t("retry")}
                </button>
              )}
            </div>
          )}
          {canAsk && !asked && pending === null && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">{t("suggestionsLabel")}</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => void ask(t(`suggestions.${s}`))}
                      className="min-h-10 rounded-full border border-border px-3 text-left text-xs transition-colors hover:border-primary hover:text-primary"
                    >
                      {t(`suggestions.${s}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div ref={end} />
        </div>

        <footer className="border-t border-border p-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              void ask(draft)
            }}
          >
            <label htmlFor={inputId} className="sr-only">
              {t("label")}
            </label>
            <input
              id={inputId}
              value={draft}
              maxLength={REX_CHAT.QUESTION_MAX_CHARS}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("placeholder")}
              disabled={!canAsk}
              className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-inset px-3 text-sm disabled:opacity-60"
            />
            <button type="submit" disabled={!canAsk || pending !== null || !draft.trim()} className="btn btn-sm" aria-label={t("send")}>
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
          {quota && <p className="mt-2 text-[11px] text-muted-foreground">{t("left", { q: quota.questionsLeft, d: quota.todayLeft })}</p>}
          <p className="mt-1 text-[11px] text-faint">{t("disclaimer")}</p>
        </footer>
      </div>
    </dialog>
  )
}

function Bubble({ role, label, text }: { role: "user" | "assistant"; label: string; text: string }) {
  const rex = role === "assistant"
  return (
    <div
      className={[
        "max-w-[90%] rounded-xl border px-3 py-2 text-sm leading-relaxed",
        rex ? "self-start border-primary/30 bg-primary/10" : "self-end border-border bg-inset",
      ].join(" ")}
    >
      <p className={`text-[11px] font-semibold ${rex ? "text-primary" : "text-muted-foreground"}`}>{label}</p>
      <p className="whitespace-pre-line">{text}</p>
    </div>
  )
}
