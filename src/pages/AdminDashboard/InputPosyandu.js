import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Table,
  Modal,
} from "antd";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Container from "react-bootstrap/Container";

export default function InputPosyandu() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchText, setSearchedText] = useState("");
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
      title: "Nama Posyandu",
      dataIndex: "nama",
      key: "nama",
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return String(record.nama).toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: "Alamat",
      dataIndex: "alamat",
      key: "alamat",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div>
          <Button
            type="default"
            size="small"
            onClick={() => handleEdit(record)}
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
            onClick={() => showDeleteConfirm(record.id, record.nama)}
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
      <Container
        fluid
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "20px",
        }}
      >
        {contextHolder}
        <Row justify="space-between">
          <Col span={24}>
            <Button
              type="primary"
              onClick={showModal}
              style={{ marginBottom: 16 }}
              disabled={
                createPosyanduMutation.isPending ||
                updatePosyanduMutation.isPending ||
                deletePosyanduMutation.isPending
              }
            >
              Tambah Posyandu
            </Button>
            <Modal
              title={modalMode === "add" ? "Tambah Posyandu" : "Edit Posyandu"}
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
                  label="Pilih Desa"
                  name="desa"
                  rules={[
                    {
                      required: true,
                      message: "Desa masih kosong!",
                    },
                  ]}
                >
                  <Select
                    listHeight={100}
                    optionFilterProp="children"
                    showSearch
                    placeholder="Pilih Desa"
                    disabled={desaLoading}
                  >
                    {dataDesa &&
                      dataDesa.map((item) => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Nama Posyandu"
                  name="posyandu"
                  rules={[
                    {
                      required: true,
                      message: "Nama Posyandu masih kosong!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Alamat"
                  name="alamat"
                  rules={[
                    {
                      required: true,
                      message: "Alamat masih kosong!",
                    },
                  ]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={
                      createPosyanduMutation.isPending ||
                      updatePosyanduMutation.isPending
                    }
                  >
                    Simpan
                  </Button>
                  <Button
                    style={{ marginLeft: 8 }}
                    onClick={handleCancel}
                    disabled={
                      createPosyanduMutation.isPending ||
                      updatePosyanduMutation.isPending
                    }
                  >
                    Batal
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
            <Table
              title={() => (
                <div className="flex justify-between items-center">
                  <div className="flex justify-start items-center">
                    <h2 className="text-sm font-semibold">Daftar Posyandu</h2>
                  </div>
                  <div className="flex justify-end items-center">
                    <Input.Search
                      placeholder="Search here ..."
                      onSearch={(value) => {
                        setSearchedText(value);
                      }}
                    />
                  </div>
                </div>
              )}
              dataSource={dataSource || []}
              columns={columns}
              loading={
                posyanduLoading ||
                createPosyanduMutation.isPending ||
                updatePosyanduMutation.isPending ||
                deletePosyanduMutation.isPending
              }
              pagination={{ pageSize: 5 }}
              rowKey="id"
              locale={{
                emptyText: "Tidak ada data Posyandu",
              }}
              scroll={{ x: "max-content" }}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}
