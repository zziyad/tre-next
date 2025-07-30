import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionFromCookie();
    
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        message: 'No valid session found'
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role
      },
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