'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, FileSpreadsheet, Calendar, Plane, Building, Car } from 'lucide-react';
import { useFlightSchedules } from '@/frontend/hooks/useFlightSchedules';
import { toast } from 'sonner';
import { DefaultLayout } from '@/components/layout/DefaultLayout';
import { BarChart3, Calendar as CalendarIcon, FileText, Clock, Users, Settings } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export default function FlightSchedulesPage() {
  const params = useParams();
  const eventId = parseInt(params.eventId as string);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    schedules,
    isLoading,
    isUploading,
    error,
    uploadSchedules,
    downloadSchedules,
  } = useFlightSchedules({ eventId });

  // Debug: Log raw schedules data before formatting
  console.log('Raw schedules data:', schedules)

  // Define sidebar items with Flight Schedule as active
  const sidebarItems = [
    { icon: BarChart3, label: 'Dashboard', active: false, href: `/events/${eventId}` },
    { icon: CalendarIcon, label: 'Flight Schedule', active: true, href: `/events/${eventId}/flight-schedules` },
    { icon: FileText, label: 'Transport Reports', active: false, href: `/events/${eventId}/reports` },
    { icon: Clock, label: 'Real-time Status', active: false, href: `/events/${eventId}/status` },
    { icon: Users, label: 'Passengers', active: false, href: `/events/${eventId}/passengers` },
    { icon: FileText, label: 'Documents', active: false, href: `/events/${eventId}/documents` },
    { icon: Settings, label: 'Settings', active: false, href: `/events/${eventId}/settings` }
  ];

  const STATUS_OPTIONS = [
    { value: 'Arrived', label: 'Arrived', color: 'bg-green-100 text-green-800' },
    { value: 'Delay', label: 'Delay', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'No show', label: 'No show', color: 'bg-red-100 text-red-800' },
    { value: 'Re scheduled', label: 'Re scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  ]

  const getStatusBadgeColor = (status: string) => {
    const found = STATUS_OPTIONS.find(opt => opt.value.toLowerCase() === status.toLowerCase())
    return found ? found.color : 'bg-gray-100 text-gray-800'
  }

  const [statusUpdating, setStatusUpdating] = useState<{ [flightId: number]: boolean }>({})
  const [localSchedules, setLocalSchedules] = useState(schedules)

  useEffect(() => {
    setLocalSchedules(schedules)
  }, [schedules])

  const handleStatusChange = (flightId: number, newStatus: string) => {
    toast.custom((t) => (
      <div className="fixed left-1/2 top-1/3 z-50 -translate-x-1/2 rounded-lg bg-white shadow-lg p-6 min-w-[280px] flex flex-col items-center">
        <div className="font-medium mb-2">Change status to <span className={getStatusBadgeColor(newStatus) + ' px-2 py-1 rounded'}>{newStatus}</span>?</div>
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            onClick={async () => {
              toast.dismiss(t)
              setStatusUpdating(prev => ({ ...prev, [flightId]: true }))
              try {
                const res = await fetch(`/api/events/${eventId}/flight-schedules/${flightId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: newStatus }),
                })
                if (!res.ok) throw new Error('Failed to update status')
                toast.success('Status updated')
                // Update local state for immediate UI feedback
                setLocalSchedules(prev => prev.map(s => s.flight_id === flightId ? { ...s, status: newStatus } : s))
              } catch (err) {
                toast.error('Failed to update status')
              } finally {
                setStatusUpdating(prev => ({ ...prev, [flightId]: false }))
              }
            }}
            disabled={statusUpdating[flightId]}
          >Confirm</Button>
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t)}>Cancel</Button>
        </div>
      </div>
    ), { duration: 10000, position: 'top-center' })
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    await uploadSchedules(file);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const formatDateTime = (dateTime: Date | string) => {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateTime: Date | string) => {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DefaultLayout
      eventId={eventId.toString()}
      title="Flight Schedules"
      subtitle="Upload and manage flight schedule data"
      showBackButton={true}
      backUrl={`/events/${eventId}`}
      sidebarItems={sidebarItems}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 px-2 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Flight Schedules</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage flight schedules and passenger information</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSchedules}
            disabled={isLoading || schedules.length === 0}
            className="w-full sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download Schedules
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Flight Schedule
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Upload an Excel file with flight schedule information. The file should contain columns for First Name, Last Name, Flight Number, Arrival Date, Arrival Time, Property Name, Vehicle Standby, Departure Date, Departure Time, and Vehicle Standby.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {isUploading ? 'Uploading...' : 'Upload Excel File'}
            </h3>
            <p className="text-gray-600 mb-4 text-xs sm:text-sm">
              Drag and drop your Excel file here, or click to browse
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mb-2 w-full sm:w-auto"
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
            <p className="text-xs text-gray-500">
              Supports .xlsx and .xls files up to 10MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Statistics */}
      {schedules.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 my-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{schedules.length}</p>
                  <p className="text-sm text-gray-600">Total Passengers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(schedules.map(s => s.flight_number)).size}
                  </p>
                  <p className="text-sm text-gray-600">Unique Flights</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(schedules.map(s => s.property_name)).size}
                  </p>
                  <p className="text-sm text-gray-600">Properties</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(schedules.map(s => new Date(s.arrival_time).toDateString())).size}
                  </p>
                  <p className="text-sm text-gray-600">Travel Dates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Flight Schedules Table/Card List */}
      <Card>
        <CardHeader>
          <CardTitle>Flight Schedules</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading schedules...' : `${schedules.length} flight schedules found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No flight schedules found. Upload an Excel file to get started.
            </div>
          ) : (
            <>
              {/* Mobile Card List */}
              <div className="block sm:hidden space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule.flight_id} className="rounded-lg border p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-base">{`${schedule.first_name} ${schedule.last_name}`}</span>
                      <Badge variant="outline">{schedule.flight_number}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">Property: {schedule.property_name}</div>
                    <div className="flex flex-col gap-1 mb-1">
                      <div>
                        <span className="font-semibold">Arrival:</span> {formatDateTime(schedule.arrival_time)}
                        <span className="ml-2 text-xs text-gray-400">Vehicle: {formatTime(schedule.vehicle_standby_arrival_time)}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Departure:</span> {formatDateTime(schedule.departure_time)}
                        <span className="ml-2 text-xs text-gray-400">Vehicle: {formatTime(schedule.vehicle_standby_departure_time)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Car className="h-4 w-4 text-gray-500" />
                      <span className="text-xs">Standby</span>
                      <Badge className={getStatusBadgeColor(schedule.status) + ' ml-auto'}>
                        <Select
                          value={schedule.status}
                          onValueChange={val => handleStatusChange(schedule.flight_id, val)}
                          disabled={statusUpdating[schedule.flight_id]}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Passenger</th>
                      <th className="text-left p-3 font-medium">Flight</th>
                      <th className="text-left p-3 font-medium">Arrival</th>
                      <th className="text-left p-3 font-medium">Departure</th>
                      <th className="text-left p-3 font-medium">Property</th>
                      <th className="text-left p-3 font-medium">Vehicle Standby (Arrival)</th>
                      <th className="text-left p-3 font-medium">Vehicle Standby (Departure)</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule) => (
                      <tr key={schedule.flight_id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{`${schedule.first_name} ${schedule.last_name}`}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{schedule.flight_number}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{formatDateTime(schedule.arrival_time)}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{formatDateTime(schedule.departure_time)}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="text-sm">{schedule.property_name}</p>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Car className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{formatTime(schedule.vehicle_standby_arrival_time)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Car className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{formatTime(schedule.vehicle_standby_departure_time)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusBadgeColor(schedule.status)}>
                            <Select
                              value={schedule.status}
                              onValueChange={val => handleStatusChange(schedule.flight_id, val)}
                              disabled={statusUpdating[schedule.flight_id]}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </DefaultLayout>
  );
} 