import axios, { AxiosInstance } from 'axios';

export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('cr_admin_token') : null;
}
export function setToken(t: string): void { localStorage.setItem('cr_admin_token', t); }
export function clearToken(): void { localStorage.removeItem('cr_admin_token'); }

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

const base = (env: string, fallback: string) =>
  `${process.env[env] ?? fallback}/api/v1`;

export const authApi = createClient(base('NEXT_PUBLIC_AUTH_SERVICE_URL', 'http://localhost:3001'));
export const orderApi = createClient(base('NEXT_PUBLIC_ORDER_SERVICE_URL', 'http://localhost:3002'));
export const inventoryApi = createClient(base('NEXT_PUBLIC_INVENTORY_SERVICE_URL', 'http://localhost:3003'));
export const deliveryApi = createClient(base('NEXT_PUBLIC_DELIVERY_SERVICE_URL', 'http://localhost:3004'));
export const complianceApi = createClient(base('NEXT_PUBLIC_COMPLIANCE_SERVICE_URL', 'http://localhost:3005'));
export const growerApi = createClient(base('NEXT_PUBLIC_GROWER_SERVICE_URL', 'http://localhost:3006'));
