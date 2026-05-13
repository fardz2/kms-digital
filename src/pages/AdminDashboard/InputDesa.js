import { Form, Input, message, Modal } from "antd";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";

export default function InputDesa() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

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

  const deleteDesaMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/desa/${id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Gagal menghapus desa");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Desa berhasil dihapus");
      queryClient.invalidateQueries(["desa"]);
    },
    onError: (err) => {
      messageApi.error(err.message || "Gagal menghapus desa");
    },
  });

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
      messageApi.success("Desa dan akun berhasil disimpan");
      queryClient.invalidateQueries(["desa"]);
      form.resetFields();
      setIsModalVisible(false);
    },
    onError: (err) => {
      messageApi.error(err.message || "Data gagal tersimpan");
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
          variant="destructive"
          size="sm"
          leadingIcon={<Trash2 size={16} strokeWidth={1.75} />}
          onClick={() => showDeleteConfirm(row.original.id, row.original.name)}
          disabled={deleteDesaMutation.isPending}
        >
          Hapus
        </Button>
      ),
    },
  ];

  const onFinish = (values) => {
    createDesaMutation.mutate(values);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="space-y-[25px]">
      {contextHolder}
      <div className="flex items-center justify-between gap-[17px] flex-wrap">
        <div>
          <h1 className="text-heading-lg font-bold text-deep-slate">
            Kelola Desa
          </h1>
          <p className="text-body-sm text-graphite mt-1">
            Daftar desa yang terdaftar dalam sistem posyandu.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leadingIcon={<Plus size={20} strokeWidth={1.75} />}
          onClick={showModal}
          disabled={createDesaMutation.isPending}
        >
          Tambah Desa
        </Button>
      </div>

      <div className="bg-white border border-light-ash rounded-default p-[25px]">
        <DataTable
          columns={columns}
          data={dataSource || []}
          loading={
            isLoading ||
            createDesaMutation.isPending ||
            deleteDesaMutation.isPending
          }
          rowKey="id"
          title={
            <h2 className="text-heading font-semibold text-deep-slate">
              Daftar Desa
            </h2>
          }
          searchPlaceholder="Cari desa..."
          emptyText="Tidak ada data desa"
        />
      </div>

      <Modal
        title={
          <span className="text-heading font-semibold text-deep-slate">
            Tambah Desa
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          name="tambah_desa"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Nama Desa</span>}
            name="name"
            rules={[{ required: true, message: "Nama Desa masih kosong" }]}
          >
            <Input className="h-[52px] text-base" placeholder="Masukkan nama desa" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Kata Sandi</span>}
            name="password"
            rules={[
              { required: true, message: "Kata sandi masih kosong" },
              { min: 8, message: "Minimal 8 karakter" },
            ]}
          >
            <Input.Password placeholder="Minimal 8 karakter" className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-body-sm font-medium text-deep-slate">
                Konfirmasi Kata Sandi
              </span>
            }
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
            <Input.Password placeholder="Ulangi kata sandi" className="h-[52px] text-base" />
          </Form.Item>
          <div className="flex gap-[13px] justify-end pt-[13px]">
            <Button
              variant="default"
              size="md"
              onClick={handleCancel}
              disabled={createDesaMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={createDesaMutation.isPending}
            >
              {createDesaMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
