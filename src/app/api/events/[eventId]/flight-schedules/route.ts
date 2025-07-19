import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/backend/container';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId: eventIdStr } = await params;
    const eventId = parseInt(eventIdStr);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const flightSchedules = await container.flightScheduleService.getFlightSchedulesByEventId(eventId);

    return NextResponse.json({
      success: true,
      data: flightSchedules,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get flight schedules';
    console.error('Flight schedules GET error:', error);
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 