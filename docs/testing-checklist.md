# KMS Digital — Manual Regression Checklist

Dijalankan sebelum merge tiap PR besar atau rilis ke production.

## Automated Tests

Jalankan sebelum manual testing:
```bash
npm test -- --watchAll=false
```
Expected: semua test PASS (saat ini: 30 tests di 4 suites).

## Login & Session
- [ ] Login semua 5 role via `/masuk` portal sukses
- [ ] Legacy `/sign-in/*` redirect ke `/masuk` dengan role terisi
- [ ] Session persist setelah tutup tab
- [ ] Logout clear `kms_session_v1` dan redirect ke `/masuk`
- [ ] 401 expired redirect ke `/masuk?expired=1` dengan banner
- [ ] Migrasi `login_data` → `kms_session_v1` otomatis saat user lama login

## Kader Posyandu
- [ ] `/kader/beranda` render greeting + 2 card (Daftar Balita, Laporan)
- [ ] `/kader/balita` render list card, search by nama/nama ortu jalan
- [ ] Klik card balita → `/kader/balita/:id` render detail existing
- [ ] Tombol keluar di beranda berfungsi (konfirmasi dialog)

## Pengukuran (Plan 2)
- [ ] Form pengukuran buka dari DetailAnak, tanggal default hari ini
- [ ] Slider BB/TB/LK responsive, tombol +/− jalan
- [ ] Slider LILA hanya muncul untuk balita umur ≥ 7 bulan
- [ ] Catatan textarea jalan (max 500 char)
- [ ] Status Gizi preview muncul live saat semua terisi
- [ ] Submit create pengukuran baru → toast sukses → riwayat bertambah
- [ ] Edit pengukuran existing pre-loads nilai correctly
- [ ] Delete pengukuran dengan konfirmasi dialog
- [ ] 4 tab chart (BB/TB/LK/Gizi) switch dengan benar
- [ ] Chart Z-Score menampilkan data point balita (titik hitam) di atas band WHO
- [ ] Payload POST/PUT include `lila` dan `catatan` (null jika kosong)

## Orang Tua (Plan 4)
- [ ] `/orangtua/balita` landing baru BerandaOT dengan greeting + card anak
- [ ] Tombol "+ Tambah Anak" buka modal FormInputDataAnak legacy
- [ ] Klik card anak → DetailAnak (read-only, no edit/delete button)
- [ ] Menu Forum & Artikel accessible
- [ ] Tombol Keluar di navbar berfungsi

## Tenaga Kesehatan (Plan 4)
- [ ] Login tenkes redirect ke `/tenkes/beranda` (bukan `/tenkes/forum`)
- [ ] `/tenkes/beranda` landing baru dengan 2 card (Forum + Artikel)
- [ ] Klik Forum → `/tenkes/forum` legacy Post masih jalan

## Admin (Plan 4)
- [ ] Sidebar admin punya menu baru "Laporan Keseluruhan"
- [ ] Klik menu → render placeholder "Fitur laporan sedang disiapkan"
- [ ] Sub-page existing (Desa, Posyandu, Kader, Tenkes, Artikel) tidak regressions

## Laporan (Plan 3)

### Kader
- [ ] `/kader/laporan` render MonthPicker + 3 StatCard + ProgressBar partisipasi
- [ ] StatusDistribution menampilkan 4 bar (normal/kurang/stunting/obesitas)
- [ ] List balita belum diukur menampilkan nama + umur
- [ ] List perlu perhatian menampilkan nama + status
- [ ] Ganti bulan → data berubah
- [ ] Bulan kosong → semua "belum diukur", pesan "🎉"

### Desa
- [ ] `/desa/beranda` render LaporanDesa berdasarkan statistik-gizi endpoint
- [ ] StatCard total balita + jumlah posyandu
- [ ] List progress bar per-posyandu
- [ ] 3 Card distribusi BB/TB/LK total desa

### Desa Acara
- [ ] `/desa/acara` form tambah acara (judul + tanggal required, deskripsi optional)
- [ ] Submit → toast → list refresh
- [ ] Hapus dengan konfirmasi

### Admin Laporan
- [ ] `/admin/dashboard/laporan` render LaporanAdmin informasional
- [ ] Tidak ada error saat akses

## Artikel Public
- [ ] `/artikel` render ArtikelList baru (bukan legacy)
- [ ] `/artikel/:id` render ArtikelDetailPage baru
- [ ] Akses tanpa login (public) masih jalan

## Post-Cleanup (Plan 5)
- [ ] Tidak ada 404/ReferenceError saat navigate ke semua route
- [ ] Build size lebih kecil dibanding sebelum cleanup
- [ ] Tidak ada console error "Cannot resolve module 'xxx'"
- [ ] `npm test -- --watchAll=false` 63/63 pass
- [ ] Legacy redirect semua masih jalan (`/sign-in`, `/dashboard`, `/kader-posyandu/dashboard`, dll)

## Orang Tua (legacy pages, new routes)
- [ ] `/orangtua/balita` render dashboard lama
- [ ] `/orangtua/forum`, `/orangtua/forum/saya`, `/orangtua/forum/:id`, `/orangtua/balita/:id` jalan

## Admin (legacy)
- [ ] `/admin/dashboard/desa`, posyandu, kader-posyandu, tenaga-kesehatan, artikel jalan

## Desa & Tenkes (legacy)
- [ ] `/desa/beranda`, `/desa/acara` jalan
- [ ] `/tenkes/forum`, `/tenkes/balita/:id` jalan

## Build & Runtime
- [ ] `npm run build` sukses tanpa error baru
- [ ] Tidak ada console error saat navigate semua role
- [ ] Browser back/forward jalan normal
