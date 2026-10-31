import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "Risiko dan Potensi Kerugian.pdf", "Panduan Perlindungan Modal
// Forex.pdf" and "Drawdown dan Risiko Likuidasi.pdf". Left out: averaging,
// switching, pyramiding and martingale (the first handout's techniques that
// add to or reverse losing positions, which the other handouts warn
// against), the statistics chapters of the guide, and the promotional parts
// of the drawdown article.

export const riskAndLoss: Lesson = {
  slug: "risiko-kerugian",
  level: 3,
  minutes: 6,
  title: tx("Risiko dan potensi kerugian", "Risk and potential loss"),
  summary: tx(
    "Risiko tidak bisa ditiadakan, tetapi bisa dikendalikan: berapa yang boleh hilang per transaksi, dan kapan berhenti.",
    "Risk can't be removed, but it can be controlled: how much may be lost per trade, and when to stop.",
  ),
  material: ["Risiko dan Potensi Kerugian.pdf", "Panduan Perlindungan Modal Forex.pdf"],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Risiko adalah faktor penyerta dari setiap bisnis. Trading forex merupakan bentuk bisnis yang mengandung potensi risiko yang cukup tinggi. Meskipun risiko tidak bisa ditiadakan, risiko tetap bisa dikendalikan. Tidak ada orang yang tahu keadaan pasar di masa depan dan ke mana harga akan bergerak.",
        "Risk comes with every business. Forex trading is a business with a fairly high potential risk. Although risk cannot be removed, it can still be controlled. Nobody knows what the market will do in the future or where price will go.",
      ),
    },
    {
      kind: "callout",
      tone: "note",
      title: tx("Gambaran nyata: banyak akun ritel merugi", "The real picture: many retail accounts lose"),
      text: tx(
        "Dalam pengumuman 27 Maret 2018, regulator Eropa ESMA melaporkan bahwa 74% sampai 89% akun CFD ritel merugi, menurut analisis para pengawas nasional di berbagai negara. Ini potret historis akun, bukan peluang rugi kamu pribadi. Fungsinya hanya mengingatkan bahwa produk ini perlu ditangani dengan hati-hati.",
        "In an announcement on 27 March 2018, the European regulator ESMA reported that 74% to 89% of retail CFD accounts lose money, according to analysis by national supervisors in several countries. This is a historical picture of accounts, not your personal chance of losing. Its only purpose is to remind you that these products need careful handling.",
      ),
    },

    { kind: "heading", text: tx("Dua keputusan yang sering dicampur aduk", "Two decisions that often get mixed up") },
    {
      kind: "table",
      head: [tx("", ""), tx("Keputusan 1: strategi", "Decision 1: strategy"), tx("Keputusan 2: perlindungan modal", "Decision 2: protecting capital")],
      rows: [
        [tx("Pertanyaannya", "The question"), tx("Apakah cara mainku menghasilkan rata-rata untung setelah semua biaya?", "Does my approach make an average profit after all costs?"), tx("Kalau kerugian menumpuk, apakah akunku masih sanggup lanjut?", "If losses pile up, can my account still carry on?")],
        [tx("Yang diatur", "What it sets"), tx("Kapan dan pada apa kamu masuk, di mana kamu keluar.", "When and on what you enter, where you exit."), tx("Berapa yang boleh hilang, kapan berhenti, kapan boleh kembali.", "How much may be lost, when to stop, when you may return.")],
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Analogi: mobil balap", "An analogy: a racing car"),
      text: tx(
        "Strategi itu mesin. Perlindungan modal itu sabuk pengaman, rem, dan batas kecepatan di tikungan. Mesin kencang tanpa rem tetap berakhir di tembok. Sebaliknya, rem terbaik di dunia tidak membuat mobil rusak bisa menang balapan.",
        "Strategy is the engine. Protecting capital is the seat belt, the brakes and the speed limit on corners. A fast engine with no brakes still ends up in the wall. And the best brakes in the world won't make a broken car win the race.",
      ),
    },
    {
      kind: "points",
      title: tx("Dua kesalahpahaman", "Two misunderstandings"),
      items: [
        tx("\"Kalau taruhannya kecil, aku pasti aman.\" Tidak. Jika rata-rata hasil per transaksi negatif, taruhan kecil hanya membuat kerugian datang lebih lambat.", "\"If my bets are small, I'm safe.\" No. If the average result per trade is negative, small bets only make the loss arrive more slowly."),
        tx("\"Kalau strategiku untung, aku pasti selamat.\" Tidak. Rata-rata positif tidak mencegah rentetan rugi yang besar.", "\"If my strategy is profitable, I'm bound to survive.\" No. A positive average does not prevent a long run of losses."),
      ],
    },

    { kind: "heading", text: tx("Cut loss", "Cut loss") },
    {
      kind: "p",
      text: tx(
        "Cut loss dilakukan dengan cara menutup transaksi yang merugi sesegera mungkin dengan tujuan untuk menghindari risiko kerugian yang lebih besar. Contoh: kamu sell 1 lot di 1.50000, tetapi harga justru naik ke 1.50500. Karena tidak ingin menghadapi kerugian yang lebih besar, posisi ditutup di 1.50500 dengan konsekuensi rugi 50 pip.",
        "Cutting a loss means closing a losing trade as soon as possible to avoid a bigger loss. Example: you sell 1 lot at 1.50000, but price rises to 1.50500 instead. Because you don't want to face a bigger loss, you close the position at 1.50500 and accept a 50-pip loss.",
      ),
    },

    { kind: "heading", text: tx("Besarnya risiko per trade", "How much to risk per trade") },
    {
      kind: "p",
      text: tx(
        "Besar risiko per trade diukur dengan nilai uang, bukan dengan pip, dan biasanya ditentukan dalam persentase dari modal. Misalnya modal $10.000 dengan risiko maksimal 5% per trade: kerugian maksimal satu transaksi adalah $500. Kalau transaksi pertama rugi, modal tersisa $9.500, dan risiko maksimal berikutnya menjadi 5% × $9.500 = $475, begitu seterusnya.",
        "Risk per trade is measured in money, not pips, and is usually set as a percentage of capital. For example, $10,000 of capital with at most 5% risk per trade: the most one trade can lose is $500. If the first trade loses, $9,500 remains, and the next maximum risk becomes 5% × $9,500 = $475, and so on.",
      ),
    },
    {
      kind: "p",
      text: tx(
        "Ada baiknya kamu juga membatasi risiko maksimum dari modal yang dimiliki. Contohnya dengan dana $10.000, kamu membatasi risiko sebesar 50%: berhenti trading atau lakukan evaluasi kalau kerugian mencapai $5.000.",
        "It is also wise to cap the total risk to your capital. For example with $10,000, you cap the risk at 50%: stop trading, or review, if losses reach $5,000.",
      ),
    },
    {
      kind: "table",
      head: [tx("Trade", "Trade"), tx("Rugi (USD)", "Loss (USD)"), tx("Saldo (USD)", "Balance (USD)")],
      rows: [
        [tx("1", "1"), tx("500,00", "500.00"), tx("9.500,00", "9,500.00")],
        [tx("2", "2"), tx("475,00", "475.00"), tx("9.025,00", "9,025.00")],
        [tx("3", "3"), tx("451,25", "451.25"), tx("8.573,75", "8,573.75")],
        [tx("4", "4"), tx("428,69", "428.69"), tx("8.145,06", "8,145.06")],
        [tx("5", "5"), tx("407,25", "407.25"), tx("7.737,81", "7,737.81")],
        [tx("…", "…"), tx("…", "…"), tx("…", "…")],
        [tx("11", "11"), tx("299,37", "299.37"), tx("5.688,00", "5,688.00")],
      ],
      note: tx(
        "Modal awal $10.000, risiko per trade 5% dari saldo terakhir, batas risiko 50% ($5.000). Dengan asumsi semuanya rugi, ada 11 transaksi sebelum mencapai batas itu (total rugi $4.312). Angka 5% adalah batas maksimum dalam contoh ini; transaksi bisa memakai risiko lebih kecil.",
        "Starting capital $10,000, 5% risk per trade of the latest balance, a 50% risk cap ($5,000). Assuming every trade loses, there are 11 trades before reaching that cap (a total loss of $4,312). 5% is the maximum in this example; trades can use a smaller risk.",
      ),
    },

    { kind: "heading", text: tx("Win-loss ratio", "Win-loss ratio") },
    {
      kind: "p",
      text: tx(
        "Tidak ada analisa yang selalu tepat. Win-loss ratio adalah perbandingan antara transaksi profit dengan transaksi yang merugi: lima profit dan lima loss dalam 10 transaksi berarti 1:1. Akurasi bukanlah segalanya. Dengan money management dan risk/reward ratio yang baik, win-loss ratio 1:1 pun masih bisa menghasilkan akumulasi profit.",
        "No analysis is always right. The win-loss ratio compares profitable trades with losing ones: five profits and five losses in 10 trades is 1:1. Accuracy isn't everything. With good money management and a good risk/reward ratio, even a 1:1 win-loss ratio can still add up to a profit.",
      ),
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Tentukan risiko dulu", "Decide the risk first"),
      text: tx(
        "Hal penting dalam money management adalah menentukan besarnya risiko terlebih dahulu, sebelum menghitung profit yang nantinya diperoleh. Money management hanya berjalan baik kalau diterapkan dengan disiplin.",
        "The key point of money management is to decide the size of the risk first, before working out the profit you might make. Money management only works when it is applied with discipline.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Modal $10.000, risiko 5% per trade. Berapa rugi maksimal transaksi pertama?", "Capital $10,000, 5% risk per trade. What is the most the first trade can lose?"), a: tx("5% × $10.000 = $500.", "5% × $10,000 = $500.") },
        { q: tx("Apakah taruhan kecil membuat strategi yang rata-ratanya rugi jadi aman?", "Do small bets make a strategy that loses on average safe?"), a: tx("Tidak. Kerugian hanya datang lebih lambat.", "No. The loss only arrives more slowly.") },
      ],
    },
  ],
  sources: [
    { title: "Risk & Money Management", publisher: "FOREXimf" },
    { title: "Perlindungan modal forex: risiko versus strategi", publisher: "forexmechanics.com" },
    { title: "ESMA, pengumuman 27 Maret 2018 (akun CFD ritel)", publisher: "ESMA" },
  ],
}

export const drawdown: Lesson = {
  slug: "drawdown",
  level: 3,
  minutes: 5,
  title: tx("Drawdown dan risiko likuidasi", "Drawdown and liquidation risk"),
  summary: tx(
    "Seberapa dalam modal turun dari puncaknya, dan kenapa makin dalam turunnya makin sulit pulih.",
    "How far capital falls from its peak, and why the deeper the fall, the harder the recovery.",
  ),
  material: ["Drawdown dan Risiko Likuidasi.pdf", "Panduan Perlindungan Modal Forex.pdf"],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Keberhasilan jangka panjang tidak ditentukan oleh seberapa besar profit dalam satu waktu, melainkan seberapa baik kamu mampu mengendalikan potensi kerugian modal. Salah satu indikator paling penting dalam manajemen risiko adalah drawdown.",
        "Long-term success is not decided by how big a profit you make at one time, but by how well you control the potential loss of capital. One of the most important measures in risk management is drawdown.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Drawdown", "Drawdown"),
      text: tx(
        "Persentase penurunan nilai ekuitas akun dari titik puncak tertinggi (peak) ke titik terendah (trough) sebelum modal kembali naik menyamai atau melewati puncak tersebut.",
        "The percentage fall in account equity from its highest peak to its lowest trough before capital climbs back to or above that peak.",
      ),
    },
    {
      kind: "calc",
      title: tx("Contoh sederhana", "A simple example"),
      lines: [
        tx("Modal berkembang dari $1.000 sampai puncak $2.000", "Capital grows from $1,000 to a peak of $2,000"),
        tx("Serangkaian rugi menurunkan ekuitas ke $1.500", "A run of losses brings equity down to $1,500"),
        tx("Drawdown = $500 dari $2.000 = 25%", "Drawdown = $500 of $2,000 = 25%"),
      ],
    },
    {
      kind: "p",
      text: tx(
        "Fluktuasi penurunan modal adalah hal yang wajar, tetapi besarnya harus tetap dikendalikan di bawah ambang batas yang aman. Semakin besar drawdown, semakin rentan akun terhadap penutupan paksa (margin call dan stop out). Drawdown juga membantu melihat secara objektif apakah ukuran lot sudah proporsional atau terlalu berlebihan (overleveraging).",
        "Swings down in capital are normal, but their size must stay under a safe threshold. The bigger the drawdown, the more exposed the account is to being closed out (margin call and stop out). Drawdown also shows objectively whether the lot size is proportionate or too large (overleveraging).",
      ),
    },

    { kind: "heading", text: tx("Rugi dalam persen itu asimetris", "Losses in percent are lopsided") },
    {
      kind: "p",
      text: tx(
        "Setelah turun, dasar perhitunganmu mengecil, sehingga untuk kembali ke titik awal kamu butuh untung persentase yang lebih besar dari persentase ruginya. Contoh: modal 10.000 turun 50% menjadi 5.000. Untuk kembali ke 10.000 kamu butuh naik 100%, bukan 50%. Makin dalam turunnya, makin tidak masuk akal jalan pulangnya.",
        "After a fall, the base you count from is smaller, so to get back to where you started you need a bigger percentage gain than the percentage you lost. Example: 10,000 falls 50% to 5,000. To get back to 10,000 you need a 100% rise, not 50%. The deeper the fall, the less realistic the way back.",
      ),
    },
    {
      kind: "p",
      text: tx(
        "Jika kamu mempertaruhkan fraksi tetap r dari modal saat ini lalu rugi n kali berturut-turut, modal yang tersisa = modal awal × (1 − r) pangkat n. Angka di bawah belum termasuk biaya.",
        "If you risk a fixed fraction r of current capital and lose n times in a row, the capital left = starting capital × (1 − r) to the power n. The figures below are before costs.",
      ),
    },
    {
      kind: "table",
      head: [tx("Risiko per transaksi", "Risk per trade"), tx("Setelah 5 rugi", "After 5 losses"), tx("Setelah 10 rugi", "After 10 losses"), tx("Sisa modal (akun 10.000, 10 rugi)", "Capital left (10,000 account, 10 losses)")],
      rows: [
        [tx("0,5%", "0.5%"), tx("−2,5%", "−2.5%"), tx("−4,9%", "−4.9%"), tx("9.511", "9,511")],
        [tx("1,0%", "1.0%"), tx("−4,9%", "−4.9%"), tx("−9,6%", "−9.6%"), tx("9.044", "9,044")],
        [tx("2,0%", "2.0%"), tx("−9,6%", "−9.6%"), tx("−18,3%", "−18.3%"), tx("8.171", "8,171")],
        [tx("5,0%", "5.0%"), tx("−22,6%", "−22.6%"), tx("−40,1%", "−40.1%"), tx("5.987", "5,987")],
        [tx("10,0%", "10.0%"), tx("−41,0%", "−41.0%"), tx("−65,1%", "−65.1%"), tx("3.487", "3,487")],
      ],
      note: tx(
        "Persentase ini hanya contoh untuk membandingkan dampak, bukan anjuran.",
        "These percentages are only examples for comparing the impact, not recommendations.",
      ),
    },

    {
      kind: "points",
      title: tx("Penyebab drawdown tinggi", "What causes a deep drawdown"),
      items: [
        tx("Tidak disiplin memasang stop loss, sehingga posisi rugi dibiarkan terbuka dengan harapan harga berbalik.", "No discipline with stop losses, so losing positions are left open in the hope price turns."),
        tx("Overtrading: membuka terlalu banyak posisi secara emosional karena ingin membalas kekalahan (revenge trading).", "Overtrading: opening too many positions emotionally to win back a loss (revenge trading)."),
        tx("Volatilitas yang melonjak saat rilis data ekonomi besar atau ketegangan geopolitik mendadak.", "Volatility surging on big economic releases or sudden geopolitical tension."),
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Cara mengurangi drawdown", "How to reduce drawdown"),
      text: tx(
        "Batasi risiko kerugian maksimal antara 1% hingga 2% dari total ekuitas per transaksi, sehingga jika terjadi kerugian beruntun, modal utama tidak langsung terkuras habis.",
        "Limit the maximum loss to between 1% and 2% of total equity per trade, so a run of losses doesn't drain the main capital straight away.",
      ),
    },
    {
      kind: "check",
      items: [
        { q: tx("Ekuitas naik ke 12.000 lalu turun ke 9.000. Berapa drawdown-nya?", "Equity rises to 12,000 then falls to 9,000. What is the drawdown?"), a: tx("3.000 dari 12.000 = 25%.", "3,000 of 12,000 = 25%.") },
        { q: tx("Modal turun 50%. Berapa kenaikan yang dibutuhkan untuk kembali?", "Capital falls 50%. What rise is needed to get back?"), a: tx("100%.", "100%.") },
      ],
    },
  ],
  sources: [
    { title: "Drawdown dalam trading", publisher: "KVB Futures" },
    { title: "Perlindungan modal forex: risiko versus strategi", publisher: "forexmechanics.com" },
  ],
}
