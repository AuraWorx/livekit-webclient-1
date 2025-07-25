'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface LoginButtonProps {
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function LoginButton({ size = 'default', className = '' }: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Google OAuth flow...');
      console.log('Frontend domain:', window.location.origin);
      console.log('Backend URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/google/login`;
      console.log('Calling API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('Google OAuth response:', data);

      if (data.success && data.data.authorization_url) {
        const authUrl = data.data.authorization_url;
        console.log('Redirecting to Google OAuth URL:', authUrl);
        
        // Open in same window instead of popup
        window.location.href = authUrl;
      } else {
        console.error('Invalid response from backend:', data);
        throw new Error('Failed to get Google OAuth URL');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to initiate Google login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = () => {
    // TODO: Implement email login
    toast.info('Email login not implemented yet');
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="default"
        size={size}
        className={`w-full ${className}`}
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Connecting...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </div>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">Or</span>
        </div>
      </div>

      <Button type="button" onClick={handleEmailLogin} variant="outline" className="w-full">
        Continue with Email
      </Button>
    </div>
  );
}
