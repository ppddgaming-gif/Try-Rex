import { Lock } from "lucide-react"
import { useTranslations } from "next-intl"

/**
 * One skill. `null` means it hasn't been tested yet: a dashed empty track and
 * "Belum diuji", never a stand-in number. A number gets a solid bar.
 */
export function CompetencyMeter({ label, value }: { label: string; value: number | null }) {
  const t = useTranslations("progress")
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        {value === null ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" aria-hidden="true" /> {t("notTested")}
          </span>
        ) : (
          <span className="font-mono text-sm font-bold tabular-nums">{Math.round(value)}%</span>
        )}
      </div>
      {value === null ? (
        <div className="h-2 w-full rounded-full border border-dashed border-border" aria-hidden="true" />
      ) : (
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </div>
      )}
    </div>
  )
}
