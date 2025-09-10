import { Form, Input, message, Spin } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MailOutlined, KeyOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import logo from "./GiziBalita_logo.png";
import background from "./login_bg.svg";
import banner from "./banner.svg";

const BackgroundComponent = () => (
  <div
    className="fixed inset-0 z-[-10000] bg-center bg-no-repeat"
    style={{
      backgroundImage: `url(${background})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      minHeight: "100vh",
    }}
  />
);

export default function SignIn(props) {
  const { TenagaKesehatan, Desa, kaderPosyandu, admin } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  // Check authentication status using useQuery
  const { isLoading: authLoading } = useQuery({
    queryKey: ["authCheck"],
    queryFn: () => {
      let login_data = null;
      let isAuthenticated = false;
      let userRole = null;

      try {
        if (typeof window !== "undefined") {
          login_data = JSON.parse(localStorage.getItem("login_data") || "{}");
          isAuthenticated =
            login_data &&
            login_data.token &&
            login_data.user &&
            login_data.user.role;
          userRole = isAuthenticated ? login_data.user.role : null;
        }
      } catch (error) {
        console.error("Error parsing login_data:", error);
        localStorage.removeItem("login_data"); // Clear invalid data
        isAuthenticated = false;
      }

      if (isAuthenticated) {
        // Redirect to role-specific dashboard
        const redirectPath =
          userRole === "ORANG_TUA"
            ? "/dashboard"
            : userRole === "KADER_POSYANDU"
            ? "/kader-posyandu/dashboard"
            : userRole === "TENAGA_KESEHATAN"
            ? "/tenaga-kesehatan/dashboard"
            : userRole === "DESA"
            ? "/desa/dashboard"
            : userRole === "ADMIN"
            ? "/admin/dashboard/desa"
            : "/"; // Fallback to home if role is unknown

        messageApi.open({
          type: "info",
          content: "Anda sudah login. Mengarahkan ke dashboard...",
        });

        navigate(redirectPath, { replace: true });
      }

      return { isAuthenticated };
    },
    retry: false, // No retry for auth check
  });

  // Determine the role for redirect purposes
  const getRoleRedirect = () => {
    if (TenagaKesehatan) return "TENAGA_KESEHATAN";
    if (Desa) return "DESA";
    if (kaderPosyandu) return "KADER_POSYANDU";
    if (admin) return "ADMIN";
    return "ORANG_TUA"; // Default role
  };

  const role = getRoleRedirect();

  // Login mutation using useMutation
  const loginMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Email dan Password belum sesuai");
      }
      return response.json();
    },
    onSuccess: (data) => {
      const role_user = data.data.user.role;
      const user_status = data.data.user.status;

      // Validasi status pengguna
      if (user_status === "0") {
        messageApi.open({
          type: "error",
          content:
            "Akun Anda belum di-approve. Silakan tunggu persetujuan admin.",
        });
        return;
      }

      // Validasi role pengguna
      if (role_user !== role && role !== "ORANG_TUA") {
        messageApi.open({
          type: "error",
          content: `Akses ditolak. Anda bukan ${role
            .replace("_", " ")
            .toLowerCase()}.`,
        });
        return;
      }

      // Jika status dan role valid, lanjutkan proses login
      messageApi.open({
        type: "success",
        content: "Berhasil Login",
      });
      localStorage.setItem("login_data", JSON.stringify(data.data));
      setTimeout(() => {
        // Check if there's a previous page to redirect to
        const from = location.state?.from?.pathname || null;
        if (from && from !== "/sign-in" && from !== "/sign-up") {
          navigate(from, { replace: true }); // Redirect to the previous page
        } else {
          // Fallback to role-specific dashboard
          if (role_user === "ORANG_TUA") {
            navigate("/dashboard/");
          } else if (role_user === "KADER_POSYANDU") {
            navigate("/kader-posyandu/dashboard/");
          } else if (role_user === "TENAGA_KESEHATAN") {
            navigate("/tenaga-kesehatan/dashboard");
          } else if (role_user === "DESA") {
            navigate("/desa/dashboard");
          } else if (role_user === "ADMIN") {
            navigate("/admin/dashboard/desa");
          }
        }
      }, 1000);
    },
    onError: (error) => {
      messageApi.open({
        type: "error",
        content: error.message || "Email dan Password belum sesuai",
      });
    },
  });

  const onFinish = (values) => {
    loginMutation.mutate(values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const renderLoginForm = () => (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto p-4 h-screen items-center"
      style={{ background: "rgba(0, 0, 0, 0)" }}
    >
      <div className="flex flex-col items-center justify-center">
        <img
          src={logo}
          alt="Image"
          className="w-40 md:w-48 mb-2"
          style={{ height: "auto" }}
        />
        <div className="w-full max-w-md">
          <Form
            name="basic"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
            style={{ fontSize: "20px" }}
          >
            <h5 className="label">Email</h5>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Email masih kosong!" },
                { type: "email", message: "Email belum sesuai!" },
              ]}
            >
              <Input
                id="input_signIn"
                placeholder="user@email.com"
                prefix={
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: "4px",
                    }}
                  >
                    <MailOutlined style={{ marginRight: "8px" }} />
                    <span style={{ margin: "0 8px" }}>|</span>
                  </span>
                }
                style={{
                  borderRadius: "20px",
                  height: 50,
                  display: "flex",
                  alignItems: "center",
                }}
              />
            </Form.Item>

            <h5 className="label">Password</h5>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Password masih kosong!" }]}
            >
              <Input.Password
                id="input_signIn"
                placeholder="password"
                prefix={
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: "4px",
                    }}
                  >
                    <KeyOutlined style={{ marginRight: "8px" }} />
                    <span style={{ margin: "0 8px" }}>|</span>
                  </span>
                }
                style={{
                  borderRadius: "20px",
                  height: 50,
                  display: "flex",
                  alignItems: "center",
                }}
              />
            </Form.Item>

            <Form.Item>
              <button
                type="submit"
                className="button__"
                style={{
                  fontSize: "22px",
                  height: 50,
                  borderRadius: "20px",
                  marginBottom: "20px",
                }}
                disabled={loginMutation.isPending}
              >
                LOGIN
              </button>
            </Form.Item>
          </Form>
          <p className="text-center mt-2">
            Tidak punya akun? <Link to="/sign-up">Daftar</Link>
          </p>
        </div>
      </div>
      <div
        className="hidden md:flex items-center justify-center"
        style={{
          background: `url(${banner}) no-repeat center`,
          backgroundSize: "700px",
          borderRadius: 10,
          height: "90%",
        }}
      />
    </div>
  );

  const renderTenagaKesehatanForm = () => (
    <div
      className="flex items-center justify-center h-screen"
      style={{ background: "linear-gradient(42deg,#090979,#00d4ff)" }}
    >
      <div className="w-full max-w-md bg-white rounded-lg p-6 md:p-8">
        <h1 className="font-bold text-2xl my-5 text-center">Welcome back</h1>
        <p className="text-center mb-4">login sebagai Tenaga Kesehatan</p>
        <Form
          name="basic"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email masih kosong!" },
              { type: "email", message: "Email belum sesuai!" },
            ]}
          >
            <Input placeholder="user@email.com" style={{ height: "40px" }} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password masih kosong!" }]}
          >
            <Input.Password placeholder="password" style={{ height: "40px" }} />
          </Form.Item>

          <Form.Item>
            <button
              type="submit"
              className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              disabled={loginMutation.isPending}
            >
              Login
            </button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );

  return (
    <>
      <BackgroundComponent />
      {contextHolder}
      {(loginMutation.isPending || authLoading) && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/80 p-8 rounded-lg">
          <Spin size="large" />
        </div>
      )}
      {!TenagaKesehatan &&
        !Desa &&
        !kaderPosyandu &&
        !admin &&
        renderLoginForm()}
      {kaderPosyandu && renderLoginForm()}
      {Desa && renderLoginForm()}
      {TenagaKesehatan && renderTenagaKesehatanForm()}
      {admin && renderLoginForm()}
    </>
  );
}
