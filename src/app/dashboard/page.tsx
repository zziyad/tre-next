'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, LogOut, Plus, Settings } from 'lucide-react';
import { toast } from 'sonner';
import CreateEventModal from '@/components/events/CreateEventModal';
import { useAuth } from '@/frontend/hooks/useAuth';
import { useEvents } from '@/frontend/hooks/useEvents';
import { DefaultLayout } from '@/components/layout/DefaultLayout';

export default function EventsListPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { events, createEvent, refreshEvents, isLoading: eventsLoading, error } = useEvents();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleEventClick = (eventId: number) => {
    window.location.href = `/events/${eventId}`;
  };

  const handleEventCreated = () => {
    refreshEvents();
  };

  if (authLoading || eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <DefaultLayout
      title="Transport Events"
      subtitle="Welcome back, manage your events"
      showSidebar={false}
      showMenuToggle={false}
    >
      {/* User Info */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 w-full">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transport Events</h1>
            <p className="text-gray-600 text-sm sm:text-base">Welcome back, {user.name} {user.surname}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Badge variant="secondary" className="text-center">
              {user.role || 'User'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/settings'}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

      {/* Main Content */}
      <main className="w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 lg:mb-8 gap-4 w-full">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Events</h2>
            <p className="text-gray-600 text-sm lg:text-base">Select an event to manage its details</p>
          </div>
          <div className="w-full sm:w-auto">
            <CreateEventModal onEventCreated={handleEventCreated} />
          </div>
        </div>

        {events.length > 0 ? (
          <div className="grid w-full gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card 
                key={event.event_id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
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
                <CardContent className="flex-1 flex flex-col justify-end">
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
          <div className="flex justify-center items-center w-full">
            <Card className="text-center py-12 w-full max-w-xl">
              <CardContent>
                <div className="mx-auto">
                  <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-600 mb-8">
                    Get started by creating your first transport event. You&apos;ll be able to manage 
                    fleet markers, hotels, destinations, and more.
                  </p>
                  <CreateEventModal onEventCreated={handleEventCreated} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </DefaultLayout>
  );
} 