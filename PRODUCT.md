# Product

## Product Purpose

KMS Digital adalah sistem informasi posyandu untuk mendukung pengabdian masyarakat di tingkat desa. Produk ini mencatat data anak, pertumbuhan gizi, kegiatan posyandu, dan artikel kesehatan — dipakai sehari-hari oleh kader posyandu yang sebagian besar berusia lanjut, tenaga kesehatan desa, dan orang tua.

## Register

product

Aplikasi ini adalah CMS + dashboard internal. Fokus desain: alur kerja rutin, bukan kampanye pemasaran. Ada halaman publik (artikel, landing) tapi bukan pusat gravitasi produk.

## Users

### Primary: Kader Posyandu

Mayoritas ibu-ibu berusia 45–65 tahun di desa. Terbiasa menggunakan WhatsApp dan aplikasi perbankan dasar, tapi tidak fasih dengan interaksi UI modern (hover states, icon-only buttons, gesture). Tugas mereka rutin: input data anak, update pengukuran bulanan, kelola orang tua, lihat daftar belum-approve. Mereka bekerja di lapangan dengan HP (bukan desktop), sering di luar ruangan dengan layar silau, sambil memegang anak atau berkas kertas.

**Kebutuhan desain yang dihasilkan:**
- Target tap ≥48px (sudah ada token `tap: 3rem`)
- Kontras tinggi (text vs background)
- Label teks jelas — hindari icon-only
- Bahasa Indonesia sehari-hari, bukan istilah teknis
- Undo/konfirmasi untuk aksi destruktif
- State loading eksplisit ("Menyimpan..." bukan spinner saja)

### Secondary: Admin Desa & Tenaga Kesehatan

Lebih muda (30–45), lebih nyaman dengan UI modern. Tetap butuh efisiensi untuk kelola data banyak (desa, posyandu, kader, tenaga kesehatan, artikel).

### Tertiary: Orang Tua

Akses terbatas ke data anak mereka sendiri. Pakai HP. Tidak login rutin.

## Tone

- **Hangat** — ini produk kesehatan anak, bukan tool korporat
- **Teliti** — data kesehatan harus akurat, tidak boleh ambigu
- **Tidak ribet** — setiap layar punya satu tugas jelas

Bukan: playful, edgy, techno-futuristic, enterprise-serious, clinical-cold.

## Anti-references

Desain TIDAK boleh mirip:

1. **Admin dashboard generik / Bootstrap default.** Tabel polos, sidebar biru tua, metric cards berjajar, icon + judul + subtitle. Ini cetakan SaaS 2015 yang sudah membosankan.
2. **Material Design default.** Shadow elevation berlebihan, FAB mengambang, ripple effect di mana-mana. Google-look generic.
3. **Healthcare cliché.** Putih polos + hijau mint + stock photo dokter tersenyum + serif safe. Training-data reflex untuk "healthcare".
4. **Startup Silicon Valley.** Gradient ungu-pink, bento grid, pink neon accent, "AI-native" aesthetic. Tidak relevan untuk posyandu desa.
5. **Pemerintahan kaku.** Biru tua + kuning emas + logo burung garuda besar + border hairline abu-abu. Formal berlebihan.

## Strategic Principles

1. **Label > Icon.** Setiap aksi penting harus punya teks. Icon boleh ada sebagai pendamping, tidak pernah sendirian.
2. **Satu layar, satu tugas utama.** Hindari menumpuk modal di dalam modal, atau tabel dalam tabel.
3. **Konfirmasi destruktif eksplisit.** Delete, approve, dan perubahan status butuh konfirmasi dengan teks "Apakah Anda yakin?" + nama item yang terdampak.
4. **Ukuran dulu, kepadatan kedua.** Jangan kompres UI. Ruang putih sah untuk menurunkan cognitive load.
5. **Konsisten dengan pola WhatsApp & Bank BRI/BCA.** User primary sudah familiar dengan pola ini. Daftar vertikal, tap-to-open, tombol primary di bawah.
6. **Bahasa Indonesia sehari-hari.** "Simpan" bukan "Save". "Tambah Anak" bukan "Create Record". "Belum Disetujui" bukan "Pending".

## Existing brand cues to preserve

- Warna primary salmon/pink `#FF9999` (cocok maternal/child health, bukan mint cliché)
- Font: Plus Jakarta Sans (display) + Inter (body)
- Border radius: `rounded-button` 10px, `rounded-card` 16px
- Tap target: 48px via `spacing.tap`
- Easing: `ease-out-quart`, `ease-out-expo`

## Out of scope

- Dark mode (user kerja siang hari, di luar ruangan)
- Multi-bahasa (hanya Indonesia)
- Mobile app native (hanya web responsif)
- Fitur analytics lanjutan (sudah ada laporan bulanan, cukup)
