import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderApi } from '../api/reminder.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

export function useReminderList() {
  const { isAuthenticated } = useSession();
  return useQuery({
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
    mutationFn: (payload) => reminderApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reminder.all }),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => reminderApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reminder.all }),
  });
}
