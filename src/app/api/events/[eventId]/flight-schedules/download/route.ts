import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/backend/container';
import * as XLSX from 'xlsx';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    console.log('📥 [DOWNLOAD] Starting flight schedules download...');
    
    const { eventId: eventIdStr } = await params;
    const eventId = parseInt(eventIdStr);
    
    console.log('📋 [DOWNLOAD] Event ID:', eventId);
    
    if (isNaN(eventId)) {
      console.error('❌ [DOWNLOAD] Invalid event ID:', eventIdStr);
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Fetch all flight schedules for the event
    console.log('🔍 [DOWNLOAD] Fetching flight schedules...');
    const schedules = await container.flightScheduleService.getFlightSchedulesByEventId(eventId);
    console.log('✅ [DOWNLOAD] Fetched schedules count:', schedules.length);

    if (schedules.length === 0) {
      console.log('⚠️ [DOWNLOAD] No schedules found for event');
      return NextResponse.json(
        { success: false, error: 'No flight schedules found for this event' },
        { status: 404 }
      );
    }

    // Prepare data for Excel
    console.log('📊 [DOWNLOAD] Preparing Excel data...');
    const excelData = schedules.map(schedule => ({
      'First Name': schedule.first_name,
      'Last Name': schedule.last_name,
      'Flight Number': schedule.flight_number,
      'Arrival Date': new Date(schedule.arrival_time).toLocaleDateString('en-US'),
      'Arrival Time': new Date(schedule.arrival_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      'Property Name': schedule.property_name,
      'Vehicle Standby': new Date(schedule.vehicle_standby_arrival_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      'Departure Date': new Date(schedule.departure_time).toLocaleDateString('en-US'),
      'Departure Time': new Date(schedule.departure_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      'Vehicle Standby Departure': new Date(schedule.vehicle_standby_departure_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      'Status': schedule.status || 'pending'
    }));

    console.log('📋 [DOWNLOAD] Excel data prepared:', excelData.length, 'rows');

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 12 }, // Flight Number
      { wch: 12 }, // Arrival Date
      { wch: 10 }, // Arrival Time
      { wch: 20 }, // Property Name
      { wch: 12 }, // Vehicle Standby
      { wch: 12 }, // Departure Date
      { wch: 10 }, // Departure Time
      { wch: 18 }, // Vehicle Standby Departure
      { wch: 12 }, // Status
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Flight Schedules');

    // Generate Excel file buffer
    console.log('💾 [DOWNLOAD] Generating Excel buffer...');
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    console.log('✅ [DOWNLOAD] Excel buffer generated, size:', excelBuffer.length);

    // Set response headers for file download
    const filename = `flight-schedules-event-${eventId}-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to download flight schedules';
    console.error('❌ [DOWNLOAD] Flight schedules download error:', error);
    console.error('❌ [DOWNLOAD] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 