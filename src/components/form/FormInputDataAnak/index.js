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
import { useQuery, useMutation } from "@tanstack/react-query";

import moment from "moment";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../hook/useAuth";
export default function FormInputDataAnak({ isOpen, onCancel, kader }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const user = useAuth();

  // Fetch orang-tua data using useQuery (for non-ORANG_TUA roles)
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
    onError: (err) => {
      console.error("Error fetching orang-tua:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data orang tua",
      });
    },
    enabled: !!user?.token?.value && user?.user?.role !== "ORANG_TUA",
  });

  // Mutation for creating data-anak
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
      messageApi.open({
        type: "success",
        content: "Data berhasil tersimpan",
      });
      form.resetFields();
      setTimeout(() => {
        onCancel();
        queryClient.invalidateQueries(["data-anak"]);
      }, 1000);
    },
    onError: (err) => {
      console.error("Error creating data-anak:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Data gagal tersimpan",
      });
      setTimeout(() => {
        onCancel();
      }, 1000);
    },
  });

  function onOK() {
    form
      .validateFields()
      .then((values) => {
        createAnakMutation.mutate(values);
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
            disabled={createAnakMutation.isPending}
          >
            Batal
          </button>,
          <button
            key="submit"
            type="button"
            onClick={onOK}
            className="simpan_btn"
            disabled={createAnakMutation.isPending || orangTuaLoading}
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
                  <Select.Option value="LAKI_LAKI">Laki-Laki</Select.Option>
                  <Select.Option value="PEREMPUAN">Perempuan</Select.Option>
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
              {user?.user?.role !== "ORANG_TUA" && (
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
                  <Select loading={orangTuaLoading}>
                    {dataOrangTua?.map((data) => (
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
