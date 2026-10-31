import "server-only"
import type { LlmMessage } from "@/lib/demo/rex-chat"

// The one LLM call in the app: Groq's OpenAI-compatible chat completions
// endpoint, with plain fetch (no SDK). Env: GROQ_API_KEY (required; without it
// the features that call this stay hidden) and GROQ_MODEL (optional). Swap the
// provider by replacing this file; callers only see `llmReply`.

const URL = "https://api.groq.com/openai/v1/chat/completions"
/** Groq retires models often: override with GROQ_MODEL rather than editing this. */
const DEFAULT_MODEL = "openai/gpt-oss-120b"
const TIMEOUT_MS = 25_000

export const llmConfigured = () => Boolean(process.env.GROQ_API_KEY)

export type LlmResult = { ok: true; text: string } | { ok: false; reason: "unconfigured" | "busy" | "failed" }

/** One reply to `messages`, or why there is none. Never throws. */
export async function llmReply(messages: LlmMessage[], maxTokens: number): Promise<LlmResult> {
  const key = process.env.GROQ_API_KEY
  if (!key) return { ok: false, reason: "unconfigured" }
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model, messages, max_completion_tokens: maxTokens, temperature: 0.4 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    })
    if (res.status === 429) return { ok: false, reason: "busy" }
    if (!res.ok) {
      console.error(`Groq: ${res.status} ${(await res.text().catch(() => "")).slice(0, 300)}`)
      return { ok: false, reason: "failed" }
    }
    const data = (await res.json()) as { choices?: { message?: { content?: unknown } }[] }
    const text = data.choices?.[0]?.message?.content
    return typeof text === "string" && text.trim() ? { ok: true, text } : { ok: false, reason: "failed" }
  } catch (e) {
    console.error("Groq: request failed", e)
    return { ok: false, reason: "failed" }
  }
}
