import { DatePicker, Form, Input, message, Modal, Select } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
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
          <span className="text-h3 font-display text-neutral-900">
            Tambah Data Anak
          </span>
        }
        footer={
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              disabled={createAnakMutation.isPending}
              className="px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold disabled:opacity-60"
            >
              Batal
            </button>
            <button
              onClick={onOK}
              disabled={createAnakMutation.isPending || orangTuaLoading}
              className="px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm disabled:opacity-60"
            >
              {createAnakMutation.isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        }
        bodyStyle={{ padding: "1.25rem", fontFamily: "Inter, sans-serif" }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={<span className="text-caption text-neutral-700">Nama</span>}
            name="nama"
            rules={[{ required: true, message: "Nama masih kosong" }]}
          >
            <Input className="h-11 text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-caption text-neutral-700">Panggilan</span>}
            name="panggilan"
            rules={[{ required: true, message: "Panggilan masih kosong" }]}
          >
            <Input className="h-11 text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-caption text-neutral-700">Jenis Kelamin</span>}
            name="jenisKelamin"
            rules={[{ required: true, message: "Jenis Kelamin masih kosong" }]}
          >
            <Select className="h-11">
              <Select.Option value="LAKI_LAKI">Laki-Laki</Select.Option>
              <Select.Option value="PEREMPUAN">Perempuan</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={<span className="text-caption text-neutral-700">Tanggal Lahir</span>}
            name="tanggalLahir"
            rules={[{ required: true, message: "Tanggal Lahir masih kosong" }]}
          >
            <DatePicker className="w-full h-11 text-base" format="DD MMMM YYYY" />
          </Form.Item>
          <Form.Item
            label={<span className="text-caption text-neutral-700">Alamat</span>}
            name="alamat"
            rules={[{ required: true, message: "Alamat masih kosong" }]}
          >
            <Input.TextArea rows={3} className="text-base" />
          </Form.Item>
          {user?.user?.role !== "ORANG_TUA" && (
            <Form.Item
              label={<span className="text-caption text-neutral-700">Orang Tua</span>}
              name="orangTua"
              rules={[{ required: true, message: "Pilih orang tua" }]}
            >
              <Select className="h-11" loading={orangTuaLoading} showSearch optionFilterProp="children">
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
