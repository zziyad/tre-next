import { apiService } from './api.service'

// Frontend Document interface (matches API response)
export interface Document {
	document_id: number
	event_id: number
	name: string
	original_name: string
	file_path: string
	file_size: number
	mime_type: string
	uploaded_by: number
	created_at: string
	user: {
		user_id: number
		email: string
		name: string
		surname: string
		role: string
	}
}

export interface UploadDocumentData {
	file: File
	name?: string
}

export class DocumentService {
	static async getDocumentsByEventId(eventId: number): Promise<Document[]> {
		const response = await apiService.get<{ documents: Document[] }>(`/events/${eventId}/documents`)
		if (!response.success) {
			throw new Error(response.error)
		}
		return response.data?.documents || []
	}

	static async uploadDocument(eventId: number, data: UploadDocumentData): Promise<Document> {
		const formData = new FormData()
		formData.append('file', data.file)
		if (data.name) {
			formData.append('name', data.name)
		}

		const response = await fetch(`/api/events/${eventId}/documents/upload`, {
			method: 'POST',
			body: formData
		})

		if (!response.ok) {
			const errorData = await response.json()
			throw new Error(errorData.error || 'Upload failed')
		}

		const result = await response.json()
		return result.data?.document || result.document
	}

	static async deleteDocument(eventId: number, documentId: number): Promise<void> {
		try {
			const response = await apiService.delete(`/events/${eventId}/documents/${documentId}`)
			if (!response.success) {
				throw new Error(response.error || 'Failed to delete document')
			}
		} catch (error) {
			console.error('Delete document error:', error)
			throw error
		}
	}

	static async updateDocumentName(eventId: number, documentId: number, name: string): Promise<Document> {
		const response = await apiService.put<{ document: Document }>(`/events/${eventId}/documents/${documentId}`, { name })
		if (!response.success) {
			throw new Error(response.error)
		}
		return response.data?.document!
	}
} 