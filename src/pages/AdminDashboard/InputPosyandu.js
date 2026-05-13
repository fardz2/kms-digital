import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Modal,
} from "antd";
import DataTable from "../../components/ui/DataTable";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function InputPosyandu() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedPosyandu, setSelectedPosyandu] = useState(null);
  const queryClient = useQueryClient();

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
  });

  // Mutation for creating a new posyandu
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
      messageApi.open({
        type: "success",
        content: "Posyandu berhasil disimpan",
      });
      queryClient.invalidateQueries(["posyandu"]);
      form.resetFields();
      setIsModalVisible(false);
      setModalMode("add");
      setSelectedPosyandu(null);
    },
    onError: (err) => {
      messageApi.open({
        type: "error",
        content: err.message || "Data gagal tersimpan",
      });
    },
  });

  // Mutation for updating a posyandu
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
      messageApi.open({
        type: "success",
        content: "Posyandu berhasil diperbarui",
      });
      queryClient.invalidateQueries(["posyandu"]);
      form.resetFields();
      setIsModalVisible(false);
      setModalMode("add");
      setSelectedPosyandu(null);
    },
    onError: (err) => {
      messageApi.open({
        type: "error",
        content: err.message || "Gagal memperbarui posyandu",
      });
    },
  });

  // Mutation for deleting a posyandu
  const deletePosyanduMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Gagal menghapus posyandu");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Posyandu berhasil dihapus",
      });
      queryClient.invalidateQueries(["posyandu"]);
    },
    onError: (err) => {
      messageApi.open({
        type: "error",
        content: err.message || "Gagal menghapus posyandu",
      });
    },
  });

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
      onCancel() {
        console.log("Hapus dibatalkan");
      },
    });
  };

  const handleEdit = (record) => {
    setModalMode("edit");
    setSelectedPosyandu(record);
    form.setFieldsValue({
      desa: record.id_desa, // Use id_desa instead of desa?.id
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
        <div>
          <Button
            type="default"
            size="small"
            onClick={() => handleEdit(row.original)}
            style={{ marginRight: 8 }}
            disabled={
              createPosyanduMutation.isPending ||
              updatePosyanduMutation.isPending ||
              deletePosyanduMutation.isPending
            }
          >
            Edit
          </Button>
          <Button
            type="dashed"
            danger
            size="small"
            onClick={() => showDeleteConfirm(row.original.id, row.original.nama)}
            disabled={
              createPosyanduMutation.isPending ||
              updatePosyanduMutation.isPending ||
              deletePosyanduMutation.isPending
            }
          >
            Delete
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

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
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
    <>
      <div className="bg-white rounded-card shadow-card p-6">
        {contextHolder}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-h2 font-display text-neutral-900">Kelola Posyandu</h1>
            <button
              onClick={showModal}
              disabled={
                createPosyanduMutation.isPending ||
                updatePosyanduMutation.isPending ||
                deletePosyanduMutation.isPending
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm disabled:opacity-60 transition-colors"
            >
              + Tambah Posyandu
            </button>
          </div>
          <Modal
            title={
              <span className="text-h3 font-display text-neutral-900">
                {modalMode === "add" ? "Tambah Posyandu" : "Edit Posyandu"}
              </span>
            }
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
                label={<span className="text-caption text-neutral-700">Pilih Desa</span>}
                name="desa"
                rules={[{ required: true, message: "Desa masih kosong" }]}
              >
                <Select
                  listHeight={100}
                  optionFilterProp="children"
                  showSearch
                  placeholder="Pilih Desa"
                  disabled={desaLoading}
                  className="h-11"
                >
                  {dataDesa?.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={<span className="text-caption text-neutral-700">Nama Posyandu</span>}
                name="posyandu"
                rules={[{ required: true, message: "Nama Posyandu masih kosong" }]}
              >
                <Input className="h-11 text-base" />
              </Form.Item>

              <Form.Item
                label={<span className="text-caption text-neutral-700">Alamat</span>}
                name="alamat"
                rules={[{ required: true, message: "Alamat masih kosong" }]}
              >
                <Input.TextArea rows={3} className="text-base" />
              </Form.Item>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={
                    createPosyanduMutation.isPending ||
                    updatePosyanduMutation.isPending
                  }
                  className="px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    createPosyanduMutation.isPending ||
                    updatePosyanduMutation.isPending
                  }
                  className="px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm disabled:opacity-60"
                >
                  Simpan
                </button>
              </div>
            </Form>
          </Modal>
          <DataTable
            columns={columns}
            data={dataSource || []}
            loading={
              posyanduLoading ||
              createPosyanduMutation.isPending ||
              updatePosyanduMutation.isPending ||
              deletePosyanduMutation.isPending
            }
            rowKey="id"
            title={<h2 className="text-h3 font-display text-neutral-900">Daftar Posyandu</h2>}
            searchPlaceholder="Cari posyandu..."
            emptyText="Tidak ada data Posyandu"
          />
        </div>
      </div>
    </>
  );
}
