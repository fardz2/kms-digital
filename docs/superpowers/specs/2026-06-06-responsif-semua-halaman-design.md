# Desain: Responsifkan Semua Halaman KMS Digital

Tanggal: 2026-06-06

## Tujuan

Memperbaiki halaman yang rusak di layar HP. Fokus pada komponen bersama
(berdampak luas) plus audit manual setiap halaman pada lebar 320/375/768px.

## Stack

React 19 + Vite + Ant Design v6 + Tailwind CSS v3. Tidak menambah dependensi baru.
Perbaikan lewat Tailwind breakpoint (sm/md/lg) dan opsi Chart.js.

## Temuan masalah nyata

1. DataTablePagination (`src/components/ui/DataTable/DataTablePagination.tsx:63`)
   merender SEMUA tombol halaman. Dengan 20+ halaman, deret tombol meluber
   keluar layar HP. Tingkat: kritis.
2. ChartWHO (`src/features/anak/ChartWHO.tsx:279,150`): `min-h-[500px]` plus 61
   tick sumbu-X membuat label numpuk dan chart gepeng di HP. Tingkat: tinggi.
3. DataTable (`src/components/ui/DataTable/index.tsx:94`): `overflow-x-auto` ada
   tapi tanpa petunjuk visual; user tidak sadar bisa di-scroll. Tingkat: sedang.
4. Modal AntD (form admin dan forum): lebar default bisa mepet/terpotong di
   layar sangat kecil (<360px). Tingkat: sedang.

## Yang sudah baik (tidak disentuh kecuali audit menemukan masalah)

Landing, Login, SignUp, Navbar (sudah ada menu mobile), Forum, Post, daftar
balita (BalitaCard), Beranda OT/Desa, UserGuide.

## Rencana perbaikan

### 1. DataTablePagination - jendela halaman terbatas
Ganti render-semua-tombol menjadi jendela: halaman pertama, terakhir, dan +/-1
dari halaman aktif dengan elipsis (contoh: `1 ... 4 5 6 ... 20`). Di HP, pemilih
jumlah-item dan navigasi disusun agar tidak meluber. Berdampak ke semua tabel
admin sekaligus.

### 2. ChartWHO adaptif HP
- Container tinggi adaptif: `min-h-[320px]` di HP, hingga `500px` di desktop.
- Kurangi kepadatan tick sumbu-X di HP (`maxTicksLimit` ~12, autoSkip aktif).
- Tab BB/TB/LK/Gizi tetap `flex-wrap` (sudah oke).

### 3. Indikator scroll DataTable
Tambahkan petunjuk visual halus (bayangan gradien tepi) saat tabel bisa
di-scroll horizontal, agar user tahu ada kolom tersembunyi.

### 4. Modal AntD responsif
Lebar penuh dengan margin di HP, lebar tetap di desktop. Diterapkan konsisten
pada Modal form admin dan forum.

## Audit menyeluruh

Periksa manual setiap halaman pada 320/375/768px:
- Public: Landing, Login, SignUp, UserGuide, NotFound
- Kader: ModePosyandu, DetailAnak, AkunOrangTua, LaporanBulanan
- Orang Tua: BerandaOT, Forum, DetailForum
- Desa: BerandaDesa, ExportDesaForm
- Admin: Dashboard, InputDesa, InputPosyandu, RegisterKader, RegisterTenkes,
  ArtikelList, ArtikelForm
- Tenkes: Forum, DetailForum
- Artikel: ArtikelList, ArtikelDetailPage

Perbaiki temuan tambahan (overflow, teks terpotong, tombol tumpang tindih,
target sentuh < 44px).

## Verifikasi

- `npm run lint`
- `npm test` (vitest)
- Cek build `npm run build` jika ada perubahan signifikan.

## Non-tujuan (YAGNI)

- Tidak mengubah daftar balita jadi tabel (sudah kartu).
- Tidak menambah library responsif/UI baru.
- Tidak refactor arsitektur routing atau data fetching.
