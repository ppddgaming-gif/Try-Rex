import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "13_RSI_Relative_Strength_Index.pdf". Left out for beginners: the
// worked smoothing of later candles, hidden divergence, the trading plans,
// the simulation figures (synthetic data) and the case study.

export const rsiLesson: Lesson = {
  slug: "rsi",
  level: 4,
  minutes: 7,
  title: tx("Indikator dasar: RSI (Relative Strength Index)", "Basic indicators: RSI (Relative Strength Index)"),
  summary: tx(
    "Spidometer momentum harga: cara menghitung, membaca overbought/oversold, divergence, dan kapan RSI menyesatkan.",
    "A speedometer for price momentum: how to calculate it, read overbought/oversold and divergence, and when RSI misleads.",
  ),
  material: ["13_RSI_Relative_Strength_Index.pdf"],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Harga yang naik 100 pip dalam sepekan memberi tahu di mana harga berada, tetapi tidak memberi tahu seberapa kuat dorongan di balik kenaikan itu. Indikator yang mengukur kekuatan dorongan disebut indikator momentum, dan yang paling terkenal adalah RSI. RSI diperkenalkan oleh J. Welles Wilder Jr. dalam buku New Concepts in Technical Trading Systems (1978). Ia berupa garis yang bergerak di antara 0 dan 100 di panel terpisah di bawah chart.",
        "Price rising 100 pips in a week tells you where price is, but not how strong the push behind the rise is. Indicators that measure the strength of the push are called momentum indicators, and the best known is the RSI. RSI was introduced by J. Welles Wilder Jr. in the book New Concepts in Technical Trading Systems (1978). It is a line moving between 0 and 100 in a separate panel under the chart.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("RSI", "RSI"),
      text: tx(
        "Osilator yang membandingkan rata-rata kenaikan dengan rata-rata penurunan dari n candle terakhir (default n = 14), lalu mengubahnya menjadi skala 0–100. Nilai tinggi = kenaikan terbaru lebih dominan; nilai rendah = penurunan terbaru lebih dominan.",
        "An oscillator that compares the average rise with the average fall over the last n candles (default n = 14), then turns it into a 0–100 scale. A high value = recent rises dominate; a low value = recent falls dominate.",
      ),
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("RSI bukan penentu \"mahal\" atau \"murah\"", "RSI doesn't decide \"expensive\" or \"cheap\""),
      text: tx(
        "RSI 80 tidak berarti harga \"terlalu mahal\" dan akan turun. Ia hanya berarti hampir semua perubahan 14 candle terakhir adalah kenaikan. Dalam tren kuat, kondisi itu bisa berlangsung lama.",
        "An RSI of 80 doesn't mean price is \"too expensive\" and will fall. It only means almost every change over the last 14 candles was a rise. In a strong trend, that can last a long time.",
      ),
    },
    {
      kind: "chart",
      pick: "rsi",
      caption: tx(
        "Data historis nyata dengan RSI 14 di panel bawah, dihitung dari harga close-nya (metode Wilder). Garis bantu di 30, 50, dan 70.",
        "Real historical data with RSI 14 in the lower panel, calculated from its closes (Wilder's method). Guide lines at 30, 50 and 70.",
      ),
    },

    { kind: "heading", text: tx("Cara menghitung RSI", "How RSI is calculated") },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Rumus RSI Wilder", "Wilder's RSI formula"),
      text: tx(
        "RS = rata-rata kenaikan ÷ rata-rata penurunan (selama n candle). RSI = 100 − 100 ÷ (1 + RS). Rata-rata pertama = rata-rata sederhana dari n perubahan pertama. Selanjutnya: rata-rata baru = (rata-rata lama × (n − 1) + nilai baru) ÷ n.",
        "RS = average rise ÷ average fall (over n candles). RSI = 100 − 100 ÷ (1 + RS). The first averages are the simple averages of the first n changes. After that: new average = (old average × (n − 1) + new value) ÷ n.",
      ),
    },
    {
      kind: "calc",
      title: tx("RSI(14) di candle ke-15 (14 perubahan: total naik 92 pip, total turun 37 pip)", "RSI(14) at candle 15 (14 changes: total rises 92 pips, total falls 37 pips)"),
      lines: [
        tx("Rata-rata naik = 92 ÷ 14 = 6,5714 pip", "Average rise = 92 ÷ 14 = 6.5714 pips"),
        tx("Rata-rata turun = 37 ÷ 14 = 2,6429 pip", "Average fall = 37 ÷ 14 = 2.6429 pips"),
        tx("RS = 6,5714 ÷ 2,6429 = 2,4865", "RS = 6.5714 ÷ 2.6429 = 2.4865"),
        tx("RSI = 100 − 100 ÷ (1 + 2,4865) = 71,32", "RSI = 100 − 100 ÷ (1 + 2.4865) = 71.32"),
      ],
      note: tx(
        "RSI memakai rasio kenaikan terhadap penurunan, bukan jumlah pip. Jika semua harga dikalikan 100 (seperti perbedaan skala EUR/USD dan USD/JPY), RSI tetap sama persis, jadi rumusnya tidak perlu diubah untuk pair JPY.",
        "RSI uses the ratio of rises to falls, not the number of pips. If every price is multiplied by 100 (like the difference in scale between EUR/USD and USD/JPY), RSI stays exactly the same, so the formula needs no change for JPY pairs.",
      ),
    },

    { kind: "heading", text: tx("Membaca RSI: overbought, oversold, dan garis tengah", "Reading RSI: overbought, oversold and the midline") },
    {
      kind: "table",
      head: [tx("Zona RSI", "RSI zone"), tx("Sebutan umum", "Common name"), tx("Arti sebenarnya", "What it really means")],
      rows: [
        [tx("Di atas 70", "Above 70"), tx("Overbought (jenuh beli)", "Overbought"), tx("Kenaikan sangat dominan dalam 14 candle terakhir", "Rises have strongly dominated the last 14 candles")],
        [tx("Di bawah 30", "Below 30"), tx("Oversold (jenuh jual)", "Oversold"), tx("Penurunan sangat dominan dalam 14 candle terakhir", "Falls have strongly dominated the last 14 candles")],
        [tx("Sekitar 50", "Around 50"), tx("Garis tengah", "Midline"), tx("Kenaikan dan penurunan seimbang; pembatas bias bullish (>50) dan bearish (<50)", "Rises and falls balanced; the line between a bullish (>50) and bearish (<50) bias")],
      ],
    },
    {
      kind: "table",
      head: [tx("Kondisi pasar", "Market condition"), tx("Cara pakai yang lebih masuk akal", "A more sensible way to use it")],
      rows: [
        [tx("Range / sideways", "Range / sideways"), tx("70/30 sering diikuti pembalikan kecil; peluang di batas range, target pendek", "70/30 is often followed by a small turn; chances at the range edges, short targets")],
        [tx("Tren naik", "Uptrend"), tx("RSI sering tetap tinggi sebagai tanda kekuatan; cari pullback ke zona RSI 40–50 lalu naik kembali", "RSI often stays high as a sign of strength; look for a pullback to the 40–50 RSI zone, then a turn back up")],
        [tx("Tren turun", "Downtrend"), tx("RSI sering tetap rendah; cari kenaikan ke zona RSI 50–60 lalu turun kembali", "RSI often stays low; look for a rise to the 50–60 RSI zone, then a turn back down")],
      ],
    },

    { kind: "heading", text: tx("Divergence: harga dan momentum tidak sejalan", "Divergence: price and momentum disagree") },
    {
      kind: "table",
      head: [tx("Jenis", "Type"), tx("Harga", "Price"), tx("RSI", "RSI"), tx("Tafsiran", "Reading")],
      rows: [
        [tx("Bearish divergence", "Bearish divergence"), tx("Higher high", "Higher high"), tx("Lower high", "Lower high"), tx("Dorongan naik melemah; waspada pembalikan atau koreksi", "The upward push is weakening; watch for a reversal or correction")],
        [tx("Bullish divergence", "Bullish divergence"), tx("Lower low", "Lower low"), tx("Higher low", "Higher low"), tx("Dorongan turun melemah; waspada pembalikan naik", "The downward push is weakening; watch for a turn up")],
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Divergence bisa berlangsung lama", "Divergence can last a long time"),
      text: tx(
        "Pada tren kuat, divergence bisa muncul berulang kali sementara harga tetap melaju. Karena itu divergence dipakai sebagai peringatan, lalu tunggu konfirmasi struktur (misalnya close di bawah higher low terakhir) sebelum bertindak.",
        "In a strong trend, divergence can appear again and again while price keeps going. So divergence is used as a warning; then wait for the structure to confirm (for example a close below the last higher low) before acting.",
      ),
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Menjual karena RSI > 70 atau membeli karena RSI < 30 tanpa melihat tren. Ini kesalahan paling umum.", "Selling because RSI > 70 or buying because RSI < 30 without looking at the trend. This is the most common mistake."),
        tx("Menyamakan RSI dengan sinyal masuk. RSI tidak memberi stop loss atau target; gunakan struktur dan ATR.", "Treating RSI as an entry signal. RSI gives no stop loss or target; use structure and ATR."),
        tx("Mengubah periode atau level agar cocok dengan hasil lama. Itu overfitting.", "Changing the period or levels to fit past results. That's overfitting."),
        tx("Menumpuk banyak osilator. RSI, Stochastic, CCI sering mengukur hal yang mirip.", "Stacking many oscillators. RSI, Stochastic and CCI often measure similar things."),
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Coba di Akun Demo", "Try it in the Demo Account"),
      text: tx(
        "Chart trading di Akun Demo punya tombol RSI 14 yang membuka panel RSI dengan garis bantu 30, 50, dan 70, dihitung dengan metode Wilder yang sama.",
        "The Demo Account's trading chart has an RSI 14 button that opens an RSI panel with guide lines at 30, 50 and 70, calculated with the same Wilder method.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Rata-rata naik 8 pip, rata-rata turun 4 pip. RS dan RSI?", "Average rise 8 pips, average fall 4 pips. RS and RSI?"), a: tx("RS = 2; RSI = 100 − 100 ÷ 3 = 66,7.", "RS = 2; RSI = 100 − 100 ÷ 3 = 66.7.") },
        { q: tx("RS = 1. Berapa RSI?", "RS = 1. What is the RSI?"), a: tx("50.", "50.") },
        { q: tx("Mengapa RSI bisa overbought lama di tren kuat?", "Why can RSI stay overbought for long in a strong trend?"), a: tx("Karena hampir semua perubahan terbaru adalah kenaikan.", "Because almost every recent change is a rise.") },
        { q: tx("Apakah RSI perlu rumus berbeda untuk pair JPY?", "Does RSI need a different formula for JPY pairs?"), a: tx("Tidak; ia memakai rasio, bukan pip.", "No; it uses a ratio, not pips.") },
      ],
    },
  ],
  sources: [
    { title: "Relative Strength Index (RSI)", publisher: "Fidelity", url: "https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/RSI" },
    { title: "Relative Strength Index", publisher: "Forextester", url: "https://forextester.com/blog/relative-strength-index" },
  ],
}
