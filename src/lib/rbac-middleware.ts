// RBAC middleware for permission checking
import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/backend/container'
import { getSessionFromCookie } from '@/lib/auth'
import type { Permission } from '@/types'

/**
 * Middleware to check if user has required permission
 */
export async function requirePermission(permission: Permission) {
	return async (request: NextRequest) => {
		try {
			const session = await getSessionFromCookie()
			if (!session) {
				return NextResponse.json(
					{ error: 'Unauthorized' },
					{ status: 401 }
				)
			}

			const hasPermission = await container.rbacService.hasPermission(session.user_id, permission)
			if (!hasPermission) {
				return NextResponse.json(
					{ error: 'Insufficient permissions' },
					{ status: 403 }
				)
			}

			return NextResponse.next()
		} catch (error) {
			console.error('Permission check error:', error)
			return NextResponse.json(
				{ error: 'Internal server error' },
				{ status: 500 }
			)
		}
	}
}

/**
 * Middleware to check if user has any of the required permissions
 */
export async function requireAnyPermission(permissions: Permission[]) {
	return async (request: NextRequest) => {
		try {
			const session = await getSessionFromCookie()
			if (!session) {
				return NextResponse.json(
					{ error: 'Unauthorized' },
					{ status: 401 }
				)
			}

			const hasPermission = await container.rbacService.hasAnyPermission(session.user_id, permissions)
			if (!hasPermission) {
				return NextResponse.json(
					{ error: 'Insufficient permissions' },
					{ status: 403 }
				)
			}

			return NextResponse.next()
		} catch (error) {
			console.error('Permission check error:', error)
			return NextResponse.json(
				{ error: 'Internal server error' },
				{ status: 500 }
			)
		}
	}
}

/**
 * Middleware to check if user has all required permissions
 */
export async function requireAllPermissions(permissions: Permission[]) {
	return async (request: NextRequest) => {
		try {
			const session = await getSessionFromCookie()
			if (!session) {
				return NextResponse.json(
					{ error: 'Unauthorized' },
					{ status: 401 }
				)
			}

			const hasPermission = await container.rbacService.hasAllPermissions(session.user_id, permissions)
			if (!hasPermission) {
				return NextResponse.json(
					{ error: 'Insufficient permissions' },
					{ status: 403 }
				)
			}

			return NextResponse.next()
		} catch (error) {
			console.error('Permission check error:', error)
			return NextResponse.json(
				{ error: 'Internal server error' },
				{ status: 500 }
			)
		}
	}
}

/**
 * Helper function to check permissions in route handlers
 */
export async function checkPermission(userId: number, permission: Permission): Promise<boolean> {
	try {
		return await container.rbacService.hasPermission(userId, permission)
	} catch (error) {
		console.error('Permission check error:', error)
		return false
	}
}

/**
 * Helper function to check multiple permissions in route handlers
 */
export async function checkAnyPermission(userId: number, permissions: Permission[]): Promise<boolean> {
	try {
		return await container.rbacService.hasAnyPermission(userId, permissions)
	} catch (error) {
		console.error('Permission check error:', error)
		return false
	}
}

/**
 * Helper function to check all permissions in route handlers
 */
export async function checkAllPermissions(userId: number, permissions: Permission[]): Promise<boolean> {
	try {
		return await container.rbacService.hasAllPermissions(userId, permissions)
	} catch (error) {
		console.error('Permission check error:', error)
		return false
	}
} 