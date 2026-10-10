"use client"

import { useCallback } from "react"
import { useTranslations } from "next-intl"

type Fallback = { generic: string; network: string }

/**
 * POSTs JSON to an Akun Latihan route and returns the parsed body. Errors
 * come back as { error }: the server's message (already in the player's
 * language), or `fallback` when the request itself failed.
 */
export async function postJson<T = Record<string, unknown>>(
  url: string,
  body: unknown,
  fallback: Fallback,
): Promise<T & { error?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as T & { error?: string }
    if (!res.ok && !data.error) return { ...data, error: fallback.generic }
    return data
  } catch {
    return { error: fallback.network } as T & { error?: string }
  }
}

/** postJson with the fallback messages in the player's language. */
export function usePostJson() {
  const t = useTranslations("common.errors")
  return useCallback(
    <T = Record<string, unknown>>(url: string, body: unknown) =>
      postJson<T>(url, body, { generic: t("generic"), network: t("network") }),
    [t],
  )
}
