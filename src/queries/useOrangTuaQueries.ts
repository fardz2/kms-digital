import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orangTuaApi } from '../api/approve.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

export function useOrangTuaList(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
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
    mutationFn: (payload) => orangTuaApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orangTua.list });
      qc.invalidateQueries({ queryKey: qk.approve.orangTua });
    },
  });
}

export function useUpdateOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => orangTuaApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orangTua.list });
    },
  });
}

export function useDeleteOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => orangTuaApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orangTua.list });
    },
  });
}
