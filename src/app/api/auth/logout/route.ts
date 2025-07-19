import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    
    if (token) {
      const response = await deleteSession(token);
      const jsonResponse = NextResponse.json({ message: 'Logged out successfully' });
      
      // Copy the Set-Cookie header from the session response
      const setCookie = response.headers.get('Set-Cookie');
      if (setCookie) {
        jsonResponse.headers.set('Set-Cookie', setCookie);
      }

      return jsonResponse;
    }

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 