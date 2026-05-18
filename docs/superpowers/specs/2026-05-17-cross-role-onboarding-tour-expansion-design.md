# Cross-Role Onboarding Tour Expansion — Design

**Status:** Draft
**Date:** 2026-05-17
**Branch:** staging
**Scope:** Perjelas onboarding tour untuk semua role login dengan step lebih spesifik, instruktif, dan mudah dipahami tanpa mengubah mekanisme auto-show/replay yang sudah ada.

---

## Context

KMS Digital sudah punya onboarding tour berbasis role yang auto-show saat login pertama dan bisa di-replay lewat tombol Bantuan.

Implementasi saat ini:
- Step config per role di `src/features/tour/tourSteps.ts`
- Render tour global di `src/features/tour/TourProvider.tsx`
- Completion flag per role di `src/features/tour/useTour.ts`
- Replay button di navbar/sidebar

Masalah saat ini:
1. Isi tour masih terlalu singkat dan generik, jadi user belum cukup paham alur kerja nyata.
2. Coverage antar role belum seimbang — Tenkes baru punya intro umum, Desa/Admin masih minim anchor detail.
3. Beberapa area kerja penting belum punya `data-tour-id`, jadi tour belum bisa menunjuk elemen inti yang benar-benar dipakai user.
4. User ingin tour tetap sederhana secara perilaku: muncul per role saat login, bukan tour terpisah per halaman atau wizard dokumentasi panjang.

## Goals

- Pertahankan pola **1 tour per role login**.
- Buat isi tour tiap role jauh lebih detail, spesifik, dan instruktif.
- Tambah anchor `data-tour-id` pada elemen yang benar-benar penting bagi alur kerja user.
- Pastikan replay tetap bekerja dari halaman aktif role tersebut.
- Minimalkan risiko dengan tidak mengubah sistem open/close/replay/completion flag.

## Non-Goals

- Tidak mengubah tour menjadi route-aware atau multi-tour per halaman.
- Tidak membuat panel dokumentasi, help center, atau wizard baru.
- Tidak mengubah library `antd` Tour.
- Tidak mengubah perilaku localStorage completion menjadi per-route.
- Tidak menambah backend endpoint atau data fetching baru.

---

## Architecture

### Keep Existing Runtime Model

Arsitektur dasar tetap sama:
- `TourProvider` tetap render satu `<Tour>` di root aplikasi.
- `useTour(role, true)` tetap kontrol auto-show dan replay per role.
- `buildSteps(role)` tetap menghasilkan daftar step berdasarkan role aktif.
- Completion flag tetap `kms_tour_completed_<role>`.

Alasan:
- Sesuai permintaan user: tour per role saja saat login.
- Risiko rendah karena perilaku existing tidak dirombak.
- Perubahan fokus ke kualitas isi step dan kualitas target DOM.

### Expand Step Depth, Not Flow Complexity

Perubahan inti ada di dua area:
1. **Rewrite step copy** agar lebih instruktif.
2. **Tambah `data-tour-id`** agar step bisa menunjuk area kerja yang lebih spesifik.

Setiap step harus menjawab paling tidak satu dari ini:
- elemen ini dipakai untuk apa
- kapan user memakainya
- hasil apa yang didapat setelah klik/isi aksi itu

Format copy yang diinginkan:
- bukan: “Ini menu laporan”
- tetapi: “Gunakan menu ini untuk melihat rekap bulanan balita yang sudah dan belum diukur, lalu tentukan tindak lanjut posyandu.”

---

## Tour Content Strategy

### Step Count

Target per role: **6–12 step**.

Prinsip:
- cukup detail untuk onboarding nyata
- tidak terlalu panjang sampai melelahkan
- urutan selalu: orientasi → area kerja utama → aksi penting → hasil kerja

### Copy Rules

Semua step ditulis dalam Bahasa Indonesia, nada jelas dan operasional.

Setiap step sebaiknya:
- menyebut fungsi nyata elemen
- menyebut konteks penggunaan
- menyebut outcome singkat

Hindari copy yang terlalu abstrak seperti “fitur ini membantu Anda”.
Lebih baik copy yang konkret seperti “klik kartu anak untuk membuka detail riwayat pengukuran dan memantau perubahan dari bulan ke bulan”.

### Target Rules

- Pakai `data-tour-id` pada wrapper stabil, bukan elemen yang sering conditional/hilang.
- Jika satu area kompleks, target wrapper besar lebih aman daripada tombol mikro.
- Jika satu aksi sangat penting untuk onboarding, boleh target tombol spesifik.

---

## Role-by-Role Design

### 1. Kader Posyandu

**Current state:** sudah punya baseline step, tapi belum cukup menjelaskan area kerja inti.

**Tour intent:** bantu kader paham alur hari posyandu dari melihat daftar balita sampai input pengukuran dan tindak lanjut.

**Target coverage:**
- intro halaman mode posyandu
- pencarian balita
- filter status
- progress/rekap bulan berjalan
- daftar/kartu balita
- tombol ukur/aksi utama
- Akun Orang Tua
- tombol laporan
- tambah balita baru

**Expected guidance themes:**
- cara memprioritaskan balita yang belum diukur atau perlu perhatian
- cara masuk ke proses pengukuran
- cara pindah ke pengelolaan akun orang tua
- cara melihat rekap bulanan

**Likely file changes:**
- `src/features/tour/tourSteps.ts`
- `src/features/kader/ModePosyandu.tsx`
- `src/features/kader/PosyanduHeader.tsx`

### 2. Orang Tua

**Current state:** punya intro, tambah anak, forum, artikel; belum cukup menjelaskan kartu anak dan alur pemantauan.

**Tour intent:** bantu orang tua paham bahwa aplikasi dipakai untuk 3 hal: daftar anak, pantau pertumbuhan, bertanya dan belajar.

**Target coverage:**
- intro beranda orang tua
- tombol tambah anak
- daftar/kartu anak
- forum tanya jawab
- artikel kesehatan
- navbar/arah navigasi utama bila relevan dan stabil

**Expected guidance themes:**
- mulai dari tambah anak bila data belum ada
- buka kartu anak untuk lihat detail pertumbuhan
- gunakan forum saat butuh jawaban dari tenaga kesehatan
- gunakan artikel untuk edukasi mandiri

**Likely file changes:**
- `src/features/tour/tourSteps.ts`
- `src/features/orangtua/BerandaOT.tsx`

### 3. Tenaga Kesehatan

**Current state:** gap terbesar; hanya intro umum tanpa anchor nyata.

**Tour intent:** bantu tenaga kesehatan paham bahwa forum adalah area kerja utama untuk membaca pertanyaan, membuka detail, dan memberi jawaban.

**Target coverage:**
- intro forum tenkes
- daftar pertanyaan
- kartu/entri pertanyaan
- aksi buka detail / jawab pertanyaan
- jawaban existing bila ada sebagai contoh alur diskusi

**Expected guidance themes:**
- baca daftar pertanyaan terbaru dari orang tua
- buka detail untuk melihat konteks penuh
- balas dengan jawaban yang relevan di halaman detail

**Likely file changes:**
- `src/features/tour/tourSteps.ts`
- `src/pages/Post/index.tsx`

### 4. Pemerintah Desa

**Current state:** baru intro + acara; area export dan laporan belum dijelaskan.

**Tour intent:** bantu pihak desa paham bahwa halaman ini dipakai untuk memantau rekap desa, ekspor data, dan mengelola acara.

**Target coverage:**
- intro dashboard desa
- section laporan/ringkasan gizi
- export data
- export PDF bila ada blok terpisah
- section acara
- form tambah acara / daftar acara jika anchor stabil

**Expected guidance themes:**
- lihat ringkasan kondisi gizi skala desa
- gunakan export untuk pelaporan
- buat acara untuk koordinasi kegiatan posyandu

**Likely file changes:**
- `src/features/tour/tourSteps.ts`
- `src/features/desa/BerandaDesa.tsx`
- `src/features/desa/ExportDesaForm.tsx`
- `src/features/desa/AcaraSection.tsx`
- mungkin `src/features/laporan/LaporanDesa.tsx` bila perlu anchor lebih presisi

### 5. Admin

**Current state:** tour ada, tapi masih terlalu high-level.

**Tour intent:** bantu admin paham dashboard sebagai pusat kontrol data master, statistik ringkas, aktivitas terbaru, dan navigasi ke halaman kelola.

**Target coverage:**
- intro dashboard admin
- statistik ringkas
- activity feed
- sidebar/menu master
- link/area artikel
- tombol bantuan replay tetap bisa disebut bila relevan

**Expected guidance themes:**
- baca statistik untuk gambaran sistem
- gunakan sidebar untuk pindah ke entitas yang ingin dikelola
- gunakan activity feed untuk memantau perubahan terbaru
- masuk ke artikel untuk kelola konten edukasi

**Likely file changes:**
- `src/features/tour/tourSteps.ts`
- `src/features/admin/AdminDashboard.tsx`
- `src/features/admin/AdminActivityFeed.tsx`
- `src/components/layout/Dashboard/Sidebar.tsx`

---

## Implementation Boundaries

### What Will Change

- Rewrite penuh isi step per role di `src/features/tour/tourSteps.ts`
- Tambah `data-tour-id` baru di area penting yang belum punya target
- Mungkin pecah beberapa target broad menjadi target yang lebih jelas jika dibutuhkan

### What Will Not Change

- API `useTourContext()`
- mekanisme `replay()`
- `TourProvider` open/close wiring
- localStorage completion semantics
- tombol Bantuan existing di navbar/sidebar

---

## Error Handling and Robustness

- Jika target selector tidak ditemukan, step intro tetap harus aman karena target `null` sudah didukung pola existing.
- Untuk target baru, pilih wrapper yang selalu render pada halaman utama role tersebut.
- Hindari selector pada item list yang bergantung pada data pertama bila ada risiko kosong, kecuali komponen memang selalu punya fallback wrapper yang render.
- Bila satu area punya state kosong dan state berisi, lebih aman target section wrapper daripada item pertama.

---

## Testing Strategy

### Manual

Verifikasi utama per role:
1. login pertama role → tour auto-show
2. copy tiap step terbaca jelas dan relevan
3. highlight menempel ke area yang benar
4. klik next/finish/close tetap normal
5. tombol Bantuan memunculkan ulang tour role tersebut

Role yang harus dicek:
- Kader Posyandu
- Orang Tua
- Tenaga Kesehatan
- Desa
- Admin

### Automated / Verification Commands

Gunakan command existing dengan `rtk`:

```bash
rtk npm test -- --watchAll=false
rtk npm run lint
rtk tsc --noEmit
rtk npm run build
```

Jika ada command repo yang berbeda untuk lint/typecheck, sesuaikan setelah cek `package.json`.

---

## File Scope

### Primary
- `src/features/tour/tourSteps.ts`

### Target Anchor Files
- `src/features/kader/ModePosyandu.tsx`
- `src/features/kader/PosyanduHeader.tsx`
- `src/features/orangtua/BerandaOT.tsx`
- `src/pages/Post/index.tsx`
- `src/features/desa/BerandaDesa.tsx`
- `src/features/desa/ExportDesaForm.tsx`
- `src/features/desa/AcaraSection.tsx`
- `src/features/laporan/LaporanDesa.tsx` (jika perlu)
- `src/features/admin/AdminDashboard.tsx`
- `src/features/admin/AdminActivityFeed.tsx`
- `src/components/layout/Dashboard/Sidebar.tsx`

---

## Success Criteria

- Semua role punya tour yang lebih jelas, spesifik, dan operasional.
- Tenkes tidak lagi hanya punya intro umum.
- Area inti tiap role punya anchor yang cukup untuk menjelaskan alur kerja nyata.
- Replay via Bantuan tetap berjalan.
- Tidak ada perubahan perilaku fundamental pada sistem tour existing.
- Test, lint, typecheck, dan build lulus.

---

## Open Decisions Resolved

Keputusan final untuk scope ini:
- **Tour tetap per role, bukan per halaman.**
- **Isi dibuat lebih detail dan spesifik, bukan sistem baru.**
- **Semua role login masuk scope.**
- **Fokus perubahan pada copy + target anchor.**
