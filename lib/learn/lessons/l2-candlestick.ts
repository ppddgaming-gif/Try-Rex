import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "Cara Mudah Membaca Candlestick Untuk Analisis Investasi.pdf". The
// article is written for shares; the reading of a candle is the same for a
// currency pair. Left out for beginners: the three-candle patterns (morning
// and evening star, three white soldiers, three black crows).

const MATERIAL = "Cara Mudah Membaca Candlestick Untuk Analisis Investasi.pdf"
const SOURCE = { title: "Cara Mudah Membaca Candlestick Untuk Analisis Investasi", publisher: "" }

export const candlestick: Lesson = {
  slug: "candlestick-ohlc",
  level: 2,
  minutes: 4,
  title: tx("Candlestick: open, high, low, close", "Candlesticks: open, high, low, close"),
  summary: tx(
    "Empat harga dalam satu candle, dan cara membaca badan serta bayangannya.",
    "Four prices in one candle, and how to read its body and shadows.",
  ),
  material: [MATERIAL],
  blocks: [
    {
      kind: "callout",
      tone: "definition",
      title: tx("Pengertian candlestick", "What a candlestick is"),
      text: tx(
        "Candlestick adalah alat analisis teknikal berupa grafik berbentuk seperti lilin yang menggambarkan aktivitas harga dalam periode waktu tertentu. Setiap candlestick menyajikan informasi penting: harga pembukaan (open), harga penutupan (close), harga tertinggi (high), dan harga terendah (low).",
        "A candlestick is a technical-analysis tool: a chart shaped like a candle that shows price activity over a set period of time. Every candlestick carries key information: the opening price (open), the closing price (close), the highest price (high) and the lowest price (low).",
      ),
    },
    {
      kind: "points",
      title: tx("Empat harga utama dalam satu candle", "The four main prices in one candle"),
      items: [
        tx("Open: harga pada saat periode dibuka.", "Open: the price when the period opens."),
        tx("High: harga tertinggi yang terjadi selama periode itu.", "High: the highest price reached during the period."),
        tx("Low: harga terendah yang terjadi selama periode itu.", "Low: the lowest price reached during the period."),
        tx("Close: harga pada saat periode ditutup.", "Close: the price when the period closes."),
      ],
    },
    { kind: "diagram", name: "candle-anatomy" },
    { kind: "heading", text: tx("Badan dan bayangan", "Body and shadows") },
    {
      kind: "p",
      text: tx(
        "Dalam membaca candlestick, perhatikan bagian yang berbentuk kotak berwarna, yang dikenal sebagai \"badan\". Bagian ini menunjukkan apakah harga pembukaan atau harga penutupan lebih tinggi.",
        "When reading a candlestick, look at the coloured box, known as the \"body\". It shows whether the opening or the closing price was higher.",
      ),
    },
    {
      kind: "points",
      items: [
        tx(
          "Badan hijau menandakan kenaikan harga dan tekanan beli. Bagian bawah badan adalah harga pembukaan dan bagian atas adalah harga penutupan.",
          "A green body shows a price rise and buying pressure. The bottom of the body is the opening price and the top is the closing price.",
        ),
        tx(
          "Badan merah menandakan penurunan harga dan tekanan jual. Bagian bawah badan adalah harga penutupan dan bagian atas adalah harga pembukaan.",
          "A red body shows a price fall and selling pressure. The bottom of the body is the closing price and the top is the opening price.",
        ),
        tx(
          "Sumbu tipis di atas dan di bawah badan disebut shadow (bayangan atau ekor). Upper shadow menunjukkan harga tertinggi yang tercapai dan lower shadow menunjukkan harga terendah selama periode itu.",
          "The thin lines above and below the body are called shadows (or tails). The upper shadow shows the highest price reached and the lower shadow the lowest price during the period.",
        ),
      ],
    },
    {
      kind: "chart",
      pick: "candles",
      caption: tx(
        "Data historis nyata, dilihat dari dekat. Setiap candle merangkum open, high, low, dan close satu periode H4.",
        "Real historical data, up close. Each candle sums up the open, high, low and close of one H4 period.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Apa arti ekor pada candlestick?", "What do a candlestick's tails mean?"), a: tx("Ekor (bayangan) menunjukkan harga tertinggi dan terendah yang dicapai selama periode itu.", "The tails (shadows) show the highest and lowest prices reached during the period.") },
        { q: tx("Pada badan hijau, di mana harga pembukaan?", "On a green body, where is the opening price?"), a: tx("Di bagian bawah badan; penutupan ada di bagian atas.", "At the bottom of the body; the close is at the top.") },
        { q: tx("Apakah candlestick bisa ditebak?", "Can candlesticks be predicted?"), a: tx("Tidak dengan kepastian mutlak, tetapi analisisnya memberi wawasan tentang kemungkinan pergerakan harga.", "Not with complete certainty, but reading them gives insight into how price may move.") },
      ],
    },
  ],
  sources: [SOURCE],
}

export const bullishBearish: Lesson = {
  slug: "bullish-bearish",
  level: 2,
  minutes: 5,
  title: tx("Candle bullish dan bearish", "Bullish and bearish candles"),
  summary: tx(
    "Candle naik dan turun, plus beberapa pola satu dan dua candle yang paling umum.",
    "Rising and falling candles, plus a few of the most common one- and two-candle patterns.",
  ),
  material: [MATERIAL],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Dengan analisis candlestick, trader dapat memperkirakan arah tren selanjutnya, apakah akan mengalami pergerakan bullish (naik) atau bearish (turun). Secara umum, candlestick mencerminkan pengaruh sentimen pelaku pasar terhadap fluktuasi harga.",
        "With candlestick analysis, traders can estimate the next direction of the trend, whether the move will be bullish (up) or bearish (down). In general, candlesticks reflect how market sentiment affects price swings.",
      ),
    },
    {
      kind: "table",
      head: [tx("Candle", "Candle"), tx("Warna badan", "Body colour"), tx("Artinya", "Meaning")],
      rows: [
        [tx("Bullish", "Bullish"), tx("Hijau (atau putih)", "Green (or white)"), tx("Close lebih tinggi dari open: harga naik, tekanan beli", "Close above open: price rose, buying pressure")],
        [tx("Bearish", "Bearish"), tx("Merah (atau hitam)", "Red (or black)"), tx("Close lebih rendah dari open: harga turun, tekanan jual", "Close below open: price fell, selling pressure")],
      ],
    },
    {
      kind: "chart",
      pick: "candles",
      caption: tx(
        "Data historis nyata. Candle hijau ditutup lebih tinggi dari pembukaannya (bullish), candle merah ditutup lebih rendah (bearish).",
        "Real historical data. Green candles closed above their open (bullish), red candles closed below it (bearish).",
      ),
    },
    { kind: "heading", text: tx("Pola umum pada candlestick", "Common candlestick patterns") },
    {
      kind: "table",
      head: [tx("Pola", "Pattern"), tx("Bentuk", "Shape"), tx("Yang ditunjukkan", "What it suggests")],
      rows: [
        [tx("Marubozu", "Marubozu"), tx("Badan penuh, tanpa atau sangat sedikit bayangan; open dan close berada di level tertinggi dan terendah", "A full body with no or very small shadows; open and close sit at the highest and lowest levels"), tx("Kekuatan yang signifikan dalam pergerakan harga", "Significant strength in the price move")],
        [tx("Doji", "Doji"), tx("Open dan close hampir sama, terlihat seperti garis tipis dengan tubuh kecil", "Open and close almost equal, seen as a thin line with a tiny body"), tx("Ketidakpastian pasar", "Market indecision")],
        [tx("Hammer", "Hammer"), tx("Seperti palu: tubuh kecil di atas, bayangan bawah panjang", "Like a hammer: a small body at the top, a long lower shadow"), tx("Potensi pembalikan dari bearish menjadi bullish", "A possible reversal from bearish to bullish")],
        [tx("Shooting star", "Shooting star"), tx("Kebalikan hammer: tubuh kecil di bawah, bayangan atas panjang", "The reverse of a hammer: a small body at the bottom, a long upper shadow"), tx("Potensi pembalikan dari bullish menjadi bearish", "A possible reversal from bullish to bearish")],
        [tx("Bullish engulfing", "Bullish engulfing"), tx("Candle bullish sepenuhnya mencakup candle bearish sebelumnya", "A bullish candle fully covers the bearish candle before it"), tx("Potensi pembalikan dari bearish menjadi bullish", "A possible reversal from bearish to bullish")],
        [tx("Bearish engulfing", "Bearish engulfing"), tx("Candle bearish sepenuhnya mencakup candle bullish sebelumnya", "A bearish candle fully covers the bullish candle before it"), tx("Potensi pembalikan dari bullish menjadi bearish", "A possible reversal from bullish to bearish")],
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Potensi, bukan kepastian", "Possible, not certain"),
      text: tx(
        "Tidak ada metode yang pasti untuk memprediksi candlestick selanjutnya. Dengan melihat pola beberapa candle sebelumnya, kamu setidaknya dapat memahami potensi arah pergerakan harga berikutnya.",
        "There is no sure method for predicting the next candlestick. By looking at the pattern of the previous few candles, you can at least understand the possible direction of the next move.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Candle dengan close di atas open disebut?", "A candle that closes above its open is called?"), a: tx("Bullish.", "Bullish.") },
        { q: tx("Open dan close hampir sama, tubuh sangat kecil. Pola apa, dan artinya?", "Open and close almost equal, a very small body. Which pattern, and what does it mean?"), a: tx("Doji: ketidakpastian pasar.", "A doji: market indecision.") },
        { q: tx("Tubuh kecil di atas dengan bayangan bawah panjang?", "A small body at the top with a long lower shadow?"), a: tx("Hammer: potensi pembalikan dari bearish menjadi bullish.", "A hammer: a possible reversal from bearish to bullish.") },
      ],
    },
  ],
  sources: [SOURCE],
}
