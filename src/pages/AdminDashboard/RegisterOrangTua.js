import { Form, Input, message, Select, Modal } from "antd";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import InlineStatBar from "../../components/ui/InlineStatBar";
import { desaApi } from "../../api/desa.api";
import { posyanduApi } from "../../api/posyandu.api";
import {
  useOrangTuaList,
  useCreateOrangTua,
  useUpdateOrangTua,
  useDeleteOrangTua,
} from "../../queries/useOrangTuaQueries";
import { isThisMonth } from "../../utilities/isThisMonth";

const normalizeStatus = (status) => {
  if (typeof status === "string") return status === "true" || status === "1";
  if (typeof status === "number") return status === 1;
  return !!status;
};

export default function RegisterOrangTua() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [statusFilter, setStatusFilter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: dataDesa, isLoading: desaLoading } = useQuery({
    queryKey: ["desa"],
    queryFn: async () => {
      const res = await desaApi.list();
      return res.data ?? [];
    },
    onError: (err) => messageApi.error(err?.message ?? "Gagal mengambil data desa"),
  });

  const { data: dataPosyandu, isLoading: posyanduLoading } = useQuery({
    queryKey: ["posyandu"],
    queryFn: async () => {
      const res = await posyanduApi.list();
      return res.data ?? [];
    },
    onError: (err) => messageApi.error(err?.message ?? "Gagal mengambil data posyandu"),
  });

  const { data: rawList, isLoading: ortuLoading } = useOrangTuaList(true);

  const createMutation = useCreateOrangTua();
  const updateMutation = useUpdateOrangTua();
  const deleteMutation = useDeleteOrangTua();

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const orangTuaList = useMemo(
    () =>
      (rawList ?? []).map((item) => ({
        ...item,
        status: normalizeStatus(item.status),
      })),
    [rawList]
  );

  const filteredOrangTua = useMemo(() => {
    let rows = orangTuaList;
    if (statusFilter !== null) {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    return rows;
  }, [orangTuaList, statusFilter]);

  const stats = [
    { label: "Total Orang Tua", value: orangTuaList.length },
    {
      label: "Disetujui",
      value: orangTuaList.filter((r) => r.status).length,
      accent: "success",
    },
    {
      label: "Menunggu",
      value: orangTuaList.filter((r) => !r.status).length,
      accent: "warning",
    },
    {
      label: "Baru Bulan Ini",
      value: orangTuaList.filter((r) => isThisMonth(r.created_at)).length,
      accent: "primary",
    },
  ];

  const showDeleteConfirm = (record) => {
    Modal.confirm({
      title: "Hapus orang tua?",
      icon: <AlertTriangle size={20} className="text-danger" />,
      content: `${record.nama} akan dihapus dari daftar.`,
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: () =>
        deleteMutation.mutate(record.id, {
          onSuccess: () => messageApi.success("Orang tua berhasil dihapus"),
          onError: (err) =>
            messageApi.error(err?.message ?? "Gagal menghapus orang tua"),
        }),
    });
  };

  const handleEdit = (record) => {
    setModalMode("edit");
    setSelectedUser(record);
    form.setFieldsValue({
      nama: record.nama,
      email: record.email,
      alamat: record.alamat,
      desa: record.desa?.id ?? record.id_desa,
      posyandu: record.posyandu?.id ?? record.id_posyandu,
      status: normalizeStatus(record.status),
    });
    setIsModalVisible(true);
  };

  const showModal = () => {
    setModalMode("add");
    setSelectedUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setModalMode("add");
    setSelectedUser(null);
    form.resetFields();
  };

  const onFinish = (values) => {
    if (modalMode === "add") {
      createMutation.mutate(
        {
          nama: values.nama,
          email: values.email,
          password: values.password,
          alamat: values.alamat,
          id_desa: values.desa,
          id_posyandu: values.posyandu,
          status: values.status ?? false,
        },
        {
          onSuccess: () => {
            messageApi.success("Registrasi berhasil");
            handleCancel();
            queryClient.invalidateQueries({ queryKey: ["orangTua", "list"] });
          },
          onError: (err) =>
            messageApi.error(err?.message ?? "Gagal registrasi orang tua"),
        }
      );
    } else if (selectedUser) {
      updateMutation.mutate(
        {
          id: selectedUser.id,
          payload: {
            nama: values.nama,
            email: values.email,
            password: values.password || undefined,
            alamat: values.alamat,
            id_desa: values.desa,
            id_posyandu: values.posyandu,
            status: values.status,
          },
        },
        {
          onSuccess: () => {
            messageApi.success("Orang tua berhasil diperbarui");
            handleCancel();
            queryClient.invalidateQueries({ queryKey: ["orangTua", "list"] });
          },
          onError: (err) =>
            messageApi.error(err?.message ?? "Gagal memperbarui orang tua"),
        }
      );
    }
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
      id: "posyandu",
      header: "Posyandu",
      accessorFn: (row) => row.posyandu?.nama ?? "N/A",
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ getValue }) => {
        const approved = !!getValue();
        return (
          <span
            className={`inline-flex items-center px-[13px] py-1 rounded-full text-caption font-medium ${
              approved
                ? "bg-success/10 text-success"
                : "bg-polar-mist text-graphite"
            }`}
          >
            {approved ? "Disetujui" : "Menunggu"}
          </span>
        );
      },
    },
    {
      id: "action",
      header: "Aksi",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            leadingIcon={<Pencil size={16} strokeWidth={1.75} />}
            onClick={() => handleEdit(row.original)}
            disabled={isBusy}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            leadingIcon={<Trash2 size={16} strokeWidth={1.75} />}
            onClick={() => showDeleteConfirm(row.original)}
            disabled={isBusy}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <PageHeader
        eyebrow="Akun Pengguna"
        title="Kelola Orang Tua"
        subtitle="Daftar orang tua yang terdaftar untuk memantau tumbuh kembang anak."
        action={
          <Button
            variant="primary"
            size="lg"
            leadingIcon={<Plus size={20} strokeWidth={2} />}
            onClick={showModal}
            disabled={isBusy}
          >
            Tambah Orang Tua
          </Button>
        }
        stats={<InlineStatBar items={stats} loading={ortuLoading} />}
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
        <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px] space-y-[17px]">
          <div className="flex items-center justify-between gap-[17px] flex-wrap">
            <h2 className="text-heading font-semibold text-deep-slate">
              Daftar Orang Tua
            </h2>
            <div className="flex items-center gap-[8px] flex-wrap">
              <select
                value={statusFilter === null ? "" : String(statusFilter)}
                onChange={(e) => {
                  const v = e.target.value;
                  setStatusFilter(v === "" ? null : v === "true");
                }}
                disabled={isBusy}
                className="h-[44px] rounded-default border border-light-ash bg-white px-[13px] text-body-sm text-deep-slate focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-60 transition-colors"
              >
                <option value="">Semua Status</option>
                <option value="true">Disetujui</option>
                <option value="false">Menunggu</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter(null)}
                disabled={isBusy}
              >
                Reset
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredOrangTua}
            loading={ortuLoading || isBusy}
            rowKey="id"
            searchPlaceholder="Cari orang tua..."
            emptyText="Belum ada orang tua terdaftar"
          />
        </div>
      </div>

      <Modal
        title={
          <span className="text-heading font-semibold text-deep-slate">
            {modalMode === "add" ? "Registrasi Orang Tua" : "Edit Orang Tua"}
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          name="form_orang_tua_admin"
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
              placeholder={modalMode === "add" ? "Minimal 8 karakter" : "Kosongkan jika tidak diubah"}
              className="h-[52px] text-base"
            />
          </Form.Item>

          {modalMode === "add" && (
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
          )}

          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Alamat</span>}
            name="alamat"
            rules={[{ required: true, message: "Alamat masih kosong" }]}
          >
            <Input.TextArea
              rows={3}
              className="text-base"
              placeholder="Alamat tempat tinggal"
            />
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

          <Form.Item
            name="posyandu"
            label={<span className="text-body-sm font-medium text-deep-slate">Posyandu</span>}
            rules={[{ required: true, message: "Posyandu masih kosong" }]}
          >
            <Select
              listHeight={200}
              optionFilterProp="children"
              showSearch
              placeholder="Pilih Posyandu"
              disabled={posyanduLoading}
              className="h-[52px]"
            >
              {dataPosyandu?.map((value) => (
                <Select.Option key={value.id} value={value.id}>
                  {value.nama}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label={<span className="text-body-sm font-medium text-deep-slate">Status</span>}
            rules={[{ required: true, message: "Status masih kosong" }]}
          >
            <Select placeholder="Pilih Status" className="h-[52px]">
              <Select.Option value={true}>Disetujui</Select.Option>
              <Select.Option value={false}>Menunggu</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex gap-[13px] justify-end pt-[13px]">
            <Button
              variant="default"
              size="md"
              onClick={handleCancel}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Menyimpan..."
                : "Simpan"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
