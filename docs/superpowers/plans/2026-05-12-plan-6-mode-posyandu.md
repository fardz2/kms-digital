# Plan 6 — Mode Posyandu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ganti halaman kader (`/kader/beranda` + `/kader/balita`) jadi satu halaman "Mode Posyandu" yang menampilkan daftar balita dengan status checklist, tombol "Ukur" langsung, dan smart default form pengukuran.

**Architecture:** Satu halaman orchestrator `ModePosyandu` yang compose komponen presentational (`PosyanduHeader`, `FilterChip`, `BalitaCard`) + hook data (`usePengukuranBulananKader`). Form pengukuran existing ditambah prop `prefillFrom` untuk smart default saat create mode. Legacy `BerandaKader.jsx` dan `DaftarAnak.jsx` dihapus. Route `/kader/beranda` redirect ke `/kader/balita`.

**Tech Stack:** React 18 (CRA), TanStack Query v5, Ant Design v4 (DatePicker, Input, Modal), moment, Jest.

**Spec:** `docs/superpowers/specs/2026-05-12-mode-posyandu-design.md`.

**Backend dependencies:** NONE — pakai endpoint existing (`/api/posyandu/data-anak`, `/api/posyandu/statistik-anak/:id` + POST/PUT).

---

## File Structure

**File baru:**
```
src/features/kader/
├── ModePosyandu.jsx             NEW
├── PosyanduHeader.jsx           NEW
├── BalitaCard.jsx               NEW
└── FilterChip.jsx               NEW

src/queries/
└── usePengukuranBulananKader.js NEW
```

**File dimodifikasi:**
- `src/features/pengukuran/PengukuranForm.jsx` — tambah prop `prefillFrom`
- `src/routes/AppRoutes.jsx` — swap route `/kader/balita` ke `ModePosyandu`, hapus import `DaftarAnak` & `BerandaKader`
- `src/routes/legacyRedirects.js` — tambah `/kader/beranda` → `/kader/balita`
- `src/features/auth/roleHome.js` — `KADER_POSYANDU: '/kader/balita'`
- `src/__tests__/features/auth/roleHome.test.js` — update expectation
- `src/__tests__/routes/legacyRedirects.test.js` — tambah entry baru

**File dihapus:**
- `src/features/kader/BerandaKader.jsx`
- `src/features/anak/DaftarAnak.jsx`

---

## Testing Strategy

- Unit test existing (63) harus tetap pass
- Test update: `roleHome.test.js`, `legacyRedirects.test.js`
- Komponen presentational baru (`BalitaCard`, `PosyanduHeader`, `FilterChip`) tidak butuh test terpisah — covered via manual smoke test di Task 13
- Build check per batch task

---

## Task 1: Create `usePengukuranBulananKader` hook

**Files:**
- Create: `src/queries/usePengukuranBulananKader.js`

- [ ] **Step 1: Tulis file**

```js
import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAnakList } from './useAnakQueries';
import { pengukuranApi } from '../api/pengukuran.api';
import { useSession } from '../features/auth/useSession';
import { qk } from './keys';

export function usePengukuranBulananKader() {
  const { role, isAuthenticated } = useSession();
  const { data: anakList, isLoading: anakLoading } = useAnakList();

  const queries = useQueries({
    queries: (anakList ?? []).map((anak) => ({
      queryKey: qk.pengukuran.byAnak(anak.id, role),
      queryFn: async () => {
        const res = await pengukuranApi.list(anak.id, role);
        return res.data ?? [];
      },
      staleTime: 5 * 60 * 1000,
      enabled: isAuthenticated && !!role && !!anak.id,
    })),
  });

  const isFetchingPengukuran = queries.some((q) => q.isLoading);

  const pengukuranByAnak = useMemo(() => {
    const map = {};
    (anakList ?? []).forEach((anak, idx) => {
      map[anak.id] = queries[idx]?.data ?? [];
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anakList, queries.map((q) => q.dataUpdatedAt).join(',')]);

  return {
    anakList: anakList ?? [],
    pengukuranByAnak,
    isLoading: anakLoading || isFetchingPengukuran,
  };
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: sukses.

- [ ] **Step 3: Commit**

```bash
git add src/queries/usePengukuranBulananKader.js
git commit -m "feat(queries): add usePengukuranBulananKader hook"
```

---

## Task 2: Create `FilterChip` component

**Files:**
- Create: `src/features/kader/FilterChip.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React from 'react';
import Button from '../../components/ui/Button';

const OPTIONS = [
  { key: 'semua', label: 'Semua' },
  { key: 'belum', label: 'Belum diukur' },
  { key: 'perhatian', label: '⚠️ Perhatian' },
];

export default function FilterChip({ value = 'semua', onChange, counts = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        flexWrap: 'wrap',
        padding: 'var(--space-sm) 0',
      }}
    >
      {OPTIONS.map((opt) => {
        const count = counts[opt.key];
        const isActive = value === opt.key;
        return (
          <Button
            key={opt.key}
            variant={isActive ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onChange?.(opt.key)}
          >
            {opt.label}
            {count != null && (
              <span
                style={{
                  marginLeft: 'var(--space-xs)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: isActive ? 'rgba(255,255,255,0.3)' : 'var(--color-surface)',
                  fontSize: 'var(--text-base)',
                }}
              >
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/kader/FilterChip.jsx
git commit -m "feat(kader): add FilterChip component"
```

---

## Task 3: Create `PosyanduHeader` component

**Files:**
- Create: `src/features/kader/PosyanduHeader.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React from 'react';
import moment from 'moment';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';

export default function PosyanduHeader({
  userName,
  posyanduName,
  sudahCount,
  totalCount,
  onLaporan,
  onKeluar,
}) {
  const bulanLabel = moment().format('MMMM YYYY');

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--color-primary)',
        color: '#FFFFFF',
        padding: 'var(--space-md) var(--space-lg)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-md)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            Halo, {userName ?? 'Kader'}
          </div>
          <div style={{ fontSize: 'var(--text-base)', opacity: 0.9 }}>
            {posyanduName ? `Posyandu ${posyanduName} · ` : ''}
            {bulanLabel}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <Button variant="ghost" size="sm" onClick={onLaporan} style={{ color: '#FFFFFF' }}>
            📊 Laporan
          </Button>
          <Button variant="ghost" size="sm" onClick={onKeluar} style={{ color: '#FFFFFF' }}>
            Keluar
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-md)' }}>
        <ProgressBar
          value={sudahCount}
          max={totalCount || 1}
          label={`Sudah diukur`}
          color="#FFFFFF"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/kader/PosyanduHeader.jsx
git commit -m "feat(kader): add PosyanduHeader component"
```

---

## Task 4: Create `BalitaCard` component

**Files:**
- Create: `src/features/kader/BalitaCard.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React, { useMemo } from 'react';
import moment from 'moment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { overallStatus, STATUS } from '../pengukuran/statusGizi';

const toZ = (v) => (v == null || v === '' ? null : Number(v));

function classifyBalita(pengukuranList, currentBulan) {
  const safe = pengukuranList ?? [];
  const latest = safe
    .slice()
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];

  const bulanIni = safe.filter(
    (p) => moment(p.date).format('YYYY-MM') === currentBulan
  );
  const latestBulanIni = bulanIni
    .slice()
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];

  const status = latest
    ? overallStatus({
        zScoreBB: toZ(latest.z_score_berat),
        zScoreTB: toZ(latest.z_score_tinggi),
        zScoreLK: toZ(latest.z_score_lingkar_kepala),
        zScoreGizi: toZ(latest.z_score_gizi),
      })
    : STATUS.UNKNOWN;

  const sudahDiukur = !!latestBulanIni;
  const perluPerhatian =
    status !== STATUS.NORMAL && status !== STATUS.UNKNOWN;

  return { latest, latestBulanIni, status, sudahDiukur, perluPerhatian };
}

export default function BalitaCard({
  anak,
  pengukuranList,
  currentBulan,
  onUkur,
  onUlang,
  onLihat,
}) {
  const { latest, latestBulanIni, status, sudahDiukur, perluPerhatian } =
    useMemo(() => classifyBalita(pengukuranList, currentBulan), [
      pengukuranList,
      currentBulan,
    ]);

  const icon = perluPerhatian ? '⚠️' : sudahDiukur ? '✅' : '⚪';
  const umurBulan = anak.tanggal_lahir
    ? moment().diff(moment(anak.tanggal_lahir), 'month')
    : null;
  const genderLabel = anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan';

  return (
    <Card style={{ padding: 'var(--space-md)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-md)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              marginBottom: 'var(--space-xs)',
            }}
          >
            <span style={{ fontSize: 'var(--text-xl)' }} aria-hidden="true">
              {icon}
            </span>
            <span
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {anak.nama}
            </span>
            {perluPerhatian && <StatusBadge status={status} />}
          </div>
          <div
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-muted)',
            }}
          >
            {umurBulan != null ? `${umurBulan} bulan · ` : ''}
            {genderLabel}
          </div>
          {latest && (
            <div
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-muted)',
                marginTop: 'var(--space-xs)',
              }}
            >
              {sudahDiukur ? (
                <>
                  {moment(latestBulanIni.date).format('DD MMM')} · {latestBulanIni.berat}kg · TB{' '}
                  {latestBulanIni.tinggi}cm
                </>
              ) : (
                <>
                  Terakhir: {moment(latest.date).format('DD MMM YYYY')} · {latest.berat}kg
                </>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-xs)',
            alignItems: 'stretch',
          }}
        >
          {sudahDiukur ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onLihat?.(anak)}
              >
                Lihat riwayat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUlang?.(anak, latestBulanIni)}
              >
                Ulang
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => onUkur?.(anak, latest)}
            >
              ✏️ UKUR
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/kader/BalitaCard.jsx
git commit -m "feat(kader): add BalitaCard component with status-based CTAs"
```

---

## Task 5: Update `PengukuranForm` to accept `prefillFrom` prop

**Files:**
- Modify: `src/features/pengukuran/PengukuranForm.jsx`

- [ ] **Step 1: Baca file existing**

```bash
Get-Content src/features/pengukuran/PengukuranForm.jsx
```

- [ ] **Step 2: Update signature dan useEffect**

Replace function signature line (ada baris `export default function PengukuranForm({ open, onClose, anak, existing }) {`) dengan:

```jsx
export default function PengukuranForm({ open, onClose, anak, existing, prefillFrom }) {
```

Replace the existing `useEffect` block (yang handle open+existing) dengan:

```jsx
  useEffect(() => {
    if (!open) return;
    const source = existing ?? prefillFrom;
    if (source) {
      setTanggal(existing?.date ? moment(existing.date) : moment());
      setBerat(Number(source.berat) || DEFAULTS.berat);
      setTinggi(Number(source.tinggi) || DEFAULTS.tinggi);
      setLingkarKepala(Number(source.lingkar_kepala) || DEFAULTS.lingkarKepala);
      setLila(Number(source.lila) || DEFAULTS.lila);
      setCatatan(existing?.catatan ?? '');
    } else {
      setTanggal(moment());
      setBerat(DEFAULTS.berat);
      setTinggi(DEFAULTS.tinggi);
      setLingkarKepala(DEFAULTS.lingkarKepala);
      setLila(DEFAULTS.lila);
      setCatatan(DEFAULTS.catatan);
    }
  }, [open, existing, prefillFrom]);
```

Precedence: `existing` wins atas `prefillFrom`. Kalau keduanya null → fallback ke DEFAULTS statis.

- [ ] **Step 3: Build check**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/features/pengukuran/PengukuranForm.jsx
git commit -m "feat(pengukuran): add prefillFrom prop for smart default values"
```

---

## Task 6: Create `ModePosyandu` orchestrator

**Files:**
- Create: `src/features/kader/ModePosyandu.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import PosyanduHeader from './PosyanduHeader';
import FilterChip from './FilterChip';
import BalitaCard from './BalitaCard';
import Button from '../../components/ui/Button';
import PengukuranForm from '../pengukuran/PengukuranForm';
import { useSession } from '../auth/useSession';
import { usePengukuranBulananKader } from '../../queries/usePengukuranBulananKader';
import { overallStatus, STATUS } from '../pengukuran/statusGizi';
import FormInputDataAnak from '../../components/form/FormInputDataAnak';

const toZ = (v) => (v == null || v === '' ? null : Number(v));

function classify(pengukuranList, currentBulan) {
  const safe = pengukuranList ?? [];
  const latest = safe
    .slice()
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];
  const bulanIni = safe.filter(
    (p) => moment(p.date).format('YYYY-MM') === currentBulan
  );
  const latestBulanIni = bulanIni
    .slice()
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];
  const status = latest
    ? overallStatus({
        zScoreBB: toZ(latest.z_score_berat),
        zScoreTB: toZ(latest.z_score_tinggi),
        zScoreLK: toZ(latest.z_score_lingkar_kepala),
        zScoreGizi: toZ(latest.z_score_gizi),
      })
    : STATUS.UNKNOWN;
  const sudahDiukur = !!latestBulanIni;
  const perluPerhatian = status !== STATUS.NORMAL && status !== STATUS.UNKNOWN;
  return { latest, latestBulanIni, sudahDiukur, perluPerhatian };
}

function priority(meta) {
  if (meta.perluPerhatian) return 0;
  if (!meta.sudahDiukur) return 1;
  return 2;
}

export default function ModePosyandu() {
  const navigate = useNavigate();
  const { user, logout } = useSession();
  const { anakList, pengukuranByAnak, isLoading } = usePengukuranBulananKader();
  const [filter, setFilter] = useState('semua');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAnak, setSelectedAnak] = useState(null);
  const [existingPengukuran, setExistingPengukuran] = useState(null);
  const [prefillFrom, setPrefillFrom] = useState(null);
  const [tambahOpen, setTambahOpen] = useState(false);

  const currentBulan = moment().format('YYYY-MM');

  const balitaWithMeta = useMemo(() => {
    return (anakList ?? []).map((anak) => ({
      anak,
      meta: classify(pengukuranByAnak[anak.id], currentBulan),
    }));
  }, [anakList, pengukuranByAnak, currentBulan]);

  const counts = useMemo(
    () => ({
      semua: balitaWithMeta.length,
      belum: balitaWithMeta.filter((x) => !x.meta.sudahDiukur).length,
      perhatian: balitaWithMeta.filter((x) => x.meta.perluPerhatian).length,
    }),
    [balitaWithMeta]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return balitaWithMeta
      .filter(({ anak, meta }) => {
        if (q && !(anak.nama ?? '').toLowerCase().includes(q)) return false;
        if (filter === 'belum') return !meta.sudahDiukur;
        if (filter === 'perhatian') return meta.perluPerhatian;
        return true;
      })
      .sort((a, b) => {
        const pa = priority(a.meta);
        const pb = priority(b.meta);
        if (pa !== pb) return pa - pb;
        return (a.anak.nama ?? '').localeCompare(b.anak.nama ?? '');
      });
  }, [balitaWithMeta, search, filter]);

  const handleKeluar = () => {
    if (window.confirm('Keluar dari akun?')) {
      logout();
      navigate('/masuk', { replace: true });
    }
  };

  const handleUkur = (anak, latest) => {
    setSelectedAnak(anak);
    setExistingPengukuran(null);
    setPrefillFrom(
      latest
        ? {
            berat: Number(latest.berat),
            tinggi: Number(latest.tinggi),
            lingkar_kepala: Number(latest.lingkar_kepala),
            lila: latest.lila != null ? Number(latest.lila) : null,
          }
        : null
    );
    setFormOpen(true);
  };

  const handleUlang = (anak, pengukuran) => {
    setSelectedAnak(anak);
    setExistingPengukuran(pengukuran);
    setPrefillFrom(null);
    setFormOpen(true);
  };

  const handleLihat = (anak) => {
    navigate(`/kader/balita/${anak.id}`);
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelectedAnak(null);
    setExistingPengukuran(null);
    setPrefillFrom(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', paddingBottom: 80 }}>
      <PosyanduHeader
        userName={user?.name}
        posyanduName={user?.posyandu_name}
        sudahCount={counts.semua - counts.belum}
        totalCount={counts.semua}
        onLaporan={() => navigate('/kader/laporan')}
        onKeluar={handleKeluar}
      />

      <div style={{ padding: 'var(--space-md) var(--space-lg) 0', position: 'sticky', top: 140, zIndex: 5, background: 'var(--color-surface)' }}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Cari nama balita..."
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            fontSize: 'var(--text-base)',
            borderRadius: 'var(--radius-button)',
            border: '1px solid var(--color-border)',
            marginBottom: 'var(--space-sm)',
          }}
        />
        <FilterChip value={filter} onChange={setFilter} counts={counts} />
      </div>

      <div style={{ padding: 'var(--space-md) var(--space-lg)', maxWidth: 960, margin: '0 auto' }}>
        {isLoading && <div>Memuat data balita...</div>}
        {!isLoading && filtered.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-xl)',
              color: 'var(--color-muted)',
            }}
          >
            {balitaWithMeta.length === 0
              ? 'Belum ada data balita. Tambah balita baru di tombol bawah.'
              : 'Tidak ada balita yang cocok dengan filter.'}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.map(({ anak, meta }) => (
            <BalitaCard
              key={anak.id}
              anak={anak}
              pengukuranList={pengukuranByAnak[anak.id]}
              currentBulan={currentBulan}
              onUkur={(a) => handleUkur(a, meta.latest)}
              onUlang={handleUlang}
              onLihat={handleLihat}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'var(--space-md)',
          background: 'var(--color-bg)',
          borderTop: '1px solid var(--color-border)',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setTambahOpen(true)}
            style={{ width: '100%' }}
          >
            + Tambah Balita Baru
          </Button>
        </div>
      </div>

      <PengukuranForm
        open={formOpen}
        onClose={closeForm}
        anak={selectedAnak}
        existing={existingPengukuran}
        prefillFrom={prefillFrom}
      />

      <FormInputDataAnak
        isOpen={tambahOpen}
        onCancel={() => setTambahOpen(false)}
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
git add src/features/kader/ModePosyandu.jsx
git commit -m "feat(kader): add ModePosyandu orchestrator page"
```

---

## Task 7: Update route `/kader/balita` ke `ModePosyandu`

**Files:**
- Modify: `src/routes/AppRoutes.jsx`

- [ ] **Step 1: Baca file**

```bash
Get-Content src/routes/AppRoutes.jsx
```

- [ ] **Step 2: Ganti import dan route**

Remove import lines:

```jsx
import BerandaKader from '../features/kader/BerandaKader';
import DaftarAnak from '../features/anak/DaftarAnak';
```

Add import line:

```jsx
import ModePosyandu from '../features/kader/ModePosyandu';
```

Find the block:

```jsx
      {/* Role: Kader Posyandu (NEW) */}
      <Route element={<RequireRole allow={['KADER_POSYANDU']} />}>
        <Route path="/kader/beranda" element={<BerandaKader />} />
        <Route path="/kader/balita" element={<DaftarAnak />} />
        <Route path="/kader/balita/:id" element={<DetailAnak />} />
        <Route path="/kader/laporan" element={<LaporanBulananKader />} />
      </Route>
```

Ganti jadi:

```jsx
      {/* Role: Kader Posyandu (NEW) */}
      <Route element={<RequireRole allow={['KADER_POSYANDU']} />}>
        <Route path="/kader/balita" element={<ModePosyandu />} />
        <Route path="/kader/balita/:id" element={<DetailAnak />} />
        <Route path="/kader/laporan" element={<LaporanBulananKader />} />
      </Route>
```

Route `/kader/beranda` dihilangkan dari block ini (akan di-handle via `legacyRedirects` di Task 8).

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: sukses.

- [ ] **Step 4: Commit**

```bash
git add src/routes/AppRoutes.jsx
git commit -m "refactor(routes): swap /kader/balita to ModePosyandu, drop BerandaKader and DaftarAnak"
```

---

## Task 8: Update `legacyRedirects` + `roleHome`

**Files:**
- Modify: `src/routes/legacyRedirects.js`
- Modify: `src/features/auth/roleHome.js`

- [ ] **Step 1: Tambah entry di legacyRedirects**

Open `src/routes/legacyRedirects.js`. Pastikan array `LEGACY_REDIRECTS` punya entry:

```js
  { from: '/kader-posyandu/dashboard', to: '/kader/balita' },
```

(entry lama sebelumnya: `/kader-posyandu/dashboard → /kader/beranda`). Ganti tujuan ke `/kader/balita`.

Tambahkan juga entry baru:

```js
  { from: '/kader/beranda', to: '/kader/balita' },
```

File final akan berisi kedua entry. Hasil akhir block LEGACY_REDIRECTS:

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
  { from: '/kader-posyandu/dashboard', to: '/kader/balita' },
  { from: '/kader/beranda', to: '/kader/balita' },
  { from: '/desa/dashboard', to: '/desa/beranda' },
  { from: '/desa/reminder', to: '/desa/acara' },
  { from: '/tenaga-kesehatan/dashboard', to: '/tenkes/forum' },
  { from: '/tenaga-kesehatan/detail/:id', to: '/tenkes/balita/:id' },
];
```

- [ ] **Step 2: Update roleHome**

Open `src/features/auth/roleHome.js`. Ganti:

```js
  KADER_POSYANDU: '/kader/beranda',
```

jadi:

```js
  KADER_POSYANDU: '/kader/balita',
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/legacyRedirects.js src/features/auth/roleHome.js
git commit -m "feat(routes): redirect /kader/beranda and /kader-posyandu/dashboard to /kader/balita"
```

---

## Task 9: Update tests

**Files:**
- Modify: `src/__tests__/features/auth/roleHome.test.js`
- Modify: `src/__tests__/routes/legacyRedirects.test.js`

- [ ] **Step 1: Update roleHome.test.js**

Open file. Cari baris:

```js
    expect(ROLE_HOME.KADER_POSYANDU).toEqual('/kader/beranda');
```

Ganti jadi:

```js
    expect(ROLE_HOME.KADER_POSYANDU).toEqual('/kader/balita');
```

- [ ] **Step 2: Update legacyRedirects.test.js**

Open file. Cari test `test('maps old role dashboards to new paths', ...)`. Ganti expectation:

```js
    expect(map['/kader-posyandu/dashboard']).toEqual('/kader/beranda');
```

jadi:

```js
    expect(map['/kader-posyandu/dashboard']).toEqual('/kader/balita');
```

Tambahkan test baru (setelah test existing "maps old role dashboards..."):

```js
  test('includes kader beranda shortcut redirect', () => {
    const entry = LEGACY_REDIRECTS.find((e) => e.from === '/kader/beranda');
    expect(entry).toBeDefined();
    expect(entry.to).toEqual('/kader/balita');
  });
```

- [ ] **Step 3: Run tests**

```bash
npm test -- --watchAll=false
```

Expected: 64/64 passing (63 existing + 1 new redirect test).

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/features/auth/roleHome.test.js src/__tests__/routes/legacyRedirects.test.js
git commit -m "test: update roleHome and legacyRedirects for kader route change"
```

---

## Task 10: Delete legacy `BerandaKader` dan `DaftarAnak`

**Files:**
- Delete: `src/features/kader/BerandaKader.jsx`
- Delete: `src/features/anak/DaftarAnak.jsx`

- [ ] **Step 1: Verify tidak ada consumer**

Run:

```bash
rg "BerandaKader" src
rg "DaftarAnak" src
```

Expected: zero matches (karena sudah di-unhook di Task 7).

Kalau ada match, jangan lanjut — fix dulu.

- [ ] **Step 2: Delete file**

```powershell
Remove-Item -LiteralPath "src/features/kader/BerandaKader.jsx" -Force
Remove-Item -LiteralPath "src/features/anak/DaftarAnak.jsx" -Force
```

- [ ] **Step 3: Build + tests**

```bash
npm run build
npm test -- --watchAll=false
```

Expected: sukses, 64/64 tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(cleanup): remove BerandaKader and DaftarAnak (replaced by ModePosyandu)"
```

---

## Task 11: Manual smoke test

**Files:**
- None (manual verification)

- [ ] **Step 1: Jalankan app**

```bash
npm start
```

- [ ] **Step 2: Test flow kader**

1. Logout dulu kalau ada session (atau clear localStorage)
2. Buka `/masuk`, login kader
3. Expected: redirect ke `/kader/balita`, render ModePosyandu dengan header pink + progress bar + search + filter chip + list balita
4. Verify header: "Halo, [nama]", "Posyandu [nama] · [bulan]"
5. Verify progress bar menunjukkan rasio `X/Y` sesuai data
6. Tap filter "Belum diukur" → list hanya balita yang belum diukur bulan ini
7. Tap filter "⚠️ Perhatian" → list hanya balita dengan status non-normal
8. Tap filter "Semua" → kembali ke semua balita
9. Ketik di search → list filter by nama
10. Tap "✏️ UKUR" pada balita belum diukur
    - Modal pengukuran terbuka
    - Tanggal default hari ini
    - BB/TB/LK/LILA prefill dari pengukuran terakhir balita tsb (verify di DevTools kalau perlu)
    - Catatan kosong
    - Tap Simpan → toast sukses → modal tutup → card auto refresh jadi ✅
11. Tap "Ulang" pada balita sudah diukur
    - Modal pengukuran terbuka dengan values bulan ini
    - Ubah BB sedikit → Simpan → toast "Data diperbarui"
12. Tap "Lihat riwayat" pada balita sudah diukur → navigate ke `/kader/balita/:id` existing
13. Tap tombol "📊 Laporan" di header → navigate ke `/kader/laporan` existing
14. Tap tombol "Keluar" di header → konfirmasi → logout → redirect ke `/masuk`

- [ ] **Step 3: Test backdated entry**

1. Login kader lagi
2. Tap "✏️ UKUR" pada salah satu balita
3. Di modal, tap DatePicker → pilih tanggal lampau (misal minggu lalu)
4. Isi/biarkan nilai → Simpan
5. Verify: pengukuran masuk dengan date = tanggal yang dipilih, bukan hari ini

- [ ] **Step 4: Test legacy redirect**

1. Di browser, ketik `/kader/beranda`
2. Expected: auto-redirect ke `/kader/balita`
3. Ketik `/kader-posyandu/dashboard`
4. Expected: auto-redirect ke `/kader/balita`

- [ ] **Step 5: Test session persist**

1. Tutup tab
2. Buka `http://localhost:3000/` atau `/kader/balita`
3. Expected: masih login, langsung render ModePosyandu

---

## Task 12: Docs update

**Files:**
- Modify: `docs/testing-checklist.md`
- Modify: `docs/superpowers/specs/2026-05-12-mode-posyandu-design.md`

- [ ] **Step 1: Tambah section di testing-checklist**

Open `docs/testing-checklist.md`, tambahkan section baru sebelum section "Post-Cleanup (Plan 5)":

```markdown
## Mode Posyandu (Plan 6)
- [ ] Login kader → langsung render `/kader/balita` sebagai ModePosyandu (bukan BerandaKader)
- [ ] Header pink menampilkan "Halo [nama]", nama posyandu, bulan berjalan
- [ ] Progress bar menunjukkan rasio `X/Y sudah diukur`
- [ ] Filter chip 3 state dengan count badge (Semua / Belum / Perhatian)
- [ ] Search berfungsi real-time
- [ ] Sort order: ⚠️ > ⚪ > ✅ (perlu perhatian di atas)
- [ ] Tap "✏️ UKUR" → form pengukuran dengan prefill dari pengukuran terakhir
- [ ] Tap "Ulang" pada balita sudah diukur → form edit dengan values bulan ini
- [ ] Tap "Lihat riwayat" → navigate ke `/kader/balita/:id`
- [ ] Simpan pengukuran → card auto update ke ✅ tanpa reload
- [ ] DatePicker di form menerima tanggal lampau untuk backdated entries
- [ ] Sticky footer "+ Tambah Balita Baru" selalu accessible
- [ ] Menu Laporan + Keluar di header berfungsi
- [ ] Legacy redirect `/kader/beranda` → `/kader/balita`
- [ ] Legacy redirect `/kader-posyandu/dashboard` → `/kader/balita`
```

- [ ] **Step 2: Update spec status**

Open `docs/superpowers/specs/2026-05-12-mode-posyandu-design.md`, ganti status:

```markdown
**Status:** Draft — menunggu review user
```

jadi:

```markdown
**Status:** DONE — Plan 6 implemented and merged.
```

- [ ] **Step 3: Commit**

```bash
git add docs/testing-checklist.md docs/superpowers/specs/2026-05-12-mode-posyandu-design.md
git commit -m "docs: add Mode Posyandu testing checklist and mark spec DONE"
```

---

## Task 13: Final verification

**Files:**
- None (summary check)

- [ ] **Step 1: Git log review**

```bash
git log --oneline feat/plan-6-mode-posyandu ^staging
```

Expected: ~12-15 commits, matching tasks above.

- [ ] **Step 2: Full test + build**

```bash
npm test -- --watchAll=false
npm run build
```

Expected: 64/64 tests pass, build sukses tanpa new warnings.

- [ ] **Step 3: No action commit, just verify**

Task 13 tidak commit apa pun — hanya verifikasi state siap merge.

---

## Plan 6 Acceptance Criteria

- ✅ Login kader → langsung di `/kader/balita` (ModePosyandu)
- ✅ Satu halaman dengan header + search + filter + list + sticky footer
- ✅ Icon state per balita: ⚠️ > ✅ > ⚪, sort by priority
- ✅ Filter chip 3 state dengan count badge
- ✅ Tombol "✏️ UKUR" langsung di card, skip halaman detail
- ✅ Smart default: PengukuranForm prefill dari pengukuran terakhir balita
- ✅ Simpan pengukuran → card auto-refresh ke ✅
- ✅ DatePicker terima tanggal lampau (backdated entries)
- ✅ Legacy redirect `/kader/beranda` + `/kader-posyandu/dashboard` → `/kader/balita`
- ✅ `ROLE_HOME.KADER_POSYANDU` updated ke `/kader/balita`
- ✅ `BerandaKader.jsx` + `DaftarAnak.jsx` dihapus
- ✅ 64/64 tests pass (63 existing + 1 new redirect test)
- ✅ Build sukses

---

## Risiko & Catatan

| Risiko | Mitigasi |
|---|---|
| Smart default tidak terasa di HP lama (25+ balita query paralel) | Sudah tested di `LaporanBulananKader` Plan 3, acceptable. Kalau lambat, tambah skeleton loading di BalitaCard |
| User bookmark `/kader/beranda` | Task 8 legacy redirect handles |
| Kader lupa ubah nilai prefill, input data salah | Angka slider besar menonjol, kader review sebelum Simpan (Plan 2 behavior tidak berubah) |
| Test legacyRedirects miss entry baru | Task 9 Step 2 tambah test explicit |
| `FormInputDataAnak` legacy masih dipakai, styling tidak konsisten | Out of scope — sudah didokumentasikan di spec Section 18 known gaps |

---

## Next

Plan 6 merged → manual test → merge staging → deploy.

Setelah itu, prioritas future plan:
- Master data anak edit UI (known gap)
- Forum rewrite (known gap)
- Admin CMS rewrite (known gap)
- Role lain (OT/Desa/Tenkes) simplify jika masih ada friction
