import { useAuthStore } from '@/store/auth.store';

/**
 * Convenience hook — exposes only the auth state and actions needed by most screens.
 * Prefer this over importing useAuthStore directly so screens don't couple to the
 * full store shape.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);

  return { user, isAuthenticated, isLoading, error, login, register, logout, clearError };
}
