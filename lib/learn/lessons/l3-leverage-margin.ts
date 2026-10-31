import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "06_Leverage_Margin_Margin-Call_dan_Stop-Out.pdf". Left out for
// beginners: the margin of JPY pairs.

export const leverageMargin: Lesson = {
  slug: "leverage-margin",
  level: 3,
  minutes: 8,
  title: tx("Leverage, margin, margin call, dan stop out", "Leverage, margin, margin call and stop out"),
  summary: tx(
    "Pinjaman modal, uang jaminan, dan batas aman akun: kenapa akun bisa tiba-tiba ditutup paksa.",
    "Borrowed capacity, deposits and an account's safety limits: why an account can suddenly be closed out.",
  ),
  material: ["06_Leverage_Margin_Margin-Call_dan_Stop-Out.pdf"],
  blocks: [
    { kind: "heading", text: tx("Cerita sederhana: sewa mobil dengan uang jaminan", "A simple story: renting a car with a deposit") },
    {
      kind: "p",
      text: tx(
        "Kamu ingin menyewa mobil senilai Rp 100 juta, tetapi rental hanya meminta uang jaminan Rp 1 juta. Kamu bisa memakai mobil itu penuh, tetapi kalau mobilnya rusak, kerugian dihitung dari nilai mobil, bukan dari jaminanmu. Kalau kerugian terlalu besar, rental menyita jaminan dan menghentikan sewa.",
        "You want to rent a car worth Rp 100 million, but the rental company only asks for a Rp 1 million deposit. You can use the whole car, but if it gets damaged, the loss is counted from the car's value, not your deposit. If the loss is too large, the rental company keeps the deposit and ends the rental.",
      ),
    },
    {
      kind: "p",
      text: tx(
        "Itu hampir persis cara kerja leverage di forex: broker memungkinkan kamu mengendalikan posisi bernilai besar dengan jaminan kecil. Untung dan rugi dihitung dari ukuran posisi penuh, bukan dari jaminan.",
        "That is almost exactly how leverage works in forex: the broker lets you control a large position with a small deposit. Profit and loss are counted from the full position size, not from the deposit.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Leverage", "Leverage"),
      text: tx(
        "Rasio antara nilai posisi yang bisa kamu kendalikan dan modal jaminan yang dikunci. Leverage 1:100 artinya setiap $1 jaminan mengendalikan posisi senilai $100. Leverage tidak mengubah jumlah untung atau rugi per pip. Yang menentukan hanya ukuran lot.",
        "The ratio between the value of the position you can control and the deposit that is locked. Leverage of 1:100 means every $1 of deposit controls a $100 position. Leverage does not change the profit or loss per pip. Only the lot size does that.",
      ),
    },
    { kind: "diagram", name: "leverage" },

    { kind: "heading", text: tx("Margin: uang jaminan, bukan biaya", "Margin: a deposit, not a fee") },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Rumus margin yang dibutuhkan", "The margin formula"),
      text: tx(
        "Margin = (lot × contract size × harga base dalam mata uang akun) ÷ leverage. Margin dikunci selama posisi terbuka dan dikembalikan ke saldo ketika posisi ditutup. Ia bukan biaya.",
        "Margin = (lots × contract size × base price in the account currency) ÷ leverage. Margin is locked while the position is open and returned to the balance when it is closed. It is not a fee.",
      ),
    },
    {
      kind: "calc",
      title: tx("Margin 1 lot EUR/USD pada harga 1,0850 (akun USD)", "Margin for 1 lot of EUR/USD at 1.0850 (USD account)"),
      lines: [
        tx("Nilai posisi = 100.000 × 1,0850 = $108.500", "Position value = 100,000 × 1.0850 = $108,500"),
        tx("Leverage 1:10 → margin = $108.500 ÷ 10 = $10.850,00", "Leverage 1:10 → margin = $108,500 ÷ 10 = $10,850.00"),
        tx("Leverage 1:30 → margin = $108.500 ÷ 30 = $3.616,67", "Leverage 1:30 → margin = $108,500 ÷ 30 = $3,616.67"),
        tx("Leverage 1:100 → margin = $108.500 ÷ 100 = $1.085,00", "Leverage 1:100 → margin = $108,500 ÷ 100 = $1,085.00"),
        tx("Leverage 1:500 → margin = $108.500 ÷ 500 = $217,00", "Leverage 1:500 → margin = $108,500 ÷ 500 = $217.00"),
      ],
    },

    { kind: "heading", text: tx("Kamus istilah akun", "Account terms") },
    {
      kind: "table",
      head: [tx("Istilah", "Term"), tx("Arti", "Meaning"), tx("Rumus", "Formula")],
      rows: [
        [tx("Balance", "Balance"), tx("Saldo dari transaksi yang sudah ditutup", "The balance from trades already closed"), tx("—", "—")],
        [tx("Floating P/L", "Floating P/L"), tx("Untung atau rugi sementara posisi yang masih terbuka", "The running profit or loss of open positions"), tx("—", "—")],
        [tx("Equity", "Equity"), tx("Nilai akun saat ini, termasuk posisi terbuka", "The account's current value, open positions included"), tx("Balance + Floating P/L", "Balance + Floating P/L")],
        [tx("Used margin", "Used margin"), tx("Total jaminan yang sedang dikunci", "All the deposit currently locked"), tx("Jumlah margin semua posisi", "Sum of every position's margin")],
        [tx("Free margin", "Free margin"), tx("Sisa dana yang bebas dipakai membuka posisi baru atau menanggung rugi", "Funds still free to open new positions or absorb losses"), tx("Equity − Used margin", "Equity − Used margin")],
        [tx("Margin level", "Margin level"), tx("Seberapa aman akun terhadap jaminan yang terkunci", "How safe the account is relative to the locked deposit"), tx("Equity ÷ Used margin × 100%", "Equity ÷ Used margin × 100%")],
      ],
    },
    {
      kind: "p",
      text: tx(
        "Contoh: saldo $2.000, buy 1 lot EUR/USD di 1,0850, leverage 1:100 (margin $1.085). Harga lalu bergerak melawan posisi. Setiap 1 pip = $10 untuk 1 lot.",
        "Example: a $2,000 balance, buying 1 lot of EUR/USD at 1.0850 with 1:100 leverage (margin $1,085). Price then moves against the position. Each pip = $10 for 1 lot.",
      ),
    },
    {
      kind: "table",
      head: [tx("Gerak melawan", "Move against"), tx("Floating P/L", "Floating P/L"), tx("Equity", "Equity"), tx("Free margin", "Free margin"), tx("Margin level", "Margin level")],
      rows: [
        [tx("0 pip", "0 pips"), tx("$0", "$0"), tx("$2.000", "$2,000"), tx("$915", "$915"), tx("184,3%", "184.3%")],
        [tx("50 pip", "50 pips"), tx("−$500", "−$500"), tx("$1.500", "$1,500"), tx("$415", "$415"), tx("138,2%", "138.2%")],
        [tx("100 pip", "100 pips"), tx("−$1.000", "−$1,000"), tx("$1.000", "$1,000"), tx("−$85", "−$85"), tx("92,2%", "92.2%")],
      ],
      note: tx("Used margin tetap $1.085 selama posisi terbuka.", "Used margin stays at $1,085 while the position is open."),
    },

    { kind: "heading", text: tx("Margin call dan stop out", "Margin call and stop out") },
    {
      kind: "table",
      head: [tx("", ""), tx("Margin call", "Margin call"), tx("Stop out", "Stop out")],
      rows: [
        [tx("Apa itu", "What it is"), tx("Peringatan bahwa margin level sudah rendah", "A warning that the margin level is low"), tx("Penutupan paksa posisi oleh broker", "The broker force-closing positions")],
        [tx("Contoh batas", "Example threshold"), tx("Sekitar 100% (tiap broker berbeda)", "Around 100% (differs by broker)"), tx("Sekitar 50%, atau lebih rendah seperti 20% (tiap broker berbeda)", "Around 50%, or lower such as 20% (differs by broker)")],
        [tx("Yang terjadi", "What happens"), tx("Biasanya hanya notifikasi; kamu bisa menambah dana atau menutup posisi", "Usually just a notice; you can add funds or close positions"), tx("Posisi ditutup otomatis, biasanya mulai dari yang paling rugi", "Positions are closed automatically, usually starting with the biggest loser")],
      ],
    },
    {
      kind: "calc",
      title: tx("Kapan stop out terjadi pada contoh di atas?", "When does stop out happen in the example above?"),
      lines: [
        tx("Stop out 50%: equity harus turun sampai 50% × $1.085 = $542,50", "Stop out at 50%: equity must fall to 50% × $1,085 = $542.50"),
        tx("Kerugian yang dibutuhkan = $2.000 − $542,50 = $1.457,50", "Loss needed = $2,000 − $542.50 = $1,457.50"),
        tx("Setara 145,75 pip pada 1 lot (pip = $10)", "That is 145.75 pips on 1 lot (pip = $10)"),
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Stop loss berbeda dengan stop out", "A stop loss is not a stop out"),
      text: tx(
        "Stop loss adalah keputusanmu: kamu menentukan di harga mana kamu keluar. Stop out adalah keputusan broker: ia menutup posisimu karena akunmu hampir kehabisan jaminan. Idealnya kamu tidak pernah sampai ke stop out, karena stop loss yang benar sudah menutup posisi jauh sebelumnya.",
        "A stop loss is your decision: you choose the price where you exit. A stop out is the broker's decision: it closes your position because your account has nearly run out of deposit. Ideally you never reach a stop out, because a proper stop loss has closed the position long before.",
      ),
    },

    { kind: "heading", text: tx("Jebakan terbesar: leverage tinggi membuat posisi terlalu besar", "The biggest trap: high leverage makes positions too large") },
    {
      kind: "calc",
      title: tx("Saldo $500, leverage 1:500", "A $500 balance with 1:500 leverage"),
      lines: [
        tx("Margin 1 lot = $217,00 → secara teknis boleh buka sampai 2,30 lot", "Margin for 1 lot = $217.00 → technically you may open up to 2.30 lots"),
        tx("Misal membuka 2 lot: margin = $434 ; 1 pip = $20", "Say you open 2 lots: margin = $434 ; 1 pip = $20"),
        tx("Stop out 50% di equity $217,0 → rugi yang dibutuhkan = $283,0", "Stop out at 50% means equity of $217.0 → loss needed = $283.0"),
        tx("Itu hanya 14,15 pip.", "That is only 14.15 pips."),
      ],
      note: tx(
        "Akunnya tidak \"lemah karena leverage\". Akunnya kecil dan lotnya terlalu besar. Ukuran lot harus ditentukan dari risiko per transaksi (misalnya 1% saldo) dan jarak stop loss, bukan dari margin maksimal yang diizinkan broker.",
        "The account is not \"weak because of leverage\". The account is small and the lot is too large. The lot size must come from the risk per trade (for example 1% of the balance) and the stop-loss distance, not from the most margin the broker allows.",
      ),
    },
    {
      kind: "points",
      title: tx("Aturan praktis", "Rules of thumb"),
      items: [
        tx("Anggap leverage sebagai kapasitas maksimum, bukan target yang harus dipakai.", "Treat leverage as a maximum capacity, not a target to use."),
        tx("Pakai sebagian kecil margin yang tersedia. Margin level yang tetap tinggi memberi napas saat harga bergerak melawan.", "Use a small part of the available margin. A margin level that stays high gives room to breathe when price moves against you."),
        tx("Tentukan lot dari risiko dan stop loss, lalu pastikan margin yang dibutuhkan masuk akal terhadap saldo.", "Set the lot from the risk and the stop loss, then check the margin needed is reasonable for the balance."),
        tx("Pahami angka margin call dan stop out brokermu dan apakah ada perlindungan saldo negatif.", "Know your broker's margin call and stop out levels, and whether there is negative balance protection."),
      ],
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Mengira leverage 1:500 berarti untung 500 kali. Leverage tidak mengubah untung per pip; ia hanya menurunkan jaminan yang dibutuhkan.", "Thinking 1:500 leverage means 500 times the profit. Leverage does not change the profit per pip; it only lowers the deposit needed."),
        tx("Memakai hampir seluruh free margin. Satu gerakan kecil saja sudah mendekati stop out.", "Using almost all the free margin. One small move is already close to a stop out."),
        tx("Menambah dana terus ke posisi rugi agar tidak stop out. Itu memperbesar kerugian, bukan memperbaiki analisis.", "Adding more funds to a losing position to avoid a stop out. That enlarges the loss; it does not fix the analysis."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Leverage 1:100, posisi senilai $50.000. Berapa margin?", "Leverage 1:100, a position worth $50,000. What is the margin?"), a: tx("$50.000 ÷ 100 = $500.", "$50,000 ÷ 100 = $500.") },
        { q: tx("Balance $1.000, floating −$200. Berapa equity?", "Balance $1,000, floating −$200. What is the equity?"), a: tx("$800.", "$800.") },
        { q: tx("Equity $800, used margin $400. Margin level?", "Equity $800, used margin $400. Margin level?"), a: tx("800 ÷ 400 × 100% = 200%.", "800 ÷ 400 × 100% = 200%.") },
        { q: tx("Apakah leverage tinggi menambah untung per pip?", "Does high leverage increase the profit per pip?"), a: tx("Tidak. Yang menentukan hanya ukuran lot.", "No. Only the lot size does.") },
      ],
    },
  ],
  sources: [
    { title: "What Is Leverage and Margin in Forex Trading", publisher: "Kama Capital", url: "https://kama-capital.com/education/articles/what-is-leverage-and-margin-in-forex-trading" },
    { title: "What Is the Stop Out Level in Forex", publisher: "Admirals", url: "https://admiralmarkets.com/education/articles/forex-basics/what-is-stop-out-level-in-forex" },
    { title: "Difference Between Margin Call and Stop Out", publisher: "DayTrading.com", url: "https://www.daytrading.com/community/t/difference-between-margin-call-and-stop-out" },
  ],
}
