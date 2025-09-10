import { Avatar, Space, Table, message } from "antd";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import FormInputDataAnak from "../../components/form/FormInputDataAnak";
import FormUpdateDataAnak from "../../components/form/FormUpdateDataAnak";
import Navbar from "../../components/layout/Navbar";
import bg_dashboard from "../../assets/img/bg-dashboard.svg";
import Carousel from "react-bootstrap/Carousel";
import bayi from "../../assets/img/bayi_1.png";
import "./dashboard-style.css";
import useAuth from "../../hook/useAuth";

const BackgroundComponent = () => (
  <div
    className="absolute top-[80px] left-[-5px] w-[calc(100%+10px)] h-[40vh] min-h-[150px] sm:min-h-[200px] z-[-10000] bg-no-repeat bg-center bg-cover sm:bg-cover rounded-b-[50px] shadow-[0_10px_20px_rgba(0,0,0,0.19)]"
    style={{ backgroundImage: `url(${bg_dashboard})` }}
  />
);

export default function Dashboard() {
  const [isOpenModalInputDataAnak, setIsOpenModalInputDataAnak] =
    useState(false);
  const [isOpenModalUpdateDataAnak, setIsOpenModalUpdateDataAnak] =
    useState(false);
  const [dataAnak, setDataAnak] = useState(null);
  const queryClient = useQueryClient();

  const [messageApi, contextHolder] = message.useMessage();

  const user = useAuth();

  // Fetch data-anak using useQuery
  const { data: anakData, isLoading: anakLoading } = useQuery({
    queryKey: ["data-anak"],
    queryFn: async () => {
      const url =
        user?.user?.role !== "ORANG_TUA"
          ? `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak`
          : `${process.env.REACT_APP_BASE_URL}/api/orang-tua/data-anak`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${user?.token?.value}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data anak");
      const data = await response.json();
      console.log("Fetched anak data:", data); // Debugging
      return data.data.sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    onError: (err) => {
      console.error("Error fetching data-anak:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data anak",
      });
    },
    enabled: !!user?.token?.value,
  });

  // Mutation for deleting anak data
  const deleteAnakMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.token?.value}` },
        }
      );
      if (!response.ok) throw new Error("Gagal menghapus data anak");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Data anak berhasil dihapus",
      });
      queryClient.invalidateQueries(["data-anak"]);
    },
    onError: (err) => {
      console.error("Error deleting data-anak:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal menghapus data anak",
      });
    },
  });

  const columns = [
    {
      title: "Nama Anak",
      dataIndex: "nama",
      key: "nama",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tanggal_lahir",
      key: "tanggal_lahir",
    },
    {
      title: "Umur",
      dataIndex: "tanggal_lahir",
      key: "umur",
      render: (umur) => `${moment().diff(moment(umur), "month")} Bulan`,
    },
    {
      title: "Jenis Kelamin",
      key: "gender",
      dataIndex: "gender",
      render: (gender) => (gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"),
    },
    {
      title: "Alamat",
      key: "alamat",
      dataIndex: "alamat",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/dashboard/detail/${record.id}`}>
            <button type="button" className="button_dashboard">
              Detail
            </button>
          </Link>
          {user?.user?.role !== "ORANG_TUA" && (
            <button
              className="button_dashboard"
              onClick={() => deleteAnakMutation.mutate(record.id)}
              type="button"
              disabled={deleteAnakMutation.isPending}
            >
              Delete
            </button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <BackgroundComponent />
      <Navbar isLogin />
      <div className="flex justify-center p-3 sm:p-8 lg:h-[400px] h-[600px]">
        <div className="flex flex-col lg:flex-row gap-4 w-full max-w-[700px]">
          <div className="flex-1">
            <h6 className="dashboard text-2xl lg:text-5xl">Hallo</h6>
            <h6 className="dashboard text-2xl lg:text-5xl">
              {user?.user?.name || ""}
            </h6>
            <h5 className="text-[#B14444] text-lg sm:text-xl mb-4">
              Selamat datang di posyandu {user?.user?.posyandu_name || ""}
            </h5>
            <button
              className="cssbuttons-io-button"
              onClick={() => setIsOpenModalInputDataAnak(true)}
              type="button"
              disabled={deleteAnakMutation.isPending}
            >
              Tambah Anak
              <div className="icon">
                <svg
                  width="49"
                  height="48"
                  viewBox="0 0 49 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M31 7C31 3.41015 28.0899 0.5 24.5 0.5C20.9101 0.5 18 3.41015 18 7V17.75H7.25C3.66015 17.75 0.75 20.6601 0.75 24.25C0.75 27.8398 3.66015 30.75 7.25 30.75H18V41.5C18 45.0899 20.9101 48 24.5 48C28.0899 48 31 45.0899 31 41.5V30.75H41.75C45.3399 30.75 48.25 27.8399 48.25 24.25C48.25 20.6601 45.3399 17.75 41.75 17.75H31V7Z"
                    fill="#FF9999"
                  />
                </svg>
              </div>
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center w-full">
            <div className="max-w-[200px]">
              {anakData?.length > 0 && (
                <Carousel>
                  {anakData.map((item, index) => (
                    <Carousel.Item
                      interval={1000}
                      className="flex justify-center p-2.5"
                      key={index}
                    >
                      <Link to={`/dashboard/detail/${item.id}`}>
                        <img className="w-full h-auto" src={bayi} alt="Slide" />
                        <h6 className="absolute top-[260px] left-[20px] text-white text-sm sm:text-base">
                          {item.nama}
                        </h6>
                        <h6 className="absolute top-[280px] left-[20px] text-white text-sm sm:text-base">
                          {`${moment().diff(
                            moment(item.tanggal_lahir),
                            "month"
                          )} Bulan`}
                        </h6>
                      </Link>
                    </Carousel.Item>
                  ))}
                </Carousel>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center w-full px-4 sm:px-6">
        <div className="w-full max-w-[1200px] overflow-x-auto">
          <Table
            columns={columns}
            dataSource={anakData || []}
            loading={anakLoading || deleteAnakMutation.isPending}
            pagination={{ pageSize: 7 }}
            className="ant-table"
          />
        </div>
      </div>
      <div className="flex justify-center w-full">
        <FormInputDataAnak
          isOpen={isOpenModalInputDataAnak}
          onCancel={() => setIsOpenModalInputDataAnak(false)}
          kader={false}
        />
      </div>
      <div className="flex justify-center w-full">
        <FormUpdateDataAnak
          isOpen={isOpenModalUpdateDataAnak}
          onCancel={() => setIsOpenModalUpdateDataAnak(false)}
          data={dataAnak}
        />
      </div>
    </>
  );
}
