# Cross-Role Flow Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sederhanakan UX lintas-role (kader, ortu, desa, tenkes, admin) tanpa mengubah API. Kurangi modal, gabung halaman kecil, hilangkan duplikasi navigasi.

**Architecture:** Frontend-only refactor di layer page/feature. Buat 1 page baru (`AkunOrangTuaPage`), gabung 2 page (KelolaAcara → BerandaDesa), hapus 1 page (BerandaTenkes), tambah tab di Post.jsx, simplify AdminDashboard, rename label sidebar. Semua endpoint backend tetap. Route lama tetap valid via redirect.

**Tech Stack:** React 18, React Router v6, Ant Design v4, Tailwind CSS 3, @tanstack/react-query.

**Spec:** `docs/superpowers/specs/2026-05-14-cross-role-flow-simplification.md`.

**Backend dependencies:** NONE.

---

## File Scope

**Buat (3 file):**
- `src/features/kader/AkunOrangTuaPage.jsx` — page tab Pending + Aktif
- `src/features/kader/PendingApprovalSection.jsx` — extract logic dari `ApproveModal.jsx`
- `src/features/desa/AcaraSection.jsx` — extract logic dari `KelolaAcara.jsx`

**Modifikasi (10 file):**
- `src/features/kader/ModePosyandu.jsx` — hapus 2 modal, ganti tombol header
- `src/features/kader/PosyanduHeader.jsx` — gabung 2 button jadi 1 "Akun Orang Tua (X)"
- `src/features/kader/OrangTuaModal.jsx` — extract `FormOrangTua` jadi exportable
- `src/pages/Post/index.js` — tambah tab Semua / Saya
- `src/features/desa/BerandaDesa.jsx` — embed `<AcaraSection>`, hilangkan menu
- `src/features/desa/KelolaAcara.jsx` — jadi thin wrapper
- `src/features/auth/roleHome.js` — TENAGA_KESEHATAN → /tenkes/forum
- `src/routes/AppRoutes.jsx` — registrasi route baru, hapus BerandaTenkes
- `src/routes/legacyRedirects.js` — tambah 3 redirect baru
- `src/components/layout/Dashboard/sidebarLinks.js` — rename label
- `src/features/admin/AdminDashboard.jsx` — single column, hapus QuickLinks
- `src/features/admin/AdminStatsGrid.jsx` — 6 → 4 card

**Hapus (2 file):**
- `src/features/tenkes/BerandaTenkes.jsx`
- `src/features/admin/AdminQuickLinks.jsx`

**Test update (2 file):**
- `src/__tests__/routes/legacyRedirects.test.js`
- `src/__tests__/features/auth/roleHome.test.js`

---

## Testing Strategy

- 64 unit test existing harus tetap pass setelah setiap task besar
- 2 test (`legacyRedirects`, `roleHome`) di-update di task masing-masing
- Build (`npm run build`) wajib pass per task
- Manual visual verify via `npm start` di tiap phase completion

---

## Task 1: Tambah legacy redirects baru

**Files:** `src/routes/legacyRedirects.js`, `src/__tests__/routes/legacyRedirects.test.js`

- [ ] **Step 1: Update `src/routes/legacyRedirects.js`**

```js
export const LEGACY_REDIRECTS = [
  { from: '/sign-in', to: '/masuk' },
  { from: '/sign-in/admin', to: '/masuk?role=ADMIN' },
  { from: '/sign-in/desa', to: '/masuk?role=DESA' },
  { from: '/sign-in/tenaga-kesehatan', to: '/masuk?role=TENAGA_KESEHATAN' },
  { from: '/sign-in/kader-posyandu', to: '/masuk?role=KADER_POSYANDU' },
  { from: '/dashboard', to: '/orangtua/balita' },
  { from: '/tanya-jawab', to: '/orangtua/forum' },
  { from: '/my-forum', to: '/orangtua/forum/saya' },
  { from: '/orangtua/forum/saya', to: '/orangtua/forum?tab=saya' },
  { from: '/kader-posyandu/dashboard', to: '/kader/balita' },
  { from: '/kader/beranda', to: '/kader/balita' },
  { from: '/desa/dashboard', to: '/desa/beranda' },
  { from: '/desa/reminder', to: '/desa/acara' },
  { from: '/desa/acara', to: '/desa/beranda#acara' },
  { from: '/tenaga-kesehatan/dashboard', to: '/tenkes/forum' },
  { from: '/tenaga-kesehatan/detail/:id', to: '/tenkes/balita/:id' },
  { from: '/tenkes/beranda', to: '/tenkes/forum' },
];
```

Catat: `/orangtua/forum/saya`, `/desa/acara`, `/tenkes/beranda` jadi entry baru.

- [ ] **Step 2: Update test**

Buka `src/__tests__/routes/legacyRedirects.test.js`. Tambah expectation:

```js
test('redirects forum saya, desa acara, tenkes beranda to new locations', () => {
  const map = Object.fromEntries(LEGACY_REDIRECTS.map((r) => [r.from, r.to]));
  expect(map['/orangtua/forum/saya']).toEqual('/orangtua/forum?tab=saya');
  expect(map['/desa/acara']).toEqual('/desa/beranda#acara');
  expect(map['/tenkes/beranda']).toEqual('/tenkes/forum');
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- --watchAll=false src/__tests__/routes
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/routes/legacyRedirects.js src/__tests__/routes/legacyRedirects.test.js
git commit -m "feat(routes): add legacy redirects for simplified flow"
```

---

## Task 2: Extract FormOrangTua dari OrangTuaModal

**Files:** `src/features/kader/OrangTuaModal.jsx` (modify, export `FormOrangTua`)

- [ ] **Step 1: Tambah named export**

Di akhir file `src/features/kader/OrangTuaModal.jsx`, sebelum `export default function OrangTuaModal`:

```js
export { FormOrangTua };
```

`FormOrangTua` sudah didefinisikan di file (line 21). Tidak perlu refactor besar, hanya expose.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/features/kader/OrangTuaModal.jsx
git commit -m "refactor(kader): export FormOrangTua for reuse"
```

---

## Task 3: Extract PendingApprovalSection dari ApproveModal

**Files:** `src/features/kader/PendingApprovalSection.jsx` (NEW)

- [ ] **Step 1: Buat file baru**

```jsx
import React from 'react';
import moment from 'moment';
import { Modal as AntModal } from 'antd';
import { AlertTriangle, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import {
  usePendingOrangTua,
  usePendingAnak,
  useApproveOrangTua,
  useApproveAnak,
  useRejectOrangTua,
  useRejectAnak,
} from '../../queries/useApproveQueries';

function confirmAction({ title, content, okText, onOk }) {
  AntModal.confirm({
    title,
    icon: <AlertTriangle size={20} className="text-danger" />,
    content,
    okText: okText ?? 'Ya',
    cancelText: 'Batal',
    onOk,
  });
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center gap-[13px] py-[50px] text-graphite">
      <Check size={32} strokeWidth={1.75} className="text-success" />
      <span className="text-body-sm">Tidak ada {label} yang menunggu persetujuan</span>
    </div>
  );
}

function OrangTuaList({ data, isLoading, onApprove, onReject }) {
  if (isLoading) return <div className="text-body-sm text-graphite">Memuat daftar orang tua...</div>;
  if (!data || data.length === 0) return <EmptyState label="orang tua" />;
  return (
    <div className="flex flex-col gap-[13px]">
      {data.map((ot) => (
        <Card key={ot.id}>
          <div className="text-heading-sm font-semibold text-deep-slate">{ot.nama ?? '-'}</div>
          {ot.email && <div className="text-caption text-graphite mt-1">{ot.email}</div>}
          {ot.alamat && <div className="text-caption text-graphite">{ot.alamat}</div>}
          {ot.created_at && (
            <div className="text-caption text-graphite mt-1">
              Daftar: {moment(ot.created_at).format('DD MMM YYYY')}
            </div>
          )}
          <div className="flex gap-[8px] justify-end mt-[17px]">
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                confirmAction({
                  title: 'Tolak pendaftaran?',
                  content: `${ot.nama} akan dihapus.`,
                  okText: 'Ya, Tolak',
                  onOk: () => onReject(ot.id),
                })
              }
            >
              Tolak
            </Button>
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<Check size={16} strokeWidth={1.75} />}
              onClick={() => onApprove(ot.id)}
            >
              Setujui
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AnakList({ data, isLoading, onApprove, onReject }) {
  if (isLoading) return <div className="text-body-sm text-graphite">Memuat daftar anak...</div>;
  if (!data || data.length === 0) return <EmptyState label="anak" />;
  return (
    <div className="flex flex-col gap-[13px]">
      {data.map((anak) => {
        const umurBulan = anak.tanggal_lahir
          ? moment().diff(moment(anak.tanggal_lahir), 'month')
          : null;
        return (
          <Card key={anak.id}>
            <div className="text-heading-sm font-semibold text-deep-slate">{anak.nama ?? '-'}</div>
            <div className="text-caption text-graphite mt-1">
              {umurBulan != null ? `${umurBulan} bulan · ` : ''}
              {anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
            </div>
            {anak.nama_ortu && (
              <div className="text-caption text-graphite">Ortu: {anak.nama_ortu}</div>
            )}
            {anak.created_at && (
              <div className="text-caption text-graphite mt-1">
                Daftar: {moment(anak.created_at).format('DD MMM YYYY')}
              </div>
            )}
            <div className="flex gap-[8px] justify-end mt-[17px]">
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  confirmAction({
                    title: 'Tolak pendaftaran?',
                    content: `${anak.nama} akan dihapus.`,
                    okText: 'Ya, Tolak',
                    onOk: () => onReject(anak.id),
                  })
                }
              >
                Tolak
              </Button>
              <Button
                variant="primary"
                size="sm"
                leadingIcon={<Check size={16} strokeWidth={1.75} />}
                onClick={() => onApprove(anak.id)}
              >
                Setujui
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function PendingApprovalSection({ enabled = true }) {
  const toast = useToast();
  const { data: otList, isLoading: otLoading } = usePendingOrangTua(enabled);
  const { data: anakList, isLoading: anakLoading } = usePendingAnak(enabled);

  const approveOT = useApproveOrangTua();
  const rejectOT = useRejectOrangTua();
  const approveAnak = useApproveAnak();
  const rejectAnak = useRejectAnak();

  const withToast = (label) => ({
    onSuccess: () => toast.success(`${label} berhasil`),
    onError: (err) => toast.error(err?.message ?? `${label} gagal`),
  });

  const empty =
    !otLoading &&
    !anakLoading &&
    (!otList || otList.length === 0) &&
    (!anakList || anakList.length === 0);

  return (
    <div className="space-y-[33px]">
      {toast.contextHolder}
      {empty ? (
        <div className="text-center py-[50px] text-body-sm text-graphite">
          Tidak ada antrean persetujuan. 🎉
        </div>
      ) : (
        <>
          <section className="space-y-[17px]">
            <h3 className="text-overline text-graphite">
              Pendaftaran Orang Tua Baru ({otList?.length ?? 0})
            </h3>
            <OrangTuaList
              data={otList}
              isLoading={otLoading}
              onApprove={(id) => approveOT.mutate(id, withToast('Setujui orang tua'))}
              onReject={(id) => rejectOT.mutate(id, withToast('Tolak orang tua'))}
            />
          </section>
          <section className="space-y-[17px]">
            <h3 className="text-overline text-graphite">
              Pengukuran Anak Baru ({anakList?.length ?? 0})
            </h3>
            <AnakList
              data={anakList}
              isLoading={anakLoading}
              onApprove={(id) => approveAnak.mutate(id, withToast('Setujui anak'))}
              onReject={(id) => rejectAnak.mutate(id, withToast('Tolak anak'))}
            />
          </section>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/features/kader/PendingApprovalSection.jsx
git commit -m "feat(kader): add PendingApprovalSection extracted from ApproveModal"
```

---

## Task 4: Buat AkunOrangTuaPage

**Files:** `src/features/kader/AkunOrangTuaPage.jsx` (NEW)

- [ ] **Step 1: Buat file**

```jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Modal as AntModal, message } from 'antd';
import { ArrowLeft, AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import {
  useOrangTuaList,
  useDeleteOrangTua,
} from '../../queries/useOrangTuaQueries';
import {
  usePendingOrangTua,
  usePendingAnak,
} from '../../queries/useApproveQueries';
import { useSession } from '../auth/useSession';
import PendingApprovalSection from './PendingApprovalSection';
import { FormOrangTua } from './OrangTuaModal';

const TABS = [
  { key: 'pending', label: 'Menunggu Persetujuan' },
  { key: 'aktif', label: 'Daftar Aktif' },
];

const normalizeStatus = (status) => {
  if (typeof status === 'string') return status === 'true' || status === '1';
  if (typeof status === 'number') return status === 1;
  return !!status;
};

export default function AkunOrangTuaPage() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [tab, setTab] = useState('pending');
  const [messageApi, contextHolder] = message.useMessage();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selected, setSelected] = useState(null);

  const { data: pendingOT } = usePendingOrangTua(true);
  const { data: pendingAnak } = usePendingAnak(true);
  const pendingCount = (pendingOT?.length ?? 0) + (pendingAnak?.length ?? 0);

  const { data: rawList, isLoading } = useOrangTuaList(true);
  const deleteMutation = useDeleteOrangTua();

  const aktifList = useMemo(
    () =>
      (rawList ?? []).map((item) => ({
        ...item,
        status: normalizeStatus(item.status),
      })),
    [rawList]
  );

  const showDeleteConfirm = (record) => {
    AntModal.confirm({
      title: 'Hapus orang tua?',
      icon: <AlertTriangle size={20} className="text-danger" />,
      content: `${record.nama} akan dihapus dari daftar.`,
      okText: 'Ya, Hapus',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () =>
        deleteMutation.mutate(record.id, {
          onSuccess: () => messageApi.success('Orang tua berhasil dihapus'),
          onError: (err) =>
            messageApi.error(err?.message ?? 'Gagal menghapus orang tua'),
        }),
    });
  };

  const openTambah = () => {
    setFormMode('add');
    setSelected(null);
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setFormMode('edit');
    setSelected(record);
    setFormOpen(true);
  };

  const columns = [
    { accessorKey: 'nama', header: 'Nama', enableSorting: true },
    { accessorKey: 'alamat', header: 'Alamat', enableSorting: true },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ getValue }) => {
        const approved = !!getValue();
        return (
          <span
            className={`inline-flex items-center px-[13px] py-1 rounded-full text-caption font-medium ${
              approved ? 'bg-success/10 text-success' : 'bg-polar-mist text-graphite'
            }`}
          >
            {approved ? 'Disetujui' : 'Menunggu'}
          </span>
        );
      },
    },
    {
      id: 'action',
      header: 'Aksi',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex gap-[8px]">
          <Button
            variant="default"
            size="sm"
            leadingIcon={<Pencil size={16} strokeWidth={1.75} />}
            onClick={() => openEdit(row.original)}
          >
            Ubah
          </Button>
          <Button
            variant="destructive"
            size="sm"
            leadingIcon={<Trash2 size={16} strokeWidth={1.75} />}
            onClick={() => showDeleteConfirm(row.original)}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <PageHeader
        eyebrow="Kader Posyandu"
        title="Akun Orang Tua"
        subtitle="Kelola pendaftaran dan akun orang tua di posyandu Anda."
        action={
          <Button
            variant="ghost"
            size="md"
            leadingIcon={<ArrowLeft size={18} strokeWidth={2} />}
            onClick={() => navigate('/kader/balita')}
          >
            Kembali
          </Button>
        }
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[25px]">
        {/* Tab nav */}
        <div className="flex gap-[8px] border-b border-light-ash">
          {TABS.map((t) => {
            const active = t.key === tab;
            const count =
              t.key === 'pending' ? pendingCount : aktifList.length;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-[17px] py-[13px] text-body-sm font-semibold transition-colors border-b-2 -mb-px ${
                  active
                    ? 'text-primary-600 border-primary-500'
                    : 'text-graphite border-transparent hover:text-deep-slate'
                }`}
              >
                {t.label}
                <span
                  className={`ml-[8px] px-[8px] py-[1px] rounded-full text-caption tabular-nums ${
                    active
                      ? 'bg-primary-50 text-primary-600'
                      : 'bg-polar-mist text-graphite'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {tab === 'pending' && <PendingApprovalSection enabled={true} />}

        {tab === 'aktif' && (
          <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px] space-y-[17px]">
            <div className="flex items-center justify-between gap-[17px] flex-wrap">
              <h2 className="text-heading font-semibold text-deep-slate">
                Daftar Orang Tua Aktif
              </h2>
              <Button
                variant="primary"
                size="md"
                leadingIcon={<Plus size={18} strokeWidth={2} />}
                onClick={openTambah}
              >
                Tambah Orang Tua
              </Button>
            </div>
            <DataTable
              columns={columns}
              data={aktifList}
              loading={isLoading || deleteMutation.isPending}
              rowKey="id"
              searchPlaceholder="Cari orang tua..."
              emptyText="Belum ada orang tua aktif"
            />
          </div>
        )}
      </div>

      <FormOrangTua
        isOpen={formOpen}
        onCancel={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        mode={formMode}
        initialValues={selected}
        idPosyandu={user?.id_posyandu}
        idDesa={user?.id_desa}
      />
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/features/kader/AkunOrangTuaPage.jsx
git commit -m "feat(kader): add AkunOrangTuaPage with pending + aktif tabs"
```

---

## Task 5: Update PosyanduHeader (gabung 2 tombol)

**Files:** `src/features/kader/PosyanduHeader.jsx`

- [ ] **Step 1: Replace tombol setujui+orang tua jadi 1 tombol**

Cari blok `<div className="flex gap-[8px] flex-wrap">` di file. Ganti seluruh blok tombol (3 button: Approve, Orang Tua, Laporan, plus Keluar) menjadi:

```jsx
          <div className="flex gap-[8px] flex-wrap">
            <Button
              variant="default"
              size="md"
              leadingIcon={<Users size={18} strokeWidth={2} />}
              onClick={onAkunOrangTua}
            >
              Akun Orang Tua
              {pendingCount > 0 && (
                <span className="ml-[6px] px-[8px] py-[1px] bg-primary-500 text-white rounded-full text-caption font-bold tabular-nums">
                  {pendingCount}
                </span>
              )}
            </Button>
            <Button
              variant="default"
              size="md"
              leadingIcon={<BarChart3 size={18} strokeWidth={2} />}
              onClick={onLaporan}
            >
              Laporan
            </Button>
            <Button
              variant="ghost"
              size="md"
              leadingIcon={<LogOut size={18} strokeWidth={2} />}
              onClick={onKeluar}
            >
              Keluar
            </Button>
          </div>
```

- [ ] **Step 2: Update import (hapus CheckCheck, tambah Users tetap, BarChart3 tetap)**

```jsx
import { BarChart3, LogOut, Users } from 'lucide-react';
```

- [ ] **Step 3: Update prop signature**

```jsx
export default function PosyanduHeader({
  userName,
  posyanduName,
  sudahCount,
  totalCount,
  pendingCount = 0,
  onAkunOrangTua,
  onLaporan,
  onKeluar,
}) {
```

Hapus prop `onApprove` dan `onKelolaOrangTua`. Pastikan tidak ada referensi.

- [ ] **Step 4: Build check**

```bash
npm run build
```

Build akan fail karena ModePosyandu masih pakai prop lama. Itu di-fix di Task 6.

- [ ] **Step 5: Tunggu Task 6 selesai sebelum commit**

(Jangan commit dulu, akan dikombinasi dengan Task 6.)

---

## Task 6: Update ModePosyandu (hapus 2 modal, navigate ke /kader/orangtua)

**Files:** `src/features/kader/ModePosyandu.jsx`

- [ ] **Step 1: Hapus state untuk modal lama**

Hapus baris:
```jsx
const [approveOpen, setApproveOpen] = useState(false);
const [orangTuaOpen, setOrangTuaOpen] = useState(false);
```

- [ ] **Step 2: Hapus import yang tidak dipakai**

Hapus:
```jsx
import ApproveModal from './ApproveModal';
import OrangTuaModal from './OrangTuaModal';
```

- [ ] **Step 3: Update prop PosyanduHeader**

Cari `<PosyanduHeader ... />`, ganti:

```jsx
      <PosyanduHeader
        userName={user?.name}
        posyanduName={user?.posyandu_name}
        sudahCount={counts.semua - counts.belum}
        totalCount={counts.semua}
        pendingCount={pendingCount}
        onAkunOrangTua={() => navigate('/kader/orangtua')}
        onLaporan={() => navigate('/kader/laporan')}
        onKeluar={handleKeluar}
      />
```

- [ ] **Step 4: Hapus 2 baris di akhir return JSX**

Cari dan hapus:
```jsx
      <ApproveModal open={approveOpen} onClose={() => setApproveOpen(false)} />
      <OrangTuaModal open={orangTuaOpen} onClose={() => setOrangTuaOpen(false)} />
```

- [ ] **Step 5: Daftarkan route baru di AppRoutes.jsx**

`src/routes/AppRoutes.jsx` line 47-51, ganti blok kader jadi:

```jsx
      {/* Role: Kader Posyandu (NEW) */}
      <Route element={<RequireRole allow={['KADER_POSYANDU']} />}>
        <Route path="/kader/balita" element={<ModePosyandu />} />
        <Route path="/kader/balita/:id" element={<DetailAnak />} />
        <Route path="/kader/orangtua" element={<AkunOrangTuaPage />} />
        <Route path="/kader/laporan" element={<LaporanBulananKader />} />
      </Route>
```

Tambah import di header file:
```jsx
import AkunOrangTuaPage from '../features/kader/AkunOrangTuaPage';
```

- [ ] **Step 6: Build + test**

```bash
npm run build
npm test -- --watchAll=false
```

Expected: build sukses, semua test pass.

- [ ] **Step 7: Commit (gabungan Task 5+6)**

```bash
git add src/features/kader/ModePosyandu.jsx src/features/kader/PosyanduHeader.jsx src/routes/AppRoutes.jsx
git commit -m "refactor(kader): replace inline modals with /kader/orangtua page"
```

---

## Task 7: Forum tab (Semua/Saya) di Post.jsx

**Files:** `src/pages/Post/index.js`

- [ ] **Step 1: Tambah state tab via searchParams**

Update top of file (after existing imports), tambah:

```js
import { Link, useSearchParams } from "react-router-dom";
```

(Replace existing `import { Link }` line.)

Inside `Post()`, di awal:

```js
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'saya' ? 'saya' : 'semua';
```

- [ ] **Step 2: Filter posts berdasarkan tab**

Setelah baris `const posts = dataPost?.map(...);`, tambah:

```js
  const filteredPosts =
    tab === 'saya' && user?.user?.id
      ? (posts ?? []).filter((p) => {
          const raw = (dataPost ?? []).find((d) => d.post_id === p.id);
          return raw && String(raw.user_id ?? raw.id_user) === String(user.user.id);
        })
      : posts;
```

Catatan: payload backend punya `user_id` per post (cek di response Network). Kalau field beda, sesuaikan.

- [ ] **Step 3: Tambah tab UI di atas list**

Cari tag `<header>` dan setelah closing `</header>`, sebelum `{postsLoading && (`, tambah:

```jsx
        {user?.user?.role === "ORANG_TUA" && (
          <div className="flex gap-[8px] border-b border-light-ash">
            {[
              { key: 'semua', label: 'Semua' },
              { key: 'saya', label: 'Punya Saya' },
            ].map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() =>
                    setSearchParams(t.key === 'semua' ? {} : { tab: t.key })
                  }
                  className={`px-[17px] py-[13px] text-body-sm font-semibold transition-colors border-b-2 -mb-px ${
                    active
                      ? 'text-primary-600 border-primary-500'
                      : 'text-graphite border-transparent hover:text-deep-slate'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}
```

- [ ] **Step 4: Ganti `posts` jadi `filteredPosts` di rendering**

Cari `{(posts ?? []).map((item) => (`, ganti jadi `{(filteredPosts ?? []).map((item) => (`.

Ganti juga conditional empty: `(!posts || posts.length === 0)` → `(!filteredPosts || filteredPosts.length === 0)`.

- [ ] **Step 5: Build + test**

```bash
npm run build
npm test -- --watchAll=false
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/Post/index.js
git commit -m "feat(forum): add Semua/Saya tabs in Post page"
```

---

## Task 8: Extract AcaraSection dari KelolaAcara

**Files:** `src/features/desa/AcaraSection.jsx` (NEW), `src/features/desa/KelolaAcara.jsx` (modify)

- [ ] **Step 1: Buat AcaraSection.jsx**

```jsx
import React from 'react';
import moment from 'moment';
import { Form, Input, DatePicker, Modal as AntModal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import {
  useReminderList,
  useCreateReminder,
  useDeleteReminder,
} from '../../queries/useReminderQueries';

export default function AcaraSection() {
  const toast = useToast();
  const [form] = Form.useForm();
  const { data: reminders, isLoading } = useReminderList();
  const createMutation = useCreateReminder();
  const deleteMutation = useDeleteReminder();

  const onSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const payload = {
          judul: values.judul,
          deskripsi: values.deskripsi ?? '',
          tanggal_reminder: moment(values.tanggal).format('YYYY-MM-DD'),
        };
        createMutation.mutate(payload, {
          onSuccess: () => {
            toast.success('Acara ditambahkan');
            form.resetFields();
          },
          onError: (err) => toast.error(err?.message ?? 'Gagal menambahkan'),
        });
      })
      .catch(() => {});
  };

  const handleDelete = (id, judul) => {
    AntModal.confirm({
      title: 'Hapus acara?',
      icon: <ExclamationCircleOutlined />,
      content: `Acara "${judul}" akan dihapus.`,
      okText: 'Ya, Hapus',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteMutation.mutate(id, {
          onSuccess: () => toast.success('Acara dihapus'),
          onError: (err) => toast.error(err?.message ?? 'Gagal menghapus'),
        });
      },
    });
  };

  const sorted = [...(reminders ?? [])].sort((a, b) =>
    (b.tanggal_reminder ?? '').localeCompare(a.tanggal_reminder ?? '')
  );

  return (
    <section id="acara" className="space-y-[25px]">
      {toast.contextHolder}
      <Card title="Tambah Acara Baru">
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Judul Acara</span>}
            name="judul"
            rules={[{ required: true, message: 'Judul masih kosong' }]}
          >
            <Input placeholder="Contoh: Posyandu Bulan Ini" className="h-11" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Deskripsi</span>}
            name="deskripsi"
          >
            <Input.TextArea rows={2} placeholder="Detail tambahan (opsional)" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Tanggal</span>}
            name="tanggal"
            rules={[{ required: true, message: 'Tanggal masih kosong' }]}
          >
            <DatePicker format="DD MMMM YYYY" allowClear={false} className="w-full h-11" />
          </Form.Item>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={createMutation.isPending}
          >
            Simpan Acara
          </Button>
        </Form>
      </Card>

      <Card title={`Daftar Acara (${sorted.length})`}>
        {isLoading && <div className="text-neutral-500">Memuat...</div>}
        {!isLoading && sorted.length === 0 && (
          <div className="text-center py-4 text-neutral-500">Belum ada acara</div>
        )}
        <div className="flex flex-col gap-2">
          {sorted.map((acara) => (
            <div
              key={acara.id}
              className="p-[17px] bg-polar-mist rounded-default flex justify-between items-center gap-[13px]"
            >
              <div>
                <div className="text-body-sm font-semibold text-deep-slate">
                  {acara.judul}
                </div>
                <div className="text-caption text-neutral-500">
                  {acara.tanggal_reminder
                    ? moment(acara.tanggal_reminder).format('DD MMMM YYYY')
                    : '-'}
                </div>
                {acara.deskripsi && <div className="text-base mt-1">{acara.deskripsi}</div>}
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(acara.id, acara.judul)}
              >
                Hapus
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
```

- [ ] **Step 2: Replace KelolaAcara.jsx jadi thin wrapper**

```jsx
import React from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import AcaraSection from './AcaraSection';

const MENU = [{ key: 'beranda', label: 'Beranda', path: '/desa/beranda' }];

export default function KelolaAcara() {
  return (
    <AppShell menu={MENU} activeKey="beranda">
      <PageHeader
        eyebrow="Pemerintah Desa"
        title="Kelola Acara Posyandu"
        subtitle="Buat pengingat acara untuk kader dan orang tua"
      />
      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
        <AcaraSection />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/features/desa/AcaraSection.jsx src/features/desa/KelolaAcara.jsx
git commit -m "refactor(desa): extract AcaraSection from KelolaAcara"
```

---

## Task 9: Embed AcaraSection di BerandaDesa, hapus Kelola Acara button

**Files:** `src/features/desa/BerandaDesa.jsx`

- [ ] **Step 1: Replace file**

```jsx
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import { useSession } from '../auth/useSession';
import { useStatistikGiziDesa } from '../../queries/useLaporanQueries';
import LaporanDesa from '../laporan/LaporanDesa';
import ExportDesaForm from './ExportDesaForm';
import AcaraSection from './AcaraSection';

const MENU = [{ key: 'beranda', label: 'Beranda', path: '/desa/beranda' }];

export default function BerandaDesa() {
  const { user } = useSession();
  const printableRef = useRef(null);
  const { hash } = useLocation();

  const idDesa = user?.id_desa ?? user?.desa_id;
  const { data: statistikData } = useStatistikGiziDesa(idDesa);
  const posyanduList = Array.isArray(statistikData) ? statistikData : [];

  useEffect(() => {
    if (hash === '#acara') {
      const el = document.getElementById('acara');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, [hash]);

  return (
    <AppShell menu={MENU} activeKey="beranda">
      <PageHeader
        title={`Desa ${user?.nama_desa ?? user?.desa_name ?? ''}`}
        eyebrow="Pemerintah Desa"
        subtitle="Rekap gizi balita dan kelola acara posyandu."
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[33px]">
        <ExportDesaForm posyanduList={posyanduList} printableRef={printableRef} />
        <LaporanDesa ref={printableRef} />
        <AcaraSection />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

- [ ] **Step 3: Hapus route /desa/acara di AppRoutes.jsx**

`src/routes/AppRoutes.jsx`. Hapus baris:
```jsx
<Route path="/desa/acara" element={<KelolaAcara />} />
```

Hapus juga import KelolaAcara:
```jsx
import KelolaAcara from '../features/desa/KelolaAcara';
```

(Jangan hapus file `KelolaAcara.jsx` — masih bisa diakses kalau ada import lain. Sudah di-redirect via legacyRedirects.)

- [ ] **Step 4: Build + test**

```bash
npm run build
npm test -- --watchAll=false
```

- [ ] **Step 5: Commit**

```bash
git add src/features/desa/BerandaDesa.jsx src/routes/AppRoutes.jsx
git commit -m "refactor(desa): embed AcaraSection in BerandaDesa, remove /desa/acara"
```

---

## Task 10: Hapus BerandaTenkes, redirect ke /tenkes/forum

**Files:** `src/features/auth/roleHome.js`, `src/routes/AppRoutes.jsx`, `src/__tests__/features/auth/roleHome.test.js`

- [ ] **Step 1: Update roleHome.js**

`src/features/auth/roleHome.js`. Ganti TENAGA_KESEHATAN:

```js
export const ROLE_HOME = {
  ADMIN: '/admin/dashboard',
  ORANG_TUA: '/orangtua/balita',
  KADER_POSYANDU: '/kader/balita',
  TENAGA_KESEHATAN: '/tenkes/forum',
  DESA: '/desa/beranda',
};
```

- [ ] **Step 2: Update test**

`src/__tests__/features/auth/roleHome.test.js`:

```js
test('TENAGA_KESEHATAN home is /tenkes/forum', () => {
  expect(ROLE_HOME.TENAGA_KESEHATAN).toEqual('/tenkes/forum');
});
```

Ganti expectation lama yang menunjuk `/tenkes/beranda`.

- [ ] **Step 3: Hapus route /tenkes/beranda di AppRoutes.jsx**

```jsx
      {/* Role: Tenaga Kesehatan (legacy) */}
      <Route element={<RequireRole allow={['TENAGA_KESEHATAN']} />}>
        <Route path="/tenkes/forum" element={<Post />} />
        <Route path="/tenkes/balita/:id" element={<DetailForum />} />
      </Route>
```

Hapus juga import `BerandaTenkes`:
```jsx
import BerandaTenkes from '../features/tenkes/BerandaTenkes';
```

- [ ] **Step 4: Hapus file BerandaTenkes.jsx**

```bash
Remove-Item -LiteralPath "src/features/tenkes/BerandaTenkes.jsx" -Force
```

- [ ] **Step 5: Build + test**

```bash
npm run build
npm test -- --watchAll=false
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(tenkes): remove BerandaTenkes, redirect to /tenkes/forum"
```

---

## Task 11: Simplify AdminDashboard (single column, hapus QuickLinks)

**Files:** `src/features/admin/AdminDashboard.jsx`

- [ ] **Step 1: Replace file**

```jsx
import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import AdminStatsGrid from './AdminStatsGrid';
import AdminActivityFeed from './AdminActivityFeed';
import { useAdminDashboardData } from './useAdminDashboardData';
import useAuth from '../../hook/useAuth';

function greetingPart() {
  const h = new Date().getHours();
  if (h < 11) return 'Pagi';
  if (h < 15) return 'Siang';
  if (h < 19) return 'Sore';
  return 'Malam';
}

export default function AdminDashboard() {
  const auth = useAuth();
  const adminName = auth?.user?.name ?? 'Admin';
  const { stats, activity, isLoading, hasPartialError } = useAdminDashboardData();

  return (
    <div>
      <PageHeader
        eyebrow={`Panel Admin · ${greetingPart()}`}
        title={`Halo, ${adminName}`}
        subtitle="Ringkasan aktivitas KMS Digital Lebakwangi."
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[33px]">
        <AdminStatsGrid stats={stats} loading={isLoading} />
        <AdminActivityFeed
          items={activity}
          loading={isLoading}
          hasPartialError={hasPartialError}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Hapus AdminQuickLinks.jsx**

```bash
Remove-Item -LiteralPath "src/features/admin/AdminQuickLinks.jsx" -Force
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: success (tidak ada referensi `AdminQuickLinks` lagi).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(admin): single-column dashboard, remove QuickLinks"
```

---

## Task 12: Simplify AdminStatsGrid (6 → 4 card)

**Files:** `src/features/admin/AdminStatsGrid.jsx`

- [ ] **Step 1: Baca file dulu**

```bash
type src\features\admin\AdminStatsGrid.jsx
```

- [ ] **Step 2: Replace dengan 4 card**

```jsx
import React from 'react';
import StatCard from '../../components/ui/StatCard';
import { Home, Building2, Users, Newspaper } from 'lucide-react';

export default function AdminStatsGrid({ stats, loading }) {
  const items = [
    {
      label: 'Desa',
      value: stats.desa,
      Icon: Home,
      href: '/admin/dashboard/desa',
    },
    {
      label: 'Posyandu',
      value: stats.posyandu,
      Icon: Building2,
      href: '/admin/dashboard/posyandu',
    },
    {
      label: 'Pengguna',
      value:
        (stats.kader ?? 0) + (stats.nakes ?? 0) + (stats.ortu ?? 0),
      Icon: Users,
      href: '/admin/dashboard/kader-posyandu',
      breakdown: [
        { label: 'Kader', value: stats.kader },
        { label: 'Tenkes', value: stats.nakes },
        { label: 'Ortu', value: stats.ortu },
      ],
    },
    {
      label: 'Artikel',
      value: stats.artikel,
      Icon: Newspaper,
      href: '/admin/dashboard/artikel',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[17px]">
      {items.map((it) => (
        <StatCard
          key={it.label}
          label={it.label}
          value={it.value}
          Icon={it.Icon}
          href={it.href}
          loading={loading}
        >
          {it.breakdown && (
            <div className="flex gap-[13px] mt-[13px] pt-[13px] border-t border-light-ash/60">
              {it.breakdown.map((b) => (
                <div key={b.label} className="flex flex-col">
                  <span className="text-caption text-graphite">{b.label}</span>
                  <span className="text-body-sm font-bold text-deep-slate tabular-nums">
                    {b.value ?? '-'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </StatCard>
      ))}
    </div>
  );
}
```

Catatan: kalau `StatCard` tidak terima prop `children`, tambahkan support `children` di `src/components/ui/StatCard.jsx` di Step 3.

- [ ] **Step 3: Cek StatCard support children**

Buka `src/components/ui/StatCard.jsx`. Kalau belum render `{children}`, tambah di akhir card body:

```jsx
{children}
```

- [ ] **Step 4: Build check**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/AdminStatsGrid.jsx src/components/ui/StatCard.jsx
git commit -m "refactor(admin): reduce stats grid from 6 to 4 cards with user breakdown"
```

---

## Task 13: Rename label sidebar admin

**Files:** `src/components/layout/Dashboard/sidebarLinks.js`

- [ ] **Step 1: Update labels**

```js
import {
  LayoutDashboard,
  Home,
  FileText,
  Building2,
  Newspaper,
  UserCog,
  Stethoscope,
  BarChart3,
} from 'lucide-react';

export const sidebarlink = [
  {
    title: 'Beranda',
    links: [
      { title: 'Dashboard', path: '', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'Data Master',
    links: [
      { title: 'Desa', path: 'desa', icon: Home },
      { title: 'Posyandu', path: 'posyandu', icon: Building2 },
      { title: 'Artikel', path: 'artikel', icon: Newspaper },
    ],
  },
  {
    title: 'Akun Pengguna',
    links: [
      { title: 'Kader Posyandu', path: 'kader-posyandu', icon: UserCog },
      { title: 'Tenaga Kesehatan', path: 'tenaga-kesehatan', icon: Stethoscope },
    ],
  },
  {
    title: 'Laporan',
    links: [
      { title: 'Laporan Keseluruhan', path: 'laporan', icon: BarChart3 },
    ],
  },
];

export const _reservedIcons = { FileText };
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Dashboard/sidebarLinks.js
git commit -m "chore(admin): rename sidebar labels to user-friendly Indonesian"
```

---

## Task 14: Verification sweep

- [ ] **Step 1: Final build + test**

```bash
npm run build
npm test -- --watchAll=false
```

Expected: 64 tests pass, build sukses, bundle ≤ existing + 5 KB.

- [ ] **Step 2: Audit referensi file yang dihapus**

```bash
rg "BerandaTenkes|AdminQuickLinks" src/ --type js --type jsx
```

Expected: zero matches (kecuali di docs).

- [ ] **Step 3: Audit modal lama di ModePosyandu**

```bash
rg "ApproveModal|OrangTuaModal" src/features/kader/ModePosyandu.jsx
```

Expected: zero matches.

- [ ] **Step 4: Manual visual QA via npm start**

Login per role:
- **Kader:** verify `/kader/balita` cuma 3 button header (Akun OT + Laporan + Keluar). Klik Akun OT → `/kader/orangtua` tampil 2 tab.
- **Orang Tua:** verify `/orangtua/forum` punya 2 tab. Klik tab Saya → URL jadi `/orangtua/forum?tab=saya`. Akses `/orangtua/forum/saya` di-redirect.
- **Desa:** verify `/desa/beranda` punya 3 section (Export, Laporan, Acara). Akses `/desa/acara` di-redirect dengan scroll ke #acara.
- **Tenkes:** verify login langsung di `/tenkes/forum`. Akses `/tenkes/beranda` di-redirect.
- **Admin:** verify dashboard single column, 4 stats card. Sidebar pakai label baru.

- [ ] **Step 5: Tidak commit apa pun di Task 14**

Sweep saja.

---

## Task 15: Update docs/testing-checklist.md

**Files:** `docs/testing-checklist.md`

- [ ] **Step 1: Tambah section baru**

```markdown
## Cross-Role Flow Simplification (Plan 2026-05-14)

- [ ] Login kader → header `/kader/balita` cuma punya 3 tombol (Akun OT, Laporan, Keluar)
- [ ] Klik "Akun Orang Tua" → navigate ke `/kader/orangtua`
- [ ] `/kader/orangtua` punya tab "Menunggu Persetujuan" + "Daftar Aktif" dengan badge count
- [ ] Tab pending bekerja: approve/tolak orang tua + anak
- [ ] Tab aktif bekerja: tambah/edit/hapus orang tua
- [ ] Login OT → `/orangtua/forum` punya tab Semua + Punya Saya
- [ ] Tab "Punya Saya" filter post milik user, URL berubah ke `?tab=saya`
- [ ] `/orangtua/forum/saya` di-redirect ke `/orangtua/forum?tab=saya`
- [ ] Login desa → `/desa/beranda` punya 3 section (Export, Laporan, Acara)
- [ ] Akses `/desa/acara` di-redirect dengan scroll ke section #acara
- [ ] Login tenkes → langsung di `/tenkes/forum`
- [ ] `/tenkes/beranda` di-redirect ke `/tenkes/forum`
- [ ] `/admin/dashboard` single column: PageHeader + 4 stats + activity feed
- [ ] Stats card "Pengguna" tampilkan total + breakdown 3 role
- [ ] Sidebar admin pakai label "Beranda / Data Master / Akun Pengguna / Laporan"
- [ ] 64 tests pass, build sukses
```

- [ ] **Step 2: Commit**

```bash
git add docs/testing-checklist.md
git commit -m "docs: add Plan 2026-05-14 testing checklist"
```

---

## Plan Acceptance

- ✅ `/kader/balita` tidak punya `<ApproveModal>` / `<OrangTuaModal>` di tree
- ✅ `/kader/orangtua` baru dengan 2 tab + badge count
- ✅ `/orangtua/forum` punya tab Semua/Saya via searchParam
- ✅ `/desa/beranda` punya section Acara, route `/desa/acara` redirect
- ✅ Login tenkes di `/tenkes/forum`, BerandaTenkes file dihapus
- ✅ AdminDashboard single column, AdminQuickLinks dihapus
- ✅ AdminStatsGrid 4 card dengan breakdown user
- ✅ Sidebar label diperbarui
- ✅ 3 redirect baru di legacyRedirects + test pass
- ✅ 64 unit test pass, build sukses
- ✅ Tidak ada API yang berubah

---

## Risiko & Catatan

| Risiko | Mitigasi |
|---|---|
| Field `user_id` di payload Post.jsx mungkin beda nama | Cek Network response, sesuaikan di Task 7 Step 2 |
| Stats Pengguna gabungan menyembunyikan partial error per query | Card menerima `null` value graceful via StatCard skeleton |
| `useEffect` scroll ke #acara race dengan data loading | `setTimeout 100ms` setelah hash detected (cukup karena data dari React Query bisa cached) |
| FormOrangTua butuh idPosyandu/idDesa dari user | Reuse `useSession()`, fallback null (form tetap bisa submit dengan id user existing) |

---

## Next

Setelah merged → manual visual review user → deploy. Optional future:
- Simplify `MyPost` page atau hapus karena redundant dengan tab forum
- Tambah breadcrumb di `/kader/orangtua` untuk navigasi balik
