import { NextResponse } from 'next/server'
import { container } from '@/backend/container'
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

		// Use service layer
		const result = await container.eventService.getUserEvents(user.user_id)

		if (!result.success) {
			return NextResponse.json(
				{ success: false, error: result.error },
				{ status: 500 }
			)
		}

		return NextResponse.json({
			success: true,
			data: { events: result.data }
		})
	} catch (error) {
		console.error('Error fetching events:', error)
		return NextResponse.json(
			{ success: false, error: 'Something went wrong' },
			{ status: 500 }
		)
	}
} 