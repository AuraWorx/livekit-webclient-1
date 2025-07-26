'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface GuestSignInButtonProps {
  className?: string;
  disabled?: boolean;
}

export function GuestSignInButton({ className, disabled }: GuestSignInButtonProps) {
  const { signInAsGuest, isLoading } = useAuth();

  const handleClick = () => {
    if (disabled || isLoading) return;
    signInAsGuest();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        'flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-gray-100 px-6 py-3 text-gray-700 transition-all duration-200 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      )}
      <span className="font-medium">{isLoading ? 'Signing in...' : 'Continue as Guest'}</span>
    </motion.button>
  );
}
