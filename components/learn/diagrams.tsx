// Teaching diagrams for Belajar 101: plain SVG, coloured from the theme
// tokens so they follow light and dark mode. Unlike CandlestickChart these
// keep their aspect ratio, so the labels never stretch.

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
        { y: 30, text: "High (tertinggi)" },
        { y: openY, text: "Open (buka)" },
        { y: closeY, text: "Close (tutup)" },
        { y: 250, text: "Low (terendah)" },
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
  return (
    <Frame title="Anatomi candle: body (tebal) dan sumbu (tipis). Hijau ditutup lebih tinggi, merah lebih rendah." viewBox="0 0 560 300">
      <LabelledCandle x={200} up />
      <LabelledCandle x={360} up={false} />
      <text x={280} y={60} textAnchor="middle" {...label}>
        sumbu atas
      </text>
      <text x={280} y={145} textAnchor="middle" {...strong}>
        body
      </text>
      <text x={280} y={232} textAnchor="middle" {...label}>
        sumbu bawah
      </text>
    </Frame>
  )
}

export function TrendShapes() {
  const shapes = [
    { title: "Naik", sub: "puncak & lembah makin tinggi", pts: "10,150 45,110 70,125 105,80 130,95 165,45 190,60", color: "var(--success)" },
    { title: "Turun", sub: "puncak & lembah makin rendah", pts: "10,40 45,80 70,65 105,110 130,95 165,145 190,130", color: "var(--danger)" },
    { title: "Menyamping", sub: "bolak-balik di rentang", pts: "10,95 40,60 70,125 100,62 130,122 160,64 190,100", color: "var(--wait)" },
  ]
  return (
    <Frame title="Tiga bentuk trend. Lihat arah puncak dan lembahnya, bukan satu candle." viewBox="0 0 660 230">
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
  return (
    <Frame title="Posisi BUY dengan rasio 1:2: risiko 20 pip ke stop loss, target 40 pip ke take profit." viewBox="0 0 560 280">
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
        +40 pip
      </text>
      <text x={240} y={210} textAnchor="middle" {...strong}>
        −20 pip
      </text>
      <text x={20} y={140} {...label}>
        Rasio 1:2
      </text>
    </Frame>
  )
}

export function Leverage() {
  return (
    <Frame title="Leverage 1:100. Gerak 1% pada posisi 100 juta = 1 juta: seluruh modal pada contoh ini." viewBox="0 0 560 250">
      <text x={40} y={40} {...strong}>
        Modal
      </text>
      <rect x={40} y={52} width={8} height={40} rx={2} fill="var(--primary)" />
      <text x={58} y={78} {...label}>
        Rp1 juta
      </text>
      <text x={40} y={132} {...strong}>
        Ukuran posisi
      </text>
      <rect x={40} y={144} width={480} height={40} rx={6} fill="var(--primary)" opacity={0.35} />
      <text x={52} y={170} {...strong}>
        Rp100 juta
      </text>
      <rect x={515} y={144} width={5} height={40} fill="var(--danger)" />
      <text x={520} y={210} textAnchor="end" {...label} fill="var(--danger)">
        1% melawanmu = −Rp1 juta
      </text>
    </Frame>
  )
}

export const DIAGRAMS = {
  "candle-anatomy": CandleAnatomy,
  "trend-shapes": TrendShapes,
  "risk-reward": RiskReward,
  leverage: Leverage,
} as const
