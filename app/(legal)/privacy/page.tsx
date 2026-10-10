import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Isi, LegalDoc, Section, Tinjau } from "@/components/legal-doc"

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("legal.titles"))("privacy") }
}

export default function PrivacyPage() {
  return (
    <LegalDoc
      doc="privacy"
      intro={
        <p>
          Halaman ini menjelaskan data apa yang dikumpulkan TRY-REX, untuk apa, di mana data itu disimpan, dan
          bagaimana kamu bisa meminta data itu dihapus. TRY-REX dikelola oleh <Isi>nama badan usaha</Isi>.
        </p>
      }
    >
      <Section title="1. Data yang kami kumpulkan">
        <ul>
          <li>
            <strong>Email dan password</strong> saat kamu membuat akun. Password disimpan dalam bentuk ter-hash oleh
            penyedia autentikasi kami; kami tidak bisa melihat password aslimu.
          </li>
          <li>
            <strong>Nama</strong> yang kamu isi saat mendaftar, untuk menyapamu di aplikasi.
          </li>
          <li>
            <strong>Jawaban latihan</strong>: keputusan (BUY, SELL, WAIT), alasan yang kamu pilih, waktu menjawab, dan
            skor yang dihasilkan.
          </li>
          <li>
            <strong>Waktu persetujuan</strong>: kapan kamu menyetujui kebijakan ini dan Syarat &amp; Ketentuan.
          </li>
          <li>
            <strong>Data teknis</strong>: cookie sesi agar kamu tetap masuk, serta log server standar (misalnya alamat
            IP dan waktu akses) dari penyedia hosting. <Tinjau>jenis log dan masa simpannya</Tinjau>
          </li>
        </ul>
        <p>
          Saat ini kami tidak memakai cookie iklan atau pelacak analitik pihak ketiga. Kalau itu berubah, halaman
          ini akan diperbarui lebih dulu.
        </p>
      </Section>

      <Section title="2. Untuk apa data dipakai">
        <ul>
          <li>Membuat dan mengamankan akunmu, termasuk mengirim email konfirmasi dan reset password.</li>
          <li>Menyimpan progres latihanmu dan menampilkan perkembangan kemampuanmu.</li>
          <li>Memberi evaluasi atas keputusanmu di setiap soal.</li>
          <li>Memperbaiki kualitas soal, dalam bentuk data gabungan yang tidak menunjuk ke orang tertentu.</li>
        </ul>
        <p>Kami tidak menjual data pribadimu dan tidak memakainya untuk iklan.</p>
        <p>
          Dasar pemrosesan: persetujuanmu saat mendaftar dan pelaksanaan layanan yang kamu minta.{" "}
          <Tinjau>kesesuaian dengan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi</Tinjau>
        </p>
      </Section>

      <Section title="3. Di mana data disimpan">
        <p>
          Akun dan data latihan disimpan di <strong>Supabase</strong> (database dan autentikasi), pada region{" "}
          <Isi>region server Supabase</Isi>. Situs dijalankan di <strong>Vercel</strong>. Artinya data dapat diproses
          di luar Indonesia. <Tinjau>ketentuan transfer data ke luar negeri</Tinjau>
        </p>
        <p>
          Data disimpan selama akunmu aktif. Setelah akun dihapus, data terkait ikut dihapus dari database utama
          dalam <Isi>jangka waktu, mis. 30 hari</Isi>, kecuali yang wajib disimpan menurut hukum.
        </p>
      </Section>

      <Section title="4. Hak kamu dan cara meminta penghapusan">
        <p>Kamu bisa meminta untuk melihat, memperbaiki, atau menghapus data pribadimu.</p>
        <p>
          Untuk menghapus akun beserta seluruh data latihannya, kirim email ke <Isi>email kontak privasi</Isi> dari
          alamat email akunmu, dengan judul &quot;Hapus akun&quot;. Kami akan memprosesnya dalam{" "}
          <Isi>jangka waktu</Isi> dan mengabarimu setelah selesai.
        </p>
      </Section>

      <Section title="5. Usia pengguna">
        <p>
          TRY-REX ditujukan untuk pengguna berusia <Isi>batas usia minimum</Isi> tahun ke atas.{" "}
          <Tinjau>kebutuhan persetujuan orang tua untuk anak</Tinjau>
        </p>
      </Section>

      <Section title="6. Perubahan kebijakan">
        <p>
          Kalau kebijakan ini berubah secara berarti, kami akan memberi tahu lewat email atau di aplikasi sebelum
          perubahan berlaku.
        </p>
      </Section>

      <Section title="7. Kontak">
        <p>
          <Isi>nama badan usaha</Isi>, <Isi>alamat</Isi>. Email: <Isi>email kontak</Isi>.
        </p>
        <p>
          Lihat juga <Link href="/terms" className="text-primary hover:text-primary-hi">Syarat &amp; Ketentuan</Link>{" "}
          dan <Link href="/disclaimer" className="text-primary hover:text-primary-hi">Disclaimer</Link>.
        </p>
      </Section>
    </LegalDoc>
  )
}
