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

    // Fetch event details
    const [flets, hotels, destinations] = await Promise.all([
      prisma.flet.findMany({
        where: { event_id: eventId },
        select: {
          flet_id: true,
          name: true,
          description: true,
        },
      }),
      prisma.hotel.findMany({
        where: { event_id: eventId },
        select: {
          hotel_id: true,
          name: true,
          description: true,
        },
      }),
      prisma.destination.findMany({
        where: { event_id: eventId },
        select: {
          destination_id: true,
          name: true,
          description: true,
        },
      }),
    ]);

    return NextResponse.json({
      flets,
      hotels,
      destinations,
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 