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

export default function FormInputDataAnak(props) {
  let login_data;
  if (typeof window !== "undefined") {
    login_data = JSON.parse(`${localStorage.getItem("login_data")}`);
  }
  // eslint-disable-next-line
  const [user, setUser] = useState(login_data);
  const { isOpen, onCancel, fetch, kader } = props;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [dataOrangTua, setDataOrangTua] = useState([]);

  useEffect(() => {
    if (user.user.role !== "ORANG_TUA") {
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/api/posyandu/orang-tua`, {
          headers: { Authorization: `Bearer ${user.token.value}` },
        })
        .then((response) => {
          setDataOrangTua(response.data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    // eslint-disable-next-line
  }, []);

  function onOK() {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();

        if (user && user.user.role === "KADER_POSYANDU") {
          axios
            .post(
              `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak`,
              {
                nama: values.nama,
                panggilan: values.panggilan,
                tanggal_lahir: moment(values.tanggalLahir).format("YYYY-MM-DD"),
                gender: values.jenisKelamin,
                alamat: values.alamat,
                id_orang_tua: values.orangTua,
                status: kader,
              },
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
                onCancel();
              }, 1000);
            });
        }

        if (user && user.user.role === "ORANG_TUA") {
          axios
            .post(
              `${process.env.REACT_APP_BASE_URL}/api/orang-tua/data-anak`,
              {
                nama: values.nama,
                panggilan: values.panggilan,
                tanggal_lahir: moment(values.tanggalLahir).format("YYYY-MM-DD"),
                gender: values.jenisKelamin,
                alamat: values.alamat,
                status: kader,
              },
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
                window.location.reload();
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
                onCancel();
              }, 1000);
            });
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        onCancel={onCancel}
        title="Input Data Anak"
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
            <Form form={form} name="form_input_data_anak" layout="vertical">
              <Form.Item
                label="Nama"
                name="nama"
                rules={[
                  {
                    required: true,
                    message: "Nama masih kosong!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Panggilan"
                name="panggilan"
                rules={[
                  {
                    required: true,
                    message: "Panggilan masih kosong!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Jenis Kelamin"
                name="jenisKelamin"
                rules={[
                  {
                    required: true,
                    message: "Jenis Kelamin masih kosong!",
                  },
                ]}
              >
                <Select>
                  <Select.Option value={"LAKI_LAKI"}>Laki-Laki</Select.Option>
                  <Select.Option value={"PEREMPUAN"}>Perempuan</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Tanggal Lahir"
                name="tanggalLahir"
                rules={[
                  {
                    required: true,
                    message: "Tanggal Lahir masih kosong!",
                  },
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
              {user.user.role !== "ORANG_TUA" && (
                <Form.Item
                  label="Orang Tua"
                  name="orangTua"
                  rules={[
                    {
                      required: true,
                      message: "Orang Tua masih kosong!",
                    },
                  ]}
                >
                  <Select>
                    {dataOrangTua &&
                      dataOrangTua.map((data) => (
                        <Select.Option key={data.id} value={data.id}>
                          {data.nama}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              )}
            </Form>
          </Col>
        </Row>
      </Modal>
    </>
  );
}
