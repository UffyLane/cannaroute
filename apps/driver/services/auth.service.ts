import { authApi, storeTokens, clearTokens } from './api';
import { DriverProfile } from '@/types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const AuthService = {
  async login(email: string, password: string): Promise<AuthTokens> {
    const { data } = await authApi.post<AuthTokens>('/auth/login', { email, password });
    await storeTokens(data);
    return data;
  },

  async getMe(): Promise<DriverProfile> {
    const { data } = await authApi.get<DriverProfile>('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    try { await authApi.post('/auth/logout'); } finally { await clearTokens(); }
  },
};
