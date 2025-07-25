import { AccessToken, AccessTokenOptions, VideoGrant } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

const LIVEKIT_URL = process.env.LIVEKIT_URL;
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export async function GET(request: Request) {
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

    // Get user information from cookies
    const cookies = request.headers.get('cookie');
    let participantName = 'user';
    let participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
    
    if (cookies) {
      const cookieMap = new Map();
      cookies.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        cookieMap.set(key, value);
      });
      
      const accessToken = cookieMap.get('access_token');
      if (accessToken) {
        try {
          const tokenPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
          const userId = tokenPayload.sub;
          const shortId = userId.substring(0, 8);
          participantName = `User ${shortId}`;
          participantIdentity = `user_${shortId}`;
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
    }

    // Generate participant token
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
