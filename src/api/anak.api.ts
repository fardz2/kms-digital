import { api } from './client';

function scopeForRole(role) {
  return role === 'ORANG_TUA' ? 'orang-tua' : 'posyandu';
}

export const anakApi = {
  list: (role) => api.get(`/api/${scopeForRole(role)}/data-anak`),
  detail: (id, role) => api.get(`/api/${scopeForRole(role)}/data-anak/${id}`),
  remove: (id) => api.delete(`/api/posyandu/data-anak/${id}`),
  create: (role, payload) =>
    api.post(`/api/${scopeForRole(role)}/data-anak`, payload),
  importExcel: (formData) =>
    api.post('/api/posyandu/data-anak-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
