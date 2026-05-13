import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { sidebarlink } from "./sidebarLinks";
import DropdownLink from "./DropdownLink";
import { FiLogOut, FiLock, FiX } from "react-icons/fi";
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
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-neutral-200 shadow-card transform transition-transform duration-250 ease-out-quart ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <div className="text-h3 font-display text-primary-700">
              KMS Digital
            </div>
            <div className="text-caption text-neutral-500 mt-0.5">
              {user?.user?.name ?? "Admin"}
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden p-2 rounded-button text-neutral-500 hover:bg-neutral-100"
            aria-label="Tutup sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {sidebarlink.map((section) => (
            <div key={section.title}>
              <p className="text-overline text-neutral-500 px-3 mb-2">
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
                        icon={<link.icon size={18} />}
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
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-button font-medium transition-colors ${
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <link.icon size={18} />
                      {link.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-neutral-200 bg-white space-y-1">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-button text-neutral-700 hover:bg-neutral-100 transition-colors w-full font-medium"
          >
            <FiLock size={18} />
            Ubah Kata Sandi
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-button text-danger hover:bg-danger-bg transition-colors w-full font-medium"
          >
            <FiLogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      <Modal
        title={
          <span className="text-h3 font-display text-neutral-900">
            Profil Pengguna
          </span>
        }
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
              className="px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold"
            >
              Batal
            </button>
            <button
              onClick={handleUpdateProfile}
              className="px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm"
            >
              Simpan
            </button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={<span className="text-caption text-neutral-700">Nama</span>}
            name="nama"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input disabled className="h-11 text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-caption text-neutral-700">Kata Sandi Baru</span>}
            name="password"
            rules={[{ min: 8, message: "Minimal 8 karakter" }]}
          >
            <Input.Password className="h-11 text-base" />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-caption text-neutral-700">
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
            <Input.Password className="h-11 text-base" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
