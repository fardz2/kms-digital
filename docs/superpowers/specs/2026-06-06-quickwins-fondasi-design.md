# Desain: Quick Wins Fondasi (Sub-proyek 1)

Tanggal: 2026-06-06

## Tujuan

Memperkuat fondasi dengan perubahan berisiko rendah: test gerbang peran &
mutation pengukuran, perbaiki bug monthDiff, perketat sanitasi HTML, dan
konsolidasi folder kembar.

## Stack

React 19 + Vite + Vitest + Testing Library. Tanpa dependensi baru.

## Item

### A. Test RequireRole (gerbang peran)
File: `src/__tests__/routes/RequireRole.test.tsx`
Mock `useSession`, render dengan `MemoryRouter`. Skenario:
- Belum login -> redirect `/masuk`
- Peran diizinkan -> render children
- Peran tak diizinkan -> redirect `ROLE_HOME[role]`
- Edge: login tapi `role` null/undefined -> saat ini lolos render. Perbaiki
  `RequireRole.tsx` agar redirect ke `/masuk` saat authenticated tapi role
  kosong, lalu test memverifikasi redirect.

### B. Test mutation hooks pengukuran
File: `src/__tests__/queries/usePengukuranQueries.test.tsx`
`renderHook` + `QueryClientProvider`, mock `pengukuranApi` dan `useSession`.
Untuk create/update/delete:
- Sukses -> api dipanggil dengan argumen benar + `invalidateQueries` untuk
  `qk.pengukuran.byAnak(anakId, role)` dan `qk.laporan.all`.
- Gagal -> error diteruskan (mutation berstatus error).

### C. Fix monthDiff
File: `src/utils/monthDiff.ts` + `src/__tests__/utils/monthDiff.test.ts`
Hapus `Math.abs`, beri tipe `dayjs.ConfigType`. Umur negatif (tanggal ukur
sebelum lahir) dikembalikan apa adanya agar guard `umur<0` di z-score aktif.
Cek pemanggil (`ChartWHO.tsx`, `zScore.ts`) tidak rusak.

### D. Perketat sanitize
File: `src/utilities/sanitize.ts` (akan pindah di Item E) +
`src/__tests__/utilities/sanitize.test.ts`
Hapus `'style'` dari `ALLOWED_ATTR`. Tambah test: input `style="..."` ->
atribut hilang, tag tetap ada.

### E. Konsolidasi folder kembar
- `src/hook/useSidebarCollapsed.ts` -> `src/hooks/useSidebarCollapsed.ts`
- `src/utilities/{Format,isThisMonth,sanitize}.ts` -> `src/utils/`
- Update ~9 import (2 hook, 7 utilities) + path file test terkait.
- Hapus folder `src/hook` dan `src/utilities` setelah kosong.

Catatan urutan: lakukan Item E (pindah file) lebih dulu atau terakhir secara
konsisten. Rencana implementasi akan mengurutkan agar import tidak putus.

## Verifikasi
- `npm run lint`
- `npm test`
- `npm run build`

## Non-tujuan (YAGNI)
- Tidak menambah typing menyeluruh (ditunda).
- Tidak mengubah perilaku produksi selain edge-case RequireRole, monthDiff,
  dan sanitize.
