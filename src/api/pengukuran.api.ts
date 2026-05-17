import { api } from './client';

function scopeForRole(role) {
  return role === 'ORANG_TUA' ? 'orang-tua' : 'posyandu';
}

export const pengukuranApi = {
  list: (anakId, role) =>
    api.get(`/api/${scopeForRole(role)}/statistik-anak/${anakId}`),

  create: (payload, role) =>
    api.post(`/api/${scopeForRole(role)}/statistik-anak`, payload),

  update: (id, payload) =>
    api.put(`/api/posyandu/statistik-anak/${id}`, payload),

  remove: (id) => api.delete(`/api/posyandu/statistik-anak/${id}`),
};
