import { Form, Input, Modal, Select } from "antd";
import React, { useEffect, useState } from "react";
import "./style.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { UploadCloud } from "lucide-react";
import Button from "../../ui/Button";
import { useToast } from "../../ui/Toast";
import { useSession } from "../../../features/auth/useSession";
import { artikelApi } from "../../../api/artikel.api";
import {
  useKategoriList,
  useCreateKategori,
} from "../../../queries/useKategoriQueries";

export default function FormUpdateDataArtikel({ isOpen, onCancel, fetch, data }) {
  const { role } = useSession();
  const [form] = Form.useForm();
  const toast = useToast();
  const [imageFile, setImageFile] = useState(null);
  const [valueContent, setValueContent] = useState("");
  const [statePageKateogries, setStatePageKateogries] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { data: dataKategori = [] } = useKategoriList(isOpen);
  const createKategori = useCreateKategori();

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        judul: data.judul,
        kategori: data.kategori,
        penulis: data.penulis,
      });
      setValueContent(data.content);
    }
  }, [form, data]);

  function submitArtikel(values) {
    if (!data) return;
    setIsPending(true);
    const formData = new FormData();
    formData.append("judul", values.judul);
    formData.append("kategori", values.kategori);
    formData.append("penulis", values.penulis);
    formData.append("content", valueContent);
    if (imageFile) formData.append("image", imageFile);

    artikelApi
      .update(data.id, formData)
      .then(() => {
        toast.success("Data berhasil tersimpan");
        setTimeout(() => {
          onCancel();
          setValueContent("");
          setImageFile(null);
          setIsPending(false);
          fetch?.();
        }, 1000);
        form.resetFields();
      })
      .catch((err) => {
        setIsPending(false);
        toast.error(err?.message ?? "Data gagal tersimpan");
        setTimeout(() => {
          setImageFile(null);
          onCancel();
        }, 1000);
      });
  }

  function submitKategori(values) {
    setIsPending(true);
    createKategori.mutate(values, {
      onSuccess: () => {
        toast.success("Data berhasil tersimpan");
        setTimeout(() => {
          onCancel();
          setValueContent("");
          setImageFile(null);
          setIsPending(false);
          fetch?.();
        }, 1000);
        form.resetFields();
      },
      onError: (err) => {
        setIsPending(false);
        toast.error(err?.message ?? "Data gagal tersimpan");
        setTimeout(() => {
          setImageFile(null);
          onCancel();
        }, 1000);
      },
    });
  }

  function onOK() {
    form
      .validateFields()
      .then((values) => {
        if (role !== "ADMIN") return;
        if (statePageKateogries) submitKategori(values);
        else submitArtikel(values);
      })
      .catch(() => {});
  }

  return (
    <>
      {toast.contextHolder}
      {data && (
        <Modal
          open={isOpen}
          onCancel={onCancel}
          title={
            <span className="text-heading font-semibold text-deep-slate">
              Ubah Artikel
            </span>
          }
          footer={
            <div className="flex gap-[13px] justify-end">
              <Button
                variant="default"
                size="md"
                onClick={onCancel}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={onOK}
                disabled={isPending}
              >
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          }
          width={720}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label={
                <span className="text-body-sm font-medium text-deep-slate">
                  Pilih Kategori
                </span>
              }
              name="kategori"
              rules={[{ required: true, message: "Kategori masih kosong" }]}
            >
              <Select
                listHeight={200}
                optionFilterProp="children"
                showSearch
                placeholder="Pilih Kategori"
                className="h-[52px]"
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <div className="border-t border-light-ash p-[8px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatePageKateogries(true)}
                      >
                        + Tambah Kategori Baru
                      </Button>
                    </div>
                  </div>
                )}
              >
                {!statePageKateogries &&
                  dataKategori.map((item) => (
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
                    placeholder="Masukkan judul"
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
                  <Input className="h-[52px] text-base" placeholder="Nama penulis" />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-body-sm font-medium text-deep-slate">
                      Ubah Cover Artikel
                    </span>
                  }
                  name="image"
                >
                  <label
                    htmlFor="update_artikel_cover"
                    className="flex flex-col justify-center items-center w-full h-[180px] bg-faint-fog rounded-default border border-dashed border-light-ash hover:border-primary-500 hover:bg-polar-mist cursor-pointer transition-colors duration-150"
                  >
                    {imageFile ? (
                      <div className="flex flex-col items-center gap-1 text-deep-slate">
                        <UploadCloud size={28} strokeWidth={1.75} className="text-primary-600" />
                        <span className="text-body-sm font-medium">{imageFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-graphite">
                        <UploadCloud size={28} strokeWidth={1.75} />
                        <span className="text-body-sm">
                          <span className="font-semibold text-deep-slate">Klik untuk unggah</span> cover baru
                        </span>
                        <span className="text-caption">JPEG, PNG, JPG</span>
                      </div>
                    )}
                    <input
                      id="update_artikel_cover"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                  </label>
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-body-sm font-medium text-deep-slate">
                      Konten Artikel
                    </span>
                  }
                  name="content"
                >
                  <div className="border border-light-ash rounded-default overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={valueContent}
                      onChange={setValueContent}
                    />
                  </div>
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      )}
    </>
  );
}
