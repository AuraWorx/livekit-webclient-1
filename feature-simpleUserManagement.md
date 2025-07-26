# Simple User Management with Google OAuth - PRD

## Overview

This document outlines the implementation of Google OAuth authentication for the LiveKit Agent Starter React application. The feature will integrate with an existing Python backend that handles Google token verification, user management, and JWT token generation.

## Goals

- Implement seamless Google OAuth authentication flow
- Integrate with existing Python backend API
- Provide secure user session management
- Maintain existing LiveKit functionality while adding authentication
- Create a smooth user experience with proper loading states and error handling

## User Flow

1. User clicks "Sign in with Google"
2. Google OAuth popup opens
3. User authenticates with Google
4. Google returns JWT token to frontend
5. Frontend sends Google token to backend
6. Backend verifies token with Google
7. Backend creates/updates user in PostgreSQL
8. Backend generates JWT token
9. Backend returns JWT + user data
10. Frontend stores JWT and updates UI

## Technical Requirements

### Frontend Requirements

#### Authentication Components
- Google OAuth button component
- Authentication state management
- JWT token storage and management
- User profile display
- Logout functionality

#### API Integration
- Integration with backend authentication endpoints
- Token refresh mechanism
- Error handling for authentication failures
- Loading states during authentication

#### Security Considerations
- Secure JWT storage (httpOnly cookies or secure localStorage)
- Token expiration handling
- Automatic logout on token expiration
- CSRF protection

### Backend Integration Points

#### API Endpoints to Integrate
- `POST /api/v1/auth/google/verify` - Verify Google token and login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/users/me` - Get current user profile

#### Data Models
```typescript
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  googleId?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

## UI/UX Requirements

### Authentication States
1. **Unauthenticated** - Show welcome screen with Google sign-in button
2. **Authenticating** - Show loading spinner during OAuth flow
3. **Authenticated** - Show user profile and session controls
4. **Error** - Show error messages with retry options

### Component Design
- Google sign-in button with Google branding
- User profile dropdown with logout option
- Loading indicators during authentication
- Error toast notifications
- Responsive design for mobile/desktop

### Integration Points
- Modify existing `Welcome` component to include authentication
- Update `SessionView` to show user context
- Add authentication state to main `App` component
- Integrate with existing toast notification system

## Implementation Plan

### Phase 1: Core Authentication Setup
1. Set up Google OAuth client configuration
2. Create authentication context and hooks
3. Implement Google sign-in flow
4. Add JWT token management

### Phase 2: UI Integration
1. Update welcome screen with authentication
2. Add user profile components
3. Implement logout functionality
4. Add loading and error states

### Phase 3: Session Management
1. Implement token refresh mechanism
2. Add automatic logout on token expiration
3. Integrate with existing LiveKit session management
4. Add user context to voice sessions

### Phase 4: Polish & Testing
1. Add comprehensive error handling
2. Implement proper loading states
3. Add unit and integration tests
4. Performance optimization

## Technical Architecture

### Authentication Context
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
```

### API Service Layer
```typescript
interface AuthService {
  verifyGoogleToken: (googleToken: string) => Promise<AuthResponse>;
  refreshToken: (refreshToken: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
}
```

### Storage Strategy
- Store JWT tokens in httpOnly cookies for security
- Use localStorage for user profile data (non-sensitive)
- Implement automatic token refresh before expiration

## Environment Configuration

### Required Environment Variables
```env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com

# Backend API
NEXT_PUBLIC_API_BASE_URL=https://wqbackend-testing.auraworx.com/api/v1
NEXT_PUBLIC_FRONTEND_URL=https://wqmobile-testing.auraworx.com
```

### Google OAuth Setup
1. Configure Google Cloud Console project
2. Set up OAuth 2.0 credentials
3. Add authorized redirect URIs
4. Configure consent screen

## Error Handling

### Authentication Errors
- Google OAuth failures
- Backend API errors
- Token validation errors
- Network connectivity issues

### User Experience
- Clear error messages
- Retry mechanisms
- Graceful fallbacks
- Helpful troubleshooting guidance

## Security Considerations

### Token Security
- Use httpOnly cookies for JWT storage
- Implement proper CORS configuration
- Validate tokens on each request
- Handle token expiration gracefully

### Data Protection
- Never store sensitive data in localStorage
- Implement proper logout cleanup
- Secure API communication
- Input validation and sanitization

## Testing Strategy

### Unit Tests
- Authentication hooks and context
- API service functions
- Component rendering
- Error handling

### Integration Tests
- End-to-end authentication flow
- Token refresh mechanism
- Session management
- API integration

### Manual Testing
- Google OAuth flow
- Cross-browser compatibility
- Mobile responsiveness
- Error scenarios

## Performance Considerations

### Optimization
- Lazy load authentication components
- Implement proper caching strategies
- Optimize bundle size
- Minimize API calls

### Monitoring
- Track authentication success/failure rates
- Monitor token refresh performance
- Log user session metrics
- Error tracking and reporting

## Success Metrics

### User Experience
- Authentication success rate > 95%
- Average authentication time < 3 seconds
- Error rate < 2%
- User satisfaction score > 4.5/5

### Technical Performance
- API response time < 500ms
- Token refresh success rate > 99%
- Session timeout handling 100%
- Cross-browser compatibility 100%

## Dependencies

### External Dependencies
- Google OAuth JavaScript library
- JWT token management library
- HTTP client for API calls

### Internal Dependencies
- Existing LiveKit integration
- Toast notification system
- Theme and styling system
- Component library

## Risk Assessment

### Technical Risks
- Google OAuth configuration issues
- Backend API compatibility
- Token security vulnerabilities
- Cross-browser compatibility

### Mitigation Strategies
- Comprehensive testing plan
- Security review and audit
- Fallback authentication methods
- Monitoring and alerting

## Timeline

### Week 1: Foundation
- Set up Google OAuth configuration
- Create authentication context and hooks
- Implement basic sign-in flow

### Week 2: Integration
- Update UI components
- Integrate with existing app flow
- Add error handling

### Week 3: Polish
- Add loading states and animations
- Implement token refresh
- Add comprehensive testing

### Week 4: Deployment
- Security review
- Performance optimization
- Documentation and training

---

## Task List

### Phase 1: Core Authentication Setup ✅ COMPLETED

- [x] **Set up Google OAuth configuration**
  - [x] Install Google OAuth JavaScript library
  - [x] Configure Google Cloud Console project
  - [x] Set up OAuth 2.0 credentials
  - [x] Add environment variables for Google Client ID
  - [x] Test Google OAuth configuration

- [x] **Create authentication context and hooks**
  - [x] Create `AuthContext` with TypeScript interfaces
  - [x] Implement `useAuth` hook for authentication state
  - [x] Add `useGoogleAuth` hook for Google OAuth flow
  - [x] Create `AuthProvider` component
  - [x] Add authentication state management (loading, error, user)

- [x] **Implement Google sign-in flow**
  - [x] Create Google sign-in button component
  - [x] Implement Google OAuth popup handling
  - [x] Add Google token extraction and validation
  - [x] Handle Google OAuth errors and edge cases
  - [x] Add loading states during OAuth flow

- [x] **Add JWT token management**
  - [x] Create token storage service (httpOnly cookies)
  - [x] Implement token refresh mechanism
  - [x] Add automatic logout on token expiration
  - [x] Create token validation utilities
  - [x] Add secure token cleanup on logout

### Phase 2: Backend API Integration ✅ COMPLETED

- [x] **Create API service layer**
  - [x] Create `AuthService` class with TypeScript interfaces
  - [x] Implement `verifyGoogleToken` method
  - [x] Implement `refreshToken` method
  - [x] Implement `logout` method
  - [x] Implement `getCurrentUser` method
  - [x] Add proper error handling and retry logic

- [x] **Set up HTTP client configuration**
  - [x] Configure axios or fetch with base URL
  - [x] Add request/response interceptors for JWT tokens
  - [x] Implement automatic token refresh on 401 responses
  - [x] Add request timeout and retry configuration
  - [x] Set up CORS and security headers

- [x] **Integrate with existing backend**
  - [x] Test connection to backend API endpoints
  - [x] Verify Google token verification flow
  - [x] Test user creation/update in PostgreSQL
  - [x] Validate JWT token generation and validation
  - [x] Test token refresh mechanism
  - [x] Fix API request format (google_token field)

### Phase 3: UI Integration ✅ COMPLETED

- [x] **Update welcome screen with authentication**
  - [x] Modify `Welcome` component to include Google sign-in
  - [x] Add authentication state to welcome screen
  - [x] Implement conditional rendering based on auth state
  - [x] Add loading states during authentication
  - [x] Integrate with existing start call functionality
  - [x] Add guest mode option for anonymous access

- [x] **Add user profile components**
  - [x] Create `UserProfile` component
  - [x] Add user avatar and name display
  - [x] Create user dropdown menu
  - [x] Add profile picture and user info display
  - [x] Implement responsive design for mobile/desktop

- [x] **Implement logout functionality**
  - [x] Add logout button to user dropdown
  - [x] Implement secure logout flow
  - [x] Clear all authentication data on logout
  - [x] Redirect to welcome screen after logout
  - [x] Add logout confirmation dialog

- [x] **Add loading and error states**
  - [x] Create loading spinner component
  - [x] Add authentication error handling
  - [x] Implement retry mechanisms for failed auth
  - [x] Add error toast notifications
  - [x] Create fallback UI for authentication errors

### Phase 4: Session Management ✅ COMPLETED

- [x] **Integrate with LiveKit session management**
  - [x] Update `App` component to handle authentication state
  - [x] Modify `SessionView` to show user context
  - [x] Add user information to voice sessions
  - [x] Implement authentication checks before starting sessions
  - [x] Add user-specific session data
  - [x] Fix logo asset path (WQ_Daisy_Logo.svg)
  - [x] Remove "Built with LiveKit Agents" text to prevent UI interference
  - [x] Remove hyperlink from Daisy logo for cleaner branding
  - [x] Fix linting and formatting issues across all components

- [ ] **Implement token refresh mechanism**
  - [ ] Add automatic token refresh before expiration
  - [ ] Implement silent token refresh
  - [ ] Handle token refresh failures gracefully
  - [ ] Add token refresh retry logic
  - [ ] Monitor token expiration and refresh timing

- [ ] **Add user context to voice sessions**
  - [ ] Display user information in session view
  - [ ] Add user-specific session controls
  - [ ] Implement user session history
  - [ ] Add user preferences and settings
  - [ ] Create user-specific session data storage

### Phase 5: Security & Error Handling

- [ ] **Implement comprehensive error handling**
  - [ ] Add error boundaries for authentication components
  - [ ] Implement proper error logging
  - [ ] Create user-friendly error messages
  - [ ] Add error recovery mechanisms
  - [ ] Test various error scenarios

- [ ] **Add security measures**
  - [ ] Implement CSRF protection
  - [ ] Add input validation and sanitization
  - [ ] Secure token storage and transmission
  - [ ] Add rate limiting for authentication attempts
  - [ ] Implement secure logout cleanup

- [ ] **Add monitoring and analytics**
  - [ ] Track authentication success/failure rates
  - [ ] Monitor token refresh performance
  - [ ] Add user session analytics
  - [ ] Implement error tracking
  - [ ] Add performance monitoring

### Phase 6: Testing & Polish

- [ ] **Add comprehensive testing**
  - [ ] Write unit tests for authentication hooks
  - [ ] Add integration tests for API calls
  - [ ] Create end-to-end authentication tests
  - [ ] Test cross-browser compatibility
  - [ ] Add mobile responsiveness tests

- [ ] **Performance optimization**
  - [ ] Optimize bundle size for authentication code
  - [ ] Implement lazy loading for auth components
  - [ ] Add caching for user data
  - [ ] Optimize API call frequency
  - [ ] Add performance monitoring

- [ ] **Documentation and training**
  - [ ] Update README with authentication setup
  - [ ] Add developer documentation
  - [ ] Create user guide for authentication
  - [ ] Add troubleshooting guide
  - [ ] Create deployment checklist

### Phase 7: Deployment & Monitoring

- [ ] **Environment configuration**
  - [ ] Set up production environment variables
  - [ ] Configure Google OAuth for production
  - [ ] Set up backend API for production
  - [ ] Configure CORS for production domains
  - [ ] Set up SSL certificates

- [ ] **Deployment preparation**
  - [ ] Create deployment scripts
  - [ ] Set up CI/CD pipeline for authentication
  - [ ] Add environment-specific configurations
  - [ ] Create rollback procedures
  - [ ] Set up monitoring and alerting

- [ ] **Post-deployment validation**
  - [ ] Test authentication flow in production
  - [ ] Monitor authentication metrics
  - [ ] Validate security measures
  - [ ] Test error handling in production
  - [ ] Gather user feedback and iterate
