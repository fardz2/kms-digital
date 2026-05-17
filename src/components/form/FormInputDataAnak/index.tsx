// @ts-nocheck
import { DatePicker, Form, Input, Modal, Select } from "antd";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import Button from "../../ui/Button";
import { useToast } from "../../ui/Toast";
import { useSession } from "../../../features/auth/useSession";
import { ortuApi } from "../../../api/ortu.api";
import { useCreateAnak } from "../../../queries/useAnakQueries";

export default function FormInputDataAnak({ isOpen, onCancel, kader }) {
  const [form] = Form.useForm();
  const toast = useToast();
  const { isAuthenticated, role } = useSession();
  const isOrangTua = role === "ORANG_TUA";

  const { data: dataOrangTua, isLoading: orangTuaLoading } = useQuery({
    queryKey: ["orang-tua-kader-form"],
    queryFn: async () => {
      const res = await ortuApi.forKader();
      return res.data ?? [];
    },
    enabled: isAuthenticated && !isOrangTua,
    staleTime: 60 * 1000,
  });

  const createAnak = useCreateAnak();

  const onOK = () => {
    form
      .validateFields()
      .then((values) => {
        const base = {
          nama: values.nama,
          panggilan: values.panggilan,
          tanggal_lahir: moment(values.tanggalLahir).format("YYYY-MM-DD"),
          gender: values.jenisKelamin,
          alamat: values.alamat,
          status: kader,
        };
        const payload = isOrangTua
          ? base
          : { ...base, id_orang_tua: values.orangTua };

        createAnak.mutate(payload, {
          onSuccess: () => {
            toast.success("Data berhasil tersimpan");
            form.resetFields();
            setTimeout(() => onCancel(), 800);
          },
          onError: (err) =>
            toast.error(err?.message ?? "Data gagal tersimpan"),
        });
      })
      .catch(() => {});
  };

  return (
    <>
      {toast.contextHolder}
      <Modal
        open={isOpen}
        onCancel={onCancel}
        title={
          <span className="text-heading font-semibold text-deep-slate">
            Tambah Data Anak
          </span>
        }
        footer={
          <div className="flex gap-[13px] justify-end">
            <Button
              variant="default"
              size="md"
              onClick={onCancel}
              disabled={createAnak.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onOK}
              disabled={createAnak.isPending || orangTuaLoading}
            >
              {createAnak.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Nama</span>}
            name="nama"
            rules={[{ required: true, message: "Nama masih kosong" }]}
          >
            <Input placeholder="Nama lengkap anak" className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Panggilan</span>}
            name="panggilan"
            rules={[{ required: true, message: "Panggilan masih kosong" }]}
          >
            <Input placeholder="Nama panggilan" className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Jenis Kelamin</span>}
            name="jenisKelamin"
            rules={[{ required: true, message: "Jenis Kelamin masih kosong" }]}
          >
            <Select placeholder="Pilih jenis kelamin" className="h-[52px]">
              <Select.Option value="LAKI_LAKI">Laki-Laki</Select.Option>
              <Select.Option value="PEREMPUAN">Perempuan</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Tanggal Lahir</span>}
            name="tanggalLahir"
            rules={[{ required: true, message: "Tanggal Lahir masih kosong" }]}
          >
            <DatePicker className="w-full h-[52px] text-base" format="DD MMMM YYYY" placeholder="Pilih tanggal lahir" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Alamat</span>}
            name="alamat"
            rules={[{ required: true, message: "Alamat masih kosong" }]}
          >
            <Input.TextArea rows={3} className="text-base" placeholder="Alamat tempat tinggal" />
          </Form.Item>
          {!isOrangTua && (
            <Form.Item
              label={<span className="text-body-sm font-medium text-deep-slate">Orang Tua</span>}
              name="orangTua"
              rules={[{ required: true, message: "Pilih orang tua" }]}
            >
              <Select
                className="h-[52px]"
                loading={orangTuaLoading}
                showSearch
                optionFilterProp="children"
                placeholder="Pilih orang tua"
              >
                {(dataOrangTua ?? []).map((data) => (
                  <Select.Option key={data.id} value={data.id}>
                    {data.nama}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}
