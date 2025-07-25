'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoginButton } from './login-button';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  fallback,
  requireAuth = true,
  redirectTo = '/',
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // Redirect to login or specified redirect URL
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="text-muted-foreground text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  // Show fallback or login prompt if not authenticated
  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Authentication Required</h2>
            <p className="text-muted-foreground mt-2">Please log in to access this feature.</p>
          </div>

          <LoginButton />

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Don&apos;t have an account?{' '}
              <button className="text-primary hover:underline">Sign up</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render children if authenticated or if auth is not required
  return <>{children}</>;
}
