'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/auth-service';
import type { AuthContextType, User } from '@/lib/auth-types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check for stored user data
      const storedUser = authService.getStoredUser();
      const refreshToken = authService.getStoredRefreshToken();

      if (storedUser && refreshToken) {
        // Verify if the stored user is still valid
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // If getCurrentUser fails, try to refresh the token
          try {
            const authResponse = await authService.refreshToken(refreshToken);
            setUser(authResponse.user);
          } catch (refreshError) {
            // If refresh also fails, clear stored data
            authService.logout();
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load Google OAuth script
      await loadGoogleOAuthScript();

      // Initialize Google OAuth
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        throw new Error('Google Client ID not configured');
      }

      // Create Google OAuth instance
      const google = (window as any).google;
      if (!google) {
        throw new Error('Google OAuth not loaded');
      }

      // Initialize Google OAuth
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleSignIn,
      });

      // Prompt for Google sign-in
      google.accounts.id.prompt();
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setError('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (response: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Verify Google token with backend
      const authResponse = await authService.verifyGoogleToken(response.credential);
      setUser(authResponse.user);
    } catch (error) {
      console.error('Google token verification failed:', error);
      setError('Failed to verify Google authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = () => {
    setUser(null);
    setIsGuest(true);
    setError(null);
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      if (!isGuest) {
        await authService.logout();
      }
      setUser(null);
      setIsGuest(false);
      setError(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      setError('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = authService.getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const authResponse = await authService.refreshToken(refreshToken);
      setUser(authResponse.user);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, sign out the user
      await signOut();
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isGuest,
    isLoading,
    error,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    refreshToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to load Google OAuth script
async function loadGoogleOAuthScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if ((window as any).google?.accounts?.id) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google OAuth script'));

    document.head.appendChild(script);
  });
}
