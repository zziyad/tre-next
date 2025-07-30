import { PrismaClient } from '@prisma/client'
import { DocumentRepositoryInterface } from '../interfaces/repositories'

const prisma = new PrismaClient()

export class DocumentRepository implements DocumentRepositoryInterface {
	async create(data: {
		event_id: number
		name: string
		original_name: string
		file_path: string
		file_size: number
		mime_type: string
		uploaded_by: number
	}) {
		try {
			console.log('Document repository: Creating document with data:', {
				event_id: data.event_id,
				name: data.name,
				original_name: data.original_name,
				file_size: data.file_size,
				uploaded_by: data.uploaded_by
			})
			
			const document = await prisma.document.create({
				data,
				include: {
					user: {
						select: {
							user_id: true,
							email: true,
							name: true,
							surname: true,
							role: true
						}
					}
				}
			})
			
			console.log('Document repository: Document created successfully:', document)
			return document
		} catch (error) {
			console.error('Error creating document:', error)
			console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
			throw error
		}
	}

	async findByEventId(eventId: number) {
		return await prisma.document.findMany({
			where: { event_id: eventId },
			include: {
				user: {
					select: {
						user_id: true,
						email: true,
						name: true,
						surname: true,
						role: true
					}
				}
			},
			orderBy: { created_at: 'desc' }
		})
	}

	async findById(documentId: number) {
		return await prisma.document.findUnique({
			where: { document_id: documentId },
			include: {
				user: {
					select: {
						user_id: true,
						email: true,
						name: true,
						surname: true,
						role: true
					}
				}
			}
		})
	}

	async delete(documentId: number) {
		try {
			return await prisma.document.delete({
				where: { document_id: documentId }
			})
		} catch (error) {
			console.error('Error in document repository delete:', error)
			throw error
		}
	}

	async update(documentId: number, data: { name?: string }) {
		return await prisma.document.update({
			where: { document_id: documentId },
			data
		})
	}
} 