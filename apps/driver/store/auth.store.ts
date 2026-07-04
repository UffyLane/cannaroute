import { create } from 'zustand';
import { DriverProfile } from '@/types';
import { AuthService } from '@/services/auth.service';
import { getAccessToken, clearTokens } from '@/services/api';

interface AuthState {
  driver: DriverProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  driver: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  bootstrap: async () => {
    try {
      const token = await getAccessToken();
      if (!token) { set({ isLoading: false }); return; }
      const driver = await AuthService.getMe();
      set({ driver, isAuthenticated: true, isLoading: false });
    } catch {
      await clearTokens();
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.login(email, password);
      const driver = await AuthService.getMe();
      set({ driver, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Login failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await AuthService.logout();
    set({ driver: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
