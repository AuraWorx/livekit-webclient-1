# Google OAuth Authentication

This document describes the Google OAuth authentication implementation for the LiveKit Agent Starter React application.

## Overview

The application now includes Google OAuth authentication that integrates with a Python backend API. Users can sign in with their Google account to access the voice AI features.

## Features

- 🔐 Google OAuth authentication
- 👤 Guest/Anonymous access
- 🔑 JWT token management
- 👤 User profile display
- 🔄 Automatic token refresh
- 🚪 Secure logout functionality
- 📱 Responsive design

## Setup

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=https://wqbackend-testing.auraworx.com/api/v1
NEXT_PUBLIC_FRONTEND_URL=https://wqmobile-testing.auraworx.com

# LiveKit Configuration (existing)
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=https://your-livekit-server-url
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API or Google People API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://wqmobile-testing.auraworx.com`
   - `http://localhost:3000` (for development)
6. Copy Client ID to your `.env.local` file

### 3. Backend Integration

The frontend integrates with the Python backend API endpoints:

- `POST /api/v1/auth/google/verify` - Verify Google token and login
  - Request body: `{ "google_token": "jwt_token_from_google" }`
- `POST /api/v1/auth/refresh` - Refresh JWT token
  - Request body: `{ "refresh_token": "refresh_token" }`
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/users/me` - Get current user profile

## User Flow

### Authenticated Users
1. User visits the application
2. User clicks "Sign in with Google"
3. Google OAuth popup opens
4. User authenticates with Google
5. Frontend receives Google token
6. Frontend sends token to backend for verification
7. Backend creates/updates user in PostgreSQL
8. Backend returns JWT tokens and user data
9. Frontend stores tokens and updates UI
10. User can now access voice AI features

### Guest Users
1. User visits the application
2. User clicks "Continue as Guest"
3. User is immediately granted access to voice AI features
4. No authentication required, no data stored
5. User can use all features without signing in

## Components

### Authentication Context (`contexts/auth-context.tsx`)

Manages authentication state and provides authentication methods:

```typescript
const { user, isAuthenticated, isLoading, signInWithGoogle, signOut } = useAuth();
```

### Google Sign-In Button (`components/auth/google-signin-button.tsx`)

Styled Google sign-in button with loading states.

### Guest Sign-In Button (`components/auth/guest-signin-button.tsx`)

Allows users to access the app without authentication.

### User Profile (`components/auth/user-profile.tsx`)

Displays user information and provides logout functionality.

### Authentication Service (`lib/auth-service.ts`)

Handles API calls to the backend for authentication operations.

## Security Features

- JWT tokens stored securely in localStorage
- Automatic token refresh before expiration
- Secure logout with backend cleanup
- Error handling for authentication failures
- CSRF protection through proper token management

## Error Handling

The application includes comprehensive error handling:

- Google OAuth failures
- Backend API errors
- Network connectivity issues
- Token validation errors

Errors are displayed to users via toast notifications.

## Development

### Running the Application

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Testing Authentication

1. Set up environment variables
2. Configure Google OAuth credentials
3. Ensure backend is running
4. Test sign-in flow
5. Verify user profile display
6. Test logout functionality

## Troubleshooting

### Common Issues

1. **Google OAuth not loading**
   - Check Google Client ID configuration
   - Verify authorized redirect URIs
   - Check browser console for errors

2. **Backend API errors**
   - Verify backend is running
   - Check API base URL configuration
   - Review backend logs

3. **Token refresh issues**
   - Check refresh token storage
   - Verify token expiration handling
   - Review authentication service logs

### Debug Mode

Enable debug logging by checking browser console for authentication-related messages.

## Future Enhancements

- [ ] Add user preferences and settings
- [ ] Implement session history
- [ ] Add multi-factor authentication
- [ ] Support additional OAuth providers
- [ ] Add user role management
- [ ] Implement user analytics 