import Link from "next/link"
import { Rex } from "@/components/rex-mascot"

// Brand lockup shared by the app shell's sidebar and mobile bar. `size` picks
// between the roomier sidebar treatment and the compact mobile bar one. The
// wordmark stays one colour: Rex already carries the amber.
export function BrandMark({
  size = "sm",
  onNavigate,
}: {
  size?: "sm" | "lg"
  onNavigate?: () => void
}) {
  const lg = size === "lg"

  return (
    <Link href="/" onClick={onNavigate} className={lg ? "flex items-center gap-3 px-2" : "flex items-center gap-2.5"}>
      <Rex size={lg ? 38 : 30} />
      <div className="leading-tight">
        <p
          className={[
            "font-display font-extrabold tracking-[-0.02em]",
            lg ? "text-[20px]" : "text-[17px]",
          ].join(" ")}
        >
          TRY-REX
        </p>
        {lg && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">AI Trading Mentor</p>
        )}
      </div>
    </Link>
  )
}
