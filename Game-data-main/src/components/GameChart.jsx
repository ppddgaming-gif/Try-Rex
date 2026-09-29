import { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import { CANDLES, sliceGameData } from '../utils/csvparse'

import { detectSupportResistance } from '../utils/srDetector'
import { detectTrendlines } from '../utils/trendlineDetector'

export default function GameChart({ onCorrect, onWrong }) {
  const chartRef  = useRef(null)
  const chartObj  = useRef(null)
  const seriesRef = useRef(null)

  const [gameData,  setGameData]  = useState(null)
  const [revealed,  setRevealed]  = useState(0)
  const [userChoice, setUserChoice] = useState(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const startIndex = Math.floor(Math.random() * (CANDLES.length - 45)) + 30
    const { history, future } = sliceGameData(CANDLES, startIndex)
    setGameData({ history, future })

    const chart = createChart(chartRef.current, {
      width:  chartRef.current.offsetWidth,
      height: 550,
      layout: {
        background: { color: '#1a1a2e' },
        textColor:  '#e0e0e0'
      },
      grid: {
        vertLines: { color: '#2a2a3e' },
        horzLines: { color: '#2a2a3e' }
      },
      timeScale: { timeVisible: true }
    })

    // Tambahkan candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor:        '#26a69a',
      downColor:      '#ef5350',
      borderUpColor:  '#26a69a',
      borderDownColor:'#ef5350',
      wickUpColor:    '#26a69a',
      wickDownColor:  '#ef5350'
    })

    candleSeries.setData(history)

    const srLevels = detectSupportResistance(history)
    srLevels.forEach(level => {
      candleSeries.createPriceLine({
        price:     level.price,
        color:     level.type === 'support' ? '#26a69a' : '#ef5350',
        lineWidth: 1,
        lineStyle: 1,  // garis putus-putus
        title:     level.type === 'support' ? 'Support' : 'Resistance'
      })
    })

    const { uptrend, downtrend } = detectTrendlines(history)
    const trendSeries = chart.addLineSeries({
      color:             '#FFD700',  // kuning
      lineWidth:         1,
      lineStyle:         2,
      priceLineVisible:  false,
      lastValueVisible:  false
    })

    if (uptrend) {
      trendSeries.setData([
        { time: uptrend.startTime,  value: uptrend.startPrice },
        { time: uptrend.endTime,    value: uptrend.endPrice   }
      ])
    }

    chartObj.current  = chart
    seriesRef.current = candleSeries

    return () => chartObj.current?.remove()

  }, [])

  function revealCandle() {
    if (!gameData || revealed >= gameData.future.length) return

    const nextCandle = gameData.future[revealed]
    seriesRef.current.update(nextCandle)

    const newRevealed = revealed + 1
    setRevealed(newRevealed)

    if (newRevealed >= gameData.future.length) {
      setDone(true)
      const entryPrice = gameData.future[0].open
      const finalPrice = gameData.future[gameData.future.length - 1].close
      const change     = ((finalPrice - entryPrice) / entryPrice) * 100

      let correct
      if (change > 0.1)       correct = 'buy'
      else if (change < -0.1) correct = 'sell'
      else                    correct = 'wait'

      if (userChoice === correct) onCorrect?.()
      else                        onWrong?.()
    }
  }

  function handleChoice(choice) {
    if (userChoice) return
    setUserChoice(choice)

    let count = 0
    const interval = setInterval(() => {
      if (!gameData || count >= gameData.future.length) {
        clearInterval(interval)
        return
      }
      seriesRef.current.update(gameData.future[count])
      count++
      setRevealed(count)
    }, 800)
  }

  return (
    <div style={{ background: '#1a1a2e', padding: '16px', borderRadius: '12px' }}>

      {/* Area chart */}
      <div ref={chartRef} style={{ width: '100%' }} />

      {/* Tombol Buy / Sell / Wait  */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button
          onClick={() => handleChoice('buy')}
          disabled={!!userChoice}
          style={{ flex: 1, padding: '12px', background: '#26a69a',
                   color: 'white', border: 'none', borderRadius: '8px',
                   cursor: userChoice ? 'not-allowed' : 'pointer' }}
        >
          BUY
        </button>
        <button
          onClick={() => handleChoice('sell')}
          disabled={!!userChoice}
          style={{ flex: 1, padding: '12px', background: '#ef5350',
                   color: 'white', border: 'none', borderRadius: '8px',
                   cursor: userChoice ? 'not-allowed' : 'pointer' }}
        >
          SELL
        </button>
        <button
          onClick={() => handleChoice('wait')}
          disabled={!!userChoice}
          style={{ flex: 1, padding: '12px', background: '#555',
                   color: 'white', border: 'none', borderRadius: '8px',
                   cursor: userChoice ? 'not-allowed' : 'pointer' }}
        >
          WAIT
        </button>
      </div>

      {/* Status */}
      {userChoice && (
        <p style={{ color: '#aaa', marginTop: '12px', textAlign: 'center' }}>
          Kamu memilih: <strong style={{ color: 'white' }}>{userChoice.toUpperCase()}</strong>
          {' '}— Candle reveal: {revealed} / {gameData?.future.length ?? 0}
        </p>
      )}

    </div>
  )
}