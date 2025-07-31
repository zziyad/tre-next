import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUser, getSessionFromCookie, requirePermission } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin permissions
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to create users
    try {
      await requirePermission(session.user_id, 'users:write');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Required: users:write' },
        { status: 403 }
      );
    }

    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Create the new user
    const newUser = await createUser({ username, email, password });

    // Log the user creation activity
    await prisma.activityLog.create({
      data: {
        user_id: session.user_id,
        action: 'user_created',
        target_user_id: newUser.user_id,
        details: JSON.stringify({ 
          created_user: { username, email },
          created_by: session.username,
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            user_id: newUser.user_id,
            username: newUser.username,
            email: newUser.email,
            is_active: newUser.is_active,
          },
        },
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 