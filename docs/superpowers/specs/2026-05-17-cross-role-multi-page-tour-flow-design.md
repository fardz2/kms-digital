# Cross-Role Multi-Page Tour Flow — Design

**Status:** Draft
**Date:** 2026-05-17
**Branch:** tour-all-roles
**Scope:** Ubah onboarding tour dari model per-role satu halaman menjadi flow per-role lintas banyak halaman dengan auto-navigation antar route, auto-show pertama kali, skip global per role, dan replay mulai dari halaman aktif sampai akhir flow.

---

## Context

Implementasi tour saat ini masih sederhana:
- `buildSteps(role)` di `src/features/tour/tourSteps.ts` hanya mengembalikan satu array step per role.
- `TourProvider` di `src/features/tour/TourProvider.tsx` hanya tahu role aktif, belum tahu route aktif.
- `useTour` di `src/features/tour/useTour.ts` hanya simpan flag selesai per role (`kms_tour_completed_<role>`).
- Replay selalu memulai ulang seluruh role flow, bukan dari halaman aktif.

Akibatnya:
1. Tour hanya efektif di halaman yang anchor-nya sudah ada pada flow tunggal role.
2. Tidak ada konsep urutan halaman, jadi `Next` tidak bisa auto-pindah route.
3. Subpage penting seperti semua halaman admin, akun orang tua kader, laporan kader, forum/detail forum, detail anak, dan halaman admin CRUD belum bisa menjadi bagian dari alur onboarding utuh.
4. Replay belum sesuai ekspektasi user: user ingin replay dari halaman aktif sampai akhir flow, bukan reset ke awal.

## Goals

- Setiap role punya **flow tour lintas halaman** yang eksplisit.
- `Next` bisa **auto navigate** ke route halaman berikutnya dalam flow.
- Auto-show pertama kali per role memulai flow dari awal role.
- `Skip` menghentikan seluruh flow role dan menandainya selesai.
- `Replay` dari halaman mana pun memulai dari **halaman saat ini** lalu lanjut sampai akhir flow role.
- Jika user sedang di halaman terakhir flow role, replay hanya memainkan step di halaman itu.
- Tour tetap bisa dibuka dari halaman mana saja lewat tombol Bantuan/replay.

## Non-Goals

- Tidak membuat dokumentasi panel terpisah atau help center baru.
- Tidak membuat state completion per-step permanen; completion tetap level flow role.
- Tidak menambah backend endpoint.
- Tidak mengubah library `antd` Tour.
- Tidak membuat auto-run ulang di setiap kunjungan setelah flow role selesai.

---

## Architecture

### Core Shift: Role Flow Manifest, Not Flat Step Array

Model saat ini `buildSteps(role)` perlu diganti menjadi manifest flow per role yang memuat:
- route canonical halaman
- step-step untuk halaman itu
- selector target atau fallback
- urutan global dalam flow role

Alih-alih “Admin punya 5 step”, model baru menjadi “Admin punya urutan halaman tour: dashboard → desa → posyandu → kader → tenaga kesehatan → artikel list → artikel form”, dan tiap halaman punya step lokal sendiri.

### Provider as Flow Controller

`TourProvider` menjadi controller lintas route dengan tanggung jawab:
- baca `role` dari `useSession()`
- baca `pathname` dari `useLocation()`
- lakukan navigation dengan `useNavigate()`
- resolve halaman aktif dalam flow role
- render hanya step yang relevan untuk halaman aktif
- saat user menekan `Next`, jika step berikutnya beda route maka provider pindah ke route itu dulu lalu lanjut step setelah DOM siap
- saat user menekan `Prev`, jika step sebelumnya ada di route lain maka provider juga bisa pindah balik

Ini berarti `TourProvider` tidak lagi hanya memanggil `buildSteps(role)` dan render `<Tour>`, tetapi mengelola **current flow state**.

### Tour State Model

`useTour` perlu diperluas dari model boolean sederhana menjadi state machine ringan:
- `isOpen`
- `activeFlowKey` (role aktif)
- `activeStepId` atau `activeStepIndex`
- `isTransitioningRoute`
- helper `startFromBeginning(role)`
- helper `replayFromPath(role, pathname)`
- helper `goNext()`
- helper `goPrev()`
- helper `skipFlow()`
- helper `finishFlow()`

Local storage tetap dipakai untuk completion final per role, tetapi bukan untuk step index persist permanen. Session aktif boleh disimpan di memory saja karena replay/autoshow bisa dihitung ulang dari manifest dan pathname.

### Route-Aware Replay Behavior

Perilaku replay final:
- auto-show pertama kali role → mulai dari step pertama flow role
- replay dari halaman aktif → cari step pertama pada halaman aktif itu dalam flow role, lalu mulai dari sana
- jika halaman aktif tidak termasuk flow role, replay fallback ke step pertama flow role atau tidak tampil (keputusan implementasi: fallback ke step pertama)
- jika halaman aktif adalah halaman terakhir role, replay hanya menampilkan step-step halaman itu

---

## Flow Model

### Proposed Types

Contoh bentuk data, bukan final exact API:

```ts
type TourFlowStep = {
  id: string;
  role: Role;
  route: string;
  title: string;
  description: string;
  targetSelector: string | null;
  fallbackSelector?: string | null;
  placement?: TourStepProps['placement'];
};

type TourRoleFlow = {
  role: Role;
  steps: TourFlowStep[];
};
```

Semua step hidup dalam satu urutan linear per role. Route hanya jadi metadata untuk controller.

### Route Matching

Karena beberapa route dinamis (`/orangtua/forum/:id`, `/kader/balita/:id`, `/tenkes/balita/:id`), manifest perlu route matcher, bukan sekadar string compare biasa. Solusi paling aman:
- simpan `routePattern`
- gunakan matcher ringan berbasis `matchPath` dari `react-router-dom`

Ini menghindari bug saat replay dari detail route.

---

## Role Flow Scope

### 1. Admin

Admin harus mencakup semua halaman utama area admin:
- `/admin/dashboard`
- `/admin/dashboard/desa`
- `/admin/dashboard/posyandu`
- `/admin/dashboard/kader-posyandu`
- `/admin/dashboard/tenaga-kesehatan`
- `/admin/dashboard/artikel`
- `/admin/dashboard/artikel/baru`

Tema step:
- dashboard summary + activity + sidebar
- halaman desa: header, stat bar, tabel, tambah desa
- halaman posyandu: header, stat bar, tabel, tambah/edit
- halaman kader: stat bar, filter/tabel, tambah/edit
- halaman tenaga kesehatan: stat bar, tabel, tambah
- artikel list: stat bar, tabel, tombol tulis
- artikel form: kategori, cover, editor, submit

### 2. Kader Posyandu

Flow utama:
- `/kader/balita`
- `/kader/orangtua`
- `/kader/laporan`
- `/kader/balita/:id`

Tema step:
- mode posyandu harian
- akun orang tua pending/aktif
- laporan bulanan
- detail balita dan riwayat

### 3. Orang Tua

Flow utama:
- `/orangtua/balita`
- `/orangtua/balita/:id`
- `/orangtua/forum`
- `/orangtua/forum/:id`
- `/artikel`
- `/artikel/:id`

Tema step:
- tambah anak / daftar anak
- detail pertumbuhan anak
- forum dan detail diskusi
- artikel list dan artikel detail

### 4. Tenaga Kesehatan

Flow utama:
- `/tenkes/forum`
- `/tenkes/balita/:id`
- `/artikel`
- `/artikel/:id`

Tema step:
- list pertanyaan
- detail pertanyaan + jawaban
- artikel sebagai materi edukasi pendukung

### 5. Desa

Flow utama:
- `/desa/beranda`

Desa saat ini tetap satu route, tetapi tetap memakai model flow baru agar konsisten dan mudah diperluas.

---

## Controller Behavior

### Auto-Show First Time

Saat user login dan berada pada role tertentu:
1. cek localStorage completion role
2. jika belum selesai, mulai flow dari step awal role
3. jika route aktif bukan route step awal, provider otomatis navigate ke route awal role
4. setelah route siap dan target render, tampilkan step pertama

### Next Across Pages

Saat `Next` ditekan:
1. tentukan step berikutnya
2. jika route sama, naik index biasa
3. jika route berbeda, navigate ke route step berikutnya
4. tunggu route render + target siap
5. tampilkan step berikutnya

### Prev Across Pages

Saat `Prev` ditekan:
1. tentukan step sebelumnya
2. jika route berbeda, navigate balik ke route itu
3. render step sebelumnya

### Skip

`Skip` harus:
- close tour
- tandai flow role selesai di localStorage
- buang session progress aktif

### Finish

`Finish` harus:
- close tour
- tandai flow role selesai
- buang session progress aktif

### Replay From Current Page

Saat `replay()` dipanggil:
1. cari role aktif
2. cari step pertama di pathname aktif
3. jika ada, mulai dari sana
4. jika tidak ada step cocok, fallback ke step pertama role
5. jalankan flow sampai akhir role

---

## DOM Target Strategy

Model multi-page ini butuh anchor jauh lebih banyak. Beberapa file yang kemungkinan perlu `data-tour-id` baru:

### Kader
- `src/features/kader/ModePosyandu.tsx`
- `src/features/kader/PosyanduHeader.tsx`
- `src/features/kader/AkunOrangTuaPage.tsx`
- `src/features/laporan/LaporanBulananKader.tsx`
- `src/features/anak/DetailAnak.tsx`

### Orang Tua / Tenkes / Artikel
- `src/features/orangtua/BerandaOT.tsx`
- `src/pages/Post/index.tsx`
- `src/pages/DetailForum/index.tsx` atau file actual detail forum
- `src/features/anak/DetailAnak.tsx`
- `src/features/artikel/ArtikelList.tsx`
- `src/features/artikel/ArtikelDetailPage.tsx`

### Desa
- `src/features/desa/BerandaDesa.tsx`
- `src/features/desa/ExportDesaForm.tsx`
- `src/features/desa/AcaraSection.tsx`
- `src/features/laporan/LaporanDesa.tsx`

### Admin
- `src/features/admin/AdminDashboard.tsx`
- `src/features/admin/AdminActivityFeed.tsx`
- `src/components/layout/Dashboard/Sidebar.tsx`
- `src/pages/AdminDashboard/InputDesa.tsx`
- `src/pages/AdminDashboard/InputPosyandu.tsx`
- `src/pages/AdminDashboard/RegisterKaderPosyandu.tsx`
- `src/pages/AdminDashboard/RegisterTenagaKesehatan.tsx`
- `src/pages/AdminDashboard/ArtikelList.tsx`
- `src/pages/AdminDashboard/ArtikelForm.tsx`

---

## Error Handling and Robustness

### Missing Target

Karena flow lintas halaman lebih rawan target belum siap:
- target helper harus tetap support fallback selector
- provider harus punya retry kecil setelah navigation
- jika target tetap tidak ada, step masih boleh tampil sebagai center step daripada crash

### Lazy Routes

Admin pages memakai lazy route di `src/routes/AppRoutes.tsx:25`. Jadi controller harus menunggu lazy component selesai mount sebelum menampilkan step berikutnya.

### Dynamic Detail Pages

Route detail seperti `/orangtua/forum/:id` dan `/kader/balita/:id` butuh data nyata. Jika flow diarahkan ke detail page, provider harus memakai route yang memang bisa diakses dari UI state sekarang. Jika tidak ada ID valid, halaman detail tidak boleh dimasukkan ke auto-start flow default. Ini perlu keputusan implementasi konservatif:
- halaman detail hanya masuk replay jika user memang sudah ada di route itu
- auto-show pertama kali role cukup mencakup halaman list/utama yang canonical

Ini penting supaya flow tidak mencoba navigate ke detail page tanpa ID.

---

## Recommended Scope Trim

Agar aman untuk implementasi pertama:
- **Auto-show awal role** fokus ke halaman canonical non-dynamic terlebih dahulu
- **Replay dari halaman aktif** mendukung dynamic pages jika user memang sedang di sana
- Dynamic detail pages tetap punya step dan manifest, tetapi tidak dijadikan route awal auto-flow

Dengan begitu:
- admin bisa benar-benar lintas semua halaman utama
- role lain bisa lintas halaman utama + detail saat replay dari page itu
- risiko route invalid lebih kecil

---

## Testing Strategy

### Unit / Integration

Butuh test baru untuk controller tour:
- build flow by role
- resolve start step from pathname
- next across same route
- next across different route triggers navigate
- replay from current route starts at local page step
- final page replay only shows final-page slice
- skip marks role complete

### Manual QA

Per role cek:
- auto-show pertama kali
- `Next` pindah halaman otomatis
- `Prev` jika didukung tetap konsisten
- `Skip` menghentikan flow
- replay dari halaman tengah mulai dari situ
- replay dari halaman akhir stay di halaman akhir saja

### Verification Commands

```bash
rtk npm test
rtk tsc --noEmit
rtk npm run build
```

---

## Success Criteria

- Tour admin berpindah otomatis dari dashboard ke semua halaman admin utama.
- Role lain juga punya flow lintas halaman utama yang relevan.
- Auto-show pertama kali per role mulai dari awal flow role.
- Replay dari halaman aktif dimulai dari halaman itu sampai akhir flow.
- Replay di halaman terakhir hanya menampilkan step halaman itu.
- Skip menghentikan flow dan menandai role selesai.
- Tidak ada crash saat target belum ada, route lazy belum siap, atau halaman detail tidak valid.

---

## Open Decisions Resolved

- **Model final:** multi-page flow per role
- **Navigation:** otomatis saat `Next`
- **Auto-show:** pertama kali per role
- **Replay:** mulai dari halaman aktif, lalu ke akhir
- **Halaman terakhir:** replay lokal di sana saja
- **Skip:** menyelesaikan flow role sepenuhnya
