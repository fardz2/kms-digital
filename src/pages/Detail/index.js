import { useState } from "react";
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
import { Table, message } from "antd";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { monthDiff } from "../../utilities/calculateMonth";
import Image from "react-bootstrap/Image";
import bayi from "../../assets/img/bayi_1.png";
import "./detail-style.css";
import bg_dashboard from "../../assets/img/bg-dashboard.svg";
import useAuth from "../../hook/useAuth";

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

export default function Detail() {
  const { id } = useParams();

  const [messageApi, contextHolder] = message.useMessage();
  const [activeContent, setActiveContent] = useState("Content 1");

  const user = useAuth();

  // Fetch child data using useQuery
  const { data: dataAnak, isLoading: anakLoading } = useQuery({
    queryKey: ["data-anak", id],
    queryFn: async () => {
      const url =
        user?.user?.role !== "ORANG_TUA"
          ? `${process.env.REACT_APP_BASE_URL}/api/posyandu/data-anak/${id}`
          : `${process.env.REACT_APP_BASE_URL}/api/orang-tua/data-anak/${id}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${user?.token?.value}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data anak");
      const data = await response.json();
      return data.data;
    },
    onError: (err) => {
      console.error("Error fetching child data:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data anak",
      });
    },
    enabled: !!user?.token?.value,
  });

  // Fetch development statistics using useQuery
  const { data: data, isLoading: perkembanganLoading } = useQuery({
    queryKey: ["statistik-anak", id, user?.user?.role],
    queryFn: async () => {
      const url =
        user?.user?.role !== "ORANG_TUA"
          ? `${process.env.REACT_APP_BASE_URL}/api/posyandu/statistik-anak/${id}`
          : `${process.env.REACT_APP_BASE_URL}/api/orang-tua/statistik-anak/${id}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${user?.token?.value}` },
      });
      if (!response.ok)
        throw new Error("Gagal mengambil data perkembangan anak");
      const data = await response.json();
      return data.data.sort((a, b) => a.date.localeCompare(b.date));
    },
    onError: (err) => {
      console.error("Error fetching development data:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Gagal mengambil data perkembangan anak",
      });
    },
    enabled: !!user?.token?.value,
  });

  const labels = Array.from(Array(61).keys());
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
    const dataset = [];
    for (let i = 0; i < data?.length; i++) {
      const diff = monthDiff(
        moment(dataAnak?.tanggal_lahir),
        moment(data[i].date)
      );
      dataset.push(Math.abs(diff));
    }

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
  }

  const getPointRadius = () => {
    return typeof window !== "undefined" && window.innerWidth < 640 ? 3 : 5;
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

  const columns = [
    {
      title: "Tanggal Pengukuran",
      key: "date",
      dataIndex: "date",
      render: (date) => moment(date).format("DD MMMM YYYY"),
    },
    {
      title: "Umur",
      dataIndex: "date",
      key: "date",
      render: (tanggalPengukuran) =>
        `${monthDiff(
          moment(dataAnak?.tanggal_lahir),
          moment(tanggalPengukuran)
        )} Bulan`,
    },
    {
      title: "Berat Badan",
      key: "berat",
      dataIndex: "berat",
      render: (berat) => `${berat} kg`,
    },
    {
      title: "Status - BB/U",
      key: "statusBB",
      dataIndex: ["statistik", "berat"],
    },
    {
      title: "Tinggi Badan",
      key: "tinggi",
      dataIndex: "tinggi",
      render: (tinggi) => `${tinggi} cm`,
    },
    {
      title: "Status - TB/U",
      key: "statusTB",
      dataIndex: ["statistik", "tinggi"],
    },
    {
      title: "Lingkar Kepala",
      key: "lingkar_kepala",
      dataIndex: "lingkar_kepala",
      render: (lingkar_kepala) => `${lingkar_kepala} cm`,
    },
    {
      title: "Status - LK/U",
      key: "statusLK",
      dataIndex: ["statistik", "lingkar_kepala"],
    },
    {
      title: "Status - Gizi",
      key: "statusGizi",
      dataIndex: ["statistik", "gizi"],
    },
  ];

  const handleButtonClick = (content) => {
    setActiveContent(content);
  };

  return (
    <>
      {contextHolder}
      <Navbar isLogin />
      <BackgroundComponent />
      <div className="flex flex-col items-center p-3 sm:p-6 lg:p-8 w-full justify-center">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 w-full max-w-[800px] lg:h-[350px] h-auto mt-16">
          <div className="flex-1 text-left">
            <h6 className="dashboard text-2xl lg:text-5xl">
              {dataAnak?.nama || ""}
            </h6>
            <h6 className="dashboard text-2xl lg:text-5xl">
              {dataAnak?.tanggal_lahir
                ? `${moment().diff(
                    moment(dataAnak.tanggal_lahir),
                    "month"
                  )} Bulan`
                : ""}
            </h6>
          </div>
          <div className="flex flex-1 justify-center">
            <Image
              style={{ width: "150px", height: "auto" }}
              src={bayi}
              className="rounded"
            />
          </div>
        </div>

        <div className="w-full max-w-[1200px] px-4 sm:px-6 overflow-x-auto mt-20">
          <Table
            columns={columns}
            dataSource={data || []}
            loading={anakLoading || perkembanganLoading}
            pagination={{ pageSize: 7 }}
            className="ant-table"
          />
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center w-full max-w-[1200px] mt-4 sm:mt-6">
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
        </div>

        {activeContent === "Content 1" && (
          <div className="chart-container w-full max-w-[1200px] mt-6 sm:mt-8 p-2 sm:p-4 border-2 border-gray-300 rounded-lg">
            <div className="w-full min-h-[300px] sm:min-h-[700px]">
              <Line
                data={
                  dataAnak?.gender === "LAKI_LAKI"
                    ? dataChartPriaBB
                    : dataChartPerempuanBB
                }
                options={optionsBB}
              />
            </div>
          </div>
        )}

        {activeContent === "Content 2" && (
          <div className="chart-container w-full max-w-[1200px] mt-6 sm:mt-8 p-2 sm:p-4 border-2 border-gray-300 rounded-lg">
            <div className="w-full min-h-[300px] sm:min-h-[700px]">
              <Line
                data={
                  dataAnak?.gender === "LAKI_LAKI"
                    ? dataChartPriaTB
                    : dataChartPerempuanTB
                }
                options={optionsTB}
              />
            </div>
          </div>
        )}

        {activeContent === "Content 3" && (
          <div className="chart-container w-full max-w-[1200px] mt-6 sm:mt-8 p-2 sm:p-4 border-2 border-gray-300 rounded-lg">
            <div className="w-full min-h-[300px] sm:min-h-[700px]">
              <Line
                data={
                  dataAnak?.gender === "LAKI_LAKI"
                    ? dataChartPriaLK
                    : dataChartPerempuanLK
                }
                options={optionsLK}
              />
            </div>
          </div>
        )}

        {activeContent === "Content 4" && (
          <div className="chart-container w-full max-w-[1200px] mt-6 sm:mt-8 p-2 sm:p-4 border-2 border-gray-300 rounded-lg">
            <div className="w-full min-h-[300px] sm:min-h-[700px]">
              <Line
                data={
                  dataAnak?.gender === "LAKI_LAKI"
                    ? moment().diff(moment(dataAnak.tanggal_lahir), "month") >=
                        0 &&
                      moment().diff(moment(dataAnak.tanggal_lahir), "month") <=
                        24
                      ? dataChartPriaGizi_0_24
                      : dataChartPriaGizi_25_60
                    : moment().diff(moment(dataAnak.tanggal_lahir), "month") >=
                        0 &&
                      moment().diff(moment(dataAnak.tanggal_lahir), "month") <=
                        24
                    ? dataChartPerempuanGizi_0_24
                    : dataChartPerempuanGizi_25_60
                }
                options={optionsGizi}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
