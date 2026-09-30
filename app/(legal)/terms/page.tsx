import type { Metadata } from "next"
import Link from "next/link"
import { Isi, LegalDoc, Section, Tinjau } from "@/components/legal-doc"

export const metadata: Metadata = { title: "Syarat & Ketentuan" }

export default function TermsPage() {
  return (
    <LegalDoc
      title="Syarat & Ketentuan"
      intro={
        <p>
          Dengan membuat akun atau memakai TRY-REX, kamu setuju dengan syarat berikut. TRY-REX dikelola oleh{" "}
          <Isi>nama badan usaha</Isi>.
        </p>
      }
    >
      <Section title="1. Apa itu TRY-REX">
        <p>
          TRY-REX adalah platform <strong>edukasi</strong> untuk berlatih mengambil keputusan trading. Semua skenario
          memakai <strong>data harga historis</strong>. TRY-REX bukan pialang, tidak menerima dana, tidak mengeksekusi
          transaksi, dan <strong>tidak memberi saran investasi</strong> atau rekomendasi jual-beli untuk pasar saat
          ini. Baca juga <Link href="/disclaimer" className="text-primary hover:text-primary-hi">Disclaimer</Link>.
        </p>
      </Section>

      <Section title="2. Akun">
        <ul>
          <li>Kamu wajib memberi email yang benar dan menjaga kerahasiaan password-mu.</li>
          <li>Satu akun untuk satu orang. Aktivitas di akunmu menjadi tanggung jawabmu.</li>
          <li>
            Kamu harus berusia minimal <Isi>batas usia minimum</Isi> tahun. <Tinjau />
          </li>
        </ul>
      </Section>

      <Section title="3. Penggunaan yang tidak diperbolehkan">
        <ul>
          <li>Mencoba mengakses kunci jawaban, data pengguna lain, atau bagian sistem yang tidak terbuka untukmu.</li>
          <li>Mengotomatiskan jawaban atau memanipulasi skor, XP, atau peringkat.</li>
          <li>Mengganggu, membebani, atau merusak layanan.</li>
        </ul>
        <p>Kami boleh menangguhkan atau menutup akun yang melanggar ketentuan ini.</p>
      </Section>

      <Section title="4. Konten dan hak kekayaan intelektual">
        <p>
          Soal, penjelasan, desain, dan maskot Rex adalah milik <Isi>nama badan usaha</Isi>. Kamu boleh memakainya
          untuk belajar pribadi, tetapi tidak untuk disalin ulang atau dijual. <Tinjau />
        </p>
      </Section>

      <Section title="5. Tanpa jaminan">
        <p>
          Layanan diberikan &quot;sebagaimana adanya&quot;. Skor, evaluasi, dan penjelasan (termasuk yang dibuat
          dengan bantuan AI) bisa keliru. Hasil latihan tidak memprediksi hasil trading nyata.
        </p>
      </Section>

      <Section title="6. Batasan tanggung jawab">
        <p>
          Kami tidak bertanggung jawab atas kerugian finansial akibat keputusan trading nyata yang kamu ambil,
          termasuk yang terinspirasi dari materi TRY-REX. <Tinjau>rumusan dan batas tanggung jawab</Tinjau>
        </p>
      </Section>

      <Section title="7. Data pribadi">
        <p>
          Cara kami mengelola datamu dijelaskan di{" "}
          <Link href="/privacy" className="text-primary hover:text-primary-hi">Kebijakan Privasi</Link>.
        </p>
      </Section>

      <Section title="8. Perubahan dan hukum yang berlaku">
        <p>
          Kami bisa mengubah syarat ini dan akan memberi tahu sebelum perubahan berarti berlaku. Syarat ini tunduk
          pada hukum Republik Indonesia. <Tinjau>pilihan hukum dan penyelesaian sengketa</Tinjau>
        </p>
      </Section>

      <Section title="9. Kontak">
        <p>
          <Isi>nama badan usaha</Isi>, <Isi>alamat</Isi>. Email: <Isi>email kontak</Isi>.
        </p>
      </Section>
    </LegalDoc>
  )
}
