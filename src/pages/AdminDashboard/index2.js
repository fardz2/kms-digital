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
  Spin,
} from "antd";
import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import "./index.css";
import InputDesa from "./InputDesa";
import InputPosyandu from "./InputPosyandu";
import RegisterKaderPosyandu from "./RegisterKaderPosyandu";
import RegisterTenagaKesehatan from "./RegisterTenagaKesehatan";
import useAuth from "../../hook/useAuth";

export default function AdminDashboard() {
  const { Content, Footer, Sider } = Layout;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [state, setState] = useState({
    collapsed: false,
    current: "1",
    isProfileModalOpen: false,
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuth();

  // Centralized fetch error handler
  const handleFetchError = async (response, defaultMessage) => {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || defaultMessage);
    }
    return response;
  };

  // Memoized menu items
  const items = useMemo(
    () => [
      {
        key: "sub1",
        icon: <DesktopOutlined />,
        label: "Input Data",
        children: [
          { key: "1", label: "Desa" },
          { key: "2", label: "Posyandu" },
        ],
      },
      {
        key: "sub2",
        icon: <UserOutlined />,
        label: "Register Akun",
        children: [
          { key: "3", label: "Kader Posyandu" },
          { key: "4", label: "Tenaga Kesehatan" },
        ],
      },
      { key: "5", icon: <DesktopOutlined />, label: "Ubah Password" },
      { key: "6", icon: <LogoutOutlined />, label: "Logout" },
    ],
    []
  );

  // Memoized breadcrumb items based on current selection
  const breadcrumbItems = useMemo(() => {
    const base = [{ title: "Dashboard" }];
    const paths = {
      1: [{ title: "Input Data" }, { title: "Desa" }],
      2: [{ title: "Input Data" }, { title: "Posyandu" }],
      3: [{ title: "Register Akun" }, { title: "Kader Posyandu" }],
      4: [{ title: "Register Akun" }, { title: "Tenaga Kesehatan" }],
      5: [{ title: "Ubah Password" }],
    };
    return [...base, ...(paths[state.current] || [])];
  }, [state.current]);

  // Fetch profile data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.token?.value],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/profile`,
        {
          headers: {
            Authorization: `Bearer ${user?.token?.value}`,
            "Content-Type": "application/json",
          },
        }
      );
      await handleFetchError(response, "Gagal mengambil profil");
      const data = await response.json();
      return data.data.user;
    },
    enabled: state.isProfileModalOpen && !!user?.token?.value,
    onSuccess: (data) => form.setFieldsValue({ nama: data.name }),
    onError: (err) => messageApi.error(err.message || "Gagal mengambil profil"),
  });

  // Update profile mutation
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
      await handleFetchError(response, "Gagal memperbarui profil");
      return response.json();
    },
    onSuccess: (response) => {
      messageApi.success("Profil berhasil diperbarui");
      localStorage.setItem(
        "login_data",
        JSON.stringify({
          ...user,
          user: { ...user.user, name: response.data.user.name },
        })
      );
      form.resetFields();
      setState((prev) => ({ ...prev, isProfileModalOpen: false }));
    },
    onError: (err) =>
      messageApi.error(err.message || "Gagal memperbarui profil"),
  });

  // Handle menu click
  const handleMenu = useCallback(
    (e) => {
      setState((prev) => ({ ...prev, current: e.key }));
      if (e.key === "5") {
        setState((prev) => ({ ...prev, isProfileModalOpen: true }));
        queryClient.invalidateQueries(["profile"]);
      } else if (e.key === "6") {
        localStorage.clear();
        navigate("/sign-in", { replace: true });
      }
    },
    [navigate, queryClient]
  );

  // Handle profile update
  const handleUpdateProfile = useCallback(() => {
    form
      .validateFields()
      .then(updateProfileMutation.mutate)
      .catch((info) => console.log("Validation Failed:", info));
  }, [form, updateProfileMutation]);

  // Handle modal cancel
  const handleCancel = useCallback(() => {
    form.resetFields();
    setState((prev) => ({ ...prev, isProfileModalOpen: false }));
  }, [form]);

  // Render content based on current menu
  const renderContent = useMemo(() => {
    const components = {
      1: <InputDesa />,
      2: <InputPosyandu />,
      3: <RegisterKaderPosyandu />,
      4: <RegisterTenagaKesehatan />,
    };
    return components[state.current] || null;
  }, [state.current]);

  return (
    <>
      {contextHolder}
      {(profileLoading || updateProfileMutation.isPending) && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/80 p-8 rounded-lg">
          <Spin size="large" />
        </div>
      )}
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          collapsible
          collapsed={state.collapsed}
          onCollapse={(value) =>
            setState((prev) => ({ ...prev, collapsed: value }))
          }
        >
          <div className="logo" />
          <Menu
            onClick={handleMenu}
            selectedKeys={[state.current]}
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="inline"
            items={items}
          />
        </Sider>
        <Layout className="site-layout">
          <Content style={{ margin: "0 16px" }}>
            <Breadcrumb style={{ margin: "16px 0" }} items={breadcrumbItems} />
            <div
              className="site-layout-background"
              style={{ padding: 24, minHeight: 360 }}
            >
              {renderContent}
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>GiziBalita ©2023</Footer>
        </Layout>
        <Modal
          title="Profil Pengguna"
          open={state.isProfileModalOpen}
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
              disabled={updateProfileMutation.isPending}
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
              <Input disabled={profileLoading} />
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
                    return !value || getFieldValue("password") === value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Password tidak cocok!"));
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
