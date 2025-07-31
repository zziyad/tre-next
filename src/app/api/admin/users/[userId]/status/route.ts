import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie, requirePermission } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check if user is authenticated and has admin permissions
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to manage users
    try {
      await requirePermission(session.user_id, 'users:write');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Required: users:write' },
        { status: 403 }
      );
    }

    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { is_active } = await request.json();

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'is_active must be a boolean' },
        { status: 400 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: { is_active },
      select: {
        user_id: true,
        username: true,
        email: true,
        is_active: true,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        user_id: session.user_id,
        action: is_active ? 'user_activated' : 'user_deactivated',
        target_user_id: userId,
        details: JSON.stringify({
          target_user: updatedUser.username,
          action_performed_by: session.username,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 