import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "14_ATR_Average_True_Range.pdf". Left out for beginners: the
// simulation figures (synthetic data), the cross-pair sizing table, the
// chandelier exit, the volatility ratio, the session table (Level 1 covers
// sessions), the trade template and the case study.

export const atr: Lesson = {
  slug: "atr",
  level: 4,
  minutes: 6,
  title: tx("Indikator dasar: ATR (Average True Range)", "Basic indicators: ATR (Average True Range)"),
  summary: tx(
    "Mengukur \"napas\" pasar: seberapa jauh harga biasanya bergerak, dan bagaimana memakainya untuk stop loss dan ukuran posisi.",
    "Measuring the market's \"breathing\": how far price usually moves, and how to use that for stop losses and position size.",
  ),
  material: ["14_ATR_Average_True_Range.pdf"],
  blocks: [
    { kind: "heading", text: tx("Tinggi ombak, bukan arah ombak", "The height of the waves, not their direction") },
    {
      kind: "p",
      text: tx(
        "Nelayan tidak hanya bertanya \"ombak datang dari arah mana?\", tetapi juga \"seberapa tinggi ombaknya hari ini?\". Dalam trading, stop loss yang sama (misalnya 10 pip) bisa sangat aman di hari yang tenang dan hampir pasti terkena di hari yang bergejolak. ATR menjawab pertanyaan itu: rata-rata seberapa besar rentang pergerakan harga per candle, di pair dan timeframe tertentu. Ia tidak memberi tahu arah; ia hanya mengukur volatilitas. Seperti RSI, ATR diciptakan oleh J. Welles Wilder Jr. (1978).",
        "Fishermen don't only ask \"which way are the waves coming from?\" but also \"how high are they today?\". In trading, the same stop loss (say 10 pips) can be very safe on a calm day and almost sure to be hit on a turbulent one. ATR answers that question: on average, how large the price range per candle is, for a given pair and timeframe. It doesn't tell you direction; it only measures volatility. Like RSI, ATR was created by J. Welles Wilder Jr. (1978).",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("True Range (TR)", "True Range (TR)"),
      text: tx(
        "TR = maksimum dari: (High − Low), |High − Close sebelumnya|, |Low − Close sebelumnya|. Kalau hanya memakai High − Low, pergerakan yang terjadi di antara dua candle (gap) terabaikan.",
        "TR = the largest of: (High − Low), |High − previous Close|, |Low − previous Close|. Using only High − Low would ignore movement that happens between two candles (a gap).",
      ),
    },
    {
      kind: "table",
      head: [tx("Kasus", "Case"), tx("High", "High"), tx("Low", "Low"), tx("Close sebelumnya", "Previous close"), tx("TR (pip)", "TR (pips)")],
      rows: [
        [tx("Normal (tanpa gap)", "Normal (no gap)"), tx("1,0862", "1.0862"), tx("1,0848", "1.0848"), tx("1,0855", "1.0855"), tx("14 (= H − L)", "14 (= H − L)")],
        [tx("Gap naik sebagian", "Partial gap up"), tx("1,0870", "1.0870"), tx("1,0855", "1.0855"), tx("1,0850", "1.0850"), tx("20 (= |H − Cprev|)", "20 (= |H − Cprev|)")],
        [tx("Gap turun besar", "Large gap down"), tx("1,0880", "1.0880"), tx("1,0860", "1.0860"), tx("1,0900", "1.0900"), tx("40 (= |L − Cprev|)", "40 (= |L − Cprev|)")],
      ],
      note: tx(
        "Pada kasus gap turun, candle itu sendiri hanya selebar 20 pip, tetapi harga menempuh 40 pip dari penutupan sebelumnya hingga titik terendah; TR menangkap itu.",
        "In the gap-down case the candle itself is only 20 pips wide, but price travelled 40 pips from the previous close to the low; TR captures that.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Rumus ATR Wilder", "Wilder's ATR formula"),
      text: tx(
        "ATR pertama (n = 14) = rata-rata sederhana dari 14 TR pertama. ATR baru = (ATR lama × 13 + TR baru) ÷ 14, pemulusan yang sama dengan RSI.",
        "The first ATR (n = 14) = the simple average of the first 14 TRs. New ATR = (old ATR × 13 + new TR) ÷ 14, the same smoothing as RSI.",
      ),
    },
    {
      kind: "calc",
      title: tx("ATR(14) di candle ke-14, 15, dan 16", "ATR(14) at candles 14, 15 and 16"),
      lines: [
        tx("Jumlah TR candle 1–14 = 96,0 pip → ATR(14) = 96,0 ÷ 14 = 6,86 pip", "Sum of TR for candles 1–14 = 96.0 pips → ATR(14) = 96.0 ÷ 14 = 6.86 pips"),
        tx("Candle 15: TR = 12,0 → ATR = (6,86 × 13 + 12,0) ÷ 14 = 7,22 pip", "Candle 15: TR = 12.0 → ATR = (6.86 × 13 + 12.0) ÷ 14 = 7.22 pips"),
        tx("Candle 16: TR = 6,0 → ATR = (7,22 × 13 + 6,0) ÷ 14 = 7,14 pip", "Candle 16: TR = 6.0 → ATR = (7.22 × 13 + 6.0) ÷ 14 = 7.14 pips"),
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Mengubah nilai ATR menjadi pip", "Turning an ATR value into pips"),
      text: tx(
        "Platform menampilkan ATR dalam satuan harga. Bagi dengan ukuran 1 pip: EUR/USD ATR 0,00120 ÷ 0,0001 = 12 pip. USD/JPY ATR 0,450 ÷ 0,01 = 45 pip. Untuk pair JPY jangan membagi dengan 0,0001, nanti kamu salah 100 kali.",
        "Platforms show ATR in price units. Divide by the size of 1 pip: EUR/USD ATR 0.00120 ÷ 0.0001 = 12 pips. USD/JPY ATR 0.450 ÷ 0.01 = 45 pips. For JPY pairs don't divide by 0.0001, or you'll be off by 100 times.",
      ),
    },
    {
      kind: "chart",
      pick: "atr",
      caption: tx(
        "Data historis nyata dengan ATR 14 di panel bawah (dalam pip), dihitung dari high, low, dan close-nya.",
        "Real historical data with ATR 14 in the lower panel (in pips), calculated from its highs, lows and closes.",
      ),
    },

    { kind: "heading", text: tx("Membaca ATR", "Reading ATR") },
    {
      kind: "points",
      items: [
        tx("ATR tinggi: candle rata-rata lebar. Perlu SL lebih jauh dan lot lebih kecil agar risiko uang sama.", "High ATR: candles are wide on average. You need a further SL and a smaller lot to keep the money at risk the same."),
        tx("ATR rendah: candle rata-rata sempit; pasar tenang, sering mendahului gerakan besar (tetapi tidak menjamin).", "Low ATR: candles are narrow on average; a calm market, often before a big move (but no guarantee)."),
        tx("ATR naik: volatilitas membesar (misal saat sesi ramai atau berita). ATR turun: volatilitas mengecil.", "ATR rising: volatility is growing (for example in busy sessions or on news). ATR falling: volatility is shrinking."),
        tx("ATR tidak bisa dibandingkan antar pair mentah-mentah. ATR GBP/JPY 60 pip tidak berarti lebih bagus dari EUR/USD 12 pip; ia hanya bergerak lebih lebar.", "ATR can't be compared between pairs as is. A GBP/JPY ATR of 60 pips isn't better than EUR/USD at 12; it just moves wider."),
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Jangan menghafal angka ATR dari artikel", "Don't memorise ATR figures from articles"),
      text: tx(
        "ATR sebuah pair berubah menurut waktu, sesi, dan kondisi pasar. Angka dalam materi ini hanya ilustrasi. Selalu baca ATR terbaru dari chart-mu.",
        "A pair's ATR changes with time, session and market conditions. The figures in this lesson are only illustrations. Always read the latest ATR from your chart.",
      ),
    },

    { kind: "heading", text: tx("Kegunaan ATR dalam trading", "Using ATR in trading") },
    {
      kind: "p",
      text: tx(
        "Stop loss berbasis ATR: daripada memakai angka tetap (misal selalu 15 pip), tetapkan SL sebagai kelipatan ATR, biasanya 1 sampai 2 kali ATR. SL yang lebih sempit dari kisaran gerak normal akan sering tersapu noise. Cara terbaik: letakkan SL di balik swing atau zona S/R, lalu tambahkan buffer sekitar ½ ATR.",
        "ATR-based stop loss: instead of a fixed number (say always 15 pips), set the SL as a multiple of ATR, usually 1 to 2 times ATR. An SL narrower than the normal range of movement will often be swept by noise. Best of all: put the SL behind a swing or S/R zone, then add a buffer of about ½ ATR.",
      ),
    },
    {
      kind: "calc",
      title: tx("Buy EUR/USD H1 dengan SL struktur + buffer ATR (ATR = 12 pip, risiko $30)", "Buying EUR/USD H1 with a structure SL + ATR buffer (ATR = 12 pips, risk $30)"),
      lines: [
        tx("Swing low terakhir = 1,0842 ; buffer = 0,5 × 12 pip = 6 pip", "Last swing low = 1.0842 ; buffer = 0.5 × 12 pips = 6 pips"),
        tx("SL = 1,0842 − 6 pip = 1,0836", "SL = 1.0842 − 6 pips = 1.0836"),
        tx("Entry 1,0868 → jarak SL = 32 pip", "Entry 1.0868 → SL distance = 32 pips"),
        tx("Lot = 30 ÷ (32 × $10) = 0,094 → dibulatkan ke bawah 0,09 ; risiko sebenarnya $28,80", "Lots = 30 ÷ (32 × $10) = 0.094 → rounded down to 0.09 ; real risk $28.80"),
      ],
      note: tx(
        "Pair yang bergerak lebar menuntut posisi lebih kecil, bukan lebih besar. Kalau SL struktural terlalu jauh, kecilkan lot atau lewati; jangan memindahkan SL mendekat supaya lot besar.",
        "A pair that moves wide calls for a smaller position, not a bigger one. If the structural SL is too far, use a smaller lot or skip; don't move the SL closer to get a bigger lot.",
      ),
    },
    {
      kind: "table",
      head: [tx("Timeframe", "Timeframe"), tx("ATR (pip, contoh)", "ATR (pips, example)"), tx("Spread 1,2 pip sebagai % ATR", "A 1.2-pip spread as % of ATR")],
      rows: [
        [tx("M5", "M5"), tx("3", "3"), tx("40%", "40%")],
        [tx("M15", "M15"), tx("6", "6"), tx("20%", "20%")],
        [tx("H1", "H1"), tx("12", "12"), tx("10%", "10%")],
        [tx("H4", "H4"), tx("25", "25"), tx("5%", "5%")],
        [tx("D1", "D1"), tx("70", "70"), tx("2%", "2%")],
      ],
      note: tx(
        "Spread yang sama menjadi beban besar di timeframe kecil. Inilah salah satu alasan trading di timeframe sangat kecil lebih sulit bagi pemula.",
        "The same spread is a heavy burden on small timeframes. This is one reason trading very small timeframes is harder for beginners.",
      ),
    },
    {
      kind: "points",
      title: tx("Batas dan kesalahan umum", "Limits and common mistakes"),
      items: [
        tx("ATR tidak memberi arah. ATR tinggi bisa terjadi saat naik maupun turun.", "ATR gives no direction. A high ATR can happen in a rise or a fall."),
        tx("Lagging. Lonjakan besar membuat ATR tinggi selama kira-kira 14 candle ke depan walaupun pasar sudah tenang.", "It lags. A big spike keeps ATR high for roughly the next 14 candles even after the market calms."),
        tx("Bergantung timeframe. ATR H4 tidak sama dengan ATR H1; selalu sebut timeframenya.", "It depends on the timeframe. H4 ATR isn't H1 ATR; always name the timeframe."),
        tx("Menaikkan lot saat ATR tinggi karena merasa \"peluangnya besar\". Volatilitas tinggi berarti risiko per lot lebih besar.", "Raising the lot when ATR is high because the \"opportunity is big\". High volatility means more risk per lot."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Close sebelumnya 1,1000 ; H 1,1030 ; L 1,1010. TR?", "Previous close 1.1000 ; H 1.1030 ; L 1.1010. TR?"), a: tx("max(20, 30, 10) = 30 pip.", "max(20, 30, 10) = 30 pips.") },
        { q: tx("ATR lama 10, TR baru 24, n = 14. ATR baru?", "Old ATR 10, new TR 24, n = 14. New ATR?"), a: tx("(10 × 13 + 24) ÷ 14 = 11.", "(10 × 13 + 24) ÷ 14 = 11.") },
        { q: tx("ATR USD/JPY 0,360. Berapa pip?", "USD/JPY ATR 0.360. How many pips?"), a: tx("0,360 ÷ 0,01 = 36 pip.", "0.360 ÷ 0.01 = 36 pips.") },
        { q: tx("Apakah ATR tinggi berarti harga akan naik?", "Does a high ATR mean price will rise?"), a: tx("Tidak; ATR tidak memberi arah.", "No; ATR gives no direction.") },
      ],
    },
  ],
  sources: [
    { title: "Average True Range", publisher: "DayTrading.com", url: "https://www.daytrading.com/average-true-range" },
    { title: "What Is Average True Range (ATR)", publisher: "Let's Learn the Market (Substack)" },
    { title: "Mastering Volatility: How to Use ATR", publisher: "TradingView Ideas" },
  ],
}
