export interface Pengukuran {
  id: number;
  id_anak: number;
  date: string;
  berat: number;
  tinggi: number;
  lingkar_kepala: number;
  lila?: number | null;
  catatan?: string | null;
  created_at?: string;
  updated_at?: string;
}
