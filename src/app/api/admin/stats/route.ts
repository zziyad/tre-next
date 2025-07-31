import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie, requirePermission } from '@/lib/auth';

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

    // Check if user has permission to view admin stats
    try {
      await requirePermission(session.user_id, 'users:admin');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Required: users:admin' },
        { status: 403 }
      );
    }

    // Get user statistics
    const [totalUsers, activeUsers, inactiveUsers, totalPermissions, recentActivity] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { is_active: true } }),
      prisma.user.count({ where: { is_active: false } }),
      prisma.permission.count(),
      prisma.activityLog.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalPermissions,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 