import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { container } from '@/backend/container'
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

		const body = await request.json()
		
		// Validate the request body
		const validatedData = transportReportSchema.parse(body)
		
		// Create the transport report
		const result = await container.transportReportService.createTransportReport({
			...validatedData,
			reportDate: new Date(validatedData.reportDate),
			userId: session.user_id,
		})

		if (!result.success) {
			return NextResponse.json(
				{
					success: false,
					error: result.error,
				},
				{ status: 400 }
			)
		}

		return NextResponse.json(
			{
				success: true,
				data: result.data,
				message: 'Transport report created successfully',
			},
			{ status: 201 }
		)
	} catch (error) {
		console.error('Transport reports API: Error creating transport report:', error)
		
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

		const { searchParams } = new URL(request.url)
		const eventId = searchParams.get('eventId')
		const userId = searchParams.get('userId')

		if (!eventId) {
			return NextResponse.json(
				{ error: 'Event ID is required' },
				{ status: 400 }
			)
		}

		const result = await container.transportReportService.getTransportReports(
			parseInt(eventId)
		)

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: 500 }
			)
		}

		return NextResponse.json({
			success: true,
			data: result.data,
		})
	} catch (error) {
		console.error('Error fetching transport reports:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch transport reports' },
			{ status: 500 }
		)
	}
} 