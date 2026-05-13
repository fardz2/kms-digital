import { Form, Input, message, Modal, Select, Spin } from "antd";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import FormUpdateDataArtikel from "../../components/form/FormUpdateDataArtikel";
import { formatDate2 } from "../../utilities/Format";
import {
  RotateCcw,
  Pencil,
  Trash2,
  UploadCloud,
  AlertTriangle,
} from "lucide-react";
import useAuth from "../../hook/useAuth";

export default function ArtikelAdmin() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [imageFile, setImageFile] = useState(null);
  const [valueContent, setValueContent] = useState("");
  const [statePage, setStatePage] = useState("Artikel");
  const [isOpenModalUpdateDataArtikel, setIsOpenModalUpdateDataArtikel] =
    useState(false);
  const [statePageKateogries, setStatePageKateogries] = useState(false);
  const [dataArtikel, setDataArtikel] = useState(null);
  const queryClient = useQueryClient();

  const user = useAuth();

  const { data: dataKategori, isLoading: kategoriLoading } = useQuery({
    queryKey: ["kategori"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/kategori`,
        { headers: { Authorization: `Bearer ${user?.token?.value}` } }
      );
      if (!response.ok) throw new Error("Gagal mengambil data kategori");
      const data = await response.json();
      return data.data;
    },
    onError: (err) => {
      messageApi.error(err.message || "Gagal mengambil data kategori");
    },
    enabled: !!user?.token?.value,
  });

  const { data: dataSource, isLoading: artikelLoading } = useQuery({
    queryKey: ["artikel"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/artikel`,
        { headers: { Authorization: `Bearer ${user?.token?.value}` } }
      );
      if (!response.ok) throw new Error("Gagal mengambil data artikel");
      const data = await response.json();
      return data.data;
    },
    onError: (err) => {
      messageApi.error(err.message || "Gagal mengambil data artikel");
    },
    enabled: !!user?.token?.value,
  });

  const createArtikelMutation = useMutation({
    mutationFn: async (values) => {
      if (!imageFile)
        throw new Error("Silakan unggah cover artikel terlebih dahulu");
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
      messageApi.success("Data berhasil tersimpan");
      form.resetFields();
      setValueContent("");
      setImageFile(null);
      queryClient.invalidateQueries(["artikel"]);
    },
    onError: (err) => {
      messageApi.error(err.message || "Data gagal tersimpan");
    },
  });

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
      messageApi.success("Kategori berhasil ditambahkan");
      form.resetFields();
      setValueContent("");
      setImageFile(null);
      setStatePageKateogries(false);
      queryClient.invalidateQueries(["kategori"]);
    },
    onError: (err) => {
      messageApi.error(err.message || "Data gagal tersimpan");
    },
  });

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
      messageApi.success("Artikel berhasil dihapus");
      queryClient.invalidateQueries(["artikel"]);
    },
    onError: (err) => {
      messageApi.error(err.message || "Data gagal dihapus");
    },
  });

  const isBusy =
    createArtikelMutation.isPending ||
    createKategoriMutation.isPending ||
    deleteArtikelMutation.isPending;

  const validateImage = (file) => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/svg+xml",
    ];
    const maxSize = 2 * 1024 * 1024;

    if (!file) return Promise.reject(new Error("Cover masih kosong"));
    if (!validTypes.includes(file.type)) {
      return Promise.reject(
        new Error(
          "Format file tidak valid. Hanya JPEG, PNG, JPG, GIF, atau SVG."
        )
      );
    }
    if (file.size > maxSize) {
      return Promise.reject(new Error("Ukuran file maksimal 2MB"));
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

  const columns = [
    { accessorKey: "judul", header: "Judul Berita", enableSorting: true },
    {
      id: "tanggal",
      header: "Tanggal Upload",
      accessorFn: (row) => row.updated_at,
      cell: ({ getValue }) => (
        <span className="text-graphite">{formatDate2(getValue())}</span>
      ),
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
            onClick={() => {
              setDataArtikel(row.original);
              setIsOpenModalUpdateDataArtikel(true);
            }}
            disabled={isBusy}
          >
            Ubah
          </Button>
          <Button
            variant="destructive"
            size="sm"
            leadingIcon={<Trash2 size={16} strokeWidth={1.75} />}
            onClick={() => {
              Modal.confirm({
                title: "Apakah Anda yakin?",
                icon: <AlertTriangle size={20} className="text-danger" />,
                content: "Data yang dihapus tidak dapat dikembalikan.",
                okText: "Ya, hapus",
                cancelText: "Batal",
                onOk: () => deleteArtikelMutation.mutate(row.original.id),
              });
            }}
            disabled={isBusy}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-[25px]">
      {contextHolder}
      {(artikelLoading || kategoriLoading) && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/95 p-[25px] rounded-default border border-light-ash">
          <Spin size="large" />
        </div>
      )}

      <div className="flex items-center justify-between gap-[17px] flex-wrap">
        <div>
          <h1 className="text-heading-lg font-bold text-deep-slate">
            Kelola Artikel
          </h1>
          <p className="text-body-sm text-graphite mt-1">
            Buat artikel baru atau kelola artikel yang sudah diterbitkan.
          </p>
        </div>
        <div className="flex gap-[8px]">
          <Button
            variant={statePage === "Artikel" ? "dark" : "default"}
            size="md"
            onClick={() => setStatePage("Artikel")}
            disabled={isBusy}
          >
            Tulis Artikel
          </Button>
          <Button
            variant={statePage === "Riwayat" ? "dark" : "default"}
            size="md"
            onClick={() => setStatePage("Riwayat")}
            disabled={isBusy}
          >
            Riwayat
          </Button>
        </div>
      </div>

      <div className="bg-white border border-light-ash rounded-default p-[25px]">
        {statePage === "Artikel" ? (
          <Form
            form={form}
            name="input_artikel"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label={
                <span className="text-body-sm font-medium text-deep-slate">
                  Pilih Kategori
                </span>
              }
              name="kategori"
              rules={[
                {
                  required: !statePageKateogries,
                  message: "Kategori masih kosong",
                },
              ]}
            >
              <Select
                listHeight={200}
                optionFilterProp="children"
                showSearch
                placeholder="Pilih Kategori"
                disabled={
                  kategoriLoading ||
                  createArtikelMutation.isPending ||
                  createKategoriMutation.isPending
                }
                className="h-[52px]"
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <div className="border-t border-light-ash p-[8px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatePageKateogries(true)}
                        disabled={
                          createArtikelMutation.isPending ||
                          createKategoriMutation.isPending
                        }
                      >
                        + Tambah Kategori Baru
                      </Button>
                    </div>
                  </div>
                )}
              >
                {!statePageKateogries &&
                  dataKategori?.map((item) => (
                    <Select.Option key={item.id} value={item.name}>
                      {item.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>

            {statePageKateogries && (
              <Form.Item
                label={
                  <span className="text-body-sm font-medium text-deep-slate">
                    Nama Kategori Baru
                  </span>
                }
                name="name"
                rules={[{ required: true, message: "Nama Kategori masih kosong" }]}
              >
                <Input
                  placeholder="Masukkan nama kategori"
                  className="h-[52px] text-base"
                />
              </Form.Item>
            )}

            {!statePageKateogries && (
              <>
                <Form.Item
                  label={
                    <span className="text-body-sm font-medium text-deep-slate">
                      Judul
                    </span>
                  }
                  name="judul"
                  rules={[{ required: true, message: "Judul masih kosong" }]}
                >
                  <Input
                    placeholder="Masukkan judul artikel"
                    className="h-[52px] text-base"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-body-sm font-medium text-deep-slate">
                      Nama Penulis
                    </span>
                  }
                  name="penulis"
                  rules={[{ required: true, message: "Penulis masih kosong" }]}
                >
                  <Input
                    placeholder="Nama penulis"
                    className="h-[52px] text-base"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-body-sm font-medium text-deep-slate">
                      Unggah Cover Artikel
                    </span>
                  }
                  name="image"
                  rules={[{ validator: () => validateImage(imageFile) }]}
                >
                  <label
                    htmlFor="artikel_cover"
                    className="flex flex-col justify-center items-center w-full h-[200px] bg-faint-fog rounded-default border border-dashed border-light-ash hover:border-primary-500 hover:bg-polar-mist cursor-pointer transition-colors duration-150"
                  >
                    {imageFile ? (
                      <div className="flex flex-col items-center gap-2 text-deep-slate">
                        <UploadCloud size={32} strokeWidth={1.75} className="text-primary-600" />
                        <span className="text-body-sm font-medium">{imageFile.name}</span>
                        <span className="text-caption text-graphite">Klik untuk ganti file</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-graphite">
                        <UploadCloud size={32} strokeWidth={1.75} />
                        <span className="text-body-sm">
                          <span className="font-semibold text-deep-slate">Klik untuk unggah</span> atau seret file ke sini
                        </span>
                        <span className="text-caption">JPEG, PNG, JPG, GIF, SVG · Maks 2MB</span>
                      </div>
                    )}
                    <input
                      id="artikel_cover"
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
                              messageApi.error(error.message);
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
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-body-sm font-medium text-deep-slate">
                      Isi Artikel
                    </span>
                  }
                  name="content"
                  rules={[
                    {
                      validator: () =>
                        valueContent
                          ? Promise.resolve()
                          : Promise.reject(new Error("Konten masih kosong")),
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

            <div className="flex gap-[13px] justify-end pt-[17px] border-t border-light-ash mt-[17px]">
              {statePageKateogries && (
                <Button
                  variant="default"
                  size="md"
                  onClick={() => setStatePageKateogries(false)}
                  disabled={
                    createArtikelMutation.isPending ||
                    createKategoriMutation.isPending
                  }
                >
                  Batal
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={
                  createArtikelMutation.isPending ||
                  createKategoriMutation.isPending
                }
              >
                {statePageKateogries ? "Simpan Kategori" : "Terbitkan Artikel"}
              </Button>
            </div>
          </Form>
        ) : (
          <div className="space-y-[17px]">
            <DataTable
              columns={columns}
              data={dataSource || []}
              loading={artikelLoading || isBusy}
              title={
                <h2 className="text-heading font-semibold text-deep-slate">
                  Daftar Artikel
                </h2>
              }
              searchPlaceholder="Cari artikel..."
              emptyText="Tidak ada data artikel"
            />
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                leadingIcon={<RotateCcw size={16} strokeWidth={1.75} />}
                onClick={() => queryClient.invalidateQueries(["artikel"])}
                disabled={isBusy}
              >
                Muat ulang
              </Button>
            </div>
          </div>
        )}
      </div>

      <FormUpdateDataArtikel
        isOpen={isOpenModalUpdateDataArtikel}
        onCancel={() => setIsOpenModalUpdateDataArtikel(false)}
        fetch={() => queryClient.invalidateQueries(["artikel"])}
        data={dataArtikel}
      />
    </div>
  );
}
