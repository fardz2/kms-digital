# Desain: Optimistic Update - Komentar + Approve/Reject

Tanggal: 2026-06-06

## Tujuan

Membuat UI terasa instan pada aksi yang sering dipakai: kirim komentar forum
dan setujui/tolak pendaftaran orang tua & anak. Perubahan cache langsung
diterapkan sebelum server merespons, dengan rollback bila gagal.

## Stack

React 19 + TanStack Query v5 + Vitest. Tanpa dependensi baru.

## Pola umum (TanStack Query)

Tiap mutation memakai:
- `onMutate(vars)`: `await qc.cancelQueries({ queryKey })`, simpan snapshot
  `qc.getQueryData(queryKey)`, lalu `qc.setQueryData(queryKey, updater)`.
  Return `{ previous }` sebagai context.
- `onError(_err, _vars, ctx)`: `qc.setQueryData(queryKey, ctx.previous)` (rollback).
- `onSettled`: `qc.invalidateQueries({ queryKey })` agar data server jadi
  sumber kebenaran final.

Toast sukses/gagal tetap di komponen (tidak berubah).

## A. Komentar forum (useCreateComment)

File: `src/queries/useCommentQueries.ts`.
- Tambah `useSession` untuk mengambil `user` (nama, role, id) pengirim.
- `onMutate(payload)`: cancel `qk.comment.byPost(payload.post_id)`, snapshot,
  sisipkan komentar sementara di awal list:
  `{ comment_id: 'temp-<Date.now()>', user_id, post_id, content, nama, role, time: ISO now }`.
- `onError`: rollback.
- `onSettled`: invalidate `qk.comment.byPost(payload.post_id)`.

Daftar komentar diurutkan terbaru-dulu (sudah ada di useCommentList), komentar
sementara muncul paling atas. Saat invalidate, data server (id asli)
menggantikannya.

## B. Approve/Reject (useApproveOrangTua, useRejectOrangTua, useApproveAnak, useRejectAnak)

File: `src/queries/useApproveQueries.ts`.
Keempatnya menghapus item dari daftar pending. Pola:
- `onMutate(id)`: cancel daftar terkait (`qk.approve.orangTua` atau
  `qk.approve.anak`), snapshot, `setQueryData` untuk membuang item ber-id itu
  (`list.filter((x) => x.id !== id)`). Item langsung hilang dari UI.
- `onError`: rollback snapshot.
- `onSettled`: invalidate daftar pending; untuk approve juga invalidate
  `qk.anak.all` (perilaku sekarang dipertahankan).

## Testing

File: `src/__tests__/queries/useCommentQueries.test.tsx` dan
`src/__tests__/queries/useApproveQueries.test.tsx`.
Pakai `renderHook` + `QueryClientProvider`, mock api, mock `useSession`.
- Seed cache via `qc.setQueryData(queryKey, seed)`.
- Sukses: setelah mutate, cache berubah optimistically (komentar muncul /
  item hilang) dan api dipanggil dengan argumen benar.
- Gagal: api reject -> cache kembali ke snapshot (rollback).

## Verifikasi
- `npm run lint`
- `npm test`
- `npm run build`

## Non-tujuan (YAGNI)
- Tidak mengubah mutation lain (pengukuran, orang tua CRUD, posyandu, desa,
  artikel, reminder).
- Tidak mengubah UI komponen selain perilaku cache.
- Tidak menambah retry otomatis.
