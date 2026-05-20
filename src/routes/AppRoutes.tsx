import React, { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RequireRole from './RequireRole';
import { LEGACY_REDIRECTS } from './legacyRedirects';
import PageSkeleton from '../components/PageSkeleton';

// Eager: critical for initial render + frequently navigated pages
import LoginPortal from '../features/auth/LoginPortal';
import LandingPage from '../pages/LandingPage';
import NotFound from '../pages/NotFound';
import ModePosyandu from '../features/kader/ModePosyandu';
import AkunOrangTuaPage from '../features/kader/AkunOrangTuaPage';
import BerandaOT from '../features/orangtua/BerandaOT';
import BerandaDesa from '../features/desa/BerandaDesa';
import Post from '../pages/Post';
import DetailForum from '../pages/DetailForum';
import LaporanBulananKader from '../features/laporan/LaporanBulananKader';
import UserGuidePage from '../pages/UserGuide';

// Lazy: heavy or rarely-visited pages
const DetailAnak = lazy(() => import('../features/anak/DetailAnak'));
const ArtikelPublic = lazy(() => import('../features/artikel/ArtikelList'));
const ArtikelDetailPage = lazy(() => import('../features/artikel/ArtikelDetailPage'));
const SignUp = lazy(() => import('../pages/SignUp'));

// Admin pages — lazy
const DashboardLayout = lazy(() => import('../components/layout/Dashboard/DashboardLayout'));
const DesaPage = lazy(() => import('../pages/AdminDashboard/InputDesa'));
const InputPosyandu = lazy(() => import('../pages/AdminDashboard/InputPosyandu'));
const RegisterKaderPosyandu = lazy(() => import('../pages/AdminDashboard/RegisterKaderPosyandu'));
const RegisterTenkes = lazy(() => import('../pages/AdminDashboard/RegisterTenagaKesehatan'));
const ArtikelList = lazy(() => import('../pages/AdminDashboard/ArtikelList'));
const ArtikelForm = lazy(() => import('../pages/AdminDashboard/ArtikelForm'));
const AdminDashboard = lazy(() => import('../features/admin/AdminDashboard'));

/**
 * Wrap lazy element dengan Suspense + skeleton.
 * Suspense di-isolasi per-route supaya halaman lain tidak ter-affect.
 */
function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageSkeleton />}>{element}</Suspense>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/user-guide" element={<UserGuidePage />} />
      <Route path="/masuk" element={<LoginPortal />} />
      <Route path="/sign-up" element={withSuspense(<SignUp />)} />

      {/* Legacy redirects */}
      {LEGACY_REDIRECTS.map(({ from, to }) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}

      {/* Role: Kader Posyandu */}
      <Route element={<RequireRole allow={['KADER_POSYANDU']} />}>
        <Route path="/kader/balita" element={<ModePosyandu />} />
        <Route path="/kader/balita/:id" element={withSuspense(<DetailAnak />)} />
        <Route path="/kader/orangtua" element={<AkunOrangTuaPage />} />
        <Route path="/kader/laporan" element={<LaporanBulananKader />} />
      </Route>

      {/* Role: Orang Tua */}
      <Route element={<RequireRole allow={['ORANG_TUA']} />}>
        <Route path="/orangtua/balita" element={<BerandaOT />} />
        <Route path="/orangtua/forum" element={<Post />} />
        <Route path="/orangtua/forum/:id" element={<DetailForum />} />
        <Route path="/orangtua/balita/:id" element={withSuspense(<DetailAnak />)} />
      </Route>

      {/* Role: Desa */}
      <Route element={<RequireRole allow={['DESA']} />}>
        <Route path="/desa/beranda" element={<BerandaDesa />} />
      </Route>

      {/* Role: Admin (semua lazy) */}
      <Route element={<RequireRole allow={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={withSuspense(<DashboardLayout />)}>
          <Route index element={withSuspense(<AdminDashboard />)} />
          <Route path="desa" element={withSuspense(<DesaPage />)} />
          <Route path="posyandu" element={withSuspense(<InputPosyandu />)} />
          <Route path="kader-posyandu" element={withSuspense(<RegisterKaderPosyandu />)} />
          <Route path="tenaga-kesehatan" element={withSuspense(<RegisterTenkes />)} />
          <Route path="artikel" element={withSuspense(<ArtikelList />)} />
          <Route path="artikel/baru" element={withSuspense(<ArtikelForm />)} />
        </Route>
      </Route>

      {/* Role: Tenaga Kesehatan */}
      <Route element={<RequireRole allow={['TENAGA_KESEHATAN']} />}>
        <Route path="/tenkes/forum" element={<Post />} />
        <Route path="/tenkes/balita/:id" element={withSuspense(<DetailForum />)} />
      </Route>

      {/* Artikel public */}
      <Route
        element={
          <RequireRole
            allow={['ORANG_TUA', 'KADER_POSYANDU', 'TENAGA_KESEHATAN', 'DESA', 'ADMIN']}
          />
        }
      >
        <Route path="/artikel" element={withSuspense(<ArtikelPublic />)} />
        <Route path="/artikel/:id" element={withSuspense(<ArtikelDetailPage />)} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
