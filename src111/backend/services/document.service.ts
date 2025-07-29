import { DocumentRepositoryInterface } from '../interfaces/repositories'
import { createDocumentSchema } from '../validation/schemas'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'

export class DocumentService {
	constructor(private documentRepository: DocumentRepositoryInterface) {}

	async uploadDocument(data: {
		event_id: number
		file: Express.Multer.File
		name?: string
		uploaded_by: number
	}) {
		try {
			console.log('Document service: Starting upload process')
			
			// Validate input
			const validatedData = createDocumentSchema.parse({
				name: data.name || data.file.originalname
			})
			console.log('Document service: Validation passed')

			// Create uploads directory if it doesn't exist
			const uploadsDir = path.join(process.cwd(), 'uploads', 'documents')
			await fs.mkdir(uploadsDir, { recursive: true })
			console.log('Document service: Upload directory ready')

			// Generate unique filename
			const timestamp = Date.now()
			const fileExtension = path.extname(data.file.originalname)
			const fileName = `${timestamp}_${Math.random().toString(36).substring(2)}${fileExtension}`
			const filePath = path.join(uploadsDir, fileName)
			console.log('Document service: Generated filename:', fileName)

			// Save file to disk
			await fs.writeFile(filePath, data.file.buffer)
			console.log('Document service: File saved to disk')

			// Save document record to database
			const document = await this.documentRepository.create({
				event_id: data.event_id,
				name: validatedData.name,
				original_name: data.file.originalname,
				file_path: filePath,
				file_size: data.file.size,
				mime_type: data.file.mimetype,
				uploaded_by: data.uploaded_by
			})

			console.log('Document created successfully:', document)
			return document
		} catch (error) {
			console.error('Error in uploadDocument:', error)
			console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
			throw error
		}
	}

	async getDocumentsByEventId(eventId: number) {
		return await this.documentRepository.findByEventId(eventId)
	}

	async getDocumentById(documentId: number) {
		return await this.documentRepository.findById(documentId) as any
	}

	async deleteDocument(documentId: number) {
		try {
			const document = await this.documentRepository.findById(documentId) as any
			if (!document) {
				throw new Error('Document not found')
			}

			// Delete file from disk
			try {
				await fs.unlink(document.file_path)
			} catch (error) {
				console.error('Error deleting file:', error)
				// Continue with database deletion even if file deletion fails
			}

			// Delete from database
			return await this.documentRepository.delete(documentId)
		} catch (error) {
			console.error('Error in deleteDocument service:', error)
			throw error
		}
	}

	async updateDocumentName(documentId: number, name: string) {
		const document = await this.documentRepository.findById(documentId)
		if (!document) {
			throw new Error('Document not found')
		}

		return await this.documentRepository.update(documentId, { name })
	}
} 