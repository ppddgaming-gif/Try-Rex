import type { Lesson, Track } from "@/lib/learn/types"

// Belajar 101: MOCK CONTENT. Written as placeholder teaching copy while
// reputable sources are gathered. Every lesson is `draft: true` and lists the
// sources it still needs; the UI shows both. Keep it definitional and
// cautious: no statistics, no performance claims, no product endorsements.

export const TRACKS: Track[] = [
  {
    id: "dasar",
    title: "Dasar Trading",
    description: "Apa itu trading, apa yang diperdagangkan, dan tiga keputusan yang selalu kamu punya.",
    lessons: ["apa-itu-trading", "pasar-dan-instrumen", "buy-sell-wait"],
  },
  {
    id: "chart",
    title: "Membaca Chart",
    description: "Candlestick, trend, support dan resistance: bahasa yang dipakai setiap chart.",
    lessons: ["anatomi-candlestick", "trend", "support-resistance", "timeframe"],
  },
  {
    id: "risiko",
    title: "Manajemen Risiko",
    description: "Cara bertahan cukup lama untuk belajar: stop loss, rasio risiko, dan leverage.",
    lessons: ["stop-loss-take-profit", "risk-reward", "leverage"],
  },
  {
    id: "crypto",
    title: "Crypto 101",
    description: "Blockchain, Bitcoin, stablecoin, dan cara menjaga aset digital tetap milikmu.",
    lessons: ["apa-itu-crypto", "bitcoin-altcoin-stablecoin", "keamanan-crypto"],
  },
  {
    id: "psikologi",
    title: "Psikologi Trading",
    description: "Musuh terbesar trader sering bukan pasar, tapi kebiasaannya sendiri.",
    lessons: ["fomo-overtrading", "jurnal-trading"],
  },
]

const needed = (note: string) => ({ status: "needed" as const, note })
const practice = { label: "Latih di Trading Game", href: "/trading-game" }

export const LESSONS: Lesson[] = [
  // -------------------------------------------------------------------------
  // Dasar
  {
    slug: "apa-itu-trading",
    track: "dasar",
    title: "Apa itu trading?",
    summary: "Membeli dan menjual untuk mengambil untung dari perubahan harga, dan kenapa itu berbeda dari menabung.",
    minutes: 4,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Trading adalah membeli dan menjual aset untuk mengambil untung dari perubahan harganya. Aset itu bisa mata uang, saham, komoditas, atau crypto.",
      },
      {
        kind: "p",
        text: "Berbeda dengan investasi jangka panjang yang menahan aset bertahun-tahun, trading biasanya memegang posisi dalam hitungan menit, jam, atau hari. Yang dicari adalah pergerakan harga, bukan pertumbuhan bisnis di baliknya.",
      },
      {
        kind: "points",
        title: "Yang perlu kamu pegang sejak awal",
        items: [
          "Harga bisa naik atau turun. Trader bisa mengambil posisi di kedua arah.",
          "Setiap posisi punya risiko rugi. Tidak ada strategi yang selalu menang.",
          "Keputusan yang bagus bisa tetap rugi, dan keputusan yang buruk bisa kebetulan untung. Yang dinilai adalah prosesnya.",
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Latihan dulu, uang sungguhan nanti",
        text: "TRY-REX memakai data harga historis supaya kamu bisa salah tanpa kehilangan uang. Anggap setiap soal sebagai latihan membaca situasi, bukan sinyal untuk pasar hari ini.",
      },
      {
        kind: "quiz",
        question: "Apa yang paling membedakan trading dari investasi jangka panjang?",
        options: [
          "Trading hanya bisa dilakukan saat harga naik",
          "Trading mencari untung dari pergerakan harga dalam waktu relatif singkat",
          "Trading tidak punya risiko rugi",
        ],
        answer: 1,
        explain: "Trading fokus pada pergerakan harga jangka pendek, ke atas maupun ke bawah, dan selalu membawa risiko.",
      },
    ],
    sources: [needed("Definisi trading vs investasi dari regulator atau lembaga edukasi keuangan resmi.")],
  },
  {
    slug: "pasar-dan-instrumen",
    track: "dasar",
    title: "Pasar dan instrumen",
    summary: "Forex, saham, komoditas, dan crypto: apa yang diperdagangkan dan bagaimana pair dibaca.",
    minutes: 5,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Setiap pasar punya karakter sendiri. Forex memperdagangkan mata uang berpasangan, saham adalah kepemilikan sebagian perusahaan, komoditas mencakup emas dan minyak, dan crypto adalah aset digital di atas blockchain.",
      },
      { kind: "heading", text: "Membaca pair forex" },
      {
        kind: "p",
        text: "Pair seperti EURUSD dibaca: berapa dolar AS untuk satu euro. Mata uang pertama disebut base, yang kedua quote. Kalau EURUSD naik, euro menguat terhadap dolar; kalau turun, euro melemah.",
      },
      {
        kind: "callout",
        tone: "example",
        title: "Contoh",
        text: "EURUSD di 1.0850 berarti 1 euro = 1,0850 dolar AS. Naik ke 1.0900 berarti naik 50 pip.",
      },
      {
        kind: "points",
        title: "Pair di Trading Game",
        items: [
          "Pair utama dengan USD: EURUSD, GBPUSD, AUDUSD, USDCAD, USDJPY.",
          "Cross pair tanpa USD: EURJPY, EURAUD, GBPCAD. Biasanya lebih volatil.",
          "Pair yen dikutip dengan 3 desimal, jadi satu pip di sana bernilai 0.01.",
        ],
      },
      {
        kind: "quiz",
        question: "Kalau USDJPY naik, apa artinya?",
        options: ["Yen menguat terhadap dolar", "Dolar menguat terhadap yen", "Keduanya melemah"],
        answer: 1,
        explain: "USD adalah base. USDJPY naik berarti butuh lebih banyak yen untuk satu dolar: dolar menguat.",
      },
    ],
    sources: [
      needed("Penjelasan base/quote currency dan pip dari sumber edukasi broker teregulasi atau buku teks."),
      needed("Gambaran pasar yang diawasi di Indonesia (Bappebti/OJK), dengan tanggal akses."),
    ],
    practice,
  },
  {
    slug: "buy-sell-wait",
    track: "dasar",
    title: "BUY, SELL, dan WAIT",
    summary: "Tiga keputusan dalam setiap soal, dan kenapa tidak trading sering jadi pilihan terbaik.",
    minutes: 4,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "BUY berarti kamu memperkirakan harga naik. SELL berarti kamu memperkirakan harga turun, dan di forex kamu bisa menjual tanpa memilikinya lebih dulu. WAIT berarti kamu tidak membuka posisi.",
      },
      {
        kind: "callout",
        tone: "tip",
        title: "WAIT adalah jawaban yang sah",
        text: "Saat harga menyamping di antara support dan resistance tanpa arah jelas, menunggu melindungi modal. Di Trading Game, WAIT benar kalau harga bergerak kurang dari 0,1% dalam 15 candle berikutnya.",
      },
      {
        kind: "points",
        title: "Pertanyaan sebelum memilih",
        items: [
          "Trend-nya ke mana? Melawan trend butuh alasan yang lebih kuat.",
          "Seberapa dekat harga ke support atau resistance?",
          "Kalau salah, di mana kamu akan keluar?",
        ],
      },
      {
        kind: "quiz",
        question: "Harga bolak-balik di rentang sempit tanpa arah. Pilihan paling masuk akal?",
        options: ["BUY, karena pasti naik lagi", "SELL, karena sudah terlalu tinggi", "WAIT sampai ada arah atau breakout"],
        answer: 2,
        explain: "Tanpa keunggulan arah, menunggu konfirmasi sering lebih baik daripada menebak.",
      },
    ],
    sources: [needed("Sumber tentang long/short dan konsep no-trade sebagai keputusan manajemen risiko.")],
    practice,
  },

  // -------------------------------------------------------------------------
  // Chart
  {
    slug: "anatomi-candlestick",
    track: "chart",
    title: "Anatomi candlestick",
    summary: "Body, sumbu, dan warna: satu candle menceritakan pertarungan pembeli dan penjual.",
    minutes: 5,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Setiap candle merangkum satu periode: harga pembukaan (open), penutupan (close), tertinggi (high), dan terendah (low). Body adalah jarak open ke close; sumbu menunjukkan seberapa jauh harga sempat bergerak.",
      },
      { kind: "diagram", name: "candle-anatomy" },
      {
        kind: "points",
        title: "Cara membacanya",
        items: [
          "Candle naik (bullish) ditutup di atas pembukaannya. Di TRY-REX warnanya hijau.",
          "Candle turun (bearish) ditutup di bawah pembukaannya. Warnanya merah.",
          "Sumbu panjang berarti harga sempat ke sana tapi ditolak: ada penolakan.",
          "Body kecil dengan sumbu panjang di satu sisi disebut pin bar.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Satu candle bukan sinyal",
        text: "Candle paling bermakna dilihat bersama konteksnya: di mana ia muncul, dan ke arah mana trend sedang bergerak.",
      },
      {
        kind: "quiz",
        question: "Candle dengan sumbu atas sangat panjang dan body kecil di bawah biasanya menunjukkan…",
        options: ["Pembeli menang telak", "Harga sempat naik tinggi lalu ditolak turun", "Pasar sedang tutup"],
        answer: 1,
        explain: "Sumbu atas yang panjang berarti harga sempat ke atas tapi tidak bertahan: tanda penolakan dari atas.",
      },
    ],
    sources: [needed("Referensi candlestick charting (misalnya buku Steve Nison) atau materi edukasi bursa.")],
    practice,
  },
  {
    slug: "trend",
    track: "chart",
    title: "Trend: naik, turun, menyamping",
    summary: "Puncak dan lembah memberitahu arah. Belajar membedakan ketiganya di chart asli.",
    minutes: 6,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Trend naik terlihat dari puncak dan lembah yang makin tinggi. Trend turun kebalikannya: puncak dan lembah makin rendah. Kalau puncak dan lembah kira-kira sejajar, harga sedang menyamping.",
      },
      { kind: "diagram", name: "trend-shapes" },
      { kind: "chart", pick: "uptrend", caption: "Chart asli dari Trading Game dengan kecenderungan naik." },
      { kind: "chart", pick: "downtrend", caption: "Chart asli dengan kecenderungan turun." },
      {
        kind: "callout",
        tone: "example",
        title: "Kemiringan di Trading Game",
        text: "Situasi Market menyebut kemiringan trend dalam pip per candle, dihitung dari 30 candle terakhir. Angka positif berarti condong naik.",
      },
      {
        kind: "quiz",
        question: "Puncak dan lembah sama-sama makin rendah. Ini trend…",
        options: ["Naik", "Turun", "Menyamping"],
        answer: 1,
        explain: "Lower highs dan lower lows adalah ciri trend turun.",
      },
    ],
    sources: [needed("Definisi higher highs/lower lows dari sumber analisis teknikal yang diakui (misalnya CMT Association).")],
    practice,
  },
  {
    slug: "support-resistance",
    track: "chart",
    title: "Support dan resistance",
    summary: "Area di mana harga berkali-kali berhenti, dan kenapa area itu penting untuk entry dan stop loss.",
    minutes: 6,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Support adalah area di mana penurunan beberapa kali tertahan. Resistance adalah area di mana kenaikan beberapa kali tertahan. Keduanya berupa area, bukan satu garis presisi.",
      },
      { kind: "chart", pick: "levels", caption: "Pita merah: resistance. Pita hijau: support. Dideteksi otomatis dari titik balik chart." },
      {
        kind: "points",
        title: "Yang perlu diingat",
        items: [
          "Makin sering sebuah level disentuh, makin banyak trader yang memperhatikannya.",
          "Resistance yang ditembus sering berubah peran jadi support, dan sebaliknya.",
          "Breakout palsu sering terjadi. Tunggu candle ditutup di luar level sebagai konfirmasi.",
        ],
      },
      {
        kind: "quiz",
        question: "Harga sudah tiga kali gagal menembus 1.0920. Level ini kemungkinan adalah…",
        options: ["Support", "Resistance", "Pip"],
        answer: 1,
        explain: "Level di atas harga yang berkali-kali menahan kenaikan adalah resistance.",
      },
    ],
    sources: [needed("Materi support/resistance dari sumber edukasi analisis teknikal yang kredibel.")],
    practice,
  },
  {
    slug: "timeframe",
    track: "chart",
    title: "Timeframe: H4 itu apa?",
    summary: "Chart yang sama terlihat berbeda di M15, H4, atau D1. Pilih sesuai gaya latihanmu.",
    minutes: 3,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Timeframe adalah lama waktu yang diwakili satu candle. Di H4, satu candle = 4 jam, jadi 30 candle sekitar 5 hari perdagangan.",
      },
      {
        kind: "points",
        title: "Timeframe umum",
        items: ["M15: 15 menit, banyak gerakan kecil.", "H1: 1 jam.", "H4: 4 jam, dipakai semua soal Trading Game.", "D1: 1 hari, gambaran besar."],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Lihat dari atas ke bawah",
        text: "Banyak trader memeriksa timeframe besar untuk arah umum, lalu timeframe kecil untuk titik masuk.",
      },
      {
        kind: "quiz",
        question: "Berapa jam yang diwakili 6 candle H4?",
        options: ["6 jam", "12 jam", "24 jam"],
        answer: 2,
        explain: "6 × 4 jam = 24 jam.",
      },
    ],
    sources: [needed("Penjelasan timeframe dan analisis multi-timeframe dari sumber edukasi resmi.")],
  },

  // -------------------------------------------------------------------------
  // Risiko
  {
    slug: "stop-loss-take-profit",
    track: "risiko",
    title: "Stop loss dan take profit",
    summary: "Tentukan pintu keluar sebelum masuk. Dua angka yang memisahkan rencana dari tebakan.",
    minutes: 5,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Stop loss adalah harga di mana posisimu otomatis ditutup kalau salah. Take profit adalah harga target yang menutup posisi saat untung. Keduanya ditentukan sebelum masuk, saat kepala masih dingin.",
      },
      {
        kind: "points",
        title: "Tempat yang lazim",
        items: [
          "Untuk BUY: stop loss sedikit di bawah support, take profit dekat resistance berikutnya.",
          "Untuk SELL: stop loss sedikit di atas resistance, take profit dekat support berikutnya.",
          "Jangan geser stop loss menjauh hanya karena harga mendekatinya.",
        ],
      },
      {
        kind: "callout",
        tone: "example",
        title: "Di AI Evaluation",
        text: "Chart review menampilkan garis Entry, Stop Loss, dan Take Profit yang dihitung dari support dan resistance soal itu.",
      },
      {
        kind: "quiz",
        question: "Kapan waktu terbaik menentukan stop loss?",
        options: ["Setelah posisi mulai rugi", "Sebelum membuka posisi", "Tidak perlu, pantau saja"],
        answer: 1,
        explain: "Stop loss ditentukan sebelum masuk, supaya keputusan tidak dipengaruhi emosi saat rugi.",
      },
    ],
    sources: [needed("Panduan penggunaan stop loss dari regulator atau materi edukasi broker teregulasi.")],
    practice: { label: "Lihat contoh di AI Evaluation", href: "/ai-evaluation" },
  },
  {
    slug: "risk-reward",
    track: "risiko",
    title: "Risk-reward ratio",
    summary: "Kenapa kamu bisa benar kurang dari setengah waktu dan tetap bertahan.",
    minutes: 5,
    level: "menengah",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Risk-reward membandingkan jarak ke stop loss dengan jarak ke take profit. Risiko 20 pip untuk target 40 pip adalah 1:2.",
      },
      { kind: "diagram", name: "risk-reward" },
      {
        kind: "callout",
        tone: "example",
        title: "Hitung sendiri",
        text: "Dengan 1:2, empat trade yang kalah (4 × 20 = 80 pip) tertutup oleh dua yang menang (2 × 40 = 80 pip). Enam trade, dua benar, hasilnya impas sebelum biaya.",
      },
      {
        kind: "p",
        text: "Rasio yang bagus di atas kertas tidak berguna kalau targetnya tidak realistis. Target yang melewati resistance kuat jarang tercapai.",
      },
      {
        kind: "quiz",
        question: "Stop loss 30 pip, take profit 90 pip. Rasionya?",
        options: ["1:2", "1:3", "3:1"],
        answer: 1,
        explain: "90 / 30 = 3, jadi risiko 1 untuk potensi 3.",
      },
    ],
    sources: [needed("Sumber tentang expectancy dan risk-reward dari literatur manajemen risiko trading.")],
  },
  {
    slug: "leverage",
    track: "risiko",
    title: "Leverage: pedang bermata dua",
    summary: "Leverage memperbesar untung dan rugi dengan kelipatan yang sama. Pahami sebelum tergoda.",
    minutes: 5,
    level: "menengah",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Leverage adalah pinjaman dari broker yang membuat posisimu lebih besar dari modal. Dengan leverage 1:100, modal 1 juta bisa membuka posisi senilai 100 juta.",
      },
      { kind: "diagram", name: "leverage" },
      {
        kind: "callout",
        tone: "warning",
        title: "Rugi juga dikali",
        text: "Pergerakan 1% melawan posisi 100 juta berarti rugi 1 juta: seluruh modal pada contoh di atas. Leverage tinggi bisa menghabiskan akun dalam satu gerakan.",
      },
      {
        kind: "points",
        title: "Istilah terkait",
        items: [
          "Margin: dana jaminan yang ditahan broker selama posisi terbuka.",
          "Margin call: peringatan saat dana jaminan hampir habis.",
          "Stop out: broker menutup posisi paksa karena margin tidak cukup.",
        ],
      },
      {
        kind: "quiz",
        question: "Leverage 1:50, harga bergerak 2% melawan posisimu. Kira-kira berapa persen modal yang hilang?",
        options: ["2%", "50%", "100%"],
        answer: 2,
        explain: "2% × 50 = 100%. Seluruh modal habis, atau posisi sudah ditutup paksa sebelum itu.",
      },
    ],
    sources: [
      needed("Batas leverage dan peringatan risiko dari regulator (Bappebti/OJK) dengan tanggal akses."),
      needed("Definisi margin call dan stop out dari broker teregulasi."),
    ],
  },

  // -------------------------------------------------------------------------
  // Crypto
  {
    slug: "apa-itu-crypto",
    track: "crypto",
    title: "Apa itu crypto dan blockchain?",
    summary: "Uang digital tanpa bank sentral, dicatat di buku besar yang disalin di banyak komputer.",
    minutes: 6,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Crypto adalah aset digital yang transaksinya dicatat di blockchain: buku catatan bersama yang disalin di banyak komputer. Tidak ada satu bank atau pemerintah yang mengendalikan catatan itu.",
      },
      {
        kind: "points",
        title: "Cara kerja blockchain, disederhanakan",
        items: [
          "Transaksi dikumpulkan dalam blok.",
          "Setiap blok menyimpan sidik jari (hash) blok sebelumnya, membentuk rantai.",
          "Mengubah satu blok lama berarti mengubah semua blok sesudahnya di sebagian besar salinan, yang sangat sulit.",
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Volatilitas tinggi",
        text: "Harga crypto bisa bergerak jauh lebih besar dalam sehari dibanding pair forex utama. Prinsip manajemen risiko berlaku, bahkan lebih ketat.",
      },
      {
        kind: "quiz",
        question: "Apa yang membuat catatan blockchain sulit diubah diam-diam?",
        options: [
          "Disimpan di satu server bank",
          "Setiap blok terhubung ke blok sebelumnya dan catatannya disalin di banyak komputer",
          "Dilindungi password admin",
        ],
        answer: 1,
        explain: "Rantai hash dan banyaknya salinan membuat perubahan diam-diam hampir mustahil.",
      },
    ],
    sources: [
      needed("Whitepaper Bitcoin (Satoshi Nakamoto, 2008) sebagai sumber primer."),
      needed("Materi edukasi aset kripto dari regulator Indonesia, dengan tanggal akses."),
    ],
  },
  {
    slug: "bitcoin-altcoin-stablecoin",
    track: "crypto",
    title: "Bitcoin, altcoin, dan stablecoin",
    summary: "Tidak semua crypto sama. Kenali tiga kelompok besar dan risikonya masing-masing.",
    minutes: 5,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "points",
        items: [
          "Bitcoin: crypto pertama, dengan pasokan maksimum 21 juta koin dalam aturan jaringannya.",
          "Altcoin: semua crypto selain Bitcoin. Sebagian punya kegunaan jelas, banyak yang tidak.",
          "Stablecoin: dirancang mengikuti nilai aset lain, biasanya dolar AS. Stabilnya bergantung pada cadangan dan kepercayaan pada penerbitnya.",
        ],
      },
      {
        kind: "callout",
        tone: "warning",
        title: "Hati-hati dengan janji",
        text: "Proyek yang menjanjikan keuntungan pasti atau “pasti naik” adalah tanda bahaya. Periksa apakah aset itu terdaftar di bursa resmi negaramu.",
      },
      {
        kind: "quiz",
        question: "Nilai stablecoin bergantung pada…",
        options: ["Cadangan dan kepercayaan pada penerbitnya", "Jumlah penggunanya saja", "Harga Bitcoin"],
        answer: 0,
        explain: "Stablecoin mencoba mengikuti nilai aset acuan; stabilitasnya bergantung pada cadangan dan kredibilitas penerbit.",
      },
    ],
    sources: [needed("Sumber resmi tentang pasokan Bitcoin dan risiko stablecoin (bank sentral atau regulator).")],
  },
  {
    slug: "keamanan-crypto",
    track: "crypto",
    title: "Keamanan: wallet dan exchange",
    summary: "Siapa yang memegang kunci, memegang asetnya. Cara menghindari penipuan paling umum.",
    minutes: 5,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Wallet menyimpan kunci akses ke crypto-mu. Di exchange, kunci dipegang platform. Di wallet pribadi, kunci dipegang kamu lewat seed phrase.",
      },
      {
        kind: "points",
        title: "Aturan yang tidak bisa ditawar",
        items: [
          "Jangan pernah membagikan seed phrase, kepada siapa pun, termasuk yang mengaku admin.",
          "Aktifkan verifikasi dua langkah di exchange.",
          "Periksa alamat situs dan aplikasi; penipu sering meniru tampilan platform resmi.",
          "Gunakan exchange yang terdaftar resmi di negaramu.",
        ],
      },
      {
        kind: "quiz",
        question: "Seseorang mengaku support exchange dan meminta seed phrase untuk “verifikasi”. Kamu…",
        options: ["Memberikannya supaya cepat selesai", "Menolak: support resmi tidak pernah meminta seed phrase", "Memberikan setengahnya saja"],
        answer: 1,
        explain: "Seed phrase memberi kendali penuh atas asetmu. Tidak ada alasan sah untuk membagikannya.",
      },
    ],
    sources: [needed("Panduan keamanan aset kripto dari regulator atau lembaga keamanan siber, dengan tanggal akses.")],
  },

  // -------------------------------------------------------------------------
  // Psikologi
  {
    slug: "fomo-overtrading",
    track: "psikologi",
    title: "FOMO dan overtrading",
    summary: "Takut ketinggalan dan ingin membalas rugi: dua kebiasaan yang menguras akun pelan-pelan.",
    minutes: 4,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "FOMO membuatmu masuk setelah harga sudah lari jauh, sering tepat sebelum berbalik. Overtrading adalah membuka posisi karena bosan, gelisah, atau ingin cepat menutup rugi.",
      },
      {
        kind: "points",
        title: "Rem darurat",
        items: [
          "Punya aturan tertulis kapan boleh masuk. Tanpa setup, tanpa trade.",
          "Batasi jumlah trade per hari.",
          "Setelah dua kali rugi beruntun, berhenti dan tinjau, bukan menggandakan.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Target harian di TRY-REX",
        text: "Target harianmu mengukur latihan, bukan untung. Menyelesaikan 5 soal dengan tenang lebih berguna daripada 30 soal asal klik.",
      },
      {
        kind: "quiz",
        question: "Setelah rugi, dorongan untuk langsung masuk lagi dengan posisi lebih besar disebut…",
        options: ["Disiplin", "Revenge trading, bagian dari overtrading", "Diversifikasi"],
        answer: 1,
        explain: "Membalas rugi dengan posisi lebih besar adalah pola overtrading yang berbahaya.",
      },
    ],
    sources: [needed("Literatur behavioral finance tentang FOMO, loss aversion, dan overtrading.")],
  },
  {
    slug: "jurnal-trading",
    track: "psikologi",
    title: "Jurnal trading",
    summary: "Catatan sederhana yang mengubah kesalahan jadi pelajaran, bukan pengulangan.",
    minutes: 3,
    level: "pemula",
    draft: true,
    blocks: [
      {
        kind: "p",
        text: "Jurnal trading mencatat setiap keputusan: apa yang kamu lihat, kenapa masuk atau menunggu, hasilnya, dan satu pelajaran. Dalam beberapa minggu, pola kesalahanmu sendiri mulai terlihat.",
      },
      {
        kind: "points",
        title: "Isi minimum satu catatan",
        items: ["Pair dan timeframe", "Keputusan dan alasan utamanya", "Stop loss dan target", "Hasil", "Satu hal yang akan kamu ulangi atau hindari"],
      },
      {
        kind: "callout",
        tone: "example",
        title: "Mulai dari sini",
        text: "Riwayat jawabanmu di Dashboard sudah jadi jurnal kecil: pair, keputusan, dan hasilnya. Buka “Bedah soal ini” untuk menambahkan alasan.",
      },
    ],
    sources: [needed("Sumber tentang praktik jurnal trading dan refleksi keputusan.")],
  },
]

export const lessonBySlug = new Map(LESSONS.map((l) => [l.slug, l]))
export const trackById = new Map(TRACKS.map((t) => [t.id, t]))

/** Lessons in reading order across all tracks. */
export const ORDERED_LESSONS = TRACKS.flatMap((t) => t.lessons.map((s) => lessonBySlug.get(s)!).filter(Boolean))

export function neighbours(slug: string) {
  const i = ORDERED_LESSONS.findIndex((l) => l.slug === slug)
  return { prev: i > 0 ? ORDERED_LESSONS[i - 1] : null, next: i >= 0 && i < ORDERED_LESSONS.length - 1 ? ORDERED_LESSONS[i + 1] : null }
}
