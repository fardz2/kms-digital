// @ts-nocheck
import { Form, Input, Select, Modal } from "antd";
import { useMemo, useState } from "react";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import InlineStatBar from "../../components/ui/InlineStatBar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "../../components/ui/Toast";
import { useSession } from "../../features/auth/useSession";
import { isThisMonth } from "../../utilities/isThisMonth";
import { desaApi } from "../../api/desa.api";
import { posyanduApi } from "../../api/posyandu.api";
import { kaderApi } from "../../api/kader.api";

const normalizeStatus = (status) => {
  if (typeof status === "string") return status === "true" || status === "1";
  if (typeof status === "number") return status === 1;
  return !!status;
};

export default function RegisterKaderPosyandu() {
  const [form] = Form.useForm();
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
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

  const { data: dataSource, isLoading: posyanduLoading } = useQuery({
    queryKey: ["posyandu"],
    queryFn: async () => {
      const res = await posyanduApi.list();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
  });

  const { data: kaderData, isLoading: kaderLoading } = useQuery({
    queryKey: ["kader-posyandu"],
    queryFn: async () => {
      const res = await kaderApi.list();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
  });

  const createKaderMutation = useMutation({
    mutationFn: (values) =>
      kaderApi.register({
        nama: values.nama,
        email: values.email,
        password: values.password,
        id_desa: values.desa,
        id_posyandu: values.posyandu,
        status: values.status || false,
        role: "KADER_POSYANDU",
      }),
    onSuccess: () => {
      toast.success("Register Berhasil");
      form.resetFields();
      setIsModalVisible(false);
      queryClient.invalidateQueries(["kader-posyandu"]);
    },
    onError: (err) => toast.error(err?.message ?? "Gagal Registrasi"),
  });

  const updateKaderMutation = useMutation({
    mutationFn: ({ id, values }) =>
      kaderApi.update(id, {
        nama: values.nama,
        email: values.email,
        password: values.password || undefined,
        id_desa: values.desa,
        id_posyandu: values.posyandu,
        status: values.status,
        role: "KADER_POSYANDU",
      }),
    onSuccess: () => {
      toast.success("Kader Posyandu berhasil diperbarui");
      form.resetFields();
      setIsModalVisible(false);
      setModalMode("add");
      setSelectedUser(null);
      queryClient.invalidateQueries(["kader-posyandu"]);
    },
    onError: (err) =>
      toast.error(err?.message ?? "Gagal memperbarui Kader Posyandu"),
  });

  const deleteKaderMutation = useMutation({
    mutationFn: (id) => kaderApi.remove(id),
    onSuccess: () => {
      toast.success("Kader Posyandu berhasil dihapus");
      queryClient.invalidateQueries(["kader-posyandu"]);
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    },
    onError: (err) => {
      toast.error(err?.message ?? "Gagal menghapus Kader Posyandu");
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    },
  });

  const isBusy =
    createKaderMutation.isPending ||
    updateKaderMutation.isPending ||
    deleteKaderMutation.isPending;

  const showDeleteConfirm = (id) => {
    setUserToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) deleteKaderMutation.mutate(userToDelete);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setUserToDelete(null);
  };

  const resetFilters = () => {
    setStatusFilter(null);
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

  const rows = useMemo(() => kaderData ?? [], [kaderData]);
  const stats = [
    { label: "Total Kader", value: rows.length },
    {
      label: "Disetujui",
      value: rows.filter((r) => normalizeStatus(r.status)).length,
      accent: "success",
    },
    {
      label: "Menunggu",
      value: rows.filter((r) => !normalizeStatus(r.status)).length,
      accent: "warning",
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
        const approved = normalizeStatus(getValue());
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
            onClick={() => showDeleteConfirm(row.original.id)}
            disabled={isBusy}
          >
            Hapus
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

  const filteredKaderData = useMemo(() => {
    let data = rows;
    if (statusFilter !== null) {
      data = data.filter((r) => normalizeStatus(r.status) === statusFilter);
    }
    return data;
  }, [rows, statusFilter]);

  return (
    <div>
      {toast.contextHolder}
      <PageHeader
        eyebrow="Akun Pengguna"
        title="Kelola Kader Posyandu"
        subtitle="Daftar kader yang membantu operasional posyandu di desa."
        action={
          <Button
            variant="primary"
            size="lg"
            leadingIcon={<Plus size={20} strokeWidth={2} />}
            onClick={showModal}
            disabled={isBusy}
          >
            Tambah Kader Posyandu
          </Button>
        }
        stats={<InlineStatBar items={stats} loading={kaderLoading} />}
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
        <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px] space-y-[17px]">
          <div className="flex items-center justify-between gap-[17px] flex-wrap">
            <h2 className="text-heading font-semibold text-deep-slate">
              Daftar Kader Posyandu
            </h2>
            <div className="flex items-center gap-[8px] flex-wrap">
              <Select
                value={statusFilter === null ? "ALL" : String(statusFilter)}
                onChange={(v) => setStatusFilter(v === "ALL" ? null : v === "true")}
                disabled={isBusy}
                className="h-[44px] min-w-[160px]"
                placeholder="Semua Status"
              >
                <Select.Option value="ALL">Semua Status</Select.Option>
                <Select.Option value="true">Disetujui</Select.Option>
                <Select.Option value="false">Menunggu</Select.Option>
              </Select>
              <Button variant="ghost" size="sm" onClick={resetFilters} disabled={isBusy}>
                Reset
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredKaderData}
            loading={kaderLoading || isBusy}
            rowKey="id"
            searchPlaceholder="Cari kader..."
            emptyText="Belum ada kader posyandu terdaftar"
          />
        </div>
      </div>

      <Modal
        title={
          <span className="text-heading font-semibold text-deep-slate">
            {modalMode === "add" ? "Registrasi Kader Posyandu" : "Edit Kader Posyandu"}
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          name="input_kader"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Nama</span>}
            name="nama"
            rules={[{ required: true, message: "Nama masih kosong", type: "string" }]}
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

          <Form.Item
            label={
              <span className="text-body-sm font-medium text-deep-slate">
                Konfirmasi Kata Sandi
              </span>
            }
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
              {dataSource?.map((value) => (
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
              disabled={createKaderMutation.isPending || updateKaderMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={createKaderMutation.isPending || updateKaderMutation.isPending}
            >
              {createKaderMutation.isPending || updateKaderMutation.isPending
                ? "Menyimpan..."
                : "Simpan"}
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
          Apakah Anda yakin ingin menghapus Kader Posyandu ini?
        </p>
      </Modal>
    </div>
  );
}
