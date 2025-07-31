import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie, hasPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin permissions
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to view users (either users:read or users:admin)
    const hasReadPermission = await hasPermission(session.user_id, 'users:read');
    const hasAdminPermission = await hasPermission(session.user_id, 'users:admin');
    
    if (!hasReadPermission && !hasAdminPermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Required: users:read or users:admin' },
        { status: 403 }
      );
    }

    // Get all users with their permissions
    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        username: true,
        email: true,
        is_active: true,
        created_at: true,
        UserPermission_UserPermission_user_idToUser: {
          include: {
            Permission: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Transform the data to include permissions as a simple array
    const transformedUsers = users.map(user => ({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      is_active: user.is_active,
      created_at: user.created_at.toISOString(),
      permissions: user.UserPermission_UserPermission_user_idToUser.map(up => up.Permission.name),
    }));

    return NextResponse.json({
      success: true,
      data: transformedUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 