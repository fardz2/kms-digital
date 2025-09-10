import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  registerables,
} from "chart.js";
import { Line } from "react-chartjs-2";
import moment from "moment";
import dataBeratBadanByUmurPria from "../../json/ZScoreBeratBadanLakiLaki.json";
import dataBeratBadanByUmurPerempuan from "../../json/ZScoreBeratBadanPerempuan.json";
import dataTinggiBadanByUmurPria from "../../json/ZScorePanjangBadanLakiLaki.json";
import dataTinggiBadanByUmurPerempuan from "../../json/ZScorePanjangBadanPerempuan.json";
import dataLingkarKepalaByUmurPria from "../../json/ZScoreLingkarKepalaLakiLaki.json";
import dataLingkarKepalaByUmurPerempuan from "../../json/ZScoreLingkarKepalaPerempuan.json";
import dataBeratTinggiBadanPria24Bulan from "../../json/ZScoreBeratTinggiBadanLakiLaki24.json";
import dataBeratTinggiBadanPria60Bulan from "../../json/ZScoreBeratTinggiBadanLakiLaki60.json";
import dataBeratTinggiBadanPerempuan24Bulan from "../../json/ZScoreBeratTinggiBadanPerempuan24.json";
import dataBeratTinggiBadanPerempuan60Bulan from "../../json/ZScoreBeratTinggiBadanPerempuan60.json";
import Navbar from "../../components/layout/Navbar";
import { Modal, message, Row, Col } from "antd";
import FormInputPerkembanganAnak from "../../components/form/FormInputPerkembanganAnak";
import FormUpdatePerkembanganAnak from "../../components/form/FormUpdatePerkembanganAnak";
import Image from "react-bootstrap/Image";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import bg_dashboard from "../../assets/img/bg-dashboard.svg";
import Table from "../../components/layout/Table";
import { Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../hook/useAuth";
import { monthDiff } from "../../utilities/calculateMonth";
import bayi from "../../assets/img/bayi_1.png";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ...registerables
);

const BackgroundComponent = () => (
  <div
    className="absolute top-[80px] left-[-5px] w-[calc(100%+10px)] h-[40vh] min-h-[150px] sm:min-h-[200px] z-[-10000] bg-no-repeat bg-center bg-cover sm:bg-cover rounded-b-[50px] shadow-[0_10px_20px_rgba(0,0,0,0.19)]"
    style={{ backgroundImage: `url(${bg_dashboard})` }}
  />
);

export default function DetailPosyandu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [
    isOpenModalInputPerkembanganAnak,
    setIsOpenModalInputPerkembanganAnak,
  ] = useState(false);
  const [
    isOpenModalUpdatePerkembanganAnak,
    setIsOpenModalUpdatePerkembanganAnak,
  ] = useState(false);
  const [dataPerkembanganAnak, setDataPerkembanganAnak] = useState(null);
  const [activeContent, setActiveContent] = useState("Content 1");

  // Fetch child data
  const { data: dataAnak, isLoading: dataAnakLoading } = useQuery({
    queryKey: ["data-anak", id, user?.user?.role],
    queryFn: async () => {
      const url =
        user?.user?.role !== "ORANG_TUA"
          ? `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak/${id}`
          : `${process.env.REACT_APP_BASE_URL}/api/orang-tua/data-anak/${id}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user?.token?.value}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Gagal mengambil data anak");
      const responseData = await response.json();
      return responseData.data;
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

  // Fetch development data
  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ["statistik-anak", id, user?.user?.role],
    queryFn: async () => {
      const url =
        user?.user?.role !== "ORANG_TUA"
          ? `${process.env.REACT_APP_BASE_URL}/api/posyandu/statistik-anak/${id}`
          : `${process.env.REACT_APP_BASE_URL}/api/orang-tua/statistik-anak/${id}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user?.token?.value}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok)
        throw new Error("Gagal mengambil data perkembangan anak");
      const responseData = await response.json();
      return responseData.data.sort((a, b) => a.date.localeCompare(b.date));
    },
    onError: (err) => {
      console.error("Error fetching development data:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data perkembangan anak",
      });
    },
    enabled: !!user?.token?.value && !!user?.user?.role,
  });

  // Mutation for deleting development data
  const deletePerkembanganAnakMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/posyandu/statistik-anak/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token?.value}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Gagal menghapus data");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Data berhasil dihapus",
      });
      queryClient.invalidateQueries(["statistik-anak", id]);
    },
    onError: (err) => {
      console.error("Error deleting development data:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal menghapus data",
      });
    },
  });

  const labels = Array.from({ length: 61 }, (_, i) => i);
  const label_PB_24 = [];
  let value = 45.0;
  while (value <= 110.0) {
    label_PB_24.push(value);
    value += 0.5;
  }

  const label_PB_60 = [];
  value = 65.0;
  while (value <= 110.0) {
    label_PB_60.push(value);
    value += 0.5;
  }

  function datasetChart(type) {
    const dataset =
      data?.map((item) =>
        Math.abs(monthDiff(moment(dataAnak?.tanggal_lahir), moment(item.date)))
      ) || [];

    if (type === "berat") {
      const result = [];
      let j = 0;
      for (let i = 0; i < 61; i++) {
        if (dataset.includes(i) && j < data?.length) {
          result.push(Number(data[j].berat));
          j++;
        } else {
          result.push(null);
        }
      }
      return result;
    } else if (type === "tinggi") {
      const result = [];
      let j = 0;
      for (let i = 0; i < 61; i++) {
        if (dataset.includes(i) && j < data?.length) {
          result.push(Number(data[j].tinggi));
          j++;
        } else {
          result.push(null);
        }
      }
      return result;
    } else if (type === "lingkar_kepala") {
      const result = [];
      let j = 0;
      for (let i = 0; i < 61; i++) {
        if (dataset.includes(i) && j < data?.length) {
          result.push(Number(data[j].lingkar_kepala));
          j++;
        } else {
          result.push(null);
        }
      }
      return result;
    } else if (type === "gizi") {
      const dataset_gizi = [];
      for (let i = 0; i < data?.length; i++) {
        let floor;
        if (data[i].tinggi - Math.floor(data[i].tinggi) === 0.5) {
          floor = data[i].tinggi;
        } else if (data[i].tinggi - Math.floor(data[i].tinggi) < 0.5) {
          floor = Math.floor(data[i].tinggi);
        } else {
          floor = Math.floor(data[i].tinggi) + 0.5;
        }
        dataset_gizi.push(floor);
      }
      const result = [];
      let j = 0;
      if (dataset[0] >= 0 && dataset[0] <= 24) {
        const dataSource =
          dataAnak?.gender === "LAKI_LAKI"
            ? dataBeratTinggiBadanPria24Bulan
            : dataBeratTinggiBadanPerempuan24Bulan;
        dataSource.forEach((item) => {
          if (
            j < dataset_gizi.length &&
            parseFloat(dataset_gizi[j]) === parseFloat(item.pb)
          ) {
            result.push(Number(data[j].berat));
            j++;
          } else {
            result.push(null);
          }
        });
      } else if (dataset[0] > 24 && dataset[0] <= 60) {
        const dataSource =
          dataAnak?.gender === "LAKI_LAKI"
            ? dataBeratTinggiBadanPria60Bulan
            : dataBeratTinggiBadanPerempuan60Bulan;
        dataSource.forEach((item) => {
          if (
            j < dataset_gizi.length &&
            parseFloat(dataset_gizi[j]) === parseFloat(item.pb)
          ) {
            result.push(Number(data[j].berat));
            j++;
          } else {
            result.push(null);
          }
        });
      }
      return result;
    }
    return [];
  }

  const getPointRadius = () => {
    return typeof window !== "undefined" && window.innerWidth < 640 ? 3 : 5;
  };

  const dataChartPriaBB = {
    labels: labels,
    datasets: [
      {
        data: datasetChart("berat"),
        pointBackgroundColor: "black",
        borderColor: "black",
        type: "scatter",
        showLine: false,
        pointRadius: getPointRadius,
        label: "Data Anak",
      },
      {
        data: dataBeratBadanByUmurPria.map((data) => data.SD3neg),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -3",
      },
      {
        data: dataBeratBadanByUmurPria.map((data) => data.SD2neg),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -2",
      },
      {
        data: dataBeratBadanByUmurPria.map((data) => data.SD1neg),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD -1",
      },
      {
        data: dataBeratBadanByUmurPria.map((data) => data.median),
        borderColor: "rgb(154, 255, 136)",
        backgroundColor: "rgba(0, 255, 30, 0.5)",
        type: "line",
        label: "Median",
      },
      {
        data: dataBeratBadanByUmurPria.map((data) => data.SD1pos),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD +1",
      },
      {
        data: dataBeratBadanByUmurPria.map((data) => data.SD2pos),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +2",
      },
      {
        data: dataBeratBadanByUmurPria.map((data) => data.SD3pos),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +3",
      },
    ],
  };

  const dataChartPerempuanBB = {
    labels: labels,
    datasets: [
      {
        data: datasetChart("berat"),
        pointBackgroundColor: "black",
        borderColor: "black",
        type: "scatter",
        showLine: false,
        pointRadius: getPointRadius,
        label: "Data Anak",
      },
      {
        data: dataBeratBadanByUmurPerempuan.map((data) => data.SD3neg),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -3",
      },
      {
        data: dataBeratBadanByUmurPerempuan.map((data) => data.SD2neg),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -2",
      },
      {
        data: dataBeratBadanByUmurPerempuan.map((data) => data.SD1neg),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD -1",
      },
      {
        data: dataBeratBadanByUmurPerempuan.map((data) => data.median),
        borderColor: "rgb(154, 255, 136)",
        backgroundColor: "rgba(0, 255, 30, 0.5)",
        type: "line",
        label: "Median",
      },
      {
        data: dataBeratBadanByUmurPerempuan.map((data) => data.SD1pos),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD +1",
      },
      {
        data: dataBeratBadanByUmurPerempuan.map((data) => data.SD2pos),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +2",
      },
      {
        data: dataBeratBadanByUmurPerempuan.map((data) => data.SD3pos),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +3",
      },
    ],
  };

  const dataChartPriaTB = {
    labels: labels,
    datasets: [
      {
        data: datasetChart("tinggi"),
        pointBackgroundColor: "black",
        borderColor: "black",
        type: "scatter",
        showLine: false,
        pointRadius: getPointRadius,
        label: "Data Anak",
      },
      {
        data: dataTinggiBadanByUmurPria.map((data) => data.SD3neg),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -3",
      },
      {
        data: dataTinggiBadanByUmurPria.map((data) => data.SD2neg),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -2",
      },
      {
        data: dataTinggiBadanByUmurPria.map((data) => data.SD1neg),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD -1",
      },
      {
        data: dataTinggiBadanByUmurPria.map((data) => data.median),
        borderColor: "rgb(154, 255, 136)",
        backgroundColor: "rgba(0, 255, 30, 0.5)",
        type: "line",
        label: "Median",
      },
      {
        data: dataTinggiBadanByUmurPria.map((data) => data.SD1pos),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD +1",
      },
      {
        data: dataTinggiBadanByUmurPria.map((data) => data.SD2pos),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +2",
      },
      {
        data: dataTinggiBadanByUmurPria.map((data) => data.SD3pos),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +3",
      },
    ],
  };

  const dataChartPerempuanTB = {
    labels: labels,
    datasets: [
      {
        data: datasetChart("tinggi"),
        pointBackgroundColor: "black",
        borderColor: "black",
        type: "scatter",
        showLine: false,
        pointRadius: getPointRadius,
        label: "Data Anak",
      },
      {
        data: dataTinggiBadanByUmurPerempuan.map((data) => data.SD3neg),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -3",
      },
      {
        data: dataTinggiBadanByUmurPerempuan.map((data) => data.SD2neg),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -2",
      },
      {
        data: dataTinggiBadanByUmurPerempuan.map((data) => data.SD1neg),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD -1",
      },
      {
        data: dataTinggiBadanByUmurPerempuan.map((data) => data.median),
        borderColor: "rgb(154, 255, 136)",
        backgroundColor: "rgba(0, 255, 30, 0.5)",
        type: "line",
        label: "Median",
      },
      {
        data: dataTinggiBadanByUmurPerempuan.map((data) => data.SD1pos),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD +1",
      },
      {
        data: dataTinggiBadanByUmurPerempuan.map((data) => data.SD2pos),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +2",
      },
      {
        data: dataTinggiBadanByUmurPerempuan.map((data) => data.SD3pos),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +3",
      },
    ],
  };

  const dataChartPriaLK = {
    labels: labels,
    datasets: [
      {
        data: datasetChart("lingkar_kepala"),
        pointBackgroundColor: "black",
        borderColor: "black",
        type: "scatter",
        showLine: false,
        pointRadius: getPointRadius,
        label: "Data Anak",
      },
      {
        data: dataLingkarKepalaByUmurPria.map((data) => data.SD3neg),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -3",
      },
      {
        data: dataLingkarKepalaByUmurPria.map((data) => data.SD2neg),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -2",
      },
      {
        data: dataLingkarKepalaByUmurPria.map((data) => data.SD1neg),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD -1",
      },
      {
        data: dataLingkarKepalaByUmurPria.map((data) => data.median),
        borderColor: "rgb(154, 255, 136)",
        backgroundColor: "rgba(0, 255, 30, 0.5)",
        type: "line",
        label: "Median",
      },
      {
        data: dataLingkarKepalaByUmurPria.map((data) => data.SD1pos),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD +1",
      },
      {
        data: dataLingkarKepalaByUmurPria.map((data) => data.SD2pos),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +2",
      },
      {
        data: dataLingkarKepalaByUmurPria.map((data) => data.SD3pos),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +3",
      },
    ],
  };

  const dataChartPerempuanLK = {
    labels: labels,
    datasets: [
      {
        data: datasetChart("lingkar_kepala"),
        pointBackgroundColor: "black",
        borderColor: "black",
        type: "scatter",
        showLine: false,
        pointRadius: getPointRadius,
        label: "Data Anak",
      },
      {
        data: dataLingkarKepalaByUmurPerempuan.map((data) => data.SD3neg),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -3",
      },
      {
        data: dataLingkarKepalaByUmurPerempuan.map((data) => data.SD2neg),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -2",
      },
      {
        data: dataLingkarKepalaByUmurPerempuan.map((data) => data.SD1neg),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD -1",
      },
      {
        data: dataLingkarKepalaByUmurPerempuan.map((data) => data.median),
        borderColor: "rgb(154, 255, 136)",
        backgroundColor: "rgba(0, 255, 30, 0.5)",
        type: "line",
        label: "Median",
      },
      {
        data: dataLingkarKepalaByUmurPerempuan.map((data) => data.SD1pos),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD +1",
      },
      {
        data: dataLingkarKepalaByUmurPerempuan.map((data) => data.SD2pos),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +2",
      },
      {
        data: dataLingkarKepalaByUmurPerempuan.map((data) => data.SD3pos),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +3",
      },
    ],
  };

  const dataChartPriaGizi_0_24 = {
    labels: label_PB_24,
    datasets: [
      {
        data: datasetChart("gizi"),
        pointBackgroundColor: "black",
        borderColor: "black",
        type: "scatter",
        showLine: false,
        pointRadius: getPointRadius,
        label: "Data Anak",
      },
      {
        data: dataBeratTinggiBadanPria24Bulan.map((data) => data.SD3neg),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -3",
      },
      {
        data: dataBeratTinggiBadanPria24Bulan.map((data) => data.SD2neg),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -2",
      },
      {
        data: dataBeratTinggiBadanPria24Bulan.map((data) => data.SD1neg),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD -1",
      },
      {
        data: dataBeratTinggiBadanPria24Bulan.map((data) => data.median),
        borderColor: "rgb(154, 255, 136)",
        backgroundColor: "rgba(0, 255, 30, 0.5)",
        type: "line",
        label: "Median",
      },
      {
        data: dataBeratTinggiBadanPria24Bulan.map((data) => data.SD1pos),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD +1",
      },
      {
        data: dataBeratTinggiBadanPria24Bulan.map((data) => data.SD2pos),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +2",
      },
      {
        data: dataBeratTinggiBadanPria24Bulan.map((data) => data.SD3pos),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +3",
      },
    ],
  };

  const dataChartPriaGizi_25_60 = {
    labels: label_PB_60,
    datasets: [
      {
        data: datasetChart("gizi"),
        pointBackgroundColor: "black",
        borderColor: "black",
        type: "scatter",
        showLine: false,
        pointRadius: getPointRadius,
        label: "Data Anak",
      },
      {
        data: dataBeratTinggiBadanPria60Bulan.map((data) => data.SD3neg),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -3",
      },
      {
        data: dataBeratTinggiBadanPria60Bulan.map((data) => data.SD2neg),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -2",
      },
      {
        data: dataBeratTinggiBadanPria60Bulan.map((data) => data.SD1neg),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD -1",
      },
      {
        data: dataBeratTinggiBadanPria60Bulan.map((data) => data.median),
        borderColor: "rgb(154, 255, 136)",
        backgroundColor: "rgba(0, 255, 30, 0.5)",
        type: "line",
        label: "Median",
      },
      {
        data: dataBeratTinggiBadanPria60Bulan.map((data) => data.SD1pos),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD +1",
      },
      {
        data: dataBeratTinggiBadanPria60Bulan.map((data) => data.SD2pos),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +2",
      },
      {
        data: dataBeratTinggiBadanPria60Bulan.map((data) => data.SD3pos),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +3",
      },
    ],
  };

  const dataChartPerempuanGizi_0_24 = {
    labels: label_PB_24,
    datasets: [
      {
        data: datasetChart("gizi"),
        pointBackgroundColor: "black",
        borderColor: "black",
        type: "scatter",
        showLine: false,
        pointRadius: getPointRadius,
        label: "Data Anak",
      },
      {
        data: dataBeratTinggiBadanPerempuan24Bulan.map((data) => data.SD3neg),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -3",
      },
      {
        data: dataBeratTinggiBadanPerempuan24Bulan.map((data) => data.SD2neg),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -2",
      },
      {
        data: dataBeratTinggiBadanPerempuan24Bulan.map((data) => data.SD1neg),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD -1",
      },
      {
        data: dataBeratTinggiBadanPerempuan24Bulan.map((data) => data.median),
        borderColor: "rgb(154, 255, 136)",
        backgroundColor: "rgba(0, 255, 30, 0.5)",
        type: "line",
        label: "Median",
      },
      {
        data: dataBeratTinggiBadanPerempuan24Bulan.map((data) => data.SD1pos),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD +1",
      },
      {
        data: dataBeratTinggiBadanPerempuan24Bulan.map((data) => data.SD2pos),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +2",
      },
      {
        data: dataBeratTinggiBadanPerempuan24Bulan.map((data) => data.SD3pos),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +3",
      },
    ],
  };

  const dataChartPerempuanGizi_25_60 = {
    labels: label_PB_60,
    datasets: [
      {
        data: datasetChart("gizi"),
        pointBackgroundColor: "black",
        borderColor: "black",
        type: "scatter",
        showLine: false,
        pointRadius: getPointRadius,
        label: "Data Anak",
      },
      {
        data: dataBeratTinggiBadanPerempuan60Bulan.map((data) => data.SD3neg),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -3",
      },
      {
        data: dataBeratTinggiBadanPerempuan60Bulan.map((data) => data.SD2neg),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD -2",
      },
      {
        data: dataBeratTinggiBadanPerempuan60Bulan.map((data) => data.SD1neg),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD -1",
      },
      {
        data: dataBeratTinggiBadanPerempuan60Bulan.map((data) => data.median),
        borderColor: "rgb(154, 255, 136)",
        backgroundColor: "rgba(0, 255, 30, 0.5)",
        type: "line",
        label: "Median",
      },
      {
        data: dataBeratTinggiBadanPerempuan60Bulan.map((data) => data.SD1pos),
        borderColor: "rgb(234, 255, 0)",
        backgroundColor: "rgba(238, 255, 0, 0.5)",
        type: "line",
        label: "SD +1",
      },
      {
        data: dataBeratTinggiBadanPerempuan60Bulan.map((data) => data.SD2pos),
        borderColor: "rgb(255, 137, 163)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +2",
      },
      {
        data: dataBeratTinggiBadanPerempuan60Bulan.map((data) => data.SD3pos),
        borderColor: "rgb(255, 0, 55)",
        backgroundColor: "rgba(255, 0, 55, 0.5)",
        type: "line",
        label: "SD +3",
      },
    ],
  };

  const optionsBB = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: "Berat Badan (kg)",
          font: { size: 14 },
        },
        ticks: {
          font: { size: 12 },
          precision: 1,
        },
      },
      x: {
        title: {
          display: true,
          text: "Umur (Bulan)",
          font: { size: 14 },
        },
        ticks: {
          maxTicksLimit: 61,
          font: { size: 12 },
        },
        min: 0,
        max: 60,
      },
    },
    elements: {
      point: {
        radius: 0,
        pointStyle: "circle",
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: false,
        callbacks: {
          label: (context) => `Berat: ${context.parsed.y} kg`,
        },
      },
      title: {
        display: true,
        text: "Berat Badan berdasarkan Umur",
        font: { size: 16 },
        padding: { top: 10, bottom: 20 },
      },
    },
  };

  const optionsTB = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: "Tinggi Badan (cm)",
          font: { size: 14 },
        },
        ticks: {
          font: { size: 12 },
          precision: 1,
        },
      },
      x: {
        title: {
          display: true,
          text: "Umur (Bulan)",
          font: { size: 14 },
        },
        ticks: {
          maxTicksLimit: 61,
          font: { size: 12 },
        },
        min: 0,
        max: 60,
      },
    },
    elements: {
      point: {
        radius: 0,
        pointStyle: "circle",
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: false,
        callbacks: {
          label: (context) => `Tinggi: ${context.parsed.y} cm`,
        },
      },
      title: {
        display: true,
        text: "Tinggi Badan berdasarkan Umur",
        font: { size: 16 },
        padding: { top: 10, bottom: 20 },
      },
    },
  };

  const optionsLK = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: "Lingkar Kepala (cm)",
          font: { size: 14 },
        },
        ticks: {
          font: { size: 12 },
          precision: 1,
        },
      },
      x: {
        title: {
          display: true,
          text: "Umur (Bulan)",
          font: { size: 14 },
        },
        ticks: {
          maxTicksLimit: 61,
          font: { size: 12 },
        },
        min: 0,
        max: 60,
      },
    },
    elements: {
      point: {
        radius: 0,
        pointStyle: "circle",
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: false,
        callbacks: {
          label: (context) => `Lingkar Kepala: ${context.parsed.y} cm`,
        },
      },
      title: {
        display: true,
        text: "Lingkar Kepala berdasarkan Umur",
        font: { size: 16 },
        padding: { top: 10, bottom: 20 },
      },
    },
  };

  const optionsGizi = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: "Berat Badan (kg)",
          font: { size: 14 },
        },
        ticks: {
          font: { size: 12 },
          precision: 1,
        },
      },
      x: {
        title: {
          display: true,
          text: "Panjang Badan (cm)",
          font: { size: 14 },
        },
        ticks: {
          maxTicksLimit: 61,
          font: { size: 12 },
        },
        min: 45,
        max: 110,
      },
    },
    elements: {
      point: {
        radius: 0,
        pointStyle: "circle",
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: false,
        callbacks: {
          label: (context) =>
            `Berat: ${context.parsed.y} kg, Tinggi: ${context.parsed.x} cm`,
        },
      },
      title: {
        display: true,
        text: "Berat Badan berdasarkan Panjang Badan",
        font: { size: 16 },
        padding: { top: 10, bottom: 20 },
      },
    },
  };

  const columns = useMemo(() => {
    return [
      {
        Header: "Tanggal Pengukuran",
        accessor: "tanggalPengukuran",
        Cell: ({ row }) => {
          const date = row.original.date;
          return <span>{moment(date).format("DD MMMM YYYY")}</span>;
        },
      },
      {
        Header: "Umur",
        accessor: "date",
        Cell: ({ row }) => {
          const tglPengukuran = row.original.date;
          return (
            <span>
              {dataAnak?.tanggal_lahir
                ? `${monthDiff(
                    moment(dataAnak.tanggal_lahir),
                    moment(tglPengukuran)
                  )} Bulan`
                : "-"}
            </span>
          );
        },
      },
      {
        Header: "Berat Badan",
        accessor: "berat",
        Cell: ({ value }) => {
          return <span>{value} kg</span>;
        },
      },
      {
        Header: "Status - BB/U",
        accessor: "statusBB",
        Cell: ({ row }) => {
          const statusBB = row.original.statistik?.berat;
          return <span>{statusBB || "-"}</span>;
        },
      },
      {
        Header: "Tinggi Badan",
        accessor: "tinggi",
        Cell: ({ value }) => {
          return <span>{value} cm</span>;
        },
      },
      {
        Header: "Status - TB/U",
        accessor: "statusTB",
        Cell: ({ row }) => {
          const statusTB = row.original.statistik?.tinggi;
          return <span>{statusTB || "-"}</span>;
        },
      },
      {
        Header: "Lingkar Kepala",
        accessor: "lingkar_kepala",
        Cell: ({ value }) => {
          return <span>{value} cm</span>;
        },
      },
      {
        Header: "Status - LK/U",
        accessor: "statusLK",
        Cell: ({ row }) => {
          const statusLK = row.original.statistik?.lingkar_kepala;
          return <span>{statusLK || "-"}</span>;
        },
      },
      {
        Header: "Status - Gizi",
        accessor: "statusGizi",
        Cell: ({ row }) => {
          const statusGizi = row.original.statistik?.gizi;
          return <span>{statusGizi || "-"}</span>;
        },
      },
      {
        Header: "",
        accessor: "aksi",
        Cell: ({ row }) => {
          const id = row.original.id;
          const dataAksi = row.original;
          return (
            <div style={{ justifyContent: "space-between", display: "flex" }}>
              <button
                type="button"
                className="buttonUpdate"
                onClick={() => {
                  setDataPerkembanganAnak(dataAksi);
                  setIsOpenModalUpdatePerkembanganAnak(true);
                }}
                disabled={deletePerkembanganAnakMutation.isPending}
              >
                Ubah data
              </button>
              <button
                className="buttonDelete"
                onClick={() => {
                  Modal.confirm({
                    title: "Apakah anda yakin?",
                    icon: <ExclamationCircleOutlined />,
                    content: "Data yang dihapus tidak dapat dikembalikan",
                    okText: "Ya",
                    cancelText: "Tidak",
                    onOk: () => deletePerkembanganAnakMutation.mutate(id),
                  });
                }}
                disabled={deletePerkembanganAnakMutation.isPending}
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ];
  }, [
    dataAnak,
    user?.token?.value,
    user?.user?.role,
    deletePerkembanganAnakMutation.isPending,
  ]);

  const handleButtonClick = (content) => {
    setActiveContent(content);
  };

  return (
    <>
      {contextHolder}
      <Navbar isLogin />
      <BackgroundComponent />
      <Container fluid="md">
        <Row style={{ display: "flex", justifyContent: "center" }}>
          <Col span={24}>
            <Row
              className="justify-center items-center py-6 sm:py-8 lg:py-10 min-h-[250px] sm:min-h-[300px] lg:min-h-[350px]"
              justify="center"
              align="middle"
            >
              <Col xs={24} sm={16} md={12} lg={8} className="text-start">
                <h6 className="dashboard mb-2 sm:mb-3 lg:mb-4 text-2xl lg:text-5xl">
                  {dataAnak?.nama || ""}
                </h6>
                <h6 className="dashboard sm:text-lg lg:text-[25px] mb-4 sm:mb-6 text-2xl lg:text-5xl">
                  {dataAnak?.tanggal_lahir
                    ? `${moment().diff(
                        moment(dataAnak.tanggal_lahir),
                        "month"
                      )} Bulan`
                    : ""}
                </h6>
                <div className="flex justify-start">
                  <button
                    className="cssbuttons-io-button"
                    onClick={() => setIsOpenModalInputPerkembanganAnak(true)}
                    disabled={dataAnakLoading}
                  >
                    Tambah data
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
              </Col>
              <div className="flex justify-center items-center mt-10 md:mt-0">
                <Image
                  src={bayi}
                  rounded
                  className="w-24 sm:w-28 md:w-32 lg:w-[150px] h-auto bg-center"
                />
              </div>
            </Row>
          </Col>
          <Col span={24}>
            <Table
              columns={columns}
              data={data || []}
              loading={dataLoading || dataAnakLoading}
            />
          </Col>
          <Col className="flex justify-center items-center flex-col md:flex-row mt-8 gap-3">
            <button
              className={`button_detail text-sm sm:text-base px-4 py-2 rounded-lg ${
                activeContent === "Content 1"
                  ? "bg-blue-500 shadow-[0px_3px_2px_#3b82f6,_0px_3px_5px_#000]"
                  : ""
              }`}
              onClick={() => handleButtonClick("Content 1")}
            >
              Berat Badan
            </button>
            <button
              className={`button_detail text-sm sm:text-base px-4 py-2 rounded-lg ${
                activeContent === "Content 2"
                  ? "bg-blue-500 shadow-[0px_3px_2px_#3b82f6,_0px_3px_5px_#000]"
                  : ""
              }`}
              onClick={() => handleButtonClick("Content 2")}
            >
              Tinggi Badan
            </button>
            <button
              className={`button_detail text-sm sm:text-base px-4 py-2 rounded-lg ${
                activeContent === "Content 3"
                  ? "bg-blue-500 shadow-[0px_3px_2px_#3b82f6,_0px_3px_5px_#000]"
                  : ""
              }`}
              onClick={() => handleButtonClick("Content 3")}
            >
              Lingkar Kepala
            </button>
            <button
              className={`button_detail text-sm sm:text-base px-4 py-2 rounded-lg ${
                activeContent === "Content 4"
                  ? "bg-blue-500 shadow-[0px_3px_2px_#3b82f6,_0px_3px_5px_#000]"
                  : ""
              }`}
              onClick={() => handleButtonClick("Content 4")}
            >
              Gizi
            </button>
          </Col>

          {activeContent === "Content 1" && (
            <Col
              className="chart-container w-full mt-8 p-2 sm:p-4 border-2 border-gray-300 rounded-lg"
              span={24}
            >
              <div className="w-full min-h-[500px] sm:min-h-[700px]">
                <Line
                  data={
                    dataAnak?.gender === "LAKI_LAKI"
                      ? dataChartPriaBB
                      : dataChartPerempuanBB
                  }
                  options={optionsBB}
                />
              </div>
            </Col>
          )}

          {activeContent === "Content 2" && (
            <Col
              className="chart-container w-full mt-8 p-2 sm:p-4 border-2 border-gray-300 rounded-lg"
              span={24}
            >
              <div className="w-full min-h-[500px] sm:min-h-[700px]">
                <Line
                  data={
                    dataAnak?.gender === "LAKI_LAKI"
                      ? dataChartPriaTB
                      : dataChartPerempuanTB
                  }
                  options={optionsTB}
                />
              </div>
            </Col>
          )}

          {activeContent === "Content 3" && (
            <Col
              className="chart-container w-full mt-8 p-2 sm:p-4 border-2 border-gray-300 rounded-lg"
              span={24}
            >
              <div className="w-full min-h-[500px] sm:min-h-[700px]">
                <Line
                  data={
                    dataAnak?.gender === "LAKI_LAKI"
                      ? dataChartPriaLK
                      : dataChartPerempuanLK
                  }
                  options={optionsLK}
                />
              </div>
            </Col>
          )}

          {activeContent === "Content 4" && (
            <Col
              className="chart-container w-full mt-8 p-2 sm:p-4 border-2 border-gray-300 rounded-lg"
              span={24}
            >
              <div className="w-full min-h-[500px] sm:min-h-[700px]">
                <Line
                  data={
                    dataAnak?.gender === "LAKI_LAKI"
                      ? moment().diff(
                          moment(dataAnak?.tanggal_lahir),
                          "month"
                        ) >= 0 &&
                        moment().diff(
                          moment(dataAnak?.tanggal_lahir),
                          "month"
                        ) <= 24
                        ? dataChartPriaGizi_0_24
                        : dataChartPriaGizi_25_60
                      : moment().diff(
                          moment(dataAnak?.tanggal_lahir),
                          "month"
                        ) >= 0 &&
                        moment().diff(
                          moment(dataAnak?.tanggal_lahir),
                          "month"
                        ) <= 24
                      ? dataChartPerempuanGizi_0_24
                      : dataChartPerempuanGizi_25_60
                  }
                  options={optionsGizi}
                />
              </div>
            </Col>
          )}

          <FormInputPerkembanganAnak
            isOpen={isOpenModalInputPerkembanganAnak}
            onCancel={() => setIsOpenModalInputPerkembanganAnak(false)}
            data={dataAnak || null}
            idAnak={id}
          />

          <FormUpdatePerkembanganAnak
            isOpen={isOpenModalUpdatePerkembanganAnak}
            onCancel={() => setIsOpenModalUpdatePerkembanganAnak(false)}
            data={dataPerkembanganAnak}
            profil={dataAnak}
            idAnak={id}
          />
        </Row>
      </Container>
    </>
  );
}
