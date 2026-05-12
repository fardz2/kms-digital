import { api } from './client';

export const reminderApi = {
  list: () => api.get('/api/reminder'),
  create: (payload) => api.post('/api/reminder', payload),
  remove: (id) => api.delete(`/api/reminder/${id}`),
};
