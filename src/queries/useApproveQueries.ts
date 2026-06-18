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
      return list.toSorted((a, b) =>
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
    mutationFn: (id: number) => approveApi.approveOrangTua(id),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: qk.approve.orangTua });
      const previous = qc.getQueryData(qk.approve.orangTua);
      qc.setQueryData(qk.approve.orangTua, (old) =>
        Array.isArray(old) ? old.filter((x) => x.id !== id) : old
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(qk.approve.orangTua, ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.approve.orangTua });
      qc.invalidateQueries({ queryKey: qk.orangTua.all });
      qc.invalidateQueries({ queryKey: qk.anak.all });
    },
  });
}

export function useApproveAnak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approveApi.approveAnak(id),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: qk.approve.anak });
      const previous = qc.getQueryData(qk.approve.anak);
      qc.setQueryData(qk.approve.anak, (old) =>
        Array.isArray(old) ? old.filter((x) => x.id !== id) : old
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(qk.approve.anak, ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.approve.anak });
      qc.invalidateQueries({ queryKey: qk.anak.all });
    },
  });
}

export function useRejectOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approveApi.rejectOrangTua(id),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: qk.approve.orangTua });
      const previous = qc.getQueryData(qk.approve.orangTua);
      qc.setQueryData(qk.approve.orangTua, (old) =>
        Array.isArray(old) ? old.filter((x) => x.id !== id) : old
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(qk.approve.orangTua, ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.approve.orangTua });
      qc.invalidateQueries({ queryKey: qk.orangTua.all });
    },
  });
}

export function useRejectAnak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approveApi.rejectAnak(id),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: qk.approve.anak });
      const previous = qc.getQueryData(qk.approve.anak);
      qc.setQueryData(qk.approve.anak, (old) =>
        Array.isArray(old) ? old.filter((x) => x.id !== id) : old
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(qk.approve.anak, ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.approve.anak });
      qc.invalidateQueries({ queryKey: qk.anak.all });
    },
  });
}
