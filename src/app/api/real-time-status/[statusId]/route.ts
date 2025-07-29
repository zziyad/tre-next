import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/backend/container'
import { getSessionFromCookie } from '@/lib/auth'
import { createRealTimeStatusSchema } from '@/backend/validation/schemas'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ statusId: string }> }
) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { statusId: statusIdParam } = await params
		const statusId = parseInt(statusIdParam)
		
		if (isNaN(statusId)) {
			return NextResponse.json(
				{ error: 'Invalid status ID' },
				{ status: 400 }
			)
		}

		const result = await container.realTimeStatusService.getStatusById(statusId)
		
		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: 404 }
			)
		}

		return NextResponse.json({
			success: true,
			data: result.data
		})
	} catch (error) {
		console.error('Error fetching real-time status:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch real-time status' },
			{ status: 500 }
		)
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ statusId: string }> }
) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { statusId: statusIdParam } = await params
		const statusId = parseInt(statusIdParam)
		
		if (isNaN(statusId)) {
			return NextResponse.json(
				{ error: 'Invalid status ID' },
				{ status: 400 }
			)
		}

		const body = await request.json()
		const validationResult = createRealTimeStatusSchema.safeParse(body)

		if (!validationResult.success) {
			return NextResponse.json(
				{ error: 'Invalid input data', details: validationResult.error.issues },
				{ status: 400 }
			)
		}

		const result = await container.realTimeStatusService.updateStatus(statusId, {
			vehicleCode: validationResult.data.vehicle_code,
			hotelName: validationResult.data.hotel_name,
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
		console.error('Error updating real-time status:', error)
		return NextResponse.json(
			{ error: 'Failed to update real-time status' },
			{ status: 500 }
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ statusId: string }> }
) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { statusId: statusIdParam } = await params
		const statusId = parseInt(statusIdParam)
		
		if (isNaN(statusId)) {
			return NextResponse.json(
				{ error: 'Invalid status ID' },
				{ status: 400 }
			)
		}

		const result = await container.realTimeStatusService.deleteStatus(statusId)
		
		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: 404 }
			)
		}

		return NextResponse.json({
			success: true
		})
	} catch (error) {
		console.error('Error deleting real-time status:', error)
		return NextResponse.json(
			{ error: 'Failed to delete real-time status' },
			{ status: 500 }
		)
	}
} 