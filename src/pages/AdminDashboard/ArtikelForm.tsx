import { Form, Input, Select } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { ArrowLeft, UploadCloud } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { artikelApi } from "../../api/artikel.api";
import {
  useKategoriList,
  useCreateKategori,
} from "../../queries/useKategoriQueries";

export default function ArtikelForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const toast = useToast();
  const [imageFile, setImageFile] = useState(null);
  const [valueContent, setValueContent] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const queryClient = useQueryClient();

  const { data: dataKategori, isLoading: kategoriLoading } = useKategoriList();

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
      return artikelApi.create(formData);
    },
    onSuccess: () => {
      toast.success("Artikel berhasil diterbitkan");
      queryClient.invalidateQueries(["artikel"]);
      setTimeout(() => navigate("/admin/dashboard/artikel"), 700);
    },
    onError: (err) => toast.error(err?.message ?? "Data gagal tersimpan"),
  });

  const createKategoriMutation = useCreateKategori();

  const handleCreateKategori = (values) => {
    createKategoriMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Kategori berhasil ditambahkan");
        form.resetFields(["name"]);
        setAddingCategory(false);
      },
      onError: (err) => toast.error(err?.message ?? "Data gagal tersimpan"),
    });
  };

  const isBusy =
    createArtikelMutation.isPending || createKategoriMutation.isPending;

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
    if (!validTypes.includes(file.type))
      return Promise.reject(new Error("Format file tidak valid."));
    if (file.size > maxSize)
      return Promise.reject(new Error("Ukuran file maksimal 2MB"));
    return Promise.resolve();
  };

  const onFinish = (values) => {
    if (addingCategory) handleCreateKategori(values);
    else createArtikelMutation.mutate(values);
  };

  return (
    <div>
      {toast.contextHolder}
      <PageHeader
        eyebrow="Tulis Baru"
        title="Artikel Baru"
        subtitle="Buat artikel edukasi untuk orang tua dan kader posyandu."
        action={
          <Button
            variant="default"
            size="md"
            leadingIcon={<ArrowLeft size={18} strokeWidth={2} />}
            onClick={() => navigate("/admin/dashboard/artikel")}
            disabled={isBusy}
          >
            Kembali ke Daftar
          </Button>
        }
      />

      <div className="max-w-[800px] mx-auto px-[17px] md:px-[25px] py-[33px]">
        <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px] md:p-[33px]">
          <Form
            form={form}
            name="input_artikel"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label={<span className="text-body-sm font-medium text-deep-slate">Kategori</span>}
              name="kategori"
              rules={[{ required: !addingCategory, message: "Kategori masih kosong" }]}
            >
              <Select
                listHeight={200}
                optionFilterProp="children"
                showSearch
                placeholder="Pilih kategori"
                disabled={kategoriLoading || isBusy}
                className="h-[52px]"
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <div className="border-t border-light-ash p-[8px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddingCategory(true)}
                        disabled={isBusy}
                      >
                        + Tambah Kategori Baru
                      </Button>
                    </div>
                  </div>
                )}
              >
                {!addingCategory &&
                  dataKategori?.map((item) => (
                    <Select.Option key={item.id} value={item.name}>
                      {item.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>

            {addingCategory && (
              <Form.Item
                label={<span className="text-body-sm font-medium text-deep-slate">Nama Kategori Baru</span>}
                name="name"
                rules={[{ required: true, message: "Nama kategori masih kosong" }]}
              >
                <Input placeholder="Masukkan nama kategori" className="h-[52px] text-base" />
              </Form.Item>
            )}

            {!addingCategory && (
              <>
                <Form.Item
                  label={<span className="text-body-sm font-medium text-deep-slate">Judul</span>}
                  name="judul"
                  rules={[{ required: true, message: "Judul masih kosong" }]}
                >
                  <Input placeholder="Masukkan judul artikel" className="h-[52px] text-base" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-body-sm font-medium text-deep-slate">Nama Penulis</span>}
                  name="penulis"
                  rules={[{ required: true, message: "Penulis masih kosong" }]}
                >
                  <Input placeholder="Nama penulis" className="h-[52px] text-base" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-body-sm font-medium text-deep-slate">Unggah Cover Artikel</span>}
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
                          <span className="font-semibold text-deep-slate">Klik untuk unggah</span> atau seret file
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
                              toast.error(error.message);
                              setImageFile(null);
                              form.validateFields(["image"]);
                            });
                        }
                      }}
                    />
                  </label>
                </Form.Item>

                <Form.Item
                  label={<span className="text-body-sm font-medium text-deep-slate">Isi Artikel</span>}
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
              {addingCategory && (
                <Button
                  variant="default"
                  size="md"
                  onClick={() => setAddingCategory(false)}
                  disabled={isBusy}
                >
                  Batal
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isBusy}
                loading={isBusy}
              >
                {addingCategory ? "Simpan Kategori" : "Terbitkan Artikel"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
