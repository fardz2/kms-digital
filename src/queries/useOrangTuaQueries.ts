import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orangTuaApi } from '../api/approve.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

interface OrangTua {
  id: number;
  nama: string;
  email?: string;
  alamat?: string;
  status?: boolean | number | string;
  id_posyandu?: number;
  id_desa?: number;
  created_at?: string;
}

interface CreateOrangTuaPayload {
  email: string;
  password: string;
  nama: string;
  alamat: string;
  status?: boolean;
  id_posyandu?: number;
  id_desa?: number;
}

interface UpdateOrangTuaParams {
  id: number;
  payload: Partial<CreateOrangTuaPayload>;
}

export function useOrangTuaList(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery<OrangTua[]>({
    queryKey: qk.orangTua.list,
    queryFn: async () => {
      const res = await orangTuaApi.list();
      return res.data ?? [];
    },
    enabled: enabled && isAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useCreateOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrangTuaPayload) => orangTuaApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orangTua.list });
      qc.invalidateQueries({ queryKey: qk.approve.orangTua });
    },
  });
}

export function useUpdateOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateOrangTuaParams) =>
      orangTuaApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orangTua.list });
    },
  });
}

export function useDeleteOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => orangTuaApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orangTua.list });
    },
  });
}
