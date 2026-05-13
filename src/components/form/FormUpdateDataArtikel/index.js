import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import './style.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { readSession } from "../../../features/auth/session-storage";

export default function FormUpdateDataArtikel(props) {
  // eslint-disable-next-line
  const [user, setUser] = useState(() => readSession());
  const { isOpen, onCancel, fetch, data } = props;
  const [dataKategori, setDataKategori] = useState([]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [imageFile, setImageFile] = useState(null);
  const [valueContent, setValueContent] = useState('');
  const [statePageKateogries, setStatePageKateogries] = useState(false);

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        judul: data.judul,
        kategori: data.kategori,
        penulis: data.penulis,
      });
      setValueContent(data.content)
    }

     axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/kategori`,
      {
          headers: { Authorization: `Bearer ${user.token.value}` },
      })
      
      .then((response) => {
        setDataKategori(response.data.data);
        setStatePageKateogries(false);
      })
      .catch((err) => {
      });
  }, [form, data]);

  function onOK() {
    form
      .validateFields()
      .then((values) => {
        console.log(values)
      
        if(!statePageKateogries){
          if(imageFile){
              let formData = new FormData();
              formData.append('judul', values.judul);
              formData.append('kategori', values.kategori);
              formData.append('penulis', values.penulis);
              formData.append('content', valueContent);
              formData.append('image', imageFile);

              if (user && user.user.role === "ADMIN") {
              axios
                  .post(
                  `${process.env.REACT_APP_BASE_URL}/api/artikel/${data.id}`,formData,
                  {
                      headers: { Authorization: `Bearer ${user.token.value}` },
                  }
                  )
                  .then((response) => {
                  messageApi.open({
                      type: "success",
                      content: "Data berhasil tersimpan",
                  });
                  setTimeout(() => {
                      onCancel();
                      setValueContent('');
                      setImageFile(null);
                      window.location.reload()
                      fetch();
                  }, 1000);
                  })
                  .catch((err) => {
                  console.log(err);
                  messageApi.open({
                      type: "error",
                      content: "Data gagal tersimpan",
                  });
                  setTimeout(() => {
                      setImageFile(null);
                      onCancel();
                  }, 1000);
                  });
                  
                  form.resetFields();
              }
          } else {
              let formData = new FormData();
              formData.append('judul', values.judul);
              formData.append('kategori', values.kategori);
              formData.append('penulis', values.penulis);
              formData.append('content', valueContent);

              if (user && user.user.role === "ADMIN") {
              axios
                  .post(
                  `${process.env.REACT_APP_BASE_URL}/api/artikel/${data.id}`,formData,
                  {
                      headers: { Authorization: `Bearer ${user.token.value}` },
                  }
                  )
                  .then((response) => {
                  messageApi.open({
                      type: "success",
                      content: "Data berhasil tersimpan",
                  });
                  setTimeout(() => {
                      onCancel();
                      setValueContent('');
                      setImageFile(null);
                      window.location.reload()
                      fetch();
                  }, 1000);
                  })
                  .catch((err) => {
                  console.log(err);
                  messageApi.open({
                      type: "error",
                      content: "Data gagal tersimpan",
                  });
                  setTimeout(() => {
                      setImageFile(null);
                      onCancel();
                  }, 1000);
                  });
                  
                  form.resetFields();
              }
          }
        } else {
          axios
          .post(`${process.env.REACT_APP_BASE_URL}/api/kategori`,values,{
              headers: { Authorization: `Bearer ${user.token.value}` },
          })
         .then((response) => {
                  messageApi.open({
                      type: "success",
                      content: "Data berhasil tersimpan",
                  });
                  setTimeout(() => {
                      onCancel();
                      setValueContent('');
                      setImageFile(null);
                      window.location.reload()
                      fetch();
                  }, 1000);
                  })
                  .catch((err) => {
                  console.log(err);
                  messageApi.open({
                      type: "error",
                      content: "Data gagal tersimpan",
                  });
                  setTimeout(() => {
                      setImageFile(null);
                      onCancel();
                  }, 1000);
                  });
                  
                  form.resetFields();
        }

      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }
  const kategoris = [
    {
      nama : "Stungting",
      value : "Stungting"
    },
    {
      nama : "Gizi",
      value : "gizi"
    },
    {
      nama : "Kesehatan Anak",
      value : "Kesehatan Anak"
    },
    {
      nama : "Kesehatan Ibu",
      value : "KesehatanIbu"
    }
  ];

  return (
    <>
      {contextHolder}
      {data && (
        <Modal
          open={isOpen}
          onCancel={onCancel}
          title={
            <span className="text-h3 font-display text-neutral-900">
              Update Artikel
            </span>
          }
          footer={
            <div className="flex gap-2 justify-end">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold"
              >
                Batal
              </button>
              <button
                onClick={onOK}
                className="px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm"
              >
                Simpan
              </button>
            </div>
          }
          bodyStyle={{ padding: "1.25rem", fontFamily: "Inter, sans-serif" }}
          width={720}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label={
                <span className="text-caption text-neutral-700">
                  Pilih kategori
                </span>
              }
              name="kategori"
              rules={[{ required: true, message: "Kategori masih kosong" }]}
            >
              <Select
                size="4"
                listHeight={100}
                optionFilterProp="children"
                showSearch
                placeholder="Pilih Kategori"
                className="h-11"
              >
                <Select.Option value="add">
                  <Button
                    onClick={() => {
                      setStatePageKateogries(true);
                    }}
                  >
                    Tambah Kategori
                  </Button>
                </Select.Option>

                {statePageKateogries ? (
                  <Select.Option></Select.Option>
                ) : (
                  dataKategori.map((item) => (
                    <Select.Option key={item.id} value={item.name}>
                      {item.name}
                    </Select.Option>
                  ))
                )}
              </Select>
            </Form.Item>

            {statePageKateogries && (
              <Form.Item
                label={
                  <span className="text-caption text-neutral-700">
                    Tambah Kategori
                  </span>
                }
                name="name"
                rules={[
                  { required: true, message: "Nama Kategori masih kosong" },
                ]}
              >
                <Input
                  placeholder="Masukkan Nama Kategori"
                  className="h-11 text-base"
                />
              </Form.Item>
            )}

            {!statePageKateogries && (
              <div>
                <Form.Item
                  label={
                    <span className="text-caption text-neutral-700">Judul</span>
                  }
                  name="judul"
                  rules={[{ required: true, message: "Judul masih kosong" }]}
                >
                  <Input placeholder="Masukkan judul" className="h-11 text-base" />
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-caption text-neutral-700">
                      Nama penulis
                    </span>
                  }
                  name="penulis"
                  rules={[{ required: true, message: "Penulis masih kosong" }]}
                >
                  <Input className="h-11 text-base" />
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-caption text-neutral-700">
                      Unggah cover artikel
                    </span>
                  }
                  name="image"
                >
                  <label
                    htmlFor="import_pelanggan"
                    className="flex flex-col justify-center items-center w-full h-56 bg-primary-50 rounded-card border-2 border-dashed border-primary-200 cursor-pointer hover:bg-primary-100 transition-colors"
                  >
                    {imageFile ? (
                      <div className="flex flex-col justify-center items-center text-primary-700 font-medium">
                        {imageFile?.name}
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center items-center">
                        <svg
                          aria-hidden="true"
                          className="mb-3 w-10 h-10 text-primary-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-sm text-primary-700 font-semibold">
                          Klik untuk unggah
                        </p>
                        <p className="text-xs text-primary-600 mt-1">
                          atau tarik & lepas
                        </p>
                      </div>
                    )}
                    <input
                      id="import_pelanggan"
                      type="file"
                      accept=".jpg, .jpeg, .png"
                      className="hidden"
                      onChange={(e) => {
                        setImageFile(e.target.files[0]);
                      }}
                    />
                  </label>
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-caption text-neutral-700">
                      Konten Artikel
                    </span>
                  }
                  name="content"
                >
                  <div className="border border-neutral-200 rounded-button overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={valueContent}
                      onChange={setValueContent}
                    />
                  </div>
                </Form.Item>
              </div>
            )}
          </Form>
        </Modal>
      )}
    </>
  );
}
