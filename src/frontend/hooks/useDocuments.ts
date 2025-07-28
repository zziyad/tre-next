import { useState, useEffect } from 'react'
import { DocumentService, Document, UploadDocumentData } from '../services/document.service'
import { toast } from 'sonner'

export function useDocuments(eventId: number) {
	const [documents, setDocuments] = useState<Document[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [isUploading, setIsUploading] = useState(false)
	const [isInitialized, setIsInitialized] = useState(false)

	const fetchDocuments = async () => {
		setIsLoading(true)
		try {
			const docs = await DocumentService.getDocumentsByEventId(eventId)
			console.log('Documents fetched in hook:', docs)
			setDocuments(docs)
		} catch (error) {
			console.error('Error fetching documents:', error)
			try {
				toast.error('Failed to load documents')
			} catch (toastError) {
				console.error('Error showing error toast:', toastError)
			}
		} finally {
			setIsLoading(false)
		}
	}

	const uploadDocument = async (data: UploadDocumentData) => {
		setIsUploading(true)
		try {
			console.log('useDocuments: Starting upload for eventId:', eventId)
			const newDocument = await DocumentService.uploadDocument(eventId, data)
			console.log('useDocuments: Upload successful, new document:', newDocument)
			setDocuments(prev => [newDocument, ...prev])
			try {
				toast.success('Document uploaded successfully')
			} catch (toastError) {
				console.error('Error showing success toast:', toastError)
			}
			return newDocument
		} catch (error) {
			console.error('Error uploading document:', error)
			try {
				toast.error('Failed to upload document')
			} catch (toastError) {
				console.error('Error showing error toast:', toastError)
			}
			throw error
		} finally {
			setIsUploading(false)
		}
	}

	const deleteDocument = async (documentId: number) => {
		try {
			await DocumentService.deleteDocument(eventId, documentId)
			setDocuments(prev => prev.filter(doc => doc.document_id !== documentId))
			try {
				toast.success('Document deleted successfully')
			} catch (toastError) {
				console.error('Error showing success toast:', toastError)
			}
		} catch (error) {
			console.error('Error deleting document:', error)
			try {
				toast.error('Failed to delete document')
			} catch (toastError) {
				console.error('Error showing error toast:', toastError)
			}
		}
	}

	const updateDocumentName = async (documentId: number, name: string) => {
		try {
			const updatedDocument = await DocumentService.updateDocumentName(eventId, documentId, name)
			setDocuments(prev => 
				prev.map(doc => 
					doc.document_id === documentId ? updatedDocument : doc
				)
			)
			try {
				toast.success('Document name updated successfully')
			} catch (toastError) {
				console.error('Error showing success toast:', toastError)
			}
			return updatedDocument
		} catch (error) {
			console.error('Error updating document name:', error)
			try {
				toast.error('Failed to update document name')
			} catch (toastError) {
				console.error('Error showing error toast:', toastError)
			}
			throw error
		}
	}

	useEffect(() => {
		if (eventId && eventId > 0 && typeof window !== 'undefined') {
			setIsInitialized(true)
			fetchDocuments()
		}
	}, [eventId])

	return {
		documents: isInitialized ? documents : [],
		isLoading: isInitialized ? isLoading : false,
		isUploading,
		uploadDocument,
		deleteDocument,
		updateDocumentName,
		refreshDocuments: fetchDocuments
	}
} 