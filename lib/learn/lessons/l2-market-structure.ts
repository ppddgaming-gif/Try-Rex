import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "05_Swing_High_Swing_Low_dan_Market_Structure.pdf". Left out for
// beginners: the table of n values and structure inside structure.

export const marketStructure: Lesson = {
  slug: "struktur-pasar",
  level: 2,
  minutes: 7,
  title: tx("Swing high, swing low, dan struktur pasar", "Swing highs, swing lows and market structure"),
  summary: tx(
    "Membaca kerangka tulang pergerakan harga: titik balik, struktur, dan tanda-tanda berbaliknya arah.",
    "Reading the skeleton of price movement: turning points, structure and the signs of a change in direction.",
  ),
  material: ["05_Swing_High_Swing_Low_dan_Market_Structure.pdf"],
  blocks: [
    { kind: "heading", text: tx("Titik balik adalah kerangka chart", "Turning points are the chart's skeleton") },
    {
      kind: "p",
      text: tx(
        "Kalau kamu menghapus semua candle dan hanya menyisakan titik-titik balik terpenting, yang tersisa adalah kerangka tulang dari pergerakan harga. Kerangka inilah yang disebut market structure. Hampir semua materi lanjutan (tren, support-resistance, pola harga) berdiri di atas kemampuan ini.",
        "If you erase every candle and keep only the most important turning points, what remains is the skeleton of price movement. That skeleton is called market structure. Almost every later topic (trends, support and resistance, price patterns) stands on this skill.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Swing high dan swing low", "Swing high and swing low"),
      text: tx(
        "Swing high: candle dengan high tertinggi dibanding beberapa candle di kiri dan di kanannya. Itu puncak lokal. Swing low: candle dengan low terendah dibanding beberapa candle di kiri dan di kanannya. Itu lembah lokal.",
        "Swing high: a candle whose high is the highest compared with several candles to its left and right. It is a local peak. Swing low: a candle whose low is the lowest compared with several candles to its left and right. It is a local trough.",
      ),
    },
    {
      kind: "p",
      text: tx(
        "Agar tidak tergantung perasaan, banyak trader memakai aturan angka n: sebuah candle disebut swing high jika high-nya lebih tinggi dari n candle sebelum dan n candle sesudahnya. Dengan n = 2, sebuah swing high butuh pola 5 candle dengan candle tengah paling tinggi. Swing low kebalikannya. Untuk pemula, n = 3 sampai 5 memberi swing yang lebih sedikit tetapi lebih bermakna.",
        "So as not to depend on feelings, many traders use a number rule n: a candle is a swing high if its high is above the n candles before it and the n candles after it. With n = 2, a swing high needs a 5-candle pattern with the middle candle highest. A swing low is the reverse. For beginners, n = 3 to 5 gives fewer but more meaningful swings.",
      ),
    },
    {
      kind: "chart",
      pick: "swings",
      caption: tx(
        "Data historis nyata. Swing high dan swing low ditandai otomatis dengan aturan n = 3, lalu diberi label HH, HL, LH, atau LL.",
        "Real historical data. Swing highs and lows are marked automatically with the n = 3 rule, then labelled HH, HL, LH or LL.",
      ),
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Swing baru terkonfirmasi belakangan", "A swing is only confirmed later"),
      text: tx(
        "Karena butuh n candle sesudahnya, sebuah swing high atau low baru bisa dipastikan setelah n candle berikutnya terbentuk. Kamu tidak bisa tahu secara real-time apakah candle terakhir adalah puncak. Ini bukan kelemahan alat, ini sifat dasar titik balik.",
        "Because it needs n candles after it, a swing high or low can only be confirmed once the next n candles have formed. You cannot know in real time whether the last candle is the peak. This is not a flaw of the tool; it is the nature of turning points.",
      ),
    },

    { kind: "heading", text: tx("Empat label struktur: HH, HL, LH, LL", "Four structure labels: HH, HL, LH, LL") },
    {
      kind: "table",
      head: [tx("Label", "Label"), tx("Kepanjangan", "Stands for"), tx("Artinya", "Meaning"), tx("Muncul pada", "Appears in")],
      rows: [
        [tx("HH", "HH"), tx("Higher High", "Higher High"), tx("Swing high baru lebih tinggi dari swing high sebelumnya", "A new swing high above the previous swing high"), tx("Tren naik", "Uptrend")],
        [tx("HL", "HL"), tx("Higher Low", "Higher Low"), tx("Swing low baru lebih tinggi dari swing low sebelumnya", "A new swing low above the previous swing low"), tx("Tren naik", "Uptrend")],
        [tx("LH", "LH"), tx("Lower High", "Lower High"), tx("Swing high baru lebih rendah dari swing high sebelumnya", "A new swing high below the previous swing high"), tx("Tren turun", "Downtrend")],
        [tx("LL", "LL"), tx("Lower Low", "Lower Low"), tx("Swing low baru lebih rendah dari swing low sebelumnya", "A new swing low below the previous swing low"), tx("Tren turun", "Downtrend")],
      ],
    },

    { kind: "heading", text: tx("BOS dan CHoCH: dua istilah penting", "BOS and CHoCH: two important terms") },
    {
      kind: "p",
      text: tx(
        "Istilah ini populer di komunitas trading modern. Dasar idenya lebih tua, yaitu teori Dow. Karena sifatnya konvensi komunitas, definisi tepatnya sedikit berbeda antar trader. Berikut versi paling umum:",
        "These terms are popular in today's trading community. The underlying idea is older: Dow theory. Because they are community conventions, the exact definitions differ slightly between traders. This is the most common version:",
      ),
    },
    {
      kind: "table",
      head: [tx("Istilah", "Term"), tx("Definisi", "Definition"), tx("Makna", "Meaning")],
      rows: [
        [tx("BOS (Break of Structure)", "BOS (Break of Structure)"), tx("Harga menutup melewati swing sebelumnya searah tren yang berjalan", "Price closes past the previous swing in the direction of the current trend"), tx("Tren berlanjut", "The trend continues")],
        [tx("CHoCH (Change of Character)", "CHoCH (Change of Character)"), tx("Harga menutup melewati swing penting berlawanan arah tren (misalnya di bawah HL terakhir pada uptrend)", "Price closes past an important swing against the trend (for example below the last HL in an uptrend)"), tx("Peringatan pertama tren mungkin berbalik", "The first warning the trend may reverse")],
      ],
    },
    {
      kind: "steps",
      title: tx("Urutan berbaliknya tren", "How a trend reverses"),
      items: [
        tx("Tren naik sehat: HH dan HL berurutan.", "A healthy uptrend: HH and HL in sequence."),
        tx("Peringatan: harga gagal membuat HH baru, atau menutup di bawah HL terakhir (CHoCH).", "Warning: price fails to make a new HH, or closes below the last HL (CHoCH)."),
        tx("Konfirmasi: terbentuk LH lalu harga menembus ke LL. Barulah struktur turun terbentuk.", "Confirmation: an LH forms and then price breaks down to an LL. Only then has a downward structure formed."),
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("CHoCH adalah peringatan, bukan perintah jual", "CHoCH is a warning, not an order to sell"),
      text: tx(
        "Satu CHoCH tidak otomatis berarti harga akan turun jauh. Ia bisa jadi awal pembalikan, bisa jadi hanya koreksi dalam. Gunakan sebagai alasan untuk berhenti membeli membabi buta dan menunggu konfirmasi.",
        "One CHoCH does not automatically mean price will fall far. It may be the start of a reversal, or just a deep correction. Use it as a reason to stop buying blindly and to wait for confirmation.",
      ),
    },

    {
      kind: "steps",
      title: tx("Cara menandai struktur langkah demi langkah", "Marking structure step by step"),
      items: [
        tx("Pilih satu timeframe dan tetap di sana saat menandai.", "Choose one timeframe and stay on it while marking."),
        tx("Tandai semua swing high dan swing low dengan aturan n yang konsisten (misalnya n = 3).", "Mark every swing high and swing low with a consistent n rule (for example n = 3)."),
        tx("Beri label HH, HL, LH, LL dengan membandingkan setiap swing dengan swing sejenis sebelumnya.", "Label them HH, HL, LH, LL by comparing each swing with the previous swing of the same kind."),
        tx("Baca urutan label terakhir: dua HH dan dua HL berturut-turut = naik; dua LH dan dua LL = turun; campuran = mendatar atau transisi.", "Read the latest labels: two HH and two HL in a row = up; two LH and two LL = down; a mix = flat or in transition."),
        tx("Tentukan level invalidasi: HL terakhir (uptrend) atau LH terakhir (downtrend). Level ini juga calon letak stop loss.", "Set the invalidation level: the last HL (uptrend) or the last LH (downtrend). This level is also a candidate for the stop loss."),
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: tx("Contoh: menjadikan struktur sebagai stop loss", "Example: using structure for the stop loss"),
      text: tx(
        "Pada uptrend EUR/USD dengan HL terakhir di 1,0960: kamu mencari buy saat pullback. Stop loss diletakkan sedikit di bawah 1,0960, misalnya di 1,0945 (buffer 15 pip). Kalau harga menutup di bawah 1,0960, struktur naik rusak dan alasan analisis hilang.",
        "In an EUR/USD uptrend with the last HL at 1.0960: you look to buy on a pullback. The stop loss goes a little below 1.0960, for example at 1.0945 (a 15-pip buffer). If price closes below 1.0960, the upward structure is broken and the reason for the analysis is gone.",
      ),
    },

    { kind: "heading", text: tx("Kesalahan umum", "Common mistakes") },
    {
      kind: "points",
      items: [
        tx("Menandai setiap goyangan kecil. Chart penuh tanda tanpa makna. Gunakan n yang konsisten dan fokus pada swing yang menonjol.", "Marking every small wiggle. The chart fills with meaningless marks. Use a consistent n and focus on the swings that stand out."),
        tx("Mencampur sumbu (wick) dan badan. Pilih satu aturan: high dan low (termasuk wick) untuk swing, close untuk penentu tembus.", "Mixing wicks and bodies. Pick one rule: highs and lows (wicks included) for swings, the close to decide a break."),
        tx("Memperlakukan CHoCH sebagai sinyal jual langsung. Tunggu konfirmasi struktur.", "Treating CHoCH as an immediate sell signal. Wait for the structure to confirm."),
        tx("Menggeser swing agar sesuai keinginan. Struktur harus ditandai dengan aturan yang sama setiap kali.", "Moving swings to fit what you want. Structure must be marked with the same rule every time."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Apa itu swing high dengan n = 2?", "What is a swing high with n = 2?"), a: tx("Candle dengan high lebih tinggi dari 2 candle sebelum dan 2 candle sesudahnya.", "A candle whose high is above the 2 candles before it and the 2 candles after it.") },
        { q: tx("Urutan HH, HL, HH, HL menunjukkan apa?", "What does the sequence HH, HL, HH, HL show?"), a: tx("Tren naik.", "An uptrend.") },
        { q: tx("Apa beda BOS dan CHoCH?", "What is the difference between BOS and CHoCH?"), a: tx("BOS tembus searah tren (lanjut). CHoCH tembus berlawanan arah tren (peringatan balik).", "BOS breaks with the trend (it continues). CHoCH breaks against the trend (a reversal warning).") },
        { q: tx("Mengapa swing tidak bisa dipastikan real-time?", "Why can't a swing be confirmed in real time?"), a: tx("Karena butuh n candle sesudahnya untuk mengonfirmasi.", "Because it needs n candles after it to confirm.") },
      ],
    },
  ],
  sources: [
    { title: "Market Structure (Price Action)", publisher: "CrossTrade", url: "https://crosstrade.io/learn/price-action/market-structure" },
    { title: "Swing High/Low (Ideas)", publisher: "TradingView", url: "https://www.tradingview.com/ideas/swinghighlow/" },
  ],
}
