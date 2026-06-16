# Gizi 4 Status untuk Kader dan Desa

## Tujuan
- Menyamakan seluruh tampilan gizi di area kader dan desa menjadi 4 status ringkas:
  - `normal`
  - `kurang`
  - `stunting`
  - `obesitas`
- Memakai satu sumber kebenaran untuk klasifikasi, yaitu `overallStatus` di `src/features/pengukuran/statusGizi.ts`.
- Mempertahankan perhitungan Z-score dan penyimpanan data pengukuran apa adanya.

## Bukan Tujuan
- Mengubah rumus Z-score, referensi WHO, atau data yang disimpan ke backend.
- Menghapus data indikator detail di level pengukuran.
- Mengubah endpoint API yang sudah ada.

## Keputusan Desain

### 1. Satu klasifikasi ringkas untuk semua ringkasan
`overallStatus` sudah menghasilkan tepat 4 status yang dibutuhkan. Fungsi ini akan menjadi sumber tunggal untuk:
- badge status di form/pengukuran,
- distribusi status di halaman kader,
- distribusi status di halaman desa,
- status per balita di tabel rekap.

### 2. Rekap kader memakai status ringkas, bukan indikator detail
Di area kader, rekap per balita dan rekap distribusi akan menampilkan satu dimensi status gizi, bukan gabungan `BB/U`, `TB/U`, `LK/U`, dan `BB/TB`.

Implikasi:
- `aggregateKaderPerBalita` akan mengeluarkan field status ringkas.
- `aggregateKaderLaporan` dan `aggregateKaderRekap` akan menghitung distribusi berdasarkan 4 status ringkas.
- Tabel yang sebelumnya menampilkan kolom indikator detail akan diganti menjadi kolom `Status Gizi`.

### 3. Rekap desa juga memakai status ringkas
Di area desa, rekap per posyandu dan total desa akan mengikuti status ringkas yang sama.

Implikasi:
- `aggregateDesaDariAnak` akan menghitung tiap balita ke salah satu dari 4 status ringkas.
- `LaporanDesa` dan `RekapTabel` akan menampilkan 4 kolom status yang sama dengan kader.
- Label kategori detail `gizi_buruk`, `gizi_kurang`, `gizi_baik`, `berisiko_gizi_lebih`, `gizi_lebih`, `obesitas` tidak lagi dipakai di rekap utama.

### 4. Data pengukuran tetap detail, tampilan rekap disederhanakan
Form pengukuran tetap menyimpan:
- `z_score_berat`
- `z_score_tinggi`
- `z_score_lingkar_kepala`
- `z_score_gizi`

Namun, saat data ditampilkan kembali di kader dan desa, yang dipakai adalah status ringkas dari `overallStatus`.

## Alur Data
1. User menyimpan pengukuran balita.
2. Aplikasi menghitung Z-score seperti biasa.
3. `overallStatus` mengubah Z-score menjadi salah satu dari 4 status.
4. Agregator kader dan desa menjumlahkan status ringkas itu.
5. UI menampilkan 4 status yang sama di semua ringkasan.

## Perubahan File Utama
- `src/features/pengukuran/statusGizi.ts`
  - Tetap jadi sumber klasifikasi.
  - Jika perlu, bisa ditambah helper kecil untuk memudahkan konsumsi lintas modul, tetapi logika status tetap di sini.
- `src/features/laporan/aggregateKader.ts`
  - Distribusi rekap kader memakai `overallStatus`.
  - `aggregateKaderPerBalita` mengembalikan satu status ringkas per balita.
- `src/features/laporan/aggregateDesa.ts`
  - `aggregateDesaDariAnak` menghitung 4 status ringkas per balita.
  - Struktur distribusi desa mengikuti status yang sama.
- `src/features/laporan/RekapPerBalitaTable.tsx`
  - Tabel per balita menampilkan satu kolom status gizi ringkas.
- `src/features/laporan/LaporanDesa.tsx`
  - Tabel desa menampilkan distribusi status ringkas yang sama.

## Testing
- `statusGizi.test.ts`
  - Verifikasi bahwa 4 status ringkas tetap benar di batas-batas Z-score.
- `aggregateKader.test.ts`
  - Pastikan rekap kader menghitung `normal/kurang/stunting/obesitas` dari `overallStatus`.
- `aggregateDesa.test.ts`
  - Pastikan rekap desa memakai status ringkas yang sama, bukan kategori detail BB/TB.
- Tambahkan atau ubah test UI bila tabel rekap berubah dari detail indikator ke status ringkas.

## Risiko dan Mitigasi
- Risiko: data summary desa dari API lama tidak cukup informasi untuk menghitung status ringkas secara akurat.
  - Mitigasi: prioritaskan kalkulasi dari data anak + pengukuran terakhir. Jika data rinci tidak tersedia, tampilkan fallback yang jelas daripada label yang menyesatkan.
- Risiko: perubahan tabel membuat beberapa test snapshot lama gagal.
  - Mitigasi: update test yang memang mengunci struktur tabel lama.

## Kriteria Selesai
- Kader dan desa sama-sama menampilkan 4 status ringkas.
- Tidak ada lagi tabel rekap utama yang memakai kategori gizi detail sebagai tampilan default.
- Test klasifikasi dan agregasi untuk 4 status lulus.
