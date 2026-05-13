import { Form, Input, message, Select, Modal } from "antd";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import useAuth from "../../hook/useAuth";

export default function RegisterTenagaKesehatan() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const queryClient = useQueryClient();

  const user = useAuth();

  const { data: dataDesa, isLoading: desaLoading } = useQuery({
    queryKey: ["desa"],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/desa`);
      if (!response.ok) throw new Error("Gagal mengambil data desa");
      const data = await response.json();
      return data.data;
    },
    onError: (err) => {
      messageApi.error(err.message || "Gagal mengambil data desa");
    },
    enabled: !!user?.token?.value,
  });

  const { data: tenagaKesehatanData, isLoading: tenagaKesehatanLoading } =
    useQuery({
      queryKey: ["tenaga-kesehatan"],
      queryFn: async () => {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/posyandu/tenaga-kesehatan`,
          { headers: { Authorization: `Bearer ${user?.token?.value}` } }
        );
        if (!response.ok) throw new Error("Gagal mengambil data Tenaga Kesehatan");
        const data = await response.json();
        return data.data;
      },
      onError: (err) => {
        messageApi.error(err.message || "Gagal mengambil data Tenaga Kesehatan");
      },
      enabled: !!user?.token?.value,
    });

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
      messageApi.success("Register Berhasil");
      form.resetFields();
      setIsModalVisible(false);
      queryClient.invalidateQueries(["tenaga-kesehatan"]);
    },
    onError: (error) => {
      messageApi.error(error.message || "Gagal Registrasi");
    },
  });

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
      messageApi.success("Tenaga Kesehatan berhasil dihapus");
      queryClient.invalidateQueries(["tenaga-kesehatan"]);
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    },
    onError: (err) => {
      messageApi.error(err.message || "Gagal menghapus Tenaga Kesehatan");
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    },
  });

  const isBusy =
    createTenagaKesehatanMutation.isPending ||
    deleteTenagaKesehatanMutation.isPending;

  const showDeleteConfirm = (id) => {
    setUserToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteTenagaKesehatanMutation.mutate(userToDelete);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setUserToDelete(null);
  };

  const columns = [
    { accessorKey: "nama", header: "Nama", enableSorting: true },
    { accessorKey: "email", header: "Email", enableSorting: true },
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
        <Button
          variant="destructive"
          size="sm"
          leadingIcon={<Trash2 size={16} strokeWidth={1.75} />}
          onClick={() => showDeleteConfirm(row.original.id)}
          disabled={isBusy}
        >
          Hapus
        </Button>
      ),
    },
  ];

  const onFinish = (values) => {
    createTenagaKesehatanMutation.mutate(values);
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
      <div className="flex items-start justify-between gap-[25px] flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[13px]">
            Akun Pengguna
          </p>
          <h1 className="text-display font-bold text-deep-slate leading-[1.05] tracking-tight">
            Kelola Tenaga Kesehatan
          </h1>
          <p className="text-body-lg text-graphite mt-[13px] max-w-[560px]">
            Daftar bidan dan tenaga kesehatan yang terdaftar di tiap desa.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          leadingIcon={<Plus size={20} strokeWidth={2} />}
          onClick={showModal}
          disabled={isBusy}
        >
          Tambah Tenaga Kesehatan
        </Button>
      </div>

      <div className="bg-white border border-light-ash rounded-default p-[25px] shadow-card">
        <DataTable
          columns={columns}
          data={tenagaKesehatanData || []}
          loading={tenagaKesehatanLoading || isBusy}
          rowKey="id"
          title={
            <h2 className="text-heading font-semibold text-deep-slate">
              Daftar Tenaga Kesehatan
            </h2>
          }
          searchPlaceholder="Cari tenaga kesehatan..."
          emptyText="Tidak ada data Tenaga Kesehatan"
        />
      </div>

      <Modal
        title={
          <span className="text-heading font-semibold text-deep-slate">
            Registrasi Tenaga Kesehatan
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          name="register_nakes"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Nama</span>}
            name="nama"
            rules={[{ required: true, message: "Nama masih kosong" }]}
          >
            <Input placeholder="Nama Lengkap" className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Email</span>}
            name="email"
            rules={[
              { required: true, message: "Email masih kosong" },
              { type: "email", message: "Format email tidak valid" },
            ]}
          >
            <Input placeholder="email@contoh.com" className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Kata Sandi</span>}
            name="password"
            rules={[
              { required: true, message: "Kata sandi masih kosong" },
              { pattern: "^.{8,}$", message: "Minimal 8 karakter" },
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
            name="confirm"
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
          <Form.Item
            name="desa"
            label={<span className="text-body-sm font-medium text-deep-slate">Desa</span>}
            rules={[{ required: true, message: "Desa masih kosong" }]}
          >
            <Select
              listHeight={200}
              optionFilterProp="children"
              showSearch
              placeholder="Pilih Desa"
              disabled={desaLoading}
              className="h-[52px]"
            >
              {dataDesa?.map((value) => (
                <Select.Option key={value.id} value={value.id}>
                  {value.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="flex gap-[13px] justify-end pt-[13px]">
            <Button
              variant="default"
              size="md"
              onClick={handleCancel}
              disabled={createTenagaKesehatanMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={createTenagaKesehatanMutation.isPending}
            >
              {createTenagaKesehatanMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <span className="text-heading font-semibold text-deep-slate">
            Konfirmasi Hapus
          </span>
        }
        open={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Hapus"
        cancelText="Batal"
        okButtonProps={{ danger: true }}
      >
        <p className="text-body-sm text-deep-slate">
          Apakah Anda yakin ingin menghapus Tenaga Kesehatan ini?
        </p>
      </Modal>
    </div>
  );
}
