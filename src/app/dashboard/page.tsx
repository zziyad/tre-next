'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/Container';
import { toast } from 'sonner';
import { Loader2, Calendar, Plus, LogOut, Shield, AlertCircle } from 'lucide-react';
import CreateEventModal from '@/components/events/CreateEventModal';

interface User {
  user_id: number;
  username: string;
  email: string;
  is_active: boolean;
  permissions: string[];
}

interface Event {
  event_id: number;
  name: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface DashboardData {
  user: User;
  events: Event[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 403) {
          const errorData = await response.json();
          setError(errorData.error || 'Access denied');
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      toast.error('An error occurred during logout');
    }
  };

  const handleEventCreated = () => {
    // Refresh the dashboard data after event creation
    fetchDashboardData();
  };

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please contact your administrator to request access to the dashboard.
          </p>
          <Button onClick={handleLogout} className="mt-4">
            Logout
          </Button>
        </div>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">No Data</h1>
          <p className="text-gray-500">No dashboard data available.</p>
        </div>
      </Container>
    );
  }

  const { user, events } = data;
  const hasEventsRead = user.permissions.includes('events:read');
  console.log({user, events, hasEventsRead});

  return (
    <Container>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.username}!</h1>
          <p className="text-gray-600 mt-2">
            Manage transport events and reports
          </p>
        </div>
        <div className="flex gap-2">
          {user.permissions.includes('users:admin') && (
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin Panel
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Events Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transport Events</CardTitle>
            <CardDescription>
              All transport events you have access to
            </CardDescription>
          </div>
          {user.permissions.includes('users:admin') && (
            <CreateEventModal onEventCreated={handleEventCreated} />
          )}
        </CardHeader>
        <CardContent>
          {!hasEventsRead ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Event Access</h3>
              <p className="text-gray-600 mb-4">
                You don't have permission to view events. Please contact your administrator.
              </p>
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.event_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium">{event.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {event.start_date && new Date(event.start_date).toLocaleDateString()}
                      {event.start_date && event.end_date && ' - '}
                      {event.end_date && new Date(event.end_date).toLocaleDateString()}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/events/${event.event_id}`)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events available</h3>
              <p className="text-gray-600 mb-4">
                No transport events are currently available in the system.
              </p>
              {user.permissions.includes('users:admin') && (
                <CreateEventModal onEventCreated={handleEventCreated} />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
} 