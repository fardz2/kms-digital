import { api } from './client';

export const kaderApi = {
  list: () => api.get('/api/posyandu/kader-posyandu'),
  register: (payload) => api.post('/api/auth/posyandu/register', payload),
  update: (id, payload) => api.put(`/api/auth/users/${id}`, payload),
  remove: (id) => api.delete(`/api/auth/users/${id}`),
};
