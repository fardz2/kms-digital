import { DatePicker, Form, Input, InputNumber, message, Modal } from "antd";
import moment from "moment";
import React, { useState } from "react";
import dataBeratBadanByUmurPria from "../../../json/ZScoreBeratBadanLakiLaki.json";
import dataBeratBadanByUmurPerempuan from "../../../json/ZScoreBeratBadanPerempuan.json";
import dataTinggiBadanByUmurPria from "../../../json/ZScorePanjangBadanLakiLaki.json";
import dataTinggiBadanByUmurPerempuan from "../../../json/ZScorePanjangBadanPerempuan.json";
import dataLingkarKepalaByUmurPria from "../../../json/ZScoreLingkarKepalaLakiLaki.json";
import dataLingkarKepalaByUmurPerempuan from "../../../json/ZScoreLingkarKepalaPerempuan.json";
import dataBeratTinggiBadanPria24Bulan from "../../../json/ZScoreBeratTinggiBadanLakiLaki24.json";
import dataBeratTinggiBadanPria60Bulan from "../../../json/ZScoreBeratTinggiBadanLakiLaki60.json";
import dataBeratTinggiBadanPerempuan24Bulan from "../../../json/ZScoreBeratTinggiBadanPerempuan24.json";
import dataBeratTinggiBadanPerempuan60Bulan from "../../../json/ZScoreBeratTinggiBadanPerempuan60.json";
import {
  determineAmbangBatas,
  determineAmbangBatasLingkarKepala,
  determineAmbangBatasPBBB,
  determineAmbangBatasTinggiBadan,
} from "../../../utilities/determineAmbangBatas";
import { monthDiff } from "../../../utilities/calculateMonth";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import useAuth from "../../../hook/useAuth";

export default function FormInputPerkembanganAnak(props) {
  const { isOpen, onCancel, data, idAnak } = props;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const user = useAuth();
  const [zScoreBB, setZScoreBB] = useState(0);
  const [zScoreTB, setZScoreTB] = useState(0);
  const [zScoreLK, setZScoreLK] = useState(0);
  const [zScoreBBPB, setZScoreBBPB] = useState(0);
  const [tanggalPengukuran, setTanggalPengukuran] = useState("");
  const [beratBadanState, setBeratBadanState] = useState("");
  const [tinggiBadanState, setTinggiBadanState] = useState("");
  const queryClient = useQueryClient();
  const savePerkembanganAnakMutation = useMutation({
    mutationFn: async (payload) => {
      const url =
        user?.user?.role === "KADER_POSYANDU"
          ? `${process.env.REACT_APP_BASE_URL}/api/posyandu/statistik-anak`
          : `${process.env.REACT_APP_BASE_URL}/api/orang-tua/statistik-anak`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token?.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Gagal menyimpan data");
      return response.json();
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Data berhasil tersimpan",
      });
      form.resetFields();
      onCancel();
      queryClient.invalidateQueries(["statistik-anak", idAnak]);
    },
    onError: (err) => {
      console.error("Error saving development data:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Data gagal tersimpan",
      });
      setTimeout(() => {
        onCancel();
      }, 1000);
    },
  });

  const handleZScore = (beratBadan) => {
    setBeratBadanState(beratBadan);
    if (tanggalPengukuran) {
      let antropologiData = null;
      const umurBulan = monthDiff(
        moment(data?.tanggal_lahir),
        moment(tanggalPengukuran)
      );
      if (data?.gender === "LAKI_LAKI") {
        antropologiData = dataBeratBadanByUmurPria.find(
          (item) => item.bulan === `${umurBulan}`
        );
        if (antropologiData) {
          setZScoreBB(determineAmbangBatas(beratBadan, antropologiData));
        }
      } else {
        antropologiData = dataBeratBadanByUmurPerempuan.find(
          (item) => item.bulan === `${umurBulan}`
        );
        if (antropologiData) {
          setZScoreBB(determineAmbangBatas(beratBadan, antropologiData));
        }
      }
    } else {
      setZScoreBB(0);
    }
  };

  const handleZScorePBBB = (beratBadan, tinggiBadan) => {
    let result;
    if (tinggiBadan - Math.floor(tinggiBadan) === 0.5) {
      result = tinggiBadan;
    } else if (tinggiBadan - Math.floor(tinggiBadan) < 0.5) {
      result = Math.floor(tinggiBadan);
    } else {
      result = Math.floor(tinggiBadan) + 0.5;
    }
    if (zScoreTB !== null && zScoreBB !== null && tanggalPengukuran) {
      let antropologiData = null;
      const umurAnak = monthDiff(
        moment(data?.tanggal_lahir),
        moment(tanggalPengukuran)
      );
      if (data?.gender === "LAKI_LAKI") {
        if (umurAnak >= 0 && umurAnak <= 24) {
          antropologiData = dataBeratTinggiBadanPria24Bulan.find(
            (item) => parseFloat(item.pb) === result
          );
        } else if (umurAnak > 24 && umurAnak <= 60) {
          antropologiData = dataBeratTinggiBadanPria60Bulan.find(
            (item) => parseFloat(item.pb) === result
          );
        }
      } else {
        if (umurAnak >= 0 && umurAnak <= 24) {
          antropologiData = dataBeratTinggiBadanPerempuan24Bulan.find(
            (item) => parseFloat(item.pb) === result
          );
        } else if (umurAnak > 24 && umurAnak <= 60) {
          antropologiData = dataBeratTinggiBadanPerempuan60Bulan.find(
            (item) => parseFloat(item.pb) === result
          );
        }
      }
      if (antropologiData) {
        setZScoreBBPB(
          determineAmbangBatasPBBB(tinggiBadan, beratBadan, antropologiData)
        );
      }
    } else {
      setZScoreBBPB(0);
    }
  };

  const handleZScoreTinggiBadan = (tinggiBadan) => {
    setTinggiBadanState(tinggiBadan);
    if (tanggalPengukuran) {
      let antropologiData = null;
      const umurBulan = monthDiff(
        moment(data?.tanggal_lahir),
        moment(tanggalPengukuran)
      );
      if (data?.gender === "LAKI_LAKI") {
        antropologiData = dataTinggiBadanByUmurPria.find(
          (item) => item.bulan === `${umurBulan}`
        );
        if (antropologiData) {
          handleZScorePBBB(beratBadanState, tinggiBadan);
          setZScoreTB(
            determineAmbangBatasTinggiBadan(tinggiBadan, antropologiData)
          );
        }
      } else {
        antropologiData = dataTinggiBadanByUmurPerempuan.find(
          (item) => item.bulan === `${umurBulan}`
        );
        if (antropologiData) {
          handleZScorePBBB(beratBadanState, tinggiBadan);
          setZScoreTB(
            determineAmbangBatasTinggiBadan(tinggiBadan, antropologiData)
          );
        }
      }
    } else {
      handleZScorePBBB(beratBadanState, tinggiBadan);
      setZScoreTB(0);
    }
  };

  const handleZScoreLingkarKepala = (lingkarKepala) => {
    if (tanggalPengukuran) {
      let antropologiData = null;
      const umurBulan = monthDiff(
        moment(data?.tanggal_lahir),
        moment(tanggalPengukuran)
      );
      if (data?.gender === "LAKI_LAKI") {
        antropologiData = dataLingkarKepalaByUmurPria.find(
          (item) => item.bulan === `${umurBulan}`
        );
        if (antropologiData) {
          setZScoreLK(
            determineAmbangBatasLingkarKepala(lingkarKepala, antropologiData)
          );
        }
      } else {
        antropologiData = dataLingkarKepalaByUmurPerempuan.find(
          (item) => item.bulan === `${umurBulan}`
        );
        if (antropologiData) {
          setZScoreLK(
            determineAmbangBatasLingkarKepala(lingkarKepala, antropologiData)
          );
        }
      }
    } else {
      setZScoreLK(0);
    }
  };

  function onOK() {
    form
      .validateFields()
      .then((values) => {
        const payload = {
          id_anak: parseInt(idAnak),
          berat: values.beratBadan,
          tinggi: values.tinggiBadan,
          lingkar_kepala: values.lingkarKepala,
          date: moment(values.tanggalPengukuran).format("YYYY-MM-DD"),
          z_score_berat: zScoreBB,
          z_score_tinggi: zScoreTB,
          z_score_lingkar_kepala: zScoreLK,
          z_score_gizi: zScoreBBPB,
        };
        savePerkembanganAnakMutation.mutate(payload);
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
        title="Input Data Perkembangan Anak"
        bodyStyle={{ padding: "16px" }}
        footer={[
          <button
            key="back"
            type="button"
            onClick={onCancel}
            className="batal_btn"
            style={{ marginRight: "8px" }}
            disabled={savePerkembanganAnakMutation.isPending}
          >
            Batal
          </button>,
          <button
            key="submit"
            type="submit"
            onClick={onOK}
            className="simpan_btn"
            disabled={savePerkembanganAnakMutation.isPending}
          >
            {savePerkembanganAnakMutation.isPending ? "Menyimpan..." : "Simpan"}
          </button>,
        ]}
      >
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", marginBottom: "8px" }}>
            <span style={{ width: "120px" }}>Nama Anak</span>
            <span style={{ marginRight: "8px" }}>:</span>
            <span>{data?.nama || "-"}</span>
          </div>
          <div style={{ display: "flex", marginBottom: "8px" }}>
            <span style={{ width: "120px" }}>Jenis Kelamin</span>
            <span style={{ marginRight: "8px" }}>:</span>
            <span>{data?.gender || "-"}</span>
          </div>
          <div style={{ display: "flex", marginBottom: "8px" }}>
            <span style={{ width: "120px" }}>Tanggal Lahir</span>
            <span style={{ marginRight: "8px" }}>:</span>
            <span>{data?.tanggal_lahir || "-"}</span>
          </div>
        </div>
        <Form
          form={form}
          name="form_input_perkembangan_anak"
          layout="vertical"
          style={{ width: "100%" }}
        >
          <Form.Item
            label="Tanggal Pengukuran"
            name="tanggalPengukuran"
            rules={[
              { required: true, message: "Tanggal Pengukuran masih kosong!" },
            ]}
          >
            <DatePicker
              onChange={(values) =>
                setTanggalPengukuran(
                  values ? moment(values).format("YYYY-MM-DD") : ""
                )
              }
              allowClear={false}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            label="Berat Badan"
            name="beratBadan"
            rules={[{ required: true, message: "Berat Badan masih kosong!" }]}
          >
            <InputNumber
              min={0}
              onChange={handleZScore}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="ZScoreBB" style={{ display: "none" }}>
            <Input value={`${zScoreBB} SD`} disabled type="hidden" />
          </Form.Item>
          <Form.Item
            label="Tinggi Badan"
            name="tinggiBadan"
            rules={[{ required: true, message: "Tinggi Badan masih kosong!" }]}
          >
            <InputNumber
              min={0}
              onChange={handleZScoreTinggiBadan}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="ZScoreTB" style={{ display: "none" }}>
            <Input value={`${zScoreTB} SD`} disabled type="hidden" />
          </Form.Item>
          <Form.Item name="ZScoreGizi" style={{ display: "none" }}>
            <Input value={`${zScoreBBPB} SD`} disabled type="hidden" />
          </Form.Item>
          <Form.Item
            label="Lingkar Kepala"
            name="lingkarKepala"
            rules={[
              { required: true, message: "Lingkar Kepala masih kosong!" },
            ]}
          >
            <InputNumber
              min={0}
              onChange={handleZScoreLingkarKepala}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="ZScoreLK" style={{ display: "none" }}>
            <Input value={`${zScoreLK} SD`} disabled type="hidden" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
