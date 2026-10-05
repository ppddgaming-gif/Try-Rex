import { ACCOUNT, UNLOCK } from "@/lib/demo/config"
import { FUTURE } from "@/lib/game-logic"

// Every guided tour and all of its copy, in one place. Pure and client-safe:
// components/tour/ renders them. A step points at elements by their
// data-tour attribute; `targets` lists fallbacks in order (the sidebar link,
// then the phone's menu button), and the first one visible on screen wins. A
// step with no visible target is skipped, never shown as an empty highlight.
// Rex speaks: at most two short sentences per step.

export type TourId = "welcome" | "trading-game" | "ai-evaluation" | "dashboard" | "belajar" | "akun-latihan" | "pengaturan"

/** What a step's text may mention about the player. */
export type TourContext = {
  /** Display name, or null for a guest. */
  name: string | null
  /** Akun Latihan's unlock: finished game sessions out of those needed; null for a guest. */
  unlock: { sessions: number; needed: number; open: boolean } | null
}

export type TourStep = {
  /** data-tour values, first visible wins. Empty: a card in the middle with no highlight. */
  targets: string[]
  title: string | ((ctx: TourContext) => string)
  text: string | ((ctx: TourContext) => string)
}

export type Tour = {
  id: TourId
  /** For /panduan. */
  title: string
  description: string
  /** Where "Putar ulang" opens it; null means it runs on whatever app page is open. */
  page: string | null
  /** Pages that start it the first time they're opened; empty for the welcome tour. */
  paths: string[]
  /** Its page needs an account. */
  account: boolean
  steps: TourStep[]
  /** Replaces "Selesai" on the last step. */
  finish?: { label: string; href: string }
}

/** At most this many steps in one tour. */
export const MAX_STEPS = 7
/** The format every stored tour id must have (the database checks it too). */
export const TOUR_ID_RULE = /^[a-z0-9-]{1,40}$/
/** The database keeps at most this many. */
export const MAX_SEEN = 32

/** The sidebar link, or the menu button on a phone, where the sidebar is hidden. */
const nav = (id: string) => [`nav-${id}`, "nav-menu"]

export const TOURS: Tour[] = [
  {
    id: "welcome",
    title: "Tur selamat datang",
    description: "Semua fitur TRY-REX dalam satu menit.",
    page: null,
    paths: [],
    account: false,
    finish: { label: "Mulai sesi pertama", href: "/trading-game" },
    steps: [
      {
        targets: nav("dashboard"),
        title: (c) => (c.name ? `Hai, ${c.name}!` : "Hai!"),
        text: "Ini Dashboard: progres, streak, dan kemampuanmu terkumpul di sini. Turnya cuma 1 menit.",
      },
      {
        targets: nav("trading-game"),
        title: "Trading Game",
        text: "Latih keputusan BUY, SELL, atau WAIT di chart historis asli. Satu ronde berisi lima soal.",
      },
      {
        targets: nav("ai-evaluation"),
        title: "AI Evaluation",
        text: "Bedah soal yang baru kamu jawab. Rex menjelaskan kenapa keputusanmu tepat atau kurang tepat.",
      },
      {
        targets: nav("belajar"),
        title: "Belajar 101 dan Kamus",
        text: "Materi singkat dengan contoh dari chart asli. Istilah bergaris titik bisa diketuk di mana saja untuk melihat artinya.",
      },
      {
        targets: nav("akun-latihan"),
        title: "Akun Latihan",
        text: (c) => {
          const what = `Akun virtual $${ACCOUNT.STARTING_BALANCE} untuk berlatih trading di data historis.`
          if (!c.unlock) return `${what} Masuk dulu, lalu selesaikan ${UNLOCK.GAME_SESSIONS} sesi Trading Game.`
          if (c.unlock.open) return `${what} Sudah terbuka untukmu.`
          return `${what} Terbuka setelah ${c.unlock.needed} sesi Trading Game (${c.unlock.sessions}/${c.unlock.needed}).`
        },
      },
      {
        targets: nav("pengaturan"),
        title: "Pengaturan",
        text: "Atur tema, huruf yang mudah dibaca, dan ukuran teks. Profil dan password juga di sini.",
      },
      {
        targets: ["tour-help", "tour-help-mobile"],
        title: "Tombol ?",
        text: "Ketuk ini kapan saja untuk memutar ulang tur halaman yang sedang kamu buka. Semua tur ada di Panduan.",
      },
    ],
  },
  {
    id: "trading-game",
    title: "Trading Game",
    description: "Chart, Situasi Market, BUY/SELL/WAIT, dan XP.",
    page: "/trading-game",
    paths: ["/trading-game"],
    account: false,
    steps: [
      {
        targets: ["game-pair"],
        title: "Pair dan timeframe",
        text: "Pasangan mata uang yang kamu baca dan ukuran tiap candle. H4 berarti satu candle mewakili 4 jam.",
      },
      {
        targets: ["game-chart"],
        title: "Chart dan zona",
        text: "Candle-nya data harga asli. Pita mendatar menandai area support dan resistance.",
      },
      {
        targets: ["game-situation"],
        title: "Situasi Market",
        text: "Ringkasan chart dalam kata-kata, dihitung dari candle yang sama. Ketuk istilah bergaris untuk artinya.",
      },
      {
        targets: ["game-decision"],
        title: "BUY, SELL, atau WAIT",
        text: "Pilih ke mana menurutmu harga akan bergerak. WAIT juga jawaban yang sah.",
      },
      {
        targets: ["game-submit"],
        title: "Kirim Jawaban",
        text: `Setelah kamu kirim, ${FUTURE} candle berikutnya dibuka. Itu satu contoh dari yang bisa terjadi, bukan bukti analisismu benar atau salah.`,
      },
      {
        targets: ["game-progress"],
        title: "Progres ronde",
        text: "Kotak-kotak ini terisi seiring jawabanmu, lengkap dengan XP dan waktu. XP menambah levelmu.",
      },
      {
        targets: ["game-level"],
        title: "Tingkat kesulitan",
        text: "Mulai dari Mudah, lalu naik saat sudah nyaman. Tingkat yang lebih sulit memberi XP lebih besar.",
      },
    ],
  },
  {
    id: "ai-evaluation",
    title: "AI Evaluation",
    description: "Hasil, akurasi, penjelasan Rex, dan langkah berikutnya.",
    page: "/ai-evaluation",
    paths: ["/ai-evaluation"],
    account: false,
    steps: [
      {
        targets: ["eval-result"],
        title: "Hasilnya",
        text: "Keputusanmu, dan apakah tepat dibanding gerak harga sesudahnya.",
      },
      {
        targets: ["eval-score"],
        title: "Arti akurasi",
        text: "Angka ini dihitung dari besarnya gerak harga setelah entry. Ia menilai satu soal ini, bukan kemampuanmu secara keseluruhan.",
      },
      {
        targets: ["eval-explanation"],
        title: "Penjelasan Rex",
        text: "Alasannya diambil dari chart: trend, level, dan posisi harga. Di bawahnya ada saran untuk soal berikutnya.",
      },
      {
        targets: nav("dashboard"),
        title: "Kemampuan",
        text: "Empat kemampuan dasarmu ada di Dashboard. Statusnya “Belum diuji” sampai soal mulai mengujinya satu per satu.",
      },
      {
        targets: ["eval-next"],
        title: "Langkah berikutnya",
        text: "Coba terapkan sarannya di ronde baru: lima soal lagi dari data harga asli.",
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Angka-angkamu, kemampuan, streak, kalender, dan aktivitas.",
    page: "/dashboard",
    paths: ["/dashboard"],
    account: true,
    steps: [
      {
        targets: ["dash-stats"],
        title: "Angka-angkamu",
        text: "Semuanya dihitung dari jawabanmu sendiri. Kalau belum ada datanya, yang tampil tanda —.",
      },
      {
        targets: ["dash-skills"],
        title: "Kemampuan",
        text: "Empat kemampuan dasar trading. Tertulis “Belum diuji” sampai soal mulai mengujinya satu per satu.",
      },
      {
        targets: ["dash-streak", "dash-streak-mobile"],
        title: "Streak",
        text: "Hari berturut-turut kamu berlatih. Satu soal sehari sudah cukup untuk menjaganya.",
      },
      {
        targets: ["dash-calendar"],
        title: "Kalender latihan",
        text: "Satu kotak untuk satu hari, dua belas minggu terakhir. Kotaknya terisi di hari kamu berlatih.",
      },
      {
        targets: ["dash-activity"],
        title: "Aktivitas terbaru",
        text: "Jawaban-jawaban terakhirmu, yang terbaru di atas.",
      },
    ],
  },
  {
    id: "belajar",
    title: "Belajar 101",
    description: "Bab, pertanyaan di akhir materi, dan Kamus.",
    page: "/belajar",
    paths: ["/belajar"],
    account: false,
    steps: [
      {
        targets: ["learn-chapter"],
        title: "Bab",
        text: "Materi dikelompokkan per bab, dari membaca candle sampai menjaga aset crypto. Mulai dari bab mana saja.",
      },
      {
        targets: ["learn-lesson"],
        title: "Pertanyaan di akhir",
        text: "Tiap materi ditutup dengan satu pertanyaan untuk mengecek pemahamanmu. Tandai selesai kalau sudah paham.",
      },
      {
        targets: ["learn-kamus"],
        title: "Kamus",
        text: "Semua istilah trading, masing-masing dalam satu atau dua kalimat. Istilah yang sama bisa diketuk langsung di Trading Game.",
      },
    ],
  },
  {
    id: "akun-latihan",
    title: "Akun Latihan",
    description: "Tab-tab Akun Latihan. Muncul setelah Akun Latihan terbuka.",
    page: "/akun-latihan",
    paths: ["/akun-latihan"],
    account: true,
    steps: [
      { targets: ["demo-tab-akun"], title: "Akun", text: "Dashboard akunmu: saldo, Disiplin, dan progres stage." },
      { targets: ["demo-tab-trading"], title: "Trading", text: "Buka trade di chart historis, candle demi candle." },
      {
        targets: ["demo-tab-jurnal"],
        title: "Jurnal",
        text: "Setiap trade yang ditutup tercatat di sini otomatis, lengkap dengan komentar Rex.",
      },
      { targets: ["demo-tab-riwayat"], title: "Riwayat", text: "Akun-akunmu sebelumnya, beserta jurnalnya." },
      {
        targets: ["demo-tab-kalkulator"],
        title: "Kalkulator",
        text: "Hitung profit, rugi, dan margin sebuah posisi sebelum membukanya.",
      },
      { targets: ["demo-tab-tips"], title: "Tips Rex", text: "Tips yang sudah pernah muncul bisa dibaca lagi di sini." },
    ],
  },
  {
    id: "pengaturan",
    title: "Pengaturan",
    description: "Tampilan, Profil, Keamanan, dan Latihan.",
    page: "/pengaturan#tampilan",
    paths: ["/pengaturan"],
    account: false,
    steps: [
      {
        targets: ["settings-theme"],
        title: "Tema",
        text: "Gelap, terang, atau ikut perangkatmu. Pilihan tampilan tersimpan di perangkat ini.",
      },
      {
        targets: ["settings-font"],
        title: "Huruf",
        text: "Ada huruf yang ramah disleksia dan huruf yang mudah dibaca. Pilih yang paling nyaman untukmu.",
      },
      { targets: ["settings-size"], title: "Ukuran teks", text: "Perbesar teks di seluruh situs." },
      { targets: ["settings-motion"], title: "Gerakan", text: "Pilih Kurangi kalau animasi terasa mengganggu." },
      { targets: ["settings-tab-profil"], title: "Profil", text: "Foto, nama tampilan, dan username." },
      { targets: ["settings-tab-keamanan"], title: "Keamanan", text: "Ganti email dan password." },
      {
        targets: ["settings-tab-latihan"],
        title: "Latihan",
        text: "Jalur latihan dari kuismu, ulangi kuis, atau reset progres.",
      },
    ],
  },
]

export const TOUR_IDS = TOURS.map((t) => t.id)

export const tourById = (id: string) => TOURS.find((t) => t.id === id) ?? null

/** The page tour for a path (exact match, so /belajar's tour isn't run on a lesson). */
export const tourForPath = (path: string) => TOURS.find((t) => t.paths.includes(path)) ?? null

export const stepTitle = (s: TourStep, ctx: TourContext) => (typeof s.title === "function" ? s.title(ctx) : s.title)
export const stepText = (s: TourStep, ctx: TourContext) => (typeof s.text === "function" ? s.text(ctx) : s.text)

/** Seen tour ids from outside (localStorage, the profile): known ids only, no repeats. */
export function parseSeen(input: unknown): TourId[] {
  if (!Array.isArray(input)) return []
  const out: TourId[] = []
  for (const v of input) {
    if (typeof v === "string" && TOUR_ID_RULE.test(v) && (TOUR_IDS as string[]).includes(v) && !out.includes(v as TourId)) {
      out.push(v as TourId)
    }
  }
  return out.slice(0, MAX_SEEN)
}

/** Union of two seen lists, in first-seen order. */
export const mergeSeen = (a: readonly string[], b: readonly string[]) => parseSeen([...a, ...b])

/** Ids in `local` the account doesn't have yet: what a sign-in has to upload. */
export const unsynced = (local: readonly string[], account: readonly string[]) =>
  parseSeen(local).filter((id) => !account.includes(id))
