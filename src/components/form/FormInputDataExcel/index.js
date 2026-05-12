import { Col, Form, Input, message, Modal, Row } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { readSession } from "../../../features/auth/session-storage";

export default function FormInputDataExcel(props) {
  const [user] = useState(() => readSession() ?? {});
  const { isOpen, onCancel, fetch } = props;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [excelFile, setExcelFile] = useState(null);

  function onOK() {
    form
      .validateFields()
      .then(() => {
        if (!excelFile) {
          messageApi.open({
            type: "error",
            content: "Pilih file terlebih dahulu!",
          });
          return;
        }

        if (user && user.user.role === "KADER_POSYANDU") {
          const formData = new FormData();
          formData.append("file", excelFile); // Append file to FormData

          axios
            .post(
              `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak-excel`,
              formData,
              {
                headers: {
                  Authorization: `Bearer ${user.token.value}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            )
            .then((response) => {
              messageApi.open({
                type: "success",
                content: "Data berhasil diupload",
              });
              form.resetFields();
              setExcelFile(null);
              setTimeout(() => {
                onCancel();
                fetch();
              }, 2000);
            })
            .catch((err) => {
              console.error("Upload error:", err);
              messageApi.open({
                type: "error",
                content: err.response?.data?.message || "Data gagal diupload",
              });
              setTimeout(() => {
                onCancel();
              }, 3000); // Reduced timeout for better UX
            });
        }
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  }

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        onCancel={() => {
          form.resetFields();
          setExcelFile(null);
          onCancel();
        }}
        title="Upload Data Excel"
        footer={[
          <button
            key="back"
            type="button"
            onClick={() => {
              form.resetFields();
              setExcelFile(null);
              onCancel();
            }}
            className="batal_btn"
          >
            Batal
          </button>,
          <button
            key="submit"
            type="button"
            onClick={onOK}
            className="simpan_btn"
          >
            Upload
          </button>,
        ]}
      >
        <Row>
          <Col span={24}>
            <Form form={form} name="form_input_data_anak" layout="vertical">
              <Form.Item
                label="File"
                name="file"
                rules={[
                  {
                    required: true,
                    message: "File masih kosong!",
                  },
                ]}
              >
                <Input
                  type="file"
                  accept=".xlsx" // Restrict to .xlsx for ICoDSA 2025
                  onChange={(e) => {
                    setExcelFile(e.target.files[0]);
                  }}
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    </>
  );
}
