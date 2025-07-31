import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie, hasPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has dashboard access permission
    const hasDashboardAccess = await hasPermission(session.user_id, 'dashboard:access');
    if (!hasDashboardAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Required: dashboard:access' },
        { status: 403 }
      );
    }

    // Check if user has events read permission
    const hasEventsRead = await hasPermission(session.user_id, 'events:read');
    
    let events: any[] = [];
    
    if (hasEventsRead) {
      // Get all events that the user has access to
      // For now, show all events if user has events:read permission
      // This can be refined later with more specific access controls
      events = await prisma.event.findMany({
        take: 10, // Increased limit to show more events
        orderBy: { created_at: 'desc' },
        select: {
          event_id: true,
          name: true,
          start_date: true,
          end_date: true,
          description: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          user_id: session.user_id,
          username: session.username,
          email: session.email,
          is_active: session.is_active,
          permissions: session.permissions,
        },
        events: events.map(event => ({
          ...event,
          start_date: event.start_date?.toISOString(),
          end_date: event.end_date?.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 