import { Info } from "lucide-react"
import { useTranslations } from "next-intl"

/** The line every Akun Latihan screen carries. */
export function DemoDisclaimer() {
  const t = useTranslations("demo")
  return (
    <p role="note" className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
      {t("disclaimer")}
    </p>
  )
}
