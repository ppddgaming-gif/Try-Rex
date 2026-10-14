import { ACCOUNT, COSTS } from "@/lib/demo/config"
import { SESSIONS, sessionHours } from "@/lib/learn/sessions"
import type { Lesson } from "@/lib/learn/types"

// Belajar 101, track "Forex 101": MOCK CONTENT, like the rest of Belajar.
// Indonesian bodies; titles and summaries are in the learn catalogue. Every
// number that also exists in Akun Demo (leverage, lot size, margin call, stop
// out, spread, swap) is read from lib/demo/config.ts, so a lesson can never
// teach a figure the account doesn't use. No statistics, no market-size or
// performance claims, no broker names.

const needed = (note: string) => ({ status: "needed" as const, note })
const practice = { key: "game" as const, href: "/trading-game" }

const usd = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`
const units = (lot: number) => (lot * ACCOUNT.CONTRACT_SIZE).toLocaleString("id-ID")
/** USD per pip on a xxxUSD pair at this lot: pip size × units. */
const pipUsd = (lot: number) => 0.0001 * lot * ACCOUNT.CONTRACT_SIZE
/** Margin on EURUSD at `price` for this lot. */
const marginAt = (lot: number, price: number) => Math.round((lot * ACCOUNT.CONTRACT_SIZE * price) / ACCOUNT.LEVERAGE)
const [sydney, tokyo, london, newyork] = SESSIONS

export const FOREX_LESSONS: Lesson[] = [
  {
    slug: "apa-itu-forex",
    track: "forex",
    minutes: 4,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Forex (foreign exchange) adalah pasar tempat mata uang ditukar satu dengan yang lain. Tidak ada satu gedung bursa pusat: transaksinya terjadi antar bank, perusahaan, dan broker di seluruh dunia, langsung satu sama lain (over the counter).",
      },
      {
        kind: "p",
        text: "Karena yang ditukar selalu dua mata uang, harga forex selalu ditulis sebagai pair. Membeli EURUSD berarti membeli euro sambil menjual dolar AS; menjualnya berarti kebalikannya.",
      },
      { kind: "diagram", name: "pair-quote" },
      {
        kind: "points",
        title: "Cara membaca kurs",
        items: [
          "Mata uang pertama adalah base, yang kedua quote.",
          "Angkanya menjawab: berapa quote untuk satu base. EURUSD 1.08500 berarti 1 euro = 1,085 dolar AS.",
          "Pair naik berarti base menguat terhadap quote. Pair turun berarti base melemah.",
        ],
      },
      {
        kind: "callout",
        tone: "example",
        title: "Contoh",
        text: "EURUSD bergerak dari 1.08500 ke 1.08750. Euro menguat, dan pergerakannya 25 pip. Trader yang BUY mendapat untung dari kenaikan itu; yang SELL rugi.",
      },
      {
        kind: "quiz",
        question: "GBPUSD turun dari 1.27000 ke 1.26500. Apa yang terjadi?",
        options: ["Pound menguat terhadap dolar", "Pound melemah terhadap dolar", "Dolar melemah terhadap pound"],
        answer: 1,
        explain: "GBP adalah base. Pair turun berarti satu pound bisa ditukar dengan lebih sedikit dolar: pound melemah.",
      },
    ],
    sources: [
      needed("Penjelasan pasar valuta asing dan cara membaca kurs dari bank sentral atau regulator (BI, Bappebti, OJK), dengan tanggal akses."),
    ],
    practice,
  },
  {
    slug: "major-minor-cross",
    track: "forex",
    minutes: 4,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Pair forex biasa dikelompokkan menurut mata uang di dalamnya. Kelompoknya memengaruhi seberapa ramai pair itu diperdagangkan, seberapa lebar spread-nya, dan seberapa liar geraknya.",
      },
      {
        kind: "points",
        title: "Tiga kelompok",
        items: [
          "Major: dolar AS berpasangan dengan mata uang utama lain, misalnya EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD.",
          "Cross (minor): dua mata uang utama tanpa dolar AS, misalnya EURJPY, GBPCAD, EURAUD, GBPNZD.",
          "Exotic: mata uang utama berpasangan dengan mata uang negara berkembang, misalnya USDIDR. Biasanya spread-nya jauh lebih lebar.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Kenapa cross terasa berbeda",
        text: "Pada cross, untung dan rugi dihitung dalam mata uang quote (misalnya yen pada EURJPY) lalu dikonversi ke dolar. Itu sebabnya angka dolar untuk cross di Akun Demo diberi label perkiraan.",
      },
      {
        kind: "points",
        title: "Enam pair di Akun Demo",
        items: ["Major: EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD.", "Cross: EURJPY."],
      },
      {
        kind: "quiz",
        question: "Mana yang termasuk cross pair?",
        options: ["USDJPY", "EURJPY", "EURUSD"],
        answer: 1,
        explain: "EURJPY tidak memuat dolar AS, jadi termasuk cross. USDJPY dan EURUSD memuat USD: keduanya major.",
      },
    ],
    sources: [needed("Pembagian major, cross, dan exotic dari sumber edukasi resmi atau buku teks pasar valuta asing.")],
    practice,
  },
  {
    slug: "pip-lot-nilai-pip",
    track: "forex",
    minutes: 5,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Pip adalah satuan gerak harga yang lazim di forex: 0.0001 untuk kebanyakan pair, dan 0.01 untuk pair yen. Banyak platform menampilkan satu angka lagi di belakangnya, yang disebut pipette (sepersepuluh pip).",
      },
      {
        kind: "callout",
        tone: "example",
        title: "Menghitung pip",
        text: "EURUSD 1.08500 → 1.08620 = 12 pip (angka terakhir adalah pipette). USDJPY 150.200 → 150.450 = 25 pip.",
      },
      { kind: "heading", text: "Lot: ukuran posisi" },
      {
        kind: "points",
        items: [
          `1 lot standard = ${units(1)} unit mata uang base.`,
          `0.1 lot (mini) = ${units(0.1)} unit.`,
          `0.01 lot (micro) = ${units(0.01)} unit. Ini ukuran terkecil di Akun Demo.`,
        ],
      },
      {
        kind: "p",
        text: `Nilai satu pip bergantung pada ukuran lot. Untuk pair yang quote-nya dolar AS (EURUSD, GBPUSD, AUDUSD), rumusnya sederhana: ukuran pip × jumlah unit. Satu lot standard bernilai ${usd(pipUsd(1))} per pip, 0.1 lot ${usd(pipUsd(0.1))}, dan 0.01 lot ${usd(pipUsd(0.01))}.`,
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Biar tidak menghitung manual",
        text: "Kalkulator di Akun Demo dan panel order menghitung nilai pip, margin, dan risiko dengan rumus yang sama dengan yang dibukukan server.",
      },
      {
        kind: "quiz",
        question: "Posisi 0.01 lot EURUSD bergerak 30 pip. Berapa kira-kira untung atau ruginya?",
        options: [usd(pipUsd(0.01) * 3), usd(pipUsd(0.01) * 30), usd(pipUsd(1) * 30)],
        answer: 1,
        explain: `0.01 lot bernilai ${usd(pipUsd(0.01))} per pip. 30 × ${usd(pipUsd(0.01))} = ${usd(pipUsd(0.01) * 30)}.`,
      },
    ],
    sources: [needed("Definisi pip, pipette, dan lot beserta cara menghitung nilai pip dari sumber edukasi resmi atau buku teks.")],
  },
  {
    slug: "bid-ask-spread-swap",
    track: "forex",
    minutes: 5,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Setiap pair punya dua harga sekaligus. Bid adalah harga saat kamu menjual, ask adalah harga saat kamu membeli. Ask selalu sedikit di atas bid, dan selisihnya disebut spread.",
      },
      { kind: "diagram", name: "pair-quote" },
      {
        kind: "points",
        title: "Akibatnya",
        items: [
          "BUY masuk di ask dan ditutup di bid. SELL masuk di bid dan ditutup di ask.",
          "Karena itu setiap posisi dimulai sedikit minus, sebesar spread. Harga harus bergerak melewati spread dulu sebelum posisi untung.",
          "Spread bisa melebar saat pasar sepi atau saat berita besar dirilis.",
        ],
      },
      {
        kind: "callout",
        tone: "example",
        title: "Di Akun Demo",
        text: `Spread EURUSD ditetapkan ${COSTS.SPREAD_PIPS.EURUSD} pip. Pair cross diberi spread lebih lebar, misalnya EURJPY ${COSTS.SPREAD_PIPS.EURJPY} pip.`,
      },
      { kind: "heading", text: "Swap: biaya menginap" },
      {
        kind: "p",
        text: `Posisi yang masih terbuka saat pergantian hari dikenai swap (rollover), yang besarnya bergantung pada selisih suku bunga kedua mata uang. Swap bisa berupa biaya atau pemasukan. Akun Demo memakai angka tetap yang sederhana: ${usd(Math.abs(COSTS.SWAP_PER_LOT_PER_NIGHT))} biaya per 1 lot per malam.`,
      },
      {
        kind: "quiz",
        question: "Kamu BUY EURUSD dan harga tidak bergerak sama sekali. Kalau posisi langsung ditutup, hasilnya…",
        options: ["Impas persis", "Rugi kecil sebesar spread", "Untung kecil sebesar spread"],
        answer: 1,
        explain: "BUY masuk di ask dan keluar di bid. Selisih keduanya, spread, menjadi biaya.",
      },
    ],
    sources: [
      needed("Penjelasan bid, ask, dan spread dari sumber edukasi resmi."),
      needed("Penjelasan swap/rollover dan kaitannya dengan selisih suku bunga."),
    ],
  },
  {
    slug: "jenis-order",
    track: "forex",
    minutes: 4,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Order adalah perintah ke broker. Ada yang dijalankan sekarang juga, ada yang menunggu harga mencapai level tertentu (pending order).",
      },
      {
        kind: "points",
        title: "Jenis yang paling umum",
        items: [
          "Market order: BUY atau SELL sekarang, di harga yang tersedia saat itu.",
          "Buy limit: membeli di harga yang lebih rendah dari sekarang, menunggu harga turun dulu.",
          "Sell limit: menjual di harga yang lebih tinggi dari sekarang.",
          "Buy stop: membeli di harga yang lebih tinggi, untuk ikut saat harga menembus ke atas.",
          "Sell stop: menjual di harga yang lebih rendah, untuk ikut saat harga menembus ke bawah.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "SL dan TP juga order",
        text: "Stop loss dan take profit adalah order yang menutup posisi otomatis. Keduanya menjaga rencanamu tetap berjalan walau kamu tidak sedang melihat chart.",
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Harga eksekusi bisa berbeda",
        text: "Saat harga melompat (gap) atau pasar sangat cepat, order bisa terisi di harga yang lebih buruk dari yang diminta. Ini disebut slippage.",
      },
      {
        kind: "quiz",
        question: "EURUSD di 1.08500. Kamu ingin membeli hanya kalau harga turun dulu ke 1.08200. Order apa yang dipakai?",
        options: ["Buy stop", "Buy limit", "Market order"],
        answer: 1,
        explain: "Membeli di harga yang lebih rendah dari sekarang adalah buy limit.",
      },
    ],
    sources: [needed("Definisi jenis order dan slippage dari sumber edukasi resmi atau regulator.")],
  },
  {
    slug: "sesi-pasar-forex",
    track: "forex",
    minutes: 4,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Pasar forex buka dari Senin pagi sampai Sabtu dini hari waktu Indonesia, berpindah dari satu pusat keuangan ke pusat lain mengikuti matahari. Akhir pekan pasar tutup, sehingga harga Senin bisa dibuka jauh dari harga penutupan Jumat (gap).",
      },
      { kind: "diagram", name: "sessions" },
      {
        kind: "points",
        title: "Empat sesi, jam WIB (perkiraan)",
        items: SESSIONS.map((s) => `${s.city}: ${sessionHours(s)}`),
      },
      {
        kind: "points",
        title: "Yang perlu diingat",
        items: [
          `Saat dua sesi tumpang tindih, misalnya ${london.city} dan ${newyork.city} (${String(newyork.open).padStart(2, "0")}.00–${String(london.close).padStart(2, "0")}.00 WIB), pasar umumnya lebih ramai.`,
          `Pair cenderung lebih aktif saat sesi negaranya buka: pair yen dan dolar Australia di sesi ${tokyo.city} dan ${sydney.city}, pound dan euro di sesi ${london.city}.`,
          "Di jam sepi, spread bisa lebih lebar dan gerak harga lebih kecil.",
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Jamnya bergeser",
        text: `Saat Eropa dan Amerika tidak memakai waktu musim panas, sesi ${london.city} dan ${newyork.city} buka sekitar satu jam lebih lambat dalam WIB.`,
      },
      {
        kind: "quiz",
        question: "Kenapa harga Senin pagi bisa berbeda jauh dari harga penutupan Jumat?",
        options: ["Karena broker mengubah harganya", "Karena pasar tutup di akhir pekan sementara berita tetap terjadi", "Karena sesi Tokyo selalu naik"],
        answer: 1,
        explain: "Selama akhir pekan tidak ada transaksi, tapi berita tetap muncul. Saat pasar buka lagi, harga bisa langsung melompat (gap).",
      },
    ],
    sources: [needed("Jam sesi pasar forex dan pergeseran waktu musim panas dari sumber resmi, dengan tanggal akses.")],
  },
  {
    slug: "margin-dan-margin-call",
    track: "forex",
    minutes: 6,
    level: "menengah",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: `Margin adalah dana jaminan yang ditahan selama posisi terbuka. Besarnya: nilai posisi dibagi leverage. Dengan leverage 1:${ACCOUNT.LEVERAGE}, posisi 0.1 lot EURUSD di 1.17000 (${units(0.1)} euro, sekitar ${usd(Math.round(0.1 * ACCOUNT.CONTRACT_SIZE * 1.17))}) butuh margin ${usd(marginAt(0.1, 1.17))}.`,
      },
      {
        kind: "points",
        title: "Angka di panel akun",
        items: [
          "Equity: saldo ditambah untung atau rugi posisi yang masih terbuka.",
          "Free margin: equity dikurangi margin terpakai. Inilah ruang untuk posisi baru.",
          "Margin level: equity ÷ margin terpakai × 100%.",
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Margin call dan stop out di Akun Demo",
        text: `Saat margin level turun ke ${ACCOUNT.MARGIN_CALL_LEVEL}%, muncul peringatan margin call. Kalau terus turun sampai ${ACCOUNT.STOP_OUT_LEVEL}%, semua posisi ditutup paksa (stop out) supaya saldo tidak minus.`,
      },
      {
        kind: "p",
        text: "Stop out bukan rencana keluar: ia terjadi karena posisi terlalu besar dibanding saldo, atau karena tidak ada stop loss. Stop loss yang dipasang sejak awal membuatmu keluar jauh sebelum itu.",
      },
      {
        kind: "quiz",
        question: `Equity ${usd(60)}, margin terpakai ${usd(marginAt(0.1, 1.17))}. Margin level sekitar…`,
        options: ["195%", `${Math.round((60 / marginAt(0.1, 1.17)) * 100)}%`, "117%"],
        answer: 1,
        explain: `${usd(60)} ÷ ${usd(marginAt(0.1, 1.17))} × 100% ≈ ${Math.round((60 / marginAt(0.1, 1.17)) * 100)}%. Itu sudah di bawah batas margin call (${ACCOUNT.MARGIN_CALL_LEVEL}%) dan dekat stop out (${ACCOUNT.STOP_OUT_LEVEL}%).`,
      },
    ],
    sources: [
      needed("Definisi margin, margin level, margin call, dan stop out dari regulator atau broker teregulasi."),
      needed("Peringatan risiko produk ber-leverage dari Bappebti/OJK, dengan tanggal akses."),
    ],
  },
  {
    slug: "berita-dan-fundamental",
    track: "forex",
    minutes: 5,
    level: "menengah",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Nilai mata uang dipengaruhi keadaan ekonomi negaranya. Analisis fundamental membaca hal-hal itu, sementara analisis teknikal membaca chart. Banyak trader memakai keduanya: chart untuk menentukan titik masuk dan keluar, berita untuk tahu kapan pasar bisa bergerak liar.",
      },
      {
        kind: "points",
        title: "Data yang sering menggerakkan pasar",
        items: [
          "Keputusan suku bunga bank sentral (misalnya The Fed, ECB, Bank Indonesia) dan pernyataan pejabatnya.",
          "Inflasi (indeks harga konsumen).",
          "Data tenaga kerja, misalnya laporan lapangan kerja Amerika Serikat.",
          "Pertumbuhan ekonomi (PDB) dan neraca perdagangan.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Kalender ekonomi",
        text: "Jadwal rilis data dan pengumuman bank sentral bisa dilihat di kalender ekonomi. Biasakan memeriksanya sebelum membuka posisi.",
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Saat berita dirilis",
        text: "Harga bisa melompat dalam hitungan detik, spread melebar, dan stop loss bisa terisi di harga yang lebih buruk (slippage). Menebak arah berita bukan rencana trading.",
      },
      {
        kind: "quiz",
        question: "Sepuluh menit lagi bank sentral mengumumkan suku bunga. Langkah yang paling sejalan dengan manajemen risiko adalah…",
        options: [
          "Membuka posisi besar sebelum pengumuman supaya dapat gerakan pertama",
          "Menunggu, atau memastikan posisi yang ada punya stop loss dan ukurannya kecil",
          "Menghapus stop loss supaya tidak tersentuh lonjakan sesaat",
        ],
        answer: 1,
        explain: "Gerak saat berita sulit diduga. Menunggu atau membatasi risiko lebih sejalan dengan rencana daripada menebak.",
      },
    ],
    sources: [
      needed("Penjelasan pengaruh suku bunga dan data ekonomi terhadap kurs dari bank sentral (misalnya BI), dengan tanggal akses."),
      needed("Penjelasan slippage dan spread saat rilis berita dari regulator atau broker teregulasi."),
    ],
  },
]
