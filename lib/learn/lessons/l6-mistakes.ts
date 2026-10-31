import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "L6-5_Mengevaluasi_Kesalahan.pdf". Left out: the broker's list of
// technical mistakes, the evaluation traps table, the one-trade review
// template, the period table, the full weekly example, the Demo Account
// limits table and the four-week programme.

export const mistakes: Lesson = {
  slug: "evaluasi-kesalahan",
  level: 6,
  minutes: 7,
  title: tx("Mengevaluasi kesalahan", "Evaluating mistakes"),
  summary: tx(
    "Mengubah setiap kerugian menjadi bahan belajar: memisahkan keputusan dari hasil, menghitung biaya kesalahan, dan memilih satu perbaikan per minggu.",
    "Turning every loss into learning: separating decisions from outcomes, costing mistakes, and choosing one fix a week.",
  ),
  material: ["L6-5_Mengevaluasi_Kesalahan.pdf"],
  blocks: [
    {
      kind: "callout",
      tone: "note",
      title: tx("Isi materi ini dalam satu paragraf", "This lesson in one paragraph"),
      text: tx(
        "Evaluasi yang baik memisahkan kualitas keputusan dari hasil (karena keputusan bagus bisa berujung rugi dan keputusan buruk bisa berujung untung), mengelompokkan kesalahan ke dalam jenis yang jelas, menghitung biaya tiap jenis dalam satuan R, menelusuri akar masalah, lalu memilih satu perbaikan kecil yang terukur untuk diuji minggu depan. Lakukan di luar jam trading, dengan data dari jurnal, dan dengan sikap ingin tahu, bukan menghukum.",
        "Good evaluation separates decision quality from outcome (because good decisions can lose and bad ones can win), sorts mistakes into clear types, costs each type in R, traces the root cause, then picks one small, measurable fix to test next week. Do it outside trading hours, with journal data, and with curiosity rather than punishment.",
      ),
    },
    {
      kind: "table",
      head: [tx("Tanpa evaluasi", "Without evaluation"), tx("Dengan evaluasi", "With evaluation")],
      rows: [
        [tx("Kesalahan yang sama diulang tanpa disadari", "The same mistake repeated without noticing"), tx("Pola kesalahan terlihat dan bisa diperbaiki", "Mistake patterns become visible and fixable")],
        [tx("Mengganti strategi saat rugi (sering keliru)", "Switching strategy after losses (often wrong)"), tx("Tahu apakah masalahnya strategi atau perilaku", "Knowing whether the problem is strategy or behaviour")],
        [tx("Pengalaman 100 transaksi = 1 pengalaman diulang 100 kali", "100 trades = 1 experience repeated 100 times"), tx("Pengalaman 100 transaksi = 100 pelajaran", "100 trades = 100 lessons")],
      ],
    },

    { kind: "heading", text: tx("Hasil bukan ukuran kualitas keputusan", "The outcome isn't the measure of the decision") },
    {
      kind: "p",
      text: tx(
        "Bayangkan bertaruh dengan peluang menang 60% lalu kalah. Keputusannya bagus dan hasilnya sial. Sebaliknya, bertaruh pada peluang 30% lalu menang tidak membuat keputusan itu baik. Dalam trading sama persis: satu hasil sangat dipengaruhi keberuntungan, sedangkan kualitas keputusan ditentukan oleh prosesnya.",
        "Imagine betting at 60% odds of winning and losing. The decision was good; the outcome was unlucky. Betting at 30% odds and winning doesn't make that decision good. Trading is exactly the same: one outcome is heavily affected by luck, while decision quality comes from the process.",
      ),
    },
    {
      kind: "table",
      head: [tx("", ""), tx("Hasil: untung", "Outcome: win"), tx("Hasil: rugi", "Outcome: loss")],
      rows: [
        [tx("Keputusan baik (sesuai rencana)", "Good decision (as planned)"), tx("Wajar dan bagus. Lanjutkan.", "Normal and good. Carry on.")
          , tx("Sial yang wajar. Jangan ubah apa pun; ini bagian dari statistik.", "Normal bad luck. Change nothing; it's part of the statistics.")],
        [tx("Keputusan buruk (melanggar rencana)", "Bad decision (broke the plan)"), tx("Untung yang berbahaya: penguatan semu pada kebiasaan buruk.", "A dangerous win: false reward for a bad habit.")
          , tx("Pelajaran jelas. Perbaiki kebiasaannya.", "A clear lesson. Fix the habit.")],
      ],
    },
    {
      kind: "table",
      head: [tx("Jenis kesalahan", "Kind of mistake"), tx("Pertanyaan", "Question"), tx("Contoh", "Example")],
      rows: [
        [tx("1. Analisis", "1. Analysis"), tx("Apakah penilaianku atas chart keliru?", "Did I misjudge the chart?"), tx("Melawan tren utama, menebak puncak atau dasar", "Fighting the main trend, guessing tops or bottoms")],
        [tx("2. Manajemen risiko", "2. Risk management"), tx("Apakah ukuran dan stop sesuai rencana?", "Were size and stop as planned?"), tx("Lot terlalu besar, stop tidak dipasang, risiko di atas 1%", "Lot too big, no stop, risk above 1%")],
        [tx("3. Eksekusi", "3. Execution"), tx("Apakah aku menjalankan rencana dengan benar?", "Did I carry out the plan correctly?"), tx("Salah klik, masuk sebelum candle konfirmasi", "A wrong click, entering before the confirmation candle")],
        [tx("4. Perilaku atau emosi", "4. Behaviour or emotion"), tx("Apakah emosi menggerakkan keputusanku?", "Did emotion drive my decision?"), tx("FOMO, balas dendam, menggeser stop, keluar karena takut", "FOMO, revenge, moving the stop, exiting from fear")],
        [tx("5. Informasi dan waktu", "5. Information and timing"), tx("Apakah aku mengabaikan berita atau jam?", "Did I ignore the news or the time?"), tx("Membuka posisi menjelang rilis berita besar", "Opening just before a big news release")],
        [tx("6. Rencana atau strategi", "6. Plan or strategy"), tx("Apakah rencanaku sendiri memang lemah?", "Is my plan itself weak?"), tx("Rasio untung:rugi buruk, setup tanpa keunggulan jelas", "A poor reward:risk, setups with no clear edge")],
      ],
    },
    {
      kind: "steps",
      title: tx("Proses tinjauan enam langkah", "A six-step review"),
      items: [
        tx("Kumpulkan catatan: jurnal minggu ini dan tangkapan layar chart tiap transaksi.", "Gather your notes: this week's journal and a chart screenshot of each trade."),
        tx("Sediakan waktu khusus di luar jam trading, misalnya akhir pekan.", "Set aside time outside trading hours, for example at the weekend."),
        tx("Tinjau transaksi menang dan kalah. Kemenangan bisa menyembunyikan keputusan buruk yang kebetulan berhasil.", "Review wins and losses. Wins can hide bad decisions that happened to work."),
        tx("Periksa kesalahan arah: apakah ada transaksi yang melawan tren utama?", "Check direction: did any trade fight the main trend?"),
        tx("Periksa penempatan stop: apakah terlalu rapat?", "Check stop placement: was it too tight?"),
        tx("Catat pola dan tentukan satu perubahan spesifik untuk diuji minggu berikutnya.", "Note the patterns and choose one specific change to test next week."),
      ],
    },

    { kind: "heading", text: tx("Menghitung biaya kesalahan dalam R", "Costing mistakes in R") },
    {
      kind: "table",
      head: [tx("Jenis kesalahan (rekaan, 30 transaksi)", "Mistake (made up, 30 trades)"), tx("Frekuensi", "Frequency"), tx("Kebocoran per kejadian", "Leak per occurrence"), tx("Total", "Total"), tx("Persentase", "Share")],
      rows: [
        [tx("Stop digeser menjauh", "Stop moved away"), tx("3 kali", "3 times"), tx("1,5R tambahan", "1.5R extra"), tx("4,5R", "4.5R"), tx("29,0%", "29.0%")],
        [tx("Masuk karena FOMO", "FOMO entry"), tx("4 kali", "4 times"), tx("1R", "1R"), tx("4,0R", "4.0R"), tx("25,8%", "25.8%")],
        [tx("Keluar terlalu dini", "Early exit"), tx("5 kali", "5 times"), tx("1R untung yang hilang", "1R of lost profit"), tx("5,0R", "5.0R"), tx("32,3%", "32.3%")],
        [tx("Masuk tanpa konfirmasi", "Entry without confirmation"), tx("2 kali", "2 times"), tx("1R", "1R"), tx("2,0R", "2.0R"), tx("12,9%", "12.9%")],
        [tx("Total", "Total"), tx("14 kali", "14 times"), tx("", ""), tx("15,5R", "15.5R"), tx("100%", "100%")],
      ],
      note: tx(
        "\"Keluar terlalu dini\" adalah biaya peluang (untung yang hilang), bukan kerugian nyata. Kebocoran biasanya terkonsentrasi pada beberapa kebiasaan: memperbaiki satu atau dua yang terbesar memberi manfaat lebih banyak daripada memperbaiki semuanya sekaligus.",
        "\"Early exit\" is an opportunity cost (lost profit), not a real loss. Leaks usually concentrate in a few habits: fixing the biggest one or two does more than fixing everything at once.",
      ),
    },

    { kind: "heading", text: tx("Menelusuri akar masalah: lima mengapa", "Finding the root cause: five whys") },
    {
      kind: "steps",
      title: tx("Contoh rekaan: rugi −3R padahal seharusnya −1R", "A made-up example: a −3R loss that should have been −1R"),
      items: [
        tx("Mengapa? Karena aku menggeser stop menjauh.", "Why? Because I moved the stop away."),
        tx("Mengapa menggeser? Karena takut rugi dan berharap harga berbalik.", "Why move it? Because I feared the loss and hoped price would turn."),
        tx("Mengapa takut sekali? Karena kerugian 1R terasa sangat besar bagiku.", "Why so afraid? Because a 1R loss felt huge to me."),
        tx("Mengapa terasa besar? Karena risikoku 5% per transaksi, terlalu besar untuk akun sekecil ini.", "Why did it feel huge? Because I risk 5% per trade, too much for such a small account."),
        tx("Akar masalah: ukuran risiko terlalu besar. Perbaikan: turunkan menjadi 1% (atau 0,5%) sehingga stop tidak terasa menakutkan.", "Root cause: the risk size is too big. Fix: cut it to 1% (or 0.5%) so the stop doesn't feel frightening."),
      ],
    },
    {
      kind: "table",
      head: [tx("Kurang baik", "Weaker"), tx("Lebih baik (spesifik dan terukur)", "Better (specific and measurable)"), tx("Cara mengukur", "How to measure it")],
      rows: [
        [tx("\"Aku harus lebih disiplin\"", "\"I must be more disciplined\""), tx("\"Tidak menggeser stop menjauh sepanjang minggu.\"", "\"No moving the stop away all week.\""), tx("Jumlah stop yang digeser = 0", "Stops moved = 0")],
        [tx("\"Kurangi overtrading\"", "\"Trade less\""), tx("\"Maksimal 3 transaksi per hari.\"", "\"At most 3 trades a day.\""), tx("Rata-rata transaksi per hari", "Average trades per day")],
        [tx("\"Lebih sabar\"", "\"Be more patient\""), tx("\"Hanya masuk setelah candle konfirmasi ditutup.\"", "\"Only enter after the confirmation candle closes.\""), tx("Persentase transaksi dengan konfirmasi", "Share of trades with confirmation")],
        [tx("\"Kendalikan emosi\"", "\"Control my emotions\""), tx("\"Jeda 30 menit setelah 2 rugi beruntun.\"", "\"A 30-minute break after 2 losses in a row.\""), tx("Transaksi dalam 30 menit setelah rugi = 0", "Trades within 30 minutes of a loss = 0")],
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Tentang menyalahkan diri", "About blaming yourself"),
      text: tx(
        "Kritik diri yang keras bukan tanda keseriusan; ia sering membuat orang menjauh dari jurnal. Perlakukan dirimu seperti rekan yang sedang kamu bimbing: jujur pada fakta, ramah pada orangnya. Setelah rugi beruntun, satu sumber menyarankan mengecilkan ukuran posisi hingga sekitar 50% dan hanya mengambil setup terbaik sebelum kembali ke ukuran normal.",
        "Harsh self-criticism isn't a sign of seriousness; it often drives people away from their journal. Treat yourself like a colleague you're mentoring: honest about the facts, kind to the person. After a losing streak, one source suggests cutting position size to about 50% and taking only the best setups before returning to normal size.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Mengapa \"keputusan buruk tetapi untung\" berbahaya?", "Why is \"bad decision but a win\" dangerous?"), a: tx("Menguatkan kebiasaan buruk secara semu; jika diulang, ekspektasinya negatif.", "It falsely rewards a bad habit; repeated, its expectancy is negative.") },
        { q: tx("4 kali FOMO (1R) dan 3 kali stop digeser (1,5R tambahan). Total kebocoran dan persentasenya?", "4 FOMO trades (1R) and 3 moved stops (1.5R extra). The total leak and shares?"), a: tx("8,5R: FOMO 47,1%, stop digeser 52,9%.", "8.5R: FOMO 47.1%, moved stops 52.9%.") },
        { q: tx("Mengapa meninjau transaksi yang menang juga penting?", "Why review winning trades too?"), a: tx("Untuk mempertahankan kebiasaan baik dan menemukan keputusan buruk yang tertutup hasil bagus.", "To keep good habits and find bad decisions hidden by good outcomes.") },
      ],
    },
  ],
  sources: [
    { title: "Trading review: learning from your mistakes", publisher: "CMC Markets", url: "https://www.cmcmarkets.com/en-au/cfd/learn/trading-strategies/learning-from-your-mistakes" },
    { title: "How to stop emotional trading", publisher: "TradeZella", url: "https://www.tradezella.com/blog/emotional-trading" },
    { title: "What to track in your trading journal", publisher: "FX Replay", url: "https://fxreplay.com/learn/what-to-track-in-your-trading-journal-for-better-results" },
  ],
}
