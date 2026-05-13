import { Form, Input, message, Select, Spin } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Button from "../../components/ui/Button";
import { readSession } from "../../features/auth/session-storage";
import { ROLE_HOME } from "../../features/auth/roleHome";

import logo from "./GiziBalita_logo.png";

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

  return (
    <>
      {contextHolder}

      {(authLoading || desaLoading || posyanduLoading) && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/95 p-[25px] rounded-default border border-light-ash">
          <Spin size="large" />
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center bg-faint-fog p-[17px]">
        <div className="w-full max-w-[480px] bg-white rounded-default border border-light-ash p-[29px] md:p-[38px]">
          <div className="flex flex-col items-center mb-[25px]">
            <img src={logo} alt="KMS Digital" className="w-[120px] mb-[13px]" />
            <h1 className="text-heading-lg font-bold text-deep-slate">
              Buat Akun Baru
            </h1>
            <p className="text-body-sm text-graphite mt-1 text-center">
              Daftar untuk mulai menggunakan KMS Digital.
            </p>
          </div>

          <Form
            name="signup"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label={<span className="text-body-sm font-medium text-deep-slate">Peran</span>}
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
              label={<span className="text-body-sm font-medium text-deep-slate">Nama</span>}
              name="nama"
              rules={[{ required: true, message: "Nama masih kosong" }]}
            >
              <Input placeholder="Nama Lengkap" className="h-[52px] text-base" />
            </Form.Item>

            {role === 3 && (
              <Form.Item
                label={
                  <span className="text-body-sm font-medium text-deep-slate">Alamat</span>
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
              label={<span className="text-body-sm font-medium text-deep-slate">Email</span>}
              name="email"
              rules={[
                { required: true, message: "Email masih kosong" },
                { type: "email", message: "Format email tidak valid" },
              ]}
            >
              <Input placeholder="email@contoh.com" className="h-[52px] text-base" />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-body-sm font-medium text-deep-slate">Kata Sandi</span>
              }
              name="password"
              rules={[
                { required: true, message: "Kata sandi masih kosong" },
                { pattern: "^.{8,}$", message: "Minimal 8 karakter" },
              ]}
            >
              <Input.Password
                placeholder="Minimal 8 karakter"
                className="h-[52px] text-base"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-body-sm font-medium text-deep-slate">
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
                className="h-[52px] text-base"
              />
            </Form.Item>

            <Form.Item
              name="desa"
              label={<span className="text-body-sm font-medium text-deep-slate">Desa</span>}
              rules={[{ required: true, message: "Pilih desa" }]}
            >
              <Select
                placeholder="Pilih desa"
                allowClear
                disabled={desaLoading}
                className="h-[52px]"
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
                <span className="text-body-sm font-medium text-deep-slate">Posyandu</span>
              }
              rules={[{ required: true, message: "Pilih posyandu" }]}
            >
              <Select
                placeholder="Pilih posyandu"
                allowClear
                disabled={posyanduLoading}
                className="h-[52px]"
              >
                {dataPosyandu?.map((value) => (
                  <Select.Option key={value.id} value={value.id}>
                    {value.nama}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Memuat..." : "Daftar"}
            </Button>
          </Form>

          <p className="text-center mt-[17px] text-body-sm text-graphite">
            Sudah punya akun?{" "}
            <Link
              to="/masuk"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
