# KMS Digital — Manual Regression Checklist

Dijalankan sebelum merge tiap PR besar atau rilis ke production.

## Automated Tests

Jalankan sebelum manual testing:
```bash
npm test -- --watchAll=false
```
Expected: semua test PASS (saat ini: 30 tests di 4 suites).

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

## Orang Tua (legacy pages, new routes)
- [ ] `/orangtua/balita` render dashboard lama
- [ ] `/orangtua/forum`, `/orangtua/forum/saya`, `/orangtua/forum/:id`, `/orangtua/balita/:id` jalan

## Admin (legacy)
- [ ] `/admin/dashboard/desa`, posyandu, kader-posyandu, tenaga-kesehatan, artikel jalan

## Desa & Tenkes (legacy)
- [ ] `/desa/beranda`, `/desa/acara` jalan
- [ ] `/tenkes/forum`, `/tenkes/balita/:id` jalan

## Build & Runtime
- [ ] `npm run build` sukses tanpa error baru
- [ ] Tidak ada console error saat navigate semua role
- [ ] Browser back/forward jalan normal
