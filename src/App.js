import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./pages/Dashboard";
import Desa from "./pages/Desa/desa";
import Detail from "./pages/Detail";
import DetailForum from "./pages/DetailForum";
import LandingPage from "./pages/LandingPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Post from "./pages/Post";
import MyPost from "./pages/MyPost";
import NotFound from "./pages/NotFound";
import Artikel from "./pages/Artikel";
import PosyanduDashboard from "./pages/Posyandu";
import DetailPosyandu from "./pages/Posyandu/DetailPosyandu";
import DashboardLayout from "./components/layout/Dashboard/DashboardLayout";
import RequireAuth from "./utilities/RequireAuth";
import DesaPage from "./pages/Admin/Desa/DesaPage";
import InputPosyandu from "./pages/AdminDashboard/InputPosyandu";
import RegisterKaderPosyandu from "./pages/AdminDashboard/RegisterKaderPosyandu";
import RegisterTenkes from "./pages/AdminDashboard/RegisterTenagaKesehatan";
import InputAcara from "./pages/Desa/input_acara";
import ArtikelAdmin from "./pages/AdminDashboard/ArtikelAdmin";
import DetailArtikel from "./pages/Admin/DetailArtikel";

// Initialize QueryClient
const queryClient = new QueryClient();

const ROLES = {
  Desa: "DESA",
  Posyandu: "KADER_POSYANDU",
  Admin: "ADMIN",
  OT: "ORANG_TUA",
  TK: "TENAGA_KESEHATAN",
};

const ROUTES = {
  DESAROUTE: "desa",
  POSYANDUROUTE: "posyandu",
  REGISTPOSYANDU: "kader-posyandu",
  REGISTTENKES: "tenaga-kesehatan",
  ARTIKEL: "artikel",
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route
            path="/sign-in/admin"
            element={
              <SignIn
                TenagaKesehatan={false}
                Desa={false}
                kaderPosyandu={false}
                admin={true}
              />
            }
          />
          <Route
            path="/sign-in/tenaga-kesehatan"
            element={
              <SignIn
                TenagaKesehatan={true}
                Desa={false}
                kaderPosyandu={false}
                admin={false}
              />
            }
          />
          <Route
            path="/sign-in/desa"
            element={
              <SignIn
                Desa={true}
                TenagaKesehatan={false}
                kaderPosyandu={false}
                admin={false}
              />
            }
          />
          <Route
            path="/sign-in/kader-posyandu"
            element={
              <SignIn
                kaderPosyandu={true}
                Desa={false}
                TenagaKesehatan={false}
                admin={false}
              />
            }
          />
          <Route path="/sign-up" element={<SignUp />} />

          {/* Role Orang_tua */}
          <Route element={<RequireAuth allowedRoles={[ROLES.OT]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tanya-jawab" element={<Post />} />
            <Route path="/forum/detail/:id" element={<DetailForum />} />
            <Route path="/my-forum" element={<MyPost />} />
            <Route path="/dashboard/detail/:id" element={<Detail />} />
          </Route>

          {/* Role Kader Posyandu */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Posyandu]} />}>
            <Route
              path="/kader-posyandu/dashboard"
              element={<PosyanduDashboard />}
            />
            <Route
              path="/kader-posyandu/dashboard/detail/:id"
              element={<DetailPosyandu />}
            />
          </Route>

          {/* Role Desa */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Desa]} />}>
            <Route path="/desa/reminder" element={<InputAcara />} />
            <Route path="/desa/dashboard" element={<Desa />} />
          </Route>

          {/* Role Admin */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
            <Route path="/admin/dashboard" element={<DashboardLayout />}>
              <Route path={ROUTES.DESAROUTE} element={<DesaPage />} />
              <Route path={ROUTES.POSYANDUROUTE} element={<InputPosyandu />} />
              <Route
                path={ROUTES.REGISTPOSYANDU}
                element={<RegisterKaderPosyandu />}
              />
              <Route path={ROUTES.REGISTTENKES} element={<RegisterTenkes />} />
              <Route path={ROUTES.ARTIKEL} element={<ArtikelAdmin />} />
            </Route>
          </Route>

          {/* Role Tenaga Kesehatan */}
          <Route element={<RequireAuth allowedRoles={[ROLES.TK]} />}>
            <Route path="/tenaga-kesehatan/dashboard" element={<Post />} />
          </Route>

          {/* Public Routes */}
          <Route
            path="/tenaga-kesehatan/detail/:id"
            element={<DetailForum />}
          />
          <Route path="/artikel" element={<Artikel />} />
          <Route path="/artikel/:id" element={<DetailArtikel />} />

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
