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
  Spin,
} from "antd";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import useAuth from "../../hook/useAuth";

export default function RegisterTenagaKesehatan() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchText, setSearchedText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const queryClient = useQueryClient();

  const user = useAuth();

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
    enabled: !!user?.token?.value,
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
    enabled: !!user?.token?.value,
  });

  // Fetch tenaga-kesehatan data using useQuery
  const { data: tenagaKesehatanData, isLoading: tenagaKesehatanLoading } =
    useQuery({
      queryKey: ["tenaga-kesehatan"],
      queryFn: async () => {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/posyandu/tenaga-kesehatan`,
          {
            headers: { Authorization: `Bearer ${user?.token?.value}` },
          }
        );
        if (!response.ok)
          throw new Error("Gagal mengambil data Tenaga Kesehatan");
        const data = await response.json();
        return data.data;
      },
      onError: (err) => {
        console.error("Fetch Error:", err);
        messageApi.open({
          type: "error",
          content: err.message || "Gagal mengambil data Tenaga Kesehatan",
        });
      },
      enabled: !!user?.token?.value,
    });

  // Mutation for creating a new Tenaga Kesehatan
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
      messageApi.open({
        type: "success",
        content: "Register Berhasil",
      });
      form.resetFields();
      setIsModalVisible(false);
      queryClient.invalidateQueries(["tenaga-kesehatan"]);
    },
    onError: (error) => {
      console.error("Register Error:", error);
      messageApi.open({
        type: "error",
        content: error.message || "Gagal Registrasi",
      });
    },
  });

  // Mutation for deleting a Tenaga Kesehatan
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
      messageApi.open({
        type: "success",
        content: "Tenaga Kesehatan berhasil dihapus",
      });
      queryClient.invalidateQueries(["tenaga-kesehatan"]);
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    },
    onError: (err) => {
      console.error("Delete Error:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal menghapus Tenaga Kesehatan",
      });
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    },
  });

  // Function to show delete confirmation modal
  const showDeleteConfirm = (id) => {
    setUserToDelete(id);
    setIsDeleteModalVisible(true);
  };

  // Function to handle delete confirmation
  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteTenagaKesehatanMutation.mutate(userToDelete);
    }
  };

  // Function to handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setUserToDelete(null);
  };

  // Table columns configuration
  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
      filteredValue: [searchText],
      onFilter: (value, record) =>
        String(record.nama).toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Desa",
      dataIndex: ["desa", "name"],
      key: "desa",
      render: (text) => text || "N/A",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div>
          <Button
            type="dashed"
            danger
            size="small"
            onClick={() => showDeleteConfirm(record.id)}
            disabled={
              createTenagaKesehatanMutation.isPending ||
              deleteTenagaKesehatanMutation.isPending
            }
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const onFinish = (values) => {
    createTenagaKesehatanMutation.mutate(values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form Failed:", errorInfo);
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
          <Col sm={24}>
            <Button
              type="primary"
              onClick={showModal}
              style={{ marginBottom: 16 }}
              disabled={
                createTenagaKesehatanMutation.isPending ||
                deleteTenagaKesehatanMutation.isPending
              }
            >
              Tambah Tenaga Kesehatan
            </Button>
            <Modal
              title="Registrasi Tenaga Kesehatan"
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
                  label="Nama"
                  name="nama"
                  rules={[
                    {
                      required: true,
                      message: "Nama masih kosong!",
                      type: "string",
                    },
                  ]}
                >
                  <Input placeholder="Nama Lengkap" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Email masih kosong!",
                    },
                    {
                      type: "email",
                      message: "Email belum sesuai!",
                    },
                  ]}
                >
                  <Input placeholder="user@email.com" />
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
                      pattern: "^.{8,}$",
                      message: "Password minimal 8 karakter",
                    },
                  ]}
                >
                  <Input.Password placeholder="password" />
                </Form.Item>

                <Form.Item
                  label="Confirm Password"
                  name="confirm"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                      message: "Silahkan Confirm Password Anda!",
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
                  <Input.Password placeholder="Confirm Password" />
                </Form.Item>

                <Form.Item
                  name="desa"
                  label="Desa"
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
                      dataDesa.map((value) => (
                        <Select.Option key={value.id} value={value.id}>
                          {value.name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={createTenagaKesehatanMutation.isPending}
                  >
                    Simpan
                  </Button>
                  <Button
                    style={{ marginLeft: 8 }}
                    onClick={handleCancel}
                    disabled={createTenagaKesehatanMutation.isPending}
                  >
                    Batal
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="Konfirmasi Hapus"
              open={isDeleteModalVisible}
              onOk={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
              okText="Hapus"
              cancelText="Batal"
              okButtonProps={{ danger: true }}
            >
              <p>Apakah Anda yakin ingin menghapus Tenaga Kesehatan ini?</p>
            </Modal>

            <Table
              title={() => (
                <div className="flex justify-between items-center">
                  <div className="flex justify-start items-center">
                    <h2 className="text-sm font-semibold">
                      Daftar Tenaga Kesehatan
                    </h2>
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
              dataSource={tenagaKesehatanData || []}
              columns={columns}
              loading={
                tenagaKesehatanLoading ||
                createTenagaKesehatanMutation.isPending ||
                deleteTenagaKesehatanMutation.isPending
              }
              pagination={{ pageSize: 5 }}
              rowKey="id"
              locale={{
                emptyText: "Tidak ada data Tenaga Kesehatan",
              }}
              scroll={{ x: "max-content" }}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}
