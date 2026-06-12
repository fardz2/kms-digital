import dayjs from 'dayjs';
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

const GENDER = { MALE: 'LAKI_LAKI', FEMALE: 'PEREMPUAN' };

interface Reference {
  SD3neg: string;
  SD2neg: string;
  SD1neg: string;
  median: string;
  SD1pos: string;
  SD2pos: string;
  SD3pos: string;
}

interface ZScoreInput {
  berat?: number | null;
  tinggi?: number | null;
  lingkarKepala?: number | null;
  gender?: string;
  tanggalLahir?: string;
  tanggalPengukuran?: string;
}

function zFromReference(value: number | null | undefined, ref?: Reference): number | null {
  if (value == null || !ref) return null;

  const cuts: [number, number][] = [
    [parseFloat(ref.SD3neg), -3],
    [parseFloat(ref.SD2neg), -2],
    [parseFloat(ref.SD1neg), -1],
    [parseFloat(ref.median), 0],
    [parseFloat(ref.SD1pos), 1],
    [parseFloat(ref.SD2pos), 2],
    [parseFloat(ref.SD3pos), 3],
  ];

  if (value <= cuts[0][0]) {
    const width = cuts[1][0] - cuts[0][0];
    return -3 + (value - cuts[0][0]) / width;
  }
  if (value >= cuts[6][0]) {
    const width = cuts[6][0] - cuts[5][0];
    return 3 + (value - cuts[6][0]) / width;
  }
  for (let i = 0; i < cuts.length - 1; i++) {
    const [lo, zLo] = cuts[i];
    const [hi, zHi] = cuts[i + 1];
    if (value >= lo && value <= hi) {
      return zLo + ((value - lo) / (hi - lo)) * (zHi - zLo);
    }
  }
  return null;
}

function findByBulan(dataset: any[], umurBulan: number) {
  return dataset.find((d: any) => d.bulan === String(umurBulan));
}

export function roundPbToHalfStep(tinggi: number): number {
  const frac = tinggi - Math.floor(tinggi);
  if (frac === 0.5) return tinggi;
  if (frac < 0.5) return Math.floor(tinggi);
  return Math.floor(tinggi) + 0.5;
}

function findByPb(dataset: any[], pb: number) {
  return dataset.find((d: any) => parseFloat(d.pb) === pb);
}

export function computeZScoreBB({ berat, gender, tanggalLahir, tanggalPengukuran }: ZScoreInput) {
  if (berat == null || !tanggalLahir || !tanggalPengukuran) return null;
  const umur = monthDiff(dayjs(tanggalLahir), dayjs(tanggalPengukuran));
  const dataset = gender === GENDER.MALE ? bbPria : bbPerempuan;
  return zFromReference(berat, findByBulan(dataset, umur));
}

export function computeZScoreTB({ tinggi, gender, tanggalLahir, tanggalPengukuran }: ZScoreInput) {
  if (tinggi == null || !tanggalLahir || !tanggalPengukuran) return null;
  const umur = monthDiff(dayjs(tanggalLahir), dayjs(tanggalPengukuran));
  const dataset = gender === GENDER.MALE ? tbPria : tbPerempuan;
  return zFromReference(tinggi, findByBulan(dataset, umur));
}

export function computeZScoreLK({
  lingkarKepala,
  gender,
  tanggalLahir,
  tanggalPengukuran,
}: ZScoreInput) {
  if (lingkarKepala == null || !tanggalLahir || !tanggalPengukuran) return null;
  const umur = monthDiff(dayjs(tanggalLahir), dayjs(tanggalPengukuran));
  const dataset = gender === GENDER.MALE ? lkPria : lkPerempuan;
  return zFromReference(lingkarKepala, findByBulan(dataset, umur));
}

export function computeZScoreGizi({
  berat,
  tinggi,
  gender,
  tanggalLahir,
  tanggalPengukuran,
}: ZScoreInput) {
  if (berat == null || tinggi == null || !tanggalLahir || !tanggalPengukuran) {
    return null;
  }
  const umur = monthDiff(dayjs(tanggalLahir), dayjs(tanggalPengukuran));
  if (umur < 0 || umur > 60) return null;
  const pb = roundPbToHalfStep(tinggi);

  let dataset;
  if (gender === GENDER.MALE) {
    dataset = umur <= 24 ? bbtbPria24 : bbtbPria60;
  } else {
    dataset = umur <= 24 ? bbtbPerempuan24 : bbtbPerempuan60;
  }
  return zFromReference(berat, findByPb(dataset, pb));
}

export function computeAllZScores(input: ZScoreInput) {
  return {
    zScoreBB: computeZScoreBB(input),
    zScoreTB: computeZScoreTB(input),
    zScoreLK: computeZScoreLK(input),
    zScoreGizi: computeZScoreGizi(input),
  };
}
