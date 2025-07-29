import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/backend/container';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    console.log('🚀 [UPLOAD] Starting flight schedule upload...');
    
    const { eventId: eventIdStr } = await params;
    const eventId = parseInt(eventIdStr);
    
    console.log('📋 [UPLOAD] Event ID:', eventId);
    
    if (isNaN(eventId)) {
      console.error('❌ [UPLOAD] Invalid event ID:', eventIdStr);
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('📁 [UPLOAD] File received:', {
      name: file?.name,
      size: file?.size,
      type: file?.type
    });

    if (!file) {
      console.error('❌ [UPLOAD] No file provided');
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    console.log('🔍 [UPLOAD] File type validation:', {
      fileType: file.type,
      allowedTypes,
      isValid: allowedTypes.includes(file.type)
    });

    if (!allowedTypes.includes(file.type)) {
      console.error('❌ [UPLOAD] Invalid file type:', file.type);
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    console.log('🔄 [UPLOAD] Converting file to buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('✅ [UPLOAD] Buffer created, size:', buffer.length);

    // Process the file
    console.log('⚙️ [UPLOAD] Calling flight schedule service...');
    const result = await container.flightScheduleService.uploadFlightSchedules(eventId, buffer);
    console.log('✅ [UPLOAD] Service completed, result:', result);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload flight schedules';
    console.error('❌ [UPLOAD] Flight schedules upload error:', error);
    console.error('❌ [UPLOAD] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 