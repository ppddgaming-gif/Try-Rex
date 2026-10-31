import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "12_Moving_Average_SMA_dan_EMA.pdf". Left out for beginners: the
// weight table, distance in ATR, MA as a trailing stop, other MA families,
// the hypothetical test, the simulation figures and the case study.

export const movingAverage: Lesson = {
  slug: "moving-average",
  level: 4,
  minutes: 7,
  title: tx("Indikator dasar: Moving Average (SMA dan EMA)", "Basic indicators: Moving Average (SMA and EMA)"),
  summary: tx(
    "Menghaluskan noise agar arah terlihat: cara menghitung, membaca, dan memahami batas-batas Moving Average.",
    "Smoothing out noise so the direction shows: how to calculate, read and understand the limits of Moving Averages.",
  ),
  material: ["12_Moving_Average_SMA_dan_EMA.pdf"],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Bayangkan kamu mencatat suhu tiap jam. Angkanya naik-turun tidak karuan, tetapi rata-rata 24 jam terakhir bergerak halus dan memperlihatkan apakah hari ini cenderung menghangat. Moving Average (MA) melakukan hal yang sama pada harga. MA tidak meramalkan, ia hanya merangkum masa lalu.",
        "Imagine noting the temperature every hour. The numbers jump around, but the average of the last 24 hours moves smoothly and shows whether the day is warming up. A Moving Average (MA) does the same with price. An MA doesn't forecast; it only summarises the past.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Moving Average", "Moving Average"),
      text: tx(
        "Rata-rata harga (biasanya harga penutupan) dari n candle terakhir, dihitung ulang setiap candle baru. Nilai n disebut periode. Contoh: MA 20 = rata-rata 20 candle terakhir.",
        "The average price (usually the close) of the last n candles, recalculated with every new candle. n is called the period. Example: MA 20 = the average of the last 20 candles.",
      ),
    },

    { kind: "heading", text: tx("SMA: Simple Moving Average", "SMA: Simple Moving Average") },
    {
      kind: "p",
      text: tx(
        "SMA(n) = (close1 + close2 + … + closen) ÷ n. Setiap candle punya bobot sama. Setiap candle baru masuk, candle tertua keluar; itu sebabnya disebut \"bergerak\" (moving).",
        "SMA(n) = (close1 + close2 + … + closen) ÷ n. Every candle has the same weight. Each new candle comes in and the oldest drops out; that's why it's called \"moving\".",
      ),
    },
    {
      kind: "calc",
      title: tx("SMA(5) langkah demi langkah", "SMA(5) step by step"),
      lines: [
        tx("Close candle 1–5: 1,0850 ; 1,0862 ; 1,0858 ; 1,0871 ; 1,0880", "Closes of candles 1–5: 1.0850 ; 1.0862 ; 1.0858 ; 1.0871 ; 1.0880"),
        tx("Jumlah = 5,4321 → SMA(5) di candle 5 = 5,4321 ÷ 5 = 1,08642", "Sum = 5.4321 → SMA(5) at candle 5 = 5.4321 ÷ 5 = 1.08642"),
        tx("Candle 6 masuk (1,0876), candle 1 (1,0850) keluar", "Candle 6 comes in (1.0876), candle 1 (1.0850) drops out"),
        tx("SMA(5) di candle 6 = (1,0862 + 1,0858 + 1,0871 + 1,0880 + 1,0876) ÷ 5 = 1,08694", "SMA(5) at candle 6 = (1.0862 + 1.0858 + 1.0871 + 1.0880 + 1.0876) ÷ 5 = 1.08694"),
      ],
    },

    { kind: "heading", text: tx("EMA: Exponential Moving Average", "EMA: Exponential Moving Average") },
    {
      kind: "p",
      text: tx(
        "EMA memberi bobot lebih besar pada candle terbaru dan bobot yang mengecil secara bertahap untuk candle yang lebih lama, tanpa pernah benar-benar membuangnya.",
        "An EMA gives more weight to the latest candle and gradually less weight to older candles, without ever dropping them entirely.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Rumus EMA", "The EMA formula"),
      text: tx(
        "k = 2 ÷ (n + 1). EMA hari ini = close hari ini × k + EMA kemarin × (1 − k). Nilai awal EMA biasanya diambil dari SMA(n) pertama.",
        "k = 2 ÷ (n + 1). Today's EMA = today's close × k + yesterday's EMA × (1 − k). The first EMA value is usually the first SMA(n).",
      ),
    },
    {
      kind: "calc",
      title: tx("EMA(5): k = 2 ÷ 6 = 0,33333", "EMA(5): k = 2 ÷ 6 = 0.33333"),
      lines: [
        tx("EMA(5) awal di candle 5 = SMA(5) = 1,08642", "First EMA(5) at candle 5 = SMA(5) = 1.08642"),
        tx("Candle 6: close 1,0876 → EMA = 1,0876 × 0,33333 + 1,08642 × 0,66667 = 1,08681", "Candle 6: close 1.0876 → EMA = 1.0876 × 0.33333 + 1.08642 × 0.66667 = 1.08681"),
        tx("Candle 7: close 1,0890 → EMA = 1,0890 × 0,33333 + 1,08681 × 0,66667 = 1,08754", "Candle 7: close 1.0890 → EMA = 1.0890 × 0.33333 + 1.08681 × 0.66667 = 1.08754"),
      ],
      note: tx(
        "EMA bukan MA tanpa lag. EMA hanya lebih peka pada informasi paling baru, dengan konsekuensi lebih mudah terkecoh lonjakan sesaat.",
        "An EMA is not a lag-free MA. It is only more sensitive to the latest information, and so more easily fooled by brief spikes.",
      ),
    },
    {
      kind: "chart",
      pick: "ema",
      caption: tx(
        "Data historis nyata dengan EMA 20 dan EMA 50 yang dihitung dari harga close-nya. EMA 50 baru muncul setelah ada 50 candle.",
        "Real historical data with EMA 20 and EMA 50 calculated from its closes. EMA 50 only appears once there are 50 candles.",
      ),
    },

    { kind: "heading", text: tx("Memilih periode", "Choosing a period") },
    {
      kind: "table",
      head: [tx("Periode", "Period"), tx("Sifat", "Character"), tx("Pemakaian umum", "Common use")],
      rows: [
        [tx("5 – 10", "5 – 10"), tx("Sangat peka, mengikuti harga ketat", "Very sensitive, hugs price"), tx("Momentum jangka sangat pendek", "Very short-term momentum")],
        [tx("20 – 21", "20 – 21"), tx("Peka tetapi cukup halus", "Sensitive but fairly smooth"), tx("Tren jangka pendek, area pullback", "Short-term trend, pullback area")],
        [tx("50", "50"), tx("Tren menengah", "Medium-term trend"), tx("Area pullback utama, filter arah", "Main pullback area, direction filter")],
        [tx("200", "200"), tx("Tren besar", "The big trend"), tx("Batas \"bull vs bear\" yang banyak dipantau", "The widely watched \"bull vs bear\" line")],
      ],
      note: tx(
        "Lag rata-rata sebuah MA ≈ (n − 1) ÷ 2 candle: MA 20 ketinggalan sekitar 9,5 candle, MA 200 sekitar 99,5 candle. Semakin panjang periode, semakin halus garisnya tetapi semakin terlambat.",
        "An MA's average lag ≈ (n − 1) ÷ 2 candles: MA 20 lags about 9.5 candles, MA 200 about 99.5. The longer the period, the smoother the line but the later it is.",
      ),
    },

    { kind: "heading", text: tx("Cara membaca Moving Average", "How to read a Moving Average") },
    {
      kind: "points",
      items: [
        tx("MA naik dan harga di atasnya: kondisi uptrend. MA turun dan harga di bawahnya: kondisi downtrend.", "MA rising with price above it: an uptrend. MA falling with price below it: a downtrend."),
        tx("MA mendatar dan harga bolak-balik memotongnya: pasar sideways. Sinyal MA di sini tidak bermakna.", "MA flat with price crossing back and forth: a sideways market. MA signals mean nothing here."),
        tx("Support dan resistance dinamis: pada tren yang sehat, harga sering mundur ke EMA 20 atau 50 lalu lanjut.", "Dynamic support and resistance: in a healthy trend, price often pulls back to EMA 20 or 50, then carries on."),
        tx("Crossover: golden cross saat MA cepat memotong MA lambat ke atas (tafsiran: awal tren naik); death cross saat memotong ke bawah (awal tren turun).", "Crossover: a golden cross when a fast MA crosses above a slow one (read as the start of an uptrend); a death cross when it crosses below (the start of a downtrend)."),
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Crossover itu terlambat dan bisa menipu", "Crossovers are late and can mislead"),
      text: tx(
        "Di pasar sideways, crossover hampir tidak membawa informasi arah dan menghasilkan sinyal bolak-balik (whipsaw). Pakai crossover setelah kamu memastikan pasar bertren; jangan memakainya untuk menentukan apakah pasar bertren.",
        "In a sideways market, crossovers carry almost no information about direction and produce back-and-forth signals (whipsaws). Use crossovers once you're sure the market is trending; don't use them to decide whether it is.",
      ),
    },
    {
      kind: "table",
      head: [tx("Kelemahan", "Weakness"), tx("Penjelasan", "Explanation"), tx("Cara menyiasati", "Workaround")],
      rows: [
        [tx("Lag", "Lag"), tx("Dihitung dari data lampau, selalu terlambat", "Calculated from past data, always late"), tx("Jangan memakai MA untuk menebak puncak/dasar; pakai sebagai filter", "Don't use an MA to guess tops/bottoms; use it as a filter")],
        [tx("Whipsaw di range", "Whipsaw in a range"), tx("Harga bolak-balik memotong MA", "Price crosses the MA back and forth"), tx("Hindari sinyal MA saat MA mendatar", "Avoid MA signals when the MA is flat")],
        [tx("Bukan level pasti", "Not an exact level"), tx("MA bukan titik dengan order tertentu", "An MA is not a point with particular orders"), tx("Perlakukan sebagai zona, gabungkan dengan struktur", "Treat it as a zone, combine it with structure")],
        [tx("Tidak memberi stop loss", "Gives no stop loss"), tx("MA tidak menentukan titik salah", "An MA doesn't say where you're wrong"), tx("Gunakan swing atau ATR untuk SL", "Use swings or ATR for the SL")],
      ],
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Menumpuk terlalu banyak MA. Lima MA tidak menambah informasi; hanya membuat chart ramai.", "Stacking too many MAs. Five MAs add no information; they only clutter the chart."),
        tx("Mengganti periode setiap kalah. Itu mengejar masa lalu (overfitting).", "Changing the period after every loss. That's chasing the past (overfitting)."),
        tx("Mengabaikan kemiringan. Harga di atas MA yang mendatar tidak berarti tren naik.", "Ignoring the slope. Price above a flat MA doesn't mean an uptrend."),
        tx("Mencampur timeframe tanpa sadar. MA 50 di M15 bukan MA 50 di H4.", "Mixing timeframes without noticing. MA 50 on M15 is not MA 50 on H4."),
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Coba di Akun Demo", "Try it in the Demo Account"),
      text: tx(
        "Chart trading di Akun Demo punya tombol EMA 20 dan EMA 50, dihitung dengan rumus yang sama seperti di atas.",
        "The Demo Account's trading chart has EMA 20 and EMA 50 buttons, calculated with the same formula as above.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Close 5 candle: 1,2000 ; 1,2010 ; 1,2020 ; 1,2030 ; 1,2040. SMA(5)?", "Closes of 5 candles: 1.2000 ; 1.2010 ; 1.2020 ; 1.2030 ; 1.2040. SMA(5)?"), a: tx("Jumlah 6,0100 ÷ 5 = 1,2020.", "Sum 6.0100 ÷ 5 = 1.2020.") },
        { q: tx("Berapa k untuk EMA(20)?", "What is k for EMA(20)?"), a: tx("2 ÷ 21 = 0,0952.", "2 ÷ 21 = 0.0952.") },
        { q: tx("EMA(5) kemarin 1,1000, close hari ini 1,1030. EMA hari ini?", "Yesterday's EMA(5) 1.1000, today's close 1.1030. Today's EMA?"), a: tx("1,1030 × 1/3 + 1,1000 × 2/3 = 1,1010.", "1.1030 × 1/3 + 1.1000 × 2/3 = 1.1010.") },
        { q: tx("Mengapa crossover buruk di pasar sideways?", "Why are crossovers poor in a sideways market?"), a: tx("Harga bolak-balik memotong MA, menghasilkan sinyal palsu (whipsaw).", "Price crosses the MA back and forth, giving false signals (whipsaws).") },
      ],
    },
  ],
  sources: [
    { title: "Simple vs. Exponential Moving Averages", publisher: "Britannica Money", url: "https://www.britannica.com/money/simple-vs-exponential-moving-averages" },
    { title: "What Is a Moving Average", publisher: "FXEmpire" },
  ],
}
