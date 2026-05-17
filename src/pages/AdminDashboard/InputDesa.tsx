// @ts-nocheck
import { Form, Input, Modal } from "antd";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import InlineStatBar from "../../components/ui/InlineStatBar";
import { useToast } from "../../components/ui/Toast";
import { desaApi } from "../../api/desa.api";
import { isThisMonth } from "../../utilities/isThisMonth";

export default function InputDesa() {
  const [form] = Form.useForm();
  const toast = useToast();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const { data: dataSource, isLoading } = useQuery({
    queryKey: ["desa"],
    queryFn: async () => {
      const res = await desaApi.list();
      return res.data ?? [];
    },
  });

  const deleteDesaMutation = useMutation({
    mutationFn: (id) => desaApi.remove(id),
    onSuccess: () => {
      toast.success("Desa berhasil dihapus");
      queryClient.invalidateQueries(["desa"]);
    },
    onError: (err) => toast.error(err?.message ?? "Gagal menghapus desa"),
  });

  const createDesaMutation = useMutation({
    mutationFn: (values) =>
      desaApi.create({
        name: values.name,
        password: values.password,
        password_confirmation: values.password_confirmation,
      }),
    onSuccess: () => {
      toast.success("Desa dan akun berhasil disimpan");
      queryClient.invalidateQueries(["desa"]);
      form.resetFields();
      setIsModalVisible(false);
    },
    onError: (err) => toast.error(err?.message ?? "Data gagal tersimpan"),
  });

  const rows = dataSource ?? [];
  const stats = [
    { label: "Total Desa", value: rows.length },
    {
      label: "Baru Bulan Ini",
      value: rows.filter((d) => isThisMonth(d.created_at)).length,
      accent: "primary",
    },
  ];

  const showDeleteConfirm = (id, name) => {
    Modal.confirm({
      title: "Hapus desa?",
      icon: <AlertTriangle size={20} className="text-danger" />,
      content: `Desa '` + name + `' akan dihapus.`,
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: () => deleteDesaMutation.mutate(id),
    });
  };

  const columns = [
    { accessorKey: "name", header: "Nama Desa", enableSorting: true },
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

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      {toast.contextHolder}
      <PageHeader
        eyebrow="Data Master"
        title="Kelola Desa"
        subtitle="Daftar desa yang terdaftar dalam sistem posyandu."
        action={
          <Button
            variant="primary"
            size="lg"
            leadingIcon={<Plus size={20} strokeWidth={2} />}
            onClick={() => setIsModalVisible(true)}
            disabled={createDesaMutation.isPending}
          >
            Tambah Desa
          </Button>
        }
        stats={<InlineStatBar items={stats} loading={isLoading} />}
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
        <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px]">
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading || createDesaMutation.isPending || deleteDesaMutation.isPending}
            rowKey="id"
            searchPlaceholder="Cari desa..."
            emptyText="Belum ada desa terdaftar"
          />
        </div>
      </div>

      <Modal
        title={<span className="text-heading font-semibold text-deep-slate">Tambah Desa</span>}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          name="tambah_desa"
          onFinish={(v) => createDesaMutation.mutate(v)}
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
            label={<span className="text-body-sm font-medium text-deep-slate">Konfirmasi Kata Sandi</span>}
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
            <Button variant="default" size="md" onClick={handleCancel} disabled={createDesaMutation.isPending}>
              Batal
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={createDesaMutation.isPending}>
              {createDesaMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
