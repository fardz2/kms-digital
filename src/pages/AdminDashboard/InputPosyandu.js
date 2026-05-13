import { Form, Input, message, Select, Modal } from "antd";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function InputPosyandu() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedPosyandu, setSelectedPosyandu] = useState(null);
  const queryClient = useQueryClient();

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
      messageApi.error(err.message || "Gagal mengambil data desa");
    },
  });

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
      messageApi.error(err.message || "Gagal mengambil data posyandu");
    },
  });

  const createPosyanduMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_desa: values.desa,
            nama: values.posyandu,
            alamat: values.alamat,
          }),
        }
      );
      if (!response.ok) throw new Error("Data gagal tersimpan");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Posyandu berhasil disimpan");
      queryClient.invalidateQueries(["posyandu"]);
      form.resetFields();
      setIsModalVisible(false);
      setModalMode("add");
      setSelectedPosyandu(null);
    },
    onError: (err) => {
      messageApi.error(err.message || "Data gagal tersimpan");
    },
  });

  const updatePosyanduMutation = useMutation({
    mutationFn: async ({ id, values }) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_desa: values.desa,
            nama: values.posyandu,
            alamat: values.alamat,
          }),
        }
      );
      if (!response.ok) throw new Error("Gagal memperbarui posyandu");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Posyandu berhasil diperbarui");
      queryClient.invalidateQueries(["posyandu"]);
      form.resetFields();
      setIsModalVisible(false);
      setModalMode("add");
      setSelectedPosyandu(null);
    },
    onError: (err) => {
      messageApi.error(err.message || "Gagal memperbarui posyandu");
    },
  });

  const deletePosyanduMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/${id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Gagal menghapus posyandu");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Posyandu berhasil dihapus");
      queryClient.invalidateQueries(["posyandu"]);
    },
    onError: (err) => {
      messageApi.error(err.message || "Gagal menghapus posyandu");
    },
  });

  const isBusy =
    createPosyanduMutation.isPending ||
    updatePosyanduMutation.isPending ||
    deletePosyanduMutation.isPending;

  const showDeleteConfirm = (id, nama) => {
    Modal.confirm({
      title: "Konfirmasi Hapus",
      content: `Apakah Anda yakin ingin menghapus posyandu "${nama}"?`,
      okText: "Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk() {
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
    <div className="space-y-[25px]">
      {contextHolder}
      <div className="flex items-start justify-between gap-[25px] flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[13px]">
            Data Master
          </p>
          <h1 className="text-display font-bold text-deep-slate leading-[1.05] tracking-tight">
            Kelola Posyandu
          </h1>
          <p className="text-body-lg text-graphite mt-[13px] max-w-[560px]">
            Daftar posyandu yang terdaftar di setiap desa.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          leadingIcon={<Plus size={20} strokeWidth={2} />}
          onClick={showModal}
          disabled={isBusy}
        >
          Tambah Posyandu
        </Button>
      </div>

      <div className="bg-white border border-light-ash rounded-default p-[25px] shadow-card">
        <DataTable
          columns={columns}
          data={dataSource || []}
          loading={posyanduLoading || isBusy}
          rowKey="id"
          title={
            <h2 className="text-heading font-semibold text-deep-slate">
              Daftar Posyandu
            </h2>
          }
          searchPlaceholder="Cari posyandu..."
          emptyText="Tidak ada data Posyandu"
        />
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
