export type Gender = 'LAKI_LAKI' | 'PEREMPUAN';

export interface Anak {
  id: number;
  nama: string;
  panggilan?: string;
  tanggal_lahir: string;
  gender: Gender;
  alamat?: string;
  nama_ortu?: string;
  id_orang_tua?: number;
  id_posyandu?: number;
  status?: boolean | number | string;
  created_at?: string;
  updated_at?: string;
}
