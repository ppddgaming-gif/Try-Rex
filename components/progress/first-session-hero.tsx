import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/card"
import { Rex } from "@/components/rex-mascot"

/** Shown instead of the stat row until the first answer: the next lesson is the only thing that matters. */
export function FirstSessionHero() {
  return (
    <Card className="flex items-center gap-5 sm:p-7">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold">Mulai sesi pertamamu</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">5 soal · sekitar 5 menit · tanpa risiko uang</p>
        <Link href="/trading-game" className="btn mt-5">
          Mulai sekarang <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {/* 80px on mobile, 120px from lg; CSS size overrides the SVG attributes. */}
      <Rex size={120} mood="happy" className="h-20 w-20 lg:h-[120px] lg:w-[120px]" />
    </Card>
  )
}
