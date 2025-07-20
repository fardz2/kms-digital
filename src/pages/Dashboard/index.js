import { Avatar, Space, Table } from "antd";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FormInputDataAnak from "../../components/form/FormInputDataAnak";
import FormUpdateDataAnak from "../../components/form/FormUpdateDataAnak";
import Navbar from "../../components/layout/Navbar";
import bg_dashboard from "../../assets/img/bg-dashboard.svg";
import Carousel from "react-bootstrap/Carousel";
import bayi from "../../assets/img/bayi_1.png";

import "./dashboard-style.css";

const BackgroundComponent = () => (
  <div
    className="absolute top-[80px] left-[-5px] w-[calc(100%+10px)] h-[40vh] min-h-[150px] sm:min-h-[200px] z-[-10000] bg-no-repeat bg-center bg-cover sm:bg-cover rounded-b-[50px] shadow-[0_10px_20px_rgba(0,0,0,0.19)]"
    style={{ backgroundImage: `url(${bg_dashboard})` }}
  />
);

export default function Dashboard() {
  let login_data;
  if (typeof window !== "undefined") {
    login_data = JSON.parse(`${localStorage.getItem("login_data")}`);
  }

  const [user, setUser] = useState(login_data);
  const [isOpenModalInputDataAnak, setIsOpenModalInputDataAnak] =
    useState(false);
  const [isOpenModalUpdateDataAnak, setIsOpenModalUpdateDataAnak] =
    useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dataAnak, setDataAnak] = useState(null);

  useEffect(() => {
    function fetchDataAnak() {
      const url =
        user.user.role !== "ORANG_TUA"
          ? `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak`
          : `${process.env.REACT_APP_BASE_URL}/api/orang-tua/data-anak`;
      axios
        .get(url, {
          headers: { Authorization: `Bearer ${user.token.value}` },
        })
        .then((response) => {
          const sortedData = response.data.data.sort((a, b) =>
            b.created_at.localeCompare(a.created_at)
          );
          console.log(sortedData);
          setData(sortedData);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err);
        });
    }

    fetchDataAnak();
  }, [refreshKey, user]);

  function deleteAnak(id) {
    axios
      .delete(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak/${id}`,
        {
          headers: { Authorization: `Bearer ${user.token.value}` },
        }
      )
      .then(() => {
        setRefreshKey((oldKey) => oldKey + 1);
      })
      .catch((err) => {
        console.log(err);
      });
  }

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
          {user && user.user.role !== "ORANG_TUA" && (
            <button
              className="button_dashboard"
              onClick={() => deleteAnak(record.id)}
              type="button"
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
      <BackgroundComponent />
      <Navbar isLogin />
      <div className="flex justify-center  p-3 sm:p-8 lg:h-[400px] h-[600px]">
        <div className="flex flex-col lg:flex-row gap-4 w-full max-w-[700px]">
          <div className="flex-1 ">
            <h6 className="dashboard text-2xl lg:text-5xl">Hallo</h6>
            <h6 className="dashboard text-2xl lg:text-5xl">
              {user && user.user.name}
            </h6>
            <h5 className="text-[#B14444] text-lg sm:text-xl mb-4">
              Selamat datang di posyandu {user?.user?.posyandu_name || ""}
            </h5>
            <button
              className="cssbuttons-io-button"
              onClick={() => setIsOpenModalInputDataAnak(true)}
              type="button"
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
          <div className="flex flex-1   items-center justify-center w-full">
            <div className="max-w-[200px]">
              {data.length > 0 && (
                <Carousel>
                  {data.map((item, index) => (
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
            dataSource={data}
            loading={isLoading}
            pagination={{ pageSize: 7 }}
            className="ant-table"
          />
        </div>
      </div>
      <div className="flex justify-center w-full">
        <FormInputDataAnak
          isOpen={isOpenModalInputDataAnak}
          onCancel={() => setIsOpenModalInputDataAnak(false)}
          fetch={() => setRefreshKey((oldKey) => oldKey + 1)}
          kader={false}
        />
      </div>
      <div className="flex justify-center w-full">
        <FormUpdateDataAnak
          isOpen={isOpenModalUpdateDataAnak}
          onCancel={() => setIsOpenModalUpdateDataAnak(false)}
          fetch={() => setRefreshKey((oldKey) => oldKey + 1)}
          data={dataAnak}
        />
      </div>
    </>
  );
}
