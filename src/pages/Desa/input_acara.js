import {
  Button,
  Col,
  Form,
  Input,
  DatePicker,
  message,
  Row,
  Table,
} from "antd";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import moment from "moment";
import bg from "../../assets/img/bg-reminder.png";
import Navbar from "../../components/layout/Navbar";
import useAuth from "../../hook/useAuth";
import "./desa-style.css";

export default function InputAcara() {
  const user = useAuth();

  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchText, setSearchedText] = useState("");

  const { data: remindersData, isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/reminder`,
        {
          headers: {
            Authorization: `Bearer ${user?.token?.value}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil data reminder");
      return response.json();
    },
    enabled: !!user?.token?.value,
    onError: (err) => {
      console.error("Fetch reminders error:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data reminder",
      });
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: async (values) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/reminder`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.token?.value}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judul: values.judul,
            deskripsi: values.deskripsi,
            tanggal_reminder: moment(values.waktu).format("YYYY-MM-DD"),
          }),
        }
      );
      if (!response.ok) throw new Error("Gagal menyimpan reminder");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Data Berhasil tersimpan",
      });
      form.resetFields();
      queryClient.invalidateQueries(["reminders"]);
    },
    onError: (err) => {
      console.error("Create reminder error:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal menyimpan reminder",
      });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/reminder/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token?.value}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Gagal menghapus reminder");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reminders"]);
      messageApi.success("Reminder berhasil dihapus");
    },
    onError: (err) => {
      console.error("Delete reminder error:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal menghapus reminder",
      });
    },
  });

  const columns = [
    {
      title: "Nama Acara",
      dataIndex: "judul",
      key: "judul",
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return String(record.judul).toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: "Tanggal",
      dataIndex: "tanggal_reminder",
      key: "tanggal_reminder",
    },
    {
      title: "Deskripsi",
      dataIndex: "deskripsi",
      key: "deskripsi",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          onClick={() => deleteReminderMutation.mutate(record.id)}
          type="dashed"
          danger
          disabled={deleteReminderMutation.isPending}
        >
          Delete
        </Button>
      ),
    },
  ];

  const onFinish = (values) => {
    createReminderMutation.mutate(values);
  };

  const onFinishFailed = (values) => {
    console.log("Form failed:", values);
  };

  return (
    <>
      <Navbar isLogin />
      {contextHolder}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: "50px",
        }}
        align="center"
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px 80px 0px 80px",
            borderRadius: "20px",
            width: "1000px",
            height: "835px",
          }}
        >
          <Row justify="space-between">
            <Col span={24}>
              <Form
                form={form}
                name="basic"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                layout="horizontal"
              >
                <h1 style={{ fontSize: "26px", marginBottom: "50px" }}>
                  Jadwal Acara
                </h1>
                <Form.Item
                  label="Nama Acara"
                  name="judul"
                  rules={[
                    {
                      required: true,
                      message: "Nama Acara masih kosong!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Keterangan singkat"
                  name="deskripsi"
                  rules={[
                    {
                      required: true,
                      message: "Deskripsi masih kosong!",
                    },
                  ]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item
                  label="Bulan & Tahun Acara"
                  name="waktu"
                  style={{
                    justifyContent: "start",
                    display: "flex",
                    color: "#7F7B7B",
                    fontSize: "28px",
                  }}
                  rules={[
                    {
                      required: true,
                      message: "Periode Data masih kosong!",
                    },
                  ]}
                >
                  <DatePicker picker="date" />
                </Form.Item>

                <Form.Item>
                  <button
                    class="button_reminder"
                    htmlType="submit"
                    loading={createReminderMutation.isPending}
                    disabled={createReminderMutation.isPending}
                  >
                    <span class="IconContainer">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18.3 8.59L19.21 7.69C19.3983 7.5017 19.5041 7.2463 19.5041 6.98C19.5041 6.7137 19.3983 6.4583 19.21 6.27C19.0217 6.0817 18.7663 5.97591 18.5 5.97591C18.2337 5.97591 17.9783 6.0817 17.79 6.27L16.89 7.18C15.4886 6.09585 13.7669 5.50764 11.995 5.50764C10.2232 5.50764 8.50147 6.09585 7.10003 7.18L6.19003 6.26C6.0004 6.0717 5.74373 5.96644 5.47649 5.96737C5.20925 5.96831 4.95333 6.07537 4.76503 6.265C4.57672 6.45463 4.47146 6.7113 4.4724 6.97854C4.47334 7.24577 4.5804 7.5017 4.77003 7.69L5.69003 8.6C4.59304 9.99755 3.99782 11.7233 4.00003 13.5C3.99676 14.7754 4.29849 16.0331 4.88005 17.1683C5.46161 18.3034 6.30614 19.283 7.34322 20.0254C8.38029 20.7679 9.57985 21.2516 10.8418 21.4362C12.1038 21.6208 13.3917 21.5011 14.598 21.0869C15.8043 20.6727 16.8941 19.9761 17.7764 19.0552C18.6588 18.1342 19.3082 17.0157 19.6705 15.7928C20.0328 14.5699 20.0974 13.2781 19.859 12.0251C19.6206 10.7722 19.0861 9.5944 18.3 8.59V8.59ZM12 19.5C10.8133 19.5 9.6533 19.1481 8.6666 18.4888C7.67991 17.8295 6.91087 16.8925 6.45675 15.7961C6.00262 14.6997 5.8838 13.4933 6.11531 12.3295C6.34683 11.1656 6.91827 10.0965 7.75739 9.25736C8.5965 8.41824 9.6656 7.8468 10.8295 7.61529C11.9934 7.38378 13.1998 7.5026 14.2961 7.95672C15.3925 8.41085 16.3296 9.17988 16.9888 10.1666C17.6481 11.1533 18 12.3133 18 13.5C18 15.0913 17.3679 16.6174 16.2427 17.7426C15.1174 18.8679 13.5913 19.5 12 19.5ZM10 4.5H14C14.2652 4.5 14.5196 4.39464 14.7071 4.20711C14.8947 4.01957 15 3.76522 15 3.5C15 3.23478 14.8947 2.98043 14.7071 2.79289C14.5196 2.60536 14.2652 2.5 14 2.5H10C9.73481 2.5 9.48046 2.60536 9.29292 2.79289C9.10538 2.98043 9.00003 3.23478 9.00003 3.5C9.00003 3.76522 9.10538 4.01957 9.29292 4.20711C9.48046 4.39464 9.73481 4.5 10 4.5V4.5ZM13 10.5C13 10.2348 12.8947 9.98043 12.7071 9.79289C12.5196 9.60536 12.2652 9.5 12 9.5C11.7348 9.5 11.4805 9.60536 11.2929 9.79289C11.1054 9.98043 11 10.2348 11 10.5V12.39C10.7736 12.5925 10.614 12.859 10.5423 13.1542C10.4707 13.4495 10.4904 13.7595 10.5988 14.0433C10.7072 14.3271 10.8992 14.5712 11.1494 14.7435C11.3996 14.9158 11.6962 15.008 12 15.008C12.3038 15.008 12.6004 14.9158 12.8507 14.7435C13.1009 14.5712 13.2929 14.3271 13.4013 14.0433C13.5097 13.7595 13.5294 13.4495 13.4577 13.1542C13.3861 12.859 13.2265 12.5925 13 12.39V10.5Z"
                          fill="white"
                        />
                      </svg>
                    </span>
                    <p class="text_reminder">Tambah Reminder</p>
                  </button>
                </Form.Item>
              </Form>
              <Col span={24}>
                {!isLoading && (
                  <>
                    <Input.Search
                      placeholder="Search here ..."
                      onSearch={(value) => {
                        setSearchedText(value);
                      }}
                    />
                    <Table
                      title={() => <h1>Daftar Acara</h1>}
                      dataSource={remindersData?.data}
                      columns={columns}
                      loading={isLoading}
                      pagination={{ pageSize: 3 }}
                    />
                  </>
                )}
              </Col>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}
