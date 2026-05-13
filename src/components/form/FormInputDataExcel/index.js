import { Form, Input, message, Modal } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import Button from "../../ui/Button";
import { readSession } from "../../../features/auth/session-storage";

export default function FormInputDataExcel(props) {
  const [user] = useState(() => readSession() ?? {});
  const { isOpen, onCancel, fetch } = props;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [excelFile, setExcelFile] = useState(null);
  const [isPending, setIsPending] = useState(false);

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
          setIsPending(true);

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
              messageApi.success("Data berhasil diunggah");
              form.resetFields();
              setExcelFile(null);
              setTimeout(() => {
                setIsPending(false);
                onCancel();
                fetch?.();
              }, 1500);
            })
            .catch((err) => {
              setIsPending(false);
              messageApi.error(
                err.response?.data?.message || "Data gagal diunggah"
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
          <span className="text-heading font-semibold text-deep-slate">
            Unggah Data Excel
          </span>
        }
        footer={
          <div className="flex gap-[13px] justify-end">
            <Button variant="default" size="md" onClick={close} disabled={isPending}>
              Batal
            </Button>
            <Button variant="primary" size="md" onClick={onOK} disabled={isPending}>
              {isPending ? "Mengunggah..." : "Unggah"}
            </Button>
          </div>
        }
      >
        <div className="p-[25px] bg-faint-fog border border-dashed border-light-ash rounded-default text-center">
          <FileSpreadsheet size={40} strokeWidth={1.75} className="text-graphite mx-auto mb-[13px]" />
          <p className="text-body-sm font-semibold text-deep-slate mb-1">
            Pilih file Excel untuk diunggah
          </p>
          <p className="text-caption text-graphite mb-[17px]">
            Format .xlsx sesuai template yang disediakan.
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
                className="file:mr-[13px] file:py-[8px] file:px-[17px] file:rounded-default file:border file:border-light-ash file:text-body-sm file:font-medium file:bg-white file:text-deep-slate hover:file:bg-polar-mist file:cursor-pointer"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
}
