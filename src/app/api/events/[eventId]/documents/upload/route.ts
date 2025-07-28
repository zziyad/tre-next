import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/backend/container'
import { getSessionFromCookie } from '@/lib/auth'

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ eventId: string }> }
) {
	try {
		const session = await getSessionFromCookie()
		console.log('Upload route: Session check:', session)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { eventId: eventIdStr } = await params
		const eventId = parseInt(eventIdStr)
		console.log('Upload route: Event ID:', eventId, 'from string:', eventIdStr)
		if (isNaN(eventId)) {
			return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })
		}

		const formData = await request.formData()
		const file = formData.get('file') as File
		const name = formData.get('name') as string

		console.log('Upload route: Received file:', file?.name, 'type:', file?.type, 'size:', file?.size)
		console.log('Upload route: Received name:', name)
		console.log('Upload route: FormData entries:', Array.from(formData.entries()).map(([key, value]) => [key, typeof value]))

		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 })
		}

		// Check if file is PDF
		if (file.type !== 'application/pdf') {
			return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
		}

		// Convert File to Buffer
		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)

		// Create Express.Multer.File-like object
		const multerFile = {
			fieldname: 'file',
			originalname: file.name,
			encoding: '7bit',
			mimetype: file.type,
			size: file.size,
			buffer: buffer,
			stream: null as any,
			destination: '',
			filename: '',
			path: ''
		}

		try {
			console.log('Upload route: Calling document service with:', {
				event_id: eventId,
				file_name: multerFile.originalname,
				file_size: multerFile.size,
				name: name || undefined,
				uploaded_by: session.user_id
			})

			const document = await container.documentService.uploadDocument({
				event_id: eventId,
				file: multerFile,
				name: name || undefined,
				uploaded_by: session.user_id
			})

			console.log('Upload route: Document created successfully:', document)

			return NextResponse.json({ 
				success: true,
				data: { document }
			})
		} catch (error) {
			console.error('Error in upload route:', error)
			console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Upload failed' },
				{ status: 500 }
			)
		}
	} catch (error) {
		console.error('Error uploading document:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
} 