import { Form, Input, Select, Modal } from "antd";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import InlineStatBar from "../../components/ui/InlineStatBar";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "../../components/ui/Toast";
import { useSession } from "../../features/auth/useSession";
import { isThisMonth } from "../../utilities/isThisMonth";
import { desaApi } from "../../api/desa.api";
import { nakesApi } from "../../api/nakes.api";

export default function RegisterTenagaKesehatan() {
  const [form] = Form.useForm();
  const toast = useToast();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { isAuthenticated } = useSession();

  const { data: dataDesa, isLoading: desaLoading } = useQuery({
    queryKey: ["desa"],
    queryFn: async () => {
      const res = await desaApi.list();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
  });

  const { data: tenagaKesehatanData, isLoading: tenagaKesehatanLoading } =
    useQuery({
      queryKey: ["tenaga-kesehatan"],
      queryFn: async () => {
        const res = await nakesApi.list();
        return res.data ?? [];
      },
      enabled: isAuthenticated,
    });

  const createTenagaKesehatanMutation = useMutation({
    mutationFn: (values: Record<string, any>) =>
      nakesApi.register({
        nama: values.nama,
        email: values.email,
        password: values.password,
        id_desa: values.desa,
        status: true,
      }),
    onSuccess: () => {
      toast.success("Register Berhasil");
      form.resetFields();
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["tenaga-kesehatan"] });
    },
    onError: (err) => toast.error(err?.message ?? "Gagal Registrasi"),
  });

  const deleteTenagaKesehatanMutation = useMutation({
    mutationFn: (id) => nakesApi.remove(id),
    onSuccess: () => {
      toast.success("Tenaga Kesehatan berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["tenaga-kesehatan"] });
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    },
    onError: (err) => {
      toast.error(err?.message ?? "Gagal menghapus Tenaga Kesehatan");
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

  const rows = tenagaKesehatanData ?? [];
  const stats = [
    { label: "Total Tenaga Kesehatan", value: rows.length },
    {
      label: "Tersebar di",
      value: new Set(rows.map((r) => r.desa?.id ?? r.id_desa).filter(Boolean)).size + " desa",
      accent: "neutral",
    },
    {
      label: "Baru Bulan Ini",
      value: rows.filter((r) => isThisMonth(r.created_at)).length,
      accent: "primary",
    },
  ];

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
    <div>
      {toast.contextHolder}
      <PageHeader
        eyebrow="Akun Pengguna"
        title="Kelola Tenaga Kesehatan"
        subtitle="Daftar bidan dan tenaga kesehatan yang terdaftar di tiap desa."
        dataTourId="admin-tenkes-header"
        action={
          <Button
            data-tour-id="admin-tenkes-add-button"
            variant="primary"
            size="lg"
            leadingIcon={<Plus size={20} strokeWidth={2} />}
            onClick={showModal}
            disabled={isBusy}
          >
            Tambah Tenaga Kesehatan
          </Button>
        }
        stats={<InlineStatBar items={stats} loading={tenagaKesehatanLoading} />}
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
        <div
          className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px]"
          data-tour-id="admin-tenkes-table"
        >
          <DataTable
            columns={columns}
            data={tenagaKesehatanData || []}
            loading={tenagaKesehatanLoading || isBusy}
            rowKey="id"
            searchPlaceholder="Cari tenaga kesehatan..."
            emptyText="Belum ada tenaga kesehatan terdaftar"
          />
        </div>
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
              { pattern: /^.{8,}$/, message: "Minimal 8 karakter" },
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
