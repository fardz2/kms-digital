import moment from 'moment';
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

function zFromReference(value, ref) {
  if (value == null || !ref) return null;
  const median = parseFloat(ref.median);
  if (value >= median) {
    const sdPos = parseFloat(ref.SD1pos);
    return (value - median) / (sdPos - median);
  }
  const sdNeg = parseFloat(ref.SD1neg);
  return (value - median) / (median - sdNeg);
}

function findByBulan(dataset, umurBulan) {
  return dataset.find((d) => d.bulan === String(umurBulan));
}

function roundPbToHalfStep(tinggi) {
  const frac = tinggi - Math.floor(tinggi);
  if (frac === 0.5) return tinggi;
  if (frac < 0.5) return Math.floor(tinggi);
  return Math.floor(tinggi) + 0.5;
}

function findByPb(dataset, pb) {
  return dataset.find((d) => parseFloat(d.pb) === pb);
}

export function computeZScoreBB({ berat, gender, tanggalLahir, tanggalPengukuran }) {
  if (berat == null || !tanggalLahir || !tanggalPengukuran) return null;
  const umur = monthDiff(moment(tanggalLahir), moment(tanggalPengukuran));
  const dataset = gender === GENDER.MALE ? bbPria : bbPerempuan;
  return zFromReference(berat, findByBulan(dataset, umur));
}

export function computeZScoreTB({ tinggi, gender, tanggalLahir, tanggalPengukuran }) {
  if (tinggi == null || !tanggalLahir || !tanggalPengukuran) return null;
  const umur = monthDiff(moment(tanggalLahir), moment(tanggalPengukuran));
  const dataset = gender === GENDER.MALE ? tbPria : tbPerempuan;
  return zFromReference(tinggi, findByBulan(dataset, umur));
}

export function computeZScoreLK({
  lingkarKepala,
  gender,
  tanggalLahir,
  tanggalPengukuran,
}) {
  if (lingkarKepala == null || !tanggalLahir || !tanggalPengukuran) return null;
  const umur = monthDiff(moment(tanggalLahir), moment(tanggalPengukuran));
  const dataset = gender === GENDER.MALE ? lkPria : lkPerempuan;
  return zFromReference(lingkarKepala, findByBulan(dataset, umur));
}

export function computeZScoreGizi({
  berat,
  tinggi,
  gender,
  tanggalLahir,
  tanggalPengukuran,
}) {
  if (berat == null || tinggi == null || !tanggalLahir || !tanggalPengukuran) {
    return null;
  }
  const umur = monthDiff(moment(tanggalLahir), moment(tanggalPengukuran));
  const pb = roundPbToHalfStep(tinggi);

  let dataset;
  if (gender === GENDER.MALE) {
    dataset = umur <= 24 ? bbtbPria24 : bbtbPria60;
  } else {
    dataset = umur <= 24 ? bbtbPerempuan24 : bbtbPerempuan60;
  }
  return zFromReference(berat, findByPb(dataset, pb));
}

export function computeAllZScores(input) {
  return {
    zScoreBB: computeZScoreBB(input),
    zScoreTB: computeZScoreTB(input),
    zScoreLK: computeZScoreLK(input),
    zScoreGizi: computeZScoreGizi(input),
  };
}
