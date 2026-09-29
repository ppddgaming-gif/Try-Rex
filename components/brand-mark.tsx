import Link from "next/link"

// Brand lockup shared by the app shell's sidebar and mobile bar. `size` picks
// between the roomier sidebar treatment and the compact mobile bar one.
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
      <div
        className={[
          "flex items-center justify-center bg-primary/15 ring-1 ring-primary/30",
          lg ? "h-11 w-11 rounded-xl" : "h-9 w-9 rounded-lg",
        ].join(" ")}
      >
        <span className={lg ? "text-2xl" : "text-lg"} aria-hidden="true">
          🦖
        </span>
      </div>
      <div className="leading-tight">
        <p className={lg ? "text-lg font-extrabold tracking-tight" : "text-base font-extrabold tracking-tight"}>
          TRY<span className="text-primary">-REX</span>
        </p>
        {lg && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            AI Trading Mentor
          </p>
        )}
      </div>
    </Link>
  )
}
