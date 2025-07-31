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

    // Check if user has permission to view permissions
    try {
      await requirePermission(session.user_id, 'users:admin');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Required: users:admin' },
        { status: 403 }
      );
    }

    // Get all permissions
    const permissions = await prisma.permission.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 