import { NextRequest, NextResponse } from 'next/server'
import { realTimeStatusService } from '@/backend/services/real-time-status.service'
import { getSessionFromCookie } from '@/lib/auth'

export async function GET(request: NextRequest) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const eventId = searchParams.get('eventId')

		if (!eventId) {
			return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
		}

		const statuses = await realTimeStatusService.getStatuses(parseInt(eventId))

		return NextResponse.json({
			success: true,
			statuses,
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
		console.log('Received POST request body:', body)
		const { eventId, vehicleCode, hotelName, destination, status } = body

		if (!eventId || !vehicleCode || !hotelName || !destination || !status) {
			console.log('Missing required fields:', { eventId, vehicleCode, hotelName, destination, status })
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			)
		}

		console.log('Creating status with data:', {
			eventId: parseInt(eventId),
			vehicleCode,
			hotelName,
			destination,
			status,
		})

		const newStatus = await realTimeStatusService.createStatus({
			eventId: parseInt(eventId),
			vehicleCode,
			hotelName,
			destination,
			status,
		})

		console.log('Successfully created status:', newStatus)

		return NextResponse.json({
			success: true,
			data: newStatus,
		})
	} catch (error) {
		console.error('Error creating real-time status:', error)
		return NextResponse.json(
			{ error: 'Failed to create real-time status' },
			{ status: 500 }
		)
	}
} 