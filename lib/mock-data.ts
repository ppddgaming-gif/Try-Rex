export type Candle = {
  o: number
  h: number
  l: number
  c: number
}

// Deterministic mock OHLC series for EURUSD H1 (price ~1.08 - 1.092)
function buildSeries(seed: number, count: number): Candle[] {
  const candles: Candle[] = []
  let price = 1.0805
  let s = seed
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  for (let i = 0; i < count; i++) {
    const drift = Math.sin(i / 6) * 0.0009 + (rand() - 0.45) * 0.0012
    const o = price
    const c = Math.max(1.0795, Math.min(1.0925, o + drift))
    const h = Math.max(o, c) + rand() * 0.0009
    const l = Math.min(o, c) - rand() * 0.0009
    candles.push({ o, h, l, c })
    price = c
  }
  return candles
}

export const tradingGameCandles = buildSeries(42, 60)

// Evaluation chart: a rise into resistance then a drop (so SELL near top looks early)
export const evaluationCandles = buildSeries(7, 48)

export const aspectMetrics = [
  { key: "trend", label: "Trend Reading", value: 72, desc: "Kemampuan membaca arah dan kekuatan trend" },
  { key: "entry", label: "Entry Timing", value: 64, desc: "Ketepatan memilih waktu entry" },
  { key: "risk", label: "Risk Management", value: 58, desc: "Manajemen risiko dan money management" },
  { key: "structure", label: "Market Structure", value: 78, desc: "Memahami struktur market (Support / Resistance)" },
]

export const recentActivities = [
  { id: 48, aspect: "Trend Reading", result: "Benar", xp: 50, time: "2 jam lalu" },
  { id: 47, aspect: "Entry Timing", result: "Salah", xp: 0, time: "4 jam lalu" },
  { id: 46, aspect: "Market Structure", result: "Benar", xp: 50, time: "1 hari lalu" },
]
