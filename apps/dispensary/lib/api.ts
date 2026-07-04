import axios, { AxiosInstance } from 'axios';

// ─── Token helpers (browser-only) ─────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cr_access_token');
}

export function setAccessToken(token: string): void {
  localStorage.setItem('cr_access_token', token);
}

export function clearTokens(): void {
  localStorage.removeItem('cr_access_token');
  localStorage.removeItem('cr_refresh_token');
}

// ─── Factory ──────────────────────────────────────────────────────────────────

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        clearTokens();
        window.location.href = '/login';
      }
      return Promise.reject(err);
    },
  );

  return client;
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export const authApi = createClient(
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? 'http://localhost:3001/api/v1',
);
export const orderApi = createClient(
  process.env.NEXT_PUBLIC_ORDER_SERVICE_URL ?? 'http://localhost:3002/api/v1',
);
export const inventoryApi = createClient(
  process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL ?? 'http://localhost:3003/api/v1',
);
export const deliveryApi = createClient(
  process.env.NEXT_PUBLIC_DELIVERY_SERVICE_URL ?? 'http://localhost:3004/api/v1',
);
