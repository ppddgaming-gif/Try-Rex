import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "03_Tren_Naik_Turun_dan_Sideways.pdf". Left out for beginners: the
// three phases of a trend in Dow theory.

export const trend: Lesson = {
  slug: "trend",
  level: 2,
  minutes: 6,
  title: tx("Tren naik, tren turun, dan sideways", "Uptrend, downtrend and sideways"),
  summary: tx(
    "Mengenali arah pasar dengan cara yang bisa dicek, bukan dengan perasaan.",
    "Recognising the market's direction in a way you can check, not by feel.",
  ),
  material: ["03_Tren_Naik_Turun_dan_Sideways.pdf"],
  blocks: [
    { kind: "heading", text: tx("Tren itu seperti naik tangga, bukan naik lift", "A trend is like climbing stairs, not taking a lift") },
    {
      kind: "p",
      text: tx(
        "Tren adalah arah umum pergerakan harga dalam jangka waktu tertentu. Harga hampir tidak pernah bergerak lurus. Ia naik, mundur sebentar, naik lagi. Orang yang menaiki tangga juga begitu: ada anak tangga yang naik dan ada pijakan datar, tetapi posisi totalnya makin tinggi. Itulah tren naik.",
        "A trend is the general direction of price over a period of time. Price almost never moves in a straight line. It rises, steps back for a while, rises again. Someone climbing stairs does the same: some steps go up and some landings are flat, but overall they keep getting higher. That is an uptrend.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Tiga kondisi pasar", "Three market conditions"),
      text: tx(
        "Tren naik (uptrend): puncak dan lembah sama-sama makin tinggi (higher high dan higher low). Tren turun (downtrend): puncak dan lembah sama-sama makin rendah (lower high dan lower low). Sideways (range): puncak dan lembah kira-kira di level yang sama; harga memantul di antara batas atas dan bawah.",
        "Uptrend: peaks and troughs both keep getting higher (higher highs and higher lows). Downtrend: peaks and troughs both keep getting lower (lower highs and lower lows). Sideways (range): peaks and troughs are at roughly the same level; price bounces between an upper and a lower boundary.",
      ),
    },
    { kind: "diagram", name: "trend-shapes" },
    {
      kind: "chart",
      pick: "uptrend",
      caption: tx("Data historis nyata: tren naik, puncak dan lembah makin tinggi.", "Real historical data: an uptrend, peaks and troughs getting higher."),
    },
    {
      kind: "chart",
      pick: "downtrend",
      caption: tx("Data historis nyata: tren turun, puncak dan lembah makin rendah.", "Real historical data: a downtrend, peaks and troughs getting lower."),
    },
    {
      kind: "chart",
      pick: "sideways",
      caption: tx("Data historis nyata: sideways, harga memantul di antara batas atas dan bawah.", "Real historical data: sideways, price bouncing between an upper and a lower boundary."),
    },

    { kind: "heading", text: tx("Cara mengenali tren dengan cara yang objektif", "Recognising a trend objectively") },
    { kind: "p", text: tx("Hindari menilai tren dari \"rasanya\". Gunakan urutan titik puncak dan lembah:", "Avoid judging a trend by how it \"feels\". Use the sequence of peaks and troughs:") },
    {
      kind: "table",
      head: [tx("Kondisi", "Condition"), tx("Swing high", "Swing highs"), tx("Swing low", "Swing lows"), tx("Artinya", "What it means")],
      rows: [
        [tx("Tren naik", "Uptrend"), tx("Makin tinggi (HH)", "Higher (HH)"), tx("Makin tinggi (HL)", "Higher (HL)"), tx("Pembeli mendominasi; pullback ditahan di level yang makin tinggi", "Buyers dominate; pullbacks are held at ever higher levels")],
        [tx("Tren turun", "Downtrend"), tx("Makin rendah (LH)", "Lower (LH)"), tx("Makin rendah (LL)", "Lower (LL)"), tx("Penjual mendominasi; kenaikan kecil cepat ditolak", "Sellers dominate; small rises are quickly rejected")],
        [tx("Sideways", "Sideways"), tx("Sekitar level yang sama", "Around the same level"), tx("Sekitar level yang sama", "Around the same level"), tx("Pembeli dan penjual seimbang; belum ada pemenang", "Buyers and sellers are balanced; no winner yet")],
        [tx("Campuran / transisi", "Mixed / transition"), tx("Satu naik, satu tidak", "One rises, one does not"), tx("Satu naik, satu tidak", "One rises, one does not"), tx("Tren melemah atau berubah; tunggu kejelasan", "The trend is weakening or changing; wait for clarity")],
      ],
    },

    { kind: "heading", text: tx("Tren berlaku sampai terbukti rusak", "A trend holds until it is shown to be broken") },
    {
      kind: "p",
      text: tx(
        "Prinsip ini berasal dari teori Dow, salah satu dasar analisis teknikal: tren dianggap masih berjalan sampai ada tanda jelas ia berubah. Artinya kamu tidak perlu menebak puncak atau dasar. Cukup ikuti aturan sederhana:",
        "This principle comes from Dow theory, one of the foundations of technical analysis: a trend is taken to be running until there is a clear sign it has changed. So you do not need to guess the top or the bottom. Just follow simple rules:",
      ),
    },
    {
      kind: "points",
      items: [
        tx("Dalam tren naik, selama harga belum menutup di bawah higher low terakhir, tren naik dianggap masih hidup.", "In an uptrend, as long as price has not closed below the last higher low, the uptrend is taken to be alive."),
        tx("Dalam tren turun, selama harga belum menutup di atas lower high terakhir, tren turun dianggap masih hidup.", "In a downtrend, as long as price has not closed above the last lower high, the downtrend is taken to be alive."),
        tx("Satu candle panjang melawan arah bukan otomatis membalik tren. Yang menentukan adalah struktur titik-titiknya.", "One long candle against the direction does not automatically reverse the trend. What decides is the structure of the points."),
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Menutup, bukan sekadar menyentuh", "Closing, not just touching"),
      text: tx(
        "Gunakan harga penutupan (close) candle sebagai penentu. Bayangan (wick) yang menembus level sebentar sering hanya gerakan menjemput stop loss, bukan perubahan tren.",
        "Use the candle's closing price as the deciding factor. A shadow (wick) that pierces a level briefly is often just a move that triggers stop losses, not a change of trend.",
      ),
    },

    { kind: "heading", text: tx("Kuat atau lemahnya sebuah tren", "Strong or weak trends") },
    {
      kind: "table",
      head: [tx("Ciri", "Feature"), tx("Tren kuat", "Strong trend"), tx("Tren lemah", "Weak trend")],
      rows: [
        [tx("Pullback (mundur sementara)", "Pullback (temporary step back)"), tx("Dangkal dan cepat selesai", "Shallow and over quickly"), tx("Dalam, hampir menghapus kenaikan sebelumnya", "Deep, almost wiping out the previous rise")],
        [tx("Candle searah tren", "Candles with the trend"), tx("Badan besar, sedikit bayangan", "Large bodies, few shadows"), tx("Badan kecil, banyak bayangan", "Small bodies, many shadows")],
        [tx("Kemiringan", "Slope"), tx("Curam", "Steep"), tx("Landai atau mulai mendatar", "Gentle or flattening")],
        [tx("Titik HH / LL baru", "New HH / LL points"), tx("Terbentuk dengan mudah", "Form easily"), tx("Hanya menembus sedikit lalu kembali", "Only break a little, then come back")],
      ],
    },
    {
      kind: "p",
      text: tx(
        "Tren selalu perlu disebut bersama timeframenya. EUR/USD bisa naik di D1, turun di H1 (sedang pullback), dan sideways di M5. Ketiganya tidak saling membantah. Karena itu urutkan: tentukan tren di timeframe besar dulu, lalu cari peluang di timeframe yang lebih kecil.",
        "A trend always needs to be named together with its timeframe. EUR/USD can be rising on D1, falling on H1 (in a pullback) and sideways on M5. The three do not contradict each other. So go in order: decide the trend on the large timeframe first, then look for opportunities on a smaller one.",
      ),
    },

    { kind: "heading", text: tx("Bagaimana trader memanfaatkan tiap kondisi", "How traders use each condition") },
    {
      kind: "table",
      head: [tx("Kondisi", "Condition"), tx("Pendekatan yang umum", "Common approach"), tx("Yang perlu diwaspadai", "What to watch out for")],
      rows: [
        [tx("Tren naik", "Uptrend"), tx("Mencari buy saat pullback ke area support atau higher low", "Looking to buy on a pullback to a support area or higher low"), tx("Jangan mengejar harga yang sudah jauh; stop loss di bawah higher low", "Don't chase price that has run far; stop loss below the higher low")],
        [tx("Tren turun", "Downtrend"), tx("Mencari sell saat kenaikan kecil ke area resistance atau lower high", "Looking to sell on a small rise to a resistance area or lower high"), tx("Jangan menebak dasar; stop loss di atas lower high", "Don't guess the bottom; stop loss above the lower high")],
        [tx("Sideways", "Sideways"), tx("Bermain dari batas ke batas dengan target pendek, atau menunggu breakout", "Trading from boundary to boundary with short targets, or waiting for a breakout"), tx("Breakout palsu sering terjadi; jangan memperbesar posisi", "False breakouts are common; don't increase the position")],
      ],
    },

    { kind: "heading", text: tx("Kesalahan umum", "Common mistakes") },
    {
      kind: "points",
      items: [
        tx("Melawan tren hanya karena \"sudah terlalu tinggi\". Harga bisa tetap naik lebih lama dari yang masuk akal. Murahnya atau mahalnya harga bukan alasan analisis teknikal.", "Going against the trend only because it is \"already too high\". Price can keep rising longer than seems reasonable. Price being cheap or expensive is not a technical-analysis reason."),
        tx("Menyimpulkan tren dari 3 sampai 5 candle. Itu terlalu sedikit; lihat minimal 2 pasang swing.", "Concluding a trend from 3 to 5 candles. That is too few; look at no fewer than 2 pairs of swings."),
        tx("Memaksakan garis tren di pasar sideways. Di range, yang relevan adalah batas atas dan bawah, bukan garis miring.", "Forcing a trendline onto a sideways market. In a range, what matters is the upper and lower boundary, not a sloping line."),
        tx("Mengubah timeframe sampai tren cocok dengan keinginan. Tentukan timeframe dulu, baru baca tren.", "Changing timeframe until the trend matches what you want. Decide the timeframe first, then read the trend."),
        tx("Menganggap sideways sebagai \"tidak ada peluang\". Range juga bisa diperdagangkan, hanya dengan aturan dan target yang berbeda.", "Treating sideways as \"no opportunity\". A range can be traded too, just with different rules and targets."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Ciri tren naik?", "What marks an uptrend?"), a: tx("Higher high dan higher low berurutan.", "Higher highs and higher lows in sequence.") },
        { q: tx("Kapan tren naik dianggap rusak?", "When is an uptrend taken to be broken?"), a: tx("Saat harga menutup di bawah higher low terakhir (lalu struktur lain mengonfirmasi).", "When price closes below the last higher low (and the rest of the structure confirms it).") },
        { q: tx("EUR/USD naik di D1 tetapi turun di M15. Apakah ada yang salah?", "EUR/USD is rising on D1 but falling on M15. Is something wrong?"), a: tx("Tidak. Keduanya berbeda skala; D1 memberi arah besar, M15 pullback.", "No. They are different scales; D1 gives the big direction, M15 is a pullback.") },
        { q: tx("Mengapa jangan menebak puncak tren?", "Why not guess the top of a trend?"), a: tx("Tren berlaku sampai terbukti rusak; menebak berarti melawan arah dominan.", "A trend holds until it is shown to be broken; guessing means going against the dominant direction.") },
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Yang perlu kamu ingat", "What to remember"),
      text: tx(
        "Tren naik = HH + HL. Tren turun = LH + LL. Sideways = puncak dan lembah mendatar. Nilai tren dari struktur swing dan close candle, bukan dari perasaan. Tren dianggap hidup sampai level swing kunci ditutup tembus. Selalu sebut tren bersama timeframenya.",
        "Uptrend = HH + HL. Downtrend = LH + LL. Sideways = flat peaks and troughs. Judge the trend from the swing structure and candle closes, not from feelings. A trend is alive until a key swing level is closed through. Always name the trend together with its timeframe.",
      ),
    },
  ],
  sources: [
    { title: "Identifying a Trend: Forex for Beginners (EURJPY)", publisher: "TradingView Ideas", url: "https://www.tradingview.com/chart/EURJPY/KJxWGjBI-Identifying-a-Trend-Forex-for-Beginners/" },
    { title: "Different Types of Trends in Technical Analysis Charts and Their Uses", publisher: "5paisa", url: "https://www.5paisa.com/blog/different-types-of-trends-in-technical-analysis-charts-and-their-uses" },
    { title: "Market Structure (Price Action)", publisher: "CrossTrade", url: "https://crosstrade.io/learn/price-action/market-structure" },
  ],
}
