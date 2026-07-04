import { create } from 'zustand';
import { authApi, setToken, clearToken, getToken } from '@/lib/api';

interface GrowerUser { id: string; email: string; firstName: string; lastName: string; role: string; }

interface AuthState {
  user: GrowerUser | null;
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
      if (!getToken()) { set({ isLoading: false }); return; }
      const { data } = await authApi.get<GrowerUser>('/auth/me');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch { clearToken(); set({ isLoading: false }); }
  },

  login: async (email, password) => {
    const { data } = await authApi.post<{ accessToken: string }>('/auth/login', { email, password });
    setToken(data.accessToken);
    const { data: user } = await authApi.get<GrowerUser>('/auth/me');
    set({ user, isAuthenticated: true });
  },

  logout: () => { clearToken(); set({ user: null, isAuthenticated: false }); window.location.href = '/login'; },
}));
