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

  console.log(dataKategori)
  return (
    <>
      {contextHolder}
      {data && (
        <Modal
          open={isOpen}
          onCancel={onCancel}
          title="Update Data Anak"
          footer={[
            <button
              key="back"
              type="button"
              
              onClick={onCancel}
              className="batal_btn"
            >
              Batal
            </button>,
            <button
              key="submit"
              type="submit"
              onClick={onOK}
              className="simpan_btn"
            >
              Simpan
            </button>,
          ]}
        >
          <Row>
            <Col span={24}>
              <Form form={form} name="form_update_data_anak" layout="vertical">
                <Form.Item
                  label="Pilih kategori"
                  name="kategori"
                  rules={[
                    {
                      required: true,
                      message: "Kategori masih kosong!",
                    },
                  ]}
                >
                  <Select size="4" listHeight={100} optionFilterProp="children" showSearch placeholder="Pilih Kategori">

                    <Select.Option value="add">
                      <Button onClick={() => {
                        setStatePageKateogries(true)
                        
                      }}>Tambah Kategori</Button>
                    </Select.Option>

                    {
                      statePageKateogries ?  
                      <Select.Option>
                      </Select.Option> :
                    dataKategori.map((item) => (
                     
                      <Select.Option key={item.id} value={item.name} >
                        {item.name}
                      </Select.Option>
                    ))
                    }
                  </Select>
                </Form.Item>
                
                 {
                  statePageKateogries &&
                  <Form.Item
                    style={{ Width: "100%" }}
                    label="Tambah Kategori"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Nama Kategori masih kosong!",
                      },
                    ]}
                  >
                    <Input placeholder="Masukkan Nama Kategori"/>
                  </Form.Item>
                }

                {
                  !statePageKateogries &&
                  <div>
                    <Form.Item
                  style={{ Width: "100%" }}
                  label="Judul"
                  name="judul"
                  rules={[
                    {
                      required: true,
                      message: "Judul masih kosong!",
                    },
                  ]}
                >
                  <Input placeholder="Masukkan judul"/>
                    </Form.Item>
                    <Form.Item
                      style={{ Width: "100%" }}
                      label="Nama penulis"
                      name="penulis"
                      rules={[
                        {
                          required: true,
                          message: "Penulis masih kosong!",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      style={{ Width: "100%" }}
                      label="Unggah cover artikel"
                      name="image"
                    >
                    
                    <div className="flex justify-center items-center w-full">
                        <label
                          htmlFor="import_pelanggan"
                          className="flex flex-col justify-center items-center w-full h-64 bg-white rounded-lg border-2 border-dashed cursor-pointer dark:hover:bg-bray-800" style={{borderColor: "#FFB4B4"}}
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
                              <p className="mb-2 text-sm dark:text-gray-400" style={{color: "#b41318"}}>
                                <span className="font-semibold">
                                  Click to upload
                                </span>{' '}
                                  or drag and drop
                                </p>
                                <p className="text-xs" style={{color: "#b41318"}}>
                                  Unggah Cover Digital
                                </p>
                            </div>
                        )}
                        <input
                          id="import_pelanggan"
                          type="file"
                          accept=".jpg, .jpeg, .png"
                          style={{color: "#b41318"}}
                            onChange={(e) => {
                              setImageFile(e.target.files[0]);
                            }}
                        />
                      </label>
                    </div>
                    </Form.Item>
                    <Form.Item
                      style={{ Width: "100%" }}
                      label="Paragraf"
                      name="content"
                    >
                    </Form.Item>
                    <ReactQuill theme="snow" value={valueContent} onChange={setValueContent} />;
                  </div>
                }
              </Form>
            </Col>
          </Row>
        </Modal>
      )}
    </>
  );
}
