'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { LogoutButton } from './logout-button';

interface UserProfileProps {
  showDropdown?: boolean;
  className?: string;
}

export function UserProfile({ showDropdown = true, className = '' }: UserProfileProps) {
  const { user, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 p-2"
        onClick={toggleDropdown}
      >
        <div className="flex items-center gap-2">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
              <span className="text-primary text-sm font-medium">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="hidden text-left sm:block">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-muted-foreground text-xs">{user.email}</div>
          </div>
        </div>
      </Button>

      {showDropdown && isDropdownOpen && (
        <div className="bg-background absolute top-full right-0 z-50 mt-2 w-64 rounded-md border shadow-lg">
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="text-primary text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-muted-foreground text-sm">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                closeDropdown();
                // Navigate to settings
                window.location.href = '/settings';
              }}
            >
              Settings
            </Button>

            <LogoutButton
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive w-full justify-start"
              showConfirmation={true}
            >
              Logout
            </LogoutButton>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={closeDropdown} />}
    </div>
  );
}
