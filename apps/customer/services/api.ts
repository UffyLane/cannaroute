import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '@/constants/config';
import { AuthTokens } from '@/types';

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const ACCESS_TOKEN_KEY = 'cannaroute_access_token';
const REFRESH_TOKEN_KEY = 'cannaroute_refresh_token';

// ─── Token Helpers ────────────────────────────────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function storeTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Attach token to every request
  client.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Refresh token on 401
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as AxiosRequestConfig & { _retry?: boolean };
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const refreshToken = await getRefreshToken();
          if (!refreshToken) throw new Error('No refresh token');
          const { data } = await axios.post<AuthTokens>(
            `${Config.apiBaseUrl}/api/v1/auth/refresh`,
            { refreshToken },
          );
          await storeTokens(data);
          if (original.headers) {
            original.headers.Authorization = `Bearer ${data.accessToken}`;
          }
          return client(original);
        } catch {
          await clearTokens();
          // Redirect to login is handled by the auth store listener
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
}

// ─── Service Clients ──────────────────────────────────────────────────────────

export const authApi = createApiClient(`${Config.apiBaseUrl}/api/v1`);
export const orderApi = createApiClient(`${Config.orderServiceUrl}/api/v1`);
export const inventoryApi = createApiClient(`${Config.inventoryServiceUrl}/api/v1`);
export const deliveryApi = createApiClient(`${Config.deliveryServiceUrl}/api/v1`);
