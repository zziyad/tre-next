import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/backend/container'
import { getSessionFromCookie } from '@/lib/auth'
import { createRealTimeStatusSchema } from '@/backend/validation/schemas'

export async function GET(request: NextRequest) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const eventId = searchParams.get('eventId')

		if (!eventId) {
			return NextResponse.json(
				{ error: 'Event ID is required' },
				{ status: 400 }
			)
		}

		const result = await container.realTimeStatusService.getStatuses(parseInt(eventId))
		
		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: 400 }
			)
		}

		return NextResponse.json({
			success: true,
			data: result.data
		})
	} catch (error) {
		console.error('Error fetching real-time statuses:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch real-time statuses' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const validationResult = createRealTimeStatusSchema.safeParse(body)

		if (!validationResult.success) {
			return NextResponse.json(
				{ error: 'Invalid input data', details: validationResult.error.issues },
				{ status: 400 }
			)
		}

		const result = await container.realTimeStatusService.createStatus({
			eventId: validationResult.data.eventId,
			vehicleCode: validationResult.data.vehicleCode,
			hotelName: validationResult.data.hotelName,
			destination: validationResult.data.destination,
			status: validationResult.data.status,
			color: validationResult.data.color,
		})

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: 400 }
			)
		}

		return NextResponse.json({
			success: true,
			data: result.data
		})
	} catch (error) {
		console.error('Error creating real-time status:', error)
		return NextResponse.json(
			{ error: 'Failed to create real-time status' },
			{ status: 500 }
		)
	}
} 