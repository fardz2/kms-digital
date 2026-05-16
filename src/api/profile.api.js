import { api } from './client';

export const profileApi = {
  get: () => api.get('/api/profile'),
  update: (payload) => api.put('/api/profile', payload),
};
