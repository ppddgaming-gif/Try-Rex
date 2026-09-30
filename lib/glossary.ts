// The trading glossary. One list feeds two places: the dotted-underline terms
// inside game and lesson text (components/glossary) and the Kamus page
// (/belajar/kamus). Definitions are plain Indonesian for beginners.
//
// DRAFT: written as placeholder teaching copy while reputable sources are
// gathered. Nothing here is investment advice; keep claims definitional and
// never add statistics without a source.

export type GlossaryCategory = "dasar" | "chart" | "risiko" | "crypto" | "psikologi"

export type GlossaryEntry = {
  slug: string
  term: string
  /** Every spelling that should be underlined in text, case-insensitive. */
  aliases: string[]
  category: GlossaryCategory
  short: string
  example?: string
  /** A Belajar 101 lesson that covers it in depth. */
  lesson?: string
}

export const CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  dasar: "Dasar",
  chart: "Membaca chart",
  risiko: "Manajemen risiko",
  crypto: "Crypto",
  psikologi: "Psikologi",
}

export const GLOSSARY: GlossaryEntry[] = [
  // Dasar
  {
    slug: "pair",
    term: "Pair",
    aliases: ["pair", "pasangan mata uang"],
    category: "dasar",
    short: "Dua mata uang yang diperdagangkan satu sama lain. Di EURUSD, kamu membeli atau menjual euro dengan dolar AS.",
    example: "Kalau EURUSD naik dari 1.0800 ke 1.0850, euro menguat terhadap dolar.",
    lesson: "pasar-dan-instrumen",
  },
  {
    slug: "buy",
    term: "BUY (beli)",
    aliases: ["buy", "long", "posisi beli"],
    category: "dasar",
    short: "Membuka posisi karena kamu memperkirakan harga akan naik. Untung jika harga naik, rugi jika turun.",
    lesson: "buy-sell-wait",
  },
  {
    slug: "sell",
    term: "SELL (jual)",
    aliases: ["sell", "short", "posisi jual"],
    category: "dasar",
    short: "Membuka posisi karena kamu memperkirakan harga akan turun. Untung jika harga turun, rugi jika naik.",
    lesson: "buy-sell-wait",
  },
  {
    slug: "wait",
    term: "WAIT (tunggu)",
    aliases: ["wait", "no-trade", "tidak mengambil posisi"],
    category: "dasar",
    short: "Sengaja tidak membuka posisi karena belum ada keunggulan yang jelas. Tidak trading juga sebuah keputusan.",
    lesson: "buy-sell-wait",
  },
  {
    slug: "entry",
    term: "Entry",
    aliases: ["entry", "harga entry", "titik masuk"],
    category: "dasar",
    short: "Harga saat kamu membuka posisi. Semua untung dan rugi dihitung dari titik ini.",
  },
  {
    slug: "pip",
    term: "Pip",
    aliases: ["pip", "pips"],
    category: "dasar",
    short: "Satuan gerak harga terkecil yang lazim di forex: 0.0001 untuk kebanyakan pair, 0.01 untuk pair yen.",
    example: "EURUSD dari 1.0800 ke 1.0842 naik 42 pip.",
  },
  {
    slug: "posisi",
    term: "Posisi",
    aliases: ["posisi"],
    category: "dasar",
    short: "Transaksi yang sedang terbuka, beli atau jual, sampai kamu menutupnya.",
  },
  {
    slug: "spread",
    term: "Spread",
    aliases: ["spread"],
    category: "dasar",
    short: "Selisih harga beli dan harga jual yang ditawarkan broker. Ini biaya yang kamu bayar setiap membuka posisi.",
  },
  {
    slug: "volatilitas",
    term: "Volatilitas",
    aliases: ["volatilitas", "volatil"],
    category: "dasar",
    short: "Seberapa besar dan cepat harga bergerak. Volatilitas tinggi berarti peluang dan risiko sama-sama lebih besar.",
  },
  {
    slug: "likuiditas",
    term: "Likuiditas",
    aliases: ["likuiditas", "likuid"],
    category: "dasar",
    short: "Seberapa mudah sesuatu dibeli atau dijual tanpa menggeser harga banyak. Pair utama seperti EURUSD sangat likuid.",
  },

  // Chart
  {
    slug: "candlestick",
    term: "Candlestick",
    aliases: ["candlestick", "candle", "lilin"],
    category: "chart",
    short: "Satu batang di chart yang merangkum harga pembukaan, penutupan, tertinggi, dan terendah dalam satu periode.",
    example: "Di timeframe H4, satu candle mewakili 4 jam pergerakan harga.",
    lesson: "anatomi-candlestick",
  },
  {
    slug: "body",
    term: "Body candle",
    aliases: ["body"],
    category: "chart",
    short: "Bagian tebal candle, dari harga pembukaan ke penutupan. Body panjang berarti satu pihak menang telak di periode itu.",
    lesson: "anatomi-candlestick",
  },
  {
    slug: "sumbu",
    term: "Sumbu (wick)",
    aliases: ["sumbu", "wick", "shadow", "ekor"],
    category: "chart",
    short: "Garis tipis di atas dan bawah body: harga sempat ke sana, tapi tidak bertahan sampai candle ditutup.",
    lesson: "anatomi-candlestick",
  },
  {
    slug: "timeframe",
    term: "Timeframe",
    aliases: ["timeframe", "time frame", "kerangka waktu"],
    category: "chart",
    short: "Lama waktu yang diwakili satu candle. M15 = 15 menit, H1 = 1 jam, H4 = 4 jam, D1 = 1 hari.",
    lesson: "timeframe",
  },
  {
    slug: "h4",
    term: "H4",
    aliases: ["h4"],
    category: "chart",
    short: "Timeframe 4 jam: setiap candle merangkum 4 jam harga. Semua soal di Trading Game memakai H4.",
    lesson: "timeframe",
  },
  {
    slug: "trend",
    term: "Trend",
    aliases: ["trend", "tren", "uptrend", "downtrend"],
    category: "chart",
    short: "Arah umum harga dalam satu rentang waktu: naik (puncak dan lembah makin tinggi), turun, atau menyamping.",
    lesson: "trend",
  },
  {
    slug: "menyamping",
    term: "Sideways (menyamping)",
    aliases: ["menyamping", "sideways", "ranging"],
    category: "chart",
    short: "Harga bolak-balik di antara dua batas tanpa arah jelas. Sering jadi saat terbaik untuk WAIT.",
    lesson: "trend",
  },
  {
    slug: "kemiringan",
    term: "Kemiringan trend",
    aliases: ["kemiringan"],
    category: "chart",
    short: "Seberapa curam trend, diukur rata-rata pip per candle. Positif berarti naik, negatif berarti turun.",
    lesson: "trend",
  },
  {
    slug: "support",
    term: "Support",
    aliases: ["support", "level support"],
    category: "chart",
    short: "Area harga di mana penurunan beberapa kali tertahan dan memantul. Makin sering disentuh, makin diperhatikan pasar.",
    example: "Di Trading Game, support digambar sebagai pita hijau putus-putus.",
    lesson: "support-resistance",
  },
  {
    slug: "resistance",
    term: "Resistance",
    aliases: ["resistance", "level resistance"],
    category: "chart",
    short: "Area harga di mana kenaikan beberapa kali tertahan dan berbalik turun. Kebalikan dari support.",
    example: "Di Trading Game, resistance digambar sebagai pita merah putus-putus.",
    lesson: "support-resistance",
  },
  {
    slug: "rentang",
    term: "Rentang harga",
    aliases: ["rentang", "range"],
    category: "chart",
    short: "Jarak antara harga terendah dan tertinggi dalam periode tertentu. “Di 80% rentang” berarti dekat puncaknya.",
    lesson: "support-resistance",
  },
  {
    slug: "breakout",
    term: "Breakout",
    aliases: ["breakout", "menembus"],
    category: "chart",
    short: "Saat harga menembus support atau resistance dengan meyakinkan. Breakout palsu (fakeout) cepat kembali ke dalam.",
    lesson: "support-resistance",
  },
  {
    slug: "konfirmasi",
    term: "Konfirmasi",
    aliases: ["konfirmasi"],
    category: "chart",
    short: "Tanda tambahan yang mendukung idemu sebelum masuk, misalnya candle yang ditutup di atas resistance setelah breakout.",
  },
  {
    slug: "pin-bar",
    term: "Pin bar",
    aliases: ["pin bar", "pinbar"],
    category: "chart",
    short: "Candle dengan body kecil dan sumbu panjang di satu sisi: tanda harga ditolak dari area itu.",
    lesson: "anatomi-candlestick",
  },
  {
    slug: "penolakan",
    term: "Penolakan (rejection)",
    aliases: ["penolakan", "rejection"],
    category: "chart",
    short: "Harga menyentuh sebuah level lalu cepat didorong kembali, meninggalkan sumbu panjang.",
  },
  {
    slug: "bullish",
    term: "Bullish",
    aliases: ["bullish"],
    category: "chart",
    short: "Condong naik. Candle bullish ditutup lebih tinggi dari pembukaannya.",
  },
  {
    slug: "bearish",
    term: "Bearish",
    aliases: ["bearish"],
    category: "chart",
    short: "Condong turun. Candle bearish ditutup lebih rendah dari pembukaannya.",
  },

  // Risiko
  {
    slug: "stop-loss",
    term: "Stop loss",
    aliases: ["stop loss", "sl"],
    category: "risiko",
    short: "Harga batas yang otomatis menutup posisi rugi. Kamu menentukan berapa besar rugi yang bisa diterima sebelum masuk.",
    lesson: "stop-loss-take-profit",
  },
  {
    slug: "take-profit",
    term: "Take profit",
    aliases: ["take profit", "tp"],
    category: "risiko",
    short: "Harga target yang otomatis menutup posisi untung.",
    lesson: "stop-loss-take-profit",
  },
  {
    slug: "risk-reward",
    term: "Risk-reward ratio",
    aliases: ["risk-reward", "risk reward", "rasio risiko"],
    category: "risiko",
    short: "Perbandingan jarak stop loss dengan jarak take profit. 1:2 berarti risiko 20 pip untuk target 40 pip.",
    lesson: "risk-reward",
  },
  {
    slug: "leverage",
    term: "Leverage",
    aliases: ["leverage", "daya ungkit"],
    category: "risiko",
    short: "Pinjaman dari broker yang memperbesar ukuran posisi. Untung dan rugi ikut membesar dengan kelipatan yang sama.",
    lesson: "leverage",
  },
  {
    slug: "margin",
    term: "Margin",
    aliases: ["margin"],
    category: "risiko",
    short: "Dana jaminan yang ditahan broker saat posisi ber-leverage terbuka.",
    lesson: "leverage",
  },
  {
    slug: "diversifikasi",
    term: "Diversifikasi",
    aliases: ["diversifikasi"],
    category: "risiko",
    short: "Menyebar risiko ke beberapa aset atau ide agar satu kesalahan tidak menghabiskan semuanya.",
  },

  // Crypto
  {
    slug: "crypto",
    term: "Crypto",
    aliases: ["crypto", "kripto", "cryptocurrency", "aset kripto"],
    category: "crypto",
    short: "Aset digital yang dicatat di blockchain, bukan diterbitkan bank sentral. Contoh: Bitcoin dan Ethereum.",
    lesson: "apa-itu-crypto",
  },
  {
    slug: "blockchain",
    term: "Blockchain",
    aliases: ["blockchain"],
    category: "crypto",
    short: "Buku catatan transaksi yang disalin di banyak komputer sekaligus, sehingga sulit diubah diam-diam.",
    lesson: "apa-itu-crypto",
  },
  {
    slug: "bitcoin",
    term: "Bitcoin",
    aliases: ["bitcoin", "btc"],
    category: "crypto",
    short: "Crypto pertama (2009), dengan jumlah maksimum 21 juta koin yang ditetapkan dalam aturan jaringannya.",
    lesson: "bitcoin-altcoin-stablecoin",
  },
  {
    slug: "altcoin",
    term: "Altcoin",
    aliases: ["altcoin", "altcoins"],
    category: "crypto",
    short: "Sebutan untuk crypto selain Bitcoin. Umumnya lebih volatil dan lebih berisiko.",
    lesson: "bitcoin-altcoin-stablecoin",
  },
  {
    slug: "stablecoin",
    term: "Stablecoin",
    aliases: ["stablecoin"],
    category: "crypto",
    short: "Crypto yang dirancang mengikuti nilai aset lain, biasanya dolar AS. Stabilnya bergantung pada cadangan penerbitnya.",
    lesson: "bitcoin-altcoin-stablecoin",
  },
  {
    slug: "wallet",
    term: "Wallet",
    aliases: ["wallet", "dompet kripto"],
    category: "crypto",
    short: "Tempat menyimpan kunci akses ke crypto-mu. Siapa pun yang memegang kunci (seed phrase) menguasai asetnya.",
    lesson: "keamanan-crypto",
  },
  {
    slug: "seed-phrase",
    term: "Seed phrase",
    aliases: ["seed phrase", "frasa pemulihan"],
    category: "crypto",
    short: "Rangkaian 12 atau 24 kata untuk memulihkan wallet. Jangan pernah dibagikan ke siapa pun, termasuk “admin”.",
    lesson: "keamanan-crypto",
  },
  {
    slug: "exchange",
    term: "Exchange",
    aliases: ["exchange", "bursa kripto"],
    category: "crypto",
    short: "Platform jual beli crypto. Pilih yang terdaftar resmi di negaramu.",
    lesson: "keamanan-crypto",
  },

  // Psikologi
  {
    slug: "fomo",
    term: "FOMO",
    aliases: ["fomo"],
    category: "psikologi",
    short: "Fear of missing out: takut ketinggalan, jadi masuk terburu-buru setelah harga sudah lari jauh.",
    lesson: "fomo-overtrading",
  },
  {
    slug: "overtrading",
    term: "Overtrading",
    aliases: ["overtrading"],
    category: "psikologi",
    short: "Membuka terlalu banyak posisi, biasanya karena bosan atau ingin membalas rugi. Biaya dan kesalahan ikut menumpuk.",
    lesson: "fomo-overtrading",
  },
  {
    slug: "jurnal-trading",
    term: "Jurnal trading",
    aliases: ["jurnal trading", "jurnal"],
    category: "psikologi",
    short: "Catatan setiap keputusan: alasan masuk, hasil, dan pelajarannya. Cara paling sederhana untuk berhenti mengulang kesalahan.",
    lesson: "jurnal-trading",
  },
]

export const glossaryBySlug = new Map(GLOSSARY.map((e) => [e.slug, e]))

// Longest alias first, so "stop loss" wins over "loss" and "pin bar" over "bar".
const aliasIndex = GLOSSARY.flatMap((e) => e.aliases.map((a) => ({ alias: a.toLowerCase(), slug: e.slug }))).sort(
  (a, b) => b.alias.length - a.alias.length,
)
const aliasToSlug = new Map(aliasIndex.map((a) => [a.alias, a.slug]))
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** Matches any alias as a whole word (letters and digits on neither side). */
const TERM_RE = new RegExp(`(?<![\\p{L}\\p{N}])(${aliasIndex.map((a) => escape(a.alias)).join("|")})(?![\\p{L}\\p{N}])`, "giu")

export type TextPart = string | { text: string; slug: string }

/**
 * Splits text into plain strings and glossary hits. Each term is linked only
 * the first time it appears (`seen` carries that across calls), so a
 * paragraph doesn't turn into a wall of underlines.
 */
export function splitTerms(text: string, seen: Set<string> = new Set()): TextPart[] {
  const parts: TextPart[] = []
  let last = 0
  for (const m of text.matchAll(TERM_RE)) {
    const slug = aliasToSlug.get(m[0].toLowerCase())
    if (!slug || seen.has(slug) || m.index === undefined) continue
    seen.add(slug)
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push({ text: m[0], slug })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
