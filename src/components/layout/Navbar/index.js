import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Modal, Form, Input, message } from "antd";
import { User, Menu, X, LogOut, Heart, ChevronDown } from "lucide-react";
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
    { to: "/orangtua/forum", label: "Tanya Jawab" },
    { to: "/artikel", label: "Artikel" },
  ],
  TENAGA_KESEHATAN: [
    { to: "/tenkes/forum", label: "Forum" },
    { to: "/artikel", label: "Artikel" },
  ],
  DESA: [
    { to: "/desa/beranda", label: "Beranda" },
  ],
  KADER_POSYANDU: [
    { to: "/kader/balita", label: "Beranda" },
    { to: "/kader/orangtua", label: "Akun Orang Tua" },
    { to: "/kader/laporan", label: "Laporan" },
  ],
};

function roleLabel(role) {
  if (!role) return "Tamu";
  if (role === "ORANG_TUA") return "Orang Tua";
  if (role === "KADER_POSYANDU") return "Kader Posyandu";
  if (role === "TENAGA_KESEHATAN") return "Tenaga Kesehatan";
  if (role === "DESA") return "Pemerintah Desa";
  if (role === "ADMIN") return "Admin";
  return role;
}

function BrandMark({ desaName }) {
  return (
    <Link to="/" className="flex items-center gap-[10px] group">
      <span className="relative flex items-center justify-center w-[40px] h-[40px] rounded-full bg-primary-500 text-white shrink-0 transition-transform duration-150 ease-out-quart group-hover:scale-[1.05]">
        <Heart size={20} strokeWidth={2.25} fill="currentColor" fillOpacity={0.2} />
      </span>
      <span className="flex flex-col leading-[1.1]">
        <span className="text-body-sm font-bold text-deep-slate tracking-tight">
          KMS Digital
        </span>
        <span className="text-caption text-graphite">
          {desaName ? `Posyandu ${desaName}` : "Posyandu Lebakwangi"}
        </span>
      </span>
    </Link>
  );
}

function NavLink({ to, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative px-[13px] py-[8px] text-body-sm font-medium transition-colors ${
        active ? "text-deep-slate" : "text-graphite hover:text-deep-slate"
      }`}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={`absolute left-[13px] right-[13px] -bottom-[14px] h-[3px] rounded-t-full bg-primary-500 transition-opacity duration-150 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
    </Link>
  );
}

export default function NavbarComp({ isLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const user = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const initials =
    displayName
      ?.split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  return (
    <>
      {contextHolder}
      <nav
        className={`sticky top-0 z-40 bg-white border-b transition-all duration-200 ${
          scrolled
            ? "border-light-ash shadow-card"
            : "border-transparent"
        }`}
      >
        <div className="max-w-page mx-auto px-[17px] md:px-[25px]">
          <div className="flex items-center justify-between gap-[17px] h-[72px]">
            <BrandMark desaName={user?.user?.desa_name} />

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-[44px] h-[44px] rounded-default text-deep-slate hover:bg-faint-fog transition-colors"
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={22} strokeWidth={2} />
              ) : (
                <Menu size={22} strokeWidth={2} />
              )}
            </button>

            <div className="hidden md:flex items-center gap-[8px] flex-1 justify-center">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  active={isActive(link.to)}
                />
              ))}
            </div>

            <div className="hidden md:flex items-center gap-[13px]">
              {isLogin ? (
                <>
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="flex items-center gap-[10px] pl-[8px] pr-[13px] py-[6px] rounded-full border border-light-ash hover:bg-faint-fog hover:border-primary-300 transition-all duration-150"
                  >
                    <Avatar
                      size={32}
                      className="!bg-primary-500 !text-white font-semibold"
                    >
                      {initials}
                    </Avatar>
                    <span className="text-left leading-tight">
                      <span className="block text-body-sm font-semibold text-deep-slate truncate max-w-[140px]">
                        {displayName}
                      </span>
                      <span className="block text-caption text-graphite">
                        {roleLabel(user?.user?.role)}
                      </span>
                    </span>
                    <ChevronDown size={14} strokeWidth={2} className="text-graphite" />
                  </button>
                  <Button
                    variant="default"
                    size="sm"
                    leadingIcon={<LogOut size={16} strokeWidth={1.75} />}
                    onClick={handleLogout}
                  >
                    Keluar
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/masuk"
                    className="text-body-sm font-semibold text-deep-slate hover:text-primary-600 transition-colors px-[8px]"
                  >
                    Masuk
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate("/sign-up")}
                  >
                    Daftar Sekarang
                  </Button>
                </>
              )}
            </div>
          </div>

          {mobileOpen && (
            <div className="md:hidden pb-[21px] space-y-[4px] border-t border-light-ash pt-[13px]">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-[17px] py-[13px] rounded-default text-body-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? "bg-primary-50 text-primary-700 font-semibold"
                      : "text-deep-slate hover:bg-faint-fog"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive(link.to) && (
                    <span className="w-[6px] h-[6px] rounded-full bg-primary-500" />
                  )}
                </Link>
              ))}

              <div className="pt-[13px] mt-[8px] border-t border-light-ash">
                {isLogin ? (
                  <div className="space-y-[8px]">
                    <button
                      type="button"
                      onClick={() => {
                        handleProfileClick();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-[13px] w-full px-[13px] py-[10px] rounded-default text-body-sm font-medium text-deep-slate hover:bg-faint-fog transition-colors"
                    >
                      <Avatar
                        size={36}
                        className="!bg-primary-500 !text-white font-semibold"
                      >
                        {initials}
                      </Avatar>
                      <span className="flex-1 text-left leading-tight">
                        <span className="block font-semibold text-deep-slate">
                          {displayName}
                        </span>
                        <span className="block text-caption text-graphite">
                          {roleLabel(user?.user?.role)}
                        </span>
                      </span>
                    </button>
                    <Button
                      variant="default"
                      size="md"
                      className="w-full"
                      leadingIcon={<LogOut size={18} strokeWidth={1.75} />}
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                    >
                      Keluar
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-[8px]">
                    <Button
                      variant="default"
                      size="md"
                      className="w-full"
                      onClick={() => {
                        navigate("/masuk");
                        setMobileOpen(false);
                      }}
                    >
                      Masuk
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      onClick={() => {
                        navigate("/sign-up");
                        setMobileOpen(false);
                      }}
                    >
                      Daftar Sekarang
                    </Button>
                  </div>
                )}
              </div>
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
