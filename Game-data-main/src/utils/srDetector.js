export function detectSupportResistance(candles, sensitivity = 0.0015) {
  const swingHighs = []
  const swingLows  = []

  for (let i = 2; i < candles.length - 2; i++) {
    const prev2   = candles[i - 2]
    const prev1   = candles[i - 1]
    const current = candles[i]
    const next1   = candles[i + 1]
    const next2   = candles[i + 2]

    if (current.high > prev1.high && current.high > prev2.high &&
        current.high > next1.high && current.high > next2.high) {
      swingHighs.push(current)
    }

    if (current.low < prev1.low && current.low < prev2.low &&
        current.low < next1.low && current.low < next2.low) {
      swingLows.push(current)
    }
  }

  // ↓ semua ini tetap di DALAM fungsi, sebelum kurung kurawal penutup
  const allLevels = [
    ...swingHighs.map(c => ({ price: c.high, type: 'resistance' })),
    ...swingLows.map(c  => ({ price: c.low,  type: 'support'    }))
  ]

  const avgPrice  = candles.reduce((s, c) => s + c.close, 0) / candles.length
  const threshold = avgPrice * sensitivity

  const clusters = []
  const used = new Set()

  allLevels.forEach((level, i) => {
    if (used.has(i)) return
    const cluster = [level]
    used.add(i)

    allLevels.forEach((other, j) => {
      if (!used.has(j) && Math.abs(level.price - other.price) < threshold) {
        cluster.push(other)
        used.add(j)
      }
    })

    const avgZonePrice = cluster.reduce((s, l) => s + l.price, 0) / cluster.length
    clusters.push({ price: avgZonePrice, type: level.type, touches: cluster.length })
  })

  return clusters
    .sort((a, b) => b.touches - a.touches)
    .slice(0, 3)

}  