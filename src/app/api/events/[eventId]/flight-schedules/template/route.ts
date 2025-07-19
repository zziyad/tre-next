import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId: eventIdStr } = await params;
    const eventId = parseInt(eventIdStr);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Create template data
    const templateData = [
      [
        'First Name',
        'Last Name', 
        'Flight Number',
        'Arrival Date',
        'Arrival Time',
        'Property Name',
        'Vehicle Standby',
        'Departure Date',
        'Departure Time',
        'Vehicle Standby'
      ],
      [
        'John',
        'Doe',
        'AA123',
        '2025-01-15',
        '14:30',
        'Grand Hotel',
        '15:00',
        '2025-01-20',
        '16:45',
        '17:15'
      ],
      [
        'Sarah',
        'Johnson',
        'BA456',
        '2025-01-15',
        '10:15',
        'Business Center',
        '10:45',
        '2025-01-20',
        '14:30',
        '15:00'
      ]
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
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
      { wch: 12 }  // Vehicle Standby
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Flight Schedule Template');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return file as download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="flight-schedule-template.xlsx"`,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate template';
    console.error('Template generation error:', error);
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 