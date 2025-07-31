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

    // Check if user has permission to manage user permissions
    try {
      await requirePermission(session.user_id, 'users:admin');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Required: users:admin' },
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

    const { permissions } = await request.json();

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, error: 'permissions must be an array' },
        { status: 400 }
      );
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { username: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all permissions to validate
    const allPermissions = await prisma.permission.findMany({
      select: { permission_id: true, name: true },
    });

    const permissionMap = new Map(allPermissions.map(p => [p.name, p.permission_id]));
    const validPermissions = permissions.filter(p => permissionMap.has(p));

    if (validPermissions.length !== permissions.length) {
      return NextResponse.json(
        { success: false, error: 'Some permissions are invalid' },
        { status: 400 }
      );
    }

    // Get current user permissions
    const currentPermissions = await prisma.userPermission.findMany({
      where: { user_id: userId },
      select: { permission_id: true },
    });

    const currentPermissionIds = currentPermissions.map(p => p.permission_id);
    const newPermissionIds = validPermissions.map(p => permissionMap.get(p)!);

    // Find permissions to add and remove
    const permissionsToAdd = newPermissionIds.filter(id => !currentPermissionIds.includes(id));
    const permissionsToRemove = currentPermissionIds.filter(id => !newPermissionIds.includes(id));

    // Remove permissions
    if (permissionsToRemove.length > 0) {
      await prisma.userPermission.deleteMany({
        where: {
          user_id: userId,
          permission_id: { in: permissionsToRemove },
        },
      });
    }

    // Add new permissions
    if (permissionsToAdd.length > 0) {
      await prisma.userPermission.createMany({
        data: permissionsToAdd.map(permission_id => ({
          user_id: userId,
          permission_id,
          granted_by: session.user_id,
        })),
      });
    }

    // Log the activity
    await prisma.activityLog.create({
      data: {
        user_id: session.user_id,
        action: 'permissions_updated',
        target_user_id: userId,
        details: JSON.stringify({
          target_user: targetUser.username,
          action_performed_by: session.username,
          permissions_added: permissionsToAdd.length,
          permissions_removed: permissionsToRemove.length,
          new_permissions: validPermissions,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Permissions updated successfully',
      data: {
        user_id: userId,
        permissions: validPermissions,
      },
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 