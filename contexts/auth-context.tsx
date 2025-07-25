'use client';

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authAPI, userAPI, User } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check for tokens in cookies first
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

        const accessToken = cookies.access_token;
        const refreshToken = cookies.refresh_token;

        if (accessToken && refreshToken) {
          console.log('Found tokens in cookies, setting authenticated state...');
          
          // For now, trust the tokens and set authenticated state
          // We can add validation later if needed
          setIsAuthenticated(true);
          
          // Try to decode the JWT to get user info
          try {
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
            console.log('Token payload:', tokenPayload);
            
            // Try to fetch user data from multiple possible backend endpoints
            const possibleEndpoints = [
              '/api/v1/users/me',
              '/api/v1/user',
              '/api/v1/profile',
              '/api/v1/auth/profile',
              '/api/v1/auth/user'
            ];
            
            let userData: User | null = null;
            
            // Try each endpoint until one works
            for (const endpoint of possibleEndpoints) {
              try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                });

                if (response.ok) {
                  const responseData = await response.json();
                  console.log(`Successfully fetched user data from ${endpoint}:`, responseData);
                  
                  if (responseData.success && responseData.data) {
                    userData = responseData.data;
                    break;
                  } else if (responseData.name || responseData.email) {
                    // Direct user object
                    userData = {
                      id: responseData.id || tokenPayload.sub,
                      email: responseData.email || 'user@example.com',
                      name: responseData.name || 'User',
                      image: responseData.image || responseData.picture,
                      google_id: responseData.google_id,
                      created_at: responseData.created_at || new Date().toISOString(),
                      updated_at: responseData.updated_at || new Date().toISOString(),
                      is_active: responseData.is_active !== undefined ? responseData.is_active : true,
                    };
                    break;
                  }
                }
              } catch (endpointError) {
                console.log(`Endpoint ${endpoint} failed:`, endpointError);
                continue;
              }
            }
            
            // If no backend endpoint worked, use stored user data or create from token
            if (!userData) {
              const storedUser = localStorage.getItem('user');
              if (storedUser) {
                try {
                  userData = JSON.parse(storedUser);
                  console.log('Using stored user data:', userData);
                } catch (parseError) {
                  console.error('Error parsing stored user data:', parseError);
                }
              }
              
              // If still no user data, create from token
              if (!userData) {
                const userId = tokenPayload.sub;
                const shortId = userId.substring(0, 8);
                userData = {
                  id: userId,
                  email: `user-${shortId}@example.com`,
                  name: `User ${shortId}`,
                  image: undefined,
                  google_id: undefined,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  is_active: true,
                };
                console.log('Created user data from token:', userData);
              }
            }
            
            setUser(userData);
            console.log('User authenticated with data:', userData);
          } catch (decodeError) {
            console.error('Error decoding token:', decodeError);
            // Set a default user if we can't decode the token
            const defaultUser: User = {
              id: 'user',
              email: 'user@example.com',
              name: 'User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_active: true,
            };
            setUser(defaultUser);
          }
        } else {
          // Check localStorage as fallback
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              setIsAuthenticated(true);
              console.log('User authenticated from localStorage');
            } catch (error) {
              console.error('Error parsing stored user data:', error);
              localStorage.removeItem('user');
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(email, password);

      if (response.success) {
        // Store tokens
        Cookies.set('access_token', response.data.access_token, { expires: 7 });
        Cookies.set('refresh_token', response.data.refresh_token, { expires: 30 });

        // Get user data
        const userResponse = await userAPI.getCurrentUser();
        if (userResponse.success) {
          setUser(userResponse.data);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userResponse.data));
        }
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(email, password, name);

      if (response.success) {
        // Store tokens
        Cookies.set('access_token', response.data.access_token, { expires: 7 });
        Cookies.set('refresh_token', response.data.refresh_token, { expires: 30 });

        // Get user data
        const userResponse = await userAPI.getCurrentUser();
        if (userResponse.success) {
          setUser(userResponse.data);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userResponse.data));
        }
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear cookies
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Clear localStorage
      localStorage.removeItem('user');
      
      // Clear state
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await userAPI.getCurrentUser();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await logout();
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const response = await userAPI.updateCurrentUser(data);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
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
