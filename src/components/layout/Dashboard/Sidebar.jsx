import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { sidebarlink } from "./sidebarLinks";
import DropdownLink from "./DropdownLink";
import { LogOut, Lock, X } from "lucide-react";
import { Modal, Form, Input, message } from "antd";
import {
  readSession,
  clearSession,
  writeSession,
} from "../../../features/auth/session-storage";

export default function Sidebar({ showSidebar, closeSidebar }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState(() => readSession() ?? {});

  useEffect(() => {
    if (isProfileModalOpen && user?.token?.value) {
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${user.token.value}` },
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
          .put(`${process.env.REACT_APP_BASE_URL}/api/profile`, values, {
            headers: {
              Authorization: `Bearer ${user.token.value}`,
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
    clearSession();
    messageApi.success("Berhasil logout");
    navigate("/masuk", { replace: true });
  };

  return (
    <>
      {contextHolder}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-light-ash transform transition-transform duration-250 ease-out-quart ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between px-[21px] py-[25px] border-b border-light-ash">
          <div className="min-w-0">
            <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-1">
              Posyandu
            </p>
            <div className="text-heading-lg font-bold text-deep-slate truncate leading-[1.1]">
              KMS Digital
            </div>
            <div className="text-caption text-graphite mt-1 truncate">
              {user?.user?.name ?? "Admin"}
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden p-2 rounded-default text-graphite hover:bg-faint-fog transition-colors"
            aria-label="Tutup sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-[13px] py-[21px] space-y-[25px] overflow-y-auto max-h-[calc(100vh-180px)]">
          {sidebarlink.map((section) => (
            <div key={section.title}>
              <p className="text-caption font-bold text-graphite px-[13px] mb-[8px] uppercase tracking-[0.12em]">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.links.map((link) => {
                  if (link.dropdown) {
                    return (
                      <DropdownLink
                        key={link.title}
                        pathname={pathname}
                        basepath={link.basepath}
                        icon={<link.icon size={20} strokeWidth={1.75} />}
                        title={link.title}
                        dropdown={link.dropdown}
                      />
                    );
                  }
                  const isActive = pathname.endsWith(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 h-[50px] px-[13px] rounded-default text-body-sm transition-colors duration-150 ease-out-quart ${
                        isActive
                          ? "bg-primary-50 text-primary-700 font-bold"
                          : "text-deep-slate font-medium hover:bg-faint-fog"
                      }`}
                    >
                      <link.icon
                        size={20}
                        strokeWidth={isActive ? 2.25 : 1.75}
                        className={isActive ? "text-primary-600" : "text-graphite"}
                      />
                      {link.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 inset-x-0 px-[13px] py-[17px] border-t border-light-ash bg-white space-y-1">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 h-[50px] w-full px-[13px] rounded-default text-body-sm text-deep-slate hover:bg-faint-fog transition-colors duration-150 ease-out-quart"
          >
            <Lock size={20} strokeWidth={1.75} className="text-graphite" />
            Ubah Kata Sandi
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 h-[50px] w-full px-[13px] rounded-default text-body-sm text-danger hover:bg-danger/10 transition-colors duration-150 ease-out-quart"
          >
            <LogOut size={20} strokeWidth={1.75} />
            Keluar
          </button>
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
            <button
              onClick={() => {
                form.resetFields();
                setIsProfileModalOpen(false);
              }}
              className="px-[25px] py-[13px] rounded-button bg-white border border-light-ash text-deep-slate text-body-sm font-medium hover:bg-faint-fog transition-colors duration-150"
            >
              Batal
            </button>
            <button
              onClick={handleUpdateProfile}
              className="px-[25px] py-[13px] rounded-full bg-primary-500 hover:bg-primary-600 text-white text-body-sm font-medium transition-colors duration-150"
            >
              Simpan
            </button>
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
            <Input.Password className="h-[52px] text-base" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
