'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className }: UserProfileProps) {
  const { user, signOut, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await signOut();
  };

  const getUserInitials = () => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (
      `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
      user.email.charAt(0).toUpperCase()
    );
  };

  const getUserDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  return (
    <div className={cn('relative', className)}>
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          {user.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={getUserDisplayName()}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
              {getUserInitials()}
            </div>
          )}
        </div>

        <div className="hidden text-left sm:block">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {getUserDisplayName()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
        </div>

        <motion.svg
          className="h-4 w-4 text-gray-400"
          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={getUserDisplayName()}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-medium text-white">
                    {getUserInitials()}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/20"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                )}
                {isLoading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
