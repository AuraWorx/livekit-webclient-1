import type { AuthResponse, AuthService, User } from './auth-types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lumabackend-dev.auraworx.com/api/v1';

class AuthServiceImpl implements AuthService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    const token = this.getAccessToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      console.log('Making API request to:', url);
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API request failed:', {
          status: response.status,
          statusText: response.statusText,
          url,
          errorData,
        });
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async verifyGoogleToken(googleToken: string): Promise<AuthResponse> {
    console.log('Sending Google token verification request:', {
      google_token: googleToken.substring(0, 20) + '...',
    });

    const response = await this.makeRequest<AuthResponse>('/auth/google/verify', {
      method: 'POST',
      body: JSON.stringify({ google_token: googleToken }),
    });

    console.log('Google token verification successful');

    // Store tokens and user data
    this.setTokens(response.accessToken, response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // Update stored tokens
    this.setTokens(response.accessToken, response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local tokens regardless of API call success
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.makeRequest<User>('/users/me');
    localStorage.setItem('user', JSON.stringify(response));
    return response;
  }

  // Helper methods for token management
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

export const authService = new AuthServiceImpl();
