import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RequireRole from './RequireRole';
import { LEGACY_REDIRECTS } from './legacyRedirects';

// Eager: critical for initial render + frequently navigated pages
// (no flash when navigating within a role)
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

// Lazy: heavy pages (chart-heavy, admin-only, rare visits)
const DetailAnak = lazy(() => import('../features/anak/DetailAnak'));
const ArtikelPublic = lazy(() => import('../features/artikel/ArtikelList'));
const ArtikelDetailPage = lazy(() => import('../features/artikel/ArtikelDetailPage'));
const SignUp = lazy(() => import('../pages/SignUp'));

// Admin pages — lazy karena hanya admin yang akses
const DashboardLayout = lazy(() => import('../components/layout/Dashboard/DashboardLayout'));
const DesaPage = lazy(() => import('../pages/AdminDashboard/InputDesa'));
const InputPosyandu = lazy(() => import('../pages/AdminDashboard/InputPosyandu'));
const RegisterKaderPosyandu = lazy(() => import('../pages/AdminDashboard/RegisterKaderPosyandu'));
const RegisterTenkes = lazy(() => import('../pages/AdminDashboard/RegisterTenagaKesehatan'));
const ArtikelList = lazy(() => import('../pages/AdminDashboard/ArtikelList'));
const ArtikelForm = lazy(() => import('../pages/AdminDashboard/ArtikelForm'));
const AdminDashboard = lazy(() => import('../features/admin/AdminDashboard'));

/**
 * Top loading bar — minimal fallback yang tidak unmount halaman saat ini.
 */
function TopLoadingBar() {
  return (
    <div
      role="progressbar"
      aria-label="Memuat halaman"
      className="fixed top-0 left-0 right-0 h-[3px] z-[9999] bg-primary-50 overflow-hidden"
    >
      <div
        className="h-full w-1/3 bg-primary-500 rounded-r-full"
        style={{ animation: 'loading-bar 1s ease-in-out infinite' }}
      />
      <style>{`
        @keyframes loading-bar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<TopLoadingBar />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/masuk" element={<LoginPortal />} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* Legacy redirects */}
        {LEGACY_REDIRECTS.map(({ from, to }) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}

        {/* Role: Kader Posyandu */}
        <Route element={<RequireRole allow={['KADER_POSYANDU']} />}>
          <Route path="/kader/balita" element={<ModePosyandu />} />
          <Route path="/kader/balita/:id" element={<DetailAnak />} />
          <Route path="/kader/orangtua" element={<AkunOrangTuaPage />} />
          <Route path="/kader/laporan" element={<LaporanBulananKader />} />
        </Route>

        {/* Role: Orang Tua */}
        <Route element={<RequireRole allow={['ORANG_TUA']} />}>
          <Route path="/orangtua/balita" element={<BerandaOT />} />
          <Route path="/orangtua/forum" element={<Post />} />
          <Route path="/orangtua/forum/:id" element={<DetailForum />} />
          <Route path="/orangtua/balita/:id" element={<DetailAnak />} />
        </Route>

        {/* Role: Desa */}
        <Route element={<RequireRole allow={['DESA']} />}>
          <Route path="/desa/beranda" element={<BerandaDesa />} />
        </Route>

        {/* Role: Admin */}
        <Route element={<RequireRole allow={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="desa" element={<DesaPage />} />
            <Route path="posyandu" element={<InputPosyandu />} />
            <Route path="kader-posyandu" element={<RegisterKaderPosyandu />} />
            <Route path="tenaga-kesehatan" element={<RegisterTenkes />} />
            <Route path="artikel" element={<ArtikelList />} />
            <Route path="artikel/baru" element={<ArtikelForm />} />
          </Route>
        </Route>

        {/* Role: Tenaga Kesehatan */}
        <Route element={<RequireRole allow={['TENAGA_KESEHATAN']} />}>
          <Route path="/tenkes/forum" element={<Post />} />
          <Route path="/tenkes/balita/:id" element={<DetailForum />} />
        </Route>

        {/* Artikel public */}
        <Route
          element={
            <RequireRole
              allow={['ORANG_TUA', 'KADER_POSYANDU', 'TENAGA_KESEHATAN', 'DESA', 'ADMIN']}
            />
          }
        >
          <Route path="/artikel" element={<ArtikelPublic />} />
          <Route path="/artikel/:id" element={<ArtikelDetailPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
