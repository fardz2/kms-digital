import { Form, Input, message, Select, Spin } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Heart,
  Sparkles,
  CheckCircle2,
  Mail,
  KeyRound,
  UserCircle,
  MapPin,
  Home,
  UserPlus,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { readSession } from "../../features/auth/session-storage";
import { ROLE_HOME } from "../../features/auth/roleHome";

const BENEFITS = [
  'Catat pertumbuhan anak bulanan',
  'Akses artikel edukasi gizi',
  'Konsultasi dengan tenaga kesehatan',
];

export default function SignUp() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [role, setRole] = useState(3);

  const { isLoading: authLoading } = useQuery({
    queryKey: ["authCheck"],
    queryFn: () => {
      const session = readSession();
      const isAuthenticated = !!session?.token?.value && !!session?.user?.role;
      const userRole = isAuthenticated ? session.user.role : null;

      if (isAuthenticated) {
        const redirectPath = ROLE_HOME[userRole] ?? "/";
        messageApi.info("Anda sudah login. Mengarahkan ke dashboard...");
        navigate(redirectPath, { replace: true });
      }

      return { isAuthenticated };
    },
    retry: false,
  });

  const { data: dataDesa, isLoading: desaLoading } = useQuery({
    queryKey: ["desa"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/desa`
      );
      if (!response.ok) throw new Error("Gagal memuat data desa");
      const data = await response.json();
      return data.data;
    },
    onError: () => messageApi.error("Gagal memuat data desa"),
  });

  const { data: dataPosyandu, isLoading: posyanduLoading } = useQuery({
    queryKey: ["posyandu"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu`
      );
      if (!response.ok) throw new Error("Gagal memuat data posyandu");
      const data = await response.json();
      return data.data;
    },
    onError: () => messageApi.error("Gagal memuat data posyandu"),
  });

  const posyanduRegisterMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/posyandu/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: values.nama,
            email: values.email,
            password: values.password,
            id_desa: values.desa,
            id_posyandu: values.posyandu,
          }),
        }
      );
      if (!response.ok) throw new Error("Gagal Registrasi");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Registrasi berhasil. Silakan masuk.");
      setTimeout(() => navigate("/masuk"), 1000);
    },
    onError: (error) => {
      messageApi.error(error.message || "Gagal Registrasi");
    },
  });

  const orangTuaRegisterMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/orang-tua/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: values.nama,
            email: values.email,
            password: values.password,
            id_desa: values.desa,
            id_posyandu: values.posyandu,
            alamat: values.alamat,
          }),
        }
      );
      if (!response.ok) throw new Error("Gagal Registrasi");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Registrasi berhasil. Silakan masuk.");
      setTimeout(() => navigate("/masuk"), 1000);
    },
    onError: (error) => {
      messageApi.error(error.message || "Gagal Registrasi");
    },
  });

  const onFinish = (values) => {
    if (role === 4) posyanduRegisterMutation.mutate(values);
    else if (role === 3) orangTuaRegisterMutation.mutate(values);
  };

  const loading =
    posyanduRegisterMutation.isPending || orangTuaRegisterMutation.isPending;

  const prefixIcon = (Icon) => (
    <Icon size={18} strokeWidth={1.75} className="text-graphite mr-[6px]" />
  );

  return (
    <>
      {contextHolder}

      {(authLoading || desaLoading || posyanduLoading) && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/95 px-[25px] py-[21px] rounded-default border border-light-ash shadow-card">
          <div className="flex items-center gap-[13px]">
            <Spin size="default" />
            <span className="text-body-sm text-graphite">Memuat...</span>
          </div>
        </div>
      )}

      <div className="min-h-screen lg:grid lg:grid-cols-[1fr_1.05fr] bg-faint-fog">
        {/* Left: Form */}
        <main className="flex flex-col min-h-screen lg:min-h-0 order-2 lg:order-1">
          <header className="lg:hidden flex items-center justify-between px-[17px] py-[17px] border-b border-light-ash bg-white">
            <Link to="/" className="flex items-center gap-[10px]">
              <span className="flex items-center justify-center w-[36px] h-[36px] rounded-full bg-primary-500 text-white">
                <Heart size={18} strokeWidth={2.25} fill="currentColor" fillOpacity={0.25} />
              </span>
              <span className="flex flex-col leading-[1.1]">
                <span className="text-body-sm font-bold text-deep-slate tracking-tight">
                  KMS Digital
                </span>
                <span className="text-caption text-graphite">Posyandu Lebakwangi</span>
              </span>
            </Link>
          </header>

          <div className="flex-1 flex items-start lg:items-center justify-center px-[17px] py-[33px] md:px-[33px] lg:px-[67px] xl:px-[95px]">
            <div className="w-full max-w-[480px]">
              <div className="mb-[33px]">
                <p className="inline-flex items-center gap-[8px] text-caption font-bold uppercase tracking-[0.14em] text-primary-600 mb-[13px]">
                  <Sparkles size={14} strokeWidth={2.25} />
                  Daftar Akun Baru
                </p>
                <h1 className="text-heading-lg md:text-display font-bold text-deep-slate leading-[1.05] tracking-tight mb-[13px]">
                  Buat akun Anda
                </h1>
                <p className="text-body-sm text-graphite">
                  Lengkapi data berikut untuk mulai memantau tumbuh kembang anak.
                </p>
              </div>

              <Form
                name="signup"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  label={
                    <span className="text-body-sm font-semibold text-deep-slate">
                      Peran
                    </span>
                  }
                  name="role"
                  initialValue={role}
                  rules={[{ required: true, message: "Pilih peran" }]}
                >
                  <Select
                    placeholder="Pilih peran"
                    onChange={(value) => setRole(value)}
                    className="h-[52px]"
                  >
                    <Select.Option value={3}>Orang Tua</Select.Option>
                    <Select.Option value={4}>Kader Posyandu</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-body-sm font-semibold text-deep-slate">
                      Nama Lengkap
                    </span>
                  }
                  name="nama"
                  rules={[{ required: true, message: "Nama masih kosong" }]}
                >
                  <Input
                    prefix={prefixIcon(UserCircle)}
                    placeholder="Nama lengkap"
                    className="h-[52px] text-base"
                    autoComplete="name"
                  />
                </Form.Item>

                {role === 3 && (
                  <Form.Item
                    label={
                      <span className="text-body-sm font-semibold text-deep-slate">
                        Alamat
                      </span>
                    }
                    name="alamat"
                    rules={[{ required: true, message: "Alamat masih kosong" }]}
                  >
                    <Input.TextArea
                      rows={3}
                      className="text-base"
                      placeholder="Alamat tempat tinggal"
                    />
                  </Form.Item>
                )}

                <Form.Item
                  label={
                    <span className="text-body-sm font-semibold text-deep-slate">
                      Email
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Email masih kosong" },
                    { type: "email", message: "Format email tidak valid" },
                  ]}
                >
                  <Input
                    prefix={prefixIcon(Mail)}
                    placeholder="email@contoh.com"
                    className="h-[52px] text-base"
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-body-sm font-semibold text-deep-slate">
                      Kata Sandi
                    </span>
                  }
                  name="password"
                  rules={[
                    { required: true, message: "Kata sandi masih kosong" },
                    { pattern: "^.{8,}$", message: "Minimal 8 karakter" },
                  ]}
                >
                  <Input.Password
                    prefix={prefixIcon(KeyRound)}
                    placeholder="Minimal 8 karakter"
                    className="h-[52px] text-base"
                    autoComplete="new-password"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-body-sm font-semibold text-deep-slate">
                      Konfirmasi Kata Sandi
                    </span>
                  }
                  name="confirm"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Konfirmasi kata sandi" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Kata sandi tidak sesuai")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={prefixIcon(KeyRound)}
                    placeholder="Ulangi kata sandi"
                    className="h-[52px] text-base"
                    autoComplete="new-password"
                  />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[13px]">
                  <Form.Item
                    name="desa"
                    label={
                      <span className="text-body-sm font-semibold text-deep-slate">
                        Desa
                      </span>
                    }
                    rules={[{ required: true, message: "Pilih desa" }]}
                  >
                    <Select
                      placeholder="Pilih desa"
                      allowClear
                      disabled={desaLoading}
                      className="h-[52px]"
                      suffixIcon={
                        <MapPin size={16} strokeWidth={1.75} className="text-graphite" />
                      }
                    >
                      {dataDesa?.map((value) => (
                        <Select.Option key={value.id} value={value.id}>
                          {value.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="posyandu"
                    label={
                      <span className="text-body-sm font-semibold text-deep-slate">
                        Posyandu
                      </span>
                    }
                    rules={[{ required: true, message: "Pilih posyandu" }]}
                  >
                    <Select
                      placeholder="Pilih posyandu"
                      allowClear
                      disabled={posyanduLoading}
                      className="h-[52px]"
                      suffixIcon={
                        <Home size={16} strokeWidth={1.75} className="text-graphite" />
                      }
                    >
                      {dataPosyandu?.map((value) => (
                        <Select.Option key={value.id} value={value.id}>
                          {value.nama}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  trailingIcon={
                    !loading ? <UserPlus size={20} strokeWidth={2.25} /> : null
                  }
                  className="w-full mt-[8px]"
                >
                  {loading ? "Mendaftarkan..." : "Daftar Akun"}
                </Button>
              </Form>

              <div className="mt-[25px] pt-[21px] border-t border-light-ash">
                <p className="text-body-sm text-graphite">
                  Sudah punya akun?{" "}
                  <Link
                    to="/masuk"
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Masuk sekarang
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Right: Brand panel */}
        <aside className="relative hidden lg:flex flex-col justify-between bg-deep-slate text-white overflow-hidden px-[50px] py-[50px] xl:px-[67px] xl:py-[67px] order-1 lg:order-2">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-[120px] -left-[120px] w-[400px] h-[400px] rounded-full bg-primary-500/30 blur-3xl"
          />

          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-[10px] group">
              <span className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-primary-500 text-white transition-transform group-hover:scale-[1.05] duration-150 ease-out-quart">
                <Heart size={22} strokeWidth={2.25} fill="currentColor" fillOpacity={0.25} />
              </span>
              <span className="flex flex-col leading-[1.1]">
                <span className="text-body-sm font-bold tracking-tight">
                  KMS Digital
                </span>
                <span className="text-caption text-white/60">
                  Posyandu Lebakwangi
                </span>
              </span>
            </Link>
          </div>

          <div className="relative max-w-[520px]">
            <p className="inline-flex items-center gap-[8px] text-caption font-bold uppercase tracking-[0.14em] text-primary-300 mb-[25px]">
              <Sparkles size={14} strokeWidth={2.25} />
              Bergabung Hari Ini
            </p>
            <h2 className="text-display-lg font-bold leading-[1.0] tracking-tight mb-[33px]">
              Mulai perjalanan gizi anak,
              <br />
              <span className="text-primary-300">selangkah lebih ringan.</span>
            </h2>
            <p className="text-body-lg text-white/70 mb-[33px] leading-relaxed">
              Buat akun gratis untuk mencatat pengukuran, terhubung dengan
              kader posyandu, dan mengikuti tumbuh kembang buah hati.
            </p>
            <ul className="space-y-[13px]">
              {BENEFITS.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-[13px] text-body-sm text-white/80"
                >
                  <span className="flex items-center justify-center w-[28px] h-[28px] rounded-full bg-primary-500/30 text-primary-300 shrink-0">
                    <CheckCircle2 size={16} strokeWidth={2.25} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative text-caption text-white/50">
            © {new Date().getFullYear()} Posyandu Lebakwangi
          </div>
        </aside>
      </div>
    </>
  );
}
