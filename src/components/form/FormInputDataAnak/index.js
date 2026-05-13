import { DatePicker, Form, Input, message, Modal, Select } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import Button from "../../ui/Button";
import useAuth from "../../../hook/useAuth";

export default function FormInputDataAnak({ isOpen, onCancel, kader }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const user = useAuth();

  const { data: dataOrangTua, isLoading: orangTuaLoading } = useQuery({
    queryKey: ["orang-tua"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/orang-tua`,
        {
          headers: { Authorization: `Bearer ${user?.token?.value}` },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil data orang tua");
      const data = await response.json();
      return data.data;
    },
    onError: (err) =>
      messageApi.error(err.message || "Gagal mengambil data orang tua"),
    enabled: !!user?.token?.value && user?.user?.role !== "ORANG_TUA",
  });

  const createAnakMutation = useMutation({
    mutationFn: async (values) => {
      const url =
        user?.user?.role === "KADER_POSYANDU"
          ? `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak`
          : `${process.env.REACT_APP_BASE_URL}/api/orang-tua/data-anak`;
      const body =
        user?.user?.role === "KADER_POSYANDU"
          ? {
              nama: values.nama,
              panggilan: values.panggilan,
              tanggal_lahir: moment(values.tanggalLahir).format("YYYY-MM-DD"),
              gender: values.jenisKelamin,
              alamat: values.alamat,
              id_orang_tua: values.orangTua,
              status: kader,
            }
          : {
              nama: values.nama,
              panggilan: values.panggilan,
              tanggal_lahir: moment(values.tanggalLahir).format("YYYY-MM-DD"),
              gender: values.jenisKelamin,
              alamat: values.alamat,
              status: kader,
            };
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token?.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Data gagal tersimpan");
      return response.json();
    },
    onSuccess: () => {
      messageApi.success("Data berhasil tersimpan");
      form.resetFields();
      setTimeout(() => {
        onCancel();
        queryClient.invalidateQueries(["data-anak"]);
      }, 800);
    },
    onError: (err) =>
      messageApi.error(err.message || "Data gagal tersimpan"),
  });

  const onOK = () => {
    form
      .validateFields()
      .then((values) => createAnakMutation.mutate(values))
      .catch(() => {});
  };

  return (
    <>
      {contextHolder}
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
              disabled={createAnakMutation.isPending}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onOK}
              disabled={createAnakMutation.isPending || orangTuaLoading}
            >
              {createAnakMutation.isPending ? "Menyimpan..." : "Simpan"}
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
          {user?.user?.role !== "ORANG_TUA" && (
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
                {dataOrangTua?.map((data) => (
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
