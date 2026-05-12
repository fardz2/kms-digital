import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sidebarlink } from "./sidebarLinks";
import DropdownLink from "./DropdownLink";
import { FiLogOut, FiLock } from "react-icons/fi";
import { Modal, Form, Input, Button, message } from "antd";
import axios from "axios";
import adminUser from "../../../assets/icon/user.svg";
import sidebarImage from "../../../assets/img/sidebar.svg";
import { readSession, clearSession } from "../../../features/auth/session-storage";

const Sidebar = ({ showSidebar, isMobile, closeSidebar }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState(() => readSession() ?? {});

  // Fetch profile data when modal opens
  useEffect(() => {
    if (isProfileModalOpen && user?.token?.value) {
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${user.token.value}`,
          },
        })
        .then((response) => {
          form.setFieldsValue({
            nama: response.data.data.user.name,
          });
        })
        .catch((err) => {
          console.error("Fetch profile error:", err);
          messageApi.open({
            type: "error",
            content: err.response?.data?.message || "Gagal mengambil profil",
          });
        });
    }
  }, [isProfileModalOpen, user?.token?.value, form, messageApi]);

  const handleChangePasswordClick = () => {
    setIsProfileModalOpen(true);
    if (isMobile) closeSidebar();
  };

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
            messageApi.open({
              type: "success",
              content: "Profil berhasil diperbarui",
            });
            const updatedUser = {
              ...user,
              user: {
                ...user.user,
                name: response.data.data.user.name,
              },
            };
            localStorage.setItem("login_data", JSON.stringify(updatedUser));
            setUser(updatedUser);
            form.resetFields();
            setIsProfileModalOpen(false);
          })
          .catch((err) => {
            console.error("Update profile error:", err);
            messageApi.open({
              type: "error",
              content:
                err.response?.data?.message || "Gagal memperbarui profil",
            });
          });
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsProfileModalOpen(false);
  };

  return (
    <>
      {contextHolder}
      <div
        className={`fixed h-screen ${
          showSidebar
            ? `w-80 ${
                isMobile ? "max-w-[80vw]" : ""
              } translate-x-0 border-r-[1px]`
            : "w-0 -translate-x-80"
        } duration-300 z-50 bg-white`}
        style={{
          background: `url(${sidebarImage})`,
          color: "#b41318",
          backgroundPosition: "right -1px top 1px",
        }}
      >
        <div className="flex flex-col py-1 pl-6">
          <div className="my-10 flex items-center">
            <img src={adminUser} alt="User Profile" />
            <span className="font-medium text-sm ml-2 uppercase">
              {user?.user?.name || "User"}
            </span>
          </div>
        </div>
        <div className="py-0 flex flex-col h-full max-h-sidebar-content">
          {sidebarlink.map((link, index) => (
            <div className={`${index !== 0 ? "mt-4" : ""}`} key={link.title}>
              {link.links.length > 0 && (
                <h6
                  className="font-bold text-sm uppercase px-6 mb-2"
                  style={{ color: "#b41318" }}
                >
                  {link.title}
                </h6>
              )}
              {link.links.map((link) => {
                const isActive = pathname.startsWith(link.path);
                if (link.dropdown) {
                  return (
                    <DropdownLink
                      key={link.title}
                      pathname={pathname}
                      basepath={link.basepath}
                      icon={<link.icon size={20} />}
                      title={link.title}
                      dropdown={link.dropdown}
                      onClick={isMobile ? closeSidebar : undefined}
                    />
                  );
                }
                return (
                  <Link
                    to={link.path}
                    key={link.path}
                    className={`sidebarlink ${
                      isActive ? "bg-rose-400 text-white active" : ""
                    } hover:bg-rose-400 duration-300`}
                    onClick={isMobile ? closeSidebar : undefined}
                  >
                    <link.icon
                      size={20}
                      color={isActive ? "white" : "#b41318"}
                    />
                    <span
                      className="font-medium text-sm ml-2"
                      style={{ color: isActive ? "white" : "#b41318" }}
                    >
                      {link.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
          <button
            className={`sidebarlink flex items-center pl-6 h-12 ${
              isProfileModalOpen ? "bg-rose-400 text-white active" : ""
            } hover:bg-rose-400 duration-300`}
            onClick={handleChangePasswordClick}
          >
            <FiLock
              size={20}
              color={isProfileModalOpen ? "white" : "#b41318"}
            />
            <span
              className="font-medium text-sm ml-2"
              style={{ color: isProfileModalOpen ? "white" : "#b41318" }}
            >
              Ubah Password
            </span>
          </button>
          <button
            className="sidebarlink flex items-center pl-6 h-12 hover:bg-rose-400 duration-300 mt-2"
            onClick={() => {
              clearSession();
              messageApi.success("Berhasil logout");
              if (isMobile) closeSidebar();
              navigate("/masuk", { replace: true });
            }}
          >
            <FiLogOut size={20} color="#b41318" />
            <span
              className="font-medium text-sm ml-2"
              style={{ color: "#b41318" }}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
      <Modal
        title="Profil Pengguna"
        open={isProfileModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel} className="batal_btn">
            Batal
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleUpdateProfile}
            className="update_btn"
          >
            Update
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" name="profile_form">
          <Form.Item
            label="Nama"
            name="nama"
            rules={[{ required: true, message: "Nama wajib diisi!" }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Password Baru"
            name="password"
            rules={[{ min: 8, message: "Password minimal 8 karakter!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Konfirmasi Password"
            name="password_confirmation"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Password tidak cocok!"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Sidebar;
