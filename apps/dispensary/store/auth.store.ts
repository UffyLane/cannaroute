import { create } from 'zustand';
import { StaffUser } from '@/types';
import { authApi, setAccessToken, clearTokens, getAccessToken } from '@/lib/api';

interface AuthState {
  user: StaffUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  bootstrap: async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const { data } = await authApi.get<StaffUser>('/auth/me');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await authApi.post<{ access_token: string; refresh_token: string }>(
      '/auth/login',
      { email, password },
    );
    setAccessToken(data.access_token);
    localStorage.setItem('cr_refresh_token', data.refresh_token);
    const { data: user } = await authApi.get<StaffUser>('/auth/me');
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },
}));
