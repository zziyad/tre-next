import { NextResponse } from 'next/server'
import { container } from '@/backend/container'
import { createEventSchema } from '@/backend/validation/schemas'
import { getSessionFromCookie } from '@/lib/auth'

export async function POST(request: Request) {
	try {
		const user = await getSessionFromCookie()
		if (!user) {
			return NextResponse.json(
				{ success: false, error: 'Not authenticated' },
				{ status: 401 }
			)
		}

		const body = await request.json()
		
		// Validate input
		const validationResult = createEventSchema.safeParse(body)
		if (!validationResult.success) {
			return NextResponse.json(
				{ 
					success: false,
					error: 'Invalid input', 
					details: validationResult.error.issues 
				},
				{ status: 400 }
			)
		}

		const eventData = validationResult.data

		// Use service layer
		const result = await container.eventService.createEvent(eventData, user.user_id)

		if (!result.success) {
			return NextResponse.json(
				{ success: false, error: result.error },
				{ status: 500 }
			)
		}

		return NextResponse.json({
			success: true,
			data: result.data,
			message: result.message
		}, { status: 201 })
	} catch (error) {
		console.error('Error creating event:', error)
		return NextResponse.json(
			{ success: false, error: 'Something went wrong' },
			{ status: 500 }
		)
	}
} 