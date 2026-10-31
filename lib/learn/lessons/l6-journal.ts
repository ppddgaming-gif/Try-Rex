import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "L6-4_Membuat_Trading_Journal.pdf". Left out: the extra columns, the
// emotion table, the process metrics table, the tools comparison and the
// four-week programme.

export const journal: Lesson = {
  slug: "jurnal-trading",
  level: 6,
  minutes: 7,
  title: tx("Membuat trading journal", "Keeping a trading journal"),
  summary: tx(
    "Apa yang dicatat, bagaimana menghitung angka pentingnya, dan cara membuat jurnal ringan sehingga benar-benar kamu pakai.",
    "What to record, how to work out its key numbers, and how to keep a journal light enough that you actually use it.",
  ),
  material: ["L6-4_Membuat_Trading_Journal.pdf"],
  blocks: [
    {
      kind: "callout",
      tone: "note",
      title: tx("Isi materi ini dalam satu paragraf", "This lesson in one paragraph"),
      text: tx(
        "Jurnal trading adalah cermin yang tidak berbohong. Ia mengganti ingatan yang bias (\"rasanya aku lumayan\") dengan data (\"win rate 40%, ekspektasi +0,15R, 2 dari 10 transaksi melanggar rencana\"). Jurnal yang baik singkat, konsisten, dan ditinjau secara berkala. Tanpa peninjauan, jurnal hanyalah buku harian.",
        "A trading journal is a mirror that doesn't lie. It swaps biased memory (\"I feel I'm doing okay\") for data (\"40% win rate, +0.15R expectancy, 2 of 10 trades broke the plan\"). A good journal is short, consistent and reviewed regularly. Without review, a journal is just a diary.",
      ),
    },
    {
      kind: "p",
      text: tx(
        "Bayangkan seorang pelari yang ingin lebih cepat tetapi tidak pernah mencatat waktu, jarak, atau kondisi tubuhnya; ia hanya \"merasa\" sudah membaik. Seseorang yang merasa \"uangnya cepat habis\" juga baru tahu penyebabnya setelah mencatat pengeluaran sebulan. Jurnal trading bekerja sama: ia menyingkap kebocoran yang tak terlihat dari dalam.",
        "Imagine a runner who wants to get faster but never records times, distances or how their body feels; they only \"feel\" better. Someone who feels their \"money goes fast\" only finds out why after tracking a month of spending. A trading journal works the same way: it reveals leaks you can't see from the inside.",
      ),
    },
    {
      kind: "table",
      head: [tx("Manfaat", "Benefit"), tx("Contoh", "Example")],
      rows: [
        [tx("Mengganti ingatan dengan data", "Swapping memory for data"), tx("Kamu merasa strategi \"bagus\", tetapi jurnal menunjukkan 7 dari 10 kerugian terjadi pada jam yang sama.", "You feel the strategy is \"good\", but the journal shows 7 of 10 losses happen at the same hour.")],
        [tx("Menemukan pola perilaku", "Finding behaviour patterns"), tx("Transaksi FOMO selalu muncul setelah rugi pertama hari itu.", "FOMO trades always appear after the day's first loss.")],
        [tx("Menilai strategi dengan adil", "Judging the strategy fairly"), tx("Strategi untung bila patuh, tetapi akun tetap rugi karena pelanggaran.", "The strategy profits when followed, but the account still loses because of violations.")],
        [tx("Membangun akuntabilitas", "Building accountability"), tx("\"Aku akan malu menulis transaksi ini.\"", "\"I'd be embarrassed to write this trade down.\"")],
      ],
    },

    { kind: "heading", text: tx("Kolom apa saja yang perlu dicatat?", "Which columns to record?") },
    {
      kind: "table",
      head: [tx("Kolom", "Column"), tx("Contoh isian", "Example"), tx("Fungsi", "Purpose")],
      rows: [
        [tx("Tanggal dan jam", "Date and time"), tx("12 Okt, 15.20 WIB", "12 Oct, 15:20 WIB"), tx("Melihat pola waktu dan sesi", "Spotting time and session patterns")],
        [tx("Pair dan arah", "Pair and direction"), tx("EUR/USD, beli", "EUR/USD, buy"), tx("Melihat pair mana yang cocok", "Seeing which pairs suit you")],
        [tx("Setup", "Setup"), tx("Pantulan support + candle konfirmasi", "A bounce at support + confirmation candle"), tx("Menilai setup mana yang bekerja", "Judging which setups work")],
        [tx("Harga masuk, stop, target", "Entry, stop, target"), tx("1,0800 / 1,0780 / 1,0840", "1.0800 / 1.0780 / 1.0840"), tx("Memeriksa eksekusi vs rencana", "Checking execution against the plan")],
        [tx("Risiko dalam % dan lot", "Risk in % and lots"), tx("1%, 0,05 lot", "1%, 0.05 lots"), tx("Memantau konsistensi ukuran", "Watching size consistency")],
        [tx("Hasil dalam R", "Result in R"), tx("+2R atau −1R", "+2R or −1R"), tx("Membandingkan tanpa terpengaruh ukuran akun", "Comparing regardless of account size")],
        [tx("Patuh rencana? (ya/tidak)", "Followed the plan? (yes/no)"), tx("Tidak: stop digeser", "No: stop moved"), tx("Mengukur disiplin", "Measuring discipline")],
        [tx("Emosi (sebelum dan sesudah)", "Emotion (before and after)"), tx("Tenang / kesal", "Calm / annoyed"), tx("Menemukan pola emosional", "Finding emotional patterns")],
        [tx("Satu kalimat catatan", "A one-line note"), tx("Masuk terlalu cepat sebelum candle ditutup", "Entered too soon, before the candle closed"), tx("Pelajaran konkret", "A concrete lesson")],
      ],
      note: tx(
        "Mulai dari sembilan kolom ini. Lima belas kolom, catatan panjang, dan banyak tangkapan layar per transaksi membuat orang kelelahan dan berhenti. Jurnal sederhana yang dipakai setiap hari lebih baik daripada jurnal sempurna yang ditinggalkan minggu kedua.",
        "Start with these nine columns. Fifteen columns, long notes and lots of screenshots per trade wear people out and they quit. A simple journal used every day beats a perfect one abandoned in week two.",
      ),
    },

    { kind: "heading", text: tx("Dari jurnal menjadi angka", "From journal to numbers") },
    {
      kind: "p",
      text: tx(
        "Contoh rekaan 10 transaksi dengan risiko sama: +2R, −1R, −1R (tanpa setup, FOMO), +2R, −1R, +1,5R, −1R, −1R (tanpa setup, balas dendam), +2R, −1R.",
        "A made-up example of 10 trades at the same risk: +2R, −1R, −1R (no setup, FOMO), +2R, −1R, +1.5R, −1R, −1R (no setup, revenge), +2R, −1R.",
      ),
    },
    {
      kind: "table",
      head: [tx("Metrik", "Metric"), tx("Rumus", "Formula"), tx("Hasil dari contoh", "Result in the example")],
      rows: [
        [tx("Win rate", "Win rate"), tx("Transaksi menang ÷ total", "Winning trades ÷ total"), tx("4 ÷ 10 = 40%", "4 ÷ 10 = 40%")],
        [tx("Rata-rata menang", "Average win"), tx("Total R menang ÷ jumlah menang", "Total winning R ÷ number of wins"), tx("7,5 ÷ 4 = 1,875R", "7.5 ÷ 4 = 1.875R")],
        [tx("Rata-rata kalah", "Average loss"), tx("Total R kalah ÷ jumlah kalah", "Total losing R ÷ number of losses"), tx("6 ÷ 6 = 1R", "6 ÷ 6 = 1R")],
        [tx("Ekspektasi per transaksi", "Expectancy per trade"), tx("Win rate × rata-rata menang − (1 − win rate) × rata-rata kalah", "Win rate × average win − (1 − win rate) × average loss"), tx("0,4 × 1,875 − 0,6 × 1 = +0,15R", "0.4 × 1.875 − 0.6 × 1 = +0.15R")],
        [tx("Profit factor", "Profit factor"), tx("Total R menang ÷ total R kalah", "Total winning R ÷ total losing R"), tx("7,5 ÷ 6 = 1,25", "7.5 ÷ 6 = 1.25")],
      ],
    },
    {
      kind: "table",
      head: [tx("Kelompok", "Group"), tx("Hasil", "Result"), tx("Ekspektasi per transaksi", "Expectancy per trade")],
      rows: [
        [tx("Patuh (8 transaksi: 4 menang, 4 kalah)", "Followed (8 trades: 4 wins, 4 losses)"), tx("7,5 − 4 = +3,5R", "7.5 − 4 = +3.5R"), tx("+0,44R", "+0.44R")],
        [tx("Tidak patuh (2 transaksi: 2 kalah)", "Broke the plan (2 trades: 2 losses)"), tx("−2R", "−2R"), tx("−1R", "−1R")],
        [tx("Semua", "All"), tx("+1,5R", "+1.5R"), tx("+0,15R", "+0.15R")],
      ],
      note: tx(
        "Tanpa memisahkan, strategi tampak lemah (+0,15R). Setelah dipisahkan, strateginya sebenarnya lebih baik (+0,44R) dan dua pelanggaran memotong hampir dua pertiga hasilnya. Perbaikan terbaik bukan mengganti strategi, melainkan menghentikan dua pelanggaran itu. Sepuluh transaksi terlalu sedikit untuk kesimpulan kuat; ini hanya latihan hitungan.",
        "Without splitting, the strategy looks weak (+0.15R). Split, the strategy is actually better (+0.44R) and two violations cut almost two thirds of the result. The best fix isn't a new strategy but stopping those two violations. Ten trades are too few for firm conclusions; this is only a calculation exercise.",
      ),
    },

    { kind: "heading", text: tx("Kapan menulis dan kapan meninjau?", "When to write and when to review?") },
    {
      kind: "table",
      head: [tx("Rutinitas", "Routine"), tx("Durasi", "Duration"), tx("Isi", "Contents")],
      rows: [
        [tx("Sebelum sesi", "Before the session"), tx("2–5 menit", "2–5 minutes"), tx("Baca rencana, catat batas hari ini, cek kalender berita", "Read the plan, note today's limits, check the news calendar")],
        [tx("Selama sesi", "During the session"), tx("Beberapa detik per transaksi", "A few seconds per trade"), tx("Catat data mekanis", "Record the mechanical data")],
        [tx("Sesudah sesi (harian)", "After the session (daily)"), tx("Sekitar 5 menit", "About 5 minutes"), tx("Tandai transaksi di luar rencana; analisis ditunda ke ulasan mingguan", "Tag trades outside the plan; leave analysis for the weekly review")],
        [tx("Mingguan", "Weekly"), tx("Sekitar 30 menit", "About 30 minutes"), tx("Empat pertanyaan: disiplin, kualitas, pola, fokus", "Four questions: discipline, quality, patterns, focus")],
      ],
    },
    {
      kind: "steps",
      title: tx("Empat pertanyaan ulasan mingguan", "Four weekly review questions"),
      items: [
        tx("Disiplin: berapa persen transaksi yang mengikuti rencana?", "Discipline: what percentage of trades followed the plan?"),
        tx("Kualitas: bagaimana hasil transaksi dengan setup terbaik dibanding yang dipaksakan?", "Quality: how did your best-setup trades do against the forced ones?"),
        tx("Pola: apakah ada hari atau jam tertentu yang selalu rugi?", "Patterns: are there days or hours that always lose?"),
        tx("Fokus: pilih satu aturan spesifik dan terukur untuk minggu depan.", "Focus: pick one specific, measurable rule for next week."),
      ],
    },
    {
      kind: "table",
      head: [tx("Jumlah transaksi", "Number of trades"), tx("Yang bisa kamu simpulkan", "What you can conclude"), tx("Sikap yang bijak", "The wise stance")],
      rows: [
        [tx("Kurang dari 30", "Fewer than 30"), tx("Hanya kesan awal", "Only first impressions"), tx("Fokus pada kepatuhan, bukan hasil", "Focus on compliance, not results")],
        [tx("30–50", "30–50"), tx("Pola dasar waktu dan setup mulai terlihat", "Basic time and setup patterns start to show"), tx("Catat hipotesis, belum jadi kesimpulan", "Note hypotheses, not conclusions")],
        [tx("100–200", "100–200"), tx("Pola perilaku (FOMO, balas dendam) mulai bermakna", "Behaviour patterns (FOMO, revenge) start to mean something"), tx("Mulai perbaiki kebiasaan berdasarkan data", "Start fixing habits from the data")],
        [tx("200 atau lebih", "200 or more"), tx("Keunggulan per setup bisa dinilai lebih yakin", "The edge per setup can be judged more surely"), tx("Putuskan setup mana yang dilanjutkan atau dibuang", "Decide which setups to keep or drop")],
      ],
      note: tx("Ini pedoman umum, bukan aturan ilmiah mutlak.", "These are rough guides, not strict scientific rules."),
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Jurnal di Akun Demo", "The journal in the Demo Account"),
      text: tx(
        "Tab Jurnal di Akun Demo sudah mencatat data mekanis setiap trade (pair, arah, lot, SL, TP, hasil, cek Disiplin). Bagian yang tetap harus kamu isi sendiri adalah alasan, emosi, dan satu kalimat pelajaran lewat \"Tambah catatan\".",
        "The Demo Account's Journal tab already records each trade's mechanical data (pair, side, lot, SL, TP, result, Disiplin checks). What you still fill in yourself is the reason, the emotion and a one-line lesson, using \"Add note\".",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Hasil 8 transaksi: +2R, −1R, +1R, −1R, −1R, +2R, −1R, +2R. Win rate dan ekspektasi?", "8 trades: +2R, −1R, +1R, −1R, −1R, +2R, −1R, +2R. Win rate and expectancy?"), a: tx("Win rate 50%; rata-rata menang 1,75R, kalah 1R; ekspektasi 0,5 × 1,75 − 0,5 × 1 = +0,375R.", "50% win rate; average win 1.75R, loss 1R; expectancy 0.5 × 1.75 − 0.5 × 1 = +0.375R.") },
        { q: tx("Mengapa memisahkan transaksi patuh dan tidak patuh penting?", "Why separate followed and broken-plan trades?"), a: tx("Pelanggaran bisa menutupi kualitas strategi; dengan memisahkan, kamu tahu masalahnya strategi atau eksekusi.", "Violations can hide the strategy's quality; splitting tells you whether the problem is strategy or execution.") },
        { q: tx("Mengapa ulasan hanya setelah hari buruk menyesatkan?", "Why is reviewing only after bad days misleading?"), a: tx("Sampelnya bias; trading tampak lebih buruk dari kenyataan.", "The sample is biased; trading looks worse than it is.") },
      ],
    },
  ],
  sources: [
    { title: "Tips to keep a trading journal that actually improves your results", publisher: "TradeZella", url: "https://www.tradezella.com/blog/trading-journal-tips" },
    { title: "What to track in your trading journal for better results", publisher: "FX Replay", url: "https://fxreplay.com/learn/what-to-track-in-your-trading-journal-for-better-results" },
    { title: "Expected value", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Expected_value" },
  ],
}
