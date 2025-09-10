import { DatePicker, Form, Input, InputNumber, message, Modal } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
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
  determineAmbangBatasTinggiBadan,
  determineAmbangBatasPBBB,
} from "../../../utilities/determineAmbangBatas";
import { monthDiff } from "../../../utilities/calculateMonth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../hook/useAuth";
import "../FormUpdateDataAnak/formUpdateData_style.css";

export default function FormUpdatePerkembanganAnak(props) {
  const { isOpen, onCancel, data, profil, idAnak } = props;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const user = useAuth();
  const queryClient = useQueryClient();
  const [zScoreBB, setZScoreBB] = useState(0);
  const [zScoreTB, setZScoreTB] = useState(0);
  const [zScoreLK, setZScoreLK] = useState(0);
  const [zScoreBBPB, setZScoreBBPB] = useState(0);
  const [tanggalPengukuran, setTanggalPengukuran] = useState(null);
  const [beratBadanState, setBeratBadanState] = useState("");
  const [tinggiBadanState, setTinggiBadanState] = useState("");

  const updatePerkembanganAnakMutation = useMutation({
    mutationFn: async (payload) => {
      const url =
        user?.user?.role === "KADER_POSYANDU"
          ? `${process.env.REACT_APP_BASE_URL}/api/posyandu/statistik-anak/${data?.id}`
          : `${process.env.REACT_APP_BASE_URL}/api/orang-tua/statistik-anak/${data?.id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.token?.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Gagal memperbarui data");
      const responseData = await response.json();
      console.log("Response:", responseData);
      return responseData;
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Data berhasil tersimpan",
      });
      form.resetFields();
      onCancel();
      queryClient.invalidateQueries({
        queryKey: ["statistik-anak", idAnak],
      });
    },
    onError: (err) => {
      console.error("Error updating development data:", err);
      messageApi.open({
        type: "error",
        content: err.message || "Data gagal tersimpan",
      });
      setTimeout(() => {
        onCancel();
      }, 1000);
    },
  });

  useEffect(() => {
    if (isOpen && data) {
      form.setFieldsValue({
        tanggalPengukuran: moment(data.date),
        beratBadan: data.berat,
        tinggiBadan: data.tinggi,
        lingkarKepala: data.lingkar_kepala,
      });
      setTanggalPengukuran(data.date);
      setBeratBadanState(data.berat);
      setTinggiBadanState(data.tinggi);
      handleZScore(data.berat);
      handleZScoreTinggiBadan(data.tinggi);
      handleZScoreLingkarKepala(data.lingkar_kepala);
    }
  }, [isOpen, data, form]);

  const handleZScore = (beratBadan) => {
    setBeratBadanState(beratBadan);
    const datePengukuran = form.getFieldValue("tanggalPengukuran");
    if (datePengukuran && profil?.tanggal_lahir) {
      let antropologiData = null;
      const determineMonth = `${monthDiff(
        moment(profil.tanggal_lahir),
        moment(datePengukuran)
      )}`;

      if (profil?.gender === "LAKI_LAKI") {
        antropologiData = dataBeratBadanByUmurPria.find(
          (item) => item.bulan === determineMonth
        );
        if (antropologiData) {
          setZScoreBB(determineAmbangBatas(beratBadan, antropologiData));
        }
      } else {
        antropologiData = dataBeratBadanByUmurPerempuan.find(
          (item) => item.bulan === determineMonth
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
    } else if (
      tinggiBadan - Math.floor(tinggiBadan) === 0 ||
      tinggiBadan - Math.floor(tinggiBadan) < 0.5
    ) {
      result = Math.floor(tinggiBadan);
    } else {
      result = Math.floor(tinggiBadan) + 0.5;
    }
    if (
      zScoreTB !== null &&
      zScoreBB !== null &&
      tanggalPengukuran &&
      profil?.tanggal_lahir
    ) {
      let antropologiData = null;
      const umurAnak = monthDiff(
        moment(profil.tanggal_lahir),
        moment(tanggalPengukuran)
      );
      if (profil?.gender === "LAKI_LAKI") {
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
    const datePengukuran = form.getFieldValue("tanggalPengukuran");
    if (datePengukuran && profil?.tanggal_lahir) {
      let antropologiData = null;
      const determineMonth = `${monthDiff(
        moment(profil.tanggal_lahir),
        moment(datePengukuran)
      )}`;

      if (profil?.gender === "LAKI_LAKI") {
        antropologiData = dataTinggiBadanByUmurPria.find(
          (item) => item.bulan === determineMonth
        );
        if (antropologiData) {
          handleZScorePBBB(beratBadanState, tinggiBadan);
          setZScoreTB(
            determineAmbangBatasTinggiBadan(tinggiBadan, antropologiData)
          );
        }
      } else {
        antropologiData = dataTinggiBadanByUmurPerempuan.find(
          (item) => item.bulan === determineMonth
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
    const datePengukuran = form.getFieldValue("tanggalPengukuran");
    if (datePengukuran && profil?.tanggal_lahir) {
      let antropologiData = null;
      const determineMonth = `${monthDiff(
        moment(profil.tanggal_lahir),
        moment(datePengukuran)
      )}`;

      if (profil?.gender === "LAKI_LAKI") {
        antropologiData = dataLingkarKepalaByUmurPria.find(
          (item) => item.bulan === determineMonth
        );
        if (antropologiData) {
          setZScoreLK(
            determineAmbangBatasLingkarKepala(lingkarKepala, antropologiData)
          );
        }
      } else {
        antropologiData = dataLingkarKepalaByUmurPerempuan.find(
          (item) => item.bulan === determineMonth
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
          berat: parseFloat(values.beratBadan),
          tinggi: parseFloat(values.tinggiBadan),
          lingkar_kepala: parseFloat(values.lingkarKepala),
          date: moment(values.tanggalPengukuran).format("YYYY-MM-DD"),
          z_score_berat: zScoreBB,
          z_score_tinggi: zScoreTB,
          z_score_lingkar_kepala: zScoreLK,
          z_score_gizi: zScoreBBPB,
        };
        updatePerkembanganAnakMutation.mutate(payload);
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
        title="Update Data Perkembangan Anak"
        bodyStyle={{ padding: "16px" }}
        footer={[
          <button
            key="back"
            type="button"
            onClick={onCancel}
            className="batal_btn"
            style={{ marginRight: "8px" }}
            disabled={updatePerkembanganAnakMutation.isPending}
          >
            Batal
          </button>,
          <button
            key="submit"
            type="submit"
            onClick={onOK}
            className="simpan_btn"
            disabled={updatePerkembanganAnakMutation.isPending}
          >
            {updatePerkembanganAnakMutation.isPending
              ? "Menyimpan..."
              : "Simpan"}
          </button>,
        ]}
      >
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", marginBottom: "8px" }}>
            <span style={{ width: "120px" }}>Nama Anak</span>
            <span style={{ marginRight: "8px" }}>:</span>
            <span>{profil?.nama || "-"}</span>
          </div>
          <div style={{ display: "flex", marginBottom: "8px" }}>
            <span style={{ width: "120px" }}>Jenis Kelamin</span>
            <span style={{ marginRight: "8px" }}>:</span>
            <span>{profil?.gender || "-"}</span>
          </div>
          <div style={{ display: "flex", marginBottom: "8px" }}>
            <span style={{ width: "120px" }}>Tanggal Lahir</span>
            <span style={{ marginRight: "8px" }}>:</span>
            <span>{profil?.tanggal_lahir || "-"}</span>
          </div>
        </div>
        <Form
          form={form}
          name="form_update_perkembangan_anak"
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
