import { Form, Input, Modal } from "antd";
import React, { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import Button from "../../ui/Button";
import { useToast } from "../../ui/Toast";
import { useImportAnakExcel } from "../../../queries/useAnakQueries";

export default function FormInputDataExcel({ isOpen, onCancel, fetch }) {
  const [form] = Form.useForm();
  const toast = useToast();
  const [excelFile, setExcelFile] = useState(null);
  const importExcel = useImportAnakExcel();

  function onOK() {
    form
      .validateFields()
      .then(() => {
        if (!excelFile) {
          toast.error("Pilih file terlebih dahulu");
          return;
        }
        const formData = new FormData();
        formData.append("file", excelFile);
        importExcel.mutate(formData, {
          onSuccess: () => {
            toast.success("Data berhasil diunggah");
            form.resetFields();
            setExcelFile(null);
            setTimeout(() => {
              onCancel();
              fetch?.();
            }, 1500);
          },
          onError: (err) =>
            toast.error(err?.message ?? "Data gagal diunggah"),
        });
      })
      .catch(() => {});
  }

  const close = () => {
    form.resetFields();
    setExcelFile(null);
    onCancel();
  };

  const isPending = importExcel.isPending;

  return (
    <>
      {toast.contextHolder}
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
