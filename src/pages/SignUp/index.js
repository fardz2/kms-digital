import { Form, Input, message, Select, Spin } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { readSession } from "../../features/auth/session-storage";
import { ROLE_HOME } from "../../features/auth/roleHome";

import logo from "./GiziBalita_logo.png";
import background from "./login_bg.svg";

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
        messageApi.open({
          type: "info",
          content: "Anda sudah login. Mengarahkan ke dashboard...",
        });
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
      if (!response.ok) throw new Error("Failed to fetch desa data");
      const data = await response.json();
      return data.data;
    },
    onError: (error) => {
      console.error("Error fetching desa:", error);
      messageApi.open({ type: "error", content: "Gagal memuat data desa" });
    },
  });

  const { data: dataPosyandu, isLoading: posyanduLoading } = useQuery({
    queryKey: ["posyandu"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu`
      );
      if (!response.ok) throw new Error("Failed to fetch posyandu data");
      const data = await response.json();
      return data.data;
    },
    onError: (error) => {
      console.error("Error fetching posyandu:", error);
      messageApi.open({ type: "error", content: "Gagal memuat data posyandu" });
    },
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
      messageApi.open({ type: "success", content: "Register Berhasil" });
      setTimeout(() => navigate("/masuk"), 1000);
    },
    onError: (error) => {
      messageApi.open({
        type: "error",
        content: error.message || "Gagal Registrasi",
      });
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
      messageApi.open({ type: "success", content: "Register Berhasil" });
      setTimeout(() => navigate("/masuk"), 1000);
    },
    onError: (error) => {
      messageApi.open({
        type: "error",
        content: error.message || "Gagal Registrasi",
      });
    },
  });

  const onFinish = (values) => {
    if (role === 4) posyanduRegisterMutation.mutate(values);
    else if (role === 3) orangTuaRegisterMutation.mutate(values);
  };

  const loading =
    posyanduRegisterMutation.isPending || orangTuaRegisterMutation.isPending;

  return (
    <>
      {contextHolder}
      <div
        className="fixed inset-0 -z-10 bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${background})` }}
      />

      {(authLoading || desaLoading || posyanduLoading) && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 p-8 rounded-card shadow-card">
          <Spin size="large" />
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-card shadow-hero p-6 md:p-8">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="KMS Digital" className="w-32 md:w-40 mb-3" />
            <h1 className="text-h2 font-display text-neutral-900">
              Buat Akun Baru
            </h1>
          </div>

          <Form
            name="signup"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label={<span className="text-caption text-neutral-700">Peran</span>}
              name="role"
              initialValue={role}
              rules={[{ required: true, message: "Pilih peran" }]}
            >
              <Select
                placeholder="Pilih peran"
                onChange={(value) => setRole(value)}
                className="h-11"
              >
                <Select.Option value={3}>Orang Tua</Select.Option>
                <Select.Option value={4}>Kader Posyandu</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="text-caption text-neutral-700">Nama</span>}
              name="nama"
              rules={[{ required: true, message: "Nama masih kosong" }]}
            >
              <Input placeholder="Nama Lengkap" className="h-11 text-base" />
            </Form.Item>

            {role === 3 && (
              <Form.Item
                label={
                  <span className="text-caption text-neutral-700">Alamat</span>
                }
                name="alamat"
                rules={[{ required: true, message: "Alamat masih kosong" }]}
              >
                <Input.TextArea rows={3} className="text-base" />
              </Form.Item>
            )}

            <Form.Item
              label={<span className="text-caption text-neutral-700">Email</span>}
              name="email"
              rules={[
                { required: true, message: "Email masih kosong" },
                { type: "email", message: "Format email tidak valid" },
              ]}
            >
              <Input placeholder="email@contoh.com" className="h-11 text-base" />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-caption text-neutral-700">Kata Sandi</span>
              }
              name="password"
              rules={[
                { required: true, message: "Kata sandi masih kosong" },
                { pattern: "^.{8,}$", message: "Minimal 8 karakter" },
              ]}
            >
              <Input.Password placeholder="Kata sandi" className="h-11 text-base" />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-caption text-neutral-700">
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
                placeholder="Ulangi kata sandi"
                className="h-11 text-base"
              />
            </Form.Item>

            <Form.Item
              name="desa"
              label={<span className="text-caption text-neutral-700">Desa</span>}
              rules={[{ required: true, message: "Pilih desa" }]}
            >
              <Select
                placeholder="Pilih desa"
                allowClear
                disabled={desaLoading}
                className="h-11"
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
                <span className="text-caption text-neutral-700">Posyandu</span>
              }
              rules={[{ required: true, message: "Pilih posyandu" }]}
            >
              <Select
                placeholder="Pilih posyandu"
                allowClear
                disabled={posyanduLoading}
                className="h-11"
              >
                {dataPosyandu?.map((value) => (
                  <Select.Option key={value.id} value={value.id}>
                    {value.nama}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 min-h-[3.5rem] rounded-button bg-primary hover:bg-primary-600 active:bg-primary-700 text-white font-display font-semibold text-body-lg shadow-raised active:scale-[0.98] transition-all duration-150 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Memuat..." : "Daftar"}
            </button>
          </Form>

          <p className="text-center mt-4 text-base text-neutral-700">
            Sudah punya akun?{" "}
            <Link
              to="/masuk"
              className="text-primary-700 hover:text-primary-800 font-medium"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
