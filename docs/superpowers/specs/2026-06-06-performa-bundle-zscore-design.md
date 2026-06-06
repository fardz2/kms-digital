# Desain: Performa Bundle Z-Score (Sub-proyek 2)

Tanggal: 2026-06-06

## Tujuan

Mengurangi ukuran dengan menghapus file JSON mati dan menghilangkan duplikasi
fungsi pembulatan z-score. Pendekatan berisiko minimal, tanpa mengubah cara
perhitungan (tetap sinkron).

## Stack

React 19 + Vite + Vitest. Tanpa dependensi baru.

## Temuan

1. File JSON mati (~163KB): `src/json/ZScoreBeratTinggiBadanLaki.json` (76.2KB)
   dan `src/json/ZScoreBeratTinggiBadanPerempuan.json` (87.4KB) tidak diimpor di
   mana pun (diverifikasi grep seluruh repo). Yang dipakai adalah varian
   `...24.json` dan `...60.json`.
2. Duplikasi logika pembulatan: `roundPbToHalfStep` di
   `src/features/pengukuran/zScore.ts` identik dengan `roundPb` di
   `src/features/anak/ChartWHO.tsx`.

## Rencana

### A. Hapus 2 file JSON mati
Hapus kedua file. Verifikasi `npm run build` & `npm test` tetap hijau (tak ada
import yang putus).

### B. Dedupe fungsi pembulatan
Ekspor `roundPbToHalfStep` dari `zScore.ts` (sudah ada di sana). Di
`ChartWHO.tsx`, hapus `roundPb` lokal dan impor `roundPbToHalfStep` dari
`../pengukuran/zScore`. Pastikan perilaku identik (keduanya: frac==0.5 ->
tetap; frac<0.5 -> floor; selain itu floor+0.5).

Catatan: mengimpor dari `zScore.ts` ke `ChartWHO.tsx` tidak menambah berat
bundle ChartWHO secara signifikan karena ChartWHO sudah mengimpor 10 JSON yang
sama dengan zScore; tidak ada lazy-loading yang diubah di sub-proyek ini.

## Verifikasi
- `npm run lint`
- `npm test` (khususnya zScore.test.ts harus tetap hijau)
- `npm run build`

## Non-tujuan (YAGNI)
- Tidak lazy-load JSON (ditunda; compute tetap sinkron).
- Tidak memindah perhitungan ke backend.
- Tidak mengubah PengukuranForm.
