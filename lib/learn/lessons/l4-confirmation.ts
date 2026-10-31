import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "15_Konfirmasi_Sebelum_Entry.pdf". Left out for beginners: the maths
// of stacking filters, the hypothetical expectancy and sample-size figures,
// the USD/JPY example, after-entry management and the case study.

export const confirmation: Lesson = {
  slug: "konfirmasi-entry",
  level: 4,
  minutes: 7,
  title: tx("Konfirmasi sebelum mengambil keputusan", "Confirmation before deciding"),
  summary: tx(
    "Menggabungkan level, tren, indikator, ATR, dan candle menjadi satu keputusan yang bisa dicek: kapan masuk, kapan menunggu, kapan lewati.",
    "Combining levels, trend, indicators, ATR and candles into one decision you can check: when to enter, when to wait, when to skip.",
  ),
  material: ["15_Konfirmasi_Sebelum_Entry.pdf"],
  blocks: [
    { kind: "heading", text: tx("Daftar periksa pilot", "A pilot's checklist") },
    {
      kind: "p",
      text: tx(
        "Pilot paling berpengalaman pun tidak lepas landas hanya karena \"rasanya bagus\". Mereka membacakan daftar periksa: bahan bakar, flap, mesin, cuaca. Bukan karena tidak percaya diri, tetapi karena keputusan yang bisa dicek lebih tahan terhadap emosi, lelah, dan lupa.",
        "Even the most experienced pilot doesn't take off just because it \"feels right\". They read through a checklist: fuel, flaps, engines, weather. Not from a lack of confidence, but because a decision you can check holds up better against emotion, tiredness and forgetting.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Konfirmasi", "Confirmation"),
      text: tx(
        "Bukti tambahan, dari sumber yang berbeda, bahwa ide trading-mu didukung kondisi pasar saat ini sebelum kamu masuk. Konfirmasi tidak menjamin menang; ia hanya menyaring setup yang buruk. Stop loss tetap wajib.",
        "Extra evidence, from different sources, that your trading idea is supported by current market conditions before you enter. Confirmation doesn't guarantee a win; it only filters out poor setups. A stop loss is still a must.",
      ),
    },

    { kind: "heading", text: tx("Konfluensi: bukti dari sumber yang berbeda", "Confluence: evidence from different sources") },
    {
      kind: "p",
      text: tx(
        "Konfluensi berarti beberapa bukti bertemu di tempat dan waktu yang sama. Jumlah bukan segalanya; yang penting jenisnya berbeda. Menghitung RSI dan Stochastic sebagai dua konfirmasi berarti menghitung hal yang hampir sama dua kali, sebab keduanya dihitung dari harga penutupan yang sama.",
        "Confluence means several pieces of evidence meeting at the same place and time. The count isn't everything; what matters is that they're of different kinds. Counting RSI and Stochastic as two confirmations counts nearly the same thing twice, since both come from the same closing prices.",
      ),
    },
    {
      kind: "table",
      head: [tx("Jenis bukti", "Kind of evidence"), tx("Pertanyaan yang dijawab", "The question it answers"), tx("Materi terkait", "Related lesson")],
      rows: [
        [tx("Konteks (timeframe besar)", "Context (larger timeframe)"), tx("Apakah arus besar mendukung arah ideku?", "Does the big current support my idea's direction?"), tx("Timeframe, Tren", "Timeframes, Trend")],
        [tx("Lokasi (level)", "Location (level)"), tx("Apakah harga berada di tempat yang bermakna?", "Is price somewhere meaningful?"), tx("Support/Resistance, Trendline", "Support/Resistance, Trendlines")],
        [tx("Struktur", "Structure"), tx("Apakah pergerakan sehat (HH/HL atau LH/LL)?", "Is the movement healthy (HH/HL or LH/LL)?"), tx("Struktur pasar, Pullback", "Market structure, Pullbacks")],
        [tx("Momentum", "Momentum"), tx("Apakah harga searah dengan rata-rata dan tidak ekstrem melawan?", "Is price in line with the average and not at an extreme against it?"), tx("Moving Average, RSI", "Moving Average, RSI")],
        [tx("Volatilitas", "Volatility"), tx("Apakah SL dan target realistis untuk kondisi sekarang?", "Are the SL and target realistic for current conditions?"), tx("ATR", "ATR")],
        [tx("Pemicu (trigger)", "Trigger"), tx("Apakah pembeli/penjual benar-benar muncul di level itu?", "Do buyers/sellers actually show up at that level?"), tx("Candle konfirmasi", "Confirmation candle")],
      ],
      note: tx(
        "Pilih satu atau dua bukti dari tiap jenis. Menumpuk lima indikator sejenis tidak menambah informasi.",
        "Pick one or two pieces of evidence of each kind. Stacking five similar indicators adds no information.",
      ),
    },

    { kind: "heading", text: tx("Candle konfirmasi: tunggu hingga close", "Confirmation candles: wait for the close") },
    {
      kind: "p",
      text: tx(
        "Candle yang masih berjalan bisa berubah total sebelum ditutup: tadinya tampak seperti pin bar cantik, lalu menjadi candle bearish di menit terakhir. Aturan sederhana: nilai candle hanya setelah close.",
        "A candle still forming can change completely before it closes: it looked like a neat pin bar, then turns into a bearish candle in the last minute. A simple rule: judge a candle only after it closes.",
      ),
    },
    {
      kind: "points",
      items: [
        tx("Pin bar bullish: bayangan bawah panjang (sekitar 2 sampai 3 kali badan atau lebih), close dekat high. Artinya harga sempat ditekan turun tetapi ditolak.", "Bullish pin bar: a long lower shadow (about 2 to 3 times the body or more), a close near the high. Price was pushed down but rejected."),
        tx("Engulfing bullish: candle naik yang badannya menelan badan candle turun sebelumnya.", "Bullish engulfing: a rising candle whose body swallows the previous falling candle's body."),
        tx("Close kembali di atas zona: sapuan di bawah level lalu close di atas level sering lebih bermakna daripada sekadar menyentuh.", "Closing back above the zone: a sweep below the level then a close above it often means more than just touching."),
        tx("Candle konfirmasi harus terjadi DI level, bukan di tengah ruang kosong. Untuk sell, balik semuanya.", "The confirmation candle must happen AT the level, not in empty space. For a sell, reverse everything."),
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: tx("Harga konfirmasi itu mahal, tetapi bisa dibayar", "Confirmation has a price, but it's affordable"),
      text: tx(
        "Menunggu close membuat entry-mu lebih jauh dari titik ideal sehingga SL lebih jauh atau RR lebih kecil. Itu sebabnya RR harus dicek ulang setelah konfirmasi, bukan sebelumnya.",
        "Waiting for the close puts your entry further from the ideal point, so the SL is further or the RR smaller. That's why the RR must be rechecked after confirmation, not before.",
      ),
    },

    { kind: "heading", text: tx("Sistem skor 10 poin", "A 10-point score") },
    {
      kind: "table",
      head: [tx("Faktor", "Factor"), tx("Bobot", "Weight")],
      rows: [
        [tx("Tren timeframe besar searah", "Larger-timeframe trend agrees"), tx("2", "2")],
        [tx("Level / zona S&R valid", "A valid S&R level / zone"), tx("2", "2")],
        [tx("Struktur & pullback sehat", "Healthy structure & pullback"), tx("1", "1")],
        [tx("Posisi terhadap MA", "Position relative to the MA"), tx("1", "1")],
        [tx("RSI tidak melawan", "RSI not against it"), tx("1", "1")],
        [tx("Candle konfirmasi sudah close", "Confirmation candle has closed"), tx("2", "2")],
        [tx("RR minimal 1 : 2 dengan SL yang memperhitungkan ATR", "RR of at least 1 : 2 with an ATR-aware SL"), tx("1", "1")],
      ],
      note: tx(
        "Bobot ini hipotesis awal, bukan kebenaran: titik mulai yang disesuaikan dengan data jurnalmu sendiri setelah puluhan transaksi.",
        "These weights are a starting hypothesis, not the truth: a starting point to adjust with your own journal data after dozens of trades.",
      ),
    },
    {
      kind: "table",
      head: [tx("Skor", "Score"), tx("Tindakan", "Action")],
      rows: [
        [tx("8 – 10", "8 – 10"), tx("Entry sesuai rencana dengan risiko standar (misal 1%).", "Enter as planned with standard risk (for example 1%).")],
        [tx("7", "7"), tx("Entry boleh, perhatikan faktor yang bernilai 0; pertimbangkan risiko lebih kecil.", "Entry allowed; mind the factors that scored 0; consider a smaller risk.")],
        [tx("5 – 6", "5 – 6"), tx("Pantau saja (watchlist). Tunggu faktor yang kurang terpenuhi.", "Just watch (watchlist). Wait for the missing factors.")],
        [tx("0 – 4", "0 – 4"), tx("Lewati. Mencatat setup ini di jurnal sebagai \"ditolak\" juga latihan yang berharga.", "Skip. Recording the setup in your journal as \"rejected\" is valuable practice too.")],
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Overfitting", "Overfitting"),
      text: tx(
        "Setiap filter menyisihkan sebagian peluang, dan filter yang terlalu banyak sering hasil menyesuaikan diri dengan masa lalu: sistem tampak sempurna di data lama, tetapi gagal di data baru. Pilih sedikit filter yang masuk akal secara logika.",
        "Every filter removes some opportunities, and too many filters are often the result of fitting the past: the system looks perfect on old data but fails on new data. Choose a few filters that make logical sense.",
      ),
    },

    { kind: "heading", text: tx("Kapan TIDAK masuk", "When NOT to enter") },
    {
      kind: "table",
      head: [tx("Kondisi", "Condition"), tx("Alasan", "Reason"), tx("Tindakan", "Action")],
      rows: [
        [tx("Berita besar dalam beberapa menit/jam ke depan", "Big news in the next few minutes/hours"), tx("ATR dan spread bisa melonjak; level sering tersapu", "ATR and spread can surge; levels often get swept"), tx("Tunggu rilis lewat dan lihat reaksi harga", "Wait until the release has passed and watch the reaction")],
        [tx("Spread melebar tidak biasa", "Unusually wide spread"), tx("Biaya masuk dan risiko tergelincir naik", "Higher entry cost and slippage risk"), tx("Tunggu spread normal", "Wait for a normal spread")],
        [tx("SL struktural terlalu jauh (RR di bawah 1 : 1,5)", "Structural SL too far (RR below 1 : 1.5)"), tx("Risiko tidak sebanding dengan potensi", "The risk isn't worth the potential"), tx("Cari entry lebih dekat atau lewati", "Find a closer entry or skip")],
        [tx("Candle konfirmasi belum close", "Confirmation candle not closed"), tx("Bentuk bisa berubah", "Its shape can change"), tx("Tunggu close", "Wait for the close")],
        [tx("Batas rugi harian sudah tercapai", "Daily loss limit reached"), tx("Keputusan setelah rugi sering emosional", "Decisions after losses are often emotional"), tx("Berhenti hari ini", "Stop for today")],
        [tx("Kamu lelah, marah, atau ingin \"balas dendam\"", "You're tired, angry or want \"revenge\""), tx("Disiplin menurun", "Discipline drops"), tx("Tutup platform; kembali besok", "Close the platform; come back tomorrow")],
      ],
    },
    {
      kind: "table",
      head: [tx("Rencana trade tertulis", "Written trade plan"), tx("Isi", "Contents")],
      rows: [
        [tx("Pair / timeframe", "Pair / timeframe"), tx("Contoh: EUR/USD, H1 (konteks H4)", "Example: EUR/USD, H1 (H4 context)")],
        [tx("Ide (alasan)", "Idea (reason)"), tx("Tren naik, pullback ke support, pin bar close di atas zona", "Uptrend, pullback to support, pin bar closing above the zone")],
        [tx("Entry", "Entry"), tx("Setelah close candle konfirmasi", "After the confirmation candle closes")],
        [tx("Stop loss", "Stop loss"), tx("Di balik swing low + buffer ½ ATR", "Behind the swing low + a ½ ATR buffer")],
        [tx("Take profit", "Take profit"), tx("Resistance terdekat / minimal 1 : 2", "Nearest resistance / at least 1 : 2")],
        [tx("Ukuran posisi", "Position size"), tx("Dari risiko uang ÷ (jarak SL × pip value)", "From money at risk ÷ (SL distance × pip value)")],
        [tx("Kondisi pembatalan", "Cancel condition"), tx("Jika harga close di bawah zona sebelum entry, setup batal", "If price closes below the zone before entry, the setup is off")],
      ],
      note: tx(
        "Jika kamu tidak bisa mengisinya dalam satu menit, kamu belum siap masuk.",
        "If you can't fill it in within a minute, you're not ready to enter.",
      ),
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Menumpuk indikator sejenis dan menyebutnya konfluensi.", "Stacking similar indicators and calling it confluence."),
        tx("Masuk sebelum candle konfirmasi close.", "Entering before the confirmation candle closes."),
        tx("Menurunkan standar skor setelah beberapa hari tanpa transaksi (rasa bosan).", "Lowering the score standard after a few days without trades (boredom)."),
        tx("Menganggap skor tinggi sebagai jaminan lalu memperbesar lot.", "Treating a high score as a guarantee and increasing the lot."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Mengapa RSI dan Stochastic bukan dua konfirmasi yang berbeda?", "Why aren't RSI and Stochastic two separate confirmations?"), a: tx("Keduanya dihitung dari data harga yang sama sehingga informasinya tumpang tindih.", "Both come from the same price data, so their information overlaps.") },
        { q: tx("Kapan candle konfirmasi dinilai?", "When is a confirmation candle judged?"), a: tx("Setelah candle itu close.", "After it closes.") },
        { q: tx("Skor 5 dari 10. Tindakan?", "A score of 5 out of 10. What to do?"), a: tx("Pantau (watchlist), jangan entry dulu.", "Watch it (watchlist); don't enter yet.") },
        { q: tx("Entry 1,0868 ; SL 1,0836 ; TP 1,0932. RR?", "Entry 1.0868 ; SL 1.0836 ; TP 1.0932. RR?"), a: tx("SL 32 pip, TP 64 pip → 1 : 2.", "SL 32 pips, TP 64 pips → 1 : 2.") },
      ],
    },
  ],
  sources: [
    { title: "Guide to Pullback Continuation Setups", publisher: "TradingView Ideas" },
    { title: "3 Common Trading Mistakes Traders Should Avoid", publisher: "TradingView Ideas" },
    { title: "How to Avoid False Breakouts", publisher: "Finkarma (Substack)" },
  ],
}
