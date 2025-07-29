import { NextRequest, NextResponse } from 'next/server'
import { realTimeStatusService } from '@/backend/services/real-time-status.service'
import { getSessionFromCookie } from '@/lib/auth'

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
			return NextResponse.json({ error: 'Invalid status ID' }, { status: 400 })
		}

		const status = await realTimeStatusService.getStatus(statusId)
		if (!status) {
			return NextResponse.json({ error: 'Status not found' }, { status: 404 })
		}

		return NextResponse.json({
			success: true,
			data: status,
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
			return NextResponse.json({ error: 'Invalid status ID' }, { status: 400 })
		}

		const body = await request.json()
		const { vehicleCode, hotelName, destination, status } = body

		const updatedStatus = await realTimeStatusService.updateStatus(statusId, {
			vehicleCode,
			hotelName,
			destination,
			status,
		})

		return NextResponse.json({
			success: true,
			data: updatedStatus,
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
			return NextResponse.json({ error: 'Invalid status ID' }, { status: 400 })
		}

		await realTimeStatusService.deleteStatus(statusId)

		return NextResponse.json({
			success: true,
			message: 'Status deleted successfully',
		})
	} catch (error) {
		console.error('Error deleting real-time status:', error)
		return NextResponse.json(
			{ error: 'Failed to delete real-time status' },
			{ status: 500 }
		)
	}
} 