import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "08_Trendline_dan_Channel.pdf". Left out for beginners: the channel
// trading plan with ATR-based stops and lot sizes, the case study, the
// practice table and the FAQ.

export const trendline: Lesson = {
  slug: "trendline-channel",
  level: 4,
  minutes: 8,
  title: tx("Trendline dan channel", "Trendlines and channels"),
  summary: tx(
    "Menggambar jalur yang dilalui harga: garis tren, saluran, dan cara memakainya sebagai support-resistance yang bergerak.",
    "Drawing the path price travels: trendlines, channels, and how to use them as moving support and resistance.",
  ),
  material: ["08_Trendline_dan_Channel.pdf"],
  blocks: [
    { kind: "heading", text: tx("Rel kereta untuk harga", "Railway tracks for price") },
    {
      kind: "p",
      text: tx(
        "Ketika pasar sedang bertren, harga tidak berhenti di level yang sama; ia mendaki atau menuruni lereng. Di sinilah trendline (garis tren) berguna. Bayangkan kereta yang berjalan di rel miring: selama kereta tetap di atas rel, perjalanan berlanjut. Ketika roda keluar dari rel, ada sesuatu yang berubah.",
        "When the market is trending, price doesn't stop at the same level; it climbs or descends a slope. That is where a trendline helps. Picture a train on a sloping track: as long as it stays on the rails, the journey continues. When the wheels leave the rails, something has changed.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Trendline", "Trendline"),
      text: tx(
        "Trendline naik: garis lurus yang menghubungkan dua atau lebih swing low yang makin tinggi, berfungsi sebagai support yang bergerak naik. Trendline turun: garis lurus yang menghubungkan dua atau lebih swing high yang makin rendah, berfungsi sebagai resistance yang bergerak turun. Karena harganya berubah tiap candle, trendline disebut support/resistance dinamis; level horizontal disebut statis.",
        "An uptrend line: a straight line joining two or more rising swing lows, acting as support that moves up. A downtrend line: a straight line joining two or more falling swing highs, acting as resistance that moves down. Because its price changes every candle, a trendline is called dynamic support/resistance; a horizontal level is called static.",
      ),
    },
    {
      kind: "chart",
      pick: "trendline",
      caption: tx(
        "Data historis nyata. Garis ditarik otomatis melalui dua swing low yang makin tinggi, lalu diteruskan ke kanan.",
        "Real historical data. The line is drawn automatically through two rising swing lows, then extended to the right.",
      ),
    },
    {
      kind: "steps",
      title: tx("Aturan menggambar trendline", "Rules for drawing a trendline"),
      items: [
        tx("Mulai dari tren yang jelas. Pastikan strukturnya memang HH+HL (naik) atau LH+LL (turun). Garis tren di pasar sideways tidak bermakna.", "Start from a clear trend. Make sure the structure really is HH+HL (up) or LH+LL (down). A trendline in a sideways market means nothing."),
        tx("Tandai swing, bukan sembarang titik. Hubungkan swing low (garis naik) atau swing high (garis turun) yang sudah terkonfirmasi.", "Mark swings, not random points. Join confirmed swing lows (rising line) or swing highs (falling line)."),
        tx("Dua titik membuat garis, titik ketiga mengonfirmasinya. Garis dari dua titik hanya hipotesis.", "Two points make a line; a third confirms it. A line from two points is only a hypothesis."),
        tx("Garis tidak boleh memotong badan candle di antara dua titik. Bayangan yang sedikit menembus bisa ditoleransi.", "The line must not cut through candle bodies between the two points. A shadow poking through slightly is tolerable."),
        tx("Jangan memaksa. Kalau butuh memutar-mutar garis agar \"cocok\", kemungkinan garisnya memang tidak ada.", "Don't force it. If you need to twist the line around to make it \"fit\", the line probably isn't there."),
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Aturan 3 titik, dengan catatan", "The 3-point rule, with a caveat"),
      text: tx(
        "Tiga sentuhan membuat garis lebih meyakinkan, tetapi bukan jaminan. Garis dengan 5 sampai 6 sentuhan sering justru dekat dengan penembusan.",
        "Three touches make a line more convincing, but they are no guarantee. A line with 5 or 6 touches is often close to breaking.",
      ),
    },

    { kind: "heading", text: tx("Menghitung kemiringan dan memproyeksikan garis", "Working out the slope and projecting the line") },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Rumus garis tren", "The trendline formula"),
      text: tx(
        "Slope = (harga titik 2 − harga titik 1) ÷ (nomor candle titik 2 − nomor candle titik 1). Harga garis di candle x = harga titik 1 + slope × (x − nomor candle titik 1).",
        "Slope = (price at point 2 − price at point 1) ÷ (candle number of point 2 − candle number of point 1). Line price at candle x = price at point 1 + slope × (x − candle number of point 1).",
      ),
    },
    {
      kind: "calc",
      title: tx("Uptrend line EUR/USD, timeframe H1", "An EUR/USD uptrend line on H1"),
      lines: [
        tx("Swing low 1: candle #10, harga 1,0800", "Swing low 1: candle #10, price 1.0800"),
        tx("Swing low 2: candle #30, harga 1,0880", "Swing low 2: candle #30, price 1.0880"),
        tx("Slope = (1,0880 − 1,0800) ÷ (30 − 10) = 0,0004 per candle = 4 pip per candle", "Slope = (1.0880 − 1.0800) ÷ (30 − 10) = 0.0004 per candle = 4 pips per candle"),
        tx("Harga garis di candle #45 = 1,0800 + 0,0004 × (45 − 10) = 1,0940", "Line price at candle #45 = 1.0800 + 0.0004 × (45 − 10) = 1.0940"),
      ],
      note: tx(
        "Karena garisnya miring, level yang sama berbeda harganya tiap candle. Order tertunda yang berbasis trendline harus diperbarui tiap beberapa candle.",
        "Because the line slopes, the same level has a different price every candle. Pending orders based on a trendline must be updated every few candles.",
      ),
    },
    {
      kind: "table",
      head: [tx("Kemiringan", "Slope"), tx("Ciri", "Feature"), tx("Perlakuan", "How to treat it")],
      rows: [
        [tx("Sangat curam", "Very steep"), tx("Kenaikan atau penurunan cepat, sering setelah berita", "A fast rise or fall, often after news"), tx("Jangan jadikan acuan utama; cepat tertembus", "Don't make it the main reference; it breaks quickly")],
        [tx("Sedang", "Moderate"), tx("Naik-turun teratur, pullback dangkal", "Orderly swings, shallow pullbacks"), tx("Kondisi paling ideal untuk garis tren", "The best condition for a trendline")],
        [tx("Sangat landai", "Very gentle"), tx("Hampir mendatar", "Almost flat"), tx("Perlakukan seperti range; fokus pada level horizontal", "Treat it like a range; focus on horizontal levels")],
      ],
      note: tx(
        "Tertembusnya garis curam tidak berarti tren berbalik; sering kali tren hanya beralih ke kemiringan yang lebih landai, dan garis baru perlu digambar.",
        "A steep line breaking doesn't mean the trend has reversed; often the trend just shifts to a gentler slope, and a new line needs drawing.",
      ),
    },

    { kind: "heading", text: tx("Penembusan garis tren: apa artinya", "A trendline break: what it means") },
    {
      kind: "table",
      head: [tx("Setelah garis tertembus", "After the line breaks"), tx("Kemungkinan", "Possibility")],
      rows: [
        [tx("Harga kembali ke atas garis dengan cepat", "Price quickly returns above the line"), tx("Penembusan palsu (false break)", "A false break")],
        [tx("Harga mendatar lalu membuat range", "Price goes flat and forms a range"), tx("Tren berhenti, masuk konsolidasi", "The trend pauses into consolidation")],
        [tx("Harga melanjutkan dengan kemiringan lebih landai", "Price carries on at a gentler slope"), tx("Tren sehat, hanya mengubah kecepatan", "A healthy trend, just changing speed")],
        [tx("Harga menutup di bawah HL terakhir lalu membuat LH dan LL", "Price closes below the last HL then makes an LH and LL"), tx("Tren berbalik", "The trend reverses")],
      ],
    },
    {
      kind: "points",
      title: tx("Aturan praktis menilai penembusan", "Practical rules for judging a break"),
      items: [
        tx("Close: candle harus menutup di luar garis, bukan hanya bayangannya yang menembus.", "Close: the candle must close beyond the line, not just poke through with a shadow."),
        tx("Dua close: dua candle berturut-turut menutup di luar garis, untuk menyaring penembusan palsu.", "Two closes: two candles in a row close beyond the line, to filter out false breaks."),
        tx("Struktur: penembusan lebih bermakna jika sekaligus menembus swing penting (HL atau LH terakhir).", "Structure: a break means more if it also breaks an important swing (the last HL or LH)."),
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Ini aturan bantu, bukan hukum", "These are aids, not laws"),
      text: tx(
        "Semua aturan di atas adalah kebiasaan trader untuk mengurangi sinyal palsu, bukan rumus yang terbukti selalu benar. Pilih satu kombinasi, catat hasilnya di jurnal, dan evaluasi dengan data sendiri.",
        "All the rules above are traders' habits to reduce false signals, not formulas proven always right. Pick one combination, record the results in your journal and evaluate them with your own data.",
      ),
    },

    { kind: "heading", text: tx("Channel: garis kedua yang membentuk saluran", "Channels: a second line forms a corridor") },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Channel (saluran)", "Channel"),
      text: tx(
        "Dua garis sejajar: garis tren utama ditambah garis kedua yang melewati swing di sisi seberang. Harga bergerak di dalam saluran itu. Garis tengah (midline) di setengah lebar saluran sering jadi target pertama.",
        "Two parallel lines: the main trendline plus a second line through the swings on the opposite side. Price moves inside that corridor. The midline, halfway across, is often the first target.",
      ),
    },
    {
      kind: "table",
      head: [tx("Jenis", "Type"), tx("Garis bawah", "Lower line"), tx("Garis atas", "Upper line"), tx("Kondisi pasar", "Market condition")],
      rows: [
        [tx("Ascending channel", "Ascending channel"), tx("Trendline naik", "Rising trendline"), tx("Garis sejajar melalui swing high", "Parallel line through swing highs"), tx("Uptrend teratur", "An orderly uptrend")],
        [tx("Descending channel", "Descending channel"), tx("Garis sejajar melalui swing low", "Parallel line through swing lows"), tx("Trendline turun", "Falling trendline"), tx("Downtrend teratur", "An orderly downtrend")],
        [tx("Horizontal channel", "Horizontal channel"), tx("Support horizontal", "Horizontal support"), tx("Resistance horizontal", "Horizontal resistance"), tx("Sideways (range)", "Sideways (range)")],
      ],
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Menggambar garis setelah tahu hasilnya. Garis cantik dari data lama tidak membuktikan apa pun.", "Drawing the line after you know the outcome. A neat line on old data proves nothing."),
        tx("Menganggap satu bayangan yang menembus sebagai penembusan. Tunggu close.", "Treating one shadow poking through as a break. Wait for the close."),
        tx("Menaruh stop loss tepat di garis. Garis adalah area; beri buffer.", "Putting the stop loss exactly on the line. The line is an area; give it a buffer."),
        tx("Menjadikan garis sebagai satu-satunya alasan. Gabungkan dengan struktur, level horizontal, dan konfirmasi candle.", "Making the line your only reason. Combine it with structure, horizontal levels and candle confirmation."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Low1 #5 = 1,0900 dan low2 #25 = 1,0940. Berapa slope per candle?", "Low1 #5 = 1.0900 and low2 #25 = 1.0940. What is the slope per candle?"), a: tx("(1,0940 − 1,0900) ÷ 20 = 0,0002 = 2 pip per candle.", "(1.0940 − 1.0900) ÷ 20 = 0.0002 = 2 pips per candle.") },
        { q: tx("Dari soal di atas, berapa harga garis di candle #40?", "From the question above, what is the line's price at candle #40?"), a: tx("1,0900 + 0,0002 × 35 = 1,0970.", "1.0900 + 0.0002 × 35 = 1.0970.") },
        { q: tx("Garis curam tertembus. Apakah pasti tren berbalik?", "A steep line breaks. Has the trend definitely reversed?"), a: tx("Tidak. Sering hanya beralih ke kemiringan lebih landai.", "No. It often just shifts to a gentler slope.") },
      ],
    },
  ],
  sources: [
    { title: "How to Draw Trendlines and Their Importance", publisher: "TradingView Ideas", url: "https://www.tradingview.com/chart/AMBUJACEM/pcdwy1tm-How-to-Draw-Trendlines-and-Their-Importance/" },
    { title: "Uptrend Line Support (ideas)", publisher: "TradingView Ideas", url: "https://www.tradingview.com/ideas/uptrendlinesupport/" },
  ],
}
