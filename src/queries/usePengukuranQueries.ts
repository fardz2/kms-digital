import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pengukuranApi } from '../api/pengukuran.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';
import type { Pengukuran } from '../types';

interface CreatePengukuranPayload {
  id_anak: number;
  date: string;
  berat: number;
  tinggi: number;
  lingkar_kepala: number;
  lila?: number | null;
  catatan?: string | null;
}

interface UpdatePengukuranParams {
  id: number;
  payload: Partial<CreatePengukuranPayload>;
}

export function usePengukuranAnak(anakId: number | string | undefined) {
  const { role, isAuthenticated } = useSession();

  return useQuery<Pengukuran[]>({
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

export function useCreatePengukuran(anakId: number | string | undefined) {
  const qc = useQueryClient();
  const { role } = useSession();

  return useMutation({
    mutationFn: (payload: CreatePengukuranPayload) =>
      pengukuranApi.create(payload, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.pengukuran.byAnak(anakId, role) });
      qc.invalidateQueries({ queryKey: qk.laporan.all });
    },
  });
}

export function useUpdatePengukuran(anakId: number | string | undefined) {
  const qc = useQueryClient();
  const { role } = useSession();

  return useMutation({
    mutationFn: ({ id, payload }: UpdatePengukuranParams) =>
      pengukuranApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.pengukuran.byAnak(anakId, role) });
      qc.invalidateQueries({ queryKey: qk.laporan.all });
    },
  });
}

export function useDeletePengukuran(anakId: number | string | undefined) {
  const qc = useQueryClient();
  const { role } = useSession();

  return useMutation({
    mutationFn: (id: number) => pengukuranApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.pengukuran.byAnak(anakId, role) });
      qc.invalidateQueries({ queryKey: qk.laporan.all });
    },
  });
}
