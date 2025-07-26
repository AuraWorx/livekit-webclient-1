import { NextResponse } from 'next/server';
import { AccessToken, type AccessTokenOptions, type VideoGrant } from 'livekit-server-sdk';

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
  participantIdentity?: string;
};

// Request body type for user context
type ConnectionRequest = {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | null;
  isGuest?: boolean;
};

export async function GET() {
  // Maintain backward compatibility with GET requests
  return await handleConnectionRequest({ user: null, isGuest: true });
}

export async function POST(request: Request) {
  try {
    const body: ConnectionRequest = await request.json();
    return await handleConnectionRequest(body);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return new NextResponse('Invalid request body', { status: 400 });
  }
}

async function handleConnectionRequest(request: ConnectionRequest) {
  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error('LIVEKIT_URL is not defined');
    }
    if (API_KEY === undefined) {
      throw new Error('LIVEKIT_API_KEY is not defined');
    }
    if (API_SECRET === undefined) {
      throw new Error('LIVEKIT_API_SECRET is not defined');
    }

    const { user, isGuest = false } = request;

    // Generate participant identity based on user type
    let participantIdentity: string;
    let participantName: string;

    if (user && user.email && !isGuest) {
      // Authenticated user - use email as identity
      participantIdentity = user.email;
      participantName =
        user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.email;
    } else {
      // Guest user or no user info - use random identity
      participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
      participantName = 'Guest User';
    }

    // Room names remain random for security
    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;

    const participantToken = await createParticipantToken(
      { identity: participantIdentity, name: participantName },
      roomName
    );

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: participantToken,
      participantName,
      participantIdentity,
    };
    const headers = new Headers({
      'Cache-Control': 'no-store',
    });
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: '15m',
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);
  return at.toJwt();
}
