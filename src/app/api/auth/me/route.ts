import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'

export async function GET(request: Request) {
	try {
		const user = await getSessionFromCookie()
		if (!user) {
			return NextResponse.json(
				{ success: false, error: 'Not authenticated' },
				{ status: 401 }
			)
		}

		return NextResponse.json({
			success: true,
			data: {
				user: {
					user_id: user.user_id,
					username: user.username,
					role: user.role
				}
			}
		})
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: 'Something went wrong' },
			{ status: 500 }
		)
	}
} 