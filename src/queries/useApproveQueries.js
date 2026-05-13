import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approveApi } from '../api/approve.api';
import { useSession } from '../features/auth/useSession';

const OT_KEY = ['approve', 'orangTua'];
const ANAK_KEY = ['approve', 'anak'];

function normalizeStatus(s) {
  // backend returns status as 0/1 or true/false
  if (s === true || s === 1 || s === '1') return true;
  return false;
}

export function usePendingOrangTua(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: OT_KEY,
    queryFn: async () => {
      const res = await approveApi.listOrangTua();
      const list = res.data ?? [];
      // filter only pending (status falsy)
      return list.filter((item) => !normalizeStatus(item.status));
    },
    enabled: enabled && isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function usePendingAnak(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: ANAK_KEY,
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
      qc.invalidateQueries({ queryKey: OT_KEY });
      qc.invalidateQueries({ queryKey: ['anak'] });
    },
  });
}

export function useApproveAnak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApi.approveAnak(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ANAK_KEY });
      qc.invalidateQueries({ queryKey: ['anak'] });
    },
  });
}

export function useRejectOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApi.rejectOrangTua(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: OT_KEY }),
  });
}

export function useRejectAnak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApi.rejectAnak(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ANAK_KEY });
      qc.invalidateQueries({ queryKey: ['anak'] });
    },
  });
}
