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
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Container from "react-bootstrap/Container";
import useAuth from "../../hook/useAuth";

export default function RegisterKaderPosyandu() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchText, setSearchedText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const queryClient = useQueryClient();

  const user = useAuth();

  // Fetch desa data using useQuery
  const { data: dataDesa, isLoading: desaLoading } = useQuery({
    queryKey: ["desa"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/desa`
      );
      if (!response.ok) throw new Error("Gagal mengambil data desa");
      const data = await response.json();
      return data.data;
    },
    onError: (err) => {
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data desa",
      });
    },
    enabled: !!user?.token?.value,
  });

  // Fetch posyandu data using useQuery
  const { data: dataSource, isLoading: posyanduLoading } = useQuery({
    queryKey: ["posyandu"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu`
      );
      if (!response.ok) throw new Error("Gagal mengambil data posyandu");
      const data = await response.json();
      return data.data;
    },
    onError: (err) => {
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data posyandu",
      });
    },
    enabled: !!user?.token?.value,
  });

  // Fetch kader-posyandu data using useQuery
  const { data: kaderData, isLoading: kaderLoading } = useQuery({
    queryKey: ["kader-posyandu"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/kader-posyandu`,
        {
          headers: { Authorization: `Bearer ${user?.token?.value}` },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil data Kader Posyandu");
      const data = await response.json();
      console.log("Kader Data:", data.data); // Debug log
      return data.data;
    },
    onError: (err) => {
      console.error("Fetch Error:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data Kader Posyandu",
      });
    },
    enabled: !!user?.token?.value,
  });

  // Mutation for creating a new Kader Posyandu
  const createKaderMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/posyandu/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: values.nama,
            email: values.email,
            password: values.password,
            id_desa: values.desa,
            id_posyandu: values.posyandu,
            status: values.status || false,
            role: "KADER_POSYANDU",
          }),
        }
      );
      if (!response.ok) throw new Error("Gagal Registrasi");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Register Berhasil",
      });
      form.resetFields();
      setIsModalVisible(false);
      queryClient.invalidateQueries(["kader-posyandu"]);
    },
    onError: (error) => {
      console.error("Register Error:", error);
      messageApi.open({
        type: "error",
        content: error.message || "Gagal Registrasi",
      });
    },
  });

  // Mutation for updating a Kader Posyandu
  const updateKaderMutation = useMutation({
    mutationFn: async ({ id, values }) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/users/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user?.token?.value}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: values.nama,
            email: values.email,
            password: values.password || undefined,
            id_desa: values.desa,
            id_posyandu: values.posyandu,
            status: values.status,
            role: "KADER_POSYANDU",
          }),
        }
      );
      if (!response.ok) throw new Error("Gagal memperbarui Kader Posyandu");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Kader Posyandu berhasil diperbarui",
      });
      form.resetFields();
      setIsModalVisible(false);
      setModalMode("add");
      setSelectedUser(null);
      queryClient.invalidateQueries(["kader-posyandu"]);
    },
    onError: (error) => {
      console.error("Update Error:", error);
      messageApi.open({
        type: "error",
        content: error.message || "Gagal memperbarui Kader Posyandu",
      });
    },
  });

  // Mutation for deleting a Kader Posyandu
  const deleteKaderMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/users/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.token?.value}` },
        }
      );
      if (!response.ok) throw new Error("Gagal menghapus Kader Posyandu");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Kader Posyandu berhasil dihapus",
      });
      queryClient.invalidateQueries(["kader-posyandu"]);
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    },
    onError: (err) => {
      console.error("Delete Error:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal menghapus Kader Posyandu",
      });
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    },
  });

  // Function to show delete confirmation modal
  const showDeleteConfirm = (id) => {
    setUserToDelete(id);
    setIsDeleteModalVisible(true);
  };

  // Function to handle delete confirmation
  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteKaderMutation.mutate(userToDelete);
    }
  };

  // Function to handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setUserToDelete(null);
  };

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
            disabled={
              createKaderMutation.isPending ||
              updateKaderMutation.isPending ||
              deleteKaderMutation.isPending
            }
          >
            Edit
          </Button>
          <Button
            type="dashed"
            danger
            size="small"
            onClick={() => showDeleteConfirm(record.id)}
            disabled={
              createKaderMutation.isPending ||
              updateKaderMutation.isPending ||
              deleteKaderMutation.isPending
            }
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const onFinish = (values) => {
    if (modalMode === "add") {
      createKaderMutation.mutate(values);
    } else if (modalMode === "edit" && selectedUser) {
      updateKaderMutation.mutate({ id: selectedUser.id, values });
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
              disabled={
                createKaderMutation.isPending ||
                updateKaderMutation.isPending ||
                deleteKaderMutation.isPending
              }
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
                    disabled={desaLoading}
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
                    disabled={posyanduLoading}
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
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={
                      createKaderMutation.isPending ||
                      updateKaderMutation.isPending
                    }
                  >
                    Simpan
                  </Button>
                  <Button
                    style={{ marginLeft: 8 }}
                    onClick={handleCancel}
                    disabled={
                      createKaderMutation.isPending ||
                      updateKaderMutation.isPending
                    }
                  >
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
                    <Button
                      onClick={resetFilters}
                      disabled={
                        createKaderMutation.isPending ||
                        updateKaderMutation.isPending ||
                        deleteKaderMutation.isPending
                      }
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              )}
              dataSource={kaderData || []}
              columns={columns}
              loading={
                kaderLoading ||
                createKaderMutation.isPending ||
                updateKaderMutation.isPending ||
                deleteKaderMutation.isPending
              }
              pagination={{ pageSize: 5 }}
              rowKey="id"
              onChange={handleTableChange}
              locale={{
                emptyText: "Tidak ada data Kader Posyandu",
              }}
              scroll={{ x: "max-content" }}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}
