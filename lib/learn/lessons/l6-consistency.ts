import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "L6-6_Mengukur_Konsistensi_dengan_Data.pdf". Left out for beginners:
// the standard-error formula and its table, the streak-in-100-trades
// figures, the sensitivity tests, the decision rules, the mistakes table and
// the four-week programme.

export const consistency: Lesson = {
  slug: "konsistensi-data",
  level: 6,
  minutes: 7,
  title: tx("Mengukur konsistensi melalui data, bukan satu hasil", "Measuring consistency through data, not one result"),
  summary: tx(
    "Mengapa satu hasil menyesatkan, berapa banyak data yang cukup, dan angka apa saja yang layak dipercaya untuk menilai dirimu sebagai trader.",
    "Why one result misleads, how much data is enough, and which numbers are worth trusting to judge yourself as a trader.",
  ),
  material: ["L6-6_Mengukur_Konsistensi_dengan_Data.pdf"],
  blocks: [
    {
      kind: "callout",
      tone: "note",
      title: tx("Isi materi ini dalam satu paragraf", "This lesson in one paragraph"),
      text: tx(
        "Hasil satu transaksi, satu hari, bahkan satu minggu sangat dipengaruhi keberuntungan. Strategi yang baik pun akan sering mengalami rugi beruntun, dan strategi buruk pun bisa mengalami untung beruntun. Karena itu konsistensi dinilai dari ekspektasi, jumlah sampel, kestabilan angka saat data bertambah, dan drawdown, disertai kepatuhan pada rencana. Setiap klaim sebaiknya sebesar bukti yang ada.",
        "The result of one trade, one day, even one week is heavily affected by luck. Even a good strategy will often have losing streaks, and a bad one can have winning streaks. So consistency is judged by expectancy, sample size, how stable the numbers are as data grows, and drawdown, along with compliance with the plan. Every claim should be only as big as the evidence.",
      ),
    },
    {
      kind: "table",
      head: [tx("Yang kamu lihat", "What you see"), tx("Penafsiran keliru", "The wrong reading"), tx("Penafsiran yang lebih tepat", "A better reading")],
      rows: [
        [tx("5 menang berturut-turut", "5 wins in a row"), tx("\"Aku sudah ahli.\"", "\"I'm an expert now.\""), tx("Bisa saja strategi biasa dan sedang beruntung.", "It may be an ordinary strategy on a lucky run.")],
        [tx("5 kalah berturut-turut", "5 losses in a row"), tx("\"Strategiku rusak.\"", "\"My strategy is broken.\""), tx("Rugi beruntun normal pada strategi mana pun.", "Losing streaks are normal for any strategy.")],
        [tx("Untung besar minggu ini", "A big profit this week"), tx("\"Aku siap menaikkan lot.\"", "\"I'm ready to raise my lot.\""), tx("Satu minggu terlalu sedikit untuk menilai keunggulan.", "One week is too little to judge an edge.")],
        [tx("Rugi besar bulan ini", "A big loss this month"), tx("\"Ganti strategi.\"", "\"Change strategy.\""), tx("Periksa dulu kepatuhan dan jumlah sampel.", "Check compliance and sample size first.")],
      ],
    },

    { kind: "heading", text: tx("Ekspektasi dan hukum bilangan besar", "Expectancy and the law of large numbers") },
    {
      kind: "p",
      text: tx(
        "Dadu enam sisi yang adil memiliki nilai harapan (1+2+3+4+5+6) ÷ 6 = 3,5. Satu lemparan tidak pernah menghasilkan 3,5, tetapi rata-rata banyak lemparan mendekati 3,5. Gagasan ini dikenal sebagai hukum bilangan besar. Dalam trading, nilai harapan per transaksi disebut ekspektasi: win rate × rata-rata menang − (1 − win rate) × rata-rata kalah. Contoh: menang 45%, rata-rata menang 2R, kalah 1R → 0,45 × 2 − 0,55 × 1 = +0,35R per transaksi, dalam jangka panjang.",
        "A fair six-sided die has an expected value of (1+2+3+4+5+6) ÷ 6 = 3.5. No single roll gives 3.5, but the average of many rolls approaches it. This is the law of large numbers. In trading, the expected value per trade is called expectancy: win rate × average win − (1 − win rate) × average loss. Example: 45% wins, an average win of 2R, losses of 1R → 0.45 × 2 − 0.55 × 1 = +0.35R per trade, over the long run.",
      ),
    },

    { kind: "heading", text: tx("Rugi beruntun itu normal", "Losing streaks are normal") },
    {
      kind: "table",
      head: [tx("Win rate", "Win rate"), tx("Peluang 3 rugi beruntun", "Chance of 3 losses in a row"), tx("5 rugi beruntun", "5 in a row"), tx("7 rugi beruntun", "7 in a row")],
      rows: [
        [tx("40%", "40%"), tx("21,6%", "21.6%"), tx("7,8%", "7.8%"), tx("2,8%", "2.8%")],
        [tx("50%", "50%"), tx("12,5%", "12.5%"), tx("3,1%", "3.1%"), tx("0,8%", "0.8%")],
        [tx("60%", "60%"), tx("6,4%", "6.4%"), tx("1,0%", "1.0%"), tx("0,2%", "0.2%")],
      ],
      note: tx(
        "Peluang kalah n kali berturut-turut = (peluang kalah) pangkat n, untuk satu rangkaian tertentu. Dalam 100 transaksi ada banyak titik awal, sehingga pada strategi dengan win rate 40% hampir pasti kamu mengalami lima rugi beruntun. Tahu lebih dulu membuatmu bisa tetap patuh.",
        "The chance of losing n times in a row = (chance of a loss) to the power n, for one particular run. Over 100 trades there are many starting points, so with a 40% win rate you'll almost certainly see five losses in a row. Knowing this in advance helps you stay disciplined.",
      ),
    },
    {
      kind: "table",
      head: [tx("Jumlah transaksi (strategi 45% menang, 1:2)", "Number of trades (45% wins, 1:2)"), tx("Rata-rata total", "Average total"), tx("Rentang 90% hasil", "90% range of results"), tx("Peluang total di bawah nol", "Chance of a total below zero")],
      rows: [
        [tx("20", "20"), tx("sekitar +7R", "about +7R"), tx("−5R sampai +19R", "−5R to +19R"), tx("sekitar 13%", "about 13%")],
        [tx("100", "100"), tx("sekitar +35R", "about +35R"), tx("+11R sampai +59R", "+11R to +59R"), tx("sekitar 1%", "about 1%")],
        [tx("400", "400"), tx("sekitar +140R", "about +140R"), tx("+92R sampai +191R", "+92R to +191R"), tx("hampir 0%", "almost 0%")],
      ],
      note: tx(
        "Hasil simulasi komputer 20.000 kali oleh penulis materi, dengan asumsi transaksi saling bebas. Dengan hanya 20 transaksi, strategi yang sebenarnya untung masih berpeluang sekitar 13% menunjukkan hasil negatif.",
        "From the handout author's computer simulation run 20,000 times, assuming independent trades. With only 20 trades, a strategy that really is profitable still has about a 13% chance of showing a loss.",
      ),
    },
    {
      kind: "table",
      head: [tx("Jumlah transaksi", "Number of trades"), tx("Klaim yang masih wajar", "A fair claim"), tx("Klaim yang terlalu berani", "Too bold a claim")],
      rows: [
        [tx("Kurang dari 30", "Fewer than 30"), tx("\"Aku belajar mengikuti rencana.\"", "\"I'm learning to follow my plan.\""), tx("\"Strategiku untung.\"", "\"My strategy is profitable.\"")],
        [tx("30–100", "30–100"), tx("\"Hasil awal menjanjikan, perlu diuji lebih lama.\"", "\"Early results look promising; it needs longer testing.\""), tx("\"Aku siap menaikkan risiko.\"", "\"I'm ready to raise my risk.\"")],
        [tx("100–200", "100–200"), tx("\"Ada indikasi keunggulan dan pola perilaku.\"", "\"There are signs of an edge and of behaviour patterns.\""), tx("\"Keunggulanku pasti stabil di semua kondisi.\"", "\"My edge is surely stable in every condition.\"")],
        [tx("200 atau lebih, beragam kondisi", "200 or more, varied conditions"), tx("\"Keunggulan cukup terbukti pada kondisi yang diuji.\"", "\"The edge is fairly proven in the conditions tested.\""), tx("\"Tidak akan pernah mengalami drawdown besar.\"", "\"I'll never have a big drawdown.\"")],
      ],
    },

    { kind: "heading", text: tx("Kestabilan: apakah angkanya berhenti berubah-ubah?", "Stability: have the numbers stopped jumping?") },
    {
      kind: "table",
      head: [tx("Blok (25 transaksi)", "Block (25 trades)"), tx("Ekspektasi blok", "Block expectancy"), tx("Ekspektasi kumulatif", "Cumulative expectancy")],
      rows: [
        [tx("Blok 1 (1–25)", "Block 1 (1–25)"), tx("+0,80R", "+0.80R"), tx("+0,80R", "+0.80R")],
        [tx("Blok 2 (26–50)", "Block 2 (26–50)"), tx("−0,10R", "−0.10R"), tx("+0,35R", "+0.35R")],
        [tx("Blok 3 (51–75)", "Block 3 (51–75)"), tx("+0,30R", "+0.30R"), tx("+0,33R", "+0.33R")],
        [tx("Blok 4 (76–100)", "Block 4 (76–100)"), tx("+0,20R", "+0.20R"), tx("+0,30R", "+0.30R")],
      ],
      note: tx(
        "Blok pertama yang sangat bagus (+0,80R) membuat kita terlalu optimis, lalu angkanya turun dan mengerucut ke sekitar +0,30R. Jika kamu berhenti menghitung setelah blok 1, kamu akan salah menilai.",
        "The very good first block (+0.80R) makes us too optimistic; then the number falls and settles around +0.30R. Stop counting after block 1 and you'd misjudge it.",
      ),
    },

    { kind: "heading", text: tx("Drawdown dan matematika pemulihan", "Drawdown and the maths of recovery") },
    {
      kind: "table",
      head: [tx("Drawdown", "Drawdown"), tx("Untung yang dibutuhkan untuk impas", "Gain needed to break even")],
      rows: [
        [tx("10%", "10%"), tx("11,1%", "11.1%")],
        [tx("20%", "20%"), tx("25,0%", "25.0%")],
        [tx("30%", "30%"), tx("42,9%", "42.9%")],
        [tx("50%", "50%"), tx("100%", "100%")],
        [tx("60%", "60%"), tx("150%", "150%")],
      ],
      note: tx(
        "Rumus: 1 ÷ (1 − drawdown) − 1. Karena itu risiko per transaksi kecil (misalnya 0,5%–1%) dan stop loss di setiap transaksi menjadi fondasi konsistensi. Hindari strategi yang risikonya tak terbatas seperti martingale (menggandakan posisi setelah rugi): satu rangkaian rugi bisa menghabiskan akun.",
        "Formula: 1 ÷ (1 − drawdown) − 1. That's why a small risk per trade (for example 0.5%–1%) and a stop loss on every trade are the foundation of consistency. Avoid strategies with unlimited risk such as martingale (doubling up after a loss): one losing run can wipe out the account.",
      ),
    },
    {
      kind: "table",
      head: [tx("", ""), tx("Trader A", "Trader A"), tx("Trader B", "Trader B")],
      rows: [
        [tx("Jumlah transaksi", "Number of trades"), tx("12", "12"), tx("120", "120")],
        [tx("Total hasil", "Total result"), tx("+9R", "+9R"), tx("+30R", "+30R")],
        [tx("Win rate", "Win rate"), tx("75%", "75%"), tx("42%", "42%")],
        [tx("Ekspektasi per transaksi", "Expectancy per trade"), tx("+0,75R", "+0.75R"), tx("+0,25R", "+0.25R")],
        [tx("Max drawdown", "Max drawdown"), tx("Belum pernah mengalami penurunan berarti", "Never had a meaningful drop"), tx("9R, sempat memicu keraguan", "9R, which caused some doubt")],
        [tx("Skor kepatuhan", "Compliance score"), tx("Tidak dicatat", "Not recorded"), tx("88%", "88%")],
        [tx("Rentang win rate sebenarnya (kira-kira)", "Likely true win rate (roughly)"), tx("50%–99%", "50%–99%"), tx("33%–51%", "33%–51%")],
      ],
      note: tx(
        "Trader A terlihat lebih hebat dari sisi angka, tetapi 12 transaksi terlalu sedikit untuk menilai. Bukti Trader B jauh lebih kuat meski angkanya kelihatan lebih kecil.",
        "Trader A looks better on paper, but 12 trades are too few to judge. Trader B's evidence is far stronger, even though the numbers look smaller.",
      ),
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Setelah Level 6", "After Level 6"),
      text: tx(
        "Langkah berikutnya bukan membaca lebih banyak, melainkan mengumpulkan data dari praktikmu sendiri: 100 transaksi di Akun Demo dengan rencana tertulis, risiko 1%, jurnal lengkap, dan tinjauan mingguan.",
        "The next step isn't more reading but gathering data from your own practice: 100 trades in the Demo Account with a written plan, 1% risk, a full journal and a weekly review.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Menang 40%, rata-rata menang 2,5R, kalah 1R. Ekspektasi?", "40% wins, average win 2.5R, loss 1R. Expectancy?"), a: tx("0,4 × 2,5 − 0,6 × 1 = +0,4R per transaksi.", "0.4 × 2.5 − 0.6 × 1 = +0.4R per trade.") },
        { q: tx("Saldo naik ke 2.000 lalu turun ke 1.500. Drawdown dan untung untuk kembali?", "Balance rises to 2,000 then falls to 1,500. Drawdown and the gain to recover?"), a: tx("Drawdown 25%; untung dibutuhkan 500 ÷ 1.500 = 33,3%.", "A 25% drawdown; the gain needed is 500 ÷ 1,500 = 33.3%.") },
        { q: tx("Mengapa 20 transaksi sering tidak cukup menilai strategi?", "Why are 20 trades often not enough to judge a strategy?"), a: tx("Variasi acak masih besar; strategi yang untung bisa menunjukkan hasil negatif.", "Random variation is still large; a profitable strategy can show a loss.") },
      ],
    },
  ],
  sources: [
    { title: "How much data is enough to trust a trading strategy?", publisher: "MQL5", url: "https://www.mql5.com/en/blogs/post/775592" },
    { title: "Drawdown", publisher: "Turtle Trading Wiki", url: "https://wiki.turtletrading.vn/concepts/drawdown" },
    { title: "Expected value", publisher: "Wikipedia", url: "https://en.wikipedia.org/wiki/Expected_value" },
  ],
}
