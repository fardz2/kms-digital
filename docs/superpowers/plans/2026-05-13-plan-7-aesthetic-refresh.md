# Plan 7 — Aesthetic Refresh (Tailwind Migration) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate semua komponen UI & halaman dari inline styles ke Tailwind dengan extended design tokens + font Plus Jakarta Sans/Inter + pattern visual refresh modern dalam palet brand existing.

**Architecture:** Extend `tailwind.config.js` dengan token lengkap. Hapus `tokens.css`. Migrate ~35 file scope (UI components → layout → feature pages). Antd components keep default styling internal, hanya wrapper Tailwind.

**Tech Stack:** React 18 (CRA), Tailwind CSS 3.3, @fontsource (self-host), tailwindcss-animate, Ant Design v4.

**Spec:** `docs/superpowers/specs/2026-05-13-aesthetic-refresh-design.md`.

**Backend dependencies:** NONE.

---

## File Scope

**Migrated (35 files):**
- `tailwind.config.js` — extended
- `src/index.js` + `src/global.css`
- `src/components/ui/` — 12 files
- `src/components/layout/AppShell.jsx`
- `src/features/` — ~19 files (auth, anak, pengukuran, kader, orangtua, tenkes, desa, laporan, artikel)

**Not touched (legacy, out of scope):**
- `src/pages/` — Post, MyPost, DetailForum, LandingPage, SignUp, NotFound, AdminDashboard/*
- `src/components/layout/Navbar/`, `Dashboard/Sidebar.jsx`
- `src/components/form/FormInput*`, `FormUpdateDataArtikel/`
- `src/features/anak/ChartWHO.jsx` — chart config inner tidak disentuh, hanya wrapper & tab button

**Deleted:**
- `src/theme/tokens.css` (tokens pindah ke tailwind config)

---

## Testing Strategy

- 64 tests existing wajib tetap pass setelah setiap task besar
- Build (`npm run build`) wajib pass per task
- Manual visual verify via `npm start` di tiap phase completion

---

## Task 1: Install deps

- [ ] **Step 1:**
```bash
npm install @fontsource/inter @fontsource/plus-jakarta-sans tailwindcss-animate
```

- [ ] **Step 2: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: install @fontsource fonts + tailwindcss-animate"
```

---

## Task 2: Extend tailwind.config.js

**Files:** `tailwind.config.js`

- [ ] **Step 1: Replace file**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:'#FFF5F5',100:'#FFE5E5',200:'#FFCCCC',300:'#FFB4B4',
          400:'#FF9999',500:'#FF7070',600:'#E54D4D',700:'#B32E2E',
          DEFAULT:'#FF9999',
        },
        accent: { DEFAULT:'#3B82F6', bg:'#EFF6FF' },
        neutral: {
          50:'#FCFAFA',100:'#F5F1F1',200:'#E8E2E2',300:'#D0C8C8',
          500:'#6B6464',700:'#3D3838',900:'#1F1C1C',
        },
        success: { DEFAULT:'#22C55E', bg:'#ECFDF5' },
        warning: { DEFAULT:'#FACC15', bg:'#FFFBEB' },
        danger:  { DEFAULT:'#EF4444', bg:'#FEF2F2' },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"','system-ui','sans-serif'],
        sans:    ['Inter','system-ui','sans-serif'],
      },
      fontSize: {
        'caption':  ['0.875rem',{lineHeight:'1.4',fontWeight:'500'}],
        'overline': ['0.75rem',{lineHeight:'1.2',letterSpacing:'0.08em',fontWeight:'600'}],
        'base':     ['1rem',{lineHeight:'1.6'}],
        'body-lg':  ['1.125rem',{lineHeight:'1.6'}],
        'h3':       ['1.25rem',{lineHeight:'1.4',letterSpacing:'-0.01em',fontWeight:'600'}],
        'h2':       ['1.5rem',{lineHeight:'1.3',letterSpacing:'-0.015em',fontWeight:'600'}],
        'h1':       ['2rem',{lineHeight:'1.2',letterSpacing:'-0.02em',fontWeight:'700'}],
        'display':  ['3rem',{lineHeight:'1.1',letterSpacing:'-0.025em',fontWeight:'700'}],
      },
      borderRadius: { 'button':'0.625rem', 'card':'1rem', 'hero':'3rem' },
      boxShadow: {
        'card':'0 4px 12px rgba(0,0,0,0.06)',
        'raised':'0 8px 24px rgba(255,153,153,0.18)',
        'hero':'0 12px 32px rgba(0,0,0,0.12)',
      },
      spacing: { 'tap':'3rem' },
      maxWidth: { 'reading':'65ch', 'dashboard-content':'calc(100% - 15rem)' },
      transitionTimingFunction: {
        'out-quart':'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-expo':'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: { '150':'150ms','250':'250ms','400':'400ms' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

- [ ] **Step 2: Build verify**
```bash
npm run build
```

- [ ] **Step 3: Commit**
```bash
git add tailwind.config.js
git commit -m "feat(tailwind): extend config with full design tokens"
```

---

## Task 3: Font imports + remove tokens.css

**Files:** `src/index.js`, `src/global.css`

- [ ] **Step 1: Replace `src/index.js`**

```js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";

import "antd/dist/antd.min.css";
import "./global.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 2: Replace `src/global.css`**

```css
html, body, #root { height: 100%; }

body {
  margin: 0;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #1F1C1C;
  background: #FCFAFA;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* { box-sizing: border-box; }

.ant-select, .ant-input, .ant-picker, .ant-modal, .ant-message {
  font-family: inherit;
}
```

- [ ] **Step 3: Delete tokens.css**
```powershell
Remove-Item -LiteralPath "src/theme/tokens.css" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "src/theme" -Force -ErrorAction SilentlyContinue
```

- [ ] **Step 4: Build + test**
```bash
npm run build
npm test -- --watchAll=false
```

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "chore: import fonts, set body defaults, delete tokens.css"
```

---

## Task 4: Migrate UI components (batch)

**Files:** `src/components/ui/{Button,Card,StatusBadge,StatCard,ProgressBar,StatusDistribution,MonthPicker,Toast,Modal,DataTable,PageHeader,NumberSlider}.jsx`

Pendekatan: sekali buka tiap file, ganti `style={{ ... }}` dengan `className="..."`. Keep logic & props sama.

Panduan konversi umum:
- `style={{ fontSize: 'var(--text-lg)' }}` → `className="text-body-lg"`
- `style={{ padding: 'var(--space-md)' }}` → `className="p-4"`
- `style={{ background: 'var(--color-primary)' }}` → `className="bg-primary"`
- `style={{ border: '1px solid var(--color-border)' }}` → `className="border border-neutral-200"`
- `style={{ borderRadius: 'var(--radius-card)' }}` → `className="rounded-card"`
- Hover/focus states: tambah `hover:`, `focus-visible:`, `active:` prefix
- Dynamic values (misal `style={{ width: pct + '%' }}`) — biarkan inline, dokumentasikan exception

### Task 4a: Button

```jsx
import React from 'react';

const VARIANTS = {
  primary: 'bg-primary hover:bg-primary-600 active:bg-primary-700 text-white font-display font-semibold shadow-sm hover:shadow-raised',
  secondary: 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold',
  ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700 font-medium',
  danger: 'bg-danger hover:bg-red-600 text-white font-display font-semibold shadow-sm',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm min-h-[2.25rem]',
  md: 'px-5 py-3 text-base min-h-tap',
  lg: 'px-6 py-4 text-body-lg min-h-[3.5rem]',
};

export default function Button({
  variant='primary', size='md', loading=false, disabled=false,
  icon=null, type='button', className='', onClick, children, ...rest
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-button transition-all duration-150 ease-out-quart active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100';
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading}
      className={`${base} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...rest}>
      {icon && !loading && <span aria-hidden="true">{icon}</span>}
      {loading ? 'Memuat...' : children}
    </button>
  );
}
```

### Task 4b: Card

```jsx
import React from 'react';

export default function Card({ title, footer, onClick, className='', children }) {
  const interactive = !!onClick;
  const base = 'bg-white border border-neutral-200 rounded-card shadow-card p-6 transition-all duration-200 ease-out-quart';
  const interactiveCls = interactive ? 'cursor-pointer hover:border-primary-200 hover:shadow-raised hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-primary-300' : '';
  return (
    <div onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); }
      } : undefined}
      className={`${base} ${interactiveCls} ${className}`}>
      {title && <div className="text-h3 font-display text-neutral-900 mb-4">{title}</div>}
      <div>{children}</div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
```

### Task 4c: StatusBadge

```jsx
import React from 'react';

const STYLES = {
  normal: 'bg-success-bg text-success',
  kurang: 'bg-warning-bg text-amber-800',
  stunting: 'bg-danger-bg text-danger',
  obesitas: 'bg-danger-bg text-danger',
  unknown: 'bg-neutral-100 text-neutral-500',
};
const LABELS = { normal:'Normal', kurang:'Kurang', stunting:'Stunting', obesitas:'Obesitas', unknown:'-' };

export default function StatusBadge({ status }) {
  const key = String(status || 'unknown').toLowerCase();
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${STYLES[key] ?? STYLES.unknown}`}>
      {LABELS[key] ?? LABELS.unknown}
    </span>
  );
}
```

### Task 4d: StatCard

```jsx
import React from 'react';

const ACCENT = {
  primary:'text-primary', success:'text-success', warning:'text-warning',
  danger:'text-danger', accent:'text-accent', neutral:'text-neutral-900',
};

export default function StatCard({ label, value, icon, accent='primary' }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-card shadow-card p-5 text-center">
      {icon && <div className="text-2xl mb-1" aria-hidden="true">{icon}</div>}
      <div className={`text-display font-display leading-none tabular-nums ${ACCENT[accent] ?? ACCENT.primary}`}>
        {value}
      </div>
      <div className="text-caption text-neutral-500 mt-1">{label}</div>
    </div>
  );
}
```

### Task 4e: ProgressBar

```jsx
import React from 'react';

export default function ProgressBar({ value=0, max=100, label, color='bg-primary' }) {
  const pct = Math.min(100, Math.max(0, (value / Math.max(max,1)) * 100));
  return (
    <div>
      {label && (
        <div className="flex justify-between text-caption text-neutral-700 mb-2">
          <span>{label}</span>
          <span className="tabular-nums">{value}/{max} ({pct.toFixed(0)}%)</span>
        </div>
      )}
      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-[width] duration-400 ease-out-quart`}
          style={{ width: `${pct}%` }}
          role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} />
      </div>
    </div>
  );
}
```

### Task 4f: StatusDistribution

```jsx
import React from 'react';
import ProgressBar from './ProgressBar';

const CONFIG = [
  { key:'normal', label:'Normal', color:'bg-success' },
  { key:'kurang', label:'Kurang', color:'bg-warning' },
  { key:'stunting', label:'Stunting', color:'bg-danger' },
  { key:'obesitas', label:'Obesitas', color:'bg-danger' },
];

export default function StatusDistribution({ distribusi, total }) {
  const t = total && total > 0 ? total : 1;
  return (
    <div className="flex flex-col gap-3">
      {CONFIG.map(c => (
        <ProgressBar key={c.key} value={distribusi?.[c.key] ?? 0} max={t} label={c.label} color={c.color} />
      ))}
    </div>
  );
}
```

### Task 4g: MonthPicker, Toast, Modal, DataTable, PageHeader, NumberSlider

Pattern sama: buka file, replace `style={{}}` dengan Tailwind class. Full contoh untuk PageHeader, NumberSlider, Modal, Toast sudah di spec Section 8.3, 8.6, dokumentasi. Ikuti spec.

**NumberSlider** — gunakan pattern dari spec 8.6 yang sudah include arbitrary value Tailwind selector untuk slider thumb.

- [ ] **Step 1: Migrate tiap file** (Task 4a-4g), test build setelah tiap 3-4 file

- [ ] **Step 2: Build + test akhir batch**
```bash
npm run build
npm test -- --watchAll=false
```

- [ ] **Step 3: Commit batch**
```bash
git add src/components/ui/
git commit -m "refactor(ui): migrate all 12 UI components to Tailwind className"
```

---

## Task 5: Migrate AppShell

**Files:** `src/components/layout/AppShell.jsx`

- [ ] **Step 1: Replace**

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useSession } from '../../features/auth/useSession';

export default function AppShell({ children, menu=[], activeKey }) {
  const navigate = useNavigate();
  const { user, logout } = useSession();
  const handleLogout = () => {
    if (window.confirm('Keluar dari akun?')) {
      logout();
      navigate('/masuk', { replace: true });
    }
  };
  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 px-4 md:px-6 py-3 flex items-center gap-4 flex-wrap">
        <div className="font-display font-bold text-h3 text-neutral-900">KMS Digital</div>
        <div className="flex gap-2 flex-1 flex-wrap">
          {menu.map(item => (
            <Button key={item.key}
              variant={activeKey === item.key ? 'primary' : 'ghost'}
              size="sm" onClick={() => navigate(item.path)}>
              {item.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {user?.name && <span className="text-caption text-neutral-500 hidden md:inline">{user.name}</span>}
          <Button variant="secondary" size="sm" onClick={handleLogout}>Keluar</Button>
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
git commit -m "refactor(layout): migrate AppShell to Tailwind"
```

---

## Task 6: Migrate auth (LoginPortal + LoginForm)

**Files:** `src/features/auth/LoginPortal.jsx`, `LoginForm.jsx`

- [ ] **Step 1:** Replace LoginForm sesuai pattern di spec Section 8 (wrap tailwind di sekitar antd Form + Input)

- [ ] **Step 2:** Replace LoginPortal return block. Keep semua hook + handler + ROLES + ROLE_HOME. Ganti outer wrapper div + card rendering ke className pattern:

```jsx
  return (
    <>
      {toast.contextHolder}
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <h1 className="text-h1 font-display text-neutral-900 text-center mb-6">
            KMS Digital Lebakwangi
          </h1>
          {expired && (
            <div role="alert" className="bg-warning-bg text-amber-900 px-4 py-3 rounded-button mb-4 text-center">
              Sesi Anda berakhir, silakan masuk kembali.
            </div>
          )}
          {!selectedRole ? (
            <Card>
              <h2 className="text-h3 font-display text-neutral-900 mb-4">Masuk sebagai:</h2>
              <div className="flex flex-col gap-2">
                {ROLES.map(r => (
                  <Button key={r.key} variant="secondary" size="lg"
                    onClick={() => setSelectedRole(r.key)}
                    className="justify-start w-full">
                    <span className="mr-2">{r.icon}</span>{r.label}
                  </Button>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)} className="mb-4">
                ← Kembali
              </Button>
              <LoginForm role={selectedRole} onSubmit={handleLogin}
                loading={loginMutation.isPending} errorText={errorText} />
            </Card>
          )}
        </div>
      </div>
    </>
  );
```

- [ ] **Step 3: Build + commit**
```bash
npm run build
git add src/features/auth/
git commit -m "refactor(auth): migrate LoginPortal and LoginForm to Tailwind"
```

---

## Task 7: Migrate kader (ModePosyandu + PosyanduHeader + BalitaCard + FilterChip + ApproveModal)

**Files:** `src/features/kader/*.jsx`

- [ ] **Step 1: Replace PosyanduHeader** — pattern di spec Section 5.2 (decorative blur circles, display count)

- [ ] **Step 2: Replace FilterChip** — pill style pattern (pattern di spec Section 8.7)

- [ ] **Step 3: Replace BalitaCard** — status-aware border, 3-column flex (pattern di spec Section 5.1)

- [ ] **Step 4: Replace ModePosyandu** return block — keep semua hook/state. Ganti wrapper div:

```jsx
  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      <PosyanduHeader {...headerProps} />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="space-y-3">
          <div className="relative">
            <input type="search" value={search} onChange={(e)=>setSearch(e.target.value)}
              placeholder="Cari nama balita..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-button text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors" />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden>🔍</span>
          </div>
          <FilterChip value={filter} onChange={setFilter} counts={counts} />
        </div>
        {isLoading && <div className="text-neutral-500">Memuat data balita...</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            {balitaWithMeta.length === 0 ? 'Belum ada data balita. Tambah balita baru di tombol bawah.' : 'Tidak ada balita yang cocok dengan filter.'}
          </div>
        )}
        <div className="flex flex-col gap-2">
          {filtered.map(({ anak, meta }, i) => (
            <div key={anak.id} className="animate-in fade-in slide-in-from-bottom-1 duration-250"
              style={{ animationDelay: `${i*30}ms`, animationFillMode:'backwards' }}>
              <BalitaCard anak={anak} meta={meta}
                onUkur={(a)=>handleUkur(a, meta.latest)}
                onUlang={handleUlang} onLihat={handleLihat} />
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-neutral-200 p-4 z-20">
        <div className="max-w-3xl mx-auto">
          <Button variant="primary" size="lg" onClick={()=>setTambahOpen(true)} className="w-full">
            + Tambah Balita Baru
          </Button>
        </div>
      </div>
      <PengukuranForm {...formProps} />
      <FormInputDataAnak isOpen={tambahOpen} onCancel={()=>setTambahOpen(false)} />
      <ApproveModal open={approveOpen} onClose={()=>setApproveOpen(false)} />
    </div>
  );
```

Update BalitaCard prop signature di step 3: `<BalitaCard anak={anak} meta={meta} ...>` (receive meta directly, bukan pengukuranList+currentBulan). Kalau existing BalitaCard masih classify internal, bisa keep atau extract — plan mengacu ke extract di Plan 6 Task 7 review fix.

- [ ] **Step 5: Replace ApproveModal** — ganti `style={{}}` dengan Tailwind class. Card untuk OT/anak pakai `<Card>` existing. Action buttons pakai `<Button>` existing.

- [ ] **Step 6: Build + test + commit**
```bash
npm run build
npm test -- --watchAll=false
git add src/features/kader/
git commit -m "refactor(kader): migrate all kader pages to Tailwind"
```

---

## Task 8: Migrate anak + pengukuran

**Files:** `src/features/anak/{DetailAnak,RiwayatCard,ChartWHO}.jsx`, `src/features/pengukuran/{PengukuranForm,CatatanField}.jsx`

- [ ] **Step 1: RiwayatCard** — pattern sama dengan BalitaCard (status-aware border)

- [ ] **Step 2: DetailAnak** — wrapper: `<div className="min-h-screen bg-neutral-50">`, content: `<div className="max-w-reading mx-auto px-4 py-6 space-y-6">`. Section header: `<h2 className="text-h2 font-display text-neutral-900 mb-4">`. Back button: `<Button variant="ghost" size="sm">← Kembali</Button>`.

- [ ] **Step 3: ChartWHO** — tab container: `className="flex gap-2 mb-4 flex-wrap"`, chart wrapper: `className="w-full min-h-[500px] p-4 bg-white border border-neutral-200 rounded-card"`. Chart config inner JANGAN diubah.

- [ ] **Step 4: CatatanField**

```jsx
import React from 'react';

export default function CatatanField({ value='', onChange, placeholder }) {
  return (
    <div className="py-4">
      <label className="text-overline text-neutral-600 mb-2 block">
        📝 Catatan <span className="font-normal text-neutral-500 normal-case tracking-normal">(opsional)</span>
      </label>
      <textarea value={value} onChange={(e)=>onChange?.(e.target.value)}
        placeholder={placeholder ?? 'Contoh: anak sedang sakit, baru sembuh demam...'}
        rows={3} maxLength={500}
        className="w-full px-4 py-3 text-base rounded-button border border-neutral-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 focus:outline-none resize-y font-sans" />
      <div className="text-caption text-neutral-400 text-right mt-1 tabular-nums">
        {value.length}/500
      </div>
    </div>
  );
}
```

- [ ] **Step 5: PengukuranForm** — ganti inline style wrapper. Label field pakai overline. Status preview block:

```jsx
<div className="p-4 bg-primary-50 rounded-card flex items-center gap-3">
  <span className="text-body-lg font-display font-semibold">Status Gizi:</span>
  <StatusBadge status={status} />
</div>
```

Footer buttons: `<div className="flex gap-2 justify-end">`.

DatePicker wrapper:
```jsx
<div>
  <label className="text-overline text-neutral-600 mb-2 block">📅 Tanggal Pengukuran</label>
  <DatePicker value={tanggal} onChange={(v)=>v && setTanggal(v)} allowClear={false}
    format="DD MMMM YYYY" className="w-full h-12 text-base" />
  {umurBulan != null && (
    <p className="text-caption text-neutral-500 mt-1">Umur saat diukur: {umurBulan} bulan</p>
  )}
</div>
```

- [ ] **Step 6: Build + test + commit**
```bash
npm run build
npm test -- --watchAll=false
git add src/features/anak/ src/features/pengukuran/
git commit -m "refactor(anak,pengukuran): migrate to Tailwind"
```

---

## Task 9: Migrate orangtua + tenkes + desa + laporan + artikel

**Files:** `src/features/{orangtua,tenkes,desa,laporan,artikel}/*.jsx`

Pattern konsisten di semua file:

1. Outer wrapper: `className="min-h-screen bg-neutral-50"`
2. AppShell wrap beranda role (sudah migrate)
3. Content container: `className="px-4 py-6 max-w-3xl mx-auto space-y-6"` (default), `max-w-5xl` untuk Laporan, `max-w-reading` untuk ArtikelDetail
4. Section heading: `className="text-h2 font-display text-neutral-900 mb-4"` atau overline `className="text-overline text-neutral-600 mb-3"`
5. Button pakai `<Button>` component
6. Card pakai `<Card>` component
7. Feature link cards (BerandaOT, BerandaTenkes) — gradient card pattern:
```jsx
<Card onClick={() => navigate('/orangtua/forum')}
  className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
  <div className="text-display mb-2" aria-hidden>💬</div>
  <div className="text-h3 font-display text-neutral-900">Forum Tanya Jawab</div>
  <div className="text-caption text-neutral-600 mt-1">Tanya tenaga kesehatan</div>
</Card>
```

- [ ] **Step 1: BerandaOT** — card list anak + link cards
- [ ] **Step 2: BerandaTenkes** — quick link cards
- [ ] **Step 3: BerandaDesa** — Button wrapper + heading
- [ ] **Step 4: KelolaAcara** — form wrapper + list item
- [ ] **Step 5: LaporanBulananKader** — grid `md:grid-cols-3` untuk StatCard
- [ ] **Step 6: LaporanDesa** — grid cols-2 untuk Distribusi
- [ ] **Step 7: LaporanAdmin** — informational card
- [ ] **Step 8: ArtikelList** — list card items
- [ ] **Step 9: ArtikelDetailPage** — reading zone: `<div className="text-base leading-relaxed text-neutral-700 max-w-reading">` wrap untuk content HTML

- [ ] **Step 10: Build + test + commit**
```bash
npm run build
npm test -- --watchAll=false
git add src/features/orangtua/ src/features/tenkes/ src/features/desa/ src/features/laporan/ src/features/artikel/
git commit -m "refactor(features): migrate all remaining feature pages to Tailwind"
```

---

## Task 10: Verification sweep

- [ ] **Step 1: Audit zero inline styles in scope**

```bash
rg "style={{" src/components/ui/ src/components/layout/AppShell.jsx src/features/
```

Expected: near-zero matches. Acceptable exceptions:
- `style={{ width: `${pct}%` }}` untuk progress bar dynamic value
- `style={{ animationDelay: ... }}` untuk stagger animation
- Font-family inline pada Toast/Modal antd wrapper

Kalau ada residual lain, fix file tsb, commit `refactor(<area>): remove residual inline styles`.

- [ ] **Step 2: Audit tokens.css gone**

```bash
Test-Path "src/theme/tokens.css"
```
Expected: `False`.

```bash
rg "var\(--text-|var\(--space-|var\(--radius-|var\(--shadow-" src/components/ui/ src/features/ src/components/layout/AppShell.jsx
```
Expected: zero matches.

- [ ] **Step 3: Final build + test**

```bash
npm run build
npm test -- --watchAll=false
```

Expected: 64/64 tests pass, build success, bundle ≤ 700 kB.

- [ ] **Step 4: Commit (kalau ada fix residual)**

---

## Task 11: Docs update

**Files:** `docs/testing-checklist.md`, `docs/superpowers/specs/2026-05-13-aesthetic-refresh-design.md`

- [ ] **Step 1: Tambah section testing-checklist**

```markdown
## Aesthetic Refresh (Plan 7)
- [ ] Font Plus Jakarta Sans muncul di heading
- [ ] Font Inter muncul di body
- [ ] Brand pink tidak berubah, tetap dominan
- [ ] Neutral gray tinted hangat (warm, bukan cool)
- [ ] BalitaCard border color per status (merah/hijau/netral)
- [ ] Button hover lift dengan pink shadow glow
- [ ] Slider track gradient pink, thumb bulat 28px bertactile
- [ ] PosyanduHeader decorative blur circles visible
- [ ] FilterChip pill rounded-full dengan count badge
- [ ] StatusBadge soft pill style
- [ ] Zero inline style di file scope
- [ ] Lighthouse A11y ≥ 95 di 3 page sample
```

- [ ] **Step 2: Update spec status**

```markdown
**Status:** DONE — Plan 7 implemented and merged.
```

- [ ] **Step 3: Commit**

```bash
git add docs/testing-checklist.md docs/superpowers/specs/2026-05-13-aesthetic-refresh-design.md
git commit -m "docs: add Plan 7 testing checklist and mark spec DONE"
```

---

## Task 12: Final verification

- [ ] **Step 1: Git log review**

```bash
git log --oneline feat/plan-7-aesthetic-refresh ^staging
```

Expected: ~12-15 commits (setiap task → 1-3 commits).

- [ ] **Step 2: Manual visual QA**

`npm start`. Login 5 role. Verify:
- Typography new font di semua halaman scope
- Pink brand tetap dominan
- Card hover lift + shadow pink
- Slider pengukuran tactile
- Legacy pages (Post, Admin CMS) tetap render (tidak ada regresi styling)

- [ ] **Step 3: Lighthouse audit**

Chrome DevTools Lighthouse di 3 page:
- `/kader/balita` (ModePosyandu)
- `/orangtua/balita/:id` (DetailAnak)
- `/kader/laporan` (LaporanBulananKader)

Target:
- Performance ≥ 85 (@fontsource loading acceptable overhead)
- Accessibility ≥ 95
- Best Practices ≥ 90

Task 12 tidak commit apa pun.

---

## Plan 7 Acceptance

- ✅ `tailwind.config.js` extended dengan full token
- ✅ `@fontsource/inter` + `@fontsource/plus-jakarta-sans` loaded
- ✅ `tokens.css` deleted
- ✅ Zero `style={{}}` di scope files (kecuali exception documented)
- ✅ 64 tests pass
- ✅ Build success, bundle ≤ 700 kB gzipped
- ✅ Visual QA manual pass untuk 5 role
- ✅ Legacy pages tidak regresi

---

## Risiko & Catatan

| Risiko | Mitigasi |
|---|---|
| Tailwind arbitrary value selector (slider thumb) build fail | Tailwind 3.3 support. Build check di Task 4g |
| Font FOUT saat pertama load | @fontsource default `font-display: swap`. Acceptable |
| Bundle overshoot | @fontsource subset + Tailwind purge via `content` glob |
| BalitaCard prop signature change (meta vs pengukuranList) | Plan 6 Task 7 review fix sudah extract classifyBalita. Task 7 Step 3 assume existing BalitaCard sudah terima meta prop. Kalau masih legacy, refactor di Step 3 |
| Task 4g PageHeader + NumberSlider referensi ke spec section 5.2/8.6 | Plan ini ringkas; implementer baca spec untuk full pattern |

---

## Next

Setelah Plan 7 merged → manual visual review user → deploy.

Optional future:
- Phase E legacy pages refresh (Post, MyPost, Admin CMS)
- Dark mode via `dark:` variants
- lucide-react icons replace emoji
