import { api } from './client';

export const posyanduApi = {
  list: () => api.get('/api/posyandu'),
  create: (payload) => api.post('/api/posyandu', payload),
  update: (id, payload) => api.put(`/api/posyandu/${id}`, payload),
  remove: (id) => api.delete(`/api/posyandu/${id}`),
};
