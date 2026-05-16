# KMS Digital — Manual Regression Checklist

Dijalankan sebelum merge tiap PR besar atau rilis ke production.

## Automated Tests

Jalankan sebelum manual testing:
```bash
npm test -- --watchAll=false
```
Expected: semua test PASS (saat ini: 73 tests di 7 suites).

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
- [ ] Login tenkes redirect langsung ke `/tenkes/forum` (BerandaTenkes dihapus)
- [ ] `/tenkes/beranda` legacy → redirect ke `/tenkes/forum`
- [ ] Klik link Forum/Artikel di Navbar bekerja

## Admin (Plan 4)
- [ ] Sidebar admin pakai label "Beranda / Data Master / Akun Pengguna" (LaporanAdmin dihapus)
- [ ] AdminDashboard single column: header + 4 stats + activity feed
- [ ] Stats "Pengguna" tampilkan total agg + breakdown (Kader/Tenkes/Ortu)
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
- [ ] `/desa/beranda` punya section "Acara" embedded di bawah Laporan
- [ ] Form tambah acara (judul + tanggal required, deskripsi optional)
- [ ] Submit → toast → list refresh
- [ ] Hapus dengan konfirmasi
- [ ] `/desa/acara` legacy → redirect ke `/desa/beranda#acara` dengan auto-scroll

### Admin Laporan
- [ ] Menu LaporanAdmin sudah dihapus (route `/admin/dashboard/laporan` tidak ada)

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

## Aesthetic Refresh (Plan 7)
- [ ] Font Plus Jakarta Sans muncul di heading (Halo..., title halaman)
- [ ] Font Inter muncul di body text
- [ ] Brand pink tetap dominan, tidak berubah
- [ ] Neutral gray tinted warm (bukan cool gray)
- [ ] BalitaCard border color berbeda per status (merah perhatian / hijau sudah / netral belum)
- [ ] Button hover lift + pink shadow glow (shadow-raised)
- [ ] Slider BB/TB/LK track gradient pink, thumb bulat 28px bertactile
- [ ] PosyanduHeader decorative blur circles visible
- [ ] FilterChip rounded-full dengan count badge
- [ ] StatusBadge soft pill (bg-bg + text-color pair)
- [ ] Zero inline styles di file scope (kecuali dynamic value: width%, animationDelay, backgroundImage)
- [ ] Tailwind arbitrary selector untuk slider thumb render correct di Chrome + Firefox
- [ ] 64 tests pass, build success tanpa new warnings

## Legacy Pages Refresh (Plan 8)
- [ ] LandingPage render dengan hero heading display font + CTA pink button
- [ ] SignUp form Tailwind card with backdrop blur, redirect ke /masuk
- [ ] NotFound 404 display number + CTA primary
- [ ] Navbar legacy (OT/Tenkes forum) sticky top, role-based link list
- [ ] Admin Sidebar 72 width, slide transition, active link primary-50
- [ ] DashboardLayout mobile hamburger toggle
- [ ] DropdownLink collapsible dengan chevron rotate
- [ ] Table component: header primary-300 + overline caps, row hover primary-50/40
- [ ] Pagination rounded-button, active page primary highlight
- [ ] Form components (InputDataAnak, InputPost, InputDataExcel, UpdateArtikel) modal title + footer Tailwind
- [ ] Forum post card hover lift + avatar + role tag colored
- [ ] DetailForum post detail + comment form + comment list
- [ ] Admin CMS pages (InputDesa, InputPosyandu, Register*, ArtikelAdmin, DesaPage) tetap render (inherit Inter font, antd default internal acceptable)

## Mode Posyandu (Plan 6)
- [ ] Login kader → langsung render `/kader/balita` sebagai ModePosyandu (bukan BerandaKader)
- [ ] Header pink menampilkan "Halo [nama]", nama posyandu, bulan berjalan
- [ ] Progress bar menunjukkan rasio `X/Y sudah diukur`
- [ ] Filter chip 3 state dengan count badge (Semua / Belum / Perhatian)
- [ ] Search berfungsi real-time
- [ ] Sort order: ⚠️ > ⚪ > ✅ (perlu perhatian di atas)
- [ ] Tap "✏️ UKUR" → form pengukuran dengan prefill dari pengukuran terakhir
- [ ] Tap "Ulang" pada balita sudah diukur → form edit dengan values bulan ini
- [ ] Tap "Lihat riwayat" → navigate ke `/kader/balita/:id`
- [ ] Simpan pengukuran → card auto update ke ✅ tanpa reload
- [ ] DatePicker di form menerima tanggal lampau untuk backdated entries
- [ ] Sticky footer "+ Tambah Balita Baru" selalu accessible
- [ ] Menu Laporan + Keluar di header berfungsi
- [ ] Legacy redirect `/kader/beranda` → `/kader/balita`
- [ ] Legacy redirect `/kader-posyandu/dashboard` → `/kader/balita`

## Orang Tua (legacy pages, new routes)
- [ ] `/orangtua/balita` render BerandaOT pakai Navbar (konsisten dengan flow lain)
- [ ] `/orangtua/forum`, `/orangtua/forum/:id`, `/orangtua/balita/:id` jalan
- [ ] `/orangtua/forum/saya` legacy → redirect ke `/orangtua/forum?tab=saya`
- [ ] Klik "Jawab pertanyaan" di forum → navigate ke `/orangtua/forum/{id}` (bukan tenkes)

## Admin (legacy)
- [ ] `/admin/dashboard/desa`, posyandu, kader-posyandu, tenaga-kesehatan, artikel jalan
- [ ] Menu admin tidak punya entry "Laporan" lagi (sudah dihapus)

## Desa & Tenkes (legacy)
- [ ] `/desa/beranda` jalan, pakai Navbar (bukan AppShell minimal)
- [ ] `/tenkes/forum`, `/tenkes/balita/:id` jalan

## Build & Runtime
- [ ] `npm run build` sukses tanpa error baru
- [ ] Tidak ada console error saat navigate semua role
- [ ] Browser back/forward jalan normal

## Cross-Role Flow Simplification (Plan 2026-05-14)

- [ ] Login kader → header `/kader/balita` cuma punya 3 tombol (Akun OT, Laporan, Keluar)
- [ ] Klik "Akun Orang Tua" → navigate ke `/kader/orangtua`
- [ ] `/kader/orangtua` punya tab "Menunggu Persetujuan" + "Daftar Aktif" dengan badge count
- [ ] Tab pending bekerja: approve/tolak orang tua + anak
- [ ] Tab aktif bekerja: tambah/edit/hapus orang tua
- [ ] Login OT → `/orangtua/forum` punya tab Semua + Punya Saya
- [ ] Tab "Punya Saya" filter post milik user, URL berubah ke `?tab=saya`
- [ ] `/orangtua/forum/saya` di-redirect ke `/orangtua/forum?tab=saya`
- [ ] Login desa → `/desa/beranda` punya 3 section (Export, Laporan, Acara)
- [ ] Akses `/desa/acara` di-redirect dengan scroll ke section #acara
- [ ] Login tenkes → langsung di `/tenkes/forum`
- [ ] `/tenkes/beranda` di-redirect ke `/tenkes/forum`
- [ ] `/admin/dashboard` single column: PageHeader + 4 stats + activity feed
- [ ] Stats card "Pengguna" tampilkan total + breakdown 3 role
- [ ] Sidebar admin pakai label "Beranda / Data Master / Akun Pengguna"

## Architecture Cleanup (Plan 2026-05-15)

### API Migration
- [ ] Semua page yang fetch data pakai `api/client.js` (tidak ada raw fetch lagi)
- [ ] 401 expired auto-redirect ke `/masuk?expired=1` dari interceptor
- [ ] Authorization header otomatis diinject di semua request
- [ ] Search "REACT_APP_BASE_URL" di src/ → hanya 1 occurrence di `client.js`

### React Query Coverage
- [ ] Forum: `usePostList`, `usePostDetail`, `useCreatePost`, `useCommentList`, `useCreateComment`
- [ ] Profile: `useProfile`, `useUpdateProfile`
- [ ] Kategori: `useKategoriList`, `useCreateKategori`
- [ ] Anak: `useCreateAnak`, `useImportAnakExcel`
- [ ] Cache invalidation di all mutations

### UI Consistency
- [ ] Semua role pakai `<Navbar>` (BerandaDesa juga, AppShell minimal dihapus)
- [ ] Profile modal di Navbar + Sidebar pakai `ProfileModal` shared component
- [ ] Forum tab "Saya" pakai filter berdasarkan `user.id` (bukan endpoint terpisah)
- [ ] Empty state CTA: BerandaOT (Tambah Anak Pertama), Forum (Tulis Pertanyaan Pertama)
- [ ] Filter status di RegisterKaderPosyandu pakai antd Select (bukan native)

### Tech Debt Resolved
- [ ] `moment.locale('id')` set di `index.js` (bulan tampil "Mei", "Juni", dst)
- [ ] DesaPage shim folder dihapus, import InputDesa langsung
- [ ] LaporanAdmin placeholder dihapus dari sidebar + route + file
- [ ] useAuth pakai ROLE_HOME (tidak duplicate role map)
- [ ] AdminDashboard pakai useSession (RequireRole sudah handle role guard)
- [ ] useSession reactive ke storage event (logout di tab lain auto-sync)
- [ ] Toast pakai inline duration (tidak module-load `message.config()` yang trigger antd v4 bug)

### Verification
- [ ] 73 tests pass (post/comment/profile/kategori query keys covered)
- [ ] `npm run build` Compiled successfully (zero ESLint warning)
- [ ] Bundle size tidak naik signifikan

