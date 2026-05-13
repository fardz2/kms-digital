import { api } from './client';

export const kaderApi = {
  list: () => api.get('/api/posyandu/kader-posyandu'),
};
