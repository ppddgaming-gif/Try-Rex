import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "02_Timeframe_dan_Multi-Timeframe-Analysis.pdf".

export const timeframe: Lesson = {
  slug: "timeframe",
  level: 2,
  minutes: 7,
  title: tx("Timeframe dan hubungan antar timeframe", "Timeframes and how they relate"),
  summary: tx(
    "Satu pasar, banyak sudut pandang: cara memilih timeframe dan menggabungkannya tanpa bingung.",
    "One market, many points of view: how to choose a timeframe and combine several without getting confused.",
  ),
  material: ["02_Timeframe_dan_Multi-Timeframe-Analysis.pdf"],
  blocks: [
    { kind: "heading", text: tx("Apa itu timeframe?", "What is a timeframe?") },
    {
      kind: "p",
      text: tx(
        "Timeframe adalah lamanya waktu yang diwakili satu candle. Candle H1 merangkum semua pergerakan harga selama 1 jam: harga pembukaan (open), tertinggi (high), terendah (low), dan penutupan (close). Candle M15 merangkum 15 menit. Candle D1 merangkum 1 hari.",
        "A timeframe is the length of time one candle stands for. An H1 candle sums up all price movement over 1 hour: the opening price (open), the highest (high), the lowest (low) and the closing price (close). An M15 candle sums up 15 minutes. A D1 candle sums up 1 day.",
      ),
    },
    {
      kind: "p",
      text: tx(
        "Bayangkan memotret pemandangan yang sama dengan tiga lensa. Lensa lebar (timeframe besar) menunjukkan bentuk gunung. Lensa sedang menunjukkan jalan setapak. Lensa dekat (timeframe kecil) menunjukkan kerikil di depan kakimu. Ketiganya benar; yang berbeda hanya seberapa banyak detail yang kelihatan.",
        "Imagine photographing the same view with three lenses. The wide lens (a large timeframe) shows the shape of the mountain. The medium lens shows the footpath. The close-up lens (a small timeframe) shows the pebbles in front of your feet. All three are true; the only difference is how much detail you see.",
      ),
    },
    {
      kind: "table",
      head: [tx("Kode", "Code"), tx("Arti", "Meaning"), tx("Candle per hari*", "Candles per day*"), tx("Kelompok", "Group")],
      rows: [
        [tx("M1, M5", "M1, M5"), tx("1 menit, 5 menit", "1 minute, 5 minutes"), tx("1.440 dan 288", "1,440 and 288"), tx("Sangat kecil", "Very small")],
        [tx("M15, M30", "M15, M30"), tx("15 menit, 30 menit", "15 minutes, 30 minutes"), tx("96 dan 48", "96 and 48"), tx("Kecil", "Small")],
        [tx("H1, H4", "H1, H4"), tx("1 jam, 4 jam", "1 hour, 4 hours"), tx("24 dan 6", "24 and 6"), tx("Menengah", "Medium")],
        [tx("D1, W1, MN", "D1, W1, MN"), tx("Harian, mingguan, bulanan", "Daily, weekly, monthly"), tx("1 (harian)", "1 (daily)"), tx("Besar", "Large")],
      ],
      note: tx(
        "*Dihitung untuk pasar yang buka 24 jam; pada kenyataannya forex libur akhir pekan.",
        "*Counted for a market open 24 hours; in reality forex closes at the weekend.",
      ),
    },
    {
      kind: "chart",
      pick: "timeframes",
      caption: tx(
        "Candle yang sama dilihat di H4 dan dikelompokkan menjadi D1. Semakin besar timeframe, semakin sedikit candle dan semakin halus tampilan geraknya.",
        "The same candles seen in H4 and grouped into D1. The larger the timeframe, the fewer the candles and the smoother the movement looks.",
      ),
    },

    { kind: "heading", text: tx("Kenapa timeframe mengubah cerita", "Why the timeframe changes the story") },
    {
      kind: "points",
      items: [
        tx(
          "Timeframe kecil = banyak candle, banyak noise (gerakan acak jangka pendek), sinyal sering muncul tetapi sering palsu, dan spread terasa lebih besar dibanding gerakannya.",
          "Small timeframe = many candles, a lot of noise (short-term random movement), signals that appear often but are often false, and a spread that feels large next to the movement.",
        ),
        tx(
          "Timeframe besar = sedikit candle, gerakan lebih bermakna, sinyal jarang tetapi biasanya lebih bisa dipercaya, dan butuh stop loss lebih lebar (dalam pip).",
          "Large timeframe = few candles, more meaningful movement, signals that are rare but usually more reliable, and a wider stop loss (in pips).",
        ),
        tx(
          "Tren di H4 bisa terlihat naik, sementara di M5 ada penurunan kecil. Dua-duanya benar karena yang dilihat berbeda skala.",
          "The trend on H4 can look up while M5 shows a small decline. Both are true, because they are looking at different scales.",
        ),
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: tx("Hubungan timeframe dan stop loss", "Timeframes and the stop loss"),
      text: tx(
        "Rata-rata gerak candle di timeframe besar lebih panjang. Karena itu stop loss di H4 biasanya puluhan pip, sedangkan di M5 mungkin hanya beberapa pip. Kalau kamu memakai stop loss 5 pip di analisis H4, kamu hampir pasti kena stop oleh gerak acak biasa.",
        "Candles on a large timeframe move further on average. That is why a stop loss on H4 is usually tens of pips, while on M5 it may be only a few. If you use a 5-pip stop loss on an H4 analysis, you will almost certainly be stopped out by ordinary random movement.",
      ),
    },

    { kind: "heading", text: tx("Memilih timeframe sesuai gaya trading", "Choosing a timeframe for your trading style") },
    {
      kind: "table",
      head: [tx("Gaya", "Style"), tx("Lama posisi terbuka", "How long a position stays open"), tx("Timeframe entry", "Entry timeframe"), tx("Cocok untuk", "Suits")],
      rows: [
        [tx("Scalping", "Scalping"), tx("Menit", "Minutes"), tx("M1 – M15", "M1 – M15"), tx("Waktu penuh di depan layar, tahan stres tinggi", "Full time at the screen, high stress tolerance")],
        [tx("Day trading", "Day trading"), tx("Jam, ditutup di hari yang sama", "Hours, closed the same day"), tx("M15 – H1", "M15 – H1"), tx("Punya jam khusus tiap hari", "Set hours every day")],
        [tx("Swing trading", "Swing trading"), tx("Hari sampai minggu", "Days to weeks"), tx("H4 – D1", "H4 – D1"), tx("Kesibukan lain (kerja, kuliah)", "Other commitments (work, study)")],
        [tx("Position trading", "Position trading"), tx("Minggu sampai bulan", "Weeks to months"), tx("D1 – W1", "D1 – W1"), tx("Sabar, modal besar, fokus fundamental", "Patience, large capital, a fundamental focus")],
      ],
      note: tx(
        "Pembagian ini kebiasaan umum di komunitas, bukan aturan baku. Untuk pemula, H1 dan H4 biasanya lebih tenang dibanding M1 sampai M5.",
        "This split is a common habit in the community, not a fixed rule. For beginners, H1 and H4 are usually calmer than M1 to M5.",
      ),
    },

    { kind: "heading", text: tx("Multi-Timeframe Analysis (MTF)", "Multi-Timeframe Analysis (MTF)") },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Multi-Timeframe Analysis", "Multi-Timeframe Analysis"),
      text: tx(
        "Memakai lebih dari satu timeframe untuk satu keputusan: timeframe besar untuk menentukan arah dan area penting, timeframe kecil untuk menentukan titik masuk.",
        "Using more than one timeframe for one decision: the large timeframe to decide the direction and the important areas, the small timeframe to decide the entry point.",
      ),
    },
    {
      kind: "table",
      head: [tx("Gaya", "Style"), tx("Lapis 1: konteks", "Layer 1: context"), tx("Lapis 2: setup", "Layer 2: setup"), tx("Lapis 3: entry", "Layer 3: entry")],
      rows: [
        [tx("Day trading", "Day trading"), tx("H4", "H4"), tx("H1", "H1"), tx("M15", "M15")],
        [tx("Swing trading", "Swing trading"), tx("W1", "W1"), tx("D1", "D1"), tx("H4", "H4")],
        [tx("Scalping", "Scalping"), tx("H1", "H1"), tx("M15", "M15"), tx("M5", "M5")],
      ],
      note: tx(
        "Kebiasaan paling umum adalah tiga lapis dengan jarak kira-kira 4 sampai 6 kali antar lapis. Intinya adalah rasio antar lapis, bukan nama timeframe tertentu.",
        "The most common habit is three layers, each roughly 4 to 6 times the next. What matters is the ratio between layers, not any particular timeframe name.",
      ),
    },
    {
      kind: "steps",
      title: tx("Alur kerja top-down (dari besar ke kecil)", "The top-down workflow (from large to small)"),
      items: [
        tx("Timeframe konteks: tentukan tren (naik, turun, mendatar) dan tandai area support-resistance penting.", "Context timeframe: decide the trend (up, down, flat) and mark the important support and resistance areas."),
        tx("Timeframe setup: cari harga yang sedang mendekati area tersebut, atau pola yang terbentuk searah tren.", "Setup timeframe: look for price approaching those areas, or a pattern forming in the direction of the trend."),
        tx("Timeframe entry: tunggu konfirmasi kecil (misalnya candle penolakan atau pecah struktur kecil) lalu tentukan entry, stop loss, dan target.", "Entry timeframe: wait for a small confirmation (for example a rejection candle or a small break of structure), then set the entry, stop loss and target."),
        tx("Kembali ke timeframe besar untuk menentukan target: area penting berikutnya.", "Go back to the large timeframe to set the target: the next important area."),
      ],
    },
    {
      kind: "points",
      title: tx("Kalau dua timeframe bertentangan", "When two timeframes disagree"),
      items: [
        tx("Timeframe besar menang. Kalau H4 turun dan M15 memberi sinyal beli, anggap itu pullback kecil atau lewati.", "The large timeframe wins. If H4 is falling and M15 gives a buy signal, treat it as a small pullback or skip it."),
        tx("Kalau timeframe besar sedang mendatar, boleh bermain di dalam range, tetapi dengan target pendek.", "If the large timeframe is flat, you can trade inside the range, but with short targets."),
        tx("Kalau ragu dan tidak ada keselarasan, tidak trading juga merupakan keputusan yang sah.", "If you are unsure and nothing lines up, not trading is also a valid decision."),
      ],
    },

    { kind: "heading", text: tx("Kesalahan umum", "Common mistakes") },
    {
      kind: "points",
      items: [
        tx("Timeframe hopping. Pindah-pindah timeframe sampai menemukan bentuk yang cocok dengan keinginan sendiri (membenarkan posisi yang sudah dibuka).", "Timeframe hopping. Switching timeframes until you find a shape that matches what you want (justifying a position already open)."),
        tx("Terlalu banyak lapis. Lima timeframe sekaligus malah memberi sinyal campur aduk. Cukup 2 sampai 3.", "Too many layers. Five timeframes at once give mixed signals. Two or three are enough."),
        tx("Mengabaikan timeframe besar. Entry cantik di M5 yang menabrak resistance kuat di D1 adalah sumber kerugian klasik.", "Ignoring the large timeframe. A neat M5 entry that runs into strong D1 resistance is a classic source of losses."),
        tx("Memakai target timeframe besar dengan stop loss timeframe kecil. Stop terlalu sempit, hasilnya terkena stop berulang meski arah analisis benar.", "Using a large-timeframe target with a small-timeframe stop loss. The stop is too tight, so it is hit again and again even when the analysis is right."),
      ],
    },

    {
      kind: "check",
      items: [
        { q: tx("Candle H4 merangkum berapa jam harga?", "How many hours of price does an H4 candle sum up?"), a: tx("4 jam.", "4 hours.") },
        { q: tx("Mana yang lebih banyak noise: M5 atau H4?", "Which has more noise: M5 or H4?"), a: tx("M5.", "M5.") },
        { q: tx("Untuk swing trading, contoh tiga lapis yang masuk akal?", "For swing trading, what is a sensible set of three layers?"), a: tx("W1 (konteks), D1 (setup), H4 (entry).", "W1 (context), D1 (setup), H4 (entry).") },
        { q: tx("H4 turun, M15 muncul sinyal beli. Sebaiknya?", "H4 is falling and M15 shows a buy signal. What should you do?"), a: tx("Prioritaskan H4: anggap sebagai pullback atau lewati.", "Give H4 priority: treat it as a pullback or skip it.") },
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Yang perlu kamu ingat", "What to remember"),
      text: tx(
        "Timeframe = lama waktu satu candle. Besar = tenang dan bermakna, kecil = cepat dan berisik. Pilih timeframe sesuai gaya dan waktu luangmu, bukan sesuai sinyal yang kamu inginkan. Kalau bertentangan, timeframe besar menang. Stop loss harus sesuai timeframe analisis.",
        "Timeframe = the length of one candle. Large = calm and meaningful, small = fast and noisy. Choose a timeframe for your style and free time, not for the signal you want. When they disagree, the large timeframe wins. The stop loss must suit the timeframe of the analysis.",
      ),
    },
  ],
  sources: [
    { title: "Multiple Time Frame Analysis (MTFA) in Forex Trading", publisher: "FxPro", url: "https://www.fxpro.com/help-section/education/beginners/articles/mtfa-multiple-time-frame-analysis-forex-trading" },
    { title: "How to Use Multiple Timeframes in Forex Trading", publisher: "FX Replay", url: "https://www.fxreplay.com/learn/how-to-use-multiple-timeframes-in-forex-trading" },
  ],
}
