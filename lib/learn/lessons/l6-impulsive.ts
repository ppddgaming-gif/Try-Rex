import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "L6-2_Menghindari_Keputusan_Impulsif.pdf". Left out: the System 1
// biases and their replication caveat, the trigger table's research
// aside, the post-win vs post-loss table, "fast because trained", the
// emotional-trade tagging (L6-4 covers the journal), the four-week
// programme, and a vendor's unverified percentage claims.

export const impulsive: Lesson = {
  slug: "keputusan-impulsif",
  level: 6,
  minutes: 7,
  title: tx("Menghindari keputusan impulsif", "Avoiding impulsive decisions"),
  summary: tx(
    "Mengapa tangan kita lebih cepat daripada rencana, dan cara memberi jeda antara dorongan dan klik dengan alat yang sederhana.",
    "Why our hands are faster than our plans, and how to put a pause between the urge and the click with simple tools.",
  ),
  material: ["L6-2_Menghindari_Keputusan_Impulsif.pdf"],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Harga tiba-tiba melonjak. Dalam hitungan detik kamu sudah menekan tombol beli, tanpa gambar level, tanpa stop loss, tanpa menghitung lot. Sepuluh detik kemudian harga berbalik. Itulah keputusan impulsif: membuka, menambah, menggeser, atau menutup posisi tanpa melewati rencana tertulis, digerakkan oleh perasaan seperti takut ketinggalan, marah karena rugi, bangga karena baru menang, atau bosan menunggu.",
        "Price suddenly jumps. Within seconds you've pressed buy, with no levels drawn, no stop loss, no lot worked out. Ten seconds later price turns. That's an impulsive decision: opening, adding to, moving or closing a position without going through a written plan, driven by feelings like fear of missing out, anger at a loss, pride after a win, or boredom.",
      ),
    },
    {
      kind: "table",
      head: [tx("Tanda", "Sign"), tx("Pertanyaan pemeriksa", "Check question"), tx("Contoh", "Example")],
      rows: [
        [tx("Kecepatan", "Speed"), tx("Berapa lama dari ide sampai klik?", "How long from idea to click?"), tx("Kurang dari 30 detik, tanpa membuka daftar periksa", "Under 30 seconds, without opening the checklist")],
        [tx("Ukuran", "Size"), tx("Apakah lot lebih besar dari rencana?", "Is the lot bigger than planned?"), tx("Biasanya 0,05 lot, tiba-tiba 0,20 lot", "Usually 0.05 lots, suddenly 0.20")],
        [tx("Kriteria", "Criteria"), tx("Apakah ada aturan tertulis yang memicunya?", "Did a written rule trigger it?"), tx("Masuk hanya karena \"kelihatannya mau naik\"", "Entering just because \"it looks like it'll rise\"")],
        [tx("Waktu", "Timing"), tx("Kapan masuknya?", "When was the entry?"), tx("Tepat setelah rugi, atau di luar jam trading", "Right after a loss, or outside trading hours")],
      ],
      note: tx(
        "Kalau salah satu tanda terpenuhi, berhentilah sebentar dan periksa transaksinya sebelum menekan tombol. Tidak harus keempatnya muncul.",
        "If any one sign shows up, pause and check the trade before pressing the button. All four don't need to appear.",
      ),
    },
    {
      kind: "table",
      head: [tx("", ""), tx("Sistem 1 (cepat)", "System 1 (fast)"), tx("Sistem 2 (lambat)", "System 2 (slow)")],
      rows: [
        [tx("Sifat", "Nature"), tx("Otomatis, tanpa usaha, dipengaruhi emosi", "Automatic, effortless, swayed by emotion"), tx("Sengaja, butuh usaha, logis dan menghitung", "Deliberate, effortful, logical and calculating")],
        [tx("Contoh sehari-hari", "Everyday example"), tx("Menjawab 2 + 2", "Answering 2 + 2"), tx("Mengalikan 17 × 24", "Multiplying 17 × 24")],
        [tx("Dalam trading", "In trading"), tx("\"Harganya lari! Beli sekarang!\"", "\"It's running! Buy now!\""), tx("\"Apakah syarat masuk dalam rencanaku lengkap?\"", "\"Are my plan's entry conditions all met?\"")],
      ],
      note: tx(
        "Dua mode berpikir ini digambarkan Daniel Kahneman dalam Thinking, Fast and Slow. Keputusan impulsif adalah hasil Sistem 1. Daftar periksa, jeda, dan batas harian pada dasarnya adalah alat untuk memanggil Sistem 2 sebelum uang bergerak.",
        "Daniel Kahneman described these two modes in Thinking, Fast and Slow. Impulsive decisions come from System 1. Checklists, pauses and daily limits are essentially tools to call System 2 in before money moves.",
      ),
    },
    {
      kind: "table",
      head: [tx("Pemicu", "Trigger"), tx("Seperti apa rasanya", "What it feels like"), tx("Jebakan yang muncul", "The trap")],
      rows: [
        [tx("Candle besar mendadak", "A sudden big candle"), tx("Takut tertinggal pergerakan", "Fear of missing the move"), tx("Masuk telat di ujung gerakan (chasing)", "Entering late at the end of the move (chasing)")],
        [tx("Kerugian barusan", "A loss just now"), tx("Panas, tidak terima, ingin cepat impas", "Heated, unwilling to accept it, wanting to get even fast"), tx("Membalas dendam dengan lot lebih besar", "Revenge with a bigger lot")],
        [tx("Kemenangan beruntun", "A winning streak"), tx("Merasa jago dan kebal", "Feeling skilled and invincible"), tx("Menaikkan lot dan melonggarkan syarat", "Raising the lot and loosening the rules")],
        [tx("Bosan", "Boredom"), tx("Tidak ada setup, layar terasa sepi", "No setups, the screen feels empty"), tx("Masuk setup \"lumayan\" hanya untuk bergerak", "Taking an \"okay\" setup just to do something")],
        [tx("Media sosial dan grup", "Social media and groups"), tx("Orang lain pamer untung", "Others showing off profits"), tx("Ikut-ikutan tanpa analisis sendiri", "Following along without your own analysis")],
        [tx("Lelah atau lapar", "Tired or hungry"), tx("Sulit berpikir panjang", "Hard to think things through"), tx("Melewatkan daftar periksa", "Skipping the checklist")],
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Pola kaskade", "The cascade"),
      text: tx(
        "Kerugian emosional jarang berhenti pada satu transaksi. Kerugian pertama memicu frustrasi, frustrasi memicu transaksi balas dendam, dan balas dendam memicu transaksi berlebihan. Menghentikan rantai di mata rantai pertama jauh lebih murah daripada memutusnya di tengah.",
        "Emotional losses rarely stop at one trade. The first loss sparks frustration, frustration sparks a revenge trade, and revenge sparks overtrading. Stopping the chain at the first link is far cheaper than breaking it in the middle.",
      ),
    },

    { kind: "heading", text: tx("Ongkos perilaku keluar yang impulsif", "The cost of impulsive exits") },
    {
      kind: "p",
      text: tx(
        "R adalah satuan risiko: jika risiko per transaksi $10, maka 1R = $10. Misalkan strategi menang 45% dengan rasio 1:2 (menang +2R, kalah −1R). Sinyal dan tingkat menangnya tetap, hanya perilaku keluar yang berubah:",
        "R is a unit of risk: if you risk $10 per trade, 1R = $10. Say a strategy wins 45% with a 1:2 ratio (wins +2R, losses −1R). The signals and win rate stay the same; only the exit behaviour changes:",
      ),
    },
    {
      kind: "table",
      head: [tx("Skenario (20 transaksi)", "Scenario (20 trades)"), tx("Ekspektasi per transaksi", "Expectancy per trade"), tx("Total", "Total")],
      rows: [
        [tx("Patuh: menang +2R, kalah −1R", "Compliant: win +2R, lose −1R"), tx("0,45 × 2 − 0,55 × 1 = +0,35R", "0.45 × 2 − 0.55 × 1 = +0.35R"), tx("+7R", "+7R")],
        [tx("Takut: menang dipotong di +1R", "Fearful: wins cut at +1R"), tx("0,45 × 1 − 0,55 × 1 = −0,10R", "0.45 × 1 − 0.55 × 1 = −0.10R"), tx("−2R", "−2R")],
        [tx("Harapan: kalah dibiarkan sampai −2R", "Hopeful: losses left to −2R"), tx("0,45 × 2 − 0,55 × 2 = −0,20R", "0.45 × 2 − 0.55 × 2 = −0.20R"), tx("−4R", "−4R")],
      ],
      note: tx("Angka ini ilustrasi, bukan data pasar.", "These figures are illustrations, not market data."),
    },

    { kind: "heading", text: tx("Memberi jeda", "Building in a pause") },
    {
      kind: "table",
      head: [tx("Situasi", "Situation"), tx("Jeda yang disarankan", "Suggested pause")],
      rows: [
        [tx("Sebelum setiap entry", "Before every entry"), tx("Sekitar 15 detik untuk daftar periksa", "About 15 seconds for the checklist")],
        [tx("Setelah satu rugi yang terasa emosional", "After one loss that feels emotional"), tx("Sekitar 5 menit (hingga 30 menit)", "About 5 minutes (up to 30)")],
        [tx("Setelah 3 rugi beruntun", "After 3 losses in a row"), tx("30 menit jauh dari layar", "30 minutes away from the screen")],
        [tx("Setelah batas rugi harian tercapai", "After the daily loss limit"), tx("Berhenti sampai besok", "Stop until tomorrow")],
      ],
      note: tx(
        "Tuliskan jedanya dalam rencana dan gunakan timer di ponsel. Saat emosi memuncak, kamu justru merasa tidak perlu istirahat, dan \"kira-kira lima menit\" sering hanya 40 detik.",
        "Write the pause into your plan and use a phone timer. At the peak of emotion you feel you don't need a break, and \"about five minutes\" is often just 40 seconds.",
      ),
    },
    {
      kind: "steps",
      title: tx("Daftar periksa 15 detik sebelum entry (satu \"tidak\" berarti tidak masuk)", "A 15-second checklist before entry (one \"no\" means no entry)"),
      items: [
        tx("Apakah ini cocok dengan salah satu setup dalam rencanaku?", "Does this match one of the setups in my plan?"),
        tx("Apakah lot sudah dihitung dari risiko, bukan dari perasaan?", "Is the lot worked out from risk, not feelings?"),
        tx("Apakah stop loss berada di tempat yang masuk akal secara chart?", "Is the stop loss somewhere that makes sense on the chart?"),
        tx("Apakah aku masih berada dalam batas rugi harian?", "Am I still within my daily loss limit?"),
        tx("Apakah sudah lewat cukup waktu sejak transaksi terakhir ditutup (minimal 5 menit)?", "Has enough time passed since my last trade closed (at least 5 minutes)?"),
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Tiga pertanyaan saringan setelah rugi", "Three filter questions after a loss"),
      text: tx(
        "Apakah aku akan mengambil transaksi persis ini seandainya hari ini belum punya posisi sama sekali? Apakah ini ada dalam daftar setup dan memenuhi kriteria normal? Apakah aku memakai ukuran lot normal? Jika ada satu saja yang jawabannya \"tidak\", kemungkinan besar kamu sedang membalas dendam.",
        "Would I take exactly this trade if I'd had no position at all today? Is it on my setup list and meeting the normal criteria? Am I using my normal lot size? If any answer is \"no\", you're most likely taking revenge.",
      ),
    },
    {
      kind: "table",
      head: [tx("Pembatas otomatis", "Automatic limit"), tx("Cara kerja", "How it works"), tx("Contoh (rekaan)", "Example (made up)")],
      rows: [
        [tx("Stop loss keras", "Hard stop loss"), tx("Dipasang saat entry, tidak digeser menjauh", "Set at entry, never moved away"), tx("Stop 20 pip dengan risiko $10", "A 20-pip stop risking $10")],
        [tx("Batas rugi harian", "Daily loss limit"), tx("Berhenti ketika batas tercapai", "Stop when it's reached"), tx("2% dari saldo", "2% of the balance")],
        [tx("Batas jumlah transaksi", "Trade count limit"), tx("Maksimal transaksi per sesi", "A maximum per session"), tx("3 transaksi per hari", "3 trades a day")],
        [tx("Peringatan harga", "Price alerts"), tx("Memantau lewat alert, bukan menatap layar", "Watch with alerts, not by staring"), tx("Alert di area support dan resistance", "Alerts at support and resistance")],
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Sebutkan empat tanda transaksi mungkin emosional.", "Name four signs a trade may be emotional."), a: tx("Terlalu cepat, lot lebih besar dari rencana, tidak ada aturan yang memicu, waktu yang buruk.", "Too fast, a bigger lot than planned, no rule triggered it, bad timing.") },
        { q: tx("Strategi menang 40% dengan rasio 1:2. Ekspektasi? Jika kemenangan dipotong di +1R?", "A 40% win rate at 1:2. Expectancy? If wins are cut at +1R?"), a: tx("+0,20R; dipotong: 0,40 × 1 − 0,60 × 1 = −0,20R.", "+0.20R; cut: 0.40 × 1 − 0.60 × 1 = −0.20R.") },
        { q: tx("Mengapa jeda beberapa menit membantu?", "Why does a few minutes' pause help?"), a: tx("Emosi kuat bersifat sementara; jeda memberi waktu intensitasnya turun dan Sistem 2 sempat menilai.", "Strong emotions pass; a pause lets them fade and gives System 2 time to judge.") },
      ],
    },
  ],
  sources: [
    { title: "Thinking, Fast and Slow", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow" },
    { title: "How to stop emotional trading", publisher: "TradeZella", url: "https://www.tradezella.com/blog/emotional-trading" },
    { title: "How to stop revenge trading", publisher: "TradeZella", url: "https://www.tradezella.com/blog/revenge-trading" },
  ],
}
