import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/backend/container'
import { getSessionFromCookie } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string, flightId: string } }
) {
  try {
    const { eventId, flightId } = params
    const eventIdNum = parseInt(eventId)
    const flightIdNum = parseInt(flightId)
    if (isNaN(eventIdNum) || isNaN(flightIdNum)) {
      return NextResponse.json({ success: false, error: 'Invalid event or flight ID' }, { status: 400 })
    }

    const user = await getSessionFromCookie()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body
    const allowedStatuses = ['Arrived', 'Delay', 'No show', 'Re scheduled', 'pending']
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status value' }, { status: 400 })
    }

    // Update status only
    const updated = await container.flightScheduleService.updateFlightSchedule(
      flightIdNum,
      { status }
    )
    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update status'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
} 