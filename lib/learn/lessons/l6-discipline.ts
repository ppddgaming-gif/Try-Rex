import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "L6-1_Disiplin_Mengikuti_Rencana.pdf". Left out: the full example
// plan, the lot conversion (Level 3 covers it), the research on
// implementation intentions outside trading, the habits table, the flexibility
// table, the bias table (its biases appear across Level 6) and the four-week
// programme.

export const discipline: Lesson = {
  slug: "disiplin",
  level: 6,
  minutes: 8,
  title: tx("Disiplin mengikuti rencana", "The discipline to follow your plan"),
  summary: tx(
    "Cara melakukan hal yang sudah kamu putuskan saat tenang, pada saat emosimu sedang naik-turun.",
    "How to do what you decided while calm, at the moment your emotions are swinging.",
  ),
  material: ["L6-1_Disiplin_Mengikuti_Rencana.pdf"],
  blocks: [
    {
      kind: "callout",
      tone: "note",
      title: tx("Isi materi ini dalam satu paragraf", "This lesson in one paragraph"),
      text: tx(
        "Disiplin trading adalah melakukan hal yang sudah kamu putuskan saat tenang, pada saat kamu sedang tidak tenang. Otak manusia tidak dirancang untuk menghadapi kerugian uang secara santai, sehingga keputusan di tengah posisi yang bergerak hampir selalu lebih buruk daripada rencana yang ditulis lebih dulu. Cara terbaik membangun disiplin bukan dengan \"mengandalkan tekad\", melainkan dengan menulis rencana yang jelas, mengubahnya menjadi aturan jika-maka, memasang batas otomatis, dan mengukur seberapa patuh kamu dengan angka.",
        "Trading discipline is doing what you decided while calm, at a moment when you're not calm. The human brain isn't built to face losing money calmly, so decisions made while a position moves are almost always worse than a plan written beforehand. The best way to build discipline isn't \"relying on willpower\" but writing a clear plan, turning it into if-then rules, setting automatic limits, and measuring how well you comply with numbers.",
      ),
    },
    {
      kind: "table",
      head: [tx("Disiplin itu", "Discipline is"), tx("Disiplin itu bukan", "Discipline is not")],
      rows: [
        [tx("Mengambil posisi hanya ketika syarat masuk yang sudah ditulis terpenuhi", "Taking a position only when the written entry conditions are met"), tx("Selalu menang. Kamu bisa sangat disiplin dan tetap rugi pada satu transaksi", "Always winning. You can be very disciplined and still lose a trade")],
        [tx("Memasang stop loss di tempat yang direncanakan dan tidak menggesernya menjauh", "Setting the stop loss where planned and not moving it away"), tx("Kaku tanpa belajar. Rencana boleh diperbaiki pada waktu yang tepat, bukan di tengah transaksi", "Rigid with no learning. The plan can be improved at the right time, not mid-trade")],
        [tx("Memakai ukuran posisi sesuai batas risiko, bukan perasaan hari itu", "Sizing by your risk limit, not by the day's mood"), tx("Menekan semua emosi. Takut dan serakah tetap muncul; tindakanmu tidak dikendalikan olehnya", "Suppressing every emotion. Fear and greed still come; your actions just aren't run by them")],
        [tx("Berhenti ketika batas harian tercapai, dan mencatat hasil dengan jujur", "Stopping at the daily limit, and recording results honestly"), tx("Menghukum diri. Kalau melanggar, tugasnya mencatat dan memperbaiki sistem", "Punishing yourself. If you break a rule, the job is to record it and fix the system")],
      ],
    },

    { kind: "heading", text: tx("Mengapa disiplin begitu sulit?", "Why is discipline so hard?") },
    {
      kind: "points",
      items: [
        tx("Rasa takut rugi: harga mendekati stop loss, kamu menggesernya \"biar tidak kena\".", "Fear of losing: price nears the stop loss and you move it \"so it doesn't get hit\"."),
        tx("Butuh usaha: mengikuti aturan menghabiskan tenaga mental. Saat lelah, kualitas keputusan turun.", "It takes effort: following rules uses mental energy. When tired, decisions get worse."),
        tx("Watak yang tidak suka aturan: \"aturan saya sendiri yang buat, jadi boleh saya langgar.\"", "A dislike of rules: \"I made these rules, so I can break them.\""),
        tx("Rencana terasa kaku: setup kedua \"hampir sama\" dengan rencana, lalu kamu masuk saja.", "The plan feels rigid: a second setup is \"almost the same\" as the plan, so you take it anyway."),
      ],
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Loss aversion dan disposition effect", "Loss aversion and the disposition effect"),
      text: tx(
        "Daniel Kahneman dan Amos Tversky memperkenalkan loss aversion pada 1979: kerugian terasa lebih berat daripada keuntungan dengan nilai yang sama. Akibatnya dalam trading: kamu cenderung memegang posisi rugi terlalu lama dan menjual posisi untung terlalu cepat. Pola ini disebut disposition effect. Studi Terrance Odean (1998) terhadap sekitar 10.000 akun broker menemukan saham yang sedang untung kira-kira 60% lebih mungkin dijual daripada saham yang sedang rugi.",
        "Daniel Kahneman and Amos Tversky introduced loss aversion in 1979: a loss feels heavier than a gain of the same size. In trading, the result is holding losing positions too long and selling winners too soon. This pattern is called the disposition effect. Terrance Odean's 1998 study of about 10,000 brokerage accounts found winning stocks were roughly 60% more likely to be sold than losing ones.",
      ),
    },

    { kind: "heading", text: tx("Rencana trading: dokumen sebelum klik pertama", "The trading plan: a document before the first click") },
    {
      kind: "p",
      text: tx(
        "Kamu tidak bisa disiplin pada sesuatu yang kabur. Kalimat seperti \"beli kalau terlihat naik\" tidak bisa dilanggar dan tidak bisa dipatuhi, karena tidak ada ukurannya. Rencana yang baik spesifik sampai pihak lain bisa menilai apakah kamu mematuhinya atau tidak.",
        "You can't be disciplined about something vague. A sentence like \"buy if it looks like it's rising\" can neither be broken nor followed, because it has no measure. A good plan is specific enough that someone else could judge whether you followed it.",
      ),
    },
    {
      kind: "table",
      head: [tx("Bagian", "Section"), tx("Pertanyaan yang harus terjawab", "The question it must answer"), tx("Contoh isian", "Example")],
      rows: [
        [tx("Pair dan sesi", "Pair and session"), tx("Apa yang diperdagangkan dan kapan?", "What is traded and when?"), tx("EUR/USD dan GBP/USD, sesi London", "EUR/USD and GBP/USD, London session")],
        [tx("Kondisi pasar", "Market condition"), tx("Pasar seperti apa yang cocok dengan strategi?", "What kind of market suits the strategy?"), tx("Hanya saat tren jelas pada H1, hindari sideways", "Only a clear H1 trend; avoid sideways")],
        [tx("Syarat masuk", "Entry conditions"), tx("Kondisi apa yang harus lengkap?", "What must all be in place?"), tx("Memantul di area support + candle konfirmasi + searah tren", "A bounce at support + a confirmation candle + with the trend")],
        [tx("Stop loss", "Stop loss"), tx("Di mana dan berapa jaraknya?", "Where, and how far?"), tx("Di bawah low candle konfirmasi, maksimal 25 pip", "Below the confirmation candle's low, at most 25 pips")],
        [tx("Target", "Target"), tx("Di mana ambil untung, dan berapa rasionya?", "Where to take profit, and at what ratio?"), tx("Minimal 1:2, di resistance terdekat", "At least 1:2, at the nearest resistance")],
        [tx("Ukuran posisi", "Position size"), tx("Berapa risiko per transaksi?", "How much risk per trade?"), tx("1% dari saldo (tetap, tidak naik setelah menang)", "1% of the balance (fixed, not raised after wins)")],
        [tx("Batas harian", "Daily limit"), tx("Kapan berhenti untuk hari itu?", "When to stop for the day?"), tx("Rugi 2% atau 3 transaksi, mana lebih dulu", "A 2% loss or 3 trades, whichever comes first")],
        [tx("Hal yang dilarang", "Forbidden"), tx("Apa yang tidak boleh dilakukan dalam keadaan apa pun?", "What must never be done?"), tx("Menggeser stop menjauh, menambah posisi rugi, trading saat berita besar", "Moving the stop away, adding to a loser, trading on big news")],
      ],
      note: tx(
        "Daftar larangan adalah pagar paling berguna: saat panik, menolak sesuatu yang sudah dilarang tertulis jauh lebih mudah daripada memutuskan apa yang boleh.",
        "The forbidden list is the most useful fence: in a panic, refusing something already forbidden in writing is far easier than deciding what's allowed.",
      ),
    },

    { kind: "heading", text: tx("Biaya nyata dari satu kali melanggar aturan", "The real cost of breaking a rule") },
    {
      kind: "table",
      head: [tx("Skenario (10 transaksi: 4 untung, 6 rugi; risiko $10, rasio 1:2)", "Scenario (10 trades: 4 wins, 6 losses; risk $10, 1:2 ratio)"), tx("Rincian", "Breakdown"), tx("Hasil", "Result")],
      rows: [
        [tx("A. Patuh pada rencana", "A. Following the plan"), tx("4 × (+20) + 6 × (−10) = 80 − 60", "4 × (+20) + 6 × (−10) = 80 − 60"), tx("+$20", "+$20")],
        [tx("B. Dua stop digeser menjauh, keduanya rugi $30", "B. Two stops moved away, each losing $30"), tx("4 × (+20) + 4 × (−10) + 2 × (−30) = 80 − 40 − 60", "4 × (+20) + 4 × (−10) + 2 × (−30) = 80 − 40 − 60"), tx("−$20", "−$20")],
      ],
      note: tx(
        "Hanya dua pelanggaran dari sepuluh transaksi mengubah hasil dari plus $20 menjadi minus $20. Strateginya sama persis; yang berbeda hanya kepatuhan.",
        "Just two violations in ten trades turn +$20 into −$20. The strategy is exactly the same; only the compliance differs.",
      ),
    },

    { kind: "heading", text: tx("Aturan jika-maka", "If-then rules") },
    {
      kind: "p",
      text: tx(
        "Psikolog Peter Gollwitzer memperkenalkan konsep implementation intention pada 1999: rencana berbentuk \"Jika situasi X terjadi, maka saya akan melakukan Y\". Alih-alih hanya berniat, kamu menentukan pemicu dan respons yang konkret, sehingga hubungan keduanya cenderung berjalan hampir otomatis.",
        "Psychologist Peter Gollwitzer introduced implementation intentions in 1999: plans of the form \"If situation X happens, then I will do Y\". Instead of just intending, you set a concrete trigger and response, so the link between them tends to run almost automatically.",
      ),
    },
    {
      kind: "table",
      head: [tx("Jika (pemicu)", "If (trigger)"), tx("Maka (tindakan yang sudah ditentukan)", "Then (the action decided in advance)")],
      rows: [
        [tx("Harga mendekati stop loss dan jantungku berdebar", "Price nears the stop loss and my heart races"), tx("Aku tidak menyentuh stop loss. Aku berdiri, minum air, dan menunggu hasilnya.", "I don't touch the stop loss. I stand up, drink some water and wait for the result.")],
        [tx("Aku melewatkan entry karena terlambat", "I missed the entry by being late"), tx("Aku menutup chart pair itu selama 30 menit. Entry yang terlewat dianggap tidak ada.", "I close that pair's chart for 30 minutes. A missed entry doesn't exist.")],
        [tx("Dua transaksi berturut-turut rugi", "Two losses in a row"), tx("Aku berhenti 30 menit dan mengisi jurnal sebelum boleh membuka posisi baru.", "I stop for 30 minutes and fill in my journal before I may open anything new.")],
        [tx("Batas rugi harian tercapai", "The daily loss limit is reached"), tx("Aku menutup platform dan menulis satu kalimat refleksi.", "I close the platform and write one sentence of reflection.")],
      ],
      note: tx(
        "Tulis saat tenang, bukan saat trading. Pemicunya harus bisa dikenali, tindakannya kecil dan pasti, dan mulai dari tiga aturan saja.",
        "Write them while calm, not while trading. The trigger must be recognisable, the action small and certain, and start with just three rules.",
      ),
    },

    { kind: "heading", text: tx("Mengukur disiplin dengan angka: skor kepatuhan", "Measuring discipline: a compliance score") },
    {
      kind: "calc",
      title: tx("Contoh hitungan skor kepatuhan (rekaan)", "A compliance score example (made up)"),
      lines: [
        tx("Satu minggu: 20 transaksi, 17 memenuhi semua syarat rencana", "One week: 20 trades, 17 met every condition of the plan"),
        tx("Skor kepatuhan = 17 ÷ 20 = 85%", "Compliance score = 17 ÷ 20 = 85%"),
        tx("Tiga pelanggaran: dua kali menggeser stop menjauh, satu kali masuk tanpa konfirmasi. Fokus minggu depan: satu aturan saja.", "Three violations: moving the stop away twice, entering without confirmation once. Next week's focus: just one rule."),
      ],
    },
    {
      kind: "table",
      head: [tx("Skor kepatuhan", "Compliance score"), tx("Artinya", "Meaning"), tx("Langkah berikutnya", "Next step")],
      rows: [
        [tx("90% ke atas", "90% and above"), tx("Eksekusi sangat baik", "Very good execution"), tx("Hasil bisa dipakai untuk menilai strategi (dengan sampel cukup)", "Results can be used to judge the strategy (with enough samples)")],
        [tx("75%–89%", "75%–89%"), tx("Cukup baik, masih ada kebocoran", "Fairly good, still leaking"), tx("Pilih satu pelanggaran paling sering untuk diperbaiki", "Pick the most frequent violation to fix")],
        [tx("Di bawah 75%", "Below 75%"), tx("Masalah ada pada eksekusi", "The problem is execution"), tx("Jangan ubah strategi dulu. Perkuat aturan, kecilkan lot, kurangi jam trading", "Don't change the strategy yet. Strengthen the rules, cut the lot, trade fewer hours")],
      ],
      note: tx(
        "Simpan dua kolom terpisah di jurnal: hasil (untung atau rugi) dan kepatuhan (ya atau tidak). \"Melanggar tetapi untung\" adalah yang paling berbahaya, karena memberi penguatan semu pada kebiasaan buruk.",
        "Keep two separate columns in your journal: result (win or loss) and compliance (yes or no). \"Broke the rules but won\" is the most dangerous, because it falsely rewards a bad habit.",
      ),
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Di Akun Demo TRY-REX", "In the TRY-REX Demo Account"),
      text: tx(
        "Skor Disiplin di Akun Demo menilai proses setiap trade (stop loss, risiko, rencana, revenge trading), bukan hasilnya. Itu bentuk skor kepatuhan yang dihitung otomatis.",
        "The Disiplin score in the Demo Account judges each trade's process (stop loss, risk, plan, revenge trading), not its result. It's a compliance score worked out for you.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Mengapa \"beli kalau terlihat naik\" bukan rencana yang baik?", "Why is \"buy if it looks like it's rising\" not a good plan?"), a: tx("Tidak ada ukuran yang jelas, sehingga kepatuhannya tidak bisa diperiksa.", "It has no clear measure, so compliance can't be checked.") },
        { q: tx("4 untung (+$30) dan 6 rugi (−$15). Hasil jika patuh? Jika 2 rugi ditahan sampai −$45?", "4 wins (+$30) and 6 losses (−$15). Result if compliant? If 2 losses are held to −$45?"), a: tx("Patuh: 120 − 90 = +30. Dengan pelanggaran: 120 − (4 × 15 + 2 × 45) = −30.", "Compliant: 120 − 90 = +30. With violations: 120 − (4 × 15 + 2 × 45) = −30.") },
        { q: tx("20 transaksi, 14 sesuai rencana. Skor dan tafsirnya?", "20 trades, 14 by the plan. The score and what it means?"), a: tx("70%: di bawah 75%, perkuat eksekusi dulu sebelum mengganti strategi.", "70%: below 75%, fix execution before changing the strategy.") },
      ],
    },
  ],
  sources: [
    { title: "The quest for discipline", publisher: "Zerodha Varsity", url: "https://zerodha.com/varsity/chapter/the-quest-for-discipline/" },
    { title: "Loss aversion (Kahneman dan Tversky, 1979)", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Loss_aversion" },
    { title: "Disposition effect (Odean, 1998)", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Disposition_effect" },
    { title: "Implementation intention (Gollwitzer)", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Implementation_intention" },
    { title: "Tips to keep a trading journal", publisher: "TradeZella", url: "https://www.tradezella.com/blog/trading-journal-tips" },
  ],
}
