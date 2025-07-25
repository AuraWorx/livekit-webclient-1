import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  metadata?: {
    page?: number;
    per_page?: number;
    total?: number;
    timestamp?: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

// Auth Types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  google_id?: string;
  created_at: string;
  updated_at: string;
  preferences?: UserPreferences;
  is_active: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  voice_settings: {
    enabled: boolean;
    defaultMuted: boolean;
  };
  video_enabled: boolean;
  screen_share_enabled: boolean;
  avatar_preference: string;
  language: string;
}

// API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data.data;

        // Update tokens
        Cookies.set('access_token', access_token, { expires: 7 });
        Cookies.set('refresh_token', refresh_token, { expires: 30 });

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        // Refresh failed, clear tokens and redirect to login
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');

        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Google OAuth
  initiateGoogleLogin: () => {
    return `${API_BASE_URL}/api/v1/auth/google/login`;
  },

  handleGoogleCallback: async (code: string) => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/api/v1/auth/google/token', {
      code,
    });
    return response.data;
  },

  // Email/Password auth
  register: async (email: string, password: string, name: string) => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/api/v1/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/api/v1/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post<ApiResponse<unknown>>('/api/v1/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Password reset
  forgotPassword: async (email: string) => {
    const response = await apiClient.post<ApiResponse<unknown>>('/api/v1/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await apiClient.post<ApiResponse<unknown>>('/api/v1/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/api/v1/auth/verify-email/${token}`
    );
    return response.data;
  },

  // Account linking
  linkGoogle: async (googleToken: string) => {
    const response = await apiClient.post<ApiResponse<unknown>>('/api/v1/auth/link-google', {
      google_token: googleToken,
    });
    return response.data;
  },

  unlinkGoogle: async () => {
    const response = await apiClient.post<ApiResponse<unknown>>('/api/v1/auth/unlink-google');
    return response.data;
  },

  getLinkedAccounts: async () => {
    const response = await apiClient.get<ApiResponse<unknown>>('/api/v1/auth/linked-accounts');
    return response.data;
  },
};

// User API functions
export const userAPI = {
  getCurrentUser: async () => {
    const response = await apiClient.get<ApiResponse<User>>('/api/v1/users/me');
    return response.data;
  },

  updateCurrentUser: async (userData: Partial<User>) => {
    const response = await apiClient.put<ApiResponse<User>>('/api/v1/users/me', userData);
    return response.data;
  },

  getUserPreferences: async () => {
    const response = await apiClient.get<ApiResponse<UserPreferences>>('/api/v1/users/preferences');
    return response.data;
  },

  updateUserPreferences: async (preferences: Partial<UserPreferences>) => {
    const response = await apiClient.put<ApiResponse<UserPreferences>>(
      '/api/v1/users/preferences',
      preferences
    );
    return response.data;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete<ApiResponse<unknown>>('/api/v1/users/account');
    return response.data;
  },

  exportUserData: async () => {
    const response = await apiClient.get<ApiResponse<unknown>>('/api/v1/users/data-export');
    return response.data;
  },
};

// Session API functions
export const sessionAPI = {
  getSessions: async () => {
    const response = await apiClient.get<ApiResponse<unknown>>('/api/v1/sessions');
    return response.data;
  },

  startSession: async (sessionData: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>(
      '/api/v1/sessions/start',
      sessionData
    );
    return response.data;
  },

  endSession: async (sessionId: string, sessionData: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(
      `/api/v1/sessions/${sessionId}/end`,
      sessionData
    );
    return response.data;
  },

  getUserSessions: async (userId: string) => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/api/v1/sessions/user/${userId}`);
    return response.data;
  },

  getSession: async (sessionId: string) => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/api/v1/sessions/${sessionId}`);
    return response.data;
  },

  deleteSession: async (sessionId: string) => {
    const response = await apiClient.delete<ApiResponse<unknown>>(`/api/v1/sessions/${sessionId}`);
    return response.data;
  },

  deleteAllSessions: async () => {
    const response = await apiClient.delete<ApiResponse<unknown>>('/api/v1/sessions/all');
    return response.data;
  },
};

// LiveKit API functions
export const livekitAPI = {
  getToken: async (roomName: string, participantName: string, userId?: string) => {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/api/v1/livekit/token', {
      room_name: roomName,
      participant_name: participantName,
      user_id: userId,
    });
    return response.data;
  },

  getUserRooms: async (userId: string) => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/api/v1/livekit/rooms/user/${userId}`
    );
    return response.data;
  },
};

// Analytics API functions
export const analyticsAPI = {
  trackEvent: async (eventData: unknown) => {
    const response = await apiClient.post<ApiResponse<unknown>>(
      '/api/v1/analytics/events',
      eventData
    );
    return response.data;
  },

  getReports: async () => {
    const response = await apiClient.get<ApiResponse<unknown>>('/api/v1/analytics/reports');
    return response.data;
  },

  getDashboard: async () => {
    const response = await apiClient.get<ApiResponse<unknown>>('/api/v1/analytics/dashboard');
    return response.data;
  },
};

export default apiClient;
