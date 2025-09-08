import {
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
import moment from "moment";
import React, { useEffect, useState } from "react";
import "./formUpdateData_style.css";

export default function FormUpdateDataAnak(props) {
  let login_data;
  if (typeof window !== "undefined") {
    login_data = JSON.parse(`${localStorage.getItem("login_data")}`);
  }
  const [user, setUser] = useState(login_data);
  const { isOpen, onCancel, fetch, data } = props;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [dataOrangTua, setDataOrangTua] = useState([]);

  useEffect(() => {
    if (user?.user?.role !== "ORANG_TUA") {
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/api/posyandu/orang-tua`, {
          headers: { Authorization: `Bearer ${user.token.value}` },
        })
        .then((response) => {
          console.log("Data orang tua:", response.data.data); // Debugging
          setDataOrangTua(response.data.data);
        })
        .catch((err) => {
          console.error("Gagal mengambil data orang tua:", err.response || err);
          messageApi.open({
            type: "error",
            content: "Gagal memuat data orang tua",
          });
        });
    }
  }, [user, messageApi]);

  useEffect(() => {
    if (data) {
      console.log("Data anak:", data); // Debugging
      form.setFieldsValue({
        nama: data.nama,
        panggilan: data.panggilan,
        jenisKelamin: data.gender,
        tanggalLahir: moment(data.tanggal_lahir),
        alamat: data.alamat,
        orangTua: data.id_orang_tua,
      });
    }
  }, [form, data]);

  function onOK() {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        const payload = {
          nama: values.nama,
          panggilan: values.panggilan,
          tanggal_lahir: moment(values.tanggalLahir).format("YYYY-MM-DD"),
          gender: values.jenisKelamin,
          alamat: values.alamat,
          ...(user.user.role !== "ORANG_TUA" && {
            id_orang_tua: values.orangTua,
          }),
        };

        const url =
          user.user.role === "KADER_POSYANDU"
            ? `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak/${data.id}`
            : `${process.env.REACT_APP_BASE_URL}/api/orang-tua/data-anak/${data.id}`;

        axios
          .put(url, payload, {
            headers: { Authorization: `Bearer ${user.token.value}` },
          })
          .then(() => {
            messageApi.open({
              type: "success",
              content: "Data berhasil tersimpan",
            });
            setTimeout(() => {
              onCancel();
              fetch();
              if (user.user.role === "ORANG_TUA") {
                window.location.reload();
              }
            }, 1000);
          })
          .catch((err) => {
            console.error("Gagal menyimpan data:", err.response || err);
            messageApi.open({
              type: "error",
              content: "Data gagal tersimpan",
            });
            setTimeout(() => {
              onCancel();
            }, 1000);
          });
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }

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
                  label="Nama"
                  name="nama"
                  rules={[{ required: true, message: "Nama masih kosong!" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Panggilan"
                  name="panggilan"
                  rules={[
                    { required: true, message: "Panggilan masih kosong!" },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Jenis Kelamin"
                  name="jenisKelamin"
                  rules={[
                    { required: true, message: "Jenis Kelamin masih kosong!" },
                  ]}
                >
                  <Select>
                    <Select.Option value="LAKI_LAKI">Laki-Laki</Select.Option>
                    <Select.Option value="PEREMPUAN">Perempuan</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Tanggal Lahir"
                  name="tanggalLahir"
                  rules={[
                    { required: true, message: "Tanggal Lahir masih kosong!" },
                  ]}
                >
                  <DatePicker />
                </Form.Item>
                <Form.Item
                  label="Alamat"
                  name="alamat"
                  rules={[
                    {
                      required: true,
                      message: "Alamat masih kosong!",
                      type: "string",
                    },
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                {user?.user?.role !== "ORANG_TUA" && (
                  <Form.Item
                    label="Orang Tua"
                    name="orangTua"
                    rules={[
                      { required: true, message: "Orang Tua masih kosong!" },
                    ]}
                  >
                    <Select placeholder="Pilih Orang Tua">
                      {dataOrangTua && dataOrangTua.length > 0 ? (
                        dataOrangTua.map((data) => (
                          <Select.Option key={data.id} value={data.id}>
                            {data.nama}{" "}
                            {/* Pastikan properti ini adalah nama orang tua */}
                          </Select.Option>
                        ))
                      ) : (
                        <Select.Option disabled>No Data</Select.Option>
                      )}
                    </Select>
                  </Form.Item>
                )}
              </Form>
            </Col>
          </Row>
        </Modal>
      )}
    </>
  );
}
