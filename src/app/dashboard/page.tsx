'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, LogOut, Plus } from 'lucide-react';
import { toast } from 'sonner';
import CreateEventModal from '@/components/events/CreateEventModal';

interface User {
  id: number;
  username: string;
  role?: string;
}

interface Event {
  event_id: number;
  name: string;
  start_date?: Date;
  end_date?: Date;
  description?: string;
}

export default function EventsListPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const eventsResponse = await fetch('/api/events');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        const data = await response.json();
        setUser(data.user);

        await fetchEvents();
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleEventClick = (eventId: number) => {
    router.push(`/events/${eventId}`);
  };

  const handleEventCreated = () => {
    fetchEvents();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transport Events</h1>
              <p className="text-gray-600">Welcome back, {user.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {user.role || 'User'}
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Events</h2>
            <p className="text-gray-600">Select an event to manage its details</p>
          </div>
          <CreateEventModal onEventCreated={handleEventCreated} />
        </div>

        {events.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card 
                key={event.event_id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() => handleEventClick(event.event_id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{event.name}</CardTitle>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  {event.description && (
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(event.start_date || event.end_date) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {event.start_date && new Date(event.start_date).toLocaleDateString()}
                          {event.start_date && event.end_date && ' - '}
                          {event.end_date && new Date(event.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <Button variant="ghost" size="sm" className="w-full">
                        Open Event Dashboard →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="max-w-md mx-auto">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
                <p className="text-gray-600 mb-8">
                  Get started by creating your first transport event. You'll be able to manage 
                  fleet markers, hotels, destinations, and more.
                </p>
                <CreateEventModal onEventCreated={handleEventCreated} />
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
} 