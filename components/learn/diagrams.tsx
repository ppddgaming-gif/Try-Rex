// Teaching diagrams for Belajar 101: plain SVG, coloured from the theme
// tokens so they follow light and dark mode. Unlike CandlestickChart these
// keep their aspect ratio, so the labels never stretch. Labels: learn.diagrams.

import { useTranslations } from "next-intl"
import { SESSIONS } from "@/lib/learn/sessions"

const label = { fill: "var(--muted-foreground)", fontSize: 13, fontFamily: "var(--font-sans)" }
const strong = { fill: "var(--foreground)", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-sans)" }

function Frame({ title, children, viewBox }: { title: string; children: React.ReactNode; viewBox: string }) {
  return (
    <figure className="rounded-2xl border border-border bg-inset p-4 sm:p-6">
      <svg viewBox={viewBox} role="img" aria-label={title} className="mx-auto h-auto w-full max-w-xl">
        {children}
      </svg>
      <figcaption className="mt-3 text-center text-xs text-muted-foreground">{title}</figcaption>
    </figure>
  )
}

/** One candle, labelled: high, open/close, body, wicks, low. */
function LabelledCandle({ x, up }: { x: number; up: boolean }) {
  const t = useTranslations("learn.diagrams")
  const color = up ? "var(--success)" : "var(--danger)"
  const [openY, closeY] = up ? [190, 90] : [90, 190]
  const side = up ? -1 : 1
  const lx = x + side * 70
  const anchor = up ? "end" : "start"
  return (
    <g>
      <line x1={x} x2={x} y1={30} y2={250} stroke={color} strokeWidth={3} />
      <rect x={x - 22} y={90} width={44} height={100} rx={3} fill={color} />
      {/* Leader lines and labels */}
      {[
        { y: 30, text: t("high") },
        { y: openY, text: t("open") },
        { y: closeY, text: t("close") },
        { y: 250, text: t("low") },
      ].map((l) => (
        <g key={l.text}>
          <line x1={x + side * 26} x2={lx - side * 4} y1={l.y} y2={l.y} stroke="var(--border)" strokeDasharray="3 3" />
          <text x={lx} y={l.y + 4} textAnchor={anchor} {...label}>
            {l.text}
          </text>
        </g>
      ))}
      <text x={x} y={285} textAnchor="middle" {...strong}>
        {up ? "Bullish" : "Bearish"}
      </text>
    </g>
  )
}

export function CandleAnatomy() {
  const t = useTranslations("learn.diagrams")
  return (
    <Frame title={t("anatomyTitle")} viewBox="0 0 560 300">
      <LabelledCandle x={200} up />
      <LabelledCandle x={360} up={false} />
      <text x={280} y={60} textAnchor="middle" {...label}>
        {t("upperWick")}
      </text>
      <text x={280} y={145} textAnchor="middle" {...strong}>
        {t("body")}
      </text>
      <text x={280} y={232} textAnchor="middle" {...label}>
        {t("lowerWick")}
      </text>
    </Frame>
  )
}

export function TrendShapes() {
  const t = useTranslations("learn.diagrams")
  const shapes = [
    { title: t("up"), sub: t("upSub"), pts: "10,150 45,110 70,125 105,80 130,95 165,45 190,60", color: "var(--success)" },
    { title: t("down"), sub: t("downSub"), pts: "10,40 45,80 70,65 105,110 130,95 165,145 190,130", color: "var(--danger)" },
    { title: t("flat"), sub: t("flatSub"), pts: "10,95 40,60 70,125 100,62 130,122 160,64 190,100", color: "var(--wait)" },
  ]
  return (
    <Frame title={t("trendTitle")} viewBox="0 0 660 230">
      {shapes.map((s, i) => (
        <g key={s.title} transform={`translate(${i * 220 + 10}, 10)`}>
          <rect width={200} height={170} rx={12} fill="var(--card)" stroke="var(--border)" />
          <polyline points={s.pts} fill="none" stroke={s.color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          <text x={100} y={198} textAnchor="middle" {...strong}>
            {s.title}
          </text>
          <text x={100} y={216} textAnchor="middle" {...label} fontSize={11}>
            {s.sub}
          </text>
        </g>
      ))}
    </Frame>
  )
}

export function RiskReward() {
  const t = useTranslations("learn.diagrams")
  return (
    <Frame title={t("rrTitle")} viewBox="0 0 560 280">
      <rect x={150} y={30} width={180} height={140} rx={6} fill="var(--success)" opacity={0.16} />
      <rect x={150} y={170} width={180} height={70} rx={6} fill="var(--danger)" opacity={0.16} />
      <line x1={120} x2={360} y1={30} y2={30} stroke="var(--success)" strokeWidth={2} strokeDasharray="6 4" />
      <line x1={120} x2={360} y1={170} y2={170} stroke="var(--foreground)" strokeWidth={2} />
      <line x1={120} x2={360} y1={240} y2={240} stroke="var(--danger)" strokeWidth={2} strokeDasharray="6 4" />
      <text x={372} y={34} {...strong} fill="var(--success)">
        Take profit
      </text>
      <text x={372} y={174} {...strong}>
        Entry
      </text>
      <text x={372} y={244} {...strong} fill="var(--danger)">
        Stop loss
      </text>
      <text x={240} y={104} textAnchor="middle" {...strong}>
        {t("plus40")}
      </text>
      <text x={240} y={210} textAnchor="middle" {...strong}>
        {t("minus20")}
      </text>
      <text x={20} y={140} {...label}>
        {t("ratio")}
      </text>
    </Frame>
  )
}

export function Leverage() {
  const t = useTranslations("learn.diagrams")
  return (
    <Frame title={t("levTitle")} viewBox="0 0 560 250">
      <text x={40} y={40} {...strong}>
        {t("capital")}
      </text>
      <rect x={40} y={52} width={8} height={40} rx={2} fill="var(--primary)" />
      <text x={58} y={78} {...label}>
        {t("capitalValue")}
      </text>
      <text x={40} y={132} {...strong}>
        {t("size")}
      </text>
      <rect x={40} y={144} width={480} height={40} rx={6} fill="var(--primary)" opacity={0.35} />
      <text x={52} y={170} {...strong}>
        {t("sizeValue")}
      </text>
      <rect x={515} y={144} width={5} height={40} fill="var(--danger)" />
      <text x={520} y={210} textAnchor="end" {...label} fill="var(--danger)">
        {t("against")}
      </text>
    </Frame>
  )
}

/** A forex quote: base/quote, and the two prices with the spread between them. */
export function PairQuote() {
  const t = useTranslations("learn.diagrams")
  return (
    <Frame title={t("pairTitle")} viewBox="0 0 560 260">
      <text x={140} y={58} textAnchor="middle" fontSize={44} fontWeight={800} fill="var(--foreground)" fontFamily="var(--font-mono)">
        EUR
      </text>
      <text x={280} y={58} textAnchor="middle" fontSize={44} fontWeight={800} fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
        /
      </text>
      <text x={420} y={58} textAnchor="middle" fontSize={44} fontWeight={800} fill="var(--foreground)" fontFamily="var(--font-mono)">
        USD
      </text>
      <text x={140} y={84} textAnchor="middle" {...label}>
        {t("base")}
      </text>
      <text x={420} y={84} textAnchor="middle" {...label}>
        {t("quote")}
      </text>
      <rect x={40} y={118} width={220} height={78} rx={12} fill="var(--card)" stroke="var(--border)" />
      <rect x={300} y={118} width={220} height={78} rx={12} fill="var(--card)" stroke="var(--border)" />
      <text x={150} y={146} textAnchor="middle" {...label}>
        {t("bidLabel")}
      </text>
      <text x={410} y={146} textAnchor="middle" {...label}>
        {t("askLabel")}
      </text>
      <text x={150} y={180} textAnchor="middle" fontSize={24} fontWeight={700} fill="var(--foreground)" fontFamily="var(--font-mono)">
        1.08500
      </text>
      <text x={410} y={180} textAnchor="middle" fontSize={24} fontWeight={700} fill="var(--foreground)" fontFamily="var(--font-mono)">
        1.08510
      </text>
      <line x1={262} x2={298} y1={157} y2={157} stroke="var(--primary)" strokeWidth={2} />
      <text x={280} y={232} textAnchor="middle" {...strong} fill="var(--primary)">
        {t("spreadLabel")}
      </text>
    </Frame>
  )
}

/** The four sessions on a 24-hour WIB axis (lib/learn/sessions.ts), with the London–New York overlap marked. */
export function Sessions() {
  const t = useTranslations("learn.diagrams")
  const x0 = 110
  const w = 420
  const hx = (h: number) => x0 + (h / 24) * w
  const rows = SESSIONS.map((s, i) => ({ s, y: 40 + i * 44 }))
  const london = SESSIONS.find((s) => s.id === "london")!
  const ny = SESSIONS.find((s) => s.id === "newyork")!
  return (
    <Frame title={t("sessionsTitle")} viewBox="0 0 560 280">
      <rect x={hx(ny.open)} y={24} width={hx(london.close) - hx(ny.open)} height={186} fill="var(--primary)" opacity={0.1} />
      {rows.map(({ s, y }) => {
        // A session past midnight wraps to the start of the axis.
        const parts = s.close > 24 ? [[s.open, 24], [0, s.close - 24]] : [[s.open, s.close]]
        return (
          <g key={s.id}>
            <text x={x0 - 12} y={y + 18} textAnchor="end" {...strong}>
              {s.city}
            </text>
            {parts.map(([a, b]) => (
              <rect key={a} x={hx(a)} y={y + 4} width={hx(b) - hx(a)} height={20} rx={5} fill="var(--wait)" opacity={0.75} />
            ))}
          </g>
        )
      })}
      {[0, 6, 12, 18, 24].map((h) => (
        <g key={h}>
          <line x1={hx(h)} x2={hx(h)} y1={24} y2={214} stroke="var(--border)" strokeDasharray="3 3" />
          <text x={hx(h)} y={232} textAnchor="middle" {...label}>
            {String(h).padStart(2, "0")}.00
          </text>
        </g>
      ))}
      <text x={hx(london.close)} y={262} textAnchor="end" {...label} fill="var(--primary)">
        {t("overlap")}
      </text>
    </Frame>
  )
}

export const DIAGRAMS = {
  "candle-anatomy": CandleAnatomy,
  "trend-shapes": TrendShapes,
  "risk-reward": RiskReward,
  leverage: Leverage,
  "pair-quote": PairQuote,
  sessions: Sessions,
} as const
