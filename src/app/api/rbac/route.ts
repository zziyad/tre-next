import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/backend/container'
import { getSessionFromCookie } from '@/lib/auth'
import { checkPermission } from '@/lib/rbac-middleware'
import { Permission } from '@/types'

export async function GET(request: NextRequest) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Check if user has permission to view RBAC data
		const hasPermission = await checkPermission(session.user_id, Permission.MANAGE_ROLES)
		if (!hasPermission) {
			return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
		}

		const { searchParams } = new URL(request.url)
		const type = searchParams.get('type')

		if (type === 'roles') {
			const result = await container.rbacService.getRoles()
			return NextResponse.json(result)
		} else if (type === 'permissions') {
			const result = await container.rbacService.getPermissions()
			return NextResponse.json(result)
		} else {
			return NextResponse.json(
				{ error: 'Invalid type parameter. Use "roles" or "permissions"' },
				{ status: 400 }
			)
		}
	} catch (error) {
		console.error('Error fetching RBAC data:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch RBAC data' },
			{ status: 500 }
		)
	}
} 