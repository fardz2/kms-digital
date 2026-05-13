# Admin Area Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Admin area — tambah landing dashboard baru (`/admin/dashboard`), improve 5 CMS pages dengan inline stats + search di header + accent line, split ArtikelAdmin jadi list+form, enhance sidebar dengan Dashboard entry + collapse toggle.

**Architecture:** 3 komponen reusable baru (`InlineStatBar`, `ActivityItem`, `EmptyState`), extend `StatCard` + `PageHeader`, 4 file admin baru di `features/admin/`, 2 file split artikel. Data flow: `useQueries` parallel ke 6 list endpoints existing (no backend changes), staleTime 2 menit, merge activity 10 latest dari semua entity.

**Tech Stack:** React 18, `@tanstack/react-query@^5`, `@tanstack/react-table@^8`, lucide-react, Tailwind 21n tokens, antd (Form/Modal/message only), moment.

**Reference spec:** `docs/superpowers/specs/2026-05-13-admin-redesign-design.md`

---

## File Structure

**New files:**
```
src/components/ui/
├── InlineStatBar.jsx           — horizontal stats row
├── ActivityItem.jsx            — activity feed row
└── EmptyState.jsx              — centered empty state

src/features/admin/
├── AdminDashboard.jsx          — landing page orchestrator
├── AdminStatsGrid.jsx          — 6-card stats grid
├── AdminActivityFeed.jsx       — merged activity stream
├── AdminQuickLinks.jsx         — 5 CMS shortcuts + laporan soft-disabled
└── useAdminDashboardData.js    — useQueries parallel + merge

src/api/
├── kader.api.js                — extract from page-inline fetches
├── nakes.api.js                — extract
└── ortu.api.js                 — alias of orangTuaApi.list for consistency

src/hook/
└── useSidebarCollapsed.js      — collapse state + localStorage

src/pages/AdminDashboard/
├── ArtikelList.jsx             — split (list view)
└── ArtikelForm.jsx             — split (create view)

src/utilities/
└── isThisMonth.js              — helper for stats filter
```

**Modified files:**
```
src/components/ui/StatCard.jsx
src/components/ui/PageHeader.jsx
src/components/layout/Dashboard/Sidebar.jsx
src/components/layout/Dashboard/DashboardLayout.jsx
src/components/layout/Dashboard/sidebarLinks.js
src/routes/AppRoutes.jsx
src/hook/useAuth.js
src/features/auth/roleHome.js
src/queries/keys.js
src/pages/AdminDashboard/InputDesa.js
src/pages/AdminDashboard/InputPosyandu.js
src/pages/AdminDashboard/RegisterKaderPosyandu.js
src/pages/AdminDashboard/RegisterTenagaKesehatan.js
src/features/laporan/LaporanAdmin.jsx
```

**Deleted:**
```
src/pages/AdminDashboard/ArtikelAdmin.js
```

---

## Task 1: Utility isThisMonth

**Files:**
- Create: `src/utilities/isThisMonth.js`

- [ ] **Step 1: Create helper**

Create `src/utilities/isThisMonth.js`:

```js
import moment from 'moment';

export function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = moment(dateStr);
  if (!d.isValid()) return false;
  const now = moment();
  return d.year() === now.year() && d.month() === now.month();
}

export function isWithinDays(dateStr, days) {
  if (!dateStr) return false;
  const d = moment(dateStr);
  if (!d.isValid()) return false;
  return moment().diff(d, 'days') <= days;
}
```

- [ ] **Step 2: Commit**

Run:
```
git add src/utilities/isThisMonth.js
git commit -m "feat(util): add isThisMonth and isWithinDays helpers"
```

---

## Task 2: EmptyState component

**Files:**
- Create: `src/components/ui/EmptyState.jsx`

- [ ] **Step 1: Create component**

Create `src/components/ui/EmptyState.jsx`:

```jsx
import React from 'react';

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center text-center py-[50px] px-[25px] `+ className}>
      {icon && (
        <div className="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-primary-50 text-primary-200 mb-[17px]">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-heading-sm font-bold text-deep-slate mb-[8px]">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-body-sm text-graphite max-w-[400px] leading-relaxed mb-[21px]">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```
git add src/components/ui/EmptyState.jsx
git commit -m "feat(ui): add EmptyState component"
```

---

## Task 3: InlineStatBar component

**Files:**
- Create: `src/components/ui/InlineStatBar.jsx`

- [ ] **Step 1: Create component**

Create `src/components/ui/InlineStatBar.jsx`:

```jsx
import React from 'react';

const ACCENT = {
  primary: 'text-primary-600',
  success: 'text-success',
  warning: 'text-warning',
  danger:  'text-danger',
  neutral: 'text-deep-slate',
};

function StatItem({ label, value, accent = 'neutral', loading }) {
  const colorClass = ACCENT[accent] ?? ACCENT.neutral;
  return (
    <div className="flex flex-col">
      <span className="text-caption font-bold uppercase tracking-[0.12em] text-graphite mb-[6px]">
        {label}
      </span>
      {loading ? (
        <span className="inline-block w-16 h-8 bg-polar-mist animate-pulse rounded-default" />
      ) : (
        <span className={`text-heading-lg font-bold tabular-nums leading-none ` + colorClass}>
          {value}
        </span>
      )}
    </div>
  );
}

export default function InlineStatBar({ items = [], loading = false, className = '' }) {
  if (!items.length) return null;
  return (
    <div className={`flex flex-wrap items-start gap-x-[33px] gap-y-[17px] ` + className}>
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          {idx > 0 && (
            <div aria-hidden className="hidden md:block w-[1px] h-[40px] bg-light-ash self-center" />
          )}
          <StatItem
            label={item.label}
            value={item.value}
            accent={item.accent}
            loading={loading}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```
git add src/components/ui/InlineStatBar.jsx
git commit -m "feat(ui): add InlineStatBar with divider + loading skeleton"
```

---

## Task 4: ActivityItem component

**Files:**
- Create: `src/components/ui/ActivityItem.jsx`

- [ ] **Step 1: Create component**

Create `src/components/ui/ActivityItem.jsx`:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import moment from 'moment';

const ACCENT_BG = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-deep-slate',
  danger:  'bg-danger/10 text-danger',
  neutral: 'bg-polar-mist text-graphite',
};

function formatRelative(timestamp) {
  if (!timestamp) return '';
  const m = moment(timestamp);
  if (!m.isValid()) return '';
  return m.fromNow();
}

export default function ActivityItem({
  icon,
  iconAccent = 'primary',
  title,
  subtitle,
  timestamp,
  href,
}) {
  const bg = ACCENT_BG[iconAccent] ?? ACCENT_BG.primary;
  const Wrapper = href ? Link : 'div';
  const wrapperProps = href ? { to: href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`flex items-center gap-[17px] px-[17px] py-[13px] rounded-default transition-colors duration-150 ` + (href ? 'hover:bg-primary-50/40 cursor-pointer' : '')}
    >
      {icon && (
        <span className={`flex items-center justify-center w-[40px] h-[40px] rounded-full shrink-0 ` + bg}>
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold text-deep-slate truncate">{title}</p>
        {subtitle && (
          <p className="text-caption text-graphite truncate mt-[2px]">{subtitle}</p>
        )}
      </div>
      {timestamp && (
        <span className="text-caption text-graphite tabular-nums shrink-0 hidden sm:inline">
          {formatRelative(timestamp)}
        </span>
      )}
      {href && (
        <ChevronRight
          size={16}
          strokeWidth={1.75}
          className="text-graphite shrink-0 hidden sm:inline"
        />
      )}
    </Wrapper>
  );
}
```

- [ ] **Step 2: Commit**

```
git add src/components/ui/ActivityItem.jsx
git commit -m "feat(ui): add ActivityItem with relative timestamp"
```

---

## Task 5: Extend StatCard (trend, href, loading)

**Files:**
- Modify: `src/components/ui/StatCard.jsx`

- [ ] **Step 1: Rewrite StatCard**

Replace contents of `src/components/ui/StatCard.jsx`:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';

const ACCENT = {
  primary: 'text-primary-600',
  success: 'text-success',
  warning: 'text-warning',
  danger:  'text-danger',
  accent:  'text-accent',
  neutral: 'text-deep-slate',
};

const ICON_BG = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-deep-slate',
  danger:  'bg-danger/10 text-danger',
  accent:  'bg-accent-bg text-accent',
  neutral: 'bg-polar-mist text-graphite',
};

function TrendIcon({ type }) {
  if (type === 'up') return <TrendingUp size={14} strokeWidth={2.25} className="text-success" />;
  if (type === 'down') return <TrendingDown size={14} strokeWidth={2.25} className="text-danger" />;
  return <Minus size={14} strokeWidth={2.25} className="text-graphite" />;
}

export default function StatCard({
  label,
  value,
  icon,
  accent = 'primary',
  trend,
  href,
  loading = false,
}) {
  const color = ACCENT[accent] ?? ACCENT.primary;
  const iconBg = ICON_BG[accent] ?? ICON_BG.primary;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-[13px]">
        {icon && (
          <span className={`flex items-center justify-center w-[44px] h-[44px] rounded-full ` + iconBg}>
            {icon}
          </span>
        )}
        {href && (
          <ChevronRight
            size={16}
            strokeWidth={2}
            className="text-graphite opacity-0 group-hover:opacity-100 transition-opacity mt-[14px]"
          />
        )}
      </div>
      <div className="mt-[17px]">
        {loading ? (
          <span className="inline-block w-20 h-9 bg-polar-mist animate-pulse rounded-default" />
        ) : (
          <div className={`text-heading-lg font-bold leading-none tabular-nums ` + color}>
            {value ?? '—'}
          </div>
        )}
        <div className="text-caption font-bold text-graphite uppercase tracking-[0.1em] mt-[8px]">
          {label}
        </div>
        {trend && !loading && (
          <div className="flex items-center gap-[6px] mt-[10px] text-caption text-graphite">
            <TrendIcon type={trend.type} />
            <span className="font-semibold text-deep-slate">{trend.value}</span>
            <span>{trend.label}</span>
          </div>
        )}
      </div>
    </>
  );

  const classes = `group bg-white border border-light-ash rounded-default p-[21px] shadow-card transition-all duration-150 ease-out-quart `;

  if (href) {
    return (
      <Link
        to={href}
        className={classes + `hover:border-primary-300 hover:shadow-raised hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={classes}>{inner}</div>;
}
```

- [ ] **Step 2: Commit**

```
git add src/components/ui/StatCard.jsx
git commit -m "feat(StatCard): add trend + href clickable + loading skeleton"
```

---

## Task 6: Extend PageHeader (search slot, stats slot)

**Files:**
- Modify: `src/components/ui/PageHeader.jsx`

- [ ] **Step 1: Rewrite PageHeader**

Replace contents of `src/components/ui/PageHeader.jsx`:

```jsx
import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
  search,
  stats,
  children,
}) {
  const topLine = eyebrow ?? subtitle;
  const showSubtitleBelow = Boolean(eyebrow && subtitle);

  return (
    <header className="bg-white border-b border-light-ash">
      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] md:py-[50px]">
        <div className="flex items-start justify-between gap-[17px] flex-wrap">
          <div className="min-w-0 flex-1">
            {topLine && (
              <p className="text-caption font-bold uppercase tracking-[0.14em] text-primary-600 mb-[13px]">
                {topLine}
              </p>
            )}
            {title && (
              <h1 className="text-display font-bold text-deep-slate leading-[1.05] tracking-tight">
                {title}
              </h1>
            )}
            {showSubtitleBelow && (
              <p className="text-body-lg text-graphite mt-[13px] max-w-[640px]">
                {subtitle}
              </p>
            )}
          </div>
          {(search || action) && (
            <div className="flex items-center gap-[13px] shrink-0 flex-wrap">
              {search && <div className="w-full md:w-auto">{search}</div>}
              {action}
            </div>
          )}
        </div>
        {stats && (
          <div className="mt-[25px] pt-[21px] border-t border-light-ash">
            {stats}
          </div>
        )}
        {children && <div className="mt-[17px]">{children}</div>}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Build verify**

Run:
```
npm run build
```

Expected: Compiled. Existing PageHeader consumers (BerandaOT, BerandaTenkes, BerandaDesa, LaporanAdmin, LaporanBulananKader, ArtikelList) tetap jalan karena `search` dan `stats` optional.

- [ ] **Step 3: Commit**

```
git add src/components/ui/PageHeader.jsx
git commit -m "feat(PageHeader): add search + stats slots"
```

---

## Task 7: API modules for dashboard entities

**Files:**
- Create: `src/api/kader.api.js`
- Create: `src/api/nakes.api.js`
- Create: `src/api/ortu.api.js`
- Create: `src/api/artikel.api.js` (if not exists — check first)
- Create: `src/api/desa.api.js` (if not exists — check first)
- Create: `src/api/posyandu.api.js` (if not exists — check first)
- Modify: `src/queries/keys.js`

- [ ] **Step 1: Check which api modules already exist**

Run:
```
Get-ChildItem src\api\*.api.js -Name
```

If `kader.api.js`, `nakes.api.js`, `ortu.api.js`, `artikel.api.js`, `desa.api.js`, `posyandu.api.js` already exist, check content and only add missing methods.

- [ ] **Step 2: Create kader.api.js**

Create `src/api/kader.api.js`:

```js
import { api } from './client';

export const kaderApi = {
  list: () => api.get('/api/posyandu/kader-posyandu'),
};
```

- [ ] **Step 3: Create nakes.api.js**

Create `src/api/nakes.api.js`:

```js
import { api } from './client';

export const nakesApi = {
  list: () => api.get('/api/posyandu/tenaga-kesehatan'),
};
```

- [ ] **Step 4: Create ortu.api.js**

Create `src/api/ortu.api.js`:

```js
import { api } from './client';

export const ortuApi = {
  list: () => api.get(`/api/posyandu/orang-tua/list?_=` + Date.now()),
};
```

- [ ] **Step 5: Create desa.api.js (if not exists)**

Create `src/api/desa.api.js`:

```js
import { api } from './client';

export const desaApi = {
  list: () => api.get('/api/desa'),
  create: (payload) => api.post('/api/desa', payload),
  remove: (id) => api.delete(`/api/desa/` + id),
};
```

- [ ] **Step 6: Create posyandu.api.js (if not exists)**

Create `src/api/posyandu.api.js`:

```js
import { api } from './client';

export const posyanduApi = {
  list: () => api.get('/api/posyandu'),
  create: (payload) => api.post('/api/posyandu', payload),
  update: (id, payload) => api.put(`/api/posyandu/` + id, payload),
  remove: (id) => api.delete(`/api/posyandu/` + id),
};
```

- [ ] **Step 7: Create artikel.api.js (if not exists)**

Create `src/api/artikel.api.js`:

```js
import { api } from './client';

export const artikelApi = {
  list: () => api.get('/api/artikel'),
  remove: (id) => api.delete(`/api/artikel/` + id),
};
```

- [ ] **Step 8: Add admin query keys to keys.js**

Modify `src/queries/keys.js` — add to `qk` object:

```js
admin: {
  list: (entity) => ['admin', 'list', entity],
  stats: () => ['admin', 'stats'],
  activity: () => ['admin', 'activity'],
},
```

- [ ] **Step 9: Build verify**

Run: `npm run build`
Expected: Compiled, no errors.

- [ ] **Step 10: Commit**

```
git add src/api/*.api.js src/queries/keys.js
git commit -m "feat(api): add kader/nakes/ortu/desa/posyandu/artikel api modules for admin dashboard"
```

---

## Task 8: useAdminDashboardData hook

**Files:**
- Create: `src/features/admin/useAdminDashboardData.js`

- [ ] **Step 1: Create hook**

Create `src/features/admin/useAdminDashboardData.js`:

```js
import { useQueries } from '@tanstack/react-query';
import moment from 'moment';
import { desaApi } from '../../api/desa.api';
import { posyanduApi } from '../../api/posyandu.api';
import { kaderApi } from '../../api/kader.api';
import { nakesApi } from '../../api/nakes.api';
import { ortuApi } from '../../api/ortu.api';
import { artikelApi } from '../../api/artikel.api';
import { qk } from '../../queries/keys';

const STALE = 2 * 60 * 1000;

function activityFromDesa(items = []) {
  return items.map((d) => ({
    id: `desa-` + d.id,
    type: 'desa',
    title: `Desa '` + (d.name ?? d.nama) + `' ditambahkan`,
    subtitle: null,
    timestamp: d.created_at,
    href: '/admin/dashboard/desa',
  }));
}
function activityFromPosyandu(items = []) {
  return items.map((p) => ({
    id: `posyandu-` + p.id,
    type: 'posyandu',
    title: `Posyandu '` + p.nama + `' ditambahkan`,
    subtitle: p.desa?.name ? `di Desa ` + p.desa.name : null,
    timestamp: p.created_at,
    href: '/admin/dashboard/posyandu',
  }));
}
function activityFromKader(items = []) {
  return items.map((k) => ({
    id: `kader-` + k.id,
    type: 'kader',
    title: `Kader ` + k.nama + ` bergabung`,
    subtitle: k.posyandu?.nama ? `Posyandu ` + k.posyandu.nama : null,
    timestamp: k.created_at,
    href: '/admin/dashboard/kader-posyandu',
  }));
}
function activityFromNakes(items = []) {
  return items.map((n) => ({
    id: `nakes-` + n.id,
    type: 'nakes',
    title: `Tenaga Kesehatan ` + n.nama + ` bergabung`,
    subtitle: n.desa?.name ? `Desa ` + n.desa.name : null,
    timestamp: n.created_at,
    href: '/admin/dashboard/tenaga-kesehatan',
  }));
}
function activityFromOrtu(items = []) {
  return items.map((o) => ({
    id: `ortu-` + o.id,
    type: 'ortu',
    title: `Orang Tua ` + o.nama + ` mendaftar`,
    subtitle: null,
    timestamp: o.created_at,
    href: '/admin/dashboard',
  }));
}
function activityFromArtikel(items = []) {
  return items.map((a) => ({
    id: `artikel-` + a.id,
    type: 'artikel',
    title: `Artikel '` + a.judul + `' diterbitkan`,
    subtitle: a.penulis ? `oleh ` + a.penulis : null,
    timestamp: a.created_at ?? a.updated_at,
    href: '/admin/dashboard/artikel',
  }));
}

function mergeActivity(results, days = 7, limit = 10) {
  const [desa, posyandu, kader, nakes, ortu, artikel] = results;

  const list = [
    ...activityFromDesa(desa.data ?? []),
    ...activityFromPosyandu(posyandu.data ?? []),
    ...activityFromKader(kader.data ?? []),
    ...activityFromNakes(nakes.data ?? []),
    ...activityFromOrtu(ortu.data ?? []),
    ...activityFromArtikel(artikel.data ?? []),
  ]
    .filter((x) => {
      if (!x.timestamp) return false;
      const m = moment(x.timestamp);
      return m.isValid() && moment().diff(m, 'days') <= days;
    })
    .sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf())
    .slice(0, limit);

  return list;
}

export function useAdminDashboardData() {
  return useQueries({
    queries: [
      { queryKey: qk.admin.list('desa'),     queryFn: () => desaApi.list(),     staleTime: STALE },
      { queryKey: qk.admin.list('posyandu'), queryFn: () => posyanduApi.list(), staleTime: STALE },
      { queryKey: qk.admin.list('kader'),    queryFn: () => kaderApi.list(),    staleTime: STALE },
      { queryKey: qk.admin.list('nakes'),    queryFn: () => nakesApi.list(),    staleTime: STALE },
      { queryKey: qk.admin.list('ortu'),     queryFn: () => ortuApi.list(),     staleTime: STALE },
      { queryKey: qk.admin.list('artikel'),  queryFn: () => artikelApi.list(),  staleTime: STALE },
    ],
    combine: (results) => ({
      isLoading: results.every((r) => r.isLoading),
      hasPartialError: results.some((r) => r.isError),
      stats: {
        desa:     results[0].data?.length ?? null,
        posyandu: results[1].data?.length ?? null,
        kader:    results[2].data?.length ?? null,
        nakes:    results[3].data?.length ?? null,
        ortu:     results[4].data?.length ?? null,
        artikel:  results[5].data?.length ?? null,
      },
      activity: mergeActivity(results),
    }),
  });
}
```

- [ ] **Step 2: Commit**

```
git add src/features/admin/useAdminDashboardData.js
git commit -m "feat(admin): add useAdminDashboardData parallel fetch + merge activity"
```

---

## Task 9: AdminStatsGrid component

**Files:**
- Create: `src/features/admin/AdminStatsGrid.jsx`

- [ ] **Step 1: Create component**

Create `src/features/admin/AdminStatsGrid.jsx`:

```jsx
import React from 'react';
import { Home, Building2, UserCog, Stethoscope, Heart, Newspaper } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';

const CARDS = [
  { key: 'desa',     label: 'Total Desa',             href: '/admin/dashboard/desa',             Icon: Home,        accent: 'primary' },
  { key: 'posyandu', label: 'Total Posyandu',         href: '/admin/dashboard/posyandu',         Icon: Building2,   accent: 'primary' },
  { key: 'kader',    label: 'Kader Posyandu',         href: '/admin/dashboard/kader-posyandu',   Icon: UserCog,     accent: 'primary' },
  { key: 'nakes',    label: 'Tenaga Kesehatan',       href: '/admin/dashboard/tenaga-kesehatan', Icon: Stethoscope, accent: 'primary' },
  { key: 'ortu',     label: 'Orang Tua Terdaftar',    href: null,                                 Icon: Heart,       accent: 'primary' },
  { key: 'artikel',  label: 'Artikel Terbit',         href: '/admin/dashboard/artikel',           Icon: Newspaper,   accent: 'primary' },
];

export default function AdminStatsGrid({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[17px]">
      {CARDS.map(({ key, label, href, Icon, accent }) => (
        <StatCard
          key={key}
          label={label}
          value={stats?.[key] ?? null}
          icon={<Icon size={22} strokeWidth={1.75} />}
          accent={accent}
          href={href}
          loading={loading}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```
git add src/features/admin/AdminStatsGrid.jsx
git commit -m "feat(admin): add AdminStatsGrid 6-card responsive grid"
```

---

## Task 10: AdminActivityFeed component

**Files:**
- Create: `src/features/admin/AdminActivityFeed.jsx`

- [ ] **Step 1: Create component**

Create `src/features/admin/AdminActivityFeed.jsx`:

```jsx
import React from 'react';
import {
  Home,
  Building2,
  UserCog,
  Stethoscope,
  Heart,
  Newspaper,
  Inbox,
  AlertTriangle,
} from 'lucide-react';
import ActivityItem from '../../components/ui/ActivityItem';
import EmptyState from '../../components/ui/EmptyState';

const ICON_MAP = {
  desa:     <Home size={18} strokeWidth={1.75} />,
  posyandu: <Building2 size={18} strokeWidth={1.75} />,
  kader:    <UserCog size={18} strokeWidth={1.75} />,
  nakes:    <Stethoscope size={18} strokeWidth={1.75} />,
  ortu:     <Heart size={18} strokeWidth={1.75} />,
  artikel:  <Newspaper size={18} strokeWidth={1.75} />,
};

export default function AdminActivityFeed({ items = [], loading, hasPartialError }) {
  return (
    <section className="bg-white border border-light-ash rounded-default shadow-card p-[25px]">
      <header className="flex items-center justify-between mb-[17px]">
        <div>
          <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
            7 Hari Terakhir
          </p>
          <h2 className="text-heading font-bold text-deep-slate leading-tight">
            Aktivitas Terbaru
          </h2>
        </div>
      </header>

      {hasPartialError && (
        <div className="flex items-center gap-[13px] bg-warning/15 border border-warning/30 text-deep-slate px-[17px] py-[13px] rounded-default mb-[17px] text-caption">
          <AlertTriangle size={16} strokeWidth={2} className="text-warning shrink-0" />
          <span>Sebagian data tidak dapat dimuat. Yang tersedia ditampilkan di bawah.</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-[8px]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-[17px] px-[17px] py-[13px]">
              <div className="w-[40px] h-[40px] rounded-full bg-polar-mist animate-pulse shrink-0" />
              <div className="flex-1">
                <div className="h-[14px] w-2/3 bg-polar-mist animate-pulse rounded mb-[6px]" />
                <div className="h-[12px] w-1/3 bg-polar-mist animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Inbox size={32} strokeWidth={1.75} />}
          title="Belum ada aktivitas"
          description="Belum ada perubahan dalam 7 hari terakhir."
        />
      ) : (
        <div className="flex flex-col gap-[4px]">
          {items.map((item) => (
            <ActivityItem
              key={item.id}
              icon={ICON_MAP[item.type]}
              iconAccent="primary"
              title={item.title}
              subtitle={item.subtitle}
              timestamp={item.timestamp}
              href={item.href}
            />
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```
git add src/features/admin/AdminActivityFeed.jsx
git commit -m "feat(admin): add AdminActivityFeed with skeleton + empty + partial error banner"
```

---

## Task 11: AdminQuickLinks component

**Files:**
- Create: `src/features/admin/AdminQuickLinks.jsx`

- [ ] **Step 1: Create component**

Create `src/features/admin/AdminQuickLinks.jsx`:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Building2,
  UserCog,
  Stethoscope,
  Newspaper,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

const LINKS = [
  { to: '/admin/dashboard/desa',             label: 'Kelola Desa',              desc: 'Daftar desa terdaftar',     Icon: Home },
  { to: '/admin/dashboard/posyandu',         label: 'Kelola Posyandu',          desc: 'Posyandu di setiap desa',   Icon: Building2 },
  { to: '/admin/dashboard/kader-posyandu',   label: 'Kader Posyandu',           desc: 'Akun kader & persetujuan',  Icon: UserCog },
  { to: '/admin/dashboard/tenaga-kesehatan', label: 'Tenaga Kesehatan',         desc: 'Bidan & tenaga kesehatan',  Icon: Stethoscope },
  { to: '/admin/dashboard/artikel',          label: 'Kelola Artikel',           desc: 'Artikel edukasi gizi',      Icon: Newspaper },
];

function QuickLink({ to, label, desc, Icon }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-[13px] w-full px-[17px] py-[13px] rounded-default border border-light-ash bg-white hover:border-primary-300 hover:shadow-card transition-all duration-150 ease-out-quart"
    >
      <span className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-primary-50 text-primary-600 shrink-0 transition-colors group-hover:bg-primary-500 group-hover:text-white">
        <Icon size={18} strokeWidth={2} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-body-sm font-semibold text-deep-slate">{label}</span>
        <span className="block text-caption text-graphite mt-[2px]">{desc}</span>
      </span>
      <ChevronRight
        size={16}
        strokeWidth={2}
        className="text-graphite shrink-0 transition-transform group-hover:translate-x-[2px]"
      />
    </Link>
  );
}

export default function AdminQuickLinks() {
  return (
    <section className="bg-white border border-light-ash rounded-default shadow-card p-[25px]">
      <header className="mb-[17px]">
        <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
          Shortcut
        </p>
        <h2 className="text-heading font-bold text-deep-slate leading-tight">
          Akses Cepat
        </h2>
      </header>

      <div className="flex flex-col gap-[8px]">
        {LINKS.map((link) => (
          <QuickLink key={link.to} {...link} />
        ))}

        <div className="flex items-center gap-[13px] w-full px-[17px] py-[13px] rounded-default border border-dashed border-light-ash bg-faint-fog/40 opacity-70">
          <span className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-polar-mist text-graphite shrink-0">
            <BarChart3 size={18} strokeWidth={2} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-body-sm font-semibold text-deep-slate">
              Laporan Keseluruhan
            </span>
            <span className="block text-caption text-graphite mt-[2px]">
              Agregasi lintas-desa
            </span>
          </span>
          <span className="text-caption font-bold uppercase tracking-[0.1em] text-graphite px-[8px] py-[2px] rounded-full bg-polar-mist">
            Segera
          </span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```
git add src/features/admin/AdminQuickLinks.jsx
git commit -m "feat(admin): add AdminQuickLinks 5 CMS shortcuts + soft-disabled Laporan"
```

---

## Task 12: AdminDashboard landing page

**Files:**
- Create: `src/features/admin/AdminDashboard.jsx`

- [ ] **Step 1: Create page**

Create `src/features/admin/AdminDashboard.jsx`:

```jsx
import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import AdminStatsGrid from './AdminStatsGrid';
import AdminActivityFeed from './AdminActivityFeed';
import AdminQuickLinks from './AdminQuickLinks';
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
        eyebrow={Panel Admin · \}
        title={Halo, \}
        subtitle="Ringkasan aktivitas KMS Digital Lebakwangi."
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[33px]">
        <AdminStatsGrid stats={stats} loading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-[25px]">
          <AdminActivityFeed
            items={activity}
            loading={isLoading}
            hasPartialError={hasPartialError}
          />
          <AdminQuickLinks />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```
git add src/features/admin/AdminDashboard.jsx
git commit -m "feat(admin): add AdminDashboard landing page"
```

---

## Task 13: Sidebar collapse state hook

**Files:**
- Create: `src/hook/useSidebarCollapsed.js`

- [ ] **Step 1: Create hook**

Create `src/hook/useSidebarCollapsed.js`:

```js
import { useState, useEffect, useCallback } from 'react';

const KEY = 'admin-sidebar-collapsed';

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(KEY) === '1';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed((v) => !v), []);

  return { collapsed, toggle, setCollapsed };
}
```

- [ ] **Step 2: Commit**

```
git add src/hook/useSidebarCollapsed.js
git commit -m "feat(hook): add useSidebarCollapsed with localStorage persist"
```

---

## Task 14: Update sidebarLinks.js with Dashboard entry

**Files:**
- Modify: `src/components/layout/Dashboard/sidebarLinks.js`

- [ ] **Step 1: Replace contents**

Replace contents of `src/components/layout/Dashboard/sidebarLinks.js`:

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
    title: 'Utama',
    links: [
      { title: 'Dashboard', path: '', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'Input Data',
    links: [
      { title: 'Desa', path: 'desa', icon: Home },
      { title: 'Posyandu', path: 'posyandu', icon: Building2 },
      { title: 'Artikel', path: 'artikel', icon: Newspaper },
    ],
  },
  {
    title: 'Register Akun',
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

- [ ] **Step 2: Commit**

```
git add src/components/layout/Dashboard/sidebarLinks.js
git commit -m "feat(sidebar): add Utama section with Dashboard entry"
```

---

## Task 15: Enhance Sidebar with collapse + Dashboard active detection

**Files:**
- Modify: `src/components/layout/Dashboard/Sidebar.jsx`

- [ ] **Step 1: Read current file**

Run `Read src/components/layout/Dashboard/Sidebar.jsx` to understand current structure.

- [ ] **Step 2: Rewrite sidebar supporting collapse state**

Replace entire `src/components/layout/Dashboard/Sidebar.jsx` with:

```jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Tooltip } from "antd";
import { LogOut, Lock, X, Heart, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Modal, Form, Input, message } from "antd";
import { sidebarlink } from "./sidebarLinks";
import DropdownLink from "./DropdownLink";
import Button from "../../ui/Button";
import {
  readSession,
  clearSession,
  writeSession,
} from "../../../features/auth/session-storage";
import { useSidebarCollapsed } from "../../../hook/useSidebarCollapsed";

function isLinkActive(pathname, link) {
  const basePath = "/admin/dashboard";
  const target = link.path ? basePath + "/" + link.path : basePath;
  if (link.exact) return pathname === target || pathname === target + "/";
  return pathname.startsWith(target + "/") || pathname === target;
}

export default function Sidebar({ showSidebar, closeSidebar }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState(() => readSession() ?? {});
  const { collapsed, toggle } = useSidebarCollapsed();

  useEffect(() => {
    if (isProfileModalOpen && user?.token?.value) {
      axios
        .get(process.env.REACT_APP_BASE_URL + "/api/profile", {
          headers: { Authorization: "Bearer " + user.token.value },
        })
        .then((response) => {
          form.setFieldsValue({ nama: response.data.data.user.name });
        })
        .catch((err) => {
          messageApi.error(
            err.response?.data?.message || "Gagal mengambil profil"
          );
        });
    }
  }, [isProfileModalOpen, user?.token?.value, form, messageApi]);

  const handleUpdateProfile = () => {
    form
      .validateFields()
      .then((values) => {
        axios
          .put(process.env.REACT_APP_BASE_URL + "/api/profile", values, {
            headers: {
              Authorization: "Bearer " + user.token.value,
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            messageApi.success("Profil berhasil diperbarui");
            const updatedUser = {
              ...user,
              user: { ...user.user, name: response.data.data.user.name },
            };
            writeSession(updatedUser);
            setUser(updatedUser);
            form.resetFields();
            setIsProfileModalOpen(false);
          })
          .catch((err) => {
            messageApi.error(
              err.response?.data?.message || "Gagal memperbarui profil"
            );
          });
      })
      .catch(() => {});
  };

  const handleLogout = () => {
    Modal.confirm({
      title: "Keluar dari akun?",
      content: "Anda perlu masuk kembali untuk menggunakan aplikasi.",
      okText: "Ya, Keluar",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: () => {
        clearSession();
        messageApi.success("Berhasil logout");
        navigate("/masuk", { replace: true });
      },
    });
  };

  const width = collapsed ? "w-[64px]" : "w-60";

  return (
    <>
      {contextHolder}
      <aside
        className={
          "fixed inset-y-0 left-0 z-40 bg-white border-r border-light-ash transform transition-all duration-250 ease-out-quart " +
          width +
          " " +
          (showSidebar ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* Header */}
        <div
          className={
            "flex items-center border-b border-light-ash " +
            (collapsed ? "px-[8px] py-[17px] justify-center" : "px-[21px] py-[21px] justify-between")
          }
        >
          {collapsed ? (
            <Link to="/admin/dashboard" className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-primary-500 text-white">
              <Heart size={20} strokeWidth={2.25} fill="currentColor" fillOpacity={0.25} />
            </Link>
          ) : (
            <Link to="/admin/dashboard" className="min-w-0 flex items-center gap-[10px]">
              <span className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-primary-500 text-white shrink-0">
                <Heart size={20} strokeWidth={2.25} fill="currentColor" fillOpacity={0.25} />
              </span>
              <span className="flex flex-col leading-[1.1] min-w-0">
                <span className="text-body-sm font-bold text-deep-slate truncate">
                  KMS Digital
                </span>
                <span className="text-caption text-graphite truncate">
                  {user?.user?.name ?? "Admin"}
                </span>
              </span>
            </Link>
          )}

          {!collapsed && (
            <button
              onClick={closeSidebar}
              className="md:hidden p-2 rounded-default text-graphite hover:bg-faint-fog transition-colors"
              aria-label="Tutup sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <div className={"hidden md:flex " + (collapsed ? "justify-center py-[13px]" : "justify-end px-[13px] py-[13px]")}>
          <Tooltip title={collapsed ? "Buka sidebar" : "Ciutkan sidebar"} placement="right">
            <button
              type="button"
              onClick={toggle}
              className="flex items-center justify-center w-[36px] h-[36px] rounded-default text-graphite hover:bg-faint-fog hover:text-deep-slate transition-colors"
              aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} strokeWidth={1.75} />
              ) : (
                <PanelLeftClose size={18} strokeWidth={1.75} />
              )}
            </button>
          </Tooltip>
        </div>

        {/* Nav */}
        <nav
          className={
            "overflow-y-auto max-h-[calc(100vh-240px)] " +
            (collapsed ? "px-[8px] py-[13px] space-y-[17px]" : "px-[13px] py-[13px] space-y-[25px]")
          }
        >
          {sidebarlink.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="text-caption font-bold text-graphite px-[13px] mb-[8px] uppercase tracking-[0.12em]">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.links.map((link) => {
                  if (link.dropdown) {
                    return !collapsed ? (
                      <DropdownLink
                        key={link.title}
                        pathname={pathname}
                        basepath={link.basepath}
                        icon={<link.icon size={20} strokeWidth={1.75} />}
                        title={link.title}
                        dropdown={link.dropdown}
                      />
                    ) : null;
                  }

                  const active = isLinkActive(pathname, link);
                  const target = link.path ? "/admin/dashboard/" + link.path : "/admin/dashboard";
                  const iconEl = (
                    <link.icon
                      size={20}
                      strokeWidth={active ? 2.25 : 1.75}
                      className={active ? "text-primary-600" : "text-graphite"}
                    />
                  );
                  const classes =
                    "flex items-center gap-3 h-[50px] rounded-default text-body-sm transition-colors duration-150 ease-out-quart " +
                    (collapsed ? "justify-center px-0 " : "px-[13px] ") +
                    (active
                      ? "bg-primary-50 text-primary-700 font-bold"
                      : "text-deep-slate font-medium hover:bg-faint-fog");

                  if (collapsed) {
                    return (
                      <Tooltip key={link.path} title={link.title} placement="right">
                        <Link to={target} className={classes}>
                          {iconEl}
                        </Link>
                      </Tooltip>
                    );
                  }

                  return (
                    <Link key={link.path} to={target} className={classes}>
                      {iconEl}
                      {link.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div
          className={
            "absolute bottom-0 inset-x-0 border-t border-light-ash bg-white space-y-1 " +
            (collapsed ? "px-[8px] py-[13px]" : "px-[13px] py-[17px]")
          }
        >
          {collapsed ? (
            <>
              <Tooltip title="Ubah Kata Sandi" placement="right">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center justify-center w-full h-[48px] rounded-default text-deep-slate hover:bg-faint-fog transition-colors"
                  aria-label="Ubah Kata Sandi"
                >
                  <Lock size={20} strokeWidth={1.75} />
                </button>
              </Tooltip>
              <Tooltip title="Keluar" placement="right">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full h-[48px] rounded-default text-danger hover:bg-danger/10 transition-colors"
                  aria-label="Keluar"
                >
                  <LogOut size={20} strokeWidth={1.75} />
                </button>
              </Tooltip>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-3 h-[50px] w-full px-[13px] rounded-default text-body-sm text-deep-slate hover:bg-faint-fog transition-colors"
              >
                <Lock size={20} strokeWidth={1.75} className="text-graphite" />
                Ubah Kata Sandi
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 h-[50px] w-full px-[13px] rounded-default text-body-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut size={20} strokeWidth={1.75} />
                Keluar
              </button>
            </>
          )}
        </div>
      </aside>

      <Modal
        title={
          <span className="text-heading font-semibold text-deep-slate">
            Profil Pengguna
          </span>
        }
        open={isProfileModalOpen}
        onCancel={() => {
          form.resetFields();
          setIsProfileModalOpen(false);
        }}
        footer={
          <div className="flex gap-[13px] justify-end">
            <Button
              variant="default"
              size="md"
              onClick={() => {
                form.resetFields();
                setIsProfileModalOpen(false);
              }}
            >
              Batal
            </Button>
            <Button variant="primary" size="md" onClick={handleUpdateProfile}>
              Simpan
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Nama</span>}
            name="nama"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input disabled className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Kata Sandi Baru</span>}
            name="password"
            rules={[{ min: 8, message: "Minimal 8 karakter" }]}
          >
            <Input.Password className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Konfirmasi Kata Sandi</span>}
            name="password_confirmation"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("Kata sandi tidak cocok"));
                },
              }),
            ]}
          >
            <Input.Password className="h-[52px] text-base" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
```

- [ ] **Step 3: Build verify**

Run: `npm run build`
Expected: Compiled with warnings only (no errors).

- [ ] **Step 4: Commit**

```
git add src/components/layout/Dashboard/Sidebar.jsx
git commit -m "feat(sidebar): add collapse toggle with tooltip + Dashboard entry active detection"
```

---

## Task 16: DashboardLayout — adapt to collapsed state

**Files:**
- Modify: `src/components/layout/Dashboard/DashboardLayout.jsx`

- [ ] **Step 1: Rewrite**

Replace `src/components/layout/Dashboard/DashboardLayout.jsx`:

```jsx
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useSidebarCollapsed } from "../../../hook/useSidebarCollapsed";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => !window.matchMedia("(max-width: 768px)").matches
  );
  const { collapsed } = useSidebarCollapsed();

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const marginClass = sidebarOpen
    ? collapsed
      ? "md:ml-[64px]"
      : "md:ml-60"
    : "";

  return (
    <div className="min-h-screen bg-faint-fog flex">
      <Sidebar
        showSidebar={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 p-[13px] rounded-default bg-white border border-light-ash text-deep-slate hover:bg-faint-fog transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label="Buka sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      )}

      <main
        className={`flex-1 min-w-0 transition-all duration-250 ease-out-quart ` + marginClass}
      >
        <div className="max-w-page mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Build verify**

Run: `npm run build`
Expected: Compiled.

- [ ] **Step 3: Commit**

```
git add src/components/layout/Dashboard/DashboardLayout.jsx
git commit -m "feat(dashboard): adapt main margin to sidebar collapsed state"
```

---

## Task 17: Register AdminDashboard route + update role home

**Files:**
- Modify: `src/routes/AppRoutes.jsx`
- Modify: `src/features/auth/roleHome.js`
- Modify: `src/hook/useAuth.js`

- [ ] **Step 1: Add import + index route**

Modify `src/routes/AppRoutes.jsx`:

Add import at top of imports:
```js
import AdminDashboard from '../features/admin/AdminDashboard';
```

Modify admin route block — add `index` route:

```jsx
<Route element={<RequireRole allow={['ADMIN']} />}>
  <Route path="/admin/dashboard" element={<DashboardLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="desa" element={<DesaPage />} />
    <Route path="posyandu" element={<InputPosyandu />} />
    <Route path="kader-posyandu" element={<RegisterKaderPosyandu />} />
    <Route path="tenaga-kesehatan" element={<RegisterTenkes />} />
    <Route path="artikel" element={<ArtikelAdmin />} />
    <Route path="laporan" element={<LaporanAdmin />} />
  </Route>
</Route>
```

- [ ] **Step 2: Update roleHome**

Modify `src/features/auth/roleHome.js`:

Change `ADMIN` value from `'/admin/dashboard/desa'` to `'/admin/dashboard'`.

- [ ] **Step 3: Check useAuth.js**

Check if `useAuth.js` has a ROLE_HOME constant that also references admin path. If so, update it to `/admin/dashboard`.

Run: `findstr /n admin src\hook\useAuth.js`
If match found with specific path, update that line.

- [ ] **Step 4: Build verify**

Run: `npm run build`
Expected: Compiled, no errors. Login as admin now lands on `/admin/dashboard` (dashboard landing).

- [ ] **Step 5: Commit**

```
git add src/routes/AppRoutes.jsx src/features/auth/roleHome.js src/hook/useAuth.js
git commit -m "feat(routes): register AdminDashboard index route + update admin role home"
```

---

## Task 18: Split ArtikelAdmin — create ArtikelList

**Files:**
- Create: `src/pages/AdminDashboard/ArtikelList.jsx`

- [ ] **Step 1: Create page**

Create `src/pages/AdminDashboard/ArtikelList.jsx` — takes existing `ArtikelAdmin.js` Riwayat branch + extracts it.

See `src/pages/AdminDashboard/ArtikelAdmin.js` for reference (particularly the DataTable setup + column definitions + FormUpdateDataArtikel modal).

Full file:

```jsx
import { message, Modal } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  AlertTriangle,
  Plus,
  RotateCcw,
} from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import InlineStatBar from "../../components/ui/InlineStatBar";
import FormUpdateDataArtikel from "../../components/form/FormUpdateDataArtikel";
import { formatDate2 } from "../../utilities/Format";
import { isThisMonth, isWithinDays } from "../../utilities/isThisMonth";
import { artikelApi } from "../../api/artikel.api";
import useAuth from "../../hook/useAuth";

export default function ArtikelList() {
  const [messageApi, contextHolder] = message.useMessage();
  const [isOpenModalUpdateDataArtikel, setIsOpenModalUpdateDataArtikel] = useState(false);
  const [dataArtikel, setDataArtikel] = useState(null);
  const queryClient = useQueryClient();
  const user = useAuth();

  const { data: dataSource, isLoading: artikelLoading } = useQuery({
    queryKey: ["artikel"],
    queryFn: async () => {
      const res = await artikelApi.list();
      return res.data ?? [];
    },
    onError: (err) => {
      messageApi.error(err?.message ?? "Gagal mengambil data artikel");
    },
    enabled: !!user?.token?.value,
  });

  const deleteArtikelMutation = useMutation({
    mutationFn: (id) => artikelApi.remove(id),
    onSuccess: () => {
      messageApi.success("Artikel berhasil dihapus");
      queryClient.invalidateQueries(["artikel"]);
    },
    onError: (err) => {
      messageApi.error(err?.message ?? "Data gagal dihapus");
    },
  });

  const isBusy = deleteArtikelMutation.isPending;

  const rows = dataSource ?? [];
  const stats = [
    { label: "Total Artikel", value: rows.length },
    {
      label: "Minggu Ini",
      value: rows.filter((a) => isWithinDays(a.created_at ?? a.updated_at, 7)).length,
      accent: "primary",
    },
    {
      label: "Bulan Ini",
      value: rows.filter((a) => isThisMonth(a.created_at ?? a.updated_at)).length,
      accent: "primary",
    },
  ];

  const columns = [
    { accessorKey: "judul", header: "Judul Berita", enableSorting: true },
    {
      id: "tanggal",
      header: "Tanggal Upload",
      accessorFn: (row) => row.updated_at,
      cell: ({ getValue }) => (
        <span className="text-graphite">{formatDate2(getValue())}</span>
      ),
      enableSorting: true,
    },
    {
      id: "action",
      header: "Aksi",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            leadingIcon={<Pencil size={16} strokeWidth={1.75} />}
            onClick={() => {
              setDataArtikel(row.original);
              setIsOpenModalUpdateDataArtikel(true);
            }}
            disabled={isBusy}
          >
            Ubah
          </Button>
          <Button
            variant="destructive"
            size="sm"
            leadingIcon={<Trash2 size={16} strokeWidth={1.75} />}
            onClick={() => {
              Modal.confirm({
                title: "Hapus artikel?",
                icon: <AlertTriangle size={20} className="text-danger" />,
                content: "Data yang dihapus tidak dapat dikembalikan.",
                okText: "Ya, hapus",
                cancelText: "Batal",
                okButtonProps: { danger: true },
                onOk: () => deleteArtikelMutation.mutate(row.original.id),
              });
            }}
            disabled={isBusy}
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
        eyebrow="Konten Edukasi"
        title="Kelola Artikel"
        subtitle="Daftar artikel terbit untuk orang tua dan kader."
        action={
          <Link to="/admin/dashboard/artikel/baru">
            <Button
              variant="primary"
              size="lg"
              leadingIcon={<Plus size={20} strokeWidth={2} />}
              disabled={isBusy}
            >
              Tulis Artikel
            </Button>
          </Link>
        }
        stats={<InlineStatBar items={stats} loading={artikelLoading} />}
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[17px]">
        <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px]">
          <DataTable
            columns={columns}
            data={dataSource || []}
            loading={artikelLoading || isBusy}
            searchPlaceholder="Cari artikel..."
            emptyText="Belum ada artikel"
          />
          <div className="flex justify-center mt-[17px] pt-[17px] border-t border-light-ash">
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<RotateCcw size={16} strokeWidth={1.75} />}
              onClick={() => queryClient.invalidateQueries(["artikel"])}
              disabled={isBusy}
            >
              Muat ulang
            </Button>
          </div>
        </div>
      </div>

      <FormUpdateDataArtikel
        isOpen={isOpenModalUpdateDataArtikel}
        onCancel={() => setIsOpenModalUpdateDataArtikel(false)}
        fetch={() => queryClient.invalidateQueries(["artikel"])}
        data={dataArtikel}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```
git add src/pages/AdminDashboard/ArtikelList.jsx
git commit -m "feat(admin): add ArtikelList page (split from ArtikelAdmin)"
```

---

## Task 19: Split ArtikelAdmin — create ArtikelForm

**Files:**
- Create: `src/pages/AdminDashboard/ArtikelForm.jsx`

- [ ] **Step 1: Create page**

Create `src/pages/AdminDashboard/ArtikelForm.jsx` — extracts "Tulis Artikel" branch from ArtikelAdmin.

See `src/pages/AdminDashboard/ArtikelAdmin.js` lines ~222-537 for the Form logic.

Full file:

```jsx
import { Form, Input, message, Select } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ArrowLeft, UploadCloud } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import useAuth from "../../hook/useAuth";

export default function ArtikelForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [imageFile, setImageFile] = useState(null);
  const [valueContent, setValueContent] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const queryClient = useQueryClient();
  const user = useAuth();

  const { data: dataKategori, isLoading: kategoriLoading } = useQuery({
    queryKey: ["kategori"],
    queryFn: async () => {
      const response = await fetch(
        process.env.REACT_APP_BASE_URL + "/api/kategori",
        { headers: { Authorization: "Bearer " + user?.token?.value } }
      );
      if (!response.ok) throw new Error("Gagal mengambil data kategori");
      const data = await response.json();
      return data.data;
    },
    onError: (err) => messageApi.error(err?.message ?? "Gagal mengambil kategori"),
    enabled: !!user?.token?.value,
  });

  const createArtikelMutation = useMutation({
    mutationFn: async (values) => {
      if (!imageFile)
        throw new Error("Silakan unggah cover artikel terlebih dahulu");
      const formData = new FormData();
      formData.append("judul", values.judul);
      formData.append("kategori", values.kategori);
      formData.append("penulis", values.penulis);
      formData.append("content", valueContent);
      formData.append("image", imageFile);

      const response = await fetch(
        process.env.REACT_APP_BASE_URL + "/api/artikel",
        {
          method: "POST",
          headers: { Authorization: "Bearer " + user?.token?.value },
          body: formData,
        }
      );
      if (!response.ok) throw new Error("Data gagal tersimpan");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Artikel berhasil diterbitkan");
      queryClient.invalidateQueries(["artikel"]);
      setTimeout(() => navigate("/admin/dashboard/artikel"), 700);
    },
    onError: (err) => messageApi.error(err?.message ?? "Data gagal tersimpan"),
  });

  const createKategoriMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(
        process.env.REACT_APP_BASE_URL + "/api/kategori",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + user?.token?.value,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      if (!response.ok) throw new Error("Gagal menambah kategori");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Kategori berhasil ditambahkan");
      form.resetFields(["name"]);
      setAddingCategory(false);
      queryClient.invalidateQueries(["kategori"]);
    },
    onError: (err) => messageApi.error(err?.message ?? "Data gagal tersimpan"),
  });

  const isBusy =
    createArtikelMutation.isPending || createKategoriMutation.isPending;

  const validateImage = (file) => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/svg+xml",
    ];
    const maxSize = 2 * 1024 * 1024;
    if (!file) return Promise.reject(new Error("Cover masih kosong"));
    if (!validTypes.includes(file.type))
      return Promise.reject(new Error("Format file tidak valid."));
    if (file.size > maxSize)
      return Promise.reject(new Error("Ukuran file maksimal 2MB"));
    return Promise.resolve();
  };

  const onFinish = (values) => {
    if (addingCategory) createKategoriMutation.mutate(values);
    else createArtikelMutation.mutate(values);
  };

  return (
    <div>
      {contextHolder}
      <PageHeader
        eyebrow="Tulis Baru"
        title="Artikel Baru"
        subtitle="Buat artikel edukasi untuk orang tua dan kader posyandu."
        action={
          <Button
            variant="default"
            size="md"
            leadingIcon={<ArrowLeft size={18} strokeWidth={2} />}
            onClick={() => navigate("/admin/dashboard/artikel")}
            disabled={isBusy}
          >
            Kembali ke Daftar
          </Button>
        }
      />

      <div className="max-w-[800px] mx-auto px-[17px] md:px-[25px] py-[33px]">
        <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px] md:p-[33px]">
          <Form
            form={form}
            name="input_artikel"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label={<span className="text-body-sm font-medium text-deep-slate">Kategori</span>}
              name="kategori"
              rules={[{ required: !addingCategory, message: "Kategori masih kosong" }]}
            >
              <Select
                listHeight={200}
                optionFilterProp="children"
                showSearch
                placeholder="Pilih kategori"
                disabled={kategoriLoading || isBusy}
                className="h-[52px]"
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <div className="border-t border-light-ash p-[8px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddingCategory(true)}
                        disabled={isBusy}
                      >
                        + Tambah Kategori Baru
                      </Button>
                    </div>
                  </div>
                )}
              >
                {!addingCategory &&
                  dataKategori?.map((item) => (
                    <Select.Option key={item.id} value={item.name}>
                      {item.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>

            {addingCategory && (
              <Form.Item
                label={<span className="text-body-sm font-medium text-deep-slate">Nama Kategori Baru</span>}
                name="name"
                rules={[{ required: true, message: "Nama kategori masih kosong" }]}
              >
                <Input placeholder="Masukkan nama kategori" className="h-[52px] text-base" />
              </Form.Item>
            )}

            {!addingCategory && (
              <>
                <Form.Item
                  label={<span className="text-body-sm font-medium text-deep-slate">Judul</span>}
                  name="judul"
                  rules={[{ required: true, message: "Judul masih kosong" }]}
                >
                  <Input placeholder="Masukkan judul artikel" className="h-[52px] text-base" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-body-sm font-medium text-deep-slate">Nama Penulis</span>}
                  name="penulis"
                  rules={[{ required: true, message: "Penulis masih kosong" }]}
                >
                  <Input placeholder="Nama penulis" className="h-[52px] text-base" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-body-sm font-medium text-deep-slate">Unggah Cover Artikel</span>}
                  name="image"
                  rules={[{ validator: () => validateImage(imageFile) }]}
                >
                  <label
                    htmlFor="artikel_cover"
                    className="flex flex-col justify-center items-center w-full h-[200px] bg-faint-fog rounded-default border border-dashed border-light-ash hover:border-primary-500 hover:bg-polar-mist cursor-pointer transition-colors duration-150"
                  >
                    {imageFile ? (
                      <div className="flex flex-col items-center gap-2 text-deep-slate">
                        <UploadCloud size={32} strokeWidth={1.75} className="text-primary-600" />
                        <span className="text-body-sm font-medium">{imageFile.name}</span>
                        <span className="text-caption text-graphite">Klik untuk ganti file</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-graphite">
                        <UploadCloud size={32} strokeWidth={1.75} />
                        <span className="text-body-sm">
                          <span className="font-semibold text-deep-slate">Klik untuk unggah</span> atau seret file
                        </span>
                        <span className="text-caption">JPEG, PNG, JPG, GIF, SVG · Maks 2MB</span>
                      </div>
                    )}
                    <input
                      id="artikel_cover"
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.svg"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          validateImage(file)
                            .then(() => {
                              setImageFile(file);
                              form.validateFields(["image"]);
                            })
                            .catch((error) => {
                              messageApi.error(error.message);
                              setImageFile(null);
                              form.validateFields(["image"]);
                            });
                        }
                      }}
                    />
                  </label>
                </Form.Item>

                <Form.Item
                  label={<span className="text-body-sm font-medium text-deep-slate">Isi Artikel</span>}
                  name="content"
                  rules={[
                    {
                      validator: () =>
                        valueContent
                          ? Promise.resolve()
                          : Promise.reject(new Error("Konten masih kosong")),
                    },
                  ]}
                >
                  <ReactQuill
                    theme="snow"
                    value={valueContent}
                    onChange={setValueContent}
                  />
                </Form.Item>
              </>
            )}

            <div className="flex gap-[13px] justify-end pt-[17px] border-t border-light-ash mt-[17px]">
              {addingCategory && (
                <Button
                  variant="default"
                  size="md"
                  onClick={() => setAddingCategory(false)}
                  disabled={isBusy}
                >
                  Batal
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isBusy}
                loading={isBusy}
              >
                {addingCategory ? "Simpan Kategori" : "Terbitkan Artikel"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```
git add src/pages/AdminDashboard/ArtikelForm.jsx
git commit -m "feat(admin): add ArtikelForm page (split from ArtikelAdmin, full-width canvas)"
```

---

## Task 20: Replace ArtikelAdmin route with ArtikelList + Form

**Files:**
- Modify: `src/routes/AppRoutes.jsx`
- Delete: `src/pages/AdminDashboard/ArtikelAdmin.js`

- [ ] **Step 1: Update imports & routes**

Modify `src/routes/AppRoutes.jsx`:

Replace the existing import:
```js
import ArtikelAdmin from '../pages/AdminDashboard/ArtikelAdmin';
```
With:
```js
import ArtikelList from '../pages/AdminDashboard/ArtikelList';
import ArtikelForm from '../pages/AdminDashboard/ArtikelForm';
```

Replace the existing `artikel` route:
```jsx
<Route path="artikel" element={<ArtikelAdmin />} />
```
With:
```jsx
<Route path="artikel" element={<ArtikelList />} />
<Route path="artikel/baru" element={<ArtikelForm />} />
```

- [ ] **Step 2: Delete old ArtikelAdmin**

Run:
```
Remove-Item -LiteralPath "src\pages\AdminDashboard\ArtikelAdmin.js" -Force
```

- [ ] **Step 3: Build verify**

Run: `npm run build`
Expected: Compiled. No references to ArtikelAdmin.

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "refactor(admin): replace ArtikelAdmin with ArtikelList + ArtikelForm split routes"
```

---

## Task 21: Improve InputDesa with inline stats + search in header + accent

**Files:**
- Modify: `src/pages/AdminDashboard/InputDesa.js`

- [ ] **Step 1: Read current file**

Run `Read src/pages/AdminDashboard/InputDesa.js` to see existing structure.

- [ ] **Step 2: Rewrite page**

Replace entire `src/pages/AdminDashboard/InputDesa.js` with:

```jsx
import { Form, Input, message, Modal } from "antd";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import InlineStatBar from "../../components/ui/InlineStatBar";
import { desaApi } from "../../api/desa.api";
import { isThisMonth } from "../../utilities/isThisMonth";

export default function InputDesa() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const { data: dataSource, isLoading } = useQuery({
    queryKey: ["desa"],
    queryFn: async () => {
      const res = await desaApi.list();
      return res.data ?? [];
    },
    onError: (err) => messageApi.error(err?.message ?? "Gagal mengambil data desa"),
  });

  const deleteDesaMutation = useMutation({
    mutationFn: (id) => desaApi.remove(id),
    onSuccess: () => {
      messageApi.success("Desa berhasil dihapus");
      queryClient.invalidateQueries(["desa"]);
    },
    onError: (err) => messageApi.error(err?.message ?? "Gagal menghapus desa"),
  });

  const createDesaMutation = useMutation({
    mutationFn: (values) => desaApi.create({
      name: values.name,
      password: values.password,
      password_confirmation: values.password_confirmation,
    }),
    onSuccess: () => {
      messageApi.success("Desa dan akun berhasil disimpan");
      queryClient.invalidateQueries(["desa"]);
      form.resetFields();
      setIsModalVisible(false);
    },
    onError: (err) => messageApi.error(err?.message ?? "Data gagal tersimpan"),
  });

  const rows = dataSource ?? [];
  const stats = [
    { label: "Total Desa", value: rows.length },
    {
      label: "Baru Bulan Ini",
      value: rows.filter((d) => isThisMonth(d.created_at)).length,
      accent: "primary",
    },
  ];

  const showDeleteConfirm = (id, name) => {
    Modal.confirm({
      title: "Hapus desa?",
      icon: <AlertTriangle size={20} className="text-danger" />,
      content: `Desa '` + name + `' akan dihapus.`,
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: () => deleteDesaMutation.mutate(id),
    });
  };

  const columns = [
    { accessorKey: "name", header: "Nama Desa", enableSorting: true },
    {
      id: "action",
      header: "Aksi",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          variant="destructive"
          size="sm"
          leadingIcon={<Trash2 size={16} strokeWidth={1.75} />}
          onClick={() => showDeleteConfirm(row.original.id, row.original.name)}
          disabled={deleteDesaMutation.isPending}
        >
          Hapus
        </Button>
      ),
    },
  ];

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      {contextHolder}
      <PageHeader
        eyebrow="Data Master"
        title="Kelola Desa"
        subtitle="Daftar desa yang terdaftar dalam sistem posyandu."
        action={
          <Button
            variant="primary"
            size="lg"
            leadingIcon={<Plus size={20} strokeWidth={2} />}
            onClick={() => setIsModalVisible(true)}
            disabled={createDesaMutation.isPending}
          >
            Tambah Desa
          </Button>
        }
        stats={<InlineStatBar items={stats} loading={isLoading} />}
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
        <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px]">
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading || createDesaMutation.isPending || deleteDesaMutation.isPending}
            rowKey="id"
            searchPlaceholder="Cari desa..."
            emptyText="Belum ada desa terdaftar"
          />
        </div>
      </div>

      <Modal
        title={<span className="text-heading font-semibold text-deep-slate">Tambah Desa</span>}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          name="tambah_desa"
          onFinish={(v) => createDesaMutation.mutate(v)}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Nama Desa</span>}
            name="name"
            rules={[{ required: true, message: "Nama Desa masih kosong" }]}
          >
            <Input className="h-[52px] text-base" placeholder="Masukkan nama desa" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Kata Sandi</span>}
            name="password"
            rules={[
              { required: true, message: "Kata sandi masih kosong" },
              { min: 8, message: "Minimal 8 karakter" },
            ]}
          >
            <Input.Password placeholder="Minimal 8 karakter" className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Konfirmasi Kata Sandi</span>}
            name="password_confirmation"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Konfirmasi kata sandi" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("Kata sandi tidak sesuai"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Ulangi kata sandi" className="h-[52px] text-base" />
          </Form.Item>
          <div className="flex gap-[13px] justify-end pt-[13px]">
            <Button variant="default" size="md" onClick={handleCancel} disabled={createDesaMutation.isPending}>
              Batal
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={createDesaMutation.isPending}>
              {createDesaMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```
git add src/pages/AdminDashboard/InputDesa.js
git commit -m "feat(admin): add inline stats + accent top line to InputDesa"
```

---

## Task 22: Improve InputPosyandu with stats + accent

**Files:**
- Modify: `src/pages/AdminDashboard/InputPosyandu.js`

- [ ] **Step 1: Read current file to see state**

Run: `Read src/pages/AdminDashboard/InputPosyandu.js`

- [ ] **Step 2: Apply two edits**

Edit 1 — add imports at top (after existing imports):

```js
import PageHeader from "../../components/ui/PageHeader";
import InlineStatBar from "../../components/ui/InlineStatBar";
import { isThisMonth } from "../../utilities/isThisMonth";
```

Edit 2 — derive stats via useMemo (after fetch declarations, before columns):

```js
const rows = dataSource ?? [];
const stats = [
  { label: "Total Posyandu", value: rows.length },
  {
    label: "Tersebar di",
    value: new Set(rows.map((p) => p.id_desa).filter(Boolean)).size + " desa",
    accent: "neutral",
  },
  {
    label: "Baru Bulan Ini",
    value: rows.filter((p) => isThisMonth(p.created_at)).length,
    accent: "primary",
  },
];
```

Edit 3 — replace entire page return. Replace the top-level `<div className="space-y-[25px]">` wrapper and all its first section `<div className="flex items-start justify-between gap-[25px] flex-wrap">` down to just before the DataTable container `<div className="bg-white border border-light-ash rounded-default p-[25px] shadow-card">` with:

```jsx
return (
  <div>
    {contextHolder}
    <PageHeader
      eyebrow="Data Master"
      title="Kelola Posyandu"
      subtitle="Daftar posyandu yang terdaftar di setiap desa."
      action={
        <Button
          variant="primary"
          size="lg"
          leadingIcon={<Plus size={20} strokeWidth={2} />}
          onClick={showModal}
          disabled={isBusy}
        >
          Tambah Posyandu
        </Button>
      }
      stats={<InlineStatBar items={stats} loading={posyanduLoading} />}
    />

    <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
      <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px]">
        <DataTable
          columns={columns}
          data={dataSource || []}
          loading={posyanduLoading || isBusy}
          rowKey="id"
          searchPlaceholder="Cari posyandu..."
          emptyText="Belum ada posyandu terdaftar"
        />
      </div>
    </div>

    {/* Modal content stays as-is */}
```

The closing `</div>` at end of the original outer wrapper needs to be kept. Modal block stays unchanged.

- [ ] **Step 3: Build verify**

Run: `npm run build`
Expected: Compiled.

- [ ] **Step 4: Commit**

```
git add src/pages/AdminDashboard/InputPosyandu.js
git commit -m "feat(admin): add inline stats + accent top line to InputPosyandu"
```

---

## Task 23: Improve RegisterKaderPosyandu with stats + accent

**Files:**
- Modify: `src/pages/AdminDashboard/RegisterKaderPosyandu.js`

- [ ] **Step 1: Add imports**

Add after existing imports:

```js
import PageHeader from "../../components/ui/PageHeader";
import InlineStatBar from "../../components/ui/InlineStatBar";
import { isThisMonth } from "../../utilities/isThisMonth";
```

- [ ] **Step 2: Derive stats**

After `filteredKaderData` useMemo, add:

```js
const allKader = kaderData ?? [];
const stats = [
  { label: "Total Kader", value: allKader.length },
  {
    label: "Disetujui",
    value: allKader.filter((k) => normalizeStatus(k.status)).length,
    accent: "success",
  },
  {
    label: "Belum Disetujui",
    value: allKader.filter((k) => !normalizeStatus(k.status)).length,
    accent: "warning",
  },
  {
    label: "Baru Bulan Ini",
    value: allKader.filter((k) => isThisMonth(k.created_at)).length,
    accent: "primary",
  },
];
```

- [ ] **Step 3: Replace page-level header**

Replace `<div className="flex items-start justify-between gap-[25px] flex-wrap">` block (the first section containing eyebrow+heading+action) with `<PageHeader>` call:

```jsx
<PageHeader
  eyebrow="Akun Pengguna"
  title="Kelola Kader Posyandu"
  subtitle="Daftar kader yang membantu operasional posyandu di desa."
  action={
    <Button
      variant="primary"
      size="lg"
      leadingIcon={<Plus size={20} strokeWidth={2} />}
      onClick={showModal}
      disabled={isBusy}
    >
      Tambah Kader Posyandu
    </Button>
  }
  stats={<InlineStatBar items={stats} loading={kaderLoading} />}
/>
```

And wrap the existing content card `<div className="bg-white border border-light-ash rounded-default p-[25px] shadow-card space-y-[17px]">` into `<div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">`. Add `border-t-2 border-t-primary-500` to the content card.

- [ ] **Step 4: Build verify + commit**

```
npm run build
git add src/pages/AdminDashboard/RegisterKaderPosyandu.js
git commit -m "feat(admin): add inline stats + accent top line to RegisterKaderPosyandu"
```

---

## Task 24: Improve RegisterTenagaKesehatan with stats + accent

**Files:**
- Modify: `src/pages/AdminDashboard/RegisterTenagaKesehatan.js`

Same pattern as Task 23, with stats:

```js
const rows = tenagaKesehatanData ?? [];
const stats = [
  { label: "Total Tenaga Kesehatan", value: rows.length },
  {
    label: "Tersebar di",
    value: new Set(rows.map((n) => n.desa?.id).filter(Boolean)).size + " desa",
    accent: "neutral",
  },
  {
    label: "Baru Bulan Ini",
    value: rows.filter((n) => isThisMonth(n.created_at)).length,
    accent: "primary",
  },
];
```

Use PageHeader eyebrow `"Akun Pengguna"` and title `"Kelola Tenaga Kesehatan"`. Add `border-t-2 border-t-primary-500` to content card.

- [ ] **Step 1-3: Apply + build + commit**

```
npm run build
git add src/pages/AdminDashboard/RegisterTenagaKesehatan.js
git commit -m "feat(admin): add inline stats + accent top line to RegisterTenagaKesehatan"
```

---

## Task 25: Minor cleanup LaporanAdmin

**Files:**
- Modify: `src/features/laporan/LaporanAdmin.jsx`

- [ ] **Step 1: Rewrite**

Replace contents of `src/features/laporan/LaporanAdmin.jsx`:

```jsx
import React from 'react';
import { Clock } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

export default function LaporanAdmin() {
  return (
    <div>
      <PageHeader
        eyebrow="Analitik"
        title="Laporan Keseluruhan"
        subtitle="Agregasi rekap gizi lintas desa akan tersedia di rilis berikutnya."
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
        <Card>
          <div className="flex items-start gap-[17px]">
            <span className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-polar-mist text-graphite shrink-0">
              <Clock size={22} strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
                Segera Hadir
              </p>
              <h2 className="text-heading font-bold text-deep-slate mb-[13px]">
                Fitur dalam pengembangan
              </h2>
              <p className="text-body-sm text-graphite leading-relaxed">
                Rekap per-desa sudah tersedia di dashboard masing-masing akun Desa.
                Agregasi lintas-desa untuk role Admin akan ditambahkan setelah backend
                menyediakan endpoint rekap admin
                `<code className="text-caption bg-polar-mist px-[8px] py-[2px] rounded-default ml-1">GET /api/admin/laporan/bulanan</code>`.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```
git add src/features/laporan/LaporanAdmin.jsx
git commit -m "refactor(admin): polish LaporanAdmin placeholder with Clock icon + Card layout"
```

---

## Task 26: Final verification

**Files:** none modified.

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Compiled with warnings only (pre-existing), no errors.

- [ ] **Step 2: Manual smoke test checklist**

Start dev server:

```
npm start
```

For admin user, verify:

- [ ] Login sebagai admin → redirect ke `/admin/dashboard` (NEW landing page)
- [ ] Stats grid: 6 card dengan angka benar (cross-check dengan page masing-masing)
- [ ] Activity feed: muncul 7-10 item mixed entity dari 7 hari terakhir, click item → navigate benar
- [ ] Quick links: 5 link navigate ke CMS page; tombol Laporan soft-disabled dengan badge "Segera"
- [ ] Sidebar "Dashboard" highlighted saat di `/admin/dashboard`, fade out saat navigate ke CMS
- [ ] Sidebar collapse toggle (top-right panel): ganti width 240→64, icon-only, tooltip on hover. Reload → state persist.
- [ ] Navigate ke setiap CMS page → PageHeader dengan eyebrow + display heading + inline stats bar muncul
- [ ] Inline stats loading skeleton saat data belum siap, lalu tampil angka
- [ ] Content card punya accent line pink di atas (`border-t-2 border-t-primary-500`)
- [ ] Search di DataTable toolbar berfungsi (search di header TIDAK ada — itu reserve slot, bukan active feature di plan ini)
- [ ] ArtikelList (`/admin/dashboard/artikel`): table + stats + tombol "Tulis Artikel" pill kanan atas
- [ ] Click "Tulis Artikel" → navigate `/admin/dashboard/artikel/baru`, form muncul full-width
- [ ] Click "Kembali ke Daftar" → back ke list
- [ ] Submit artikel baru → redirect ke list, toast sukses
- [ ] Row action "Ubah" di ArtikelList → modal FormUpdateDataArtikel muncul (tetap modal seperti sebelumnya)
- [ ] LaporanAdmin: Clock icon + Card placeholder

- [ ] **Step 3: Build bundle check**

Run: `npm run build` (final).
Expected: bundle size reasonable (<500 kB main JS), no new warnings.

- [ ] **Step 4: No stragglers**

Run grep check:

```
findstr /s /n /c:"ArtikelAdmin" src\
```

Expected: no reference to deleted `ArtikelAdmin.js` file.

---
