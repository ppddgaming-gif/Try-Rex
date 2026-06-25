import { Card } from "@/components/card"
import { RexMascot } from "@/components/rex-mascot"
import { Sparkles, ChevronRight } from "lucide-react"

export function AiInsight() {
  return (
    <Card className="relative overflow-hidden">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Sparkles className="h-4 w-4 text-primary" />
        AI Insight dari TRY-REX
      </h2>

      <div className="mt-4 max-w-[62%]">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm leading-relaxed text-foreground/90">
            <span className="mr-1 text-2xl leading-none text-primary">&ldquo;</span>
            Kamu sudah cukup baik dalam membaca trend! Fokus lebih pada entry timing, sering kali kamu
            entry terlalu cepat sebelum konfirmasi terjadi.
          </p>
        </div>

        <button className="mt-4 flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
          Lihat Rekomendasi <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <RexMascot className="absolute -bottom-2 right-2 opacity-90" />
    </Card>
  )
}
