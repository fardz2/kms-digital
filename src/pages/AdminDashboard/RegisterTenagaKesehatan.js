import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Modal,
  Spin,
} from "antd";
import DataTable from "../../components/ui/DataTable";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hook/useAuth";

export default function RegisterTenagaKesehatan() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  // Fetch tenaga-kesehatan data using useQuery
  const { data: tenagaKesehatanData, isLoading: tenagaKesehatanLoading } =
    useQuery({
      queryKey: ["tenaga-kesehatan"],
      queryFn: async () => {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/posyandu/tenaga-kesehatan`,
          {
            headers: { Authorization: `Bearer ${user?.token?.value}` },
          }
        );
        if (!response.ok)
          throw new Error("Gagal mengambil data Tenaga Kesehatan");
        const data = await response.json();
        return data.data;
      },
      onError: (err) => {
        console.error("Fetch Error:", err);
        messageApi.open({
          type: "error",
          content: err.message || "Gagal mengambil data Tenaga Kesehatan",
        });
      },
      enabled: !!user?.token?.value,
    });

  // Mutation for creating a new Tenaga Kesehatan
  const createTenagaKesehatanMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/tenaga-kesehatan/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: values.nama,
            email: values.email,
            password: values.password,
            id_desa: values.desa,
            status: true,
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
      queryClient.invalidateQueries(["tenaga-kesehatan"]);
    },
    onError: (error) => {
      console.error("Register Error:", error);
      messageApi.open({
        type: "error",
        content: error.message || "Gagal Registrasi",
      });
    },
  });

  // Mutation for deleting a Tenaga Kesehatan
  const deleteTenagaKesehatanMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/auth/users/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.token?.value}` },
        }
      );
      if (!response.ok) throw new Error("Gagal menghapus Tenaga Kesehatan");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Tenaga Kesehatan berhasil dihapus",
      });
      queryClient.invalidateQueries(["tenaga-kesehatan"]);
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    },
    onError: (err) => {
      console.error("Delete Error:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal menghapus Tenaga Kesehatan",
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
      deleteTenagaKesehatanMutation.mutate(userToDelete);
    }
  };

  // Function to handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setUserToDelete(null);
  };

  // Table columns configuration
  const columns = [
    {
      accessorKey: "nama",
      header: "Nama",
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
    },
    {
      id: "desa",
      header: "Desa",
      accessorFn: (row) => row.desa?.name ?? "N/A",
      enableSorting: true,
    },
    {
      id: "action",
      header: "Aksi",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div>
          <Button
            type="dashed"
            danger
            size="small"
            onClick={() => showDeleteConfirm(row.original.id)}
            disabled={
              createTenagaKesehatanMutation.isPending ||
              deleteTenagaKesehatanMutation.isPending
            }
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const onFinish = (values) => {
    createTenagaKesehatanMutation.mutate(values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form Failed:", errorInfo);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <>
      <div className="bg-white rounded-card shadow-card p-6">
        {contextHolder}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-h2 font-display text-neutral-900">Kelola Tenaga Kesehatan</h1>
            <button
              onClick={showModal}
              disabled={
                createTenagaKesehatanMutation.isPending ||
                deleteTenagaKesehatanMutation.isPending
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm disabled:opacity-60 transition-colors"
            >
              + Tambah Tenaga Kesehatan
            </button>
          </div>
          <Modal
            title={<span className="text-h3 font-display text-neutral-900">Registrasi Tenaga Kesehatan</span>}
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
          >
            <Form form={form} name="basic" onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off" layout="vertical">
              <Form.Item label={<span className="text-caption text-neutral-700">Nama</span>} name="nama" rules={[{ required: true, message: "Nama masih kosong", type: "string" }]}>
                <Input placeholder="Nama Lengkap" className="h-11 text-base" />
              </Form.Item>
              <Form.Item label={<span className="text-caption text-neutral-700">Email</span>} name="email" rules={[{ required: true, message: "Email masih kosong" }, { type: "email", message: "Format email tidak valid" }]}>
                <Input placeholder="email@contoh.com" className="h-11 text-base" />
              </Form.Item>
              <Form.Item label={<span className="text-caption text-neutral-700">Kata Sandi</span>} name="password" rules={[{ required: true, message: "Kata sandi masih kosong" }, { pattern: "^.{8,}$", message: "Minimal 8 karakter" }]}>
                <Input.Password placeholder="Kata sandi" className="h-11 text-base" />
              </Form.Item>
              <Form.Item label={<span className="text-caption text-neutral-700">Konfirmasi Kata Sandi</span>} name="confirm" dependencies={["password"]} rules={[{ required: true, message: "Konfirmasi kata sandi" }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue("password") === value) return Promise.resolve(); return Promise.reject(new Error("Kata sandi tidak sesuai")); } })]}>
                <Input.Password placeholder="Konfirmasi" className="h-11 text-base" />
              </Form.Item>
              <Form.Item name="desa" label={<span className="text-caption text-neutral-700">Desa</span>} rules={[{ required: true, message: "Desa masih kosong" }]}>
                <Select listHeight={100} optionFilterProp="children" showSearch placeholder="Pilih Desa" disabled={desaLoading} className="h-11">
                  {dataDesa?.map((value) => (<Select.Option key={value.id} value={value.id}>{value.name}</Select.Option>))}
                </Select>
              </Form.Item>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={handleCancel} disabled={createTenagaKesehatanMutation.isPending} className="px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold disabled:opacity-60">Batal</button>
                <button type="submit" disabled={createTenagaKesehatanMutation.isPending} className="px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm disabled:opacity-60">Simpan</button>
              </div>
            </Form>
          </Modal>

          <Modal title={<span className="text-h3 font-display text-neutral-900">Konfirmasi Hapus</span>} open={isDeleteModalVisible} onOk={handleDeleteConfirm} onCancel={handleDeleteCancel} okText="Hapus" cancelText="Batal" okButtonProps={{ danger: true }}>
            <p className="text-base">Apakah Anda yakin ingin menghapus Tenaga Kesehatan ini?</p>
          </Modal>

          <DataTable
            columns={columns}
            data={tenagaKesehatanData || []}
            loading={
              tenagaKesehatanLoading ||
              createTenagaKesehatanMutation.isPending ||
              deleteTenagaKesehatanMutation.isPending
            }
            rowKey="id"
            title={<h2 className="text-h3 font-display text-neutral-900">Daftar Tenaga Kesehatan</h2>}
            searchPlaceholder="Cari tenaga kesehatan..."
            emptyText="Tidak ada data Tenaga Kesehatan"
          />
        </div>
      </div>
    </>
  );
}
