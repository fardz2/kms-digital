import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { anakApi } from '../api/anak.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';
import type { Anak } from '../types';

interface CreateAnakPayload {
  nama: string;
  panggilan?: string;
  tanggal_lahir: string;
  gender: string;
  alamat?: string;
  status?: any;
  id_orang_tua?: number;
}

export function useAnakList() {
  const { role, isAuthenticated } = useSession();

  return useQuery<Anak[]>({
    queryKey: qk.anak.list(role),
    queryFn: async () => {
      const res = await anakApi.list(role);
      return res.data ?? [];
    },
    enabled: isAuthenticated && !!role,
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      [...data].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')),
  });
}

export function useCreateAnak() {
  const qc = useQueryClient();
  const { role } = useSession();
  return useMutation({
    mutationFn: (payload: CreateAnakPayload) => anakApi.create(role, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.anak.all });
    },
  });
}

export function useImportAnakExcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => anakApi.importExcel(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.anak.all });
    },
  });
}

export function useAnakDetail(id: number | string | undefined) {
  const { role, isAuthenticated } = useSession();

  return useQuery<Anak | null>({
    queryKey: qk.anak.detail(id, role),
    queryFn: async () => {
      const res = await anakApi.detail(id, role);
      return res.data;
    },
    enabled: isAuthenticated && !!role && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteAnak() {
  const qc = useQueryClient();
  const { role } = useSession();

  return useMutation({
    mutationFn: (id: number) => anakApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.anak.list(role) });
    },
  });
}
