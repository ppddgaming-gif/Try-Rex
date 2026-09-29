export function convertRawToOHLCV(rawData) {
  return rawData.map(row => {
    const dateStr     = row.date.replace(/\./g, '-')
    const fullDateStr = `${dateStr}T${row.time}Z`
    const unixMs      = new Date(fullDateStr).getTime()
    const unixSec     = Math.floor(unixMs / 1000)

    return {
      time:   unixSec,
      open:   row.open,
      high:   row.high,
      low:    row.low,
      close:  row.close,
      volume: row.volume
    }
  })
  .filter(c => !isNaN(c.time))
}

export function sliceGameData(candles, startIndex = 30) {
  const history = candles.slice(startIndex - 30, startIndex)
  const future  = candles.slice(startIndex, startIndex + 15)
  return { history, future }
}