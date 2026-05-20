# User Guide Web + PPTX Export — Design

**Status:** Draft  
**Date:** 2026-05-20  
**Scope:** Buat user guide berbasis web yang bisa dibaca langsung dari URL dan diekspor ke file `.pptx` dari source konten yang sama. Guide harus detail, per role, dan menjelaskan alur kerja nyata agar user bisa mengikuti langkah demi langkah.

---

## Context

KMS Digital saat ini sudah punya struktur route dan halaman yang cukup jelas untuk tiap role:
- Admin: dashboard + desa + posyandu + kader + tenaga kesehatan + artikel
- Desa: beranda, laporan, ekspor, acara
- Kader Posyandu: mode posyandu, akun orang tua, laporan bulanan
- Tenaga Kesehatan: forum dan detail jawaban
- Orang Tua: beranda anak, forum, artikel

Di beberapa halaman juga sudah ada `data-tour-id` dan flow tour per role. Itu bagus sebagai basis guide karena:
- route dan target UI sudah terstruktur
- screenshot dapat diambil dari state UI yang stabil
- guide dapat dipetakan langsung ke alur kerja aktual, bukan sekadar daftar menu

Masalah yang ingin diselesaikan:
1. User guide belum ada dalam bentuk yang bisa diakses online.
2. Materi training masih berpotensi terpisah antara dokumentasi web dan file presentasi.
3. Kita butuh format yang detail, naratif, dan mudah diikuti oleh user non-teknis.

---

## Goals

- Satu source of truth untuk konten guide.
- User dapat membuka guide lewat URL website.
- User dapat mengunduh versi `.pptx` dari konten yang sama.
- Isi guide dibuat per role dan mengikuti alur kerja nyata.
- Setiap role menjelaskan:
  - tujuan role
  - route/halaman utama
  - langkah kerja
  - hasil yang diharapkan
  - tips atau kesalahan umum
- Screenshot diambil dari UI codingan, bukan dibuat manual.
- Output PPTX harus siap dipakai untuk training atau presentasi.

---

## Non-Goals

- Tidak membuat PDF export.
- Tidak membuat CMS editorial terpisah.
- Tidak membuat login khusus untuk access guide.
- Tidak mengganti struktur role atau route aplikasi.
- Tidak membuat dokumentasi yang terpisah dari source konten utama.

---

## Recommended Approach

Gunakan model **web-first + PPTX second**:

1. Konten guide disimpan dalam struktur data TypeScript.
2. Halaman web membaca struktur data itu dan merender guide per role.
3. Export PPTX membaca struktur data yang sama.
4. Playwright membuka route aplikasi yang relevan dan mengambil screenshot otomatis.
5. `PptxGenJS` menyusun slide dari teks + screenshot.

Ini menjaga satu sumber data, meminimalkan duplikasi, dan membuat update guide cukup dilakukan di satu tempat.

---

## Architecture

### 1. Content Source of Truth

Satu file data utama, misalnya:
- `src/features/user-guide/data/guideContent.ts`

Isi file ini memuat:
- daftar role
- judul guide per role
- ringkasan role
- daftar section per role
- langkah per section
- route yang terkait
- selector screenshot atau anchor
- hasil akhir yang diharapkan
- tips

Struktur data harus cukup kaya untuk:
- render web guide
- render slide PPTX
- menentukan route screenshot

### 2. Web Guide Page

Halaman web, misalnya:
- `/user-guide`

Halaman ini menampilkan:
- hero section
- navigasi sidebar per role
- konten per role dalam section terstruktur
- screenshot dan callout langkah
- tombol `Download PPTX`

Halaman ini menjadi versi baca online dari deck.

### 3. Export Pipeline

Export PPTX dijalankan dari satu endpoint atau handler server-side:
- frontend request export
- server membaca data guide
- server membuka route yang diperlukan memakai Playwright
- server mengambil screenshot per langkah/section
- server menyusun slide dengan PptxGenJS
- server mengirim file `.pptx` ke browser

### 4. Screenshot Strategy

Screenshot harus diambil dari state UI yang stabil. Prinsipnya:
- gunakan route yang sudah ada
- gunakan anchor/selector yang sudah eksplisit
- prioritas ke screenshot per section atau langkah besar, bukan mentah semua halaman
- jika area penting hanya sebagian, ambil screenshot element-based
- jika perlu konteks penuh, ambil full-page screenshot

---

## Content Model

### Proposed Types

```ts
type GuideRoleId = 'ADMIN' | 'DESA' | 'KADER_POSYANDU' | 'TENAGA_KESEHATAN' | 'ORANG_TUA';

type GuideStep = {
  id: string;
  label: string;
  action: string;
  result: string;
  route: string;
  targetSelector?: string;
};

type GuideSection = {
  id: string;
  title: string;
  purpose: string;
  route: string;
  steps: GuideStep[];
  expectedResult: string;
  tips?: string[];
  screenshotHint?: string;
};

type GuideRole = {
  id: GuideRoleId;
  title: string;
  summary: string;
  accentColor: string;
  sections: GuideSection[];
};
```

### Required Fields

- `title` dan `summary` untuk pembuka role.
- `sections[]` untuk alur kerja.
- `steps[]` untuk urutan aksi konkret.
- `route` untuk screenshot dan konteks halaman.
- `targetSelector` untuk elemen yang perlu disorot.
- `expectedResult` untuk menegaskan hasil yang benar.

### Why This Shape

Model ini menjaga konten tetap naratif, tetapi masih mudah dipakai mesin:
- web renderer bisa tampilkan section yang rapi
- PPTX generator bisa pecah menjadi slide-slide yang konsisten
- Playwright bisa mengambil screenshot dari route/selector yang sudah pasti

---

## Role Structure

### Admin

Peran admin harus dijelaskan sebagai alur kerja lengkap:
- masuk dashboard
- baca statistik
- kelola desa
- kelola posyandu
- kelola kader
- kelola tenaga kesehatan
- kelola artikel
- tulis artikel baru

### Desa

Peran desa fokus pada:
- membaca laporan desa
- ekspor CSV
- ekspor PDF
- kelola acara posyandu

### Kader Posyandu

Peran kader fokus pada:
- mode posyandu
- cari dan filter balita
- ukur balita
- kelola akun orang tua
- baca laporan bulanan
- tambah balita baru

### Tenaga Kesehatan

Peran tenaga kesehatan fokus pada:
- buka forum
- membaca pertanyaan
- buka detail forum
- mengirim jawaban

### Orang Tua

Peran orang tua fokus pada:
- buka beranda anak
- tambah anak
- buka forum
- menulis pertanyaan
- membaca artikel edukasi

---

## Web UX

### Layout

- sidebar kiri untuk navigasi role
- konten utama di kanan
- header atas berisi judul, ringkasan, dan tombol download
- section per role dengan anchor yang bisa dibagikan

### Readability Rules

- satu slide/section menjelaskan satu langkah besar
- teks singkat, alur jelas
- screenshot besar dan mudah dibaca
- callout angka untuk menandai urutan
- label route ditampilkan saat berpindah halaman agar user tidak bingung

### Mobile Behavior

- sidebar berubah menjadi tab/accordion
- download button tetap mudah diakses
- screenshot tetap bisa discroll tanpa layout pecah

---

## PPTX Rules

### Deck Shape

- cover
- overview
- section per role
- FAQ / bantuan

### Slide Content

Setiap slide idealnya berisi:
- judul
- tujuan slide
- langkah ringkas
- screenshot
- hasil yang diharapkan
- tips singkat bila perlu

### Design Consistency

- warna role konsisten antara web dan PPTX
- screenshot dan label step sama dengan web guide
- deck harus terasa seperti versi presentasi dari web, bukan konten baru

### Output

- format output hanya `.pptx`
- nama file default, misalnya `KMS-Digital-User-Guide.pptx`

---

## Export Flow

### Recommended Server-Side Flow

1. User buka `/user-guide`
2. User klik `Download PPTX`
3. Frontend kirim request export
4. Server baca guide content
5. Server render route yang dibutuhkan via Playwright
6. Server ambil screenshot per section/step
7. Server susun slide via PptxGenJS
8. Server kirim `.pptx` ke browser

### Why Server-Side

- lebih stabil untuk screenshot
- tidak membebani browser user
- layout lebih konsisten
- mudah diotomasi

### Alternative That We Should Not Use First

- full client-side PPTX generation
- manual screenshot upload
- konten guide terpisah dari source data

---

## Error Handling

### Missing Screenshot Target

Jika selector tidak ada:
- exporter boleh retry singkat
- kalau tetap gagal, slide harus tetap bisa dibuat dengan fallback screenshot full-page atau panel text-only
- exporter tidak boleh crash total jika satu target gagal

### Dynamic Routes

Route seperti detail forum atau detail balita hanya boleh dipakai jika ada konteks valid.
Jika tidak ada ID yang bisa diakses, route detail tidak dijadikan route awal export default.

### Lazy-Loaded Pages

Karena beberapa halaman dimuat lazy, exporter harus menunggu DOM siap sebelum mengambil screenshot.

### Network or Data Failure

Jika data halaman tidak tersedia:
- tampilkan placeholder yang jelas di web guide
- pada export, tulis slide dengan state fallback dan catatan singkat

---

## Verification Strategy

### Unit / Integration

Butuh test untuk:
- struktur konten guide per role
- render section web
- routing anchor per section
- trigger export
- peran Playwright screenshot helper

### Manual QA

Per role cek:
- web guide tampil benar
- tiap role punya alur yang kebayang
- link section mengarah ke role yang benar
- tombol download menghasilkan file `.pptx`

### Build Checks

```bash
rtk npm test
rtk tsc --noEmit
rtk npm run build
```

---

## Success Criteria

- User bisa baca guide via URL website.
- User bisa download file `.pptx` dari guide yang sama.
- Konten per role detail, naratif, dan mudah diikuti.
- Screenshot dihasilkan dari UI aplikasi yang nyata.
- Tidak ada duplikasi konten antara web guide dan PPTX.
- Admin, Desa, Kader Posyandu, Tenaga Kesehatan, dan Orang Tua semuanya punya alur yang jelas.

---

## Implementation Notes

- Gunakan konten yang sumbernya satu file.
- Prioritaskan section yang paling sering dipakai user.
- Jangan terlalu padat di satu slide.
- Jika sebuah role punya alur yang panjang, pecah menjadi section yang lebih kecil agar deck tidak melelahkan.

