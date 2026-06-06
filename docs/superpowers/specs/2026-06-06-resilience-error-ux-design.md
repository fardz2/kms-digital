# Desain: Resilience & Error UX (Sub-proyek 3)

Tanggal: 2026-06-06

## Tujuan

Menampilkan error fetch + tombol retry di halaman data utama, dan indikator
offline global, agar pengguna di jaringan buruk tidak terjebak spinner/empty
palsu.

## Stack

React 19 + Vite + React Query + Vitest. Tanpa dependensi baru (lucide-react
sudah ada untuk ikon).

## Masalah

Halaman destructure `{ data, isLoading }` tanpa `isError`/retry. Fetch gagal ->
empty state palsu atau spinner selamanya. `usePengukuranBulananKader` (composite
useQueries) bahkan tidak mengekspos error/refetch.

## Bagian

### 1. Komponen ErrorState (reusable)
File: `src/components/ui/ErrorState.tsx` + test.
Bungkus `EmptyState` yang sudah ada. Props:
`{ onRetry?: () => void; title?: ReactNode; description?: ReactNode; error?: unknown }`.
Default: ikon AlertTriangle, judul "Gagal memuat data", deskripsi dari
`error?.message` atau fallback "Periksa koneksi Anda lalu coba lagi." Tombol
"Coba Lagi" memakai komponen `Button`, memanggil `onRetry`.
Test: render judul default; tombol retry memanggil onRetry saat diklik;
deskripsi memakai error.message jika ada.

### 2. Terapkan ErrorState di halaman data utama
Pola: tambah `isError, refetch` ke destructure, render `<ErrorState
onRetry={refetch} error={error} />` saat `isError`, sebelum cek empty.
Halaman:
- `src/features/orangtua/BerandaOT.tsx` (useAnakList)
- `src/features/kader/ModePosyandu.tsx` (usePengukuranBulananKader, lihat 3)
- `src/features/anak/DetailAnak.tsx` (useAnakDetail + usePengukuranAnak)
- `src/features/artikel/ArtikelList.tsx`
- `src/features/laporan/LaporanBulananKader.tsx`
- `src/features/desa/BerandaDesa.tsx`
- `src/features/admin/AdminDashboard.tsx`

### 3. Perluas usePengukuranBulananKader
File: `src/queries/usePengukuranBulananKader.ts`.
Tambah ke return:
- `isError`: `anakError || queries.some((q) => q.isError)`
- `refetch`: fungsi yang memanggil `refetchAnak()` lalu `queries.forEach((q) => q.refetch())`
Ambil `isError`/`refetch` dari `useAnakList()` (sudah useQuery standar) dan dari
array `useQueries`.

### 4. Indikator offline global
- Hook: `src/hooks/useOnlineStatus.ts` — state awal `navigator.onLine`, listener
  event `online`/`offline`, cleanup di unmount. + test (mock navigator + dispatch event).
- Komponen: `src/components/OfflineBanner.tsx` — saat offline tampilkan banner
  tipis fixed (mis. bawah, di atas konten) dengan teks "Anda sedang offline.
  Sebagian data mungkin tidak terbarui." Pakai ikon WifiOff. Saat online: render null.
- Pasang `<OfflineBanner />` sekali di `src/App.tsx` (dekat AppPrompts).

## Verifikasi
- `npm run lint`
- `npm test`
- `npm run build`

## Non-tujuan (YAGNI)
- Tidak ada offline write queue (sub-proyek terpisah bila perlu).
- Tidak mengubah strategi caching PWA.
- Tidak menambahkan retry otomatis selain tombol manual.
