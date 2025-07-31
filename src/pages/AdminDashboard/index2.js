import {
  DesktopOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Layout,
  Menu,
  Modal,
  Form,
  Input,
  Button,
  message,
} from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";
import InputDesa from "./InputDesa";
import InputPosyandu from "./InputPosyandu";
import RegisterKaderPosyandu from "./RegisterKaderPosyandu";
import RegisterTenagaKesehatan from "./RegisterTenagaKesehatan";

export default function AdminDashboard() {
  const { Content, Footer, Sider } = Layout;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [collapsed, setCollapsed] = useState(false);
  const [current, setCurrent] = useState("1");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("login_data") || "{}")
      : {}
  );

  function getItem(label, key, icon, children) {
    return {
      key,
      icon,
      children,
      label,
    };
  }

  const items = [
    getItem("Input Data", "sub1", <DesktopOutlined />, [
      getItem("Desa", "1"),
      getItem("Posyandu", "2"),
    ]),
    getItem("Register Akun", "sub2", <UserOutlined />, [
      getItem("Kader Posyandu", "3"),
      getItem("Tenaga Kesehatan", "4"),
    ]),
    getItem("Ubah Password", "5", <DesktopOutlined />),
    getItem("Logout", "6", <LogoutOutlined />),
  ];

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

  const handleMenu = (e) => {
    setCurrent(e.key);
    if (e.key === "5") {
      setIsProfileModalOpen(true);
    } else if (e.key === "6") {
      localStorage.clear();
      window.location.href = "/sign-in/admin";
    }
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
            // Update localStorage
            localStorage.setItem(
              "login_data",
              JSON.stringify({
                ...user,
                user: {
                  ...user.user,
                  name: response.data.data.user.name,
                },
              })
            );
            setUser((prev) => ({
              ...prev,
              user: {
                ...prev.user,
                name: response.data.data.user.name,
              },
            }));
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
      <Layout
        style={{
          minHeight: "100vh",
        }}
      >
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div className="logo" />
          <Menu
            onClick={handleMenu}
            selectedKeys={[current]}
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="inline"
            items={items}
          />
        </Sider>
        <Layout className="site-layout">
          <Content
            style={{
              margin: "0 16px",
            }}
          >
            <Breadcrumb
              style={{
                margin: "16px 0",
              }}
            >
              <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
              {current === "1" && (
                <>
                  <Breadcrumb.Item>Input Data</Breadcrumb.Item>
                  <Breadcrumb.Item>Desa</Breadcrumb.Item>
                </>
              )}
              {current === "2" && (
                <>
                  <Breadcrumb.Item>Input Data</Breadcrumb.Item>
                  <Breadcrumb.Item>Posyandu</Breadcrumb.Item>
                </>
              )}
              {current === "3" && (
                <>
                  <Breadcrumb.Item>Register Akun</Breadcrumb.Item>
                  <Breadcrumb.Item>Kader Posyandu</Breadcrumb.Item>
                </>
              )}
              {current === "4" && (
                <>
                  <Breadcrumb.Item>Register Akun</Breadcrumb.Item>
                  <Breadcrumb.Item>Tenaga Kesehatan</Breadcrumb.Item>
                </>
              )}
              {current === "5" && (
                <>
                  <Breadcrumb.Item>Ubah Password</Breadcrumb.Item>
                </>
              )}
            </Breadcrumb>
            <div
              className="site-layout-background"
              style={{
                padding: 24,
                minHeight: 360,
              }}
            >
              {current === "1" && <InputDesa />}
              {current === "2" && <InputPosyandu />}
              {current === "3" && <RegisterKaderPosyandu />}
              {current === "4" && <RegisterTenagaKesehatan />}
            </div>
          </Content>
          <Footer
            style={{
              textAlign: "center",
            }}
          >
            GiziBalita ©2023
          </Footer>
        </Layout>
        {/* Profile Modal */}
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
      </Layout>
    </>
  );
}
