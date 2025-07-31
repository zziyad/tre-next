import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'No valid session found'
      });
    }

    return NextResponse.json({
      authenticated: true,
      session: session,
      sessionKeys: Object.keys(session),
      message: 'Session is valid'
    });
  } catch (error) {
    console.error('Session debug error:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Session check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 