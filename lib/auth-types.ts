export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  googleId?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export interface GoogleAuthResponse {
  credential: string;
  clientId: string;
  select_by: string;
}

export interface AuthService {
  verifyGoogleToken: (googleToken: string) => Promise<AuthResponse>;
  refreshToken: (refreshToken: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
}
