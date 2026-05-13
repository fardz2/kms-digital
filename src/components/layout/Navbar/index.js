import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Modal, Form, Input, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../hook/useAuth";
import { clearSession, readSession, writeSession } from "../../../features/auth/session-storage";

const LINKS_BY_ROLE = {
  ORANG_TUA: [
    { to: "/orangtua/balita", label: "Beranda" },
    { to: "/artikel", label: "Artikel" },
    { to: "/orangtua/forum", label: "Tanya Jawab" },
  ],
  TENAGA_KESEHATAN: [
    { to: "/tenkes/beranda", label: "Beranda" },
    { to: "/tenkes/forum", label: "Forum" },
    { to: "/artikel", label: "Artikel" },
  ],
  DESA: [
    { to: "/desa/beranda", label: "Beranda" },
    { to: "/desa/acara", label: "Kelola Acara" },
  ],
  KADER_POSYANDU: [
    { to: "/kader/balita", label: "Beranda" },
    { to: "/kader/laporan", label: "Laporan" },
  ],
};

function RoleLabel({ role }) {
  if (!role) return "Tamu";
  if (role === "ORANG_TUA") return "Orang Tua";
  if (role === "KADER_POSYANDU") return "Kader Posyandu";
  if (role === "TENAGA_KESEHATAN") return "Tenaga Kesehatan";
  if (role === "DESA") return "Desa";
  if (role === "ADMIN") return "Admin";
  return role;
}

export default function NavbarComp(props) {
  const { isLogin } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const user = useAuth();

  useEffect(() => {
    if (user?.user?.name) form.setFieldsValue({ nama: user.user.name });
  }, [user?.user?.name, form]);

  const { data: profileData, isLoading: isProfileLoading, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (user?.user?.role === "ADMIN") return null;
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/profile`,
        {
          headers: {
            Authorization: `Bearer ${user?.token?.value}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil profil");
      return response.json();
    },
    enabled: !!user?.token?.value && user?.user?.role !== "ADMIN",
    onError: (err) => messageApi.error(err.message || "Gagal mengambil profil"),
  });

  useEffect(() => {
    if (isProfileModalOpen) {
      refetch();
      form.setFieldsValue({ nama: user?.user?.name || "User" });
    }
  }, [isProfileModalOpen, refetch, form, user?.user?.name]);

  const updateProfileMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user?.token?.value}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      if (!response.ok) throw new Error("Gagal memperbarui profil");
      return response.json();
    },
    onSuccess: (response) => {
      messageApi.success("Profil berhasil diperbarui");
      const currentSession = readSession();
      if (currentSession) {
        writeSession({
          ...currentSession,
          user: { ...currentSession.user, name: response.data.user.name },
        });
      }
      queryClient.invalidateQueries(["profile"]);
      form.resetFields();
      setIsProfileModalOpen(false);
    },
    onError: (err) => messageApi.error(err.message || "Gagal memperbarui profil"),
  });

  const handleLogout = () => {
    clearSession();
    messageApi.success("Berhasil logout");
    navigate("/");
  };

  const handleProfileClick = () => {
    if (user?.user?.role !== "ADMIN") setIsProfileModalOpen(true);
  };

  const handleUpdateProfile = () => {
    form
      .validateFields()
      .then((values) => updateProfileMutation.mutate(values))
      .catch(() => {});
  };

  const navLinks = isLogin && user?.user?.role ? LINKS_BY_ROLE[user.user.role] ?? [] : [];
  const isActive = (to) => location.pathname.startsWith(to);

  const displayName = profileData?.data?.user?.name ?? user?.user?.name ?? "User";

  return (
    <>
      {contextHolder}
      <nav className="sticky top-0 z-40 bg-primary-300 text-white shadow-card">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-4 h-16">
            <Link to="/" className="font-display font-bold text-body-lg md:text-h3">
              KMS Digital
              {user?.user?.desa_name && (
                <span className="ml-2 text-primary-700 font-bold">
                  {user.user.desa_name}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-button hover:bg-white/20 transition-colors"
              aria-label="Buka menu"
              aria-expanded={mobileOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>

            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {!isLogin && (
                <>
                  <Link to="/" className="px-3 py-2 rounded-button text-white/90 hover:bg-white/10 hover:text-white font-medium transition-colors">
                    Beranda
                  </Link>
                </>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-button font-medium transition-colors ${
                    isActive(link.to)
                      ? "bg-white/20 text-white"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isLogin ? (
                <>
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 p-1.5 rounded-button hover:bg-white/10 transition-colors"
                  >
                    <div className="text-right leading-tight">
                      <div className="text-caption font-semibold">{displayName}</div>
                      <div className="text-xs opacity-80">
                        <RoleLabel role={user?.user?.role} />
                      </div>
                    </div>
                    <Avatar icon={<UserOutlined />} className="bg-primary-500" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-button bg-primary-500 hover:bg-primary-600 text-white font-display font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  to="/masuk"
                  className="px-4 py-2 rounded-button bg-white hover:bg-neutral-50 text-primary-700 font-display font-semibold text-sm transition-colors"
                >
                  Masuk
                </Link>
              )}
            </div>
          </div>

          {mobileOpen && (
            <div className="md:hidden pb-4 space-y-1 border-t border-white/20 pt-2">
              {!isLogin && (
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-button text-white/90 hover:bg-white/10 hover:text-white font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Beranda
                </Link>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-button font-medium ${
                    isActive(link.to)
                      ? "bg-white/20 text-white"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isLogin ? (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleProfileClick();
                      setMobileOpen(false);
                    }}
                    className="flex-1 px-4 py-2 rounded-button bg-white/20 hover:bg-white/30 text-white font-medium"
                  >
                    Profil
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="flex-1 px-4 py-2 rounded-button bg-primary-500 hover:bg-primary-600 text-white font-medium"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <Link
                  to="/masuk"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 rounded-button bg-white text-primary-700 font-display font-semibold text-center"
                >
                  Masuk
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      <Modal
        title={<span className="text-h3 font-display text-neutral-900">Profil Pengguna</span>}
        open={isProfileModalOpen}
        onCancel={() => {
          form.resetFields();
          setIsProfileModalOpen(false);
        }}
        footer={
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                form.resetFields();
                setIsProfileModalOpen(false);
              }}
              disabled={updateProfileMutation.isPending}
              className="px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold disabled:opacity-60"
            >
              Batal
            </button>
            <button
              onClick={handleUpdateProfile}
              disabled={updateProfileMutation.isPending || isProfileLoading}
              className="px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm disabled:opacity-60"
            >
              {updateProfileMutation.isPending ? "Menyimpan..." : "Update"}
            </button>
          </div>
        }
      >
        <Form form={form} layout="vertical" name="profile_form">
          <Form.Item
            label={<span className="text-caption text-neutral-700">Nama</span>}
            name="nama"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input disabled={isProfileLoading} className="h-11 text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-caption text-neutral-700">Kata Sandi Baru</span>}
            name="password"
            rules={[{ min: 8, message: "Minimal 8 karakter" }]}
          >
            <Input.Password className="h-11 text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-caption text-neutral-700">Konfirmasi Kata Sandi</span>}
            name="password_confirmation"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) return Promise.resolve();
                  return Promise.reject(new Error("Kata sandi tidak cocok"));
                },
              }),
            ]}
          >
            <Input.Password className="h-11 text-base" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
