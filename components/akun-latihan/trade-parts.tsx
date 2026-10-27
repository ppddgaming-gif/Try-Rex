import { Check, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { RexArt } from "@/components/rex-mascot"
import { CHECK_IDS, checkLabel, type Checks } from "@/lib/demo/disiplin"
import type { ExitReason } from "@/lib/demo/fills"
import { rexCommentText, type RexComment } from "@/lib/demo/rex-comments"

// Pieces a closed trade shows wherever it appears: the trading screen's
// result card and the journal.

/** Why a trade closed, in two words: demo.ui.exit.<reason>. */
export function useExitLabel() {
  const t = useTranslations("demo.ui.exit")
  return (reason: ExitReason) => t(reason)
}

/** The five Disiplin checks, ✓ or ✗. Amber and grey: they aren't price direction. */
export function CheckList({ checks }: { checks: Checks }) {
  const t = useTranslations("demo.ui.checksList")
  const root = useTranslations()
  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {CHECK_IDS.map((id) => {
        const ok = checks[id]
        return (
          <li key={id} className="flex items-center gap-2">
            {ok ? (
              <Check className="h-4 w-4 shrink-0 text-primary" aria-label={t("pass")} />
            ) : (
              <X className="h-4 w-4 shrink-0 text-muted-foreground" aria-label={t("fail")} />
            )}
            <span className={ok ? "" : "text-muted-foreground"}>{checkLabel(id, root)}</span>
          </li>
        )
      })}
    </ul>
  )
}

/** Rex's comments on a trade (lib/demo/rex-comments.ts). */
export function RexComments({ comments }: { comments: RexComment[] }) {
  const t = useTranslations("demo.ui.checksList")
  const root = useTranslations()
  if (comments.length === 0) return null
  const good = comments.every((c) => c.tone === "good")
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3">
      <RexArt size={44} mood={good ? "happy" : "thinking"} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-primary">{t("rexTitle")}</p>
        <ul className="mt-1 flex flex-col gap-1.5 text-sm leading-relaxed">
          {comments.map((c) => (
            <li key={c.id}>{rexCommentText(c, root)}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
