import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "L5-3_Kebijakan_Federal_Reserve.pdf". Left out: names of current
// officials, the 2026 meeting table, the 28 October 2026 case study and the
// October 2026 timeline (dated facts), the tools that keep the rate in its
// range (IORB, ON RRP, discount rate) and the effects on other assets.

export const fed: Lesson = {
  slug: "the-fed",
  level: 5,
  minutes: 7,
  title: tx("Kebijakan Federal Reserve (The Fed)", "Federal Reserve (Fed) policy"),
  summary: tx(
    "Siapa yang memutuskan bunga dolar, bagaimana rapat FOMC berjalan, dan cara membaca pernyataan serta dot plot dengan benar.",
    "Who decides the dollar's interest rate, how FOMC meetings work, and how to read the statement and the dot plot properly.",
  ),
  material: ["L5-3_Kebijakan_Federal_Reserve.pdf"],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Di antara seluruh bank sentral dunia, The Fed adalah yang paling diawasi oleh trader forex. Dolar AS berada di satu sisi dari banyak sekali pair: dari sembilan pair di Akun Demo TRY-REX, lima memuat dolar AS (EURUSD, GBPUSD, AUDUSD, USDJPY, USDCAD).",
        "Of all the world's central banks, the Fed is the one forex traders watch most. The US dollar is on one side of a great many pairs: of the nine pairs in the TRY-REX Demo Account, five include the US dollar (EURUSD, GBPUSD, AUDUSD, USDJPY, USDCAD).",
      ),
    },
    {
      kind: "table",
      head: [tx("Bagian", "Part"), tx("Peran sederhana", "Simple role")],
      rows: [
        [tx("Dewan Gubernur", "Board of Governors"), tx("Tujuh gubernur di Washington; ikut menentukan kebijakan dan mengawasi perbankan", "Seven governors in Washington; help set policy and supervise banking")],
        [tx("Bank Cadangan Regional", "Regional Reserve Banks"), tx("Dua belas bank regional; presidennya ikut rapat, sebagian punya hak suara bergantian", "Twelve regional banks; their presidents attend meetings, some vote in rotation")],
        [tx("FOMC", "FOMC"), tx("Komite yang memutuskan suku bunga kebijakan; 12 pemegang hak suara pada satu waktu", "The committee that decides the policy rate; 12 voters at any one time")],
        [tx("Ketua (Chair)", "Chair"), tx("Wajah publik The Fed; memimpin rapat dan menggelar konferensi pers setelah tiap rapat", "The Fed's public face; chairs meetings and holds a press conference after each")],
      ],
    },

    { kind: "heading", text: tx("Dua tugas besar: dual mandate", "Two big jobs: the dual mandate") },
    {
      kind: "table",
      head: [tx("Tujuan", "Goal"), tx("Bagaimana The Fed mengartikannya", "How the Fed reads it")],
      rows: [
        [tx("Harga stabil", "Stable prices"), tx("Inflasi 2% per tahun dalam jangka panjang, diukur dengan PCE headline", "2% a year inflation over the long run, measured by headline PCE")],
        [tx("Lapangan kerja maksimum", "Maximum employment"), tx("Tingkat pekerjaan tertinggi yang bisa dipertahankan tanpa memicu inflasi; tidak ada angka target tunggal", "The highest level of employment sustainable without stoking inflation; no single target number")],
      ],
    },
    {
      kind: "p",
      text: tx(
        "The Fed hanya punya satu alat utama, suku bunga, untuk dua tujuan. Bila inflasi masih tinggi tetapi pasar kerja melemah, menaikkan bunga membantu menekan inflasi tetapi bisa memperburuk lapangan kerja. Dalam situasi itu FOMC menimbang seberapa jauh masing-masing tujuan dari targetnya. Setiap kali kamu membaca data, tanyakan: tujuan mana yang sedang dikhawatirkan The Fed?",
        "The Fed has only one main tool, the interest rate, for two goals. When inflation is still high but the jobs market weakens, raising rates helps curb inflation but can hurt employment. In that case the FOMC weighs how far each goal is from target. Every time you read data, ask: which goal is the Fed worried about right now?",
      ),
    },

    { kind: "heading", text: tx("Rapat FOMC: jadwal dan alurnya", "FOMC meetings: schedule and flow") },
    {
      kind: "p",
      text: tx(
        "FOMC rapat delapan kali setahun, masing-masing dua hari. Pada hari kedua, pernyataan resmi (keputusan dan hasil voting) terbit pukul 14.00 waktu New York, konferensi pers Ketua pukul 14.30, dan risalah (minutes) terbit beberapa pekan kemudian. Empat rapat setahun (Maret, Juni, September, Desember) disertai proyeksi ekonomi dan dot plot.",
        "The FOMC meets eight times a year, two days each time. On day two the official statement (decision and vote) comes out at 14:00 New York time, the Chair's press conference at 14:30, and the minutes a few weeks later. Four meetings a year (March, June, September, December) come with economic projections and the dot plot.",
      ),
    },
    {
      kind: "table",
      head: [tx("Kapan", "When"), tx("Waktu New York", "New York time"), tx("WIB (musim panas AS, EDT)", "WIB (US summer time, EDT)"), tx("WIB (musim dingin AS, EST)", "WIB (US winter time, EST)")],
      rows: [
        [tx("Pernyataan keputusan", "Decision statement"), tx("14.00", "14:00"), tx("01.00 dini hari berikutnya", "01:00 the next morning"), tx("02.00 dini hari berikutnya", "02:00 the next morning")],
        [tx("Konferensi pers", "Press conference"), tx("14.30", "14:30"), tx("01.30", "01:30"), tx("02.30", "02:30")],
      ],
      note: tx(
        "Bagi trader Indonesia, keputusan The Fed jatuh pada dini hari. Putuskan sejak sore apakah kamu akan menunggu hasilnya, menutup posisi, atau tidur dengan posisi terbuka.",
        "For traders in Indonesia, the Fed's decision lands in the early morning. Decide in the afternoon whether you'll wait for it, close your position, or sleep with it open.",
      ),
    },

    { kind: "heading", text: tx("Cara The Fed berkomunikasi", "How the Fed communicates") },
    {
      kind: "table",
      head: [tx("Sarana", "Channel"), tx("Cara membacanya", "How to read it")],
      rows: [
        [tx("Pernyataan FOMC", "FOMC statement"), tx("Bandingkan dengan pernyataan rapat sebelumnya; perubahan kata kecil sering menjadi berita", "Compare it with the previous statement; small word changes often make the news")],
        [tx("Hasil voting dan dissent", "Vote and dissents"), tx("Dissent ke arah naik = condong hawkish; ke arah turun = condong dovish", "Dissent towards a hike = leaning hawkish; towards a cut = leaning dovish")],
        [tx("Konferensi pers Ketua", "The Chair's press conference"), tx("Nada dan pilihan kata sering menggerakkan harga lebih besar daripada keputusannya", "Tone and word choice often move price more than the decision itself")],
        [tx("Risalah rapat (minutes)", "Minutes"), tx("Mengungkap seberapa besar perdebatan; petunjuk rapat berikutnya", "Reveal how much debate there was; hints about the next meeting")],
        [tx("Pidato pejabat (\"Fed speak\")", "Officials' speeches (\"Fed speak\")"), tx("Periksa siapa yang bicara: pemegang suara atau bukan", "Check who's speaking: a voter or not")],
      ],
      note: tx(
        "Pejabat The Fed umumnya menahan diri berbicara tentang kebijakan sekitar satu minggu menjelang rapat (periode blackout).",
        "Fed officials usually avoid talking about policy for about a week before a meeting (the blackout period).",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Dot plot", "The dot plot"),
      text: tx(
        "Grafik yang terbit empat kali setahun. Setiap titik mewakili perkiraan satu anggota FOMC tentang posisi suku bunga pada akhir tahun berjalan, beberapa tahun ke depan, dan jangka panjang. Contoh rekaan: sepuluh anggota memperkirakan 3,75% (2 orang), 4,00% (5 orang), 4,25% (3 orang). \"Pusat gravitasi\" pandangan ada di 4,00%. Jika kluster bergeser naik dibanding dot plot sebelumnya, itu sinyal hawkish.",
        "A chart published four times a year. Each dot is one FOMC member's estimate of where the rate will be at the end of this year, the next few years and the long run. A made-up example: ten members estimate 3.75% (2 people), 4.00% (5 people), 4.25% (3 people). The \"centre of gravity\" is 4.00%. If the cluster moves up compared with the last dot plot, that's a hawkish signal.",
      ),
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Keterbatasan dot plot", "The dot plot's limits"),
      text: tx(
        "Titik adalah perkiraan pribadi, bukan janji. Ia berubah ketika data berubah, dan titik tunggal yang menyimpang kurang penting dibanding kluster. Jangan memperlakukan dot plot sebagai jadwal pasti.",
        "The dots are personal estimates, not promises. They change when the data changes, and a single outlier matters less than the cluster. Don't treat the dot plot as a fixed schedule.",
      ),
    },

    {
      kind: "steps",
      title: tx("Checklist membaca keputusan FOMC", "A checklist for reading an FOMC decision"),
      items: [
        tx("Bunga: naik, turun, atau ditahan? Berapa besar?", "Rates: up, down or held? By how much?"),
        tx("Sesuai dugaan? Bandingkan dengan peluang pasar sebelum rapat.", "As expected? Compare with the market's odds before the meeting."),
        tx("Voting: bulat atau ada dissent? Ke arah mana?", "The vote: unanimous or with dissents? In which direction?"),
        tx("Bahasa: apa yang berubah tentang ekonomi, tenaga kerja, dan inflasi dibanding pernyataan sebelumnya?", "Language: what changed about the economy, jobs and inflation since the last statement?"),
        tx("Petunjuk ke depan: pintu untuk naik, turun, atau \"menunggu data\"?", "Guidance: a door to hikes, cuts, or \"waiting for data\"?"),
      ],
    },
    {
      kind: "table",
      head: [tx("Hasil FOMC", "FOMC outcome"), tx("Dolar AS", "US dollar"), tx("EUR/USD", "EUR/USD"), tx("USD/JPY", "USD/JPY")],
      rows: [
        [tx("Hawkish tak terduga", "Unexpectedly hawkish"), tx("Cenderung menguat", "Tends to strengthen"), tx("Turun", "Falls"), tx("Naik", "Rises")],
        [tx("Sesuai dugaan, nada netral", "As expected, neutral tone"), tx("Reaksi kecil", "Small reaction"), tx("Datar", "Flat"), tx("Datar", "Flat")],
        [tx("Dovish tak terduga", "Unexpectedly dovish"), tx("Cenderung melemah", "Tends to weaken"), tx("Naik", "Rises"), tx("Turun", "Falls")],
      ],
      note: tx(
        "Arah pair dibaca dari sisi dolar: dolar kuat membuat pair yang dolarnya di belakang (EUR/USD) turun dan yang dolarnya di depan (USD/JPY) naik. Ini kecenderungan, bukan kepastian: reaksi pertama sering berbalik saat konferensi pers berjalan.",
        "Read the pair from the dollar's side: a strong dollar makes pairs with the dollar second (EUR/USD) fall and pairs with the dollar first (USD/JPY) rise. These are tendencies, not certainties: the first reaction often reverses during the press conference.",
      ),
    },
    {
      kind: "points",
      title: tx("Kesalahan umum pemula", "Common beginner mistakes"),
      items: [
        tx("Memperdagangkan kata \"naik atau turun\" tanpa melihat dugaan.", "Trading the words \"up or down\" without looking at expectations."),
        tx("Menahan posisi besar tepat sebelum pengumuman. Spread bisa melebar dan slippage terjadi.", "Holding a big position right before the announcement. Spreads can widen and slippage happen."),
        tx("Mengira satu rapat menentukan tren. The Fed bergerak bertahap dan bergantung pada data berikutnya.", "Thinking one meeting sets the trend. The Fed moves step by step, depending on the next data."),
        tx("Menyamakan dot plot dengan janji.", "Treating the dot plot as a promise."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Sebutkan dua tujuan The Fed dan ukuran inflasi untuk target 2%.", "Name the Fed's two goals and the inflation measure for its 2% target."), a: tx("Lapangan kerja maksimum dan harga stabil; ukurannya PCE headline.", "Maximum employment and stable prices; the measure is headline PCE.") },
        { q: tx("Voting 9 lawan 3, tiga anggota ingin menurunkan bunga. Isyaratnya?", "A 9–3 vote, three members wanting a cut. The signal?"), a: tx("Perbedaan pendapat ke arah dovish.", "Dissent in the dovish direction.") },
        { q: tx("Pernyataan terbit pukul 14.00 waktu New York (EST). Pukul berapa WIB?", "The statement comes out at 14:00 New York time (EST). What time in WIB?"), a: tx("Sekitar 02.00 WIB dini hari berikutnya.", "About 02:00 WIB the next morning.") },
      ],
    },
  ],
  sources: [
    { title: "How does the Fed interpret and pursue the dual mandate?", publisher: "St. Louis Fed" },
    { title: "The FOMC conducts monetary policy", publisher: "St. Louis Fed", url: "https://www.stlouisfed.org/in-plain-english/the-fomc-conducts-monetary-policy" },
    { title: "Meeting calendars", publisher: "Federal Reserve", url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" },
    { title: "Fed dot plot", publisher: "Mirabaud" },
  ],
}
