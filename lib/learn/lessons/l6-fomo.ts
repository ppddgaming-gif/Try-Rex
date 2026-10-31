import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "L6-3_FOMO_dan_Overtrading.pdf". Left out: the forms of revenge
// trading and its rule table (L6-2 covers the filter questions), the
// ten-question self-check, the progress measures, the four-week programme
// and the sources' illustrative R figures.

export const fomo: Lesson = {
  slug: "fomo-overtrading",
  level: 6,
  minutes: 7,
  title: tx("Memahami FOMO dan overtrading", "Understanding FOMO and overtrading"),
  summary: tx(
    "Mengapa takut ketinggalan dan terlalu sering bertransaksi sama-sama merusak akun, dan cara menghentikannya dengan aturan yang bisa dihitung.",
    "Why fear of missing out and trading too often both damage an account, and how to stop them with rules you can count.",
  ),
  material: ["L6-3_FOMO_dan_Overtrading.pdf"],
  blocks: [
    {
      kind: "callout",
      tone: "note",
      title: tx("Isi materi ini dalam satu paragraf", "This lesson in one paragraph"),
      text: tx(
        "FOMO membuatmu masuk di tempat yang salah (terlambat, stop jauh, untung kecil), sedangkan overtrading membuatmu masuk terlalu sering (biaya menumpuk, kualitas turun, tenaga habis). Keduanya sering dipicu oleh perasaan yang sama dan sering berujung pada revenge trading setelah rugi. Penangkalnya sama-sama mekanis: entry yang terlewat dianggap tidak ada, batas jumlah transaksi per sesi, daftar periksa sebelum masuk, jeda setelah rugi, dan batas rugi harian. Hari tanpa transaksi karena memang tidak ada sinyal adalah hari yang berhasil.",
        "FOMO makes you enter in the wrong place (late, a far stop, a small profit), while overtrading makes you enter too often (costs pile up, quality drops, energy runs out). Both are often triggered by the same feelings and often end in revenge trading after a loss. The cures are mechanical: a missed entry doesn't exist, a cap on trades per session, a checklist before entry, a pause after losses, and a daily loss limit. A day with no trades because there was no signal is a successful day.",
      ),
    },
    {
      kind: "table",
      head: [tx("Perilaku", "Behaviour"), tx("Definisi singkat", "Short definition"), tx("Perasaan di baliknya", "The feeling behind it")],
      rows: [
        [tx("FOMO", "FOMO"), tx("Masuk karena harga sedang bergerak tanpa kamu, padahal syarat masuk belum terpenuhi", "Entering because price is moving without you, though the entry conditions aren't met"), tx("Takut tertinggal, iri", "Fear of being left behind, envy")],
        [tx("Overtrading", "Overtrading"), tx("Mengambil lebih banyak transaksi daripada yang dibenarkan strategi", "Taking more trades than the strategy justifies"), tx("Bosan, gelisah, ingin \"produktif\"", "Bored, restless, wanting to be \"productive\"")],
        [tx("Revenge trading", "Revenge trading"), tx("Membuka transaksi untuk segera mengembalikan kerugian tanpa setup lengkap", "Trading to win back a loss fast without a complete setup"), tx("Marah, tidak terima", "Angry, unwilling to accept it")],
      ],
      note: tx(
        "Ketiganya mengotori data. Jika transaksi FOMO dan transaksi sesuai rencana tercampur di jurnal, kamu tidak bisa menilai apakah strategimu benar-benar bekerja.",
        "All three dirty your data. If FOMO trades and planned trades are mixed in the journal, you can't tell whether your strategy really works.",
      ),
    },

    { kind: "heading", text: tx("Memahami FOMO", "Understanding FOMO") },
    {
      kind: "p",
      text: tx(
        "Melihat orang lain mendapat sesuatu yang kita tidak punya memicu rasa tidak nyaman. Di pasar, hal ini muncul dari grafik yang melesat, cerita keuntungan teman, atau tangkapan layar profit di media sosial. Saat FOMO, desakan emosional terdengar seperti analisis: \"trennya kuat\", \"nanti naik lagi\". Cirinya mudah dikenali: syarat masuk dari rencanamu belum terpenuhi, tetapi kamu tetap ingin masuk.",
        "Seeing others get something we don't have makes us uncomfortable. In markets it comes from a chart shooting up, a friend's profit story, or profit screenshots on social media. With FOMO, an emotional urge sounds like analysis: \"the trend is strong\", \"it'll go up again\". It's easy to spot: your plan's entry conditions aren't met, yet you still want in.",
      ),
    },
    {
      kind: "table",
      head: [tx("", ""), tx("Sesuai rencana", "As planned"), tx("Mengejar (FOMO)", "Chasing (FOMO)")],
      rows: [
        [tx("Harga masuk", "Entry price"), tx("1,0800", "1.0800"), tx("1,0825", "1.0825")],
        [tx("Stop loss (struktur yang sama)", "Stop loss (same structure)"), tx("1,0780", "1.0780"), tx("1,0780", "1.0780")],
        [tx("Target", "Target"), tx("1,0840", "1.0840"), tx("1,0840", "1.0840")],
        [tx("Risiko / potensi untung", "Risk / potential profit"), tx("20 pip / 40 pip", "20 pips / 40 pips"), tx("45 pip / 15 pip", "45 pips / 15 pips")],
        [tx("Rasio untung:rugi", "Reward:risk"), tx("1 : 2", "1 : 2"), tx("1 : 0,33", "1 : 0.33")],
        [tx("Win rate minimum agar impas", "Break-even win rate"), tx("33,3%", "33.3%"), tx("75%", "75%")],
      ],
      note: tx(
        "Win rate impas = risiko ÷ (risiko + untung). Saat mengejar, kamu butuh menang tiga dari empat kali hanya untuk tidak rugi.",
        "Break-even win rate = risk ÷ (risk + profit). When chasing, you need to win three times in four just to avoid losing.",
      ),
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Aturan emas FOMO", "The golden rule of FOMO"),
      text: tx(
        "Entry yang terlewat adalah transaksi yang tidak ada. Kalau titik masuk dalam rencanamu sudah lewat, jangan masuk dengan harga lain. Pasar akan menyediakan setup baru. Satu-satunya hal langka bukan peluang, melainkan modal.",
        "A missed entry is a trade that doesn't exist. If your plan's entry point has passed, don't enter at another price. The market will offer new setups. The only scarce thing isn't opportunity but capital.",
      ),
    },
    {
      kind: "table",
      head: [tx("Alat", "Tool"), tx("Contoh penerapan", "How to use it")],
      rows: [
        [tx("Alert harga", "Price alerts"), tx("Pasang alert di support. Saat bunyi, baru buka chart dan jalankan daftar periksa.", "Set an alert at support. When it rings, open the chart and run the checklist.")],
        [tx("Daftar periksa masuk", "Entry checklist"), tx("Lima pertanyaan ya atau tidak. Satu \"tidak\" berarti tidak masuk.", "Five yes/no questions. One \"no\" means no entry.")],
        [tx("Aturan \"terlewat = hilang\"", "\"Missed = gone\""), tx("Tutup chart pair itu 30 menit setelah melihat gerakan besar.", "Close that pair's chart for 30 minutes after seeing a big move.")],
        [tx("Menandai transaksi FOMO", "Tagging FOMO trades"), tx("Beri label \"FOMO\" di jurnal, lalu bandingkan hasilnya tiap minggu.", "Label them \"FOMO\" in the journal and compare results weekly.")],
        [tx("Jauhi pemicu sosial", "Avoid social triggers"), tx("Mute grup sinyal selama jam trading.", "Mute signal groups during trading hours.")],
      ],
    },

    { kind: "heading", text: tx("Memahami overtrading", "Understanding overtrading") },
    {
      kind: "p",
      text: tx(
        "Overtrading sering menyamar sebagai kesibukan produktif: \"aku aktif, aku mencari peluang\". Dua penyebab utamanya: bosan (setup yang kurang bagus pun diambil) dan tekanan emosi (ingin mengembalikan rugi, atau terlalu percaya diri setelah menang). Padahal tiap transaksi tambahan membawa biaya dan risiko.",
        "Overtrading often disguises itself as productive busyness: \"I'm active, I'm looking for chances\". Its two main causes are boredom (even weak setups get taken) and emotional pressure (wanting to win back a loss, or overconfidence after a win). Yet every extra trade brings cost and risk.",
      ),
    },
    {
      kind: "table",
      head: [tx("Gaya trading", "Style"), tx("Transaksi per hari", "Trades a day"), tx("Biaya spread per bulan (20 hari)", "Spread cost a month (20 days)"), tx("Pada saldo $1.000", "On a $1,000 balance")],
      rows: [
        [tx("Selektif", "Selective"), tx("3", "3"), tx("60 × $1,2 = $72", "60 × $1.2 = $72"), tx("7,2%", "7.2%")],
        [tx("Aktif", "Active"), tx("10", "10"), tx("200 × $1,2 = $240", "200 × $1.2 = $240"), tx("24%", "24%")],
        [tx("Overtrading", "Overtrading"), tx("20", "20"), tx("400 × $1,2 = $480", "400 × $1.2 = $480"), tx("48%", "48%")],
      ],
      note: tx(
        "Contoh rekaan: spread 1,2 pip pada 0,10 lot (1 pip ≈ $1). Pada gaya \"aktif\", akun sudah kehilangan 24% dalam bentuk biaya sebelum untung pertama masuk.",
        "A made-up example: a 1.2-pip spread on 0.10 lots (1 pip ≈ $1). In the \"active\" style, the account has already lost 24% to costs before the first profit arrives.",
      ),
    },
    {
      kind: "callout",
      tone: "note",
      title: tx("Bukti dari penelitian", "Evidence from research"),
      text: tx(
        "Barber dan Odean menganalisis 66.465 rumah tangga investor: kelompok yang paling sering bertransaksi memperoleh imbal hasil bersih sekitar 11,4% per tahun, sedangkan yang paling jarang sekitar 18,5%, padahal imbal hasil sebelum biaya hampir sama. Pada studi pedagang kontrak berjangka harian di Brasil, di antara yang bertahan lebih dari 300 hari, sekitar 97% merugi. Ini bukan prediksi untukmu, tetapi pengingat bahwa trading intensif jarang berakhir baik.",
        "Barber and Odean analysed 66,465 investor households: the group trading most earned about 11.4% a year net, the group trading least about 18.5%, though returns before costs were almost the same. In a study of Brazilian futures day traders, of those who kept going more than 300 days, about 97% lost money. That's not a prediction for you, but a reminder that intensive trading rarely ends well.",
      ),
    },
    {
      kind: "table",
      head: [tx("Situasi", "Situation"), tx("Tindakan yang sehat", "The healthy action")],
      rows: [
        [tx("Tidak ada setup valid sampai akhir sesi", "No valid setup by the end of the session"), tx("Nol transaksi. Itu hari yang berhasil karena kamu patuh.", "Zero trades. That's a successful day because you followed the plan.")],
        [tx("Dua transaksi sudah rugi", "Two trades have lost"), tx("Berhenti sejenak dan jalankan jeda sebelum transaksi ketiga.", "Pause and take your break before a third trade.")],
        [tx("Batas jumlah transaksi tercapai", "The trade cap is reached"), tx("Tutup platform, tulis jurnal.", "Close the platform, write the journal.")],
        [tx("Bosan dan ingin \"melakukan sesuatu\"", "Bored and wanting to \"do something\""), tx("Review jurnal atau pelajari pair, bukan membuka posisi.", "Review the journal or study a pair, not open a position.")],
      ],
      note: tx(
        "Beberapa sumber menyarankan dua sampai tiga transaksi per sesi untuk kebanyakan day trader. Jumlah ideal ditentukan oleh sinyal, bukan oleh jam di dinding.",
        "Some sources suggest two or three trades per session for most day traders. The right number is set by signals, not by the clock.",
      ),
    },
    {
      kind: "callout",
      tone: "warning",
      title: tx("Siklus yang saling menguatkan", "A cycle that feeds itself"),
      text: tx(
        "Melewatkan gerakan besar → masuk FOMO terlambat → rugi (stop terkena) → balas dendam dengan lot lebih besar → overtrading dengan transaksi beruntun. Memutus mata rantai pertama adalah investasi terbaik: kalau kamu tidak mengejar gerakan itu, rangkaian berikutnya tidak pernah terjadi.",
        "Missing a big move → a late FOMO entry → a loss (stop hit) → revenge with a bigger lot → overtrading trade after trade. Breaking the first link is the best investment: if you don't chase that move, the rest never happens.",
      ),
    },
    {
      kind: "points",
      title: tx("Kesalahan umum", "Common mistakes"),
      items: [
        tx("Menganggap sedikit transaksi berarti malas. Kualitas lebih penting daripada jumlah.", "Thinking few trades means lazy. Quality matters more than quantity."),
        tx("Mengubah batas di tengah sesi. Batas ditentukan sebelum sesi, bukan ketika sedang kalah.", "Changing limits mid-session. Limits are set before the session, not while losing."),
        tx("Mengejar \"sekali saja\". Itu kalimat pembuka banyak kerugian besar.", "Chasing \"just this once\". It's how many big losses begin."),
        tx("Tidak menandai transaksi emosional yang kebetulan untung. Pola itu tetap berbahaya jangka panjang.", "Not tagging emotional trades that happened to win. The pattern is still dangerous in the long run."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Rencana: masuk 1,2000, stop 1,1980, target 1,2040. Kamu masuk terlambat di 1,2020. Win rate impas kedua kondisi?", "Plan: enter 1.2000, stop 1.1980, target 1.2040. You enter late at 1.2020. Break-even win rate in each case?"), a: tx("Rencana: 20 ÷ 60 = 33,3%. Terlambat: 40 ÷ 60 = 66,7%.", "Planned: 20 ÷ 60 = 33.3%. Late: 40 ÷ 60 = 66.7%.") },
        { q: tx("Spread 1,5 pip, 1 pip = $1, 8 transaksi per hari selama 20 hari. Biaya spread sebulan?", "A 1.5-pip spread, 1 pip = $1, 8 trades a day for 20 days. The monthly spread cost?"), a: tx("160 × 1,5 = $240.", "160 × 1.5 = $240.") },
        { q: tx("Mengapa hari tanpa transaksi bisa disebut berhasil?", "Why can a day with no trades be a success?"), a: tx("Karena tidak ada sinyal valid dan kamu patuh pada rencana.", "Because there was no valid signal and you followed your plan.") },
      ],
    },
  ],
  sources: [
    { title: "How to stop revenge trading, FOMO and overtrading for good", publisher: "Complete Traders Edge", url: "https://completetradersedge.com/how-to-stop-revenge-trading-fomo-overtrading/" },
    { title: "Trading is hazardous to your wealth", publisher: "Barber & Odean", url: "https://faculty.haas.berkeley.edu/odean/papers%20current%20versions/individual_investor_performance_final.pdf" },
    { title: "Retail day trading is an uphill battle", publisher: "Quantpedia", url: "https://quantpedia.com/retail-day-trading-is-an-uphill-battle/" },
  ],
}
