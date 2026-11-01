import "server-only"
import type { LlmMessage } from "@/lib/demo/rex-chat"

// The one LLM call in the app: Groq's OpenAI-compatible chat completions
// endpoint, with plain fetch (no SDK). Env: GROQ_API_KEY (required; without it
// the features that call this stay hidden), GROQ_MODEL and GROQ_FALLBACK_MODEL
// (optional). Swap the provider by replacing this file; callers only see
// `llmReply`.

const URL = "https://api.groq.com/openai/v1/chat/completions"
/** Groq retires models often: override with the env vars rather than editing these. */
const DEFAULT_MODEL = "openai/gpt-oss-120b"
/**
 * Tried when the first model is rate-limited. Groq's limits are per model
 * (free tier: 8,000 tokens a minute each), so a second model roughly doubles
 * what the app can answer before players see "Rex lagi sibuk".
 */
const DEFAULT_FALLBACK = "openai/gpt-oss-20b"
const TIMEOUT_MS = 25_000

export const llmConfigured = () => Boolean(process.env.GROQ_API_KEY)

/** Token counts as Groq reports them, for logging; null when the reply had none. */
export type LlmUsage = { prompt: number; completion: number } | null

export type LlmResult =
  | { ok: true; text: string; model: string; usage: LlmUsage }
  | { ok: false; reason: "unconfigured" | "busy" | "failed"; model?: string }

/** One reply to `messages`, or why there is none. Never throws. */
export async function llmReply(messages: LlmMessage[], maxTokens: number, timeoutMs = TIMEOUT_MS): Promise<LlmResult> {
  const key = process.env.GROQ_API_KEY
  if (!key) return { ok: false, reason: "unconfigured" }
  const primary = process.env.GROQ_MODEL || DEFAULT_MODEL
  const fallback = process.env.GROQ_FALLBACK_MODEL || DEFAULT_FALLBACK
  const first = await complete(key, primary, messages, maxTokens, timeoutMs)
  if (first.ok || first.reason !== "busy" || fallback === primary) return first
  return complete(key, fallback, messages, maxTokens, timeoutMs)
}

async function complete(key: string, model: string, messages: LlmMessage[], maxTokens: number, timeoutMs: number): Promise<LlmResult> {
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        max_completion_tokens: maxTokens,
        temperature: 0.4,
        // The gpt-oss models think before answering; a short explanation needs little of it.
        ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    })
    if (res.status === 429) return { ok: false, reason: "busy", model }
    if (!res.ok) {
      console.error(`Groq ${model}: ${res.status} ${(await res.text().catch(() => "")).slice(0, 300)}`)
      return { ok: false, reason: "failed", model }
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: unknown } }[]
      usage?: { prompt_tokens?: unknown; completion_tokens?: unknown }
    }
    const text = data.choices?.[0]?.message?.content
    const u = data.usage
    const usage: LlmUsage =
      u && typeof u.prompt_tokens === "number" && typeof u.completion_tokens === "number" ? { prompt: u.prompt_tokens, completion: u.completion_tokens } : null
    return typeof text === "string" && text.trim() ? { ok: true, text, model, usage } : { ok: false, reason: "failed", model }
  } catch (e) {
    console.error(`Groq ${model}: request failed`, e)
    return { ok: false, reason: "failed", model }
  }
}
