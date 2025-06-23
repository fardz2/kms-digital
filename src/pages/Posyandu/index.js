import { Col, DatePicker, Form, message, Row, Spin, Modal } from "antd";
import Navbar from "../../components/layout/Navbar";
import bg_dashboard from "../../assets/img/bg-dashboard.svg";
import { useEffect, useMemo, useRef, useState } from "react";
import Table from "../../components/layout/Table";
import CustomButton from "../../components/layout/Button/CustomButton";
import axios from "axios";
import moment from "moment";
import ReactToPrint from "react-to-print";
import BukuPanduan from "./BukuPanduan";
import "./posyandu.css";
import { Link, useNavigate } from "react-router-dom";
import FormUpdateDataAnak from "../../components/form/FormUpdateDataAnak";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Container } from "react-bootstrap";

const BackgroundComponent = () => {
  return (
    <div
      className="absolute top-12 sm:top-16 md:top-20 left-0 w-full h-[30vh] sm:h-[35vh] md:h-[40vh] -z-50 bg-center bg-no-repeat rounded-b-[30px] sm:rounded-b-[40px] md:rounded-b-[50px] shadow-lg"
      style={{
        backgroundImage: `url(${bg_dashboard})`,
        backgroundSize: "cover",
      }}
    />
  );
};

const PosyanduDashboard = () => {
  let login_data;
  if (typeof window !== "undefined") {
    login_data = JSON.parse(`${localStorage.getItem("login_data")}`);
  }
  const [messageApi, contextHolder] = message.useMessage();
  const [user, setUser] = useState(login_data);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dataAnak, setDataAnak] = useState(null);
  const ref = useRef();
  const navigate = useNavigate();
  const [isOpenModalUpdateDataAnak, setIsOpenModalUpdateDataAnak] =
    useState(false);

  useEffect(() => {
    function fetchDataAnak() {
      if (user.user.role !== "ORANG_TUA") {
        axios
          .get(`${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak`, {
            headers: {
              Authorization: `Bearer ${user.token.value}`,
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            const sortedData = response.data.data.sort((a, b) =>
              b.created_at.localeCompare(a.created_at)
            );
            console.log(response.data.data);
            setData(sortedData);
            setIsLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
          });
      } else {
        axios
          .get(`${process.env.REACT_APP_BASE_URL}/api/orang-tua/data-anak`, {
            headers: {
              Authorization: `Bearer ${user.token.value}`,
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            const sortedData = response.data.data.sort((a, b) =>
              b.created_at.localeCompare(a.created_at)
            );

            setData(sortedData);
            setIsLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
          });
      }
    }

    fetchDataAnak();

    // eslint-disable-next-line
  }, [refreshKey]);
  const columns = useMemo(() => {
    return [
      {
        Header: "Nama Anak",
        accessor: "nama",
      },
      {
        Header: "Tangal Lahir",
        accessor: "tanggal_lahir",
      },
      {
        Header: "Umur",
        accessor: "umur",
        Cell: ({ row }) => {
          const umur = row.original.tanggal_lahir;
          return <span>{`${moment().diff(moment(umur), "month")} Bulan`}</span>;
        },
      },
      {
        Header: "Jenis Kelamin",
        accessor: "gender",
        Cell: ({ value }) => {
          return (
            <span>{value === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</span>
          );
        },
      },
      {
        Header: "Alamat",
        accessor: "alamat",
      },
      {
        Header: "Nama Orang Tua",
        accessor: "nama_ortu",
      },
      {
        Header: "",
        accessor: "aksi",
        Cell: ({ row }) => {
          const id = row.original.id;

          const data = row.original;
          return (
            <>
              <div style={{ justifyContent: "space-between", display: "flex" }}>
                <button
                  class="btnDetail"
                  onClick={(e) =>
                    navigate(`/kader-posyandu/dashboard/detail/${id}`)
                  }
                >
                  Detail
                </button>
                <button
                  type="button"
                  class="buttonUpdate"
                  onClick={() => {
                    setDataAnak(data);
                    setIsOpenModalUpdateDataAnak(true);
                  }}
                >
                  Update
                </button>
                <button
                  class="buttonDelete"
                  onClick={() => {
                    Modal.confirm({
                      title: "Apakah anda yakin?",
                      icon: <ExclamationCircleOutlined />,
                      content: "Data yang dihapus tidak dapat dikembalikan",
                      okText: "Ya",
                      cancelText: "Tidak",
                      onOk: () => {
                        axios
                          .delete(
                            `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak/${id}`,
                            {
                              headers: {
                                Authorization: `Bearer ${user.token.value}`,
                                "Content-Type": "application/json",
                              },
                            }
                          )
                          .then((response) => {
                            messageApi.open({
                              type: "success",
                              content: "Data berhasil dihapus",
                            });
                            setTimeout(() => {
                              setRefreshKey((oldKey) => oldKey + 1);
                              window.location.reload();
                              fetch();
                            }, 1000);
                          })
                          .catch((err) => {
                            messageApi.open({
                              type: "error",
                              content: "Data gagal dihapus",
                            });
                            setTimeout(() => {
                              window.location.reload();
                            }, 1000);
                          });
                      },
                    });
                  }}
                >
                  Delete
                </button>
              </div>
            </>
          );
        },
      },
    ];
  }, []);
  return (
    <>
      {contextHolder}
      <div style={{ display: "none" }}>
        <BukuPanduan ref={ref} />
      </div>
      <BackgroundComponent />
      <Navbar isLogin kader />
      <Container fluid="md">
        <Row
          className="justify-content-center align-items-center flex"
          style={{ marginTop: "94px" }}
        >
          <Col className="text-center">
            <h6 className="dashboard text-2xl lg:text-5xl">
              Halo {user?.user?.name || ""}
            </h6>
            <h3 className="dashboard text-xl lg:text-3xl">
              Selamat datang di posyandu {user?.user?.posyandu_name || ""},{" "}
            </h3>
          </Col>
        </Row>
        <Row className="justify-content-center" style={{ marginTop: "30px" }}>
          <ReactToPrint
            trigger={() => {
              return (
                <button type="button" class="button3 mx-5">
                  Baca Panduan
                </button>
              );
            }}
            content={() => ref.current}
            documentTitle="Buku Panduan.pdf"
          />
        </Row>
        <Row className="justify-content-center" style={{ marginTop: "30px" }}>
          <Col>
            <Table
              data={data || []}
              columns={columns}
              initialState={{
                pageSize: 10,
              }}
              ButtonCus
            />
          </Col>
        </Row>

        <Col sm="12" className="d-flex">
          <FormUpdateDataAnak
            isOpen={isOpenModalUpdateDataAnak}
            onCancel={() => setIsOpenModalUpdateDataAnak(false)}
            fetch={() => setRefreshKey((oldKey) => oldKey + 1)}
            data={dataAnak}
          />
        </Col>
      </Container>
    </>
  );
};

export default PosyanduDashboard;
