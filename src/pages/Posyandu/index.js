import { Col, Modal, Row, message } from "antd";
import Navbar from "../../components/layout/Navbar";
import bg_dashboard from "../../assets/img/bg-dashboard.svg";
import { useMemo, useRef, useState } from "react";
import Table from "../../components/layout/Table";
import moment from "moment";
import ReactToPrint from "react-to-print";
import BukuPanduan from "./BukuPanduan";
import "./posyandu.css";
import { useNavigate } from "react-router-dom";
import FormUpdateDataAnak from "../../components/form/FormUpdateDataAnak";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Container } from "react-bootstrap";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../hook/useAuth";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [isOpenModalUpdateDataAnak, setIsOpenModalUpdateDataAnak] =
    useState(false);
  const [dataAnak, setDataAnak] = useState(null);
  const ref = useRef();
  const user = useAuth();

  // Fetch child data using useQuery
  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ["data-anak", user?.user?.role],
    queryFn: async () => {
      const url =
        user?.user?.role !== "ORANG_TUA"
          ? `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak`
          : `${process.env.REACT_APP_BASE_URL}/api/orang-tua/data-anak`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user?.token?.value}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Gagal mengambil data anak");
      const responseData = await response.json();
      return responseData.data.sort((a, b) =>
        b.created_at.localeCompare(a.created_at)
      );
    },
    onError: (err) => {
      console.error("Error fetching child data:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data anak",
      });
    },
    enabled: !!user?.token?.value && !!user?.user?.role,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation for deleting child data
  const deleteDataAnakMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token?.value}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Gagal menghapus data anak");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Data berhasil dihapus",
      });
      queryClient.invalidateQueries(["data-anak"]);
    },
    onError: (err) => {
      console.error("Error deleting child data:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal menghapus data anak",
      });
    },
  });

  // Define columns with useMemo
  const columns = useMemo(
    () => [
      {
        Header: "Nama Anak",
        accessor: "nama",
      },
      {
        Header: "Tanggal Lahir",
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
            <div style={{ justifyContent: "space-between", display: "flex" }}>
              <button
                className="btnDetail"
                onClick={() =>
                  navigate(`/kader-posyandu/dashboard/detail/${id}`)
                }
                disabled={deleteDataAnakMutation.isPending}
              >
                Lihat pengukuran
              </button>
              <button
                type="button"
                className="buttonUpdate"
                onClick={() => {
                  setDataAnak(data);
                  setIsOpenModalUpdateDataAnak(true);
                }}
                disabled={deleteDataAnakMutation.isPending}
              >
                Edit
              </button>
              {user?.user?.role !== "ORANG_TUA" && (
                <button
                  className="buttonDelete"
                  onClick={() => {
                    Modal.confirm({
                      title: "Apakah anda yakin?",
                      icon: <ExclamationCircleOutlined />,
                      content: "Data yang dihapus tidak dapat dikembalikan",
                      okText: "Ya",
                      cancelText: "Tidak",
                      onOk: () => deleteDataAnakMutation.mutate(id),
                    });
                  }}
                  disabled={deleteDataAnakMutation.isPending}
                >
                  Delete
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [deleteDataAnakMutation.isPending.user?.user?.role]
  );

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
              Selamat datang di posyandu {user?.user?.posyandu_name || ""}
            </h3>
          </Col>
        </Row>
        <Row className="justify-content-center" style={{ marginTop: "30px" }}>
          <ReactToPrint
            trigger={() => (
              <button type="button" className="button3 mx-5">
                Baca Panduan
              </button>
            )}
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
              loading={dataLoading || deleteDataAnakMutation.isPending}
              ButtonCus
            />
          </Col>
        </Row>

        <Col sm="12" className="d-flex">
          <FormUpdateDataAnak
            isOpen={isOpenModalUpdateDataAnak}
            onCancel={() => setIsOpenModalUpdateDataAnak(false)}
            fetch={() => queryClient.invalidateQueries(["data-anak"])}
            data={dataAnak}
          />
        </Col>
      </Container>
    </>
  );
};

export default PosyanduDashboard;
