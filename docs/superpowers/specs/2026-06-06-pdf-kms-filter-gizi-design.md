# Desain: Fitur Baru - PDF Kartu KMS + Filter Status Gizi (Sub-proyek 4)

Tanggal: 2026-06-06

## Tujuan

Dua fitur bernilai pengguna: (1) unduh kartu KMS per anak sebagai PDF, dan
(2) filter daftar balita berdasarkan status gizi spesifik.

## Stack

React 19 + Vite + js-html2pdf (sudah dependency) + Vitest. Tanpa dependensi
baru.

## Fitur A: PDF Kartu KMS per anak

Lokasi: `src/features/anak/DetailAnak.tsx`. Akses: semua yang dapat membuka
DetailAnak (Kader & Orang Tua). Isi PDF: identitas anak (nama, umur, gender,
status gizi terkini), riwayat pengukuran, dan grafik WHO.

Pendekatan (mengikuti pola `ExportDesaForm.handlePrintPdf`):
- Tambah `printableRef` (useRef) yang membungkus area konten DetailAnak yang
  ingin masuk PDF (identitas + riwayat + grafik).
- Tambah tombol "Unduh Kartu KMS (PDF)" memakai komponen `Button`
  (leadingIcon Printer/Download). Tombol DISABLED saat: data belum load
  (`anakLoading`), tidak ada pengukuran (grafik & riwayat kosong), atau sedang
  proses cetak (`isPrinting`).
- Handler async: `const html2pdfModule = await import('js-html2pdf')` lalu
  `html2pdf(printableRef.current, opt).save()`. Filename:
  `Kartu-KMS-<namaAnak>-<YYYY-MM-DD>.pdf`. opt sama seperti ExportDesaForm
  (a4, portrait, scale 2, useCORS, background putih).
- Error handling: try/catch + toast (sukses/gagal). Karena grafik adalah
  canvas Chart.js, html2canvas (di dalam js-html2pdf) menangkapnya; pastikan
  chart sudah ter-render (tombol hanya aktif saat ada data, jadi ChartWHO
  sudah mounted).

Catatan ekstraksi: untuk kebersihan, logika cetak boleh diekstrak ke util
kecil `src/utils/printElementToPdf.ts` (param: element, filename) agar tidak
menduplikasi blok html2pdf dari ExportDesaForm. Opsional namun disarankan;
rencana akan memutuskan. Tidak mengubah ExportDesaForm di sub-proyek ini
(YAGNI), util dipakai oleh DetailAnak saja dulu.

## Fitur B: Filter status gizi di ModePosyandu

Lokasi: `src/features/kader/ModePosyandu.tsx` + `src/features/kader/FilterChip.tsx`.
Status tersedia (statusGizi.ts): normal, kurang, stunting, obesitas, unknown.

- Tambah opsi chip baru di FilterChip: `stunting`, `kurang`, `obesitas`
  (label pakai STATUS_LABEL). Chip lama tetap: semua, belum, perhatian.
- Logika filter di ModePosyandu: untuk key status spesifik, tampilkan hanya
  balita dengan `meta.status === <key>`. `meta.status` sudah dihitung oleh
  classifyBalita.
- counts: tambahkan hitungan per status (jumlah balita dengan status itu)
  agar badge chip akurat.
- FilterChip saat ini memakai daftar OPTIONS internal tetap. Ubah agar bisa
  menerima opsi tambahan ATAU tambahkan opsi status langsung di OPTIONS.
  Rencana memutuskan cara paling sederhana (kemungkinan: extend OPTIONS +
  pakai STATUS_LABEL).

## Verifikasi
- `npm run lint`
- `npm test` (tambah test: util print bila diekstrak; logika filter status)
- `npm run build`

## Non-tujuan (YAGNI)
- Tidak mengubah ExportDesaForm.
- Tidak menambah filter umur (hanya status).
- Tidak menambah PDF untuk peran lain selain via DetailAnak.
- Tidak menyimpan/upload PDF ke server (unduh lokal saja).
