/**
 * A short burst of confetti from the top of its (relative) parent. Pieces are
 * laid out with a golden-ratio spread instead of Math.random, so the server
 * and the browser draw the same thing. Colours are brand and neutral tokens:
 * green and red stay reserved for price direction. Hidden from screen
 * readers; switched off under reduced motion (.confetti in globals.css).
 */
const COLORS = ["var(--primary)", "var(--primary-hi)", "var(--wait)", "var(--foreground)", "var(--rex-shade)"]

export function Confetti({ pieces = 28 }: { pieces?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible">
      {Array.from({ length: pieces }, (_, i) => {
        const t = (i * 0.618033988749895) % 1
        const u = (i * 0.414213562373095) % 1
        const style = {
          left: `${8 + t * 84}%`,
          background: COLORS[i % COLORS.length],
          "--dx": `${Math.round((u - 0.5) * 160)}px`,
          "--dy": `${Math.round(140 + t * 160)}px`,
          "--spin": `${Math.round((u - 0.5) * 900)}deg`,
          "--delay": `${Math.round(u * 220)}ms`,
          "--dur": `${1300 + Math.round(t * 700)}ms`,
          borderRadius: i % 3 === 0 ? "9999px" : "2px",
        } as React.CSSProperties
        return <span key={i} className="confetti" style={style} />
      })}
    </div>
  )
}
