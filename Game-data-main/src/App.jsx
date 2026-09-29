import { useState } from 'react'
import GameChart from './components/GameChart'
import { evaluateDecision } from './utils/gameLogic'

export default function App() {
  const [page, setPage] = useState('game')
  const [expGained, setExpGained] = useState(0)
  const [result, setResult] = useState(null)

  function handleCorrect(userChoice, futureCandles) {
    const eval_ = evaluateDecision(userChoice, futureCandles, 'easy')
    setExpGained(eval_.expGained)
    setResult(eval_)
    setPage('correct')
  }

  function handleWrong(userChoice, futureCandles) {
    const eval_ = evaluateDecision(userChoice, futureCandles, 'easy')
    setResult(eval_)
    setPage('wrong')
  }

  if (page === 'game') {
    return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '24px' }}>
        <h2 style={{ color: 'white', marginBottom: '16px' }}>
          Try-Rex — EURUSD H4
        </h2>
        <GameChart
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />
      </div>
    )
  }

  if (page === 'correct') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', background: '#1a1a2e'
      }}>
        <h1 style={{ color: '#26a69a', fontSize: '48px' }}>🎉</h1>
        <h2 style={{ color: 'white' }}>Selamat!</h2>
        <p style={{ color: '#aaa' }}>{result?.feedback}</p>
        <p style={{ color: '#FFD700', fontSize: '24px', fontWeight: 'bold' }}>
          +{expGained} EXP
        </p>
        <button
          onClick={() => setPage('game')}
          style={{
            marginTop: '24px', padding: '12px 32px',
            background: '#26a69a', color: 'white',
            border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontSize: '16px'
          }}
        >
          Main Lagi
        </button>
      </div>
    )
  }

  if (page === 'wrong') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', background: '#1a1a2e'
      }}>
        <h1 style={{ color: '#ef5350', fontSize: '48px' }}>📉</h1>
        <h2 style={{ color: 'white' }}>Jawaban Kurang Tepat</h2>
        <p style={{ color: '#aaa' }}>{result?.feedback}</p>
        <p style={{ color: '#aaa' }}>
          Kamu pilih: <strong style={{ color: 'white' }}>
            {result?.userChoice?.toUpperCase()}
          </strong>
        </p>
        <p style={{ color: '#aaa' }}>
          Jawaban benar: <strong style={{ color: '#FFD700' }}>
            {result?.correctChoice?.toUpperCase()}
          </strong>
        </p>
        <button
          onClick={() => setPage('game')}
          style={{
            marginTop: '24px', padding: '12px 32px',
            background: '#ef5350', color: 'white',
            border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontSize: '16px'
          }}
        >
          Coba Lagi
        </button>
      </div>
    )
  }
}