import axios from 'axios';
import type { AuthResponse, Control, DashboardStats, PaginatedResponse, Product, ImportResult } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// Intercepteur — injecte le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteur — refresh token automatique sur 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post<AuthResponse>(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken },
        );
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

// ── Controls ──────────────────────────────────────────────────────────────
export const controlsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Control>>('/controls', { params }).then((r) => r.data),

  getOne: (id: string) =>
    api.get<Control>(`/controls/${id}`).then((r) => r.data),

  create: (data: Partial<Control>) =>
    api.post<Control>('/controls', data).then((r) => r.data),

  update: (id: string, data: Partial<Control>) =>
    api.patch<Control>(`/controls/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/controls/${id}`),

  getDashboard: () =>
    api.get<DashboardStats>('/controls/dashboard').then((r) => r.data),
};

// ── Products ──────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: () => api.get<Product[]>('/products').then((r) => r.data),
  importCsv: (csvContent: string) =>
    api.post<ImportResult>('/products/import', { csv: csvContent }).then((r) => r.data),
};

// ── Reports ───────────────────────────────────────────────────────────────
export const reportsApi = {
  getDashboard: () =>
    api.get<DashboardStats>('/reports/dashboard').then((r) => r.data),

  downloadDailyPdf: async (date: string) => {
    const response = await api.get(`/reports/daily?date=${date}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rapport-haccp-${date}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export default api;
