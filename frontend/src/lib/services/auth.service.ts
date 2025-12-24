import axios from 'axios';
import { apiClient } from '../api-client';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, AuthResponse, User } from '@/types/auth.types';
import { useAuthStore } from '../../store/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3020';

class AuthService {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (response.data.accessToken && response.data.refreshToken && response.data.user) {
      useAuthStore.getState().setAuth(response.data.accessToken, response.data.refreshToken, response.data.user);
      
      // Force fetch fresh user data to ensure profile image and other details are up to date
      try {
        const freshUser = await this.getCurrentUser();
        return {
          ...response.data,
          user: freshUser
        };
      } catch (error) {
        console.error('Failed to fetch fresh user data after login:', error);
      }
    }
    return response.data;
  }

  async register(userData: RegisterDto): Promise<AuthResponse | { initialToken: string; userId: number; email: string; profileComplete: false }> {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data.initialToken && !response.data.profileComplete) {
      this.setInitialToken(response.data.initialToken, response.data.userId);
    }
    return response.data;
  }

  async continueWithGoogle(): Promise<void> {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`;
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      useAuthStore.getState().clearAuth();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    useAuthStore.getState().setUser(response.data);
    return response.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // Use direct axios call to avoid interceptors overwriting the Authorization header
    // This ensures we send the refresh token in the Authorization header, not the access token
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {}, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      }
    });

    if (response.data.accessToken && response.data.refreshToken && response.data.user) {
      useAuthStore.getState().setAuth(response.data.accessToken, response.data.refreshToken, response.data.user);
    }
    return response.data;
  }

  setInitialToken(initialToken: string, userId: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('initialToken', initialToken);
    localStorage.setItem('initialUserId', userId.toString());
  }

  getInitialToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('initialToken');
  }

  getInitialUserId(): number | null {
    if (typeof window === 'undefined') return null;
    const userId = localStorage.getItem('initialUserId');
    return userId ? parseInt(userId, 10) : null;
  }

  clearInitialToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('initialToken');
    localStorage.removeItem('initialUserId');
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/auth/me', profileData);
    useAuthStore.getState().setUser(response.data);
    return response.data;
  }

  async completeProfile(profileData: any): Promise<{ message: string; success: boolean; status?: string }> {
    const initialToken = this.getInitialToken();
    if (!initialToken) {
      throw new Error('No initial token found. Please restart registration.');
    }
    const response = await apiClient.post<{ message: string; success: boolean; status?: string }>('/auth/complete-profile', {
      initialToken,
      profileData,
    });
    this.clearInitialToken();
    return response.data;
  }
}

export const authService = new AuthService();
