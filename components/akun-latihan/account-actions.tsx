"use client"

import { useState, useTransition, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import { usePostJson } from "@/components/akun-latihan/post-json"

/** Posts one account action; errors come back in the player's language. */
function useAccountPost() {
  const postJson = usePostJson()
  return (action: "open" | "close" | "reset") => postJson("/api/akun-latihan/account", { action })
}

/**
 * One step of an account's life, as a button: "close" ends an account that
 * has run out (the server checks), "open" starts the next. The page reloads
 * into whatever comes next.
 */
export function AccountActionButton({
  action,
  label,
  icon,
  large = false,
}: {
  action: "open" | "close"
  label: string
  icon?: ReactNode
  large?: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const post = useAccountPost()

  async function run() {
    setBusy(true)
    setError(null)
    const res = await post(action)
    if (res.error) {
      setError(res.error)
      setBusy(false)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" onClick={run} disabled={busy} className={`btn ${large ? "btn-lg" : ""}`}>
        {busy ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : icon}
        {label}
      </button>
      {error && (
        <p role="alert" className="text-sm text-primary">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * "Reset akun", by choice, with a confirm step. The account is closed and
 * kept in Riwayat akun; Rex's review follows and the next account starts at
 * the starting balance. No money is ever added to an account.
 */
export function ResetAccount({
  number,
  startingBalance,
  blocked,
}: {
  number: number
  startingBalance: string
  /** Why it can't happen now (a trade is open); null when it can. */
  blocked: string | null
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const post = useAccountPost()
  const t = useTranslations("demo.ui.reset")

  async function reset() {
    setBusy(true)
    setError(null)
    const res = await post("reset")
    if (res.error) {
      setError(res.error)
      setBusy(false)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <section aria-labelledby="reset-title" className="rounded-2xl border border-border p-5 sm:p-6">
      <h2 id="reset-title" className="text-base font-semibold">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("body", { n: number, balance: startingBalance })}</p>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={blocked !== null}
          className="btn btn-ghost btn-sm mt-4"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t("button", { n: number })}
        </button>
      ) : (
        <div role="group" aria-label={t("confirmLabel")} className="pop-in mt-4 rounded-xl border border-primary/40 bg-primary/10 p-4">
          <p className="text-sm">
            {t.rich("confirmBody", { n: number, next: number + 1, b: (c) => <strong>{c}</strong> })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={reset} disabled={busy} className="btn btn-sm">
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {t("yes", { n: number })}
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={busy} className="btn btn-ghost btn-sm">
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
      {blocked && <p className="mt-2 text-xs text-muted-foreground">{blocked}</p>}
      {error && (
        <p role="alert" className="mt-2 text-sm text-primary">
          {error}
        </p>
      )}
    </section>
  )
}
