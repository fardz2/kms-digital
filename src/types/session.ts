export type Role =
  | 'ADMIN'
  | 'KADER_POSYANDU'
  | 'TENAGA_KESEHATAN'
  | 'DESA'
  | 'ORANG_TUA';

export interface User {
  id: number;
  name: string;
  email?: string;
  role: Role;
  id_desa?: number;
  id_posyandu?: number;
  desa_name?: string;
  nama_desa?: string;
  posyandu_name?: string;
}

export interface Token {
  value: string;
  expires_at?: string;
}

export interface Session {
  user: User;
  token: Token;
}
