import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Tooltip } from "antd";
import { LogOut, Lock, X, Heart, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Modal, Form, Input, message } from "antd";
import { sidebarlink } from "./sidebarLinks";
import DropdownLink from "./DropdownLink";
import Button from "../../ui/Button";
import {
  readSession,
  clearSession,
  writeSession,
} from "../../../features/auth/session-storage";
import { useSidebarCollapsed } from "../../../hook/useSidebarCollapsed";

function isLinkActive(pathname, link) {
  const basePath = "/admin/dashboard";
  const target = link.path ? basePath + "/" + link.path : basePath;
  if (link.exact) return pathname === target || pathname === target + "/";
  return pathname.startsWith(target + "/") || pathname === target;
}

export default function Sidebar({ showSidebar, closeSidebar }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState(() => readSession() ?? {});
  const { collapsed, toggle } = useSidebarCollapsed();

  useEffect(() => {
    if (isProfileModalOpen && user?.token?.value) {
      axios
        .get(process.env.REACT_APP_BASE_URL + "/api/profile", {
          headers: { Authorization: "Bearer " + user.token.value },
        })
        .then((response) => {
          form.setFieldsValue({ nama: response.data.data.user.name });
        })
        .catch((err) => {
          messageApi.error(
            err.response?.data?.message || "Gagal mengambil profil"
          );
        });
    }
  }, [isProfileModalOpen, user?.token?.value, form, messageApi]);

  const handleUpdateProfile = () => {
    form
      .validateFields()
      .then((values) => {
        axios
          .put(process.env.REACT_APP_BASE_URL + "/api/profile", values, {
            headers: {
              Authorization: "Bearer " + user.token.value,
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            messageApi.success("Profil berhasil diperbarui");
            const updatedUser = {
              ...user,
              user: { ...user.user, name: response.data.data.user.name },
            };
            writeSession(updatedUser);
            setUser(updatedUser);
            form.resetFields();
            setIsProfileModalOpen(false);
          })
          .catch((err) => {
            messageApi.error(
              err.response?.data?.message || "Gagal memperbarui profil"
            );
          });
      })
      .catch(() => {});
  };

  const handleLogout = () => {
    Modal.confirm({
      title: "Keluar dari akun?",
      content: "Anda perlu masuk kembali untuk menggunakan aplikasi.",
      okText: "Ya, Keluar",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: () => {
        clearSession();
        messageApi.success("Berhasil logout");
        navigate("/masuk", { replace: true });
      },
    });
  };

  const width = collapsed ? "w-[64px]" : "w-60";

  return (
    <>
      {contextHolder}
      <aside
        className={
          "fixed inset-y-0 left-0 z-40 bg-white border-r border-light-ash transform transition-all duration-250 ease-out-quart " +
          width +
          " " +
          (showSidebar ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* Header */}
        <div
          className={
            "flex items-center border-b border-light-ash " +
            (collapsed ? "px-[8px] py-[17px] justify-center" : "px-[21px] py-[21px] justify-between")
          }
        >
          {collapsed ? (
            <Link to="/admin/dashboard" className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-primary-500 text-white">
              <Heart size={20} strokeWidth={2.25} fill="currentColor" fillOpacity={0.25} />
            </Link>
          ) : (
            <Link to="/admin/dashboard" className="min-w-0 flex items-center gap-[10px]">
              <span className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-primary-500 text-white shrink-0">
                <Heart size={20} strokeWidth={2.25} fill="currentColor" fillOpacity={0.25} />
              </span>
              <span className="flex flex-col leading-[1.1] min-w-0">
                <span className="text-body-sm font-bold text-deep-slate truncate">
                  KMS Digital
                </span>
                <span className="text-caption text-graphite truncate">
                  {user?.user?.name ?? "Admin"}
                </span>
              </span>
            </Link>
          )}

          {!collapsed && (
            <button
              onClick={closeSidebar}
              className="md:hidden p-2 rounded-default text-graphite hover:bg-faint-fog transition-colors"
              aria-label="Tutup sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <div className={"hidden md:flex " + (collapsed ? "justify-center py-[13px]" : "justify-end px-[13px] py-[13px]")}>
          <Tooltip title={collapsed ? "Buka sidebar" : "Ciutkan sidebar"} placement="right">
            <button
              type="button"
              onClick={toggle}
              className="flex items-center justify-center w-[36px] h-[36px] rounded-default text-graphite hover:bg-faint-fog hover:text-deep-slate transition-colors"
              aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} strokeWidth={1.75} />
              ) : (
                <PanelLeftClose size={18} strokeWidth={1.75} />
              )}
            </button>
          </Tooltip>
        </div>

        {/* Nav */}
        <nav
          className={
            "overflow-y-auto max-h-[calc(100vh-240px)] " +
            (collapsed ? "px-[8px] py-[13px] space-y-[17px]" : "px-[13px] py-[13px] space-y-[25px]")
          }
        >
          {sidebarlink.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="text-caption font-bold text-graphite px-[13px] mb-[8px] uppercase tracking-[0.12em]">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.links.map((link) => {
                  if (link.dropdown) {
                    return !collapsed ? (
                      <DropdownLink
                        key={link.title}
                        pathname={pathname}
                        basepath={link.basepath}
                        icon={<link.icon size={20} strokeWidth={1.75} />}
                        title={link.title}
                        dropdown={link.dropdown}
                      />
                    ) : null;
                  }

                  const active = isLinkActive(pathname, link);
                  const target = link.path ? "/admin/dashboard/" + link.path : "/admin/dashboard";
                  const iconEl = (
                    <link.icon
                      size={20}
                      strokeWidth={active ? 2.25 : 1.75}
                      className={active ? "text-primary-600" : "text-graphite"}
                    />
                  );
                  const classes =
                    "flex items-center gap-3 h-[50px] rounded-default text-body-sm transition-colors duration-150 ease-out-quart " +
                    (collapsed ? "justify-center px-0 " : "px-[13px] ") +
                    (active
                      ? "bg-primary-50 text-primary-700 font-bold"
                      : "text-deep-slate font-medium hover:bg-faint-fog");

                  if (collapsed) {
                    return (
                      <Tooltip key={link.path} title={link.title} placement="right">
                        <Link to={target} className={classes}>
                          {iconEl}
                        </Link>
                      </Tooltip>
                    );
                  }

                  return (
                    <Link key={link.path} to={target} className={classes}>
                      {iconEl}
                      {link.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div
          className={
            "absolute bottom-0 inset-x-0 border-t border-light-ash bg-white space-y-1 " +
            (collapsed ? "px-[8px] py-[13px]" : "px-[13px] py-[17px]")
          }
        >
          {collapsed ? (
            <>
              <Tooltip title="Ubah Kata Sandi" placement="right">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center justify-center w-full h-[48px] rounded-default text-deep-slate hover:bg-faint-fog transition-colors"
                  aria-label="Ubah Kata Sandi"
                >
                  <Lock size={20} strokeWidth={1.75} />
                </button>
              </Tooltip>
              <Tooltip title="Keluar" placement="right">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full h-[48px] rounded-default text-danger hover:bg-danger/10 transition-colors"
                  aria-label="Keluar"
                >
                  <LogOut size={20} strokeWidth={1.75} />
                </button>
              </Tooltip>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-3 h-[50px] w-full px-[13px] rounded-default text-body-sm text-deep-slate hover:bg-faint-fog transition-colors"
              >
                <Lock size={20} strokeWidth={1.75} className="text-graphite" />
                Ubah Kata Sandi
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 h-[50px] w-full px-[13px] rounded-default text-body-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut size={20} strokeWidth={1.75} />
                Keluar
              </button>
            </>
          )}
        </div>
      </aside>

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
            >
              Batal
            </Button>
            <Button variant="primary" size="md" onClick={handleUpdateProfile}>
              Simpan
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Nama</span>}
            name="nama"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input disabled className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Kata Sandi Baru</span>}
            name="password"
            rules={[{ min: 8, message: "Minimal 8 karakter" }]}
          >
            <Input.Password className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Konfirmasi Kata Sandi</span>}
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
            <Input.Password className="h-[52px] text-base" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
