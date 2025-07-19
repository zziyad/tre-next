import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const { token, response } = await createSession(user.user_id);

    const jsonResponse = NextResponse.json({
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role,
      }
    });

    // Copy the Set-Cookie header from the session response
    const setCookie = response.headers.get('Set-Cookie');
    if (setCookie) {
      jsonResponse.headers.set('Set-Cookie', setCookie);
    }

    return jsonResponse;
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 