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
            Authorization: `Bearer ${user?.token?.value}`,
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
      if (!response.ok) {
        let detail = "";
        try {
          const body = await response.json();
          detail = body?.message ?? body?.error ?? JSON.stringify(body);
        } catch (e) {
          detail = response.statusText;
        }
        throw new Error(`Gagal Registrasi (${response.status}): ${detail}`);
      }
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
      <div className="bg-white rounded-card shadow-card p-6">
        {contextHolder}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-h2 font-display text-neutral-900">Kelola Kader Posyandu</h1>
            <button
              onClick={showModal}
              disabled={
                createKaderMutation.isPending ||
                updateKaderMutation.isPending ||
                deleteKaderMutation.isPending
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm disabled:opacity-60 transition-colors"
            >
              + Tambah Kader Posyandu
            </button>
          </div>
          <Modal
            title={
              <span className="text-h3 font-display text-neutral-900">
                {modalMode === "add" ? "Registrasi Kader Posyandu" : "Edit Kader Posyandu"}
              </span>
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
                label={<span className="text-caption text-neutral-700">Nama</span>}
                name="nama"
                rules={[{ required: true, message: "Nama masih kosong", type: "string" }]}
              >
                <Input placeholder="Nama Lengkap" className="h-11 text-base" />
              </Form.Item>

              <Form.Item
                label={<span className="text-caption text-neutral-700">Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Email masih kosong" },
                  { type: "email", message: "Format email tidak valid" },
                ]}
              >
                <Input placeholder="email@contoh.com" className="h-11 text-base" />
              </Form.Item>

              <Form.Item
                label={<span className="text-caption text-neutral-700">Kata Sandi</span>}
                name="password"
                rules={
                  modalMode === "add"
                    ? [
                        { required: true, message: "Kata sandi masih kosong" },
                        { pattern: "^.{8,}$", message: "Minimal 8 karakter" },
                      ]
                    : [{ pattern: "^.{8,}$", message: "Minimal 8 karakter" }]
                }
              >
                <Input.Password
                  placeholder={modalMode === "add" ? "Kata sandi" : "Kosongkan jika tidak diubah"}
                  className="h-11 text-base"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-caption text-neutral-700">Konfirmasi Kata Sandi</span>}
                name="confirm"
                dependencies={["password"]}
                rules={
                  modalMode === "add" || form.getFieldValue("password")
                    ? [
                        { required: true, message: "Konfirmasi kata sandi" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value)
                              return Promise.resolve();
                            return Promise.reject(new Error("Kata sandi tidak sesuai"));
                          },
                        }),
                      ]
                    : []
                }
              >
                <Input.Password placeholder="Konfirmasi" className="h-11 text-base" />
              </Form.Item>

              <Form.Item
                name="desa"
                label={<span className="text-caption text-neutral-700">Desa</span>}
                rules={[{ required: true, message: "Desa masih kosong" }]}
              >
                <Select
                  listHeight={100}
                  optionFilterProp="children"
                  showSearch
                  placeholder="Pilih Desa"
                  disabled={desaLoading}
                  className="h-11"
                >
                  {dataDesa?.map((value) => (
                    <Select.Option key={value.id} value={value.id}>
                      {value.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="posyandu"
                label={<span className="text-caption text-neutral-700">Posyandu</span>}
                rules={[{ required: true, message: "Posyandu masih kosong" }]}
              >
                <Select
                  listHeight={100}
                  optionFilterProp="children"
                  showSearch
                  placeholder="Pilih Posyandu"
                  disabled={posyanduLoading}
                  className="h-11"
                >
                  {dataSource?.map((value) => (
                    <Select.Option key={value.id} value={value.id}>
                      {value.nama}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label={<span className="text-caption text-neutral-700">Status</span>}
                rules={[{ required: true, message: "Status masih kosong" }]}
              >
                <Select placeholder="Pilih Status" className="h-11">
                  <Select.Option value={true}>Approve</Select.Option>
                  <Select.Option value={false}>Belum di Approve</Select.Option>
                </Select>
              </Form.Item>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={createKaderMutation.isPending || updateKaderMutation.isPending}
                  className="px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createKaderMutation.isPending || updateKaderMutation.isPending}
                  className="px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm disabled:opacity-60"
                >
                  Simpan
                </button>
              </div>
            </Form>
          </Modal>

          <Modal
            title={<span className="text-h3 font-display text-neutral-900">Konfirmasi Hapus</span>}
            open={isDeleteModalVisible}
            onOk={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <p className="text-base">Apakah Anda yakin ingin menghapus Kader Posyandu ini?</p>
          </Modal>

          <Table
            title={() => (
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <h2 className="text-h3 font-display text-neutral-900">Daftar Kader Posyandu</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Input.Search
                    placeholder="Cari kader..."
                    value={searchText}
                    onChange={(e) => setSearchedText(e.target.value)}
                    onSearch={(value) => setSearchedText(value)}
                    className="w-full md:w-64"
                    allowClear
                  />
                  <button
                    onClick={resetFilters}
                    disabled={
                      createKaderMutation.isPending ||
                      updateKaderMutation.isPending ||
                      deleteKaderMutation.isPending
                    }
                    className="px-4 py-2 rounded-button bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium disabled:opacity-60 transition-colors"
                  >
                    Reset
                  </button>
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
            locale={{ emptyText: "Tidak ada data Kader Posyandu" }}
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>
    </>
  );
}
