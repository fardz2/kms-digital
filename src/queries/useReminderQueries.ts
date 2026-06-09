import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderApi } from '../api/reminder.api';
import { qk } from './keys';
import { optimisticRemove } from './optimistic';
import { useSession } from '../features/auth/useSession';
import type { Reminder } from '../types';

interface CreateReminderPayload {
  judul: string;
  deskripsi?: string;
  tanggal_reminder: string;
}

export function useReminderList() {
  const { isAuthenticated } = useSession();
  return useQuery<Reminder[]>({
    queryKey: qk.reminder.list,
    queryFn: async () => {
      const res = await reminderApi.list();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReminderPayload) => reminderApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reminder.all }),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  const optimistic = optimisticRemove<Reminder>(qc, qk.reminder.list);
  return useMutation({
    mutationFn: (id: number) => reminderApi.remove(id),
    onMutate: optimistic.onMutate,
    onError: optimistic.onError,
    onSettled: () => qc.invalidateQueries({ queryKey: qk.reminder.all }),
  });
}
