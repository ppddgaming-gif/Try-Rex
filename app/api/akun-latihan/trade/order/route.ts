import { authed, json, numberOrNull, respond } from "@/lib/demo/route"
import { placeOrder } from "@/lib/demo/trading"

/**
 * POST { side, lot, slPips, tpPips, reasons }: a market order at the current
 * candle's close. Price, costs, margin and risk are all worked out on the
 * server; the body only carries the plan.
 */
export async function POST(request: Request) {
  const auth = await authed(request)
  if (!auth.ok) return auth.response

  const { side, lot, slPips, tpPips, reasons } = auth.body
  const sl = numberOrNull(slPips)
  const tp = numberOrNull(tpPips)
  if (
    (side !== "buy" && side !== "sell") ||
    typeof lot !== "number" ||
    sl === undefined ||
    tp === undefined ||
    !Array.isArray(reasons) ||
    !reasons.every((r) => typeof r === "string")
  ) {
    return json({ error: "Format order tidak valid." }, 400)
  }
  return respond(await placeOrder(auth.userId, { side, lot, slPips: sl, tpPips: tp, reasons: reasons as string[] }))
}
