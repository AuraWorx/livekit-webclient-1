'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface LoginFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, onCancel, className = '' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isRegisterMode && !name) {
      toast.error('Please enter your name');
      return;
    }

    try {
      setIsLoading(true);

      if (isRegisterMode) {
        await register(email, password, name);
        toast.success('Account created successfully!');
      } else {
        await login(email, password);
        toast.success('Logged in successfully!');
      }

      onSuccess?.();
    } catch (error: unknown) {
      console.error('Auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold">{isRegisterMode ? 'Create Account' : 'Sign In'}</h2>
        <p className="text-muted-foreground mt-2">
          {isRegisterMode
            ? 'Create your account to get started'
            : 'Sign in to your account to continue'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegisterMode && (
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
              placeholder="Enter your name"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
            placeholder="Enter your password"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {isRegisterMode ? 'Creating Account...' : 'Signing In...'}
            </div>
          ) : isRegisterMode ? (
            'Create Account'
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsRegisterMode(!isRegisterMode)}
          className="text-primary text-sm hover:underline"
        >
          {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>

      {onCancel && (
        <div className="text-center">
          <Button variant="ghost" onClick={onCancel} className="text-sm">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
