'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  Settings,
  Users,
  Plane,
  Clock,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { DefaultLayout } from '@/components/layout/DefaultLayout';

interface Event {
  event_id: number;
  name: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  created_at: string;
}

interface FlightSchedule {
  flight_id: number;
  first_name: string;
  last_name: string;
  flight_number: string;
  arrival_time: string;
  departure_time: string;
  property_name: string;
  status: string;
}

export default function EventDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [flights, setFlights] = useState<FlightSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Define sidebar items with Dashboard as active
  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', active: true, href: `/events/${eventId}` },
    { icon: Calendar, label: 'Flight Schedule', active: false, href: `/events/${eventId}/flight-schedules` },
    { icon: FileText, label: 'Transport Reports', active: false, href: `/events/${eventId}/transport-reports` },
    { icon: Clock, label: 'Real-time Status', active: false, href: `/events/${eventId}/status` },
    { icon: Users, label: 'Passengers', active: false, href: `/events/${eventId}/passengers` },
    { icon: FileText, label: 'Documents', active: false, href: `/events/${eventId}/documents` },
    { icon: Settings, label: 'Settings', active: false, href: `/events/${eventId}/settings` }
  ];

  const handleAssignUser = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/assign-user`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast.success('User assigned to event successfully');
        // Refresh the page to reload event data
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to assign user to event');
      }
    } catch (error) {
      console.error('Error assigning user:', error);
      toast.error('Failed to assign user to event');
    }
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        console.log('Fetching event data for ID:', eventId);
        
        // First, check if we have a valid session
        try {
          const sessionResponse = await fetch('/api/debug/session', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const sessionData = await sessionResponse.json();
          console.log('Session status:', sessionData);
          
          if (!sessionData.authenticated) {
            throw new Error('User is not authenticated. Please log in again.');
          }
        } catch (sessionError) {
          console.error('Session check failed:', sessionError);
          throw new Error('Authentication check failed. Please refresh the page and log in again.');
        }
        
        // Fetch real event data from API
        const eventResponse = await fetch(`/api/events/${eventId}`, {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Event response status:', eventResponse.status);
        
        if (!eventResponse.ok) {
          const errorData = await eventResponse.json().catch(() => ({}));
          console.error('Event API error:', errorData);
          
          // If access denied (404), try to assign user to event
          if (eventResponse.status === 404 && errorData.error?.includes('access denied')) {
            console.log('Access denied, trying to assign user to event...');
            try {
              const assignResponse = await fetch(`/api/events/${eventId}/assign-user`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              
              if (assignResponse.ok) {
                console.log('User assigned successfully, retrying event fetch...');
                // Retry the original request
                const retryResponse = await fetch(`/api/events/${eventId}`, {
                  method: 'GET',
                  credentials: 'include',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                
                if (retryResponse.ok) {
                  const retryData = await retryResponse.json();
                  if (retryData.event) {
                    setEvent(retryData.event);
                    console.log('Event fetched successfully after assignment:', retryData.event);
                    return; // Success, skip the error handling
                  }
                }
              }
            } catch (assignError) {
              console.error('Failed to assign user to event:', assignError);
            }
          }
          
          throw new Error(errorData.error || `HTTP ${eventResponse.status}: Failed to fetch event data`);
        }
        
        const eventData = await eventResponse.json();
        console.log('Event data received:', eventData);
        
        if (eventData.event) {
        setEvent(eventData.event);
          console.log('Event set successfully:', eventData.event);
        } else {
          console.error('No event data in response:', eventData);
          throw new Error('No event data received from server');
        }

        // Fetch event statistics
        try {
          const statsResponse = await fetch(`/api/events/${eventId}/stats`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
            console.log('Stats data received:', statsData);
            // Update stats if needed
          }
        } catch (statsError) {
          console.warn('Failed to fetch stats:', statsError);
          // Don't fail the whole component if stats fail
        }

        // Mock flight data for now - replace with actual API when available
        setFlights([
          {
            flight_id: 1,
            first_name: 'John',
            last_name: 'Doe',
            flight_number: 'AA123',
            arrival_time: '2025-01-15T14:30:00',
            departure_time: '2025-01-20T16:45:00',
            property_name: 'Business Manager',
            status: 'Scheduled'
          },
          {
            flight_id: 2,
            first_name: 'Sarah',
            last_name: 'Johnson',
            flight_number: 'BA456',
            arrival_time: '2025-01-15T10:15:00',
            departure_time: '2025-01-20T14:30:00',
            property_name: 'Project Director',
            status: 'Confirmed'
          },
          {
            flight_id: 3,
            first_name: 'Michael',
            last_name: 'Chen',
            flight_number: 'LH789',
            arrival_time: '2025-01-15T18:45:00',
            departure_time: '2025-01-20T12:20:00',
            property_name: 'Senior Consultant',
            status: 'In Transit'
          }
        ]);
      } catch (error: unknown) {
        console.error('Error fetching event data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load event data';
        toast.error(errorMessage);
        
        // Set fallback data so the component doesn't break
        const fallbackMessage = error instanceof Error ? error.message : 'Failed to load event data';
        setEvent({
          event_id: parseInt(eventId),
          name: fallbackMessage.includes('authenticated') ? 'Authentication Required' : 'Event Not Found',
          description: fallbackMessage,
          created_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const statsCards = [
    {
      title: 'Total Flights Today',
      value: '24',
      subtitle: '8 arrivals, 16 departures',
      icon: Plane,
      color: 'text-blue-600'
    },
    {
      title: 'Passengers',
      value: '156',
      subtitle: 'Currently in transit',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'On Time',
      value: '92%',
      subtitle: 'Flight punctuality rate',
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      title: 'Active Schedules',
      value: '18',
      subtitle: 'Scheduled for today',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <DefaultLayout
      eventId={eventId}
      title="Event Dashboard"
      subtitle="Manage event details and flight schedules"
      sidebarItems={sidebarItems}
    >
      {/* Event Header */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Current Event</span>
              </div>
              <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {event?.name || 'Loading Event...'}
              </h2>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                {event?.description || 'Loading event information...'}
              </p>
              {(event?.name === 'Event Not Found' || event?.name === 'Authentication Required') && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-3">
                    {event?.description}
                  </p>
                  <div className="flex gap-2">
                    {event?.name === 'Authentication Required' ? (
                      <Button 
                        onClick={() => router.push('/login')}
                        variant="outline" 
                        size="sm"
                        className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
                      >
                        Login Again
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleAssignUser}
                        variant="outline" 
                        size="sm"
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
                      >
                        Try to Fix Access
                      </Button>
                    )}
                    <Button 
                      onClick={() => window.location.reload()}
                      variant="outline" 
                      size="sm"
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
                    >
                      Refresh Page
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {event?.start_date && (
            <div className="flex items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
              <Clock className="h-4 w-4 mr-2" />
              <span>Created: {new Date(event.created_at).toLocaleDateString()}</span>
              {event.start_date && (
                <>
                  <span className="mx-2">•</span>
                  <span>Starts: {new Date(event.start_date).toLocaleDateString()}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8 w-full">
        {statsCards.map((card, index) => (
          <Card key={index} className="bg-white hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 h-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide truncate">{card.title}</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 truncate">{card.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500 leading-tight line-clamp-2">{card.subtitle}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner ml-2 sm:ml-4 flex-shrink-0`}>
                  <card.icon className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Flight Schedule</h3>
            <p className="text-sm text-gray-600">Manage and view all flight information</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center space-x-2 hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              <span>Show Filters</span>
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Add Flight
            </Button>
          </div>
        </div>
      </div>

      {/* Flight Schedule */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Flight Schedule Details</h3>
              <p className="text-sm text-gray-600">
                {flights.length} {flights.length === 1 ? 'flight' : 'flights'} scheduled
              </p>
            </div>
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Entry
            </Button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-4">
          {flights.map((flight) => (
            <div key={flight.flight_id} className="bg-gray-50 rounded-lg p-4 mb-4 last:mb-0 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{flight.first_name} {flight.last_name}</h4>
                  <p className="text-sm text-gray-600 font-medium">{flight.property_name}</p>
                </div>
                <Badge className={`px-3 py-1 font-semibold ${
                  flight.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                  flight.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                  flight.status === 'In Transit' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {flight.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-2">Arrival</p>
                  <p className="text-gray-900 font-bold text-sm">{flight.flight_number}</p>
                  <p className="text-gray-600 text-xs">{new Date(flight.arrival_time).toLocaleDateString()}</p>
                  <p className="text-gray-600 text-xs font-medium">{new Date(flight.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-2">Departure</p>
                  <p className="text-gray-900 font-bold text-sm">AA456</p>
                  <p className="text-gray-600 text-xs">{new Date(flight.departure_time).toLocaleDateString()}</p>
                  <p className="text-gray-600 text-xs font-medium">{new Date(flight.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-2">Transport Details</p>
                <p className="text-gray-900 font-bold text-sm">AZ-123-AA</p>
                <p className="text-gray-600 text-xs">Mehmet Aliyev • +994-50-123-4567</p>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  ID: #{flight.flight_id}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="px-3 py-1.5 hover:bg-blue-50 hover:border-blue-200">
                    <Eye className="h-3 w-3 mr-1" />
                    <span className="text-xs">View</span>
                  </Button>
                  <Button variant="outline" size="sm" className="px-3 py-1.5 hover:bg-green-50 hover:border-green-200">
                    <Edit className="h-3 w-3 mr-1" />
                    <span className="text-xs">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" className="px-3 py-1.5 text-red-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700">
                    <Trash2 className="h-3 w-3 mr-1" />
                    <span className="text-xs">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Passenger</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Country</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Designation</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Arrival</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Departure</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Transport</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {flights.map((flight) => (
                <tr key={flight.flight_id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-full mr-3">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {flight.first_name} {flight.last_name}
                        </div>
                        <div className="text-xs text-gray-500">ID: #{flight.flight_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">United States</div>
                    <div className="text-xs text-gray-500">USA</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{flight.property_name}</div>
                    <div className="text-xs text-gray-500">Role</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{flight.flight_number}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(flight.arrival_time).toLocaleDateString()} • {new Date(flight.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="text-sm text-gray-500">From: New York</div>
                    <div className="text-sm text-gray-500">Terminal 1</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">AA456</div>
                    <div className="text-sm text-gray-500">
                      {new Date(flight.departure_time).toLocaleDateString()} • {new Date(flight.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="text-sm text-gray-500">To: New York</div>
                    <div className="text-sm text-gray-500">Terminal 1</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">AZ-123-AA</div>
                    <div className="text-sm text-gray-500">Mehmet Aliyev</div>
                    <div className="text-sm text-gray-500">+994-50-123-4567</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Badge className={`px-3 py-1 font-semibold rounded-full ${
                      flight.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      flight.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      flight.status === 'In Transit' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {flight.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="px-3 py-1.5 hover:bg-blue-50 hover:border-blue-200">
                        <Eye className="h-3 w-3 mr-1" />
                        <span className="text-xs">View</span>
                      </Button>
                      <Button variant="outline" size="sm" className="px-3 py-1.5 hover:bg-green-50 hover:border-green-200">
                        <Edit className="h-3 w-3 mr-1" />
                        <span className="text-xs">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm" className="px-3 py-1.5 text-red-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700">
                        <Trash2 className="h-3 w-3 mr-1" />
                        <span className="text-xs">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DefaultLayout>
  );
} 