import axios from 'axios';
import { readSession, clearSession } from '../features/auth/session-storage';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  (cfg) => {
    const token = readSession()?.token?.value;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;

    if ((cfg.method ?? 'get').toLowerCase() === 'get') {
      cfg.params = { ...(cfg.params ?? {}), _t: Date.now() };
      cfg.headers['Cache-Control'] = 'no-cache';
      cfg.headers.Pragma = 'no-cache';
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      clearSession();
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/masuk')
      ) {
        window.location.href = '/masuk?expired=1';
      }
    }
    const payload =
      err.response?.data ?? { message: err.message || 'Terjadi kesalahan' };
    return Promise.reject(payload);
  }
);
