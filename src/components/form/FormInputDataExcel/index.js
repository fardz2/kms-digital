import { Form, Input, message, Modal } from "antd";
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
          messageApi.error("Pilih file terlebih dahulu");
          return;
        }

        if (user && user.user.role === "KADER_POSYANDU") {
          const formData = new FormData();
          formData.append("file", excelFile);

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
            .then(() => {
              messageApi.success("Data berhasil diupload");
              form.resetFields();
              setExcelFile(null);
              setTimeout(() => {
                onCancel();
                fetch?.();
              }, 1500);
            })
            .catch((err) => {
              messageApi.error(
                err.response?.data?.message || "Data gagal diupload"
              );
            });
        }
      })
      .catch(() => {});
  }

  const close = () => {
    form.resetFields();
    setExcelFile(null);
    onCancel();
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        onCancel={close}
        title={
          <span className="text-h3 font-display text-neutral-900">
            Upload Data Excel
          </span>
        }
        footer={
          <div className="flex gap-2 justify-end">
            <button
              onClick={close}
              className="px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onOK}
              className="px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm transition-colors"
            >
              Upload
            </button>
          </div>
        }
        bodyStyle={{ padding: "1.25rem", fontFamily: "Inter, sans-serif" }}
      >
        <div className="p-6 bg-primary-50 border-2 border-dashed border-primary-200 rounded-card text-center mb-2">
          <p className="text-body-lg font-display font-semibold text-neutral-900 mb-2">
            Pilih file Excel
          </p>
          <p className="text-caption text-neutral-600 mb-4">
            Format .xlsx
          </p>
          <Form form={form} layout="vertical">
            <Form.Item
              name="file"
              rules={[{ required: true, message: "File masih kosong" }]}
              className="!mb-0"
            >
              <Input
                type="file"
                accept=".xlsx"
                onChange={(e) => setExcelFile(e.target.files[0])}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-button file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-600 file:cursor-pointer"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
}
