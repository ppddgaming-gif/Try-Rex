const EXP_TABLE = {
  easy:   25,
  medium: 75,
  hard:   150
}

export function evaluateDecision(userChoice, futureCandles, difficulty) {
  if (!futureCandles || futureCandles.length === 0) return null

  const entryPrice = futureCandles[0].open
  const finalPrice = futureCandles[futureCandles.length - 1].close

  const changePercent = ((finalPrice - entryPrice) / entryPrice) * 100

  let correctChoice
  if (changePercent > 0.1)       correctChoice = 'buy'
  else if (changePercent < -0.1) correctChoice = 'sell'
  else                           correctChoice = 'wait'

  const isCorrect = userChoice.toLowerCase() === correctChoice

  return {
    isCorrect,
    correctChoice,
    userChoice,
    changePercent: changePercent.toFixed(2),
    expGained:     isCorrect ? EXP_TABLE[difficulty] : 0,
    feedback: isCorrect
      ? `✅ Benar! Harga ${changePercent > 0 ? 'naik' : 'turun'} ${Math.abs(changePercent).toFixed(2)}%`
      : `❌ Salah! Jawaban benar: ${correctChoice.toUpperCase()}`
  }
}