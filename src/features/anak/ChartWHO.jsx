import React, { useState, useMemo } from 'react';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import Button from '../../components/ui/Button';

import bbPria from '../../json/ZScoreBeratBadanLakiLaki.json';
import bbPerempuan from '../../json/ZScoreBeratBadanPerempuan.json';
import tbPria from '../../json/ZScorePanjangBadanLakiLaki.json';
import tbPerempuan from '../../json/ZScorePanjangBadanPerempuan.json';
import lkPria from '../../json/ZScoreLingkarKepalaLakiLaki.json';
import lkPerempuan from '../../json/ZScoreLingkarKepalaPerempuan.json';
import bbtbPria24 from '../../json/ZScoreBeratTinggiBadanLakiLaki24.json';
import bbtbPria60 from '../../json/ZScoreBeratTinggiBadanLakiLaki60.json';
import bbtbPerempuan24 from '../../json/ZScoreBeratTinggiBadanPerempuan24.json';
import bbtbPerempuan60 from '../../json/ZScoreBeratTinggiBadanPerempuan60.json';

import { monthDiff } from '../../utils/monthDiff';

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

const MONTH_LABELS = Array.from({ length: 61 }, (_, i) => i);

function buildPbLabels(start, end) {
  const labels = [];
  let v = start;
  while (v <= end) {
    labels.push(v);
    v += 0.5;
  }
  return labels;
}

const PB_LABELS_24 = buildPbLabels(45.0, 110.0);
const PB_LABELS_60 = buildPbLabels(65.0, 110.0);

function roundPb(t) {
  const frac = t - Math.floor(t);
  if (frac === 0.5) return t;
  if (frac < 0.5) return Math.floor(t);
  return Math.floor(t) + 0.5;
}

function mapDataByMonth(data, tanggalLahir, field) {
  const ageIndex = (data ?? []).map((it) =>
    monthDiff(moment(tanggalLahir), moment(it.date))
  );
  const result = [];
  let j = 0;
  for (let i = 0; i <= 60; i++) {
    if (ageIndex.includes(i) && j < data.length) {
      result.push(Number(data[j][field]));
      j++;
    } else {
      result.push(null);
    }
  }
  return result;
}

function mapGiziByPb(data, gender, ageAtFirst) {
  const pbs = (data ?? []).map((it) => roundPb(Number(it.tinggi)));
  let ref;
  if (gender === 'LAKI_LAKI') {
    ref = ageAtFirst <= 24 ? bbtbPria24 : bbtbPria60;
  } else {
    ref = ageAtFirst <= 24 ? bbtbPerempuan24 : bbtbPerempuan60;
  }
  const result = [];
  let j = 0;
  ref.forEach((item) => {
    if (j < pbs.length && parseFloat(pbs[j]) === parseFloat(item.pb)) {
      result.push(Number(data[j].berat));
      j++;
    } else {
      result.push(null);
    }
  });
  return result;
}

const SD_COLORS = {
  SD3: 'rgb(255, 0, 55)',
  SD2: 'rgb(255, 137, 163)',
  SD1: 'rgb(234, 255, 0)',
  MEDIAN: 'rgb(154, 255, 136)',
};

function buildAgeDatasets(genderRef, dataPoints) {
  return [
    {
      data: dataPoints,
      pointBackgroundColor: 'black',
      borderColor: 'black',
      type: 'scatter',
      showLine: false,
      pointRadius: 5,
      label: 'Data Anak',
    },
    { data: genderRef.map((d) => d.SD3neg), borderColor: SD_COLORS.SD3, type: 'line', label: 'SD -3' },
    { data: genderRef.map((d) => d.SD2neg), borderColor: SD_COLORS.SD2, type: 'line', label: 'SD -2' },
    { data: genderRef.map((d) => d.SD1neg), borderColor: SD_COLORS.SD1, type: 'line', label: 'SD -1' },
    { data: genderRef.map((d) => d.median), borderColor: SD_COLORS.MEDIAN, type: 'line', label: 'Median' },
    { data: genderRef.map((d) => d.SD1pos), borderColor: SD_COLORS.SD1, type: 'line', label: 'SD +1' },
    { data: genderRef.map((d) => d.SD2pos), borderColor: SD_COLORS.SD2, type: 'line', label: 'SD +2' },
    { data: genderRef.map((d) => d.SD3pos), borderColor: SD_COLORS.SD3, type: 'line', label: 'SD +3' },
  ];
}

function ageChartOptions(yLabel, unit) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { title: { display: true, text: `${yLabel} (${unit})` } },
      x: { title: { display: true, text: 'Umur (Bulan)' }, min: 0, max: 60 },
    },
    elements: { point: { radius: 0 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${yLabel}: ${ctx.parsed.y} ${unit}`,
        },
      },
      title: { display: true, text: `${yLabel} berdasarkan Umur` },
    },
  };
}

export default function ChartWHO({ anak, pengukuran }) {
  const [tab, setTab] = useState('BB');

  const gender = anak?.gender;
  const tanggalLahir = anak?.tanggal_lahir;

  const ageAtFirst = useMemo(() => {
    if (!tanggalLahir || !pengukuran?.[0]?.date) return 0;
    return monthDiff(moment(tanggalLahir), moment(pengukuran[0].date));
  }, [tanggalLahir, pengukuran]);

  const dataBB = useMemo(
    () => mapDataByMonth(pengukuran, tanggalLahir, 'berat'),
    [pengukuran, tanggalLahir]
  );
  const dataTB = useMemo(
    () => mapDataByMonth(pengukuran, tanggalLahir, 'tinggi'),
    [pengukuran, tanggalLahir]
  );
  const dataLK = useMemo(
    () => mapDataByMonth(pengukuran, tanggalLahir, 'lingkar_kepala'),
    [pengukuran, tanggalLahir]
  );
  const dataGizi = useMemo(
    () => mapGiziByPb(pengukuran, gender, ageAtFirst),
    [pengukuran, gender, ageAtFirst]
  );

  const refBB = gender === 'LAKI_LAKI' ? bbPria : bbPerempuan;
  const refTB = gender === 'LAKI_LAKI' ? tbPria : tbPerempuan;
  const refLK = gender === 'LAKI_LAKI' ? lkPria : lkPerempuan;

  const refGizi =
    gender === 'LAKI_LAKI'
      ? ageAtFirst <= 24
        ? bbtbPria24
        : bbtbPria60
      : ageAtFirst <= 24
      ? bbtbPerempuan24
      : bbtbPerempuan60;
  const pbLabels = ageAtFirst <= 24 ? PB_LABELS_24 : PB_LABELS_60;

  const charts = {
    BB: {
      data: { labels: MONTH_LABELS, datasets: buildAgeDatasets(refBB, dataBB) },
      options: ageChartOptions('Berat Badan', 'kg'),
    },
    TB: {
      data: { labels: MONTH_LABELS, datasets: buildAgeDatasets(refTB, dataTB) },
      options: ageChartOptions('Tinggi Badan', 'cm'),
    },
    LK: {
      data: { labels: MONTH_LABELS, datasets: buildAgeDatasets(refLK, dataLK) },
      options: ageChartOptions('Lingkar Kepala', 'cm'),
    },
    Gizi: {
      data: { labels: pbLabels, datasets: buildAgeDatasets(refGizi, dataGizi) },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { title: { display: true, text: 'Berat Badan (kg)' } },
          x: { title: { display: true, text: 'Panjang Badan (cm)' }, min: 45, max: 110 },
        },
        elements: { point: { radius: 0 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Berat: ${ctx.parsed.y} kg, Tinggi: ${ctx.parsed.x} cm`,
            },
          },
          title: { display: true, text: 'Berat Badan berdasarkan Panjang Badan' },
        },
      },
    },
  };

  const current = charts[tab];

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
        {[
          { key: 'BB', label: 'Berat Badan' },
          { key: 'TB', label: 'Tinggi Badan' },
          { key: 'LK', label: 'Lingkar Kepala' },
          { key: 'Gizi', label: 'Gizi' },
        ].map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>
      <div
        style={{
          width: '100%',
          minHeight: 500,
          padding: 'var(--space-md)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
        }}
      >
        <Line data={current.data} options={current.options} />
      </div>
    </div>
  );
}
