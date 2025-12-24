import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth.types';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/lib/services/auth.service';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
  startProactiveRefresh: () => void;
}

interface DecodedToken {
  exp: number;
}

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiration
let refreshTimeout: NodeJS.Timeout | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (accessToken, refreshToken, user) => {
        set({ accessToken, refreshToken, user });
        if (typeof document !== 'undefined') {
          document.cookie = `token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        get().startProactiveRefresh();
      },
      clearAuth: () => {
        set({ accessToken: null, refreshToken: null, user: null });
        if (typeof document !== 'undefined') {
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
          refreshTimeout = null;
        }
      },
      setUser: (user) => set({ user }),
      startProactiveRefresh: () => {
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }

        const { accessToken } = get();

        if (!accessToken) {
          return;
        }

        try {
          const decodedToken = jwtDecode<DecodedToken>(accessToken);
          const currentTime = Date.now();
          const expirationTime = decodedToken.exp * 1000;
          const timeUntilExpiration = expirationTime - currentTime;

          const timeToRefresh = timeUntilExpiration - REFRESH_THRESHOLD_MS;

          const refresh = async () => {
            try {
              await authService.refreshToken();
            } catch (error) {
              console.error('Failed to proactively refresh token:', error);
              get().clearAuth();
            }
          };

          if (timeToRefresh > 0) {
            refreshTimeout = setTimeout(refresh, timeToRefresh);
          } else {
            refresh();
          }
        } catch (error) {
          console.error('Error decoding access token for proactive refresh:', error);
          get().clearAuth();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
