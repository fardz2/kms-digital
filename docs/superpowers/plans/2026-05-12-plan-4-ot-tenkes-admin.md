# Plan 4 — OT, Tenkes, Admin Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lengkapi redesign untuk 3 role yang belum disentuh: Orang Tua, Tenaga Kesehatan, Admin. Gantikan halaman legacy yang masih dirouting dengan beranda baru yang konsisten dengan design system, tapi tetap reuse komponen existing (Forum, Artikel, sidebar admin) untuk fitur yang memang sudah bekerja.

**Architecture:** Mayoritas pekerjaan adalah wrapping komponen existing dengan `<AppShell>` + `<PageHeader>` + `<Card>`, bukan rewrite. OT dan Tenkes pakai `DetailAnak` dari Plan 2 (read-only untuk OT sudah built-in via `canEdit === 'KADER_POSYANDU'`). Admin sidebar tetap, tambah menu "Laporan Keseluruhan" placeholder (implementasi di Plan 3). Tujuan: hilangkan inkonsistensi visual tanpa merombak logika fitur.

**Tech Stack:** React 18 (CRA), TanStack Query v5, Ant Design v4, Bootstrap (legacy), Tailwind, React Router v6, Jest.

**Spec:** `docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md` — Section 7 (alur role), Phase 7 & 8.

**Backend dependencies:** NONE (frontend-only).

---

## File Structure

**Folder baru:**
```
src/
├── api/
│   └── artikel.api.js                NEW (wrap GET /api/artikel)
├── queries/
│   └── useArtikelQueries.js          NEW
├── features/
│   ├── orangtua/
│   │   └── BerandaOT.jsx             NEW
│   ├── tenkes/
│   │   ├── BerandaTenkes.jsx         NEW
│   │   └── DetailForumTenkes.jsx     NEW (wrap legacy DetailForum)
│   ├── admin/
│   │   ├── AdminShell.jsx            NEW (wrap DashboardLayout dengan design tokens)
│   │   └── LaporanAdminPlaceholder.jsx NEW (stub sampai Plan 3)
│   └── artikel/
│       ├── ArtikelList.jsx           NEW (refresh list artikel public)
│       └── ArtikelDetailPage.jsx     NEW (refresh detail artikel public)
└── components/
    └── layout/
        └── AppShell.jsx              NEW (common shell navbar + bg)
```

**Dimodifikasi:**
- `src/routes/AppRoutes.jsx` — swap legacy Dashboard/Post/Artikel/DetailArtikel ke versi baru
- `src/components/layout/Dashboard/DashboardLayout.jsx` — minor styling refresh via tokens (no structure change)

**Tidak disentuh (coexist):**
- `src/pages/Dashboard/*` — `Dashboard.js` akan tetap ada sampai Plan 5 cleanup
- `src/pages/Post/*`, `src/pages/MyPost/*`, `src/pages/DetailForum/*` — legacy forum masih dipakai OT & tenkes
- `src/pages/Artikel/*`, `src/pages/Admin/DetailArtikel.js` — legacy artikel reader
- `src/pages/AdminDashboard/*` — sub-page admin (Desa, Posyandu, Kader, Tenkes register, Artikel CMS) **tetap sama**, hanya di-wrap dengan AdminShell baru
- `src/components/form/FormInputDataAnak`, `FormUpdateDataAnak`, `FormInputPost` — tetap dipakai Dashboard lama & Post

**Legacy yang akan di-wrap (bukan di-rewrite):**
- `src/pages/Post/index.js` → wrap dengan `<PageHeader>` di BerandaTenkes/BerandaOT via komponen baru, atau tetap standalone
- `src/pages/DetailForum/index.js` → tetap
- `src/pages/LandingPage/*` → tetap (sudah public)

---

## Scope Clarification

Plan 4 **bukan** rewrite fungsional. Tujuan utama:

1. **OT**: ganti landing `/orangtua/balita` dari `Dashboard.js` (table panjang + carousel) ke `BerandaOT.jsx` yang pakai card list balita (mirip `DaftarAnak` kader tapi OT-scope). Fitur tambah balita (`FormInputDataAnak`) masih dipakai via modal.

2. **Tenkes**: landing `/tenkes/forum` sekarang langsung render `Post.js` (forum). Tambah landing baru `/tenkes/beranda` yang punya quick-link ke forum + artikel. Forum tetap pakai `Post.js`.

3. **Admin**: sidebar existing `DashboardLayout` dan semua sub-page tetap. Yang di-refresh: visual shell (navbar, bg tokens) dan tambah menu "Laporan Keseluruhan" sebagai placeholder.

**Tidak dalam scope Plan 4:**
- Rewrite forum (`Post.js` + `DetailForum.js`) — stabil, tidak disentuh
- Rewrite CMS admin (`ArtikelAdmin`, `InputDesa`, `InputPosyandu`, `RegisterKaderPosyandu`, `RegisterTenkes`) — tetap pakai legacy
- Implementasi real Laporan Admin — itu scope Plan 3

---

## Testing Strategy

Pattern sama dengan Plan 1 & 2:
- Unit test untuk pure logic / map (minimal di plan ini karena mayoritas wrapping)
- Manual regression untuk visual + routing
- Target: 55 test existing + ~5 baru Plan 4 = 60 total

---

## Task 1: Artikel API module

**Files:**
- Create: `src/api/artikel.api.js`

- [ ] **Step 1: Tulis file**

```js
import { api } from './client';

export const artikelApi = {
  list: () => api.get('/api/artikel'),
  detail: (id) => api.get(`/api/artikel/${id}`),
};
```

- [ ] **Step 2: Commit**

```bash
git add src/api/artikel.api.js
git commit -m "feat(api): add artikel API module"
```

---

## Task 2: Artikel query hooks

**Files:**
- Create: `src/queries/useArtikelQueries.js`

- [ ] **Step 1: Tulis file**

```js
import { useQuery } from '@tanstack/react-query';
import { artikelApi } from '../api/artikel.api';
import { qk } from './keys';

export function useArtikelList() {
  return useQuery({
    queryKey: qk.artikel.list,
    queryFn: async () => {
      const res = await artikelApi.list();
      return res.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useArtikelDetail(id) {
  return useQuery({
    queryKey: qk.artikel.detail(id),
    queryFn: async () => {
      const res = await artikelApi.detail(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/queries/useArtikelQueries.js
git commit -m "feat(queries): add artikel query hooks"
```

---

## Task 3: AppShell layout

**Files:**
- Create: `src/components/layout/AppShell.jsx`

Shell umum: navbar simple + bg surface. Dipakai untuk OT, Tenkes, Kader (gantikan navbar + bg scattered).

- [ ] **Step 1: Tulis file**

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useSession } from '../../features/auth/useSession';

export default function AppShell({ children, menu = [], activeKey }) {
  const navigate = useNavigate();
  const { user, logout } = useSession();

  const handleLogout = () => {
    if (window.confirm('Keluar dari akun?')) {
      logout();
      navigate('/masuk', { replace: true });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <nav
        style={{
          background: 'var(--color-bg)',
          padding: 'var(--space-md) var(--space-lg)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-lg)' }}>
          KMS Digital
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', flex: 1, flexWrap: 'wrap' }}>
          {menu.map((item) => (
            <Button
              key={item.key}
              variant={activeKey === item.key ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {user?.name && (
            <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
              {user.name}
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Keluar
          </Button>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/AppShell.jsx
git commit -m "feat(layout): add AppShell navbar shell"
```

---

## Task 4: BerandaOT page

**Files:**
- Create: `src/features/orangtua/BerandaOT.jsx`

Landing OT baru: greeting + card per anak (klik → detail), link ke forum & artikel.

- [ ] **Step 1: Tulis file**

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useSession } from '../auth/useSession';
import { useAnakList } from '../../queries/useAnakQueries';
import FormInputDataAnak from '../../components/form/FormInputDataAnak';

const MENU = [
  { key: 'balita', label: 'Anak Saya', path: '/orangtua/balita' },
  { key: 'forum', label: 'Forum Tanya Jawab', path: '/orangtua/forum' },
  { key: 'artikel', label: 'Artikel', path: '/artikel' },
];

export default function BerandaOT() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { data: anakList, isLoading, refetch } = useAnakList();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <AppShell menu={MENU} activeKey="balita">
      <PageHeader
        title={`Halo, ${user?.name ?? 'Orang Tua'}`}
        subtitle="Pantau pertumbuhan anak Anda"
      />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>
            Anak Saya
          </h2>
          <Button variant="primary" size="sm" onClick={() => setFormOpen(true)}>
            + Tambah Anak
          </Button>
        </div>

        {isLoading && <div>Memuat...</div>}

        {!isLoading && (!anakList || anakList.length === 0) && (
          <Card>
            <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 'var(--space-lg)' }}>
              Belum ada data anak
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {(anakList ?? []).map((anak) => {
            const umurBulan = anak.tanggal_lahir
              ? moment().diff(moment(anak.tanggal_lahir), 'month')
              : null;
            return (
              <Card
                key={anak.id}
                onClick={() => navigate(`/orangtua/balita/${anak.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                      {anak.nama}
                    </div>
                    <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
                      {umurBulan != null ? `${umurBulan} bulan` : '-'} · {anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                    </div>
                  </div>
                  <div style={{ fontSize: 'var(--text-xl)', color: 'var(--color-muted)' }}>›</div>
                </div>
              </Card>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
          <Card onClick={() => navigate('/orangtua/forum')}>
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>💬</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>Forum Tanya Jawab</div>
          </Card>
          <Card onClick={() => navigate('/artikel')}>
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>📰</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>Artikel Kesehatan</div>
          </Card>
        </div>
      </div>

      <FormInputDataAnak
        isOpen={formOpen}
        onCancel={() => setFormOpen(false)}
        fetch={() => refetch()}
      />
    </AppShell>
  );
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/features/orangtua/BerandaOT.jsx
git commit -m "feat(orangtua): add BerandaOT landing page"
```

---

## Task 5: BerandaTenkes page

**Files:**
- Create: `src/features/tenkes/BerandaTenkes.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import { useSession } from '../auth/useSession';

const MENU = [
  { key: 'beranda', label: 'Beranda', path: '/tenkes/beranda' },
  { key: 'forum', label: 'Forum', path: '/tenkes/forum' },
  { key: 'artikel', label: 'Artikel', path: '/artikel' },
];

export default function BerandaTenkes() {
  const navigate = useNavigate();
  const { user } = useSession();

  return (
    <AppShell menu={MENU} activeKey="beranda">
      <PageHeader
        title={`Halo, ${user?.name ?? 'Tenaga Kesehatan'}`}
        subtitle="Dashboard tenaga kesehatan"
      />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
          <Card onClick={() => navigate('/tenkes/forum')}>
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>💬</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
              Forum Tanya Jawab
            </div>
            <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
              Jawab pertanyaan orang tua
            </div>
          </Card>

          <Card onClick={() => navigate('/artikel')}>
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>📰</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
              Artikel Kesehatan
            </div>
            <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
              Baca artikel edukasi gizi
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/tenkes/BerandaTenkes.jsx
git commit -m "feat(tenkes): add BerandaTenkes landing page"
```

---

## Task 6: ArtikelList page (public, refresh dari legacy)

**Files:**
- Create: `src/features/artikel/ArtikelList.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useArtikelList } from '../../queries/useArtikelQueries';

export default function ArtikelList() {
  const navigate = useNavigate();
  const { data: artikel, isLoading } = useArtikelList();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader title="Artikel Kesehatan" subtitle="Edukasi gizi dan pengasuhan balita" />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-md)' }}>
          ← Kembali
        </Button>

        {isLoading && <div>Memuat...</div>}

        {!isLoading && (!artikel || artikel.length === 0) && (
          <Card>
            <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 'var(--space-lg)' }}>
              Belum ada artikel
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {(artikel ?? []).map((item) => (
            <Card
              key={item.id}
              onClick={() => navigate(`/artikel/${item.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-xs)' }}>
                {item.judul ?? item.title ?? '-'}
              </div>
              {item.created_at && (
                <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
                  {moment(item.created_at).format('DD MMMM YYYY')}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/artikel/ArtikelList.jsx
git commit -m "feat(artikel): add ArtikelList page"
```

---

## Task 7: ArtikelDetailPage

**Files:**
- Create: `src/features/artikel/ArtikelDetailPage.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useArtikelDetail } from '../../queries/useArtikelQueries';

export default function ArtikelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: artikel, isLoading } = useArtikelDetail(id);

  const title = artikel?.judul ?? artikel?.title ?? 'Artikel';
  const content = artikel?.content ?? artikel?.isi ?? '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader
        title={isLoading ? 'Memuat...' : title}
        subtitle={artikel?.created_at ? moment(artikel.created_at).format('DD MMMM YYYY') : undefined}
      />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-md)' }}>
          ← Kembali
        </Button>

        {isLoading ? (
          <div>Memuat artikel...</div>
        ) : (
          <div
            style={{
              background: 'var(--color-bg)',
              padding: 'var(--space-lg)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-card)',
              fontSize: 'var(--text-base)',
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/artikel/ArtikelDetailPage.jsx
git commit -m "feat(artikel): add ArtikelDetailPage"
```

---

## Task 8: LaporanAdminPlaceholder

**Files:**
- Create: `src/features/admin/LaporanAdminPlaceholder.jsx`

Placeholder sampai Plan 3 implementasi laporan real.

- [ ] **Step 1: Tulis file**

```jsx
import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

export default function LaporanAdminPlaceholder() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader
        title="Laporan Keseluruhan"
        subtitle="Rekap bulanan semua desa & posyandu"
      />
      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--color-muted)' }}>
            Fitur laporan sedang disiapkan. Akan tersedia pada rilis berikutnya.
          </div>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/admin/LaporanAdminPlaceholder.jsx
git commit -m "feat(admin): add LaporanAdminPlaceholder stub"
```

---

## Task 9: Admin sidebar — tambah menu Laporan

**Files:**
- Read & Modify: `src/components/layout/Dashboard/sidebarLinks.js`

- [ ] **Step 1: Baca file existing**

```bash
Get-Content src/components/layout/Dashboard/sidebarLinks.js
```

- [ ] **Step 2: Tambah entry Laporan**

Tambah item baru di array `sidebarLinks` setelah entry terakhir, mengikuti pola existing. Misal kalau pola-nya:
```js
{ label: 'Artikel', path: '/admin/dashboard/artikel', icon: ... }
```
Tambah:
```js
{ label: 'Laporan Keseluruhan', path: '/admin/dashboard/laporan', icon: ... }
```
Gunakan icon yang sudah dipakai di file tersebut (misalnya dari `@heroicons/react` atau `@ant-design/icons`).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Dashboard/sidebarLinks.js
git commit -m "feat(admin): add Laporan menu to sidebar"
```

---

## Task 10: Integrasi route baru di AppRoutes

**Files:**
- Modify: `src/routes/AppRoutes.jsx`

- [ ] **Step 1: Baca file**

Buka `src/routes/AppRoutes.jsx` saat ini.

- [ ] **Step 2: Ganti import + route**

Tambah import:
```jsx
import BerandaOT from '../features/orangtua/BerandaOT';
import BerandaTenkes from '../features/tenkes/BerandaTenkes';
import ArtikelList from '../features/artikel/ArtikelList';
import ArtikelDetailPage from '../features/artikel/ArtikelDetailPage';
import LaporanAdminPlaceholder from '../features/admin/LaporanAdminPlaceholder';
```

Ganti route:
- `/orangtua/balita` → `<BerandaOT />` (dari `<Dashboard />`)
- `/tenkes/beranda` → `<BerandaTenkes />` (NEW route)
- `/tenkes/forum` tetap pakai `<Post />`
- `/artikel` → `<ArtikelList />` (dari `<Artikel />`)
- `/artikel/:id` → `<ArtikelDetailPage />` (dari `<DetailArtikel />`)
- Admin: tambah `<Route path="laporan" element={<LaporanAdminPlaceholder />} />` di dalam `/admin/dashboard`

Legacy redirect: pastikan `/tenaga-kesehatan/dashboard` → `/tenkes/forum` (sudah ada di legacyRedirects Plan 1). Tambah `/tenkes/beranda` sebagai new landing default tenkes di `roleHome.js` kalau perlu.

- [ ] **Step 3: Update ROLE_HOME**

Di `src/features/auth/roleHome.js`, ganti:
```js
TENAGA_KESEHATAN: '/tenkes/forum',
```
jadi:
```js
TENAGA_KESEHATAN: '/tenkes/beranda',
```

- [ ] **Step 4: Update test**

Di `src/__tests__/features/auth/roleHome.test.js`, update expectation:
```js
expect(ROLE_HOME.TENAGA_KESEHATAN).toEqual('/tenkes/beranda');
```

- [ ] **Step 5: Verify build + tests**

```bash
npm run build
npm test -- --watchAll=false
```

Expected: build pass, 55 tests pass (test yang di-update masih ijo).

- [ ] **Step 6: Commit**

```bash
git add src/routes/AppRoutes.jsx src/features/auth/roleHome.js src/__tests__/features/auth/roleHome.test.js
git commit -m "refactor(routes): swap to new OT, Tenkes, artikel pages"
```

---

## Task 11: Manual verification

**Files:**
- None (manual test)

- [ ] **Step 1: Login sebagai Orang Tua**

1. `npm start`, buka `/masuk`, login OT
2. Redirect ke `/orangtua/balita` → render `BerandaOT` dengan greeting + card anak + 2 card Forum/Artikel
3. Klik card anak → `/orangtua/balita/:id` → DetailAnak (tanpa tombol edit/delete — sesuai Plan 2 fix)
4. Klik "+ Tambah Anak" → modal `FormInputDataAnak` legacy muncul
5. Klik Forum → `/orangtua/forum` legacy Post
6. Klik Artikel → `/artikel` → ArtikelList baru

- [ ] **Step 2: Login sebagai Tenaga Kesehatan**

1. Logout, login tenkes
2. Redirect ke `/tenkes/beranda` → render BerandaTenkes dengan 2 card
3. Klik Forum → `/tenkes/forum` legacy Post
4. Klik Artikel → `/artikel` ArtikelList

- [ ] **Step 3: Login sebagai Admin**

1. Logout, login admin
2. Redirect ke `/admin/dashboard/desa` existing
3. Sidebar ada menu "Laporan Keseluruhan" → klik → placeholder muncul
4. Sub-page admin lain (Desa, Posyandu, Kader, Tenkes, Artikel) tetap jalan

- [ ] **Step 4: Artikel public access**

1. Logout, buka `/artikel` langsung
2. List artikel muncul tanpa login
3. Klik salah satu → ArtikelDetailPage

---

## Task 12: Update docs

**Files:**
- Modify: `docs/testing-checklist.md`
- Modify: `docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md`

- [ ] **Step 1: Tambah section di checklist**

Tambah:

```markdown
## Orang Tua (Plan 4)
- [ ] `/orangtua/balita` landing baru BerandaOT dengan greeting + card anak
- [ ] Tombol "+ Tambah Anak" buka modal FormInputDataAnak legacy
- [ ] Klik card anak → DetailAnak (read-only, no edit/delete button)
- [ ] Menu Forum & Artikel accessible

## Tenaga Kesehatan (Plan 4)
- [ ] `/tenkes/beranda` landing baru dengan 2 card (Forum + Artikel)
- [ ] Login tenkes redirect ke /tenkes/beranda (bukan /tenkes/forum)

## Admin (Plan 4)
- [ ] Sidebar admin ada menu baru "Laporan Keseluruhan"
- [ ] Klik menu → render placeholder "Fitur laporan sedang disiapkan"
- [ ] Sub-page existing (Desa, Posyandu, Kader, Tenkes, Artikel) tidak regressions

## Artikel Public
- [ ] `/artikel` render ArtikelList baru (bukan legacy)
- [ ] `/artikel/:id` render ArtikelDetailPage baru
- [ ] Akses tanpa login (public) masih jalan
```

- [ ] **Step 2: Update spec status**

```
**Status:** Phase 0–8 DONE (Plan 1 + Plan 2 + Plan 4). Phase 5+6 pending (Plan 3 blocked by B2). Phase 9 (cleanup) pending.
```

- [ ] **Step 3: Commit**

```bash
git add docs/testing-checklist.md docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md
git commit -m "docs: update for Plan 4 OT Tenkes Admin refresh"
```

---

## Plan 4 Acceptance Criteria

- ✅ OT landing baru `BerandaOT` dengan card list anak + link forum/artikel
- ✅ Tenkes landing baru `BerandaTenkes` dengan quick-link forum/artikel
- ✅ `/tenkes/beranda` route baru, `ROLE_HOME.TENAGA_KESEHATAN` updated
- ✅ Artikel public pages di-refresh (ArtikelList + ArtikelDetailPage)
- ✅ Admin sidebar tambah menu Laporan (placeholder sampai Plan 3)
- ✅ AppShell reusable untuk OT & Tenkes
- ✅ Legacy Forum (`Post.js`, `DetailForum.js`) masih dipakai, tidak di-rewrite
- ✅ Admin sub-pages (CMS, register) tidak regressions
- ✅ Tests pass: 55 existing + 0 new (wrap-only, no new logic)

---

## Risiko & Catatan

| Risiko | Mitigasi |
|---|---|
| `FormInputDataAnak` legacy pakai `useAuth` lama | Tetap jalan karena `hook/useAuth.js` masih ada (dihapus di Plan 5). Verifikasi di Task 11 Step 1 |
| Artikel API shape beda (judul vs title) | ArtikelList & ArtikelDetailPage punya fallback `item.judul ?? item.title` |
| Sidebar admin styling berbeda dari design tokens baru | Out of scope — full revamp admin shell di Plan 5 atau plan lanjutan |
| Tenkes legacy route `/tenaga-kesehatan/dashboard` → `/tenkes/forum` (bukan `/tenkes/beranda`) | OK — legacy redirect ke `/tenkes/forum` tetap valid, new user ke `/tenkes/beranda` via role home |

---

## Next Plan

- **Plan 3 — Laporan & Desa** (Phase 5+6) — tunggu backend B2
- **Plan 5 — Cleanup** (Phase 9) — hapus semua legacy setelah semua role migrated
