import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "10_Pullback_dan_Retest.pdf". Left out for beginners: the three entry
// techniques, the full trading plan, the USD/JPY example, position
// management, confluence scoring and the case study.

export const pullback: Lesson = {
  slug: "pullback-retest",
  level: 4,
  minutes: 7,
  title: tx("Pullback dan retest", "Pullbacks and retests"),
  summary: tx(
    "Seni menunggu harga kembali: masuk di titik yang lebih baik tanpa mengejar harga yang sudah lari.",
    "The art of waiting for price to come back: entering at a better point without chasing price that has run.",
  ),
  material: ["10_Pullback_dan_Retest.pdf"],
  blocks: [
    { kind: "heading", text: tx("Langkah mundur sebelum melompat", "A step back before the jump") },
    {
      kind: "p",
      text: tx(
        "Atlet lompat jauh berlari mundur dulu sebelum melompat. Harga sering bersikap sama: setelah bergerak cepat ke satu arah, ia menarik napas dengan bergerak sebentar ke arah sebaliknya, lalu melanjutkan. Trader pemula sering mengejar harga ketika sedang lari dan akhirnya membeli di puncak sementara. Trader yang lebih sabar menunggu napas itu.",
        "A long jumper steps back before running at the jump. Price often behaves the same way: after moving fast in one direction, it takes a breath by moving briefly the other way, then carries on. Beginners often chase price while it is running and end up buying at a temporary top. More patient traders wait for that breath.",
      ),
    },
    {
      kind: "table",
      head: [tx("", ""), tx("Pullback", "Pullback"), tx("Retest", "Retest"), tx("Reversal", "Reversal")],
      rows: [
        [tx("Arti", "Meaning"), tx("Gerak sementara berlawanan arah tren, sementara struktur tren belum rusak", "A temporary move against the trend while the trend's structure is intact"), tx("Harga kembali ke level yang baru ditembus untuk menguji apakah level itu kini berfungsi terbalik", "Price returns to a level just broken, testing whether it now works the other way"), tx("Pembalikan tren yang sebenarnya: struktur berubah", "A real trend reversal: the structure changes")],
        [tx("Terjadi setelah", "Comes after"), tx("Dorongan searah tren", "A push with the trend"), tx("Breakout dari level", "A breakout from a level"), tx("Tren yang sudah berjalan lama / kehabisan tenaga", "A trend that has run long / run out of steam")],
        [tx("Struktur", "Structure"), tx("HL atau LH terakhir tetap terjaga", "The last HL or LH holds"), tx("Level baru bertahan", "The new level holds"), tx("HL atau LH terakhir ditembus", "The last HL or LH breaks")],
        [tx("Pendekatan", "Approach"), tx("Cari entry searah tren", "Look for entries with the trend"), tx("Cari entry searah breakout", "Look for entries with the breakout"), tx("Berhenti mencari entry searah tren lama", "Stop looking for entries with the old trend")],
      ],
    },
    {
      kind: "chart",
      pick: "swings",
      caption: tx(
        "Data historis nyata. Setiap swing low di antara dua swing high adalah ujung sebuah pullback; selama low-nya makin tinggi (HL), tren naik belum rusak.",
        "Real historical data. Each swing low between two swing highs is the end of a pullback; as long as the lows keep rising (HL), the uptrend is intact.",
      ),
    },
    {
      kind: "points",
      title: tx("Mengapa pullback terjadi", "Why pullbacks happen"),
      items: [
        tx("Ambil untung. Trader yang sudah untung menutup posisi, menekan harga sedikit ke arah berlawanan.", "Profit taking. Traders already in profit close positions, pushing price a little the other way."),
        tx("Pembeli baru menunggu harga lebih rendah. Banyak orang tidak mau membeli di puncak; mereka memasang order beli di bawah.", "New buyers wait for a lower price. Many people won't buy at the top; they place buy orders lower down."),
        tx("Level penting. Harga kembali ke level yang tadi ditembus karena trader bereaksi di sana (role reversal).", "Important levels. Price returns to the level it just broke because traders react there (role reversal)."),
      ],
    },

    { kind: "heading", text: tx("Seberapa dalam pullback yang wajar? Fibonacci retracement", "How deep is a normal pullback? Fibonacci retracement") },
    {
      kind: "p",
      text: tx(
        "Fibonacci retracement membagi jarak antara swing low dan swing high menjadi beberapa persentase konvensional: 38,2%, 50%, 61,8% dan kadang 78,6%. Ini konvensi yang banyak dipakai trader, bukan hukum alam. Alat ini berguna terutama karena banyak orang memantau level yang sama.",
        "Fibonacci retracement divides the distance between a swing low and a swing high into conventional percentages: 38.2%, 50%, 61.8% and sometimes 78.6%. It is a convention many traders use, not a law of nature. It is useful mainly because many people watch the same levels.",
      ),
    },
    {
      kind: "calc",
      title: tx("Uptrend EUR/USD: swing low 1,0800, swing high 1,0900", "EUR/USD uptrend: swing low 1.0800, swing high 1.0900"),
      lines: [
        tx("Level = swing high − (swing high − swing low) × rasio", "Level = swing high − (swing high − swing low) × ratio"),
        tx("38,2% → 1,0900 − 0,0100 × 0,382 = 1,08618 (pullback dangkal)", "38.2% → 1.0900 − 0.0100 × 0.382 = 1.08618 (a shallow pullback)"),
        tx("50,0% → 1,0900 − 0,0100 × 0,500 = 1,0850 (pullback sedang)", "50.0% → 1.0900 − 0.0100 × 0.500 = 1.0850 (a medium pullback)"),
        tx("61,8% → 1,0900 − 0,0100 × 0,618 = 1,08382 (pullback dalam)", "61.8% → 1.0900 − 0.0100 × 0.618 = 1.08382 (a deep pullback)"),
        tx("100% → 1,0800 (kembali ke swing low: struktur naik rusak)", "100% → 1.0800 (back to the swing low: the upward structure is broken)"),
      ],
    },
    {
      kind: "table",
      head: [tx("Kedalaman pullback", "Pullback depth"), tx("Tafsiran umum", "Common reading"), tx("Pendekatan", "Approach")],
      rows: [
        [tx("≤ 38,2%", "≤ 38.2%"), tx("Tren sangat kuat, pembeli agresif", "A very strong trend, aggressive buyers"), tx("Entry sering tanpa kesempatan; jangan memaksa", "Often no chance to enter; don't force it")],
        [tx("38,2% – 61,8%", "38.2% – 61.8%"), tx("Pullback sehat, zona favorit", "A healthy pullback, the favourite zone"), tx("Cari konfirmasi di zona ini", "Look for confirmation in this zone")],
        [tx("61,8% – 78,6%", "61.8% – 78.6%"), tx("Tren melemah, risiko pembalikan naik", "The trend is weakening, reversal risk rising"), tx("Lebih selektif, ukuran posisi lebih kecil", "Be more selective, use a smaller position")],
        [tx("> 100%", "> 100%"), tx("Struktur rusak", "The structure is broken"), tx("Bukan pullback lagi; evaluasi ulang", "No longer a pullback; reassess")],
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Pisau jatuh", "A falling knife"),
      text: tx(
        "Membeli saat harga masih jatuh deras tanpa tanda berhenti sering disebut menangkap pisau jatuh. Pullback bukan berarti \"harga turun, saatnya beli\". Ia berarti \"harga turun ke zona tertentu, dan menunjukkan tanda tertahan\".",
        "Buying while price is still falling hard with no sign of stopping is called catching a falling knife. A pullback doesn't mean \"price fell, time to buy\". It means \"price fell to a particular zone and shows signs of holding\".",
      ),
    },

    { kind: "heading", text: tx("Retest: break, retest, lanjut", "Retest: break, retest, continue") },
    {
      kind: "steps",
      items: [
        tx("Level terbentuk: harga beberapa kali ditolak di resistance.", "A level forms: price is rejected at resistance several times."),
        tx("Breakout: harga menutup di atas resistance.", "Breakout: price closes above resistance."),
        tx("Retest: harga turun kembali ke zona resistance lama yang kini diharapkan menjadi support.", "Retest: price drops back to the old resistance zone, now expected to act as support."),
        tx("Penolakan: muncul tanda pembeli kembali (candle penolakan) dan harga lanjut naik.", "Rejection: signs of buyers returning appear (a rejection candle) and price moves on up."),
      ],
    },
    {
      kind: "table",
      head: [tx("Hasil retest", "Retest outcome"), tx("Tanda", "Sign"), tx("Arti", "Meaning")],
      rows: [
        [tx("Ideal", "Ideal"), tx("Bayangan menyentuh zona, close di atas, candle bullish", "A shadow touches the zone, a close above, a bullish candle"), tx("Level berganti peran; setup masuk", "The level has changed roles; a setup to enter")],
        [tx("Gagal", "Failed"), tx("Close di bawah zona", "A close below the zone"), tx("Breakout palsu; hentikan skenario", "A false breakout; drop the scenario")],
        [tx("Tidak ada retest", "No retest"), tx("Harga lari tanpa kembali", "Price runs without coming back"), tx("Tidak ada setup; jangan mengejar", "No setup; don't chase")],
      ],
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Menganggap setiap penurunan di uptrend sebagai pullback. Cek struktur: apakah HL terakhir bertahan?", "Treating every fall in an uptrend as a pullback. Check the structure: is the last HL holding?"),
        tx("Menunggu level Fibonacci yang \"sempurna\". Fibonacci adalah zona, bukan angka tunggal.", "Waiting for a \"perfect\" Fibonacci level. Fibonacci is a zone, not a single number."),
        tx("Stop loss terlalu dekat. Pullback sering menyapu sedikit di bawah zona. Letakkan SL di luar zona.", "A stop loss too close. Pullbacks often sweep a little below the zone. Put the SL outside the zone."),
        tx("Mengejar setelah ketinggalan. Jika pullback tidak terjadi, itu bukan kegagalan; itu berarti tidak ada setup.", "Chasing after missing it. If no pullback comes, that isn't failure; it means there was no setup."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Beda pullback dan reversal?", "The difference between a pullback and a reversal?"), a: tx("Pullback tidak merusak struktur (HL/LH terakhir terjaga); reversal merusaknya.", "A pullback leaves the structure intact (the last HL/LH holds); a reversal breaks it.") },
        { q: tx("Swing low 1,2000, swing high 1,2100. Level 50% pada uptrend?", "Swing low 1.2000, swing high 1.2100. The 50% level in an uptrend?"), a: tx("1,2100 − 0,0100 × 0,5 = 1,2050.", "1.2100 − 0.0100 × 0.5 = 1.2050.") },
        { q: tx("Pullback melewati 100% dari dorongan. Apa artinya?", "A pullback goes past 100% of the push. What does it mean?"), a: tx("Struktur rusak; bukan pullback lagi.", "The structure is broken; it's no longer a pullback.") },
        { q: tx("Apa yang dilakukan jika harga tidak pernah retest?", "What do you do if price never retests?"), a: tx("Lewati; jangan mengejar.", "Skip it; don't chase.") },
      ],
    },
  ],
  sources: [
    { title: "Guide to Pullback Continuation Setups", publisher: "TradingView Ideas" },
    { title: "How to Trade the Break and Retest (AUDUSD)", publisher: "TradingView Ideas", url: "https://www.tradingview.com/chart/AUDUSD/Xwf8XXNu-How-to-Trade-The-Break-Retest/" },
  ],
}
