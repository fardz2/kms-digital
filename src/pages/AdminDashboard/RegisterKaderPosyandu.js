import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Table,
  Modal,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import "./Search.css";

export default function RegisterKaderPosyandu() {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]); // Posyandu data
  const [kaderData, setKaderData] = useState([]); // Kader Posyandu data
  const [dataDesa, setDataDesa] = useState([]); // Desa data
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [refreshKey, setRefreshKey] = useState(0); // Refresh key for refetching
  const [searchText, setSearchedText] = useState(""); // Search text for filtering
  const [statusFilter, setStatusFilter] = useState(null); // Status filter state
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state for add/edit
  const [modalMode, setModalMode] = useState("add"); // Modal mode: 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null); // Selected user for editing
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); // Modal visibility state for delete
  const [userToDelete, setUserToDelete] = useState(null); // User to delete
  const [user] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("login_data")) || {};
    }
    return {};
  });

  // Function to show delete confirmation modal
  const showDeleteConfirm = (id) => {
    setUserToDelete(id);
    setIsDeleteModalVisible(true);
  };

  // Function to handle delete confirmation
  const handleDeleteConfirm = () => {
    if (userToDelete) {
      axios
        .delete(
          `${process.env.REACT_APP_BASE_URL}/api/auth/users/${userToDelete}`,
          {
            headers: { Authorization: `Bearer ${user.token?.value}` },
          }
        )
        .then((response) => {
          setRefreshKey((oldKey) => oldKey + 1);
          messageApi.open({
            type: "success",
            content: "Kader Posyandu berhasil dihapus",
          });
          setIsDeleteModalVisible(false);
          setUserToDelete(null);
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content:
              err.response?.data?.message || "Gagal menghapus Kader Posyandu",
          });
          setIsDeleteModalVisible(false);
          setUserToDelete(null);
        });
    }
  };

  // Function to cancel delete
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setUserToDelete(null);
  };

  // Function to update a Kader Posyandu
  function updateKader(id, values) {
    axios
      .put(
        `${process.env.REACT_APP_BASE_URL}/api/auth/users/${id}`,
        {
          nama: values.nama,
          email: values.email,
          password: values.password || undefined,
          id_desa: values.desa,
          id_posyandu: values.posyandu,
          status: values.status,
          role: "KADER_POSYANDU",
        },
        {
          headers: { Authorization: `Bearer ${user.token?.value}` },
        }
      )
      .then((response) => {
        messageApi.open({
          type: "success",
          content: "Kader Posyandu berhasil diperbarui",
        });
        form.resetFields();
        setIsModalVisible(false);
        setModalMode("add");
        setSelectedUser(null);
        setRefreshKey((oldKey) => oldKey + 1);
      })
      .catch((error) => {
        console.error("Update Error:", error.response?.data);
        messageApi.open({
          type: "error",
          content:
            error.response?.data?.message || "Gagal memperbarui Kader Posyandu",
        });
      });
  }

  // Function to reset filters
  const resetFilters = () => {
    setSearchedText("");
    setStatusFilter(null);
  };

  // Normalize status for filtering
  const normalizeStatus = (status) => {
    if (typeof status === "string") {
      return status === "true" || status === "1";
    }
    if (typeof status === "number") {
      return status === 1;
    }
    return !!status; // Convert to boolean for null/undefined/false
  };

  // Table columns configuration
  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        String(record.nama).toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Desa",
      dataIndex: ["desa", "name"],
      key: "desa",
      render: (text) => text || "N/A",
    },
    {
      title: "Posyandu",
      dataIndex: ["posyandu", "nama"],
      key: "posyandu",
      render: (text) => text || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        normalizeStatus(status) ? "Approve" : "Belum di Approve",
      filters: [
        {
          text: "Approve",
          value: true,
        },
        {
          text: "Belum di Approve",
          value: false,
        },
      ],
      filteredValue: statusFilter !== null ? [statusFilter] : null,
      onFilter: (value, record) => normalizeStatus(record.status) === value,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div>
          <Button
            type="default"
            size="small"
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            type="dashed"
            danger
            size="small"
            onClick={() => showDeleteConfirm(record.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!user.token?.value) {
      messageApi.open({
        type: "error",
        content: "Silakan login terlebih dahulu",
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/posyandu`)
      .then((response) => {
        setDataSource(response.data.data);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Gagal mengambil data posyandu",
        });
      });

    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/desa`)
      .then((response) => {
        setDataDesa(response.data.data);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Gagal mengambil data desa",
        });
      });

    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/posyandu/kader-posyandu`, {
        headers: { Authorization: `Bearer ${user.token?.value}` },
      })
      .then((response) => {
        console.log("Kader Data:", response.data.data); // Debug log
        setKaderData(response.data.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err.response?.data);
        messageApi.open({
          type: "error",
          content: "Gagal mengambil data Kader Posyandu",
        });
        setIsLoading(false);
      });
  }, [refreshKey, messageApi, user.token?.value]);

  const onFinish = (values) => {
    if (modalMode === "add") {
      axios
        .post(`${process.env.REACT_APP_BASE_URL}/api/auth/posyandu/register`, {
          nama: values.nama,
          email: values.email,
          password: values.password,
          id_desa: values.desa,
          id_posyandu: values.posyandu,
          status: values.status || false,
          role: "KADER_POSYANDU",
        })
        .then((response) => {
          messageApi.open({
            type: "success",
            content: "Register Berhasil",
          });
          form.resetFields();
          setIsModalVisible(false);
          setRefreshKey((oldKey) => oldKey + 1);
        })
        .catch((error) => {
          console.error("Register Error:", error.response?.data);
          messageApi.open({
            type: "error",
            content: error.response?.data?.message || "Gagal Registrasi",
          });
        });
    } else if (modalMode === "edit" && selectedUser) {
      updateKader(selectedUser.id, values);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form Failed:", errorInfo);
  };

  const showModal = () => {
    setModalMode("add");
    setSelectedUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalMode("edit");
    setSelectedUser(record);
    form.setFieldsValue({
      nama: record.nama,
      email: record.email,
      desa: record.desa?.id,
      posyandu: record.posyandu?.id,
      status: normalizeStatus(record.status),
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setModalMode("add");
    setSelectedUser(null);
    form.resetFields();
  };

  const handleTableChange = (pagination, filters) => {
    setSearchedText(filters.nama ? filters.nama[0] : "");
    setStatusFilter(
      filters.status && filters.status.length > 0 ? filters.status[0] : null
    );
  };

  return (
    <>
      <Container
        fluid
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "20px",
        }}
      >
        {contextHolder}
        <Row justify="space-between">
          <Col sm={24}>
            <Button
              type="primary"
              onClick={showModal}
              style={{ marginBottom: 16 }}
            >
              Tambah Kader Posyandu
            </Button>
            <Modal
              title={
                modalMode === "add"
                  ? "Registrasi Kader Posyandu"
                  : "Edit Kader Posyandu"
              }
              open={isModalVisible}
              onCancel={handleCancel}
              footer={null}
            >
              <Form
                form={form}
                name="basic"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  label="Nama"
                  name="nama"
                  rules={[
                    {
                      required: true,
                      message: "Nama masih kosong!",
                      type: "string",
                    },
                  ]}
                >
                  <Input placeholder="Nama Lengkap" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Email masih kosong!",
                    },
                    {
                      type: "email",
                      message: "Email belum sesuai!",
                    },
                  ]}
                >
                  <Input placeholder="user@email.com" />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={
                    modalMode === "add"
                      ? [
                          {
                            required: true,
                            message: "Password masih kosong!",
                          },
                          {
                            pattern: "^.{8,}$",
                            message: "Password minimal 8 karakter",
                          },
                        ]
                      : [
                          {
                            pattern: "^.{8,}$",
                            message: "Password minimal 8 karakter",
                          },
                        ]
                  }
                >
                  <Input.Password placeholder="Password (kosongkan jika tidak diubah)" />
                </Form.Item>

                <Form.Item
                  label="Confirm Password"
                  name="confirm"
                  dependencies={["password"]}
                  rules={
                    modalMode === "add" || form.getFieldValue("password")
                      ? [
                          {
                            required: true,
                            message: "Silahkan Confirm Password Anda!",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (
                                !value ||
                                getFieldValue("password") === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("Password tidak sesuai!")
                              );
                            },
                          }),
                        ]
                      : []
                  }
                >
                  <Input.Password placeholder="Confirm Password" />
                </Form.Item>

                <Form.Item
                  name="desa"
                  label="Desa"
                  rules={[
                    {
                      required: true,
                      message: "Desa masih kosong!",
                    },
                  ]}
                >
                  <Select
                    listHeight={100}
                    optionFilterProp="children"
                    showSearch
                    placeholder="Pilih Desa"
                  >
                    {dataDesa &&
                      dataDesa.map((value) => (
                        <Select.Option key={value.id} value={value.id}>
                          {value.name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="posyandu"
                  label="Posyandu"
                  rules={[
                    {
                      required: true,
                      message: "Posyandu masih kosong!",
                    },
                  ]}
                >
                  <Select
                    listHeight={100}
                    optionFilterProp="children"
                    showSearch
                    placeholder="Pilih Posyandu"
                  >
                    {dataSource &&
                      dataSource.map((value) => (
                        <Select.Option key={value.id} value={value.id}>
                          {value.nama}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="status"
                  label="Status"
                  rules={[
                    {
                      required: true,
                      message: "Status masih kosong!",
                    },
                  ]}
                >
                  <Select placeholder="Pilih Status">
                    <Select.Option value={true}>Approve</Select.Option>
                    <Select.Option value={false}>
                      Belum di Approve
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Simpan
                  </Button>
                  <Button style={{ marginLeft: 8 }} onClick={handleCancel}>
                    Batal
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="Konfirmasi Hapus"
              open={isDeleteModalVisible}
              onOk={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
              okText="Hapus"
              cancelText="Batal"
              okButtonProps={{ danger: true }}
            >
              <p>Apakah Anda yakin ingin menghapus Kader Posyandu ini?</p>
            </Modal>

            {!isLoading && (
              <Table
                title={() => (
                  <div className="flex justify-between items-center">
                    <div className="flex justify-start items-center">
                      <h2 className="text-sm font-semibold">
                        Daftar Kader Posyandu
                      </h2>
                    </div>
                    <div className="flex justify-end items-center gap-2">
                      <Input.Search
                        placeholder="Search here ..."
                        value={searchText}
                        onChange={(e) => setSearchedText(e.target.value)}
                        onSearch={(value) => setSearchedText(value)}
                      />
                      <Button onClick={resetFilters}>Reset Filters</Button>
                    </div>
                  </div>
                )}
                dataSource={kaderData}
                columns={columns}
                loading={isLoading}
                pagination={{ pageSize: 5 }}
                rowKey="id"
                onChange={handleTableChange}
                locale={{
                  emptyText: "Tidak ada data Kader Posyandu",
                }}
                scroll={{ x: "max-content" }}
              />
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}
