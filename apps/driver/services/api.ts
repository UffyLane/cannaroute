import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthTokens } from './auth.service';

const ACCESS_TOKEN_KEY = 'driver_access_token';
const REFRESH_TOKEN_KEY = 'driver_refresh_token';

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
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

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({ baseURL, timeout: 15_000 });

  client.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (err) => {
      if (err.response?.status === 401) {
        await clearTokens();
      }
      return Promise.reject(err);
    },
  );

  return client;
}

export const authApi = createClient(
  `${process.env.EXPO_PUBLIC_AUTH_SERVICE_URL ?? 'http://localhost:3001'}/api/v1`,
);
export const deliveryApi = createClient(
  `${process.env.EXPO_PUBLIC_DELIVERY_SERVICE_URL ?? 'http://localhost:3004'}/api/v1`,
);
export const orderApi = createClient(
  `${process.env.EXPO_PUBLIC_ORDER_SERVICE_URL ?? 'http://localhost:3002'}/api/v1`,
);
