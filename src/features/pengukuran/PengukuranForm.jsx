import React, { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { DatePicker } from 'antd';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import NumberSlider from '../../components/ui/NumberSlider';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';
import CatatanField from './CatatanField';
import { computeAllZScores } from './zScore';
import { overallStatus, STATUS } from './statusGizi';
import { monthDiff } from '../../utils/monthDiff';
import {
  useCreatePengukuran,
  useUpdatePengukuran,
} from '../../queries/usePengukuranQueries';

const DEFAULTS = {
  berat: 8.0,
  tinggi: 70.0,
  lingkarKepala: 45.0,
  lila: 13.0,
  catatan: '',
};

export default function PengukuranForm({ open, onClose, anak, existing, prefillFrom }) {
  const toast = useToast();
  const createMutation = useCreatePengukuran(anak?.id);
  const updateMutation = useUpdatePengukuran(anak?.id);

  const isEdit = !!existing;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const [tanggal, setTanggal] = useState(moment());
  const [berat, setBerat] = useState(DEFAULTS.berat);
  const [tinggi, setTinggi] = useState(DEFAULTS.tinggi);
  const [lingkarKepala, setLingkarKepala] = useState(DEFAULTS.lingkarKepala);
  const [lila, setLila] = useState(DEFAULTS.lila);
  const [catatan, setCatatan] = useState(DEFAULTS.catatan);

  useEffect(() => {
    if (!open) return;
    const source = existing ?? prefillFrom;
    if (source) {
      setTanggal(existing?.date ? moment(existing.date) : moment());
      setBerat(Number(source.berat) || DEFAULTS.berat);
      setTinggi(Number(source.tinggi) || DEFAULTS.tinggi);
      setLingkarKepala(Number(source.lingkar_kepala) || DEFAULTS.lingkarKepala);
      setLila(Number(source.lila) || DEFAULTS.lila);
      setCatatan(existing?.catatan ?? '');
    } else {
      setTanggal(moment());
      setBerat(DEFAULTS.berat);
      setTinggi(DEFAULTS.tinggi);
      setLingkarKepala(DEFAULTS.lingkarKepala);
      setLila(DEFAULTS.lila);
      setCatatan(DEFAULTS.catatan);
    }
  }, [open, existing, prefillFrom]);

  const umurBulan = useMemo(() => {
    if (!anak?.tanggal_lahir || !tanggal) return null;
    return monthDiff(moment(anak.tanggal_lahir), tanggal);
  }, [anak?.tanggal_lahir, tanggal]);

  const showLila = umurBulan != null && umurBulan >= 7;

  const zScores = useMemo(() => {
    if (!anak?.gender || !anak?.tanggal_lahir || !tanggal) return null;
    return computeAllZScores({
      berat,
      tinggi,
      lingkarKepala,
      gender: anak.gender,
      tanggalLahir: anak.tanggal_lahir,
      tanggalPengukuran: tanggal.format('YYYY-MM-DD'),
    });
  }, [anak, tanggal, berat, tinggi, lingkarKepala]);

  const status = zScores ? overallStatus(zScores) : STATUS.UNKNOWN;

  const handleSubmit = () => {
    const payload = {
      id_anak: parseInt(anak.id, 10),
      berat,
      tinggi,
      lingkar_kepala: lingkarKepala,
      lila: showLila ? lila : null,
      catatan: catatan?.trim() || null,
      date: tanggal.format('YYYY-MM-DD'),
      z_score_berat: zScores?.zScoreBB ?? 0,
      z_score_tinggi: zScores?.zScoreTB ?? 0,
      z_score_lingkar_kepala: zScores?.zScoreLK ?? 0,
      z_score_gizi: zScores?.zScoreGizi ?? 0,
    };

    const handlers = {
      onSuccess: () => {
        toast.success(isEdit ? 'Data diperbarui' : 'Pengukuran tersimpan');
        onClose?.();
      },
      onError: (err) => {
        toast.error(err?.message ?? 'Gagal menyimpan');
      },
    };

    if (isEdit) {
      updateMutation.mutate({ id: existing.id, payload }, handlers);
    } else {
      createMutation.mutate(payload, handlers);
    }
  };

  return (
    <>
      {toast.contextHolder}
      <Modal
        title={isEdit ? 'Ubah Pengukuran' : `Pengukuran — ${anak?.nama ?? ''}`}
        open={open}
        onCancel={onClose}
        width={560}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={isSaving}>
              {isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-overline text-neutral-600 mb-2 block">
              📅 Tanggal Pengukuran
            </label>
            <DatePicker
              value={tanggal}
              onChange={(v) => v && setTanggal(v)}
              allowClear={false}
              className="w-full h-12 text-base"
              format="DD MMMM YYYY"
            />
            {umurBulan != null && (
              <p className="text-caption text-neutral-500 mt-1">
                Umur saat diukur: {umurBulan} bulan
              </p>
            )}
          </div>

          <NumberSlider
            label="⚖️ Berat Badan"
            min={0}
            max={20}
            step={0.1}
            value={berat}
            onChange={setBerat}
            unit="kg"
          />

          <NumberSlider
            label="📏 Tinggi Badan"
            min={0}
            max={118}
            step={0.5}
            value={tinggi}
            onChange={setTinggi}
            unit="cm"
          />

          <NumberSlider
            label="🧠 Lingkar Kepala"
            min={30}
            max={55}
            step={0.1}
            value={lingkarKepala}
            onChange={setLingkarKepala}
            unit="cm"
          />

          {showLila && (
            <NumberSlider
              label="💪 Lingkar Lengan (LILA)"
              min={5}
              max={20}
              step={0.1}
              value={lila}
              onChange={setLila}
              unit="cm"
            />
          )}

          <CatatanField value={catatan} onChange={setCatatan} />

          <div className="p-[17px] bg-polar-mist rounded-default flex items-center gap-[13px]">
            <span className="text-body-sm font-semibold text-deep-slate">
              Status Gizi:
            </span>
            <StatusBadge status={status} />
          </div>
        </div>
      </Modal>
    </>
  );
}
