# Desain: Grafik WHO di ModePosyandu (Kader)

Tanggal: 2026-05-31

## Konteks

Grafik pertumbuhan WHO (`ChartWHO`, 4 tab: BB/TB/LK/Gizi) saat ini hanya
tampil di halaman detail balita `/kader/balita/:id` (`DetailAnak.tsx:130-139`),
yang dibuka kader lewat tombol "Riwayat" di `ModePosyandu`
(`ModePosyandu.tsx:111-113`).

Kader ingin grafik dapat dilihat **langsung dari ModePosyandu** tanpa
meninggalkan halaman list, sambil tetap menjaga flow ringkas project saat ini.

Di branch backup lama (`backup/main-2026-05-18`) chart hidup di satu page
bersama `src/pages/Detail/index.js` yang dipakai semua role (gated
`role !== "ORANG_TUA"`). Pada project saat ini sudah direfactor menjadi
komponen `ChartWHO` yang reusable.

## Tujuan

Tampilkan `ChartWHO` dari ModePosyandu via **modal overlay**, tanpa merusak
kemudahan scanning list kartu balita.

## Keputusan: Modal popup

Dipilih modal/drawer popup dibanding:
- **Expand inline di kartu** — `ChartWHO` tingginya min 500px + 4 tab; akan
  mendorong kartu lain jauh ke bawah dan merusak list yang scannable.
- **Mini sparkline** — butuh komponen chart baru + maintenance JSON WHO
  terpisah; menambah kompleksitas padahal `ChartWHO` lengkap sudah ada.

Modal sudah jadi pola di halaman ini (`PengukuranForm`, `FormInputDataAnak`
keduanya overlay dari ModePosyandu), sehingga konsisten, list tetap utuh di
belakang, dan tutup mengembalikan ke posisi semula.

## Arsitektur

```
ModePosyandu (state: chartAnak)
 |- BalitaCard  -- tombol "Grafik" -> onGrafik(anak)
 \- ChartModal  -- <Modal width=760><ChartWHO anak pengukuran /></Modal>
```

Prinsip:
- `ChartWHO` dipakai apa adanya, **nol perubahan**.
- Data `pengukuran` diambil dari `pengukuranByAnak[anak.id]` yang **sudah ada**
  di ModePosyandu (`usePengukuranBulananKader.ts:16` sudah memuat riwayat penuh
  via `pengukuranApi.list(anak.id, role)`). **Nol fetch tambahan**.
- **Tidak ada** route baru, query baru, atau dependency baru.

## Komponen baru: `src/features/kader/ChartModal.tsx`

Membungkus `Modal` shared (`components/ui/Modal.tsx`) + `ChartWHO`.

- Props: `anak` (Anak | null), `pengukuran` (array), `onClose` (() => void).
- `open` = `!!anak`.
- `width` di-override ke ~760 (default Modal 560 terlalu sempit untuk chart).
- `title` = nama anak.
- `footer` = null (atau tombol Tutup).
- Mengandalkan `destroyOnClose` dari `Modal` agar tab grafik reset tiap dibuka.

## Perubahan: `src/features/kader/BalitaCard.tsx`

- Tambah prop `onGrafik` ke signature `BalitaCard`.
- Tambah tombol kecil "Grafik" (ikon `LineChart` dari lucide-react) di kolom
  aksi (`BalitaCard.tsx:71-101`).
- Tombol **hanya muncul jika `meta.latest` ada** (minimal 1 pengukuran).
  Jika belum pernah diukur, grafik kosong sehingga tombol disembunyikan.
- Tombol tampil pada kedua state (sudah diukur & belum diukur bulan ini),
  selama `meta.latest` ada.

## Perubahan: `src/features/kader/ModePosyandu.tsx`

- State baru `chartAnak` (null | anak).
- Handler `handleGrafik(anak)` -> `setChartAnak(anak)`.
- Teruskan `onGrafik={() => handleGrafik(anak)}` ke `BalitaCard`.
- Render `<ChartModal anak={chartAnak} pengukuran={pengukuranByAnak[chartAnak?.id] ?? []} onClose={() => setChartAnak(null)} />`
  di sebelah modal lain (`ModePosyandu.tsx:202-213`).

Flow ringkas terjaga: list tidak berubah, modal overlay, tutup -> posisi sama.
Halaman detail `/kader/balita/:id` tetap ada untuk riwayat edit/hapus.

## Testing

- `BalitaCard`: tombol "Grafik" muncul saat `meta.latest` ada; tersembunyi saat
  `meta.latest` null; klik memanggil `onGrafik`.
- `ChartModal`: smoke test render saat `anak` diisi; tidak render konten saat
  `anak` null.
- Jalankan `vitest run` (target tetap PASS) + `npm run build` sukses.

## Out of scope

- Perubahan pada `ChartWHO` itu sendiri.
- Grafik untuk role lain (orangtua/tenkes/desa/admin).
- Mini chart / sparkline di kartu.
