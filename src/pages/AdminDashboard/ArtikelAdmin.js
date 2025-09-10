import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Table,
  Spin,
} from "antd";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import FormUpdateDataArtikel from "../../components/form/FormUpdateDataArtikel";
import { formatDate2 } from "../../utilities/Format";
import { FiRotateCcw } from "react-icons/fi";
import useAuth from "../../hook/useAuth";

export default function ArtikelAdmin() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [imageFile, setImageFile] = useState(null);
  const [valueContent, setValueContent] = useState("");
  const [statePage, setStatePage] = useState("Artikel");
  const [isOpenModalUpdateDataArtikel, setIsOpenModalUpdateDataArtikel] =
    useState(false);
  const [searchText, setSearchedText] = useState("");
  const [statePageKateogries, setStatePageKateogries] = useState(false);
  const [dataArtikel, setDataArtikel] = useState(null);
  const queryClient = useQueryClient();

  const user = useAuth();

  // Fetch kategori data using useQuery
  const { data: dataKategori, isLoading: kategoriLoading } = useQuery({
    queryKey: ["kategori"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/kategori`,
        {
          headers: { Authorization: `Bearer ${user?.token?.value}` },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil data kategori");
      const data = await response.json();
      return data.data;
    },
    onError: (err) => {
      console.error(err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data kategori",
      });
    },
    enabled: !!user?.token?.value,
  });

  // Fetch artikel data using useQuery
  const { data: dataSource, isLoading: artikelLoading } = useQuery({
    queryKey: ["artikel"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/artikel`,
        {
          headers: { Authorization: `Bearer ${user?.token?.value}` },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil data artikel");
      const data = await response.json();
      return data.data;
    },
    onError: (err) => {
      console.error(err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data artikel",
      });
    },
    enabled: !!user?.token?.value,
  });

  // Mutation for creating a new artikel
  const createArtikelMutation = useMutation({
    mutationFn: async (values) => {
      if (!imageFile)
        throw new Error("Silakan unggah cover artikel terlebih dahulu!");
      const formData = new FormData();
      formData.append("judul", values.judul);
      formData.append("kategori", values.kategori);
      formData.append("penulis", values.penulis);
      formData.append("content", valueContent);
      formData.append("image", imageFile);

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/artikel`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${user?.token?.value}` },
          body: formData,
        }
      );
      if (!response.ok) throw new Error("Data gagal tersimpan");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Data berhasil tersimpan",
      });
      form.resetFields();
      setValueContent("");
      setImageFile(null);
      queryClient.invalidateQueries(["artikel"]);
    },
    onError: (err) => {
      console.error(err);
      messageApi.open({
        type: "error",
        content: err.message || "Data gagal tersimpan",
      });
    },
  });

  // Mutation for creating a new kategori
  const createKategoriMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/kategori`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.token?.value}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      if (!response.ok) throw new Error("Data gagal tersimpan");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Data berhasil tersimpan",
      });
      form.resetFields();
      setValueContent("");
      setImageFile(null);
      setStatePageKateogries(false);
      queryClient.invalidateQueries(["kategori"]);
    },
    onError: (err) => {
      console.error(err);
      messageApi.open({
        type: "error",
        content: err.message || "Data gagal tersimpan",
      });
    },
  });

  // Mutation for deleting an artikel
  const deleteArtikelMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/artikel/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.token?.value}` },
        }
      );
      if (!response.ok) throw new Error("Data gagal dihapus");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Data berhasil dihapus",
      });
      queryClient.invalidateQueries(["artikel"]);
    },
    onError: (err) => {
      console.error(err);
      messageApi.open({
        type: "error",
        content: err.message || "Data gagal dihapus",
      });
    },
  });

  // Validate image file
  const validateImage = (file) => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/svg+xml",
    ];
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes

    if (!file) {
      return Promise.reject(new Error("Cover masih kosong!"));
    }
    if (!validTypes.includes(file.type)) {
      return Promise.reject(
        new Error(
          "Format file tidak valid! Hanya JPEG, PNG, JPG, GIF, atau SVG yang diperbolehkan."
        )
      );
    }
    if (file.size > maxSize) {
      return Promise.reject(new Error("Ukuran file maksimal 2MB!"));
    }
    return Promise.resolve();
  };

  const onFinish = (values) => {
    if (!statePageKateogries) {
      createArtikelMutation.mutate(values);
    } else {
      createKategoriMutation.mutate(values);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form Failed:", errorInfo);
  };

  const columns = [
    {
      title: "Judul Berita",
      dataIndex: "judul",
      key: "judul",
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return String(record.judul).toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: "Tanggal Upload",
      dataIndex: "kategori",
      key: "kategori",
      render: (_, record) => formatDate2(record.updated_at),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex">
          <button
            type="button"
            className="buttonUpdateArtikel"
            onClick={() => {
              setDataArtikel(record);
              setIsOpenModalUpdateDataArtikel(true);
            }}
            disabled={
              createArtikelMutation.isPending ||
              createKategoriMutation.isPending ||
              deleteArtikelMutation.isPending
            }
          >
            Update
          </button>
          <button
            type="button"
            className="buttonDeleteArtikel"
            onClick={() => {
              Modal.confirm({
                title: "Apakah anda yakin?",
                icon: <ExclamationCircleOutlined />,
                content: "Data yang dihapus tidak dapat dikembalikan",
                okText: "Ya",
                cancelText: "Tidak",
                onOk: () => {
                  deleteArtikelMutation.mutate(record.id);
                },
              });
            }}
            disabled={
              createArtikelMutation.isPending ||
              createKategoriMutation.isPending ||
              deleteArtikelMutation.isPending
            }
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

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
        {(artikelLoading || kategoriLoading) && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/80 p-8 rounded-lg">
            <Spin size="large" />
          </div>
        )}
        <Row justify="space-between">
          <Col span={24}>
            <div
              style={{
                justifyContent: "center",
                display: "flex",
                marginBottom: "20px",
              }}
            >
              <button
                className="button_kirim"
                onClick={() => setStatePage("Artikel")}
                disabled={
                  createArtikelMutation.isPending ||
                  createKategoriMutation.isPending ||
                  deleteArtikelMutation.isPending
                }
              >
                Artikel
              </button>
              <button
                className="button_kirim"
                onClick={() => setStatePage("Riwayat")}
                disabled={
                  createArtikelMutation.isPending ||
                  createKategoriMutation.isPending ||
                  deleteArtikelMutation.isPending
                }
              >
                Riwayat
              </button>
            </div>
          </Col>
          <Col span={24}>
            {statePage === "Artikel" ? (
              <Form
                form={form}
                name="basic"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                layout="horizontal"
              >
                <Form.Item
                  label="Pilih kategori"
                  name="kategori"
                  rules={[
                    {
                      required: !statePageKateogries,
                      message: "Kategori masih kosong!",
                    },
                  ]}
                >
                  <Select
                    size="4"
                    listHeight={100}
                    optionFilterProp="children"
                    showSearch
                    placeholder="Pilih Kategori"
                    disabled={
                      kategoriLoading ||
                      createArtikelMutation.isPending ||
                      createKategoriMutation.isPending
                    }
                  >
                    <Select.Option value="add">
                      <Button
                        onClick={() => setStatePageKateogries(true)}
                        disabled={
                          createArtikelMutation.isPending ||
                          createKategoriMutation.isPending
                        }
                      >
                        Tambah Kategori
                      </Button>
                    </Select.Option>
                    {statePageKateogries ? (
                      <Select.Option></Select.Option>
                    ) : (
                      dataKategori?.map((item) => (
                        <Select.Option key={item.id} value={item.name}>
                          {item.name}
                        </Select.Option>
                      ))
                    )}
                  </Select>
                </Form.Item>
                {statePageKateogries && (
                  <Form.Item
                    style={{ width: "100%" }}
                    label="Tambah Kategori"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Nama Kategori masih kosong!",
                      },
                    ]}
                  >
                    <Input placeholder="Masukkan Nama Kategori" />
                  </Form.Item>
                )}
                {!statePageKateogries && (
                  <>
                    <Form.Item
                      style={{ width: "100%" }}
                      label="Judul"
                      name="judul"
                      rules={[
                        { required: true, message: "Judul masih kosong!" },
                      ]}
                    >
                      <Input placeholder="Masukkan judul" />
                    </Form.Item>
                    <Form.Item
                      style={{ width: "100%" }}
                      label="Nama penulis"
                      name="penulis"
                      rules={[
                        { required: true, message: "Penulis masih kosong!" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      style={{ width: "100%" }}
                      label="Unggah cover artikel"
                      name="image"
                      rules={[
                        {
                          validator: (_, value) => validateImage(imageFile),
                        },
                      ]}
                    >
                      <div className="flex justify-center items-center w-full">
                        <label
                          htmlFor="import_pelanggan"
                          className="flex flex-col justify-center items-center w-full h-64 bg-white rounded-lg border-2 border-dashed cursor-pointer"
                          style={{ borderColor: "#FFB4B4" }}
                        >
                          {imageFile ? (
                            <div className="flex flex-col justify-center items-center w-full h-full">
                              {imageFile?.name}
                            </div>
                          ) : (
                            <div className="flex flex-col justify-center items-center pt-5 pb-6">
                              <svg
                                aria-hidden="true"
                                className="mb-3 w-10 h-10 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                ></path>
                              </svg>
                              <p
                                className="mb-2 text-sm"
                                style={{ color: "#b41318" }}
                              >
                                <span className="font-semibold">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "#b41318" }}
                              >
                                JPEG, PNG, JPG, GIF, SVG (Maks. 2MB)
                              </p>
                            </div>
                          )}
                          <input
                            id="import_pelanggan"
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.svg"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                validateImage(file)
                                  .then(() => {
                                    setImageFile(file);
                                    form.validateFields(["image"]);
                                  })
                                  .catch((error) => {
                                    messageApi.open({
                                      type: "error",
                                      content: error.message,
                                    });
                                    setImageFile(null);
                                    form.validateFields(["image"]);
                                  });
                              } else {
                                setImageFile(null);
                                form.validateFields(["image"]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </Form.Item>
                    <Form.Item
                      style={{ width: "100%", flexDirection: "row" }}
                      label="Paragraf"
                      name="content"
                      rules={[
                        {
                          validator: (_, value) =>
                            valueContent
                              ? Promise.resolve()
                              : Promise.reject(
                                  new Error("Konten masih kosong!")
                                ),
                        },
                      ]}
                    >
                      <ReactQuill
                        theme="snow"
                        value={valueContent}
                        onChange={setValueContent}
                      />
                    </Form.Item>
                  </>
                )}
                <Col span={24} align="center">
                  <Form.Item>
                    <button
                      type="submit"
                      className="button_kirim mx-5"
                      disabled={
                        createArtikelMutation.isPending ||
                        createKategoriMutation.isPending
                      }
                    >
                      {statePageKateogries
                        ? "Tambah kategori"
                        : "Tambah artikel"}
                    </button>
                    {statePageKateogries && (
                      <button
                        type="button"
                        className="button_kirim mx-5"
                        onClick={() => setStatePageKateogries(false)}
                        disabled={
                          createArtikelMutation.isPending ||
                          createKategoriMutation.isPending
                        }
                      >
                        Batal
                      </button>
                    )}
                  </Form.Item>
                </Col>
              </Form>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold">Daftar Artikel</h2>
                  <Input.Search
                    placeholder="Search here ..."
                    onSearch={(value) => setSearchedText(value)}
                    className="w-full sm:w-64"
                  />
                </div>
                <Table
                  title={() => (
                    <div className="flex justify-between items-center">
                      <div className="flex justify-start items-center">
                        <h2 className="text-sm font-semibold">
                          Daftar Artikel
                        </h2>
                      </div>
                      <div className="flex justify-end items-center">
                        <Input.Search
                          placeholder="Search here ..."
                          onSearch={(value) => setSearchedText(value)}
                          className="w-full sm:w-64"
                        />
                      </div>
                    </div>
                  )}
                  dataSource={dataSource || []}
                  columns={columns}
                  loading={
                    artikelLoading ||
                    createArtikelMutation.isPending ||
                    createKategoriMutation.isPending ||
                    deleteArtikelMutation.isPending
                  }
                  pagination={{ pageSize: 5 }}
                  className="w-full"
                  scroll={{ x: "max-content" }}
                />
                <div className="flex justify-center mt-4">
                  <button
                    className="button_kirim"
                    onClick={() => queryClient.invalidateQueries(["artikel"])}
                    disabled={
                      createArtikelMutation.isPending ||
                      createKategoriMutation.isPending ||
                      deleteArtikelMutation.isPending
                    }
                  >
                    <FiRotateCcw />
                  </button>
                </div>
              </div>
            )}
          </Col>
          <Col>
            <FormUpdateDataArtikel
              isOpen={isOpenModalUpdateDataArtikel}
              onCancel={() => setIsOpenModalUpdateDataArtikel(false)}
              fetch={() => queryClient.invalidateQueries(["artikel"])}
              data={dataArtikel}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}
