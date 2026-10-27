"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle, Wallet } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card } from "@/components/card"
import { RexArt } from "@/components/rex-mascot"
import { usePostJson } from "@/components/akun-latihan/post-json"

/**
 * "Buat Akun Latihan": one short explanation, one button. The balance shown
 * is the server's config value, passed in; the request carries no numbers.
 */
export function CreateAccount({ startingBalance, leverage }: { startingBalance: string; leverage: number }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [, startTransition] = useTransition()
  const postJson = usePostJson()
  const t = useTranslations("demo.ui.create")

  async function create() {
    setBusy(true)
    setError(null)
    const res = await postJson("/api/akun-latihan/account", {})
    if (res.error) {
      setError(res.error)
      setBusy(false)
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <Card className="glow-card flex flex-col items-center py-12 text-center sm:p-12">
      <RexArt size={128} mood="happy" priority className="float" />
      <h2 className="mt-5 text-2xl font-bold">{t("title")}</h2>
      <p className="mt-3 max-w-lg text-muted-foreground">
        {t.rich("body", {
          balance: startingBalance,
          leverage,
          b: (c) => <strong className="font-mono text-foreground">{c}</strong>,
        })}
      </p>
      <button type="button" onClick={create} disabled={busy} className="btn btn-lg mt-8">
        {busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Wallet className="h-5 w-5" />}
        {t("button")}
      </button>
      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}
    </Card>
  )
}
