import { Button, Form, Input, message, Modal } from "antd";
import DataTable from "../../components/ui/DataTable";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function InputDesa() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  // Fetch desa data using useQuery
  const { data: dataSource, isLoading } = useQuery({
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
  });

  // Mutation for deleting a desa
  const deleteDesaMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/desa/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Gagal menghapus desa");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Desa berhasil dihapus",
      });
      queryClient.invalidateQueries(["desa"]);
    },
    onError: (err) => {
      messageApi.open({
        type: "error",
        content: err.message || "Gagal menghapus desa",
      });
    },
  });

  // Mutation for creating a new desa
  const createDesaMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/desa`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            password: values.password,
            password_confirmation: values.password_confirmation,
          }),
        }
      );
      if (!response.ok) throw new Error("Data gagal tersimpan");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Desa dan akun berhasil disimpan",
      });
      queryClient.invalidateQueries(["desa"]);
      form.resetFields();
      setIsModalVisible(false);
    },
    onError: (err) => {
      messageApi.open({
        type: "error",
        content: err.message || "Data gagal tersimpan",
      });
    },
  });

  const showDeleteConfirm = (id, name) => {
    Modal.confirm({
      title: "Konfirmasi Hapus",
      content: `Apakah Anda yakin ingin menghapus desa "${name}"?`,
      okText: "Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk() {
        deleteDesaMutation.mutate(id);
      },
      onCancel() {
        console.log("Hapus dibatalkan");
      },
    });
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Nama Desa",
      enableSorting: true,
    },
    {
      id: "action",
      header: "Aksi",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          className="button_delete"
          onClick={() => showDeleteConfirm(row.original.id, row.original.name)}
          type="dashed"
          danger
          disabled={deleteDesaMutation.isPending}
        >
          Delete
        </Button>
      ),
    },
  ];

  const onFinish = (values) => {
    createDesaMutation.mutate(values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
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
            <h1 className="text-h2 font-display text-neutral-900">Kelola Desa</h1>
            <button
              onClick={showModal}
              disabled={createDesaMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm disabled:opacity-60 transition-colors"
            >
              + Tambah Desa
            </button>
          </div>
          <Modal
            title={<span className="text-h3 font-display text-neutral-900">Tambah Desa</span>}
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
                label={<span className="text-caption text-neutral-700">Nama Desa</span>}
                name="name"
                rules={[{ required: true, message: "Nama Desa masih kosong" }]}
              >
                <Input className="h-11 text-base" />
              </Form.Item>
              <Form.Item
                label={<span className="text-caption text-neutral-700">Kata Sandi</span>}
                name="password"
                rules={[
                  { required: true, message: "Kata sandi masih kosong" },
                  { min: 8, message: "Minimal 8 karakter" },
                ]}
              >
                <Input.Password placeholder="Kata sandi" className="h-11 text-base" />
              </Form.Item>
              <Form.Item
                label={<span className="text-caption text-neutral-700">Konfirmasi Kata Sandi</span>}
                name="password_confirmation"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Konfirmasi kata sandi" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value)
                        return Promise.resolve();
                      return Promise.reject(new Error("Kata sandi tidak sesuai"));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Konfirmasi" className="h-11 text-base" />
              </Form.Item>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={createDesaMutation.isPending}
                  className="px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createDesaMutation.isPending}
                  className="px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm disabled:opacity-60"
                >
                  {createDesaMutation.isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </Form>
          </Modal>
          <DataTable
            columns={columns}
            data={dataSource || []}
            loading={
              isLoading ||
              createDesaMutation.isPending ||
              deleteDesaMutation.isPending
            }
            rowKey="id"
            title={<h2 className="text-h3 font-display text-neutral-900">Daftar Desa</h2>}
            searchPlaceholder="Cari desa..."
            emptyText="Tidak ada data desa"
          />
        </div>
      </div>
    </>
  );
}
