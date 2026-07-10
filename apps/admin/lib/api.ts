import axios, { AxiosInstance } from 'axios';

export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('cr_admin_token') : null;
}
export function setToken(t: string): void { localStorage.setItem('cr_admin_token', t); }
export function clearToken(): void { localStorage.removeItem('cr_admin_token'); }

function createClient(rawBase: string): AxiosInstance {
  // Strip /api/v1 suffix — interceptor always prepends it to avoid axios
  // dropping path segments when request paths start with a leading slash.
  const origin = rawBase.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

  const c = axios.create({ baseURL: origin, timeout: 15_000 });

  c.interceptors.request.use((cfg) => {
    const t = getToken();
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    if (cfg.url && !cfg.url.startsWith('/api/v1')) {
      cfg.url = `/api/v1${cfg.url.startsWith('/') ? '' : '/'}${cfg.url}`;
    }
    return cfg;
  });
  c.interceptors.response.use((r) => r, (err) => {
    if (err.response?.status === 401) { clearToken(); window.location.href = '/login'; }
    return Promise.reject(err);
  });
  return c;
}

const base = (env: string, fallback: string) =>
  `${process.env[env] ?? fallback}/api/v1`;

export const authApi = createClient(base('NEXT_PUBLIC_AUTH_SERVICE_URL', 'http://localhost:3001'));
export const orderApi = createClient(base('NEXT_PUBLIC_ORDER_SERVICE_URL', 'http://localhost:3002'));
export const inventoryApi = createClient(base('NEXT_PUBLIC_INVENTORY_SERVICE_URL', 'http://localhost:3003'));
export const deliveryApi = createClient(base('NEXT_PUBLIC_DELIVERY_SERVICE_URL', 'http://localhost:3004'));
export const complianceApi = createClient(base('NEXT_PUBLIC_COMPLIANCE_SERVICE_URL', 'http://localhost:3005'));
export const growerApi = createClient(base('NEXT_PUBLIC_GROWER_SERVICE_URL', 'http://localhost:3006'));
