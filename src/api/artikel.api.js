import { api } from './client';

export const artikelApi = {
  list: () => api.get('/api/artikel'),
  detail: (id) => api.get(`/api/artikel/${id}`),
  remove: (id) => api.delete(`/api/artikel/${id}`),
  create: (formData) =>
    api.post('/api/artikel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.post(`/api/artikel/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
