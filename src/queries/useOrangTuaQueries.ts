import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orangTuaApi } from '../api/approve.api';
import { qk } from './keys';
import { optimisticUpdate, optimisticRemove } from './optimistic';
import { useSession } from '../features/auth/useSession';

interface OrangTua {
  id: number;
  nama: string;
  username?: string;
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
  username?: string;
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
      qc.invalidateQueries({ queryKey: qk.orangTua.all });
      qc.invalidateQueries({ queryKey: qk.approve.orangTua });
    },
  });
}

export function useUpdateOrangTua() {
  const qc = useQueryClient();
  const optimistic = optimisticUpdate<OrangTua, UpdateOrangTuaParams & { id: number }>(
    qc,
    qk.orangTua.list,
    (item, { payload }) => ({ ...item, ...payload })
  );
  return useMutation({
    mutationFn: ({ id, payload }: UpdateOrangTuaParams) =>
      orangTuaApi.update(id, payload),
    onMutate: optimistic.onMutate,
    onError: optimistic.onError,
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.orangTua.all });
      qc.invalidateQueries({ queryKey: qk.approve.orangTua });
    },
  });
}

export function useDeleteOrangTua() {
  const qc = useQueryClient();
  const optimistic = optimisticRemove<OrangTua>(qc, qk.orangTua.list);
  return useMutation({
    mutationFn: (id: number) => orangTuaApi.remove(id),
    onMutate: optimistic.onMutate,
    onError: optimistic.onError,
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.orangTua.all });
      qc.invalidateQueries({ queryKey: qk.approve.orangTua });
    },
  });
}
