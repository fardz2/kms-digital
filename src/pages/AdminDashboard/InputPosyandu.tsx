// @ts-nocheck
import { Form, Input, Select, Modal } from "antd";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import InlineStatBar from "../../components/ui/InlineStatBar";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { isThisMonth } from "../../utilities/isThisMonth";
import { useToast } from "../../components/ui/Toast";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { desaApi } from "../../api/desa.api";
import { posyanduApi } from "../../api/posyandu.api";

export default function InputPosyandu() {
  const [form] = Form.useForm();
  const toast = useToast();
  const confirm = useConfirmDialog();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedPosyandu, setSelectedPosyandu] = useState(null);
  const queryClient = useQueryClient();

  const { data: dataDesa, isLoading: desaLoading } = useQuery({
    queryKey: ["desa"],
    queryFn: async () => {
      const res = await desaApi.list();
      return res.data ?? [];
    },
  });

  const { data: dataSource, isLoading: posyanduLoading } = useQuery({
    queryKey: ["posyandu"],
    queryFn: async () => {
      const res = await posyanduApi.list();
      return res.data ?? [];
    },
  });

  const createPosyanduMutation = useMutation({
    mutationFn: (values) =>
      posyanduApi.create({
        id_desa: values.desa,
        nama: values.posyandu,
        alamat: values.alamat,
      }),
    onSuccess: () => {
      toast.success("Posyandu berhasil disimpan");
      queryClient.invalidateQueries(["posyandu"]);
      form.resetFields();
      setIsModalVisible(false);
      setModalMode("add");
      setSelectedPosyandu(null);
    },
    onError: (err) => toast.error(err?.message ?? "Data gagal tersimpan"),
  });

  const updatePosyanduMutation = useMutation({
    mutationFn: ({ id, values }) =>
      posyanduApi.update(id, {
        id_desa: values.desa,
        nama: values.posyandu,
        alamat: values.alamat,
      }),
    onSuccess: () => {
      toast.success("Posyandu berhasil diperbarui");
      queryClient.invalidateQueries(["posyandu"]);
      form.resetFields();
      setIsModalVisible(false);
      setModalMode("add");
      setSelectedPosyandu(null);
    },
    onError: (err) => toast.error(err?.message ?? "Gagal memperbarui posyandu"),
  });

  const deletePosyanduMutation = useMutation({
    mutationFn: (id) => posyanduApi.remove(id),
    onSuccess: () => {
      toast.success("Posyandu berhasil dihapus");
      queryClient.invalidateQueries(["posyandu"]);
    },
    onError: (err) => toast.error(err?.message ?? "Gagal menghapus posyandu"),
  });

  const isBusy =
    createPosyanduMutation.isPending ||
    updatePosyanduMutation.isPending ||
    deletePosyanduMutation.isPending;

  const rows = dataSource ?? [];
  const stats = [
    { label: "Total Posyandu", value: rows.length },
    {
      label: "Tersebar di",
      value: new Set(rows.map((p) => p.id_desa).filter(Boolean)).size + " desa",
      accent: "neutral",
    },
    {
      label: "Baru Bulan Ini",
      value: rows.filter((p) => isThisMonth(p.created_at)).length,
      accent: "primary",
    },
  ];

  const showDeleteConfirm = (id, nama) => {
    confirm({
      title: "Konfirmasi Hapus",
      content: `Apakah Anda yakin ingin menghapus posyandu "${nama}"?`,
      okText: "Hapus",
      okButtonProps: { danger: true },
      cancelText: "Batal",
      onOk: () => {
        deletePosyanduMutation.mutate(id);
      },
    });
  };

  const handleEdit = (record) => {
    setModalMode("edit");
    setSelectedPosyandu(record);
    form.setFieldsValue({
      desa: record.id_desa,
      posyandu: record.nama,
      alamat: record.alamat,
    });
    setIsModalVisible(true);
  };

  const columns = [
    {
      accessorKey: "nama",
      header: "Nama Posyandu",
      enableSorting: true,
    },
    {
      accessorKey: "alamat",
      header: "Alamat",
      enableSorting: true,
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
            onClick={() => showDeleteConfirm(row.original.id, row.original.nama)}
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
      createPosyanduMutation.mutate(values);
    } else if (modalMode === "edit" && selectedPosyandu) {
      updatePosyanduMutation.mutate({ id: selectedPosyandu.id, values });
    }
  };

  const showModal = () => {
    setModalMode("add");
    setSelectedPosyandu(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setModalMode("add");
    setSelectedPosyandu(null);
    form.resetFields();
  };

  return (
    <div>
      {toast.contextHolder}
      <PageHeader
        eyebrow="Data Master"
        title="Kelola Posyandu"
        subtitle="Daftar posyandu yang terdaftar di setiap desa."
        action={
          <Button
            variant="primary"
            size="lg"
            leadingIcon={<Plus size={20} strokeWidth={2} />}
            onClick={showModal}
            disabled={isBusy}
          >
            Tambah Posyandu
          </Button>
        }
        stats={<InlineStatBar items={stats} loading={posyanduLoading} />}
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
        <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px]">
          <DataTable
            columns={columns}
            data={dataSource || []}
            loading={posyanduLoading || isBusy}
            rowKey="id"
            searchPlaceholder="Cari posyandu..."
            emptyText="Belum ada posyandu terdaftar"
          />
        </div>
      </div>

      <Modal
        title={
          <span className="text-heading font-semibold text-deep-slate">
            {modalMode === "add" ? "Tambah Posyandu" : "Edit Posyandu"}
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          name="input_posyandu"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Pilih Desa</span>}
            name="desa"
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
              {dataDesa?.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Nama Posyandu</span>}
            name="posyandu"
            rules={[{ required: true, message: "Nama Posyandu masih kosong" }]}
          >
            <Input className="h-[52px] text-base" placeholder="Masukkan nama posyandu" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Alamat</span>}
            name="alamat"
            rules={[{ required: true, message: "Alamat masih kosong" }]}
          >
            <Input.TextArea rows={3} className="text-base" placeholder="Alamat lengkap posyandu" />
          </Form.Item>
          <div className="flex gap-[13px] justify-end pt-[13px]">
            <Button
              variant="default"
              size="md"
              onClick={handleCancel}
              disabled={createPosyanduMutation.isPending || updatePosyanduMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={createPosyanduMutation.isPending || updatePosyanduMutation.isPending}
            >
              Simpan
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
