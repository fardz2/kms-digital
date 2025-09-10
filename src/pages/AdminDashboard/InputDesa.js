import { Button, Col, Form, Input, message, Row, Table, Modal } from "antd";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Container from "react-bootstrap/Container";
import "./Search.css";

export default function InputDesa() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchText, setSearchedText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  // Fetch desa data using useQuery
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

  // Mutation for deleting a desa
  const deleteDesaMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/desa/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Gagal menghapus desa");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Desa berhasil dihapus",
      });
      queryClient.invalidateQueries(["desa"]);
    },
    onError: (err) => {
      messageApi.open({
        type: "error",
        content: err.message || "Gagal menghapus desa",
      });
    },
  });

  // Mutation for creating a new desa
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
      messageApi.open({
        type: "success",
        content: "Desa dan akun berhasil disimpan",
      });
      queryClient.invalidateQueries(["desa"]);
      form.resetFields();
      setIsModalVisible(false);
    },
    onError: (err) => {
      messageApi.open({
        type: "error",
        content: err.message || "Data gagal tersimpan",
      });
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
      onCancel() {
        console.log("Hapus dibatalkan");
      },
    });
  };

  const columns = [
    {
      title: "Nama Desa",
      dataIndex: "name",
      key: "name",
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return String(record.name).toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          className="button_delete"
          onClick={() => showDeleteConfirm(record.id, record.name)}
          type="dashed"
          danger
          disabled={deleteDesaMutation.isPending}
        >
          Delete
        </Button>
      ),
    },
  ];

  const onFinish = (values) => {
    createDesaMutation.mutate(values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
              disabled={createDesaMutation.isPending}
            >
              Tambah Desa
            </Button>
            <Modal
              title="Tambah Desa"
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
                  label="Nama Desa"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Nama Desa masih kosong!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Password masih kosong!",
                    },
                    {
                      min: 8,
                      message: "Password minimal 8 karakter",
                    },
                  ]}
                >
                  <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item
                  label="Confirm Password"
                  name="password_confirmation"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                      message: "Silakan konfirmasi password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Password tidak sesuai!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Konfirmasi Password" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={createDesaMutation.isPending}
                  >
                    Simpan
                  </Button>
                  <Button
                    style={{ marginLeft: 8 }}
                    onClick={handleCancel}
                    disabled={createDesaMutation.isPending}
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
                    <h2 className="text-sm font-semibold">Daftar Desa</h2>
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
                isLoading ||
                createDesaMutation.isPending ||
                deleteDesaMutation.isPending
              }
              pagination={{ pageSize: 5 }}
              rowKey="id"
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}
