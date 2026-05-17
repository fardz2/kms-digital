// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pengukuranApi } from '../api/pengukuran.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

export function usePengukuranAnak(anakId) {
  const { role, isAuthenticated } = useSession();

  return useQuery({
    queryKey: qk.pengukuran.byAnak(anakId, role),
    queryFn: async () => {
      const res = await pengukuranApi.list(anakId, role);
      return res.data ?? [];
    },
    enabled: isAuthenticated && !!role && !!anakId,
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      [...data].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')),
  });
}

export function useCreatePengukuran(anakId) {
  const qc = useQueryClient();
  const { role } = useSession();

  return useMutation({
    mutationFn: (payload) => pengukuranApi.create(payload, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.pengukuran.byAnak(anakId, role) });
      qc.invalidateQueries({ queryKey: qk.laporan.all });
    },
  });
}

export function useUpdatePengukuran(anakId) {
  const qc = useQueryClient();
  const { role } = useSession();

  return useMutation({
    mutationFn: ({ id, payload }) => pengukuranApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.pengukuran.byAnak(anakId, role) });
      qc.invalidateQueries({ queryKey: qk.laporan.all });
    },
  });
}

export function useDeletePengukuran(anakId) {
  const qc = useQueryClient();
  const { role } = useSession();

  return useMutation({
    mutationFn: (id) => pengukuranApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.pengukuran.byAnak(anakId, role) });
      qc.invalidateQueries({ queryKey: qk.laporan.all });
    },
  });
}
