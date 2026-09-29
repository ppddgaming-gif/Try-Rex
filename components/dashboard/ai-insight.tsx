import { Card } from "@/components/card"
import { Disclosure } from "@/components/disclosure"
import { RexMascot } from "@/components/rex-mascot"
import { recommendations } from "@/lib/mock-data"
import { Sparkles } from "lucide-react"

export function AiInsight() {
  return (
    <Card className="relative overflow-hidden">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Sparkles className="h-4 w-4 text-primary" />
        AI Insight dari TRY-REX
      </h2>

      <div className="mt-4 flex max-w-[62%] flex-col">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm leading-relaxed text-foreground/90">
            <span className="mr-1 text-2xl leading-none text-primary">&ldquo;</span>
            Kamu sudah cukup baik dalam membaca trend! Fokus lebih pada entry timing, sering kali kamu
            entry terlalu cepat sebelum konfirmasi terjadi.
          </p>
        </div>

        <Disclosure
          label="Lihat Rekomendasi"
          closeLabel="Sembunyikan Rekomendasi"
          className="mt-4 flex flex-col gap-3"
        >
          {recommendations.map((r) => (
            <div key={r.title} className="rounded-xl border border-primary/30 bg-primary/10 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-primary">{r.title}</p>
                <span className="shrink-0 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {r.aspect}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </Disclosure>
      </div>

      <RexMascot className="absolute -bottom-2 right-2 opacity-90" />
    </Card>
  )
}
