import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/backend/container'
import { getSessionFromCookie } from '@/lib/auth'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ eventId: string }> }
) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { eventId: eventIdStr } = await params
		const eventId = parseInt(eventIdStr)
		if (isNaN(eventId)) {
			return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })
		}

		const documents = await container.documentService.getDocumentsByEventId(eventId)
		console.log('Documents fetched:', documents)

		return NextResponse.json({ 
			success: true, 
			data: { documents } 
		})
	} catch (error) {
		console.error('Error fetching documents:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 