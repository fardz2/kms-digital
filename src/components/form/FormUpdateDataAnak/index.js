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
import { useEffect } from "react";
import moment from "moment";
import "./formUpdateData_style.css";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../hook/useAuth";

export default function FormUpdateDataAnak({ isOpen, onCancel, data }) {
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
      console.log("Data orang tua:", data.data); // Debugging
      return data.data;
    },
    onError: (err) => {
      console.error("Gagal mengambil data orang tua:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal memuat data orang tua",
      });
    },
    enabled: !!user?.token?.value && user?.user?.role !== "ORANG_TUA",
  });

  // Set initial form values when data changes
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

  // Mutation for updating data-anak
  const updateAnakMutation = useMutation({
    mutationFn: async (values) => {
      const url =
        user?.user?.role === "KADER_POSYANDU"
          ? `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak/${data.id}`
          : `${process.env.REACT_APP_BASE_URL}/api/orang-tua/data-anak/${data.id}`;
      const payload = {
        nama: values.nama,
        panggilan: values.panggilan,
        tanggal_lahir: moment(values.tanggalLahir).format("YYYY-MM-DD"),
        gender: values.jenisKelamin,
        alamat: values.alamat,
        ...(user?.user?.role !== "ORANG_TUA" && {
          id_orang_tua: values.orangTua,
        }),
      };
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.token?.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
      console.error("Gagal menyimpan data:", err);
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
        updateAnakMutation.mutate(values);
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
              disabled={updateAnakMutation.isPending}
            >
              Batal
            </button>,
            <button
              key="submit"
              type="button"
              onClick={onOK}
              className="simpan_btn"
              disabled={updateAnakMutation.isPending || orangTuaLoading}
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
                    <Select
                      placeholder="Pilih Orang Tua"
                      loading={orangTuaLoading}
                    >
                      {dataOrangTua && dataOrangTua.length > 0 ? (
                        dataOrangTua.map((data) => (
                          <Select.Option key={data.id} value={data.id}>
                            {data.nama}
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
