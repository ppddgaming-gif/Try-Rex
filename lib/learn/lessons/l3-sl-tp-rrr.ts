import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "07_Stop-Loss_Take-Profit_dan_RRR.pdf", split into its three topics:
// stop loss and take profit, the risk-reward ratio, and position sizing. Left
// out for beginners: sizing a JPY pair.

const MATERIAL = "07_Stop-Loss_Take-Profit_dan_RRR.pdf"
const SOURCES = [
  { title: "Risk/Reward Ratio in Trading", publisher: "IQ Option Blog", url: "https://blog.iqoption.com/en/risk-reward-ratio-in-trading/" },
  { title: "Risk Reward Ratio Trade", publisher: "HaceCuentas", url: "https://hacecuentas.com/en/risk-reward-ratio-trade" },
  { title: "Take Profit Target", publisher: "Chasing Returns Help", url: "https://intercom.help/chasingreturns/en/articles/3863736-take-profit-target" },
]

export const stopLossTakeProfit: Lesson = {
  slug: "stop-loss-take-profit",
  level: 3,
  minutes: 6,
  title: tx("Stop loss dan take profit", "Stop loss and take profit"),
  summary: tx(
    "Tiga angka yang harus kamu tulis sebelum menekan tombol Buy atau Sell.",
    "Three numbers to write down before you press Buy or Sell.",
  ),
  material: [MATERIAL],
  blocks: [
    { kind: "heading", text: tx("Tiga angka sebelum masuk pasar", "Three numbers before you enter") },
    {
      kind: "p",
      text: tx(
        "Pilot menentukan rute dan bahan bakar cadangan sebelum lepas landas, bukan di tengah badai. Trader juga begitu. Sebelum membuka posisi, tuliskan tiga angka:",
        "A pilot plans the route and the reserve fuel before take-off, not in the middle of a storm. Traders do the same. Before opening a position, write down three numbers:",
      ),
    },
    {
      kind: "table",
      head: [tx("Angka", "Number"), tx("Pertanyaan yang dijawab", "The question it answers")],
      rows: [
        [tx("Entry", "Entry"), tx("Di harga berapa aku masuk?", "At what price do I enter?")],
        [tx("Stop Loss (SL)", "Stop Loss (SL)"), tx("Di harga berapa aku mengaku salah dan keluar?", "At what price do I admit I'm wrong and get out?")],
        [tx("Take Profit (TP)", "Take Profit (TP)"), tx("Di harga berapa aku mengambil keuntungan?", "At what price do I take the profit?")],
      ],
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Stop Loss", "Stop Loss"),
      text: tx(
        "Perintah otomatis yang menutup posisi saat harga menyentuh level tertentu yang merugikan, untuk membatasi kerugian pada angka yang sudah kamu putuskan sebelumnya.",
        "An automatic order that closes the position when price reaches a set level against you, to limit the loss to an amount you decided in advance.",
      ),
    },
    {
      kind: "points",
      title: tx("Prinsip utama", "Key principles"),
      items: [
        tx("Pasang SL pada setiap posisi, dan pasang saat membuka posisi, bukan \"nanti kalau sudah turun\".", "Put an SL on every position, and set it when you open the position, not \"later if it falls\"."),
        tx("SL ditentukan oleh analisis (di mana alasan kamu terbukti salah), bukan oleh jumlah uang yang kamu mau.", "The SL is set by the analysis (where your reason is proven wrong), not by the amount of money you would like."),
        tx("Setelah SL ditentukan, lot disesuaikan agar kerugian pada SL sebesar risiko yang kamu putuskan, bukan sebaliknya.", "Once the SL is set, the lot is adjusted so the loss at the SL equals the risk you decided, not the other way round."),
        tx("Jangan menggeser SL menjauh agar posisi rugi tidak tertutup. Itu sama saja dengan menghapus batas kerugian.", "Don't move the SL further away to keep a losing position open. That is the same as deleting the loss limit."),
      ],
    },
    {
      kind: "table",
      head: [tx("Metode", "Method"), tx("Cara", "How"), tx("Catatan", "Note")],
      rows: [
        [tx("Berdasarkan struktur", "Based on structure"), tx("Buy: sedikit di bawah swing low atau support. Sell: sedikit di atas swing high atau resistance", "Buy: a little below the swing low or support. Sell: a little above the swing high or resistance"), tx("Paling umum; menjawab \"di mana ide ini salah?\"", "The most common; answers \"where is this idea wrong?\"")],
        [tx("Berdasarkan volatilitas", "Based on volatility"), tx("Jarak SL = beberapa kali ATR (dibahas di Level 4)", "SL distance = a few times the ATR (covered in Level 4)"), tx("Menyesuaikan dengan kondisi pasar", "Adapts to market conditions")],
        [tx("Berdasarkan angka tetap", "A fixed number"), tx("Misal selalu 20 pip", "For example always 20 pips"), tx("Mudah, tetapi mengabaikan kondisi chart; kurang disarankan", "Easy, but ignores the chart; less advisable")],
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Beri ruang napas", "Give it room to breathe"),
      text: tx(
        "Letakkan SL sedikit di luar level penting, jangan tepat di atasnya. Banyak stop loss menumpuk di level yang jelas, dan harga sering menyapunya sebentar sebelum berbalik. Sisakan buffer beberapa pip, dan pertimbangkan spread.",
        "Put the SL a little outside the important level, not right on it. Many stop losses pile up at obvious levels, and price often sweeps them briefly before turning. Leave a buffer of a few pips, and allow for the spread.",
      ),
    },
    { kind: "diagram", name: "risk-reward" },

    { kind: "heading", text: tx("Take Profit: kapan mengambil hasil", "Take Profit: when to take the result") },
    {
      kind: "points",
      items: [
        tx("Di level penting berikutnya: Buy dengan TP sedikit di bawah resistance terdekat; Sell dengan TP sedikit di atas support terdekat.", "At the next important level: a Buy with TP a little below the nearest resistance; a Sell with TP a little above the nearest support."),
        tx("Berdasarkan rasio tetap: misalnya TP = 2 kali jarak SL (RRR 1:2), selama level itu tetap masuk akal terhadap chart.", "Based on a fixed ratio: for example TP = 2 times the SL distance (RRR 1:2), as long as that level still makes sense on the chart."),
        tx("Bertahap (partial): tutup sebagian posisi di target pertama, sisanya dibiarkan ke target lebih jauh.", "In stages (partial): close part of the position at the first target and let the rest run to a further one."),
      ],
    },
    {
      kind: "points",
      title: tx("Break-even dan trailing stop", "Break-even and trailing stop"),
      items: [
        tx("Break-even: setelah posisi untung sejauh 1 kali risikonya (disebut +1R), SL digeser ke harga entry. Kalau harga berbalik, kamu keluar tanpa rugi (selain biaya).", "Break-even: once the position is in profit by 1 times its risk (called +1R), the SL moves to the entry price. If price turns, you exit without a loss (apart from costs)."),
        tx("Trailing stop: SL mengikuti harga sambil menjaga jarak tertentu atau mengikuti struktur baru.", "Trailing stop: the SL follows price at a set distance or follows the new structure."),
        tx("Jangan menggeser SL terlalu cepat; harga butuh ruang untuk bergerak.", "Don't move the SL too soon; price needs room to move."),
      ],
    },
    {
      kind: "calc",
      title: tx("Break-even pada buy EUR/USD", "Break-even on an EUR/USD buy"),
      lines: [
        tx("Entry 1,0850 ; SL awal 1,0820 (risiko 30 pip = 1R)", "Entry 1.0850 ; initial SL 1.0820 (30 pips of risk = 1R)"),
        tx("Saat harga mencapai 1,0880 (+30 pip = +1R), geser SL ke 1,0850.", "When price reaches 1.0880 (+30 pips = +1R), move the SL to 1.0850."),
        tx("Sejak itu kerugian maksimal posisi ini ≈ 0 (di luar spread dan slippage).", "From then on the most this position can lose ≈ 0 (apart from spread and slippage)."),
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: tx("Soal spread dan gap", "About the spread and gaps"),
      text: tx(
        "Ketika pasar melompat (gap) atau sangat cepat saat berita besar, SL bisa tereksekusi di harga yang lebih buruk daripada yang kamu atur (disebut slippage). SL membatasi risiko, tetapi tidak menjamin angkanya persis.",
        "When the market jumps (a gap) or moves very fast on big news, the SL can be filled at a worse price than the one you set (called slippage). An SL limits risk, but it does not guarantee the exact amount.",
      ),
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Tanpa SL. Satu transaksi buruk bisa menghapus hasil puluhan transaksi baik.", "No SL. One bad trade can wipe out the results of dozens of good ones."),
        tx("Menggeser SL menjauh saat harga mendekat. Itu menukar aturan dengan harapan.", "Moving the SL further away as price gets close. That swaps a rule for hope."),
        tx("SL terlalu sempit untuk timeframe yang dipakai, sehingga sering tersapu goyangan biasa.", "An SL too tight for the timeframe used, so ordinary wiggles keep sweeping it."),
        tx("Mengubah rencana di tengah jalan karena emosi, bukan karena data baru.", "Changing the plan midway because of emotion, not new data."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("SL buy sebaiknya di mana?", "Where should a buy's SL go?"), a: tx("Sedikit di bawah level yang jika ditembus berarti analisis salah (misal swing low).", "A little below the level whose break means the analysis is wrong (for example a swing low).") },
        { q: tx("Kapan SL boleh digeser?", "When may the SL be moved?"), a: tx("Hanya untuk mengunci (break-even, trailing), tidak pernah menjauh.", "Only to lock in (break-even, trailing), never further away.") },
      ],
    },
  ],
  sources: SOURCES,
}

export const riskReward: Lesson = {
  slug: "risk-reward",
  level: 3,
  minutes: 6,
  title: tx("Risk-to-reward ratio (RRR)", "Risk-to-reward ratio (RRR)"),
  summary: tx(
    "Perbandingan imbalan dan risiko, dan berapa win rate yang dibutuhkan agar tidak rugi.",
    "Comparing reward with risk, and the win rate you need to avoid losing.",
  ),
  material: [MATERIAL],
  blocks: [
    {
      kind: "callout",
      tone: "definition",
      title: tx("RRR", "RRR"),
      text: tx(
        "RRR = potensi imbalan ÷ risiko, keduanya dalam pip atau uang. Penulisan umum 1:2 berarti risiko 1 bagian untuk imbalan 2 bagian.",
        "RRR = potential reward ÷ risk, both in pips or in money. The common notation 1:2 means risking 1 part for a reward of 2 parts.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Win rate impas", "Break-even win rate"),
      text: tx(
        "Win rate impas = 1 ÷ (1 + RR), dengan RR = imbalan ÷ risiko, sebelum biaya spread dan komisi.",
        "Break-even win rate = 1 ÷ (1 + RR), where RR = reward ÷ risk, before spread and commission costs.",
      ),
    },
    {
      kind: "table",
      head: [tx("RRR (risiko:imbalan)", "RRR (risk:reward)"), tx("RR", "RR"), tx("Win rate impas", "Break-even win rate")],
      rows: [
        [tx("2:1", "2:1"), tx("0,5", "0.5"), tx("66,7%", "66.7%")],
        [tx("1:1", "1:1"), tx("1", "1"), tx("50,0%", "50.0%")],
        [tx("1:1,5", "1:1.5"), tx("1,5", "1.5"), tx("40,0%", "40.0%")],
        [tx("1:2", "1:2"), tx("2", "2"), tx("33,3%", "33.3%")],
        [tx("1:3", "1:3"), tx("3", "3"), tx("25,0%", "25.0%")],
      ],
      note: tx(
        "RRR 1:2 membuatmu impas dengan win rate sekitar 33,3% saja. RRR 2:1 (risiko lebih besar dari imbalan) menuntut sekitar 66,7%.",
        "An RRR of 1:2 breaks even with a win rate of only about 33.3%. An RRR of 2:1 (risk larger than reward) needs about 66.7%.",
      ),
    },
    { kind: "diagram", name: "risk-reward" },

    { kind: "heading", text: tx("Expectancy: rata-rata hasil per transaksi", "Expectancy: the average result per trade") },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Expectancy dalam R", "Expectancy in R"),
      text: tx(
        "Expectancy = (win rate × rata-rata menang) − (loss rate × rata-rata kalah), dalam satuan R (1R = risiko per transaksi). Positif berarti sistem menguntungkan dalam jangka panjang.",
        "Expectancy = (win rate × average win) − (loss rate × average loss), in units of R (1R = the risk per trade). Positive means the system is profitable over the long run.",
      ),
    },
    {
      kind: "calc",
      title: tx("Tiga contoh", "Three examples"),
      lines: [
        tx("Win rate 40%, RR 1:2 → 0,40 × 2 − 0,60 × 1 = 0,20R (menguntungkan)", "Win rate 40%, RR 1:2 → 0.40 × 2 − 0.60 × 1 = 0.20R (profitable)"),
        tx("Win rate 60%, RR 1:0,5 → 0,60 × 0,5 − 0,40 × 1 = −0,10R (merugi, meski sering menang)", "Win rate 60%, RR 1:0.5 → 0.60 × 0.5 − 0.40 × 1 = −0.10R (losing, despite winning often)"),
        tx("Win rate 50%, RR 1:1,5 → 0,50 × 1,5 − 0,50 × 1 = 0,25R (menguntungkan)", "Win rate 50%, RR 1:1.5 → 0.50 × 1.5 − 0.50 × 1 = 0.25R (profitable)"),
      ],
    },
    {
      kind: "calc",
      title: tx("Bukti dengan 100 transaksi (risiko $10, win rate 40%, RR 1:2)", "Proof over 100 trades (risk $10, win rate 40%, RR 1:2)"),
      lines: [
        tx("40 menang × $20 = $800 | 60 kalah × $10 = $600", "40 wins × $20 = $800 | 60 losses × $10 = $600"),
        tx("Hasil bersih = $200 (= 0,2R × 100 transaksi × $10)", "Net result = $200 (= 0.2R × 100 trades × $10)"),
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Jangan tergoda RRR setinggi mungkin", "Don't chase the highest possible RRR"),
      text: tx(
        "RRR 1:10 terlihat menggoda, tetapi target yang terlalu jauh jarang tercapai sehingga win rate turun drastis. Yang penting bukan RRR-nya saja, melainkan kombinasi RRR dan win rate yang kamu ukur dari datamu sendiri (lewat jurnal).",
        "An RRR of 1:10 looks tempting, but a target that far is rarely reached, so the win rate drops sharply. What matters is not the RRR alone but the combination of RRR and win rate that you measure from your own data (through a journal).",
      ),
    },
    {
      kind: "calc",
      title: tx("Contoh rencana lengkap: buy EUR/USD, 0,1 lot", "A full plan: buying EUR/USD, 0.1 lot"),
      lines: [
        tx("Entry 1,0850 ; SL 1,0820 ; TP 1,0940", "Entry 1.0850 ; SL 1.0820 ; TP 1.0940"),
        tx("Risiko = 30 pip × $1 = $30 | Imbalan = 90 pip × $1 = $90", "Risk = 30 pips × $1 = $30 | Reward = 90 pips × $1 = $90"),
        tx("RRR = 1 : 3 → win rate impas = 1 ÷ (1 + 3) = 25%", "RRR = 1 : 3 → break-even win rate = 1 ÷ (1 + 3) = 25%"),
        tx("Jika SL kena: −$30. Jika TP kena: +$90.", "If the SL is hit: −$30. If the TP is hit: +$90."),
      ],
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("TP terlalu dekat dan SL terlalu jauh. RRR di bawah 1 menuntut win rate sangat tinggi.", "A TP too close and an SL too far. An RRR below 1 needs a very high win rate."),
        tx("Mengukur win rate dan RR dari harapan, bukan dari data sendiri.", "Measuring the win rate and RR from hope rather than your own data."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Win rate impas untuk RRR 1:3?", "The break-even win rate for an RRR of 1:3?"), a: tx("1 ÷ (1 + 3) = 25%.", "1 ÷ (1 + 3) = 25%.") },
        { q: tx("Win rate 50%, RR 1:1. Expectancy?", "Win rate 50%, RR 1:1. Expectancy?"), a: tx("0,5 × 1 − 0,5 × 1 = 0R (impas, sebelum biaya).", "0.5 × 1 − 0.5 × 1 = 0R (break-even, before costs).") },
      ],
    },
  ],
  sources: SOURCES,
}

export const positionSizing: Lesson = {
  slug: "position-sizing",
  level: 3,
  minutes: 4,
  title: tx("Position sizing: menghitung ukuran lot", "Position sizing: working out the lot size"),
  summary: tx(
    "Lot dihitung dari risiko dan jarak stop loss, bukan dari keinginan atau margin maksimal.",
    "The lot comes from the risk and the stop-loss distance, not from wishes or the maximum margin.",
  ),
  material: [MATERIAL],
  blocks: [
    {
      kind: "p",
      text: tx(
        "Urutannya: analisis → SL → lot → TP. Setelah SL ditentukan, lot disesuaikan agar kerugian pada SL sebesar risiko yang kamu putuskan, bukan sebaliknya.",
        "The order is: analysis → SL → lot → TP. Once the SL is set, the lot is adjusted so the loss at the SL equals the risk you decided, not the other way round.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Rumus ukuran posisi", "The position-size formula"),
      text: tx(
        "Lot = risiko uang ÷ (jarak SL dalam pip × pip value per 1 lot)",
        "Lots = money at risk ÷ (SL distance in pips × pip value per 1 lot)",
      ),
    },
    {
      kind: "calc",
      title: tx("EUR/USD: akun $1.000, risiko 1%, SL 25 pip", "EUR/USD: a $1,000 account, 1% risk, a 25-pip SL"),
      lines: [
        tx("Risiko uang = 1% × $1.000 = $10", "Money at risk = 1% × $1,000 = $10"),
        tx("Pip value 1 lot = $10", "Pip value of 1 lot = $10"),
        tx("Lot = $10 ÷ (25 × $10) = 0,04 lot", "Lots = $10 ÷ (25 × $10) = 0.04 lots"),
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Bulatkan ke bawah", "Round down"),
      text: tx(
        "Kalau hasil hitungan tidak pas dengan ukuran lot yang tersedia, bulatkan ke bawah, jangan ke atas, supaya risiko sebenarnya tidak melampaui batas yang kamu tetapkan.",
        "If the result doesn't fit an available lot size, round down, not up, so the real risk never goes above the limit you set.",
      ),
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Menentukan lot dulu, SL belakangan. Urutannya: analisis → SL → lot → TP.", "Choosing the lot first and the SL later. The order is: analysis → SL → lot → TP."),
        tx("Mengira lot kecil berarti aman tanpa menghitung stop loss. Risiko ditentukan oleh jarak stop loss (dalam pip) × pip value, bukan oleh lot saja.", "Thinking a small lot is safe without working out the stop loss. Risk is set by the stop-loss distance (in pips) × pip value, not by the lot alone."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Akun $2.000, risiko 1%, SL 20 pip EUR/USD. Berapa lot?", "A $2,000 account, 1% risk, a 20-pip SL on EUR/USD. How many lots?"), a: tx("$20 ÷ (20 × $10) = 0,1 lot.", "$20 ÷ (20 × $10) = 0.1 lots.") },
        { q: tx("Mengapa pembulatan lot ke bawah?", "Why round the lot down?"), a: tx("Supaya risiko sebenarnya tidak melebihi batas.", "So the real risk does not go over the limit.") },
      ],
    },
  ],
  sources: SOURCES,
}
