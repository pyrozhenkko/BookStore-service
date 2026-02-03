import { apiRequest, getApiBaseUrl } from './api';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthTokens> {
    return apiRequest<AuthTokens>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(data: RegisterRequest): Promise<{ email: string; name: string }> {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  async forgotPassword(email: string): Promise<string> {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || 'Failed to send reset email');
    return text;
  },

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || 'Failed to reset password');
    return text;
  },

  getGoogleLoginUrl(): string {
    return `${getApiBaseUrl()}/oauth2/authorization/google`;
  },

  async getCurrentUser(): Promise<{ email: string; name: string; role: string; balance?: number }> {
    return apiRequest('/api/auth/me');
  },
};
