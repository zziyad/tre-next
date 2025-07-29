import { NextRequest, NextResponse } from 'next/server'
import { realTimeStatusService } from '@/backend/services/real-time-status.service'
import { getSessionFromCookie } from '@/lib/auth'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ eventId: string }> }
) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { eventId: eventIdParam } = await params
		const eventId = parseInt(eventIdParam)
		if (isNaN(eventId)) {
			return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })
		}

		const eventData = await realTimeStatusService.getEventData(eventId)

		return NextResponse.json({
			success: true,
			data: eventData,
		})
	} catch (error) {
		console.error('Error fetching event data:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch event data' },
			{ status: 500 }
		)
	}
} 