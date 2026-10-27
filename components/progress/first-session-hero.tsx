import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card } from "@/components/card"
import { RexArt } from "@/components/rex-mascot"
import { isMotivation } from "@/lib/onboarding"

/**
 * Shown instead of the stat row until the first answer: the next lesson is
 * the only thing that matters. `motivation` is the /start answer to "why
 * trading?", which picks Rex's line.
 */
export function FirstSessionHero({ motivation }: { motivation?: string | null }) {
  const t = useTranslations("progress.hero")
  const tm = useTranslations("onboarding.motivationLines")
  const line = isMotivation(motivation) ? tm(motivation) : null
  return (
    <Card className="glow-card flex items-center gap-5 sm:p-7">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("meta")}</p>
        {line && <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/85">{line}</p>}
        <Link href="/trading-game" className="btn mt-5">
          {t("start")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {/* 80px on mobile, 120px from lg; CSS size overrides the SVG attributes. */}
      <RexArt size={150} mood="happy" priority fluid className="float h-24 w-24 lg:h-[150px] lg:w-[150px]" />
    </Card>
  )
}
