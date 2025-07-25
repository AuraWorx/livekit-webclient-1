'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const tokenType = searchParams.get('token_type');
        const expiresIn = searchParams.get('expires_in');
        
        // Check for user information in URL parameters
        const userName = searchParams.get('user_name');
        const userEmail = searchParams.get('user_email');
        const userImage = searchParams.get('user_image');
        const userId = searchParams.get('user_id');

        console.log('Auth callback received:', { 
          success, 
          error, 
          code, 
          state, 
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing',
          tokenType,
          expiresIn,
          userName,
          userEmail,
          userImage,
          userId
        });

        if (error) {
          console.error('Auth callback error:', error);
          const decodedError = decodeURIComponent(error);
          console.log('Decoded error:', decodedError);
          
          setErrorMessage(decodedError);
          setStatus('error');
          toast.error(`Authentication failed: ${decodedError}`);
          
          // Redirect after showing error
          setTimeout(() => {
            router.push('/');
          }, 5000);
          return;
        }

        // Check for successful authentication with tokens
        if (success === 'true' && accessToken && refreshToken) {
          console.log('Auth callback success with tokens');
          
          try {
            // Store tokens in cookies/localStorage
            if (typeof window !== 'undefined') {
              // Store access token
              document.cookie = `access_token=${accessToken}; path=/; max-age=${expiresIn || 900}; secure; samesite=strict`;
              
              // Store refresh token (longer expiry)
              document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; secure; samesite=strict`;
              
              // Store token type
              document.cookie = `token_type=${tokenType || 'Bearer'}; path=/; max-age=${expiresIn || 900}; secure; samesite=strict`;
              
              console.log('Tokens stored successfully');
            }
            
            // Note: Backend doesn't have /api/v1/users/me endpoint
            // User profile will be extracted from JWT token in auth context
            
            // Try to fetch user data from backend
            try {
              const possibleEndpoints = [
                '/api/v1/users/me',
                '/api/v1/user',
                '/api/v1/profile',
                '/api/v1/auth/profile',
                '/api/v1/auth/user'
              ];
              
              let userData = null;
              
              // Try each endpoint until one works
              for (const endpoint of possibleEndpoints) {
                try {
                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                  });

                  if (response.ok) {
                    const responseData = await response.json();
                    console.log(`Successfully fetched user data from ${endpoint}:`, responseData);
                    
                    if (responseData.success && responseData.data) {
                      userData = responseData.data;
                      break;
                    } else if (responseData.name || responseData.email) {
                      // Direct user object
                      userData = {
                        id: responseData.id || 'user',
                        email: responseData.email || 'user@example.com',
                        name: responseData.name || 'User',
                        image: responseData.image || responseData.picture,
                        google_id: responseData.google_id,
                        created_at: responseData.created_at || new Date().toISOString(),
                        updated_at: responseData.updated_at || new Date().toISOString(),
                        is_active: responseData.is_active !== undefined ? responseData.is_active : true,
                      };
                      break;
                    }
                  }
                } catch (endpointError) {
                  console.log(`Endpoint ${endpoint} failed:`, endpointError);
                  continue;
                }
              }
              
              // Store user data if found
              if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('User profile stored from backend:', userData);
              } else {
                console.log('No backend user endpoint found, will use token data');
              }
            } catch (error) {
              console.error('Error fetching user data from backend:', error);
            }
            
            // Store user information if available in URL parameters
            if (userName || userEmail) {
              const userData = {
                id: userId || 'user',
                email: userEmail || 'user@example.com',
                name: userName || 'User',
                image: userImage || undefined,
                google_id: userId || undefined,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true,
              };
              
              localStorage.setItem('user', JSON.stringify(userData));
              console.log('User profile stored from URL parameters:', userData);
            } else {
              // Create user data from token if no URL parameters
              try {
                const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
                const userId = tokenPayload.sub;
                const shortId = userId.substring(0, 8);
                
                const userData = {
                  id: userId,
                  email: `user-${shortId}@example.com`,
                  name: `User ${shortId}`,
                  image: undefined,
                  google_id: undefined,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  is_active: true,
                };
                
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('User profile created from token:', userData);
              } catch (error) {
                console.error('Error creating user data from token:', error);
              }
            }
            
            setStatus('success');
            toast.success('Authentication successful! Welcome!');
            
            // Redirect to home page after a short delay
            setTimeout(() => {
              router.push('/');
            }, 2000);
            
          } catch (tokenError) {
            console.error('Error storing tokens:', tokenError);
            setStatus('error');
            setErrorMessage('Authentication successful but failed to store session');
            toast.error('Authentication successful but failed to store session');
            
            setTimeout(() => {
              router.push('/');
            }, 5000);
          }
        } else if (success === 'true' && code) {
          // Fallback for code-based flow
          console.log('Auth callback success with code:', code);
          setStatus('success');
          toast.success('Authentication successful!');
          
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          console.log('Auth callback completed but no success indicators');
          setStatus('error');
          setErrorMessage('Authentication completed but no success indicators received');
          toast.error('Authentication completed but no success indicators received');
          
          setTimeout(() => {
            router.push('/');
          }, 5000);
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        toast.error('Authentication callback error');
        
        setTimeout(() => {
          router.push('/');
        }, 5000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Processing authentication...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we complete your login.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Authentication Successful!
              </h2>
              <p className="mt-2 text-sm text-gray-600">Redirecting you to the home page...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Authentication Failed</h2>
              <p className="mt-2 text-sm text-gray-600">
                {errorMessage || 'An error occurred during authentication.'}
              </p>
              <p className="mt-2 text-xs text-gray-500">Redirecting you to the home page...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
