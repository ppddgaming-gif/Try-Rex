export function detectTrendlines(candles) {
  const swingHighPoints = []
  const swingLowPoints  = []

  for (let i = 2; i < candles.length - 2; i++) {
    const prev2   = candles[i - 2]
    const prev1   = candles[i - 1]
    const current = candles[i]
    const next1   = candles[i + 1]
    const next2   = candles[i + 2]

    if (current.high > prev1.high && current.high > prev2.high &&
        current.high > next1.high && current.high > next2.high) {
      swingHighPoints.push({ x: i, y: current.high, time: current.time })
    }

    if (current.low < prev1.low && current.low < prev2.low &&
        current.low < next1.low && current.low < next2.low) {
      swingLowPoints.push({ x: i, y: current.low, time: current.time })
    }
  }

  function linearRegression(points) {
    const n = points.length
    if (n < 2) return null  

    const sumX  = points.reduce((s, p) => s + p.x, 0)
    const sumY  = points.reduce((s, p) => s + p.y, 0)
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
    const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0)

    const slope     = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept }
  }

  const uptrendReg   = linearRegression(swingLowPoints)   
  const downtrendReg = linearRegression(swingHighPoints) 

  const n = candles.length

  function makeLine(reg, points, label) {
    if (!reg || points.length < 2) return null
    return {
      startTime:  candles[0].time,
      endTime:    candles[n - 1].time,
      startPrice: reg.intercept,
      endPrice:   reg.slope * (n - 1) + reg.intercept,
      slope:      label
    }
  }

  return {
    uptrend:   makeLine(uptrendReg,   swingLowPoints,  'uptrend'),
    downtrend: makeLine(downtrendReg, swingHighPoints, 'downtrend')
  }
}