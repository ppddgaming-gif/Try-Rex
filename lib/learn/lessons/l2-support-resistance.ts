import type { Lesson } from "@/lib/learn/types"
import { tx } from "@/lib/learn/lessons/tx"

// From "04_Support_dan_Resistance.pdf".

export const supportResistance: Lesson = {
  slug: "support-resistance",
  level: 2,
  minutes: 7,
  title: tx("Support dan resistance", "Support and resistance"),
  summary: tx(
    "Lantai dan langit-langit harga: cara menemukannya, menilai kekuatannya, dan memakainya.",
    "The floor and ceiling of price: how to find them, judge their strength and use them.",
  ),
  material: ["04_Support_dan_Resistance.pdf"],
  blocks: [
    { kind: "heading", text: tx("Lantai dan langit-langit", "Floor and ceiling") },
    {
      kind: "p",
      text: tx(
        "Bayangkan bola yang dipantulkan di dalam ruangan. Ia memantul dari lantai ke atas, lalu menyentuh langit-langit dan turun lagi. Dalam chart, area di mana harga berulang kali berhenti turun disebut support. Area di mana harga berulang kali berhenti naik disebut resistance.",
        "Picture a ball bouncing inside a room. It bounces up off the floor, touches the ceiling and comes down again. On a chart, an area where price repeatedly stops falling is called support. An area where price repeatedly stops rising is called resistance.",
      ),
    },
    {
      kind: "callout",
      tone: "definition",
      title: tx("Support dan resistance", "Support and resistance"),
      text: tx(
        "Support: area harga di bawah harga sekarang tempat pembeli cukup kuat untuk menahan penurunan, sehingga harga cenderung memantul naik. Resistance: area harga di atas harga sekarang tempat penjual cukup kuat untuk menahan kenaikan, sehingga harga cenderung berbalik turun.",
        "Support: a price area below the current price where buyers are strong enough to hold back a fall, so price tends to bounce up. Resistance: a price area above the current price where sellers are strong enough to hold back a rise, so price tends to turn down.",
      ),
    },
    {
      kind: "chart",
      pick: "levels",
      caption: tx(
        "Data historis nyata. Zona support dan resistance dideteksi otomatis dari titik balik harga yang berulang, bukan digambar tangan.",
        "Real historical data. The support and resistance zones are detected automatically from repeated turning points, not drawn by hand.",
      ),
    },

    { kind: "heading", text: tx("Mengapa level ini bisa terbentuk", "Why these levels form") },
    { kind: "p", text: tx("Tidak ada satu penyebab pasti. Penjelasan yang paling sering dipakai:", "There is no single certain cause. The explanations used most often:") },
    {
      kind: "points",
      items: [
        tx("Memori pasar. Banyak trader mengingat harga di mana pasar berbalik. Mereka menaruh order beli atau jual di sekitar level itu lagi.", "Market memory. Many traders remember the prices where the market turned. They place buy or sell orders around that level again."),
        tx("Order yang menumpuk. Di sekitar level yang jelas biasanya ada kumpulan order tertunda (limit order, take profit, stop loss).", "Orders piling up. Around a clear level there is usually a cluster of pending orders (limit orders, take profits, stop losses)."),
        tx("Angka bulat. Level seperti 1,0900 atau 150,00 gampang diingat, sehingga lebih banyak orang memperhatikannya.", "Round numbers. Levels like 1.0900 or 150.00 are easy to remember, so more people watch them."),
        tx("Psikologi. Trader yang terjebak rugi cenderung menutup posisi begitu harga kembali ke titik masuknya, sehingga menekan harga di area itu.", "Psychology. Traders caught in a loss tend to close the position as soon as price comes back to their entry, which presses on price in that area."),
      ],
    },
    {
      kind: "callout",
      tone: "note",
      title: tx("Catatan kejujuran", "An honest note"),
      text: tx(
        "Penjelasan di atas adalah teori yang umum. Yang bisa kamu amati secara objektif hanyalah: harga sering bereaksi di area itu. Support dan resistance adalah peluang, bukan jaminan.",
        "The explanations above are common theories. What you can observe objectively is only this: price often reacts in that area. Support and resistance are opportunities, not guarantees.",
      ),
    },

    { kind: "heading", text: tx("Zona, bukan garis tipis", "Zones, not thin lines") },
    {
      kind: "p",
      text: tx(
        "Pemula biasanya menggambar garis setipis rambut lalu kecewa karena harga menembusnya sedikit sebelum berbalik. Cara yang lebih realistis adalah menggambar zona (kotak) yang mencakup bayangan (wick) sampai badan candle yang menyentuh area tersebut.",
        "Beginners usually draw a hair-thin line and are then disappointed when price pokes through it a little before turning. The more realistic way is to draw a zone (a box) that covers from the shadows (wicks) to the bodies of the candles that touch the area.",
      ),
    },
    {
      kind: "steps",
      title: tx("Cara menemukan support dan resistance", "How to find support and resistance"),
      items: [
        tx("Mulai dari timeframe besar (D1 atau H4) supaya level yang kelihatan benar-benar penting.", "Start from a large timeframe (D1 or H4) so the levels you see really matter."),
        tx("Tandai swing high dan swing low yang jelas, yaitu titik balik yang menonjol.", "Mark the clear swing highs and swing lows, the turning points that stand out."),
        tx("Cari area yang disentuh minimal 2 sampai 3 kali dengan reaksi yang terlihat.", "Look for areas touched at least 2 to 3 times with a visible reaction."),
        tx("Perhatikan angka bulat dan high atau low sebelumnya (harian, mingguan).", "Watch round numbers and previous highs or lows (daily, weekly)."),
        tx("Gambar zona dari ujung bayangan sampai sekitar badan candle. Jangan terlalu lebar.", "Draw the zone from the tip of the shadows to around the candle bodies. Don't make it too wide."),
        tx("Turun ke timeframe lebih kecil hanya untuk mengatur entry, bukan untuk menggambar ulang level dari awal.", "Go down to a smaller timeframe only to plan the entry, not to redraw the levels from scratch."),
      ],
    },
    {
      kind: "table",
      head: [tx("Faktor", "Factor"), tx("Cenderung lebih kuat", "Tends to be stronger"), tx("Cenderung lebih lemah", "Tends to be weaker")],
      rows: [
        [tx("Timeframe", "Timeframe"), tx("Terlihat jelas di D1, W1", "Clearly visible on D1, W1"), tx("Hanya terlihat di M5, M15", "Only visible on M5, M15")],
        [tx("Reaksi sebelumnya", "Previous reaction"), tx("Harga berbalik tajam dan jauh", "Price turned sharply and far"), tx("Pantulan kecil dan ragu-ragu", "A small, hesitant bounce")],
        [tx("Jumlah sentuhan", "Number of touches"), tx("2 sampai 3 sentuhan jelas", "2 to 3 clear touches"), tx("Satu sentuhan, atau sangat sering disentuh", "One touch, or touched very often")],
        [tx("Umur", "Age"), tx("Masih relevan dengan harga sekarang", "Still relevant to the current price"), tx("Terlalu lama, harga sudah berubah jauh", "Too old, price has moved far away")],
      ],
      note: tx(
        "Level yang terlalu sering diuji justru sering melemah: setiap sentuhan menyerap sebagian order yang menahan harga. Ini pandangan umum di kalangan trader, bukan hukum pasti.",
        "A level tested too often tends to weaken: each touch absorbs part of the orders holding price back. This is a common view among traders, not a fixed law.",
      ),
    },

    { kind: "heading", text: tx("Role reversal: support berganti peran", "Role reversal: support changes roles") },
    {
      kind: "p",
      text: tx(
        "Ketika harga menutup tembus resistance dan bertahan di atasnya, area itu sering berubah menjadi support. Begitu pula sebaliknya: support yang jebol sering menjadi resistance. Fenomena ini dikenal sebagai role reversal.",
        "When price closes through resistance and stays above it, that area often turns into support. The reverse also happens: broken support often becomes resistance. This is known as role reversal.",
      ),
    },
    {
      kind: "points",
      items: [
        tx("Menyentuh: bayangan candle masuk zona tetapi penutupan tetap di sisi semula. Level masih bertahan.", "Touching: the candle's shadow enters the zone but the close stays on the original side. The level still holds."),
        tx("Menembus: candle menutup di luar zona, idealnya diikuti candle berikutnya yang bertahan di luar.", "Breaking: the candle closes outside the zone, ideally followed by a next candle that stays outside."),
      ],
    },
    {
      kind: "calc",
      title: tx("Contoh rencana: buy di area support EUR/USD (ilustrasi)", "Example plan: buying at an EUR/USD support area (illustration)"),
      lines: [
        tx("Zona support 1,0795–1,0815 (sudah memantul 2 kali)", "Support zone 1.0795–1.0815 (has bounced twice)"),
        tx("Entry buy: 1,0812", "Buy entry: 1.0812"),
        tx("Stop loss: 1,0780 (di bawah zona) → risiko 32 pip", "Stop loss: 1.0780 (below the zone) → 32 pips of risk"),
        tx("Take profit: 1,0890 (batas bawah resistance) → imbalan 78 pip", "Take profit: 1.0890 (lower edge of resistance) → 78 pips of reward"),
        tx("Risk:reward = 32 : 78 = 1 : 2,4", "Risk:reward = 32 : 78 = 1 : 2.4"),
      ],
      note: tx(
        "Stop loss diletakkan di luar zona, bukan di tengah zona. Kalau harga sampai menutup di bawah zona, alasan analisis memang sudah gugur.",
        "The stop loss goes outside the zone, not in the middle of it. If price closes below the zone, the reason for the analysis has gone.",
      ),
    },

    { kind: "heading", text: tx("Kesalahan umum", "Common mistakes") },
    {
      kind: "points",
      items: [
        tx("Menggambar terlalu banyak level. Chart penuh garis membuat bingung. Cukup level yang menonjol.", "Drawing too many levels. A chart full of lines is confusing. The levels that stand out are enough."),
        tx("Beli persis di resistance atau jual persis di support tanpa konfirmasi apa pun.", "Buying right at resistance or selling right at support without any confirmation."),
        tx("Stop loss tepat di level. Taruh sedikit di luar zona agar tidak tersapu bayangan kecil.", "A stop loss exactly on the level. Put it a little outside the zone so a small shadow doesn't sweep it."),
        tx("Tidak mengubah level setelah jebol. Update peta, jangan memegang level yang sudah tidak berlaku.", "Not updating levels after they break. Update the map; don't hold on to levels that no longer apply."),
      ],
    },
    {
      kind: "check",
      items: [
        { q: tx("Apa beda support dan resistance?", "What is the difference between support and resistance?"), a: tx("Support menahan penurunan (di bawah harga), resistance menahan kenaikan (di atas harga).", "Support holds back a fall (below price); resistance holds back a rise (above price).") },
        { q: tx("Mengapa lebih baik menggambar zona daripada garis?", "Why draw a zone rather than a line?"), a: tx("Karena harga sering menembus sedikit lewat bayangan lalu berbalik.", "Because price often pokes through a little with a shadow and then turns.") },
        { q: tx("Apa itu role reversal?", "What is role reversal?"), a: tx("Resistance yang tertembus menjadi support (dan sebaliknya).", "Broken resistance becomes support (and the reverse).") },
        { q: tx("Di mana sebaiknya stop loss untuk buy di support?", "Where should the stop loss go for a buy at support?"), a: tx("Sedikit di bawah zona support.", "A little below the support zone.") },
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: tx("Yang perlu kamu ingat", "What to remember"),
      text: tx(
        "Support = lantai, resistance = langit-langit. Keduanya zona, bukan garis tipis. Cari di timeframe besar dengan 2 sampai 3 sentuhan dan reaksi jelas. Penembusan dinilai dari close; setelah tembus, peran level sering berbalik. Level adalah peluang, bukan jaminan; tunggu konfirmasi.",
        "Support = floor, resistance = ceiling. Both are zones, not thin lines. Look on a large timeframe for 2 to 3 touches with a clear reaction. A break is judged by the close; after a break, the level's role often flips. A level is an opportunity, not a guarantee; wait for confirmation.",
      ),
    },
  ],
  sources: [
    { title: "Support and Resistance (Technical Analysis)", publisher: "FXStreet", url: "https://www.fxstreet.com/technical-analysis/support-resistance" },
    { title: "Support and Resistance Zones: A Beginner's Guide", publisher: "Lime", url: "https://lime.co/news/support-and-resistance-zones-a-beginners-guide-143345/" },
    { title: "How Support and Resistance Exchange Roles on Retest", publisher: "TradingView Ideas", url: "https://www.tradingview.com/chart/NASDAQ/rNpCk0St-How-Support-And-Resistance-Exchange-Roles-On-Retest/" },
  ],
}
