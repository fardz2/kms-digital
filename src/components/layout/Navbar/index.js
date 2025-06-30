import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Col, Row, Modal, Form, Input, Button, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import axios from "axios";

import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function NavbarComp(props) {
  const { isLogin, admin, posyandu, desa, kader, tenkes } = props;
  const navigate = useNavigate();
  let login_data;
  if (typeof window !== "undefined") {
    login_data = JSON.parse(localStorage.getItem("login_data") || "{}");
  }
  const [user, setUser] = useState(login_data);
  const [activeLink, setActiveLink] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const currentPath = window.location.pathname;
    setActiveLink(currentPath);
  }, []);

  // Fetch profile data when modal opens
  useEffect(() => {
    if (
      isProfileModalOpen &&
      user?.token?.value &&
      user?.user?.role !== "ADMIN"
    ) {
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
  }, [
    isProfileModalOpen,
    user?.token?.value,
    user?.user?.role,
    form,
    messageApi,
  ]);

  const handleProfileClick = () => {
    if (user?.user?.role !== "ADMIN") {
      setIsProfileModalOpen(true);
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

  const navbarStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFB4B4",
    color: "#ffffff",
    height: "80px",
    paddingTop: "20px",
    zIndex: 1000,
  };

  const navLinkStyle = {
    color: "white",
    margin: "0 10px",
  };

  const activeNavLinkStyle = {
    ...navLinkStyle,
    fontWeight: "bold",
    textDecoration: "underline",
  };

  // Basic Navbar for non-authenticated users
  const BasicNavbar = () => (
    <Navbar style={navbarStyle} expand="md">
      <Container fluid="md">
        <Navbar.Brand as={Link} to="/">
          <h2 className="text-base md:text-xl text-white">KMS Digital</h2>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse
          id="basic-navbar-nav"
          className="justify-content-end"
          style={{ backgroundColor: "#FFB4B4" }}
        >
          <Nav className="ms-auto align-items-center">
            <Link
              to="/dashboard"
              style={
                activeLink === "/dashboard" ? activeNavLinkStyle : navLinkStyle
              }
            >
              <h5>Home</h5>
            </Link>
            <Link
              to="/"
              style={
                activeLink === "/about" ? activeNavLinkStyle : navLinkStyle
              }
            >
              <h5>About</h5>
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );

  if (isLogin) {
    return (
      <>
        {contextHolder}
        <Navbar style={navbarStyle} expand="lg">
          <Container fluid="md">
            <Navbar.Brand as={Link} to="/">
              <h2 className="text-base md:text-xl text-white">
                KMS Digital{" "}
                <span className="text-[#b14444] font-bold">
                  {user?.user?.desa_name || ""}
                </span>
              </h2>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse
              id="basic-navbar-nav"
              className="justify-content-start"
              style={{ backgroundColor: "#FFB4B4" }}
            >
              <Nav className="mx-auto align-items-center">
                {user?.user?.role === "ORANG_TUA" && (
                  <>
                    <Link
                      to="/dashboard"
                      style={
                        activeLink === "/dashboard"
                          ? activeNavLinkStyle
                          : navLinkStyle
                      }
                    >
                      <h6 className="nav-link-text">Home</h6>
                    </Link>
                    <Link
                      to="/artikel"
                      style={
                        activeLink === "/artikel"
                          ? activeNavLinkStyle
                          : navLinkStyle
                      }
                    >
                      <h6 className="nav-link-text">Artikel</h6>
                    </Link>
                    <Link
                      to="/tanya-jawab"
                      style={
                        activeLink === "/tanya-jawab"
                          ? activeNavLinkStyle
                          : navLinkStyle
                      }
                    >
                      <h6 className="nav-link-text">Tanya Jawab</h6>
                    </Link>
                  </>
                )}
                {user?.user?.role === "TENAGA_KESEHATAN" && (
                  <>
                    <Link
                      to="/tenaga-kesehatan/dashboard"
                      style={
                        activeLink === "/tenaga-kesehatan/dashboard"
                          ? activeNavLinkStyle
                          : navLinkStyle
                      }
                    >
                      <h6 className="nav-link-text">Home</h6>
                    </Link>
                  </>
                )}
                {user?.user?.role === "DESA" && (
                  <>
                    <Link
                      to="/desa/dashboard"
                      style={
                        activeLink === "/desa/dashboard"
                          ? activeNavLinkStyle
                          : navLinkStyle
                      }
                    >
                      <h6 className="nav-link-text">Home</h6>
                    </Link>
                    <Link
                      to="/desa/reminder"
                      style={
                        activeLink === "/desa/reminder"
                          ? activeNavLinkStyle
                          : navLinkStyle
                      }
                    >
                      <h6 className="nav-link-text">Event</h6>
                    </Link>
                  </>
                )}
                {user?.user?.role === "KADER_POSYANDU" && (
                  <>
                    <Link
                      to="/dashboard"
                      style={
                        activeLink === "/dashboard"
                          ? activeNavLinkStyle
                          : navLinkStyle
                      }
                    >
                      <h6 className="nav-link-text">Home</h6>
                    </Link>
                  </>
                )}
              </Nav>

              <Row
                justify="center"
                align="middle"
                onClick={handleProfileClick}
                style={{ cursor: "pointer" }}
              >
                <Col>
                  <Row justify="end" style={{ fontWeight: "bold" }}>
                    {user?.user?.name || "User"}
                  </Row>
                  <Row justify="end">
                    {user?.user?.role
                      ? user.user.role.toLowerCase() === "orang_tua"
                        ? "Orang Tua"
                        : user.user.role
                      : "Guest"}
                  </Row>
                </Col>
                <Col>
                  <Row justify="end" style={{ marginLeft: "10px" }}>
                    <Avatar icon={<UserOutlined />} />
                  </Row>
                </Col>
              </Row>
              <Row justify="center" align="middle">
                <Col style={{ display: "flex", alignItems: "center" }}>
                  <button
                    className="Btn"
                    onClick={() => {
                      localStorage.removeItem("login_data");
                      navigate("/");
                    }}
                    style={{ marginLeft: "20px" }}
                  >
                    <div className="sign">
                      <svg viewBox="0 0 512 512">
                        <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                      </svg>
                    </div>
                    <div className="text">Logout</div>
                  </button>
                </Col>
              </Row>
            </Navbar.Collapse>
          </Container>
        </Navbar>

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
              <Input />
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
  }

  if (admin) {
    return (
      <Navbar style={navbarStyle} expand="lg">
        <Container fluid="md">
          <Navbar.Brand as={Link} to="/">
            <h2 className="text-base md:text-xl text-white">
              KMS Digital{" "}
              <span className="text-[#b14444] font-bold">
                {user?.user?.desa_name || ""}
              </span>
            </h2>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-start"
            style={{ backgroundColor: "#FFB4B4" }}
          >
            {desa && (
              <Nav className="mx-auto align-items-center">
                <Link
                  to="/dashboard"
                  style={
                    activeLink === "/dashboard"
                      ? activeNavLinkStyle
                      : navLinkStyle
                  }
                >
                  <h6 className="nav-link-text">Home</h6>
                </Link>
                <Link
                  to="/artikel"
                  style={
                    activeLink === "/artikel"
                      ? activeNavLinkStyle
                      : navLinkStyle
                  }
                >
                  <h6 className="nav-link-text">Input Data</h6>
                </Link>
                <Link
                  to="/forum"
                  style={
                    activeLink === "/forum" ? activeNavLinkStyle : navLinkStyle
                  }
                >
                  <h6 className="nav-link-text">Desa</h6>
                </Link>
              </Nav>
            )}
            {posyandu && (
              <Nav className="mx-auto align-items-center">
                <Link
                  to="/dashboard"
                  style={
                    activeLink === "/dashboard"
                      ? activeNavLinkStyle
                      : navLinkStyle
                  }
                >
                  <h6 className="nav-link-text">Home</h6>
                </Link>
                <Link
                  to="/artikel"
                  style={
                    activeLink === "/artikel"
                      ? activeNavLinkStyle
                      : navLinkStyle
                  }
                >
                  <h6 className="nav-link-text">Input Data</h6>
                </Link>
                <Link
                  to="/forum"
                  style={
                    activeLink === "/forum" ? activeNavLinkStyle : navLinkStyle
                  }
                >
                  <h6 className="nav-link-text">Posyandu</h6>
                </Link>
              </Nav>
            )}
            {kader && (
              <Nav className="mx-auto align-items-center">
                <Link
                  to="/dashboard"
                  style={
                    activeLink === "/dashboard"
                      ? activeNavLinkStyle
                      : navLinkStyle
                  }
                >
                  <h6 className="nav-link-text">Home</h6>
                </Link>
                <Link
                  to="/artikel"
                  style={
                    activeLink === "/artikel"
                      ? activeNavLinkStyle
                      : navLinkStyle
                  }
                >
                  <h6 className="nav-link-text">Register Akun</h6>
                </Link>
                <Link
                  to="/forum"
                  style={
                    activeLink === "/forum" ? activeNavLinkStyle : navLinkStyle
                  }
                >
                  <h6 className="nav-link-text">Kader Posyandu</h6>
                </Link>
              </Nav>
            )}
            {tenkes && (
              <Nav className="mx-auto align-items-center">
                <Link
                  to="/tenaga-kesehatan/dashboard"
                  style={
                    activeLink === "/tenaga-kesehatan/dashboard"
                      ? activeNavLinkStyle
                      : navLinkStyle
                  }
                >
                  <h6 className="nav-link-text">Home</h6>
                </Link>
                <Link
                  to="/artikel"
                  style={
                    activeLink === "/artikel"
                      ? activeNavLinkStyle
                      : navLinkStyle
                  }
                >
                  <h6 className="nav-link-text">Register Akun</h6>
                </Link>
                <Link
                  to="/forum"
                  style={
                    activeLink === "/forum" ? activeNavLinkStyle : navLinkStyle
                  }
                >
                  <h6 className="nav-link-text">Tenaga Kesehatan</h6>
                </Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }

  return <BasicNavbar />;
}
