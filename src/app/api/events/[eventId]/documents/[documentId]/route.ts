import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/backend/container'
import { getSessionFromCookie } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ eventId: string; documentId: string }> }
) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { documentId: documentIdStr } = await params
		const documentId = parseInt(documentIdStr)
		if (isNaN(documentId)) {
			return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 })
		}

		try {
			await container.documentService.deleteDocument(documentId)

			return NextResponse.json({ 
				success: true, 
				message: 'Document deleted successfully' 
			})
		} catch (error) {
			console.error('Error in delete route:', error)
			return NextResponse.json(
				{ 
					success: false,
					error: error instanceof Error ? error.message : 'Failed to delete document' 
				},
				{ status: 500 }
			)
		}
	} catch (error) {
		console.error('Error deleting document:', error)
		return NextResponse.json(
			{ 
				success: false,
				error: 'Internal server error' 
			},
			{ status: 500 }
		)
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ eventId: string; documentId: string }> }
) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { documentId: documentIdStr } = await params
		const documentId = parseInt(documentIdStr)
		if (isNaN(documentId)) {
			return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 })
		}

		const body = await request.json()
		const { name } = body

		if (!name || typeof name !== 'string') {
			return NextResponse.json({ error: 'Name is required' }, { status: 400 })
		}

		const document = await container.documentService.updateDocumentName(documentId, name)

		return NextResponse.json({ 
			success: true, 
			data: { document } 
		})
	} catch (error) {
		console.error('Error updating document:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ eventId: string; documentId: string }> }
) {
	try {
		const session = await getSessionFromCookie()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { eventId: eventIdStr, documentId: documentIdStr } = await params
		const eventId = parseInt(eventIdStr)
		const documentId = parseInt(documentIdStr)

		if (isNaN(eventId) || isNaN(documentId)) {
			return NextResponse.json({ error: 'Invalid event or document ID' }, { status: 400 })
		}

		// Get document details
		const document = await container.documentService.getDocumentById(documentId)
		if (!document) {
			return NextResponse.json({ error: 'Document not found' }, { status: 404 })
		}

		// Check if document belongs to the specified event
		if (document.event_id !== eventId) {
			return NextResponse.json({ error: 'Document not found' }, { status: 404 })
		}

		// Check if file exists
		try {
			await fs.access(document.file_path)
		} catch {
			return NextResponse.json({ error: 'File not found' }, { status: 404 })
		}

		// Read file
		const fileBuffer = await fs.readFile(document.file_path)

		// Return file with appropriate headers
		return new NextResponse(fileBuffer, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `inline; filename="${document.original_name}"`,
				'Cache-Control': 'public, max-age=3600'
			}
		})
	} catch (error) {
		console.error('Error serving document:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 