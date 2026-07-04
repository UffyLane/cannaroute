import { authApi, storeTokens, clearTokens } from './api';
import { AuthTokens, LoginPayload, RegisterPayload, User } from '@/types';

export const AuthService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await authApi.post<AuthTokens>('/auth/login', payload);
    await storeTokens(data);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const { data } = await authApi.post<AuthTokens>('/auth/register', payload);
    await storeTokens(data);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await authApi.post('/auth/logout');
    } finally {
      await clearTokens();
    }
  },

  async getMe(): Promise<User> {
    const { data } = await authApi.get<User>('/auth/me');
    return data;
  },

  async uploadMedicalCard(uri: string): Promise<{ medicalCardUrl: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'medical_card.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);

    const { data } = await authApi.post<{ medicalCardUrl: string }>(
      '/auth/medical-card',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};
