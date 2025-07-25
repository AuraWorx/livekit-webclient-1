# User Management Feature Plan

## Overview

Add comprehensive user management to the LiveKit Voice Agent app using Google Auth as the primary authentication method. This will enable personalized experiences, session management, and user-specific agent configurations.

## Goals

- Secure user authentication via Google OAuth 2.0
- Persistent user sessions across app visits
- User profile management and preferences
- Integration with LiveKit room management
- Personalized agent interactions and history

## Technical Stack

- **Authentication**: Existing Backend API (localhost:8000) with Google OAuth + Email/Password
- **Frontend**: Next.js client integration with backend API
- **Session Management**: JWT tokens from backend + frontend state management
- **UI Components**: Extend existing UI system
- **State Management**: React Context + hooks + API client
- **API Communication**: Axios/Fetch for backend integration

## Backend API Integration

### Available Authentication Endpoints

```
# Google OAuth Flow
GET    /api/v1/auth/google/login         # Initiate Google OAuth
GET    /api/v1/auth/google/callback      # Handle OAuth callback
POST   /api/v1/auth/google/token         # Exchange auth code for tokens

# Standard Authentication
POST   /api/v1/auth/register             # Email/password registration
POST   /api/v1/auth/login                # Email/password login
POST   /api/v1/auth/refresh              # Refresh access token
POST   /api/v1/auth/logout               # Logout (blacklist tokens)
POST   /api/v1/auth/forgot-password      # Request password reset
POST   /api/v1/auth/reset-password       # Reset password with token
GET    /api/v1/auth/verify-email/{token} # Verify email address

# Account Management
POST   /api/v1/auth/link-google          # Link Google account to existing user
POST   /api/v1/auth/unlink-google        # Unlink Google account
GET    /api/v1/auth/linked-accounts      # List linked social accounts
```

### Complete API Endpoints (All Available)

```
# Authentication
GET    /api/v1/auth/google/login         # Initiate Google OAuth
GET    /api/v1/auth/google/callback      # Handle OAuth callback
POST   /api/v1/auth/google/token         # Exchange auth code for tokens
POST   /api/v1/auth/register             # Email/password registration
POST   /api/v1/auth/login                # Email/password login
POST   /api/v1/auth/refresh              # Refresh access token
POST   /api/v1/auth/logout               # Logout (blacklist tokens)
POST   /api/v1/auth/forgot-password      # Request password reset
POST   /api/v1/auth/reset-password       # Reset password with token
GET    /api/v1/auth/verify-email/{token} # Verify email address
POST   /api/v1/auth/link-google          # Link Google account to existing user
POST   /api/v1/auth/unlink-google        # Unlink Google account
GET    /api/v1/auth/linked-accounts      # List linked social accounts

# User Management
GET    /api/v1/users/me                  # Get current user
PUT    /api/v1/users/me                  # Update current user
GET    /api/v1/users/preferences         # Get user preferences
PUT    /api/v1/users/preferences         # Update user preferences
DELETE /api/v1/users/account             # Delete user account
GET    /api/v1/users/data-export         # Export user data (GDPR)

# Session Management
GET    /api/v1/sessions                  # List active sessions
POST   /api/v1/sessions/start            # Start new voice session
PUT    /api/v1/sessions/{id}/end         # End session with metadata
GET    /api/v1/sessions/user/{user_id}   # Get user's session history
GET    /api/v1/sessions/{id}             # Get session details
DELETE /api/v1/sessions/{id}             # Delete session
DELETE /api/v1/sessions/all              # Terminate all sessions

# LiveKit Integration
POST   /api/v1/livekit/token             # Generate LiveKit token with user context
GET    /api/v1/livekit/rooms/user/{id}   # Get user's active rooms

# Analytics
POST   /api/v1/analytics/events          # Track events
GET    /api/v1/analytics/reports         # Get reports
GET    /api/v1/analytics/dashboard       # Dashboard data
```

### Frontend Data Models

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  google_id?: string;
  created_at: string;
  updated_at: string;
  preferences?: UserPreferences;
  is_active: boolean;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  voice_settings: {
    enabled: boolean;
    defaultMuted: boolean;
  };
  video_enabled: boolean;
  screen_share_enabled: boolean;
  avatar_preference: string;
  language: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface LiveKitSession {
  id: string;
  user_id: string;
  agent_room_id: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  transcript?: string;
  metadata?: any;
}
```

## Implementation Phases

### Phase 1: Frontend API Integration Setup

**Duration**: 2-3 days

#### Tasks:

1. **Install Dependencies**

   ```bash
   pnpm add axios js-cookie
   pnpm add @types/js-cookie
   ```

2. **Create API Client**

   ```typescript
   // lib/api-client.ts
   // Configure Axios instance for backend communication
   // Handle token management and refresh logic
   // Implement request/response interceptors
   ```

3. **Environment Variables**

   ```env
   # Add to .env.local
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
   ```

4. **Authentication Context & Hooks**

   ```typescript
   // contexts/auth-context.tsx
   // hooks/use-auth.ts
   // Set up state management for user and tokens
   // Implement login/logout/refresh logic
   ```

5. **Token Management**
   - Secure token storage (httpOnly cookies or localStorage)
   - Automatic token refresh on API calls
   - Token expiration handling
   - Logout cleanup

#### Deliverables:

- ✅ API client with backend integration
- ✅ Authentication context and hooks
- ✅ Token management system
- ✅ Error handling for auth failures

### Phase 2: User Interface Integration

**Duration**: 2-3 days

#### Tasks:

1. **Update App Layout**
   - Add authentication context provider
   - Create user profile dropdown
   - Update navigation with auth status
   - Add loading states for auth

2. **Create Auth Components**

   ```
   components/auth/
   ├── login-button.tsx
   ├── logout-button.tsx
   ├── user-profile.tsx
   ├── auth-guard.tsx
   └── login-form.tsx
   ```

3. **Update Welcome Screen**
   - Show different content for authenticated users
   - Add "Continue as Guest" option
   - Display user greeting when logged in

4. **Protected Routes**
   - Implement auth guards
   - Redirect logic for unauthenticated users
   - Session validation

#### Deliverables:

- ✅ Login/logout UI components
- ✅ User profile display
- ✅ Protected route system
- ✅ Responsive auth states

### Phase 3: LiveKit Integration with Backend

**Duration**: 2-3 days

#### Tasks:

1. **Update LiveKit Token Generation**
   - Modify `app/api/livekit/token.ts` to include user ID from auth context
   - Send authenticated user data to backend for session tracking
   - Generate user-specific room names when authenticated

2. **Backend Integration for Sessions**

   ```typescript
   // Integrate with backend session endpoints:
   POST /api/v1/sessions/start            # Start new LiveKit session
   PUT  /api/v1/sessions/{id}/end         # End session with duration/transcript
   GET  /api/v1/sessions/user/{user_id}   # Get user's session history
   GET  /api/v1/sessions/{id}             # Get session details
   DELETE /api/v1/sessions/{id}           # Delete session
   ```

3. **Enhanced Session Tracking**
   - Send session start events to backend
   - Track session metadata (room ID, user preferences)
   - Automatically end sessions on page close/refresh
   - Store transcripts and session data via backend API

4. **User-Specific Room Features**
   - Generate room names with user ID prefix for authenticated users
   - Apply user preferences to LiveKit session configuration
   - Handle both authenticated and guest session modes

#### Deliverables:

- ✅ User-aware LiveKit token generation
- ✅ Backend integration for session tracking
- ✅ User-specific room management
- ✅ Session history storage via API

### Phase 4: User Preferences & Profile Management

**Duration**: 2-3 days

#### Tasks:

1. **User Settings Pages**

   ```
   app/(app)/settings/
   ├── page.tsx              # Settings overview
   ├── profile/page.tsx      # Profile management
   ├── preferences/page.tsx  # Voice/video preferences
   ├── privacy/page.tsx      # Privacy & data controls
   └── account/page.tsx      # Account linking & security
   ```

2. **Backend API Integration for User Data**

   ```typescript
   // Integrate with backend user endpoints:
   GET    /api/v1/users/me                # Get current user profile
   PUT    /api/v1/users/me                # Update current user profile
   GET    /api/v1/users/preferences       # Get user preferences
   PUT    /api/v1/users/preferences       # Update user preferences
   DELETE /api/v1/users/account           # Delete account
   GET    /api/v1/users/data-export       # Export user data
   ```

3. **Preference Management Interface**
   - Theme selection (integrate with existing theme system)
   - Voice/video default settings with real-time preview
   - Avatar preferences and customization
   - Language and accessibility settings
   - LiveKit session defaults

4. **Profile & Account Management**
   - Display and edit user information from backend
   - Account linking status (Google, email)
   - Privacy controls and data management
   - Account deletion with confirmation flow

5. **Settings Application**
   - Apply user preferences to LiveKit sessions automatically
   - Sync settings with backend on change
   - Handle offline/online state for settings
   - Validation and error handling for preference updates

#### Deliverables:

- ✅ Complete user settings interface
- ✅ Backend-synced preference management
- ✅ Profile editing and account controls
- ✅ Preference application to voice sessions

### Phase 5: Advanced Features

**Duration**: 3-4 days

#### Tasks:

1. **Session History**
   - Display past voice sessions
   - Session replay/transcript view
   - Search and filter sessions
   - Export session data

2. **Advanced Auth Features**
   - Account linking (future: multiple providers)
   - Two-factor authentication (optional)
   - Account recovery
   - Email verification

3. **Analytics & Insights**
   - User engagement metrics
   - Session duration tracking
   - Feature usage analytics
   - Performance monitoring

4. **Admin Panel** (Optional)
   - User management interface
   - Session monitoring
   - System health dashboard
   - User support tools

#### Deliverables:

- ✅ Session history interface
- ✅ Enhanced security features
- ✅ User analytics
- ✅ Admin capabilities

## Security Considerations

### Authentication Security

- Use HTTPS in production
- Implement CSRF protection
- Secure session cookies
- Regular token rotation
- Rate limiting on auth endpoints

### Data Protection

- Encrypt sensitive user data
- Implement data retention policies
- GDPR compliance features
- Secure database connections
- Regular security audits

### Privacy Controls

- User data export
- Account deletion
- Privacy settings
- Consent management
- Data minimization

## Configuration Updates

### Update app-config.ts

```typescript
export const APP_CONFIG_DEFAULTS = {
  // ... existing config
  requireAuth: false, // Set to true to require login
  guestModeEnabled: true, // Allow guest access
  showUserProfile: true,
  sessionHistoryEnabled: true,
  userPreferencesEnabled: true,
};
```

### New Environment Variables

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your-google-client-id

# Optional: Additional configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_GUEST_MODE=true

# Note: Backend (localhost:8000) handles:
# - Google OAuth secrets
# - Database connections
# - JWT token management
# - All authentication logic
```

## Testing Strategy

### Unit Tests

- Auth helper functions
- Database operations
- User preference logic
- Session management

### Integration Tests

- Google Auth flow
- Database migrations
- API endpoint testing
- LiveKit integration

### E2E Tests

- Complete login/logout flow
- User preference persistence
- Session creation and management
- Protected route access

## Migration Strategy

### For Existing Users

- Graceful handling of existing anonymous sessions
- Optional account creation prompts
- Data migration for guest sessions
- Backward compatibility during transition

### Deployment Considerations

- Database migration scripts
- Environment variable updates
- CDN/static asset updates
- Monitoring and rollback plans

## Success Metrics

### User Engagement

- User registration rate
- Session frequency per user
- Feature adoption rates
- User retention metrics

### Technical Performance

- Authentication response times
- Database query performance
- Session management efficiency
- Error rates and reliability

## Future Enhancements

### Potential Additions

- Multi-tenant support
- Team/organization features
- Advanced user roles
- API key management for developers
- Webhook integrations
- Mobile app synchronization

### Scalability Considerations

- Database sharding strategies
- Caching implementation
- CDN integration
- Load balancing
- Monitoring and alerting

---

## Getting Started

To begin implementation:

1. **Verify Backend is Running**

   ```bash
   # Ensure your backend API is running on localhost:8000
   curl http://localhost:8000/api/v1/auth/google/login
   ```

2. **Set up Frontend Dependencies**

   ```bash
   # Install required packages for API integration
   pnpm add axios js-cookie
   pnpm add @types/js-cookie
   ```

3. **Configure Environment Variables**

   ```bash
   # Copy existing .env.example and add:
   cp .env.example .env.local

   # Add backend integration variables
   echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" >> .env.local
   echo "NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your-google-client-id" >> .env.local
   ```

4. **Start with Phase 1: API Integration**
   - Create API client for backend communication
   - Set up authentication context and hooks
   - Implement token management
   - Test integration with backend endpoints

5. **Development Workflow**
   - Frontend (Next.js): `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - Follow phased implementation plan
   - Test each phase with backend integration
   - Maintain backward compatibility for guest users

## Frontend Implementation Strategy

### **Complete API Integration**

All backend endpoints are available and ready for frontend integration:

- Complete authentication system (Google OAuth + Email/Password)
- User management endpoints (`/api/v1/users/me`, `/api/v1/users/preferences`)
- Session management (`/api/v1/sessions/*`)
- LiveKit integration (`/api/v1/livekit/token`)
- Analytics tracking (`/api/v1/analytics/events`)

### **Implementation Phases**

1. **Phase 1-2**: API integration and UI components
2. **Phase 3-4**: LiveKit integration and user preferences
3. **Phase 5**: Advanced features and analytics

### **Development Focus**

- Pure frontend development using Next.js
- API integration with backend endpoints
- UI/UX implementation
- State management and user experience

This plan leverages your existing robust backend authentication system while adding a seamless user experience to the LiveKit voice agent frontend.

---

## Implementation Task Checklist

### Phase 1: Frontend API Integration Setup

**Duration**: 2-3 days

#### Setup & Dependencies

- [x] Install required dependencies (axios, js-cookie)
- [x] Configure environment variables (.env.local)
- [ ] Verify backend API connectivity

#### API Client Implementation

- [x] Create `lib/api-client.ts` with Axios configuration
- [x] Implement request/response interceptors
- [x] Add token management and refresh logic
- [x] Add error handling and retry mechanisms
- [x] Test API client with backend endpoints

#### Authentication Context & Hooks

- [x] Create `contexts/auth-context.tsx`
- [x] Create `hooks/use-auth.ts`
- [x] Implement user state management
- [x] Add login/logout/refresh functionality
- [x] Add token storage (localStorage/cookies)
- [x] Test authentication flow end-to-end

#### Token Management

- [x] Implement secure token storage
- [x] Add automatic token refresh on API calls
- [x] Handle token expiration gracefully
- [x] Add logout cleanup functionality
- [x] Test token refresh scenarios

### Phase 2: User Interface Integration

**Duration**: 2-3 days

#### Authentication Components

- [x] Create `components/auth/login-button.tsx`
- [x] Create `components/auth/logout-button.tsx`
- [x] Create `components/auth/user-profile.tsx`
- [x] Create `components/auth/auth-guard.tsx`
- [x] Create `components/auth/login-form.tsx`
- [x] Test all auth components

#### App Layout Updates

- [x] Add authentication context provider to app layout
- [x] Create user profile dropdown component
- [x] Update navigation with auth status
- [x] Add loading states for authentication
- [x] Test responsive auth states

#### Welcome Screen Updates

- [x] Update welcome screen for authenticated users
- [x] Add "Continue as Guest" option
- [x] Display user greeting when logged in
- [x] Add different content for authenticated vs guest users
- [x] Test welcome screen scenarios

#### Protected Routes

- [ ] Implement auth guards for protected routes
- [ ] Add redirect logic for unauthenticated users
- [ ] Add session validation
- [ ] Test protected route access
- [ ] Test guest mode functionality

### Phase 3: LiveKit Integration with Backend

**Duration**: 2-3 days

#### LiveKit Token Generation Updates

- [ ] Modify `app/api/livekit/token.ts` to include user ID
- [ ] Add authenticated user data to token generation
- [ ] Generate user-specific room names for authenticated users
- [ ] Test token generation with user context

#### Backend Session Integration

- [ ] Integrate with `POST /api/v1/sessions/start`
- [ ] Integrate with `PUT /api/v1/sessions/{id}/end`
- [ ] Integrate with `GET /api/v1/sessions/user/{user_id}`
- [ ] Integrate with `GET /api/v1/sessions/{id}`
- [ ] Integrate with `DELETE /api/v1/sessions/{id}`
- [ ] Test session management flow

#### Enhanced Session Tracking

- [ ] Send session start events to backend
- [ ] Track session metadata (room ID, user preferences)
- [ ] Automatically end sessions on page close/refresh
- [ ] Store transcripts and session data via API
- [ ] Test session tracking scenarios

#### User-Specific Room Features

- [ ] Generate room names with user ID prefix
- [ ] Apply user preferences to LiveKit session configuration
- [ ] Handle both authenticated and guest session modes
- [ ] Test room management for different user types

### Phase 4: User Preferences & Profile Management

**Duration**: 2-3 days

#### Settings Pages Structure

- [ ] Create `app/(app)/settings/page.tsx`
- [ ] Create `app/(app)/settings/profile/page.tsx`
- [ ] Create `app/(app)/settings/preferences/page.tsx`
- [ ] Create `app/(app)/settings/privacy/page.tsx`
- [ ] Create `app/(app)/settings/account/page.tsx`
- [ ] Test settings page navigation

#### Backend User Data Integration

- [ ] Integrate with `GET /api/v1/users/me`
- [ ] Integrate with `PUT /api/v1/users/me`
- [ ] Integrate with `GET /api/v1/users/preferences`
- [ ] Integrate with `PUT /api/v1/users/preferences`
- [ ] Integrate with `DELETE /api/v1/users/account`
- [ ] Integrate with `GET /api/v1/users/data-export`
- [ ] Test all user data operations

#### Preference Management Interface

- [ ] Create theme selection component
- [ ] Create voice/video settings interface
- [ ] Create avatar preferences component
- [ ] Create language and accessibility settings
- [ ] Add real-time preview for settings changes
- [ ] Test preference management flow

#### Profile & Account Management

- [ ] Create profile display component
- [ ] Create profile editing interface
- [ ] Add account linking status display
- [ ] Create privacy controls interface
- [ ] Add account deletion confirmation flow
- [ ] Test profile management scenarios

#### Settings Application

- [ ] Apply user preferences to LiveKit sessions automatically
- [ ] Sync settings with backend on change
- [ ] Handle offline/online state for settings
- [ ] Add validation and error handling for preference updates
- [ ] Test settings persistence across sessions

### Phase 5: Advanced Features

**Duration**: 3-4 days

#### Session History Interface

- [ ] Create session history page
- [ ] Display past voice sessions with metadata
- [ ] Add session replay/transcript view
- [ ] Implement search and filter functionality
- [ ] Add session export functionality
- [ ] Test session history features

#### Advanced Auth Features

- [ ] Add account linking interface
- [ ] Implement two-factor authentication UI (optional)
- [ ] Add account recovery flow
- [ ] Add email verification interface
- [ ] Test advanced auth scenarios

#### Analytics & Insights

- [ ] Integrate with `POST /api/v1/analytics/events`
- [ ] Integrate with `GET /api/v1/analytics/reports`
- [ ] Integrate with `GET /api/v1/analytics/dashboard`
- [ ] Create user engagement metrics display
- [ ] Add session duration tracking
- [ ] Create feature usage analytics
- [ ] Add performance monitoring
- [ ] Test analytics integration

#### Admin Panel (Optional)

- [ ] Create admin user management interface
- [ ] Add session monitoring dashboard
- [ ] Create system health dashboard
- [ ] Add user support tools
- [ ] Test admin functionality

### Testing & Quality Assurance

- [ ] Unit tests for all components
- [ ] Integration tests for API calls
- [ ] E2E tests for complete user flows
- [ ] Performance testing
- [ ] Security testing
- [ ] Cross-browser compatibility testing
- [ ] Mobile responsiveness testing

### Documentation & Deployment

- [ ] Update README with user management features
- [ ] Create user documentation
- [ ] Add API documentation
- [ ] Prepare deployment configuration
- [ ] Create deployment checklist
- [ ] Test production deployment

### Total Tasks: 108

**Estimated Duration**: 12-16 days
