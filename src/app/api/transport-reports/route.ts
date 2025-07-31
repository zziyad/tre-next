import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookie, hasPermission } from '@/lib/auth'
import { transportReportService } from '@/backend/services/transport-report.service'
import { z } from 'zod'

// Validation schema for transport report
const transportReportSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	surname: z.string().min(1, 'Surname is required'),
	email: z.string().email('Please enter a valid email address'),
	reportDate: z.string().min(1, 'Report date is required'),
	tasksCompleted: z.string().optional(),
	meetingsAttended: z.string().optional(),
	issuesEncountered: z.string().optional(),
	pendingTasks: z.string().optional(),
	supportNotes: z.string().optional(),
	eventId: z.number().int().positive('Event ID is required'),
})

export async function POST(request: NextRequest) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Check if user has permission to create transport reports
		const hasWritePermission = await hasPermission(session.user_id, 'transport_reports:write')
		if (!hasWritePermission) {
			return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 })
		}

		const body = await request.json()
		
		// Validate the request body
		const validatedData = transportReportSchema.parse(body)
		
		// Create the transport report
		const transportReport = await transportReportService.createReport({
			...validatedData,
			reportDate: new Date(validatedData.reportDate),
			userId: session.user_id,
		})

		return NextResponse.json(
			{
				success: true,
				data: transportReport,
				message: 'Transport report created successfully',
			},
			{ status: 201 }
		)
	} catch (error) {
		console.error('Error creating transport report:', error)
		
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					success: false,
					message: 'Validation error',
					errors: error.issues.map((err: z.ZodIssue) => ({
						field: err.path.join('.'),
						message: err.message,
					})),
				},
				{ status: 400 }
			)
		}

		return NextResponse.json(
			{
				success: false,
				message: 'Internal server error',
			},
			{ status: 500 }
		)
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Check if user has permission to read transport reports
		const hasReadOwnPermission = await hasPermission(session.user_id, 'transport_reports:read_own')
		const hasReadAllPermission = await hasPermission(session.user_id, 'transport_reports:read_all')
		
		if (!hasReadOwnPermission && !hasReadAllPermission) {
			return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 })
		}

		const { searchParams } = new URL(request.url)
		const eventId = searchParams.get('eventId')
		const userId = searchParams.get('userId')

		if (!eventId) {
			return NextResponse.json(
				{ error: 'Event ID is required' },
				{ status: 400 }
			)
		}

		const reports = await transportReportService.getReports(
			parseInt(eventId),
			userId ? parseInt(userId) : undefined
		)

		return NextResponse.json({
			success: true,
			data: reports,
		})
	} catch (error) {
		console.error('Error fetching transport reports:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch transport reports' },
			{ status: 500 }
		)
	}
} 