import { useAuth } from '@/contexts/auth-context';

// Re-export the useAuth hook for convenience
export { useAuth };

// Additional auth-related hooks can be added here
export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    requireAuth: () => {
      if (!isLoading && !isAuthenticated) {
        // Redirect to login or show auth modal
        return false;
      }
      return true;
    },
  };
}

export function useUserPreferences() {
  const { user } = useAuth();

  return {
    preferences: user?.preferences,
    theme: user?.preferences?.theme || 'system',
    voiceSettings: user?.preferences?.voice_settings,
    videoEnabled: user?.preferences?.video_enabled ?? true,
    screenShareEnabled: user?.preferences?.screen_share_enabled ?? true,
    avatarPreference: user?.preferences?.avatar_preference,
    language: user?.preferences?.language || 'en',
  };
}

export function useAuthStatus() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    user,
    isGuest: !isAuthenticated && !isLoading,
    hasUser: !!user,
  };
}
