import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

interface CreateEventRequest {
  name: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  flets: Array<{
    name: string;
    description?: string;
  }>;
  hotels: Array<{
    name: string;
    description?: string;
  }>;
  destinations: Array<{
    name: string;
    description?: string;
  }>;
}

export async function POST(request: Request) {
  try {
    const user = await getSessionFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body: CreateEventRequest = await request.json();
    const { name, start_date, end_date, description, flets, hotels, destinations } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Create event with related data in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the event
      const event = await tx.event.create({
        data: {
          name,
          start_date: start_date ? new Date(start_date) : null,
          end_date: end_date ? new Date(end_date) : null,
          description,
          created_at: new Date(),
        },
      });

      // Associate user with event
      await tx.eventUser.create({
        data: {
          event_id: event.event_id,
          user_id: user.user_id,
        },
      });

      // Create fleet markers
      if (flets && flets.length > 0) {
        await tx.flet.createMany({
          data: flets.map((flet: any) => ({
            event_id: event.event_id,
            name: flet.name,
            description: flet.description,
            created_at: new Date(),
          })),
        });
      }

      // Create hotels
      if (hotels && hotels.length > 0) {
        await tx.hotel.createMany({
          data: hotels.map((hotel: any) => ({
            event_id: event.event_id,
            name: hotel.name,
            description: hotel.description,
            created_at: new Date(),
          })),
        });
      }

      // Create destinations
      if (destinations && destinations.length > 0) {
        await tx.destination.createMany({
          data: destinations.map((destination: any) => ({
            event_id: event.event_id,
            name: destination.name,
            description: destination.description,
            created_at: new Date(),
          })),
        });
      }

      return event;
    });

    return NextResponse.json({ event: result }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 