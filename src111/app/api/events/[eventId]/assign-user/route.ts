import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

export async function POST(
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

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { event_id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if relationship already exists
    const existingRelation = await prisma.eventUser.findFirst({
      where: {
        event_id: eventId,
        user_id: user.user_id,
      },
    });

    if (existingRelation) {
      return NextResponse.json({ 
        message: 'User already assigned to event',
        eventUser: existingRelation 
      });
    }

    // Create the relationship
    const eventUser = await prisma.eventUser.create({
      data: {
        event_id: eventId,
        user_id: user.user_id,
      },
    });

    return NextResponse.json({ 
      message: 'User assigned to event successfully',
      eventUser 
    });
  } catch (error) {
    console.error('Error assigning user to event:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 