import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getSessionFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get events through the EventUser relationship
    const eventUsers = await prisma.eventUser.findMany({
      where: {
        user_id: user.user_id
      },
      include: {
        event: true
      }
    });

    // Extract events with explicit typing
    const events = eventUsers.map((eventUser: any) => eventUser.event);

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 