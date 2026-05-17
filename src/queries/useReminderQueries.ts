import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderApi } from '../api/reminder.api';
import { useSession } from '../features/auth/useSession';

const REMINDER_KEY = ['reminder'];

export function useReminderList() {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: REMINDER_KEY,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: REMINDER_KEY }),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => reminderApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: REMINDER_KEY }),
  });
}
