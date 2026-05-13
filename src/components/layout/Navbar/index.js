import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Modal, Form, Input, message } from "antd";
import { User, Menu, X, LogOut } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../hook/useAuth";
import Button from "../../ui/Button";
import {
  clearSession,
  readSession,
  writeSession,
} from "../../../features/auth/session-storage";

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

function roleLabel(role) {
  if (!role) return "Tamu";
  if (role === "ORANG_TUA") return "Orang Tua";
  if (role === "KADER_POSYANDU") return "Kader Posyandu";
  if (role === "TENAGA_KESEHATAN") return "Tenaga Kesehatan";
  if (role === "DESA") return "Desa";
  if (role === "ADMIN") return "Admin";
  return role;
}

export default function NavbarComp({ isLogin }) {
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

  const {
    data: profileData,
    isLoading: isProfileLoading,
    refetch,
  } = useQuery({
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
    onError: (err) =>
      messageApi.error(err.message || "Gagal memperbarui profil"),
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

  const navLinks =
    isLogin && user?.user?.role ? LINKS_BY_ROLE[user.user.role] ?? [] : [];
  const isActive = (to) => location.pathname.startsWith(to);

  const displayName =
    profileData?.data?.user?.name ?? user?.user?.name ?? "User";

  return (
    <>
      {contextHolder}
      <nav className="sticky top-0 z-40 bg-white border-b border-light-ash">
        <div className="max-w-page mx-auto px-[17px] md:px-[25px]">
          <div className="flex items-center justify-between gap-[17px] h-[76px]">
            <Link
              to="/"
              className="font-bold text-heading text-deep-slate flex items-center gap-2"
            >
              KMS Digital
              {user?.user?.desa_name && (
                <span className="text-body-sm font-medium text-primary-600">
                  · {user.user.desa_name}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-[13px] rounded-default text-deep-slate hover:bg-faint-fog transition-colors"
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={20} strokeWidth={1.75} />
              ) : (
                <Menu size={20} strokeWidth={1.75} />
              )}
            </button>

            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {!isLogin && (
                <Link
                  to="/"
                  className="px-[17px] py-[8px] rounded-default text-body-sm font-medium text-deep-slate hover:bg-faint-fog transition-colors"
                >
                  Beranda
                </Link>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-[17px] py-[8px] rounded-default text-body-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? "bg-polar-mist text-deep-slate font-semibold"
                      : "text-deep-slate hover:bg-faint-fog"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-[13px]">
              {isLogin ? (
                <>
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="flex items-center gap-[8px] p-[6px] rounded-full hover:bg-faint-fog transition-colors"
                  >
                    <div className="text-right leading-tight">
                      <div className="text-body-sm font-semibold text-deep-slate">
                        {displayName}
                      </div>
                      <div className="text-caption text-graphite">
                        {roleLabel(user?.user?.role)}
                      </div>
                    </div>
                    <Avatar
                      icon={<User size={16} strokeWidth={1.75} />}
                      className="bg-polar-mist text-deep-slate"
                    />
                  </button>
                  <Button
                    variant="dark"
                    size="sm"
                    leadingIcon={<LogOut size={16} strokeWidth={1.75} />}
                    onClick={handleLogout}
                  >
                    Keluar
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/masuk")}
                >
                  Masuk
                </Button>
              )}
            </div>
          </div>

          {mobileOpen && (
            <div className="md:hidden pb-[17px] space-y-1 border-t border-light-ash pt-[13px]">
              {!isLogin && (
                <Link
                  to="/"
                  className="block px-[17px] py-[13px] rounded-default text-body-sm font-medium text-deep-slate hover:bg-faint-fog transition-colors"
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
                  className={`block px-[17px] py-[13px] rounded-default text-body-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? "bg-polar-mist text-deep-slate font-semibold"
                      : "text-deep-slate hover:bg-faint-fog"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isLogin ? (
                <div className="flex gap-[8px] pt-[13px]">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      handleProfileClick();
                      setMobileOpen(false);
                    }}
                  >
                    Profil
                  </Button>
                  <Button
                    variant="dark"
                    size="sm"
                    className="flex-1"
                    leadingIcon={<LogOut size={16} strokeWidth={1.75} />}
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                  >
                    Keluar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    navigate("/masuk");
                    setMobileOpen(false);
                  }}
                >
                  Masuk
                </Button>
              )}
            </div>
          )}
        </div>
      </nav>

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
              disabled={updateProfileMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleUpdateProfile}
              disabled={updateProfileMutation.isPending || isProfileLoading}
            >
              {updateProfileMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" name="profile_form">
          <Form.Item
            label={
              <span className="text-body-sm font-medium text-deep-slate">
                Nama
              </span>
            }
            name="nama"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input disabled={isProfileLoading} className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-body-sm font-medium text-deep-slate">
                Kata Sandi Baru
              </span>
            }
            name="password"
            rules={[{ min: 8, message: "Minimal 8 karakter" }]}
          >
            <Input.Password
              placeholder="Kosongkan jika tidak diubah"
              className="h-[52px] text-base"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-body-sm font-medium text-deep-slate">
                Konfirmasi Kata Sandi
              </span>
            }
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
            <Input.Password
              placeholder="Ulangi kata sandi"
              className="h-[52px] text-base"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
