'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Building, 
  Truck, 
  FileText, 
  Settings,
  BarChart3,
  Clock,
  Plane,
  Users,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  event_id: number;
  name: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  created_at: string;
}

interface EventStats {
  flets: number;
  hotels: number;
  destinations: number;
  flight_schedules: number;
  transport_reports: number;
}

interface EventDetails {
  flets: Array<{ flet_id: number; name: string; description?: string }>;
  hotels: Array<{ hotel_id: number; name: string; description?: string }>;
  destinations: Array<{ destination_id: number; name: string; description?: string }>;
}

export default function EventDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [details, setDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Fetch event details
        const eventResponse = await fetch(`/api/events/${eventId}`);
        if (!eventResponse.ok) {
          throw new Error('Event not found');
        }
        const eventData = await eventResponse.json();
        setEvent(eventData.event);

        // Fetch event stats
        const statsResponse = await fetch(`/api/events/${eventId}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }

        // Fetch event details (flets, hotels, destinations)
        const detailsResponse = await fetch(`/api/events/${eventId}/details`);
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          setDetails(detailsData);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load event');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-8 w-px" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const managementCards = [
    {
      title: 'Fleet Markers',
      description: 'Manage transport markers and vehicle assignments',
      icon: Truck,
      count: stats?.flets || 0,
      href: `/events/${eventId}/flets`,
      color: 'bg-blue-500',
      items: details?.flets || [],
    },
    {
      title: 'Hotels',
      description: 'Manage hotel information and accommodations',
      icon: Building,
      count: stats?.hotels || 0,
      href: `/events/${eventId}/hotels`,
      color: 'bg-green-500',
      items: details?.hotels || [],
    },
    {
      title: 'Destinations',
      description: 'Manage destination points and locations',
      icon: MapPin,
      count: stats?.destinations || 0,
      href: `/events/${eventId}/destinations`,
      color: 'bg-purple-500',
      items: details?.destinations || [],
    },
    {
      title: 'Flight Schedules',
      description: 'Manage flight arrivals and departures',
      icon: Plane,
      count: stats?.flight_schedules || 0,
      href: `/events/${eventId}/flights`,
      color: 'bg-orange-500',
      items: [],
    },
    {
      title: 'Transport Reports',
      description: 'View and manage transport reports',
      icon: FileText,
      count: stats?.transport_reports || 0,
      href: `/events/${eventId}/reports`,
      color: 'bg-red-500',
      items: [],
    },
    {
      title: 'Real-time Status',
      description: 'Monitor real-time transport status',
      icon: BarChart3,
      count: 0,
      href: `/events/${eventId}/realtime`,
      color: 'bg-indigo-500',
      items: [],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
                {event.description && (
                  <p className="text-gray-600 mt-1">{event.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Active
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
          
          {/* Event Metadata */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(event.start_date || event.end_date) && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Event Period</p>
                  <p className="text-sm text-blue-700">
                    {event.start_date && new Date(event.start_date).toLocaleDateString()}
                    {event.start_date && event.end_date && ' - '}
                    {event.end_date && new Date(event.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Info className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-sm text-gray-700">
                  {new Date(event.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Total Components</p>
                <p className="text-sm text-purple-700">
                  {(stats?.flets || 0) + (stats?.hotels || 0) + (stats?.destinations || 0)} items
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Event Management</h2>
          <p className="text-gray-600">Manage all aspects of your transport event</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {managementCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card 
                key={card.title}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
                onClick={() => router.push(card.href)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${card.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                      <IconComponent className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
                    </div>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {card.count}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-xl mb-2 group-hover:text-gray-900 transition-colors">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="mb-4">
                    {card.description}
                  </CardDescription>
                  
                  {card.items.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recent Items
                      </p>
                      <div className="space-y-1">
                        {card.items.slice(0, 3).map((item: any, index) => (
                          <div key={index} className="text-sm text-gray-600 truncate">
                            • {item.name}
                          </div>
                        ))}
                        {card.items.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{card.items.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button variant="ghost" size="sm" className="w-full group-hover:bg-gray-100">
                    Manage {card.title} →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Event Overview
              </CardTitle>
              <CardDescription>Quick statistics and summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats?.flets || 0}</div>
                    <div className="text-sm text-blue-700">Fleet Markers</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats?.hotels || 0}</div>
                    <div className="text-sm text-green-700">Hotels</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats?.destinations || 0}</div>
                    <div className="text-sm text-purple-700">Destinations</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats?.flight_schedules || 0}</div>
                    <div className="text-sm text-orange-700">Flight Schedules</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Event created</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {stats && (stats.flets > 0 || stats.hotels > 0 || stats.destinations > 0) && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">Event components added</p>
                      <p className="text-xs text-gray-500">
                        {stats.flets} fleet markers, {stats.hotels} hotels, {stats.destinations} destinations
                      </p>
                    </div>
                  </div>
                )}
                {(!stats || (stats.flets === 0 && stats.hotels === 0 && stats.destinations === 0)) && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 