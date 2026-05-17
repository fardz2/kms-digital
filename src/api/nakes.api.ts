import { api } from './client';

export const nakesApi = {
  list: () => api.get('/api/posyandu/tenaga-kesehatan'),
  register: (payload) => api.post('/api/auth/tenaga-kesehatan/register', payload),
  update: (id, payload) => api.put(`/api/auth/users/${id}`, payload),
  remove: (id) => api.delete(`/api/auth/users/${id}`),
};
