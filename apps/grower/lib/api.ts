import axios, { AxiosInstance } from 'axios';

export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('cr_grower_token') : null;
}
export function setToken(t: string): void { localStorage.setItem('cr_grower_token', t); }
export function clearToken(): void { localStorage.removeItem('cr_grower_token'); }

function createClient(baseURL: string): AxiosInstance {
  const c = axios.create({ baseURL, timeout: 15_000 });
  c.interceptors.request.use((cfg) => {
    const t = getToken();
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
  });
  c.interceptors.response.use((r) => r, (err) => {
    if (err.response?.status === 401) { clearToken(); window.location.href = '/login'; }
    return Promise.reject(err);
  });
  return c;
}

export const authApi = createClient(
  `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? 'http://localhost:3001'}/api/v1`,
);
export const growerApi = createClient(
  `${process.env.NEXT_PUBLIC_GROWER_SERVICE_URL ?? 'http://localhost:3006'}/api/v1`,
);
