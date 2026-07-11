import { create } from 'zustand';
import { AdminUser } from '@/types';
import { authApi, setToken, clearToken, getToken } from '@/lib/api';

interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, isLoading: true, isAuthenticated: false,

  bootstrap: async () => {
    try {
      if (!getToken()) { set({ isLoading: false }); return; }
      const { data } = await authApi.get<AdminUser>('/auth/me');
      if (data.role !== 'platform_admin') { clearToken(); set({ isLoading: false }); return; }
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch { clearToken(); set({ isLoading: false }); }
  },

  login: async (email, password) => {
    const { data } = await authApi.post<{ access_token: string }>('/auth/login', { email, password });
    setToken(data.access_token);
    const { data: user } = await authApi.get<AdminUser>('/auth/me');
    if (user.role !== 'admin') { clearToken(); throw new Error('Admin access required'); }
    set({ user, isAuthenticated: true });
  },

  logout: () => { clearToken(); set({ user: null, isAuthenticated: false }); window.location.href = '/login'; },
}));
