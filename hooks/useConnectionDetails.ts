import { useCallback, useEffect, useState } from 'react';
import { ConnectionDetails } from '@/app/api/connection-details/route';
import { useAuth } from '@/contexts/auth-context';

export default function useConnectionDetails() {
  // Generate room connection details, including:
  //   - A random Room name
  //   - A random Participant name (for guest users)
  //   - User email as Participant name (for authenticated users)
  //   - An Access Token to permit the participant to join the room
  //   - The URL of the LiveKit server to connect to
  //
  // In real-world application, you would likely allow the user to specify their
  // own participant name, and possibly to choose from existing rooms to join.

  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const { user, isAuthenticated, isGuest } = useAuth();

  const fetchConnectionDetails = useCallback(() => {
    setConnectionDetails(null);
    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details',
      window.location.origin
    );

    // Prepare user context for the request
    const requestBody = {
      user:
        isAuthenticated && user
          ? {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            }
          : null,
      isGuest,
    };

    fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setConnectionDetails(data);
      })
      .catch((error) => {
        console.error('Error fetching connection details:', error);
        // Fallback to GET request for backward compatibility
        fetch(url.toString())
          .then((res) => res.json())
          .then((data) => {
            setConnectionDetails(data);
          })
          .catch((fallbackError) => {
            console.error('Fallback request also failed:', fallbackError);
          });
      });
  }, [user, isAuthenticated, isGuest]);

  useEffect(() => {
    fetchConnectionDetails();
  }, [fetchConnectionDetails]);

  return { connectionDetails, refreshConnectionDetails: fetchConnectionDetails };
}
