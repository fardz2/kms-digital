import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approveApi } from '../api/approve.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

function normalizeStatus(s) {
  if (s === true || s === 1 || s === '1') return true;
  return false;
}

export function usePendingOrangTua(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: qk.approve.orangTua,
    queryFn: async () => {
      const res = await approveApi.listOrangTua();
      const list = res.data ?? [];
      return list.filter((item) => !normalizeStatus(item.status));
    },
    enabled: enabled && isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function usePendingAnak(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: qk.approve.anak,
    queryFn: async () => {
      const res = await approveApi.listAnakBelumApprove();
      const list = res.data ?? [];
      return [...list].sort((a, b) =>
        (b.created_at ?? '').localeCompare(a.created_at ?? '')
      );
    },
    enabled: enabled && isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useApproveOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApi.approveOrangTua(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.approve.orangTua });
      qc.invalidateQueries({ queryKey: qk.anak.all });
    },
  });
}

export function useApproveAnak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApi.approveAnak(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.approve.anak });
      qc.invalidateQueries({ queryKey: qk.anak.all });
    },
  });
}

export function useRejectOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApi.rejectOrangTua(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.approve.orangTua }),
  });
}

export function useRejectAnak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApi.rejectAnak(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.approve.anak });
      qc.invalidateQueries({ queryKey: qk.anak.all });
    },
  });
}
