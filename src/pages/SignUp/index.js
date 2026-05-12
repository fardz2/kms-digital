import { Form, Input, message, Select, Spin } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { readSession } from "../../features/auth/session-storage";
import { ROLE_HOME } from "../../features/auth/roleHome";

import logo from "./GiziBalita_logo.png";
import background from "./login_bg.svg";

const BackgroundComponent = () => (
  <div
    className="fixed inset-0 z-[-10000] bg-center bg-no-repeat bg-cover "
    style={{ backgroundImage: `url(${background})` }}
  />
);

export default function SignUp() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [role, setRole] = useState(3);

  // Check authentication status using useQuery
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

  // Fetch desa data using useQuery
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
      messageApi.open({
        type: "error",
        content: "Gagal memuat data desa",
      });
    },
  });

  // Fetch posyandu data using useQuery
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
      messageApi.open({
        type: "error",
        content: "Gagal memuat data posyandu",
      });
    },
  });

  // Register mutation for Kader Posyandu
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
      messageApi.open({
        type: "success",
        content: "Register Berhasil",
      });
      setTimeout(() => {
        navigate("/sign-in");
      }, 1000);
    },
    onError: (error) => {
      console.error("Registration error:", error);
      messageApi.open({
        type: "error",
        content: error.message || "Gagal Registrasi",
      });
    },
  });

  // Register mutation for Orang Tua
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
      messageApi.open({
        type: "success",
        content: "Register Berhasil",
      });
      setTimeout(() => {
        navigate("/sign-in");
      }, 1000);
    },
    onError: (error) => {
      console.error("Registration error:", error);
      messageApi.open({
        type: "error",
        content: error.message || "Gagal Registrasi",
      });
    },
  });

  const onFinish = (values) => {
    if (role === 4) {
      posyanduRegisterMutation.mutate(values);
    } else if (role === 3) {
      orangTuaRegisterMutation.mutate(values);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      {contextHolder}
      <BackgroundComponent />
      {(authLoading || desaLoading || posyanduLoading) && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/80 p-8 rounded-lg">
          <Spin size="large" />
        </div>
      )}
      <div
        className="flex items-center justify-center min-h-screen p-2 sm:p-4"
        style={{ background: "transparent" }}
      >
        <div
          className="w-full max-w-sm sm:max-w-md rounded-[20px] p-4 sm:p-6"
          style={{
            background:
              "linear-gradient(137deg, #FFF 0%, rgba(255, 255, 255, 0.00) 100%)",
            boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex flex-col items-center">
            <img
              src={logo}
              alt="Image"
              className="w-32 sm:w-40 md:w-48 mb-2"
              style={{ height: "auto" }}
            />
            <Form
              name="basic"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              layout="vertical"
              className="w-full"
            >
              <Form.Item
                label="Role"
                name="role"
                initialValue={role}
                rules={[{ required: true, message: "Pilih role!" }]}
              >
                <Select
                  placeholder="Pilih Role"
                  onChange={(value) => setRole(value)}
                >
                  <Select.Option value={3}>Orang Tua</Select.Option>
                  <Select.Option value={4}>Kader Posyandu</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Nama"
                name="nama"
                rules={[
                  {
                    required: true,
                    message: "Nama masih kosong!",
                    type: "string",
                  },
                ]}
              >
                <Input placeholder="Nama Lengkap" />
              </Form.Item>

              {role === 3 && (
                <Form.Item
                  label="Alamat"
                  name="alamat"
                  rules={[
                    {
                      required: true,
                      message: "Alamat masih kosong!",
                      type: "string",
                    },
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              )}

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email masih kosong!" },
                  { type: "email", message: "Email belum sesuai!" },
                ]}
              >
                <Input placeholder="user@email.com" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Password masih kosong!" },
                  {
                    pattern: "^.{8,}$",
                    message: "Password minimal 8 karakter",
                  },
                ]}
              >
                <Input.Password placeholder="password" />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirm"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: "Silahkan Confirm Password Anda!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Password tidak sesuai!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm Password" />
              </Form.Item>

              <Form.Item
                name="desa"
                label="Desa"
                rules={[{ required: true, message: "Pilih Desa!" }]}
              >
                <Select
                  placeholder="Pilih Desa"
                  allowClear
                  disabled={desaLoading}
                >
                  {dataDesa &&
                    dataDesa.map((value) => (
                      <Select.Option key={value.id} value={value.id}>
                        {value.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="posyandu"
                label="Posyandu"
                rules={[{ required: true, message: "Pilih Posyandu!" }]}
              >
                <Select
                  placeholder="Pilih Posyandu"
                  allowClear
                  disabled={posyanduLoading}
                >
                  {dataPosyandu &&
                    dataPosyandu.map((value) => (
                      <Select.Option key={value.id} value={value.id}>
                        {value.nama}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <button
                  htmlType="submit"
                  className="button__"
                  style={{
                    fontSize: "22px",
                    height: 50,
                    borderRadius: "20px",
                    marginBottom: "20px",
                    width: "100%",
                  }}
                  disabled={
                    posyanduRegisterMutation.isPending ||
                    orangTuaRegisterMutation.isPending
                  }
                >
                  Daftar
                </button>
              </Form.Item>
            </Form>
            <p className="text-center">
              Sudah punya akun? <Link to="/sign-in">Masuk</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
