'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  children?: React.ReactNode;
  showConfirmation?: boolean;
}

export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  className = '',
  children,
  showConfirmation = false,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (showConfirmation) {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (!confirmed) return;
    }

    try {
      setIsLoading(true);
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Logging out...
        </div>
      ) : (
        children || 'Logout'
      )}
    </Button>
  );
}
