import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = await getSessionFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { eventId: eventIdStr } = await params;
    const eventId = parseInt(eventIdStr);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Check if user has access to this event
    const eventUser = await prisma.eventUser.findFirst({
      where: {
        event_id: eventId,
        user_id: user.user_id,
      },
    });

    if (!eventUser) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch statistics for the event
    const [flets, hotels, destinations, flight_schedules, transport_reports] = await Promise.all([
      prisma.flet.count({ where: { event_id: eventId } }),
      prisma.hotel.count({ where: { event_id: eventId } }),
      prisma.destination.count({ where: { event_id: eventId } }),
      prisma.flightSchedule.count({ where: { event_id: eventId } }),
      prisma.transportReport.count({ where: { event_id: eventId } }),
    ]);

    const stats = {
      flets,
      hotels,
      destinations,
      flight_schedules,
      transport_reports,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 