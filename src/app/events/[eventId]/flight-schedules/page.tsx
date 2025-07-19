'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Download, FileSpreadsheet, Users, Calendar, Clock, Plane, Building, Car } from 'lucide-react';
import { useFlightSchedules } from '@/frontend/hooks/useFlightSchedules';
import { toast } from 'sonner';

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
  } = useFlightSchedules({ eventId });

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

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Flight Schedules</h1>
          <p className="text-gray-600 mt-1">Manage flight schedules and passenger information</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const link = document.createElement('a');
              link.href = `/api/events/${eventId}/flight-schedules/template`;
              link.download = 'flight-schedule-template.xlsx';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            disabled={isUploading}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Flight Schedule
          </CardTitle>
          <CardDescription>
            Upload an Excel file with flight schedule information. The file should contain columns for First Name, Last Name, Flight Number, Arrival Date, Arrival Time, Property Name, Vehicle Standby, Departure Date, Departure Time, and Vehicle Standby.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isUploading ? 'Uploading...' : 'Upload Excel File'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your Excel file here, or click to browse
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mb-2"
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
            <p className="text-sm text-gray-500">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Flight Schedules Table */}
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Passenger</th>
                    <th className="text-left p-3 font-medium">Flight</th>
                    <th className="text-left p-3 font-medium">Arrival</th>
                    <th className="text-left p-3 font-medium">Departure</th>
                    <th className="text-left p-3 font-medium">Property</th>
                    <th className="text-left p-3 font-medium">Vehicle Standby</th>
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
                          <p className="text-xs text-gray-500">
                            Vehicle: {formatTime(schedule.vehicle_standby_arrival_time)}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{formatDateTime(schedule.departure_time)}</p>
                          <p className="text-xs text-gray-500">
                            Vehicle: {formatTime(schedule.vehicle_standby_departure_time)}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{schedule.property_name}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Car className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Standby</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(schedule.status)}>
                          {schedule.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 