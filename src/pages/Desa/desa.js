import { Button, DatePicker, Form, message, Spin, Select } from "antd";
import moment from "moment";
import React, { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "../../components/layout/Navbar";
import bg_desa from "../../assets/img/bg-desa.svg";
import Table, { SelectColumnFilter } from "../../components/layout/Table";
import { Berat, Tinggi, Lingkar } from "../../utilities/Berat";
import { Container, Col, Row } from "react-bootstrap";
import useAuth from "../../hook/useAuth";
import "./desa-style.css";
import Link from "antd/lib/typography/Link";

const BackgroundComponent = () => {
  const backgroundStyles = {
    position: "absolute",
    top: 80,
    left: -5,
    width: "100vw",
    height: "100vh",
    zIndex: -10000,
    background: `url(${bg_desa}) no-repeat center`,
    backgroundSize: "100vw auto",
  };

  return <div style={backgroundStyles} />;
};

export default function Desa() {
  const user = useAuth();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: statistikData, isLoading } = useQuery({
    queryKey: ["statistik-gizi", user?.user?.id_desa],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/statistik-gizi/${user?.user?.id_desa}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token?.value}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil data statistik");
      return response.json();
    },
    enabled: !!user?.user?.id_desa,
    onError: (err) => {
      console.error("Fetch statistik error:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data statistik",
      });
    },
  });

  const exportCsvMutation = useMutation({
    mutationFn: async (params) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/export-data-anak-csv?desa=${params.desa}&bulan=${params.bulan}&tahun=${params.tahun}&id=${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token?.value}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Gagal mengekspor data");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-anak.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      messageApi.open({
        type: "success",
        content: "Data berhasil diekspor",
      });
    },
    onError: (err) => {
      console.error("Export CSV error:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Data gagal diekspor",
      });
    },
  });

  const columns = useMemo(() => {
    return [
      {
        Header: "Kategori",
        accessor: "kategori",
      },
      {
        Header: "Total",
        accessor: "total",
      },
    ];
  }, []);

  const onFinish = () => {
    form
      .validateFields()
      .then((values) => {
        const params = {
          desa: user.user.id_desa,
          bulan: moment(values.waktu).format("MM"),
          tahun: moment(values.waktu).format("YYYY"),
          id: values.posyandu,
        };
        exportCsvMutation.mutate(params);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <>
      <BackgroundComponent />
      {contextHolder}
      <Navbar isLogin desa />

      <Row style={{ marginTop: "46px" }} justify="space-between" align="center">
        <div style={{ padding: "50px" }} align="center">
          {isLoading ? (
            <Col>
              <Spin size="large" spinning={isLoading} />
            </Col>
          ) : (
            statistikData?.data?.map((value) => (
              <Col
                key={value.id_posyandu}
                span={24}
                style={{ marginTop: "10px", marginBottom: "50px" }}
              >
                <Col span={24} style={{ marginTop: 5 }}>
                  <h1
                    style={{
                      justifyContent: "center",
                      display: "flex",
                      textTransform: "uppercase",
                      color: "#7F7B7B",
                      fontSize: "28px",
                    }}
                  >
                    {value.nama_posyandu}
                  </h1>
                </Col>
                <Row justify="space-between">
                  <Col span={7}>
                    <Row justify="start">
                      <h5 style={{ color: "rgba(177, 68, 68, 1)" }}>BERAT</h5>
                    </Row>
                    <Table
                      data={Berat(value.id_posyandu, statistikData?.data)}
                      columns={columns}
                      initialState={{
                        pageSize: 5,
                      }}
                      noSearch
                    />
                  </Col>
                  <Col span={7}>
                    <Row justify="start">
                      <h5 style={{ color: "rgba(177, 68, 68, 1)" }}>TINGGI</h5>
                    </Row>
                    <Table
                      data={Tinggi(value.id_posyandu, statistikData?.data)}
                      columns={columns}
                      initialState={{
                        pageSize: 5,
                      }}
                      noSearch
                    />
                  </Col>
                  <Col span={7}>
                    <Row justify="start">
                      <h5 style={{ color: "rgba(177, 68, 68, 1)" }}>
                        LINGKAR KEPALA
                      </h5>
                    </Row>
                    <Table
                      data={Lingkar(value.id_posyandu, statistikData?.data)}
                      columns={columns}
                      initialState={{
                        pageSize: 5,
                      }}
                      noSearch
                    />
                  </Col>
                </Row>
              </Col>
            ))
          )}
          <Col span={24} style={{ marginTop: 50 }}>
            <Form
              onFinish={onFinish}
              form={form}
              name="form_export_data"
              layout="horizontal"
            >
              <Form.Item
                label="Periode Waktu berdasarkan bulan & tahun pengukuran"
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
                <DatePicker picker="month" />
              </Form.Item>

              <Form.Item
                style={{
                  justifyContent: "start",
                  display: "flex",
                  color: "#7F7B7B",
                  fontSize: "28px",
                }}
                label="Pilih Posyandu"
                name="posyandu"
                rules={[
                  {
                    required: false,
                    message: "Desa masih kosong!",
                  },
                ]}
              >
                <Select
                  listHeight={100}
                  optionFilterProp="children"
                  showSearch
                  style={{ width: "400px" }}
                >
                  {statistikData?.data?.map((item) => (
                    <Select.Option
                      key={item.id_posyandu}
                      value={item.id_posyandu}
                    >
                      {item.nama_posyandu}
                    </Select.Option>
                  ))}
                  <Select.Option key="all" value={"all"}>
                    Semua
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  htmlType="submit"
                  loading={exportCsvMutation.isPending}
                  disabled={exportCsvMutation.isPending}
                >
                  Export CSV
                </Button>
                <Link href="/desa/reminder">
                  <Button>Tambah reminder</Button>
                </Link>
              </Form.Item>
            </Form>
          </Col>
        </div>
      </Row>
    </>
  );
}
