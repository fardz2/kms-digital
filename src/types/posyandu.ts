export interface Desa {
  id: number;
  name: string;
  created_at?: string;
}

export interface Posyandu {
  id: number;
  nama: string;
  alamat?: string;
  id_desa: number;
  desa?: Desa;
  created_at?: string;
}
