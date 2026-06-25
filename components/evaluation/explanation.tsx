import { Card } from "@/components/card"
import { RexMascot } from "@/components/rex-mascot"
import { XCircle, Lightbulb } from "lucide-react"

const reasons = [
  "Harga masih berada di area resistance kuat (1.09200 - 1.09000).",
  "Belum ada konfirmasi reversal yang jelas.",
  "Trend sebelumnya masih cenderung naik (market masih bullish).",
  "Entry terlalu cepat sebelum ada rejection di area resistance.",
]

export function Explanation() {
  return (
    <Card className="relative flex h-full flex-col overflow-hidden">
      <h2 className="text-base font-semibold">Penjelasan TRY-REX</h2>

      <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <XCircle className="h-5 w-5 text-danger" />
          <span>
            <span className="text-danger">SELL</span> kurang tepat karena:
          </span>
        </p>
        <ul className="mt-3 flex max-w-[78%] flex-col gap-2.5">
          {reasons.map((r) => (
            <li key={r} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Lightbulb className="h-4 w-4" /> Saran TRY-REX
        </p>
        <p className="mt-2 max-w-[78%] text-sm leading-relaxed text-foreground/90">
          Tunggu konfirmasi rejection di area resistance, seperti pin bar atau engulfing bearish,
          sebelum mengambil posisi SELL.
        </p>
      </div>

      <RexMascot className="absolute -bottom-2 right-0 opacity-90" />
    </Card>
  )
}
