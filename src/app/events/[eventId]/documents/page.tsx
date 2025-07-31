'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DefaultLayout } from '@/components/layout/DefaultLayout'
import { Container } from '@/components/layout/Container'
import { useDocuments } from '@/frontend/hooks/useDocuments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, Upload, Download, Trash2, Edit, Calendar, User, Eye, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatFileSize, formatDate } from '@/lib/utils'
import { ClientOnly } from '@/components/ClientOnly'

interface UserSession {
  user_id: number;
  username: string;
  email: string;
  is_active: boolean;
  permissions: string[];
}

export default function DocumentsPage() {
	const params = useParams()
	const router = useRouter()
	const eventId = params.eventId ? parseInt(params.eventId as string) : null
	const [userSession, setUserSession] = useState<UserSession | null>(null)
	const [loading, setLoading] = useState(true)

	// Check user permissions on component mount
	useEffect(() => {
		const checkUserPermissions = async () => {
			try {
				const response = await fetch('/api/auth/me')
				if (!response.ok) {
					if (response.status === 401) {
						router.push('/login')
						return
					}
					throw new Error('Failed to get user session')
				}
				const data = await response.json()
				console.log('Session data received:', data) // Debug log
				
				if (data.success) {
					setUserSession(data.data.user)
					console.log('User session set:', data.data.user) // Debug log
				} else {
					throw new Error(data.error || 'Failed to get user session')
				}
			} catch (error) {
				console.error('Error checking permissions:', error)
				toast.error('Failed to check permissions')
			} finally {
				setLoading(false)
			}
		}

		checkUserPermissions()
	}, [router])

	// Check if user has required permissions with defensive checks
	const hasReadPermission = userSession && Array.isArray(userSession.permissions) && userSession.permissions.includes('documents:read')
	const hasWritePermission = userSession && Array.isArray(userSession.permissions) && userSession.permissions.includes('documents:write')
	const hasDeletePermission = userSession && Array.isArray(userSession.permissions) && userSession.permissions.includes('documents:delete')
	const hasDownloadPermission = userSession && Array.isArray(userSession.permissions) && userSession.permissions.includes('documents:download')

	// Debug: Log user session and permissions
	console.log('User session:', userSession)
	console.log('Permissions check:', {
		hasReadPermission,
		hasWritePermission,
		hasDeletePermission,
		hasDownloadPermission,
		permissions: userSession?.permissions
	})

		const { documents, isLoading, isUploading, uploadDocument, deleteDocument, updateDocumentName } = useDocuments(eventId || 0)
	
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [documentName, setDocumentName] = useState('')
	const [editingDocument, setEditingDocument] = useState<{ id: number; name: string } | null>(null)

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			if (file.type !== 'application/pdf') {
				try {
					toast.error('Only PDF files are allowed')
				} catch (toastError) {
					console.error('Error showing error toast:', toastError)
				}
				return
			}
			setSelectedFile(file)
			if (!documentName) {
				setDocumentName(file.name.replace('.pdf', ''))
			}
		}
	}

	const handleUpload = async () => {
		if (!hasWritePermission) {
			toast.error('You do not have permission to upload documents')
			return
		}

		if (!selectedFile) {
			try {
				toast.error('Please select a file')
			} catch (toastError) {
				console.error('Error showing error toast:', toastError)
			}
			return
		}

		try {
			await uploadDocument({
				file: selectedFile,
				name: documentName || undefined
			})
			setIsUploadDialogOpen(false)
			setSelectedFile(null)
			setDocumentName('')
		} catch (error) {
			// Error is already handled in the hook
		}
	}

	const handleDelete = async (documentId: number) => {
		if (!hasDeletePermission) {
			toast.error('You do not have permission to delete documents')
			return
		}

		if (confirm('Are you sure you want to delete this document?')) {
			await deleteDocument(documentId)
		}
	}

	const handleEditName = async (documentId: number, newName: string) => {
		if (!hasWritePermission) {
			toast.error('You do not have permission to edit documents')
			return
		}

		try {
			await updateDocumentName(documentId, newName)
			setEditingDocument(null)
		} catch (error) {
			// Error is already handled in the hook
		}
	}

	const handleViewDocument = (document: any) => {
		if (!hasReadPermission) {
			toast.error('You do not have permission to view documents')
			return
		}
		router.push(`/events/${eventId}/documents/${document.document_id}`)
	}

	const handleDownload = async (document: any) => {
		if (!hasDownloadPermission) {
			toast.error('You do not have permission to download documents')
			return
		}

		try {
			toast.info('Download functionality coming soon')
		} catch (toastError) {
			console.error('Error showing info toast:', toastError)
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
					<p>Loading...</p>
				</div>
			</div>
		)
	}

	// Check if user has read permission
	if (!hasReadPermission) {
		return (
			<div className="text-center py-8">
				<AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
				<h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
				<p className="text-gray-600 mb-4">
					You do not have permission to view documents.
				</p>
				<p className="text-sm text-gray-500">
					Please contact your administrator to request access.
				</p>
			</div>
		)
	}

	return (
		<ClientOnly
			fallback={
				<div className="min-h-screen bg-background">
					<div className="flex items-center justify-center min-h-screen">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				</div>
			}
		>
			<DefaultLayout
				eventId={eventId?.toString() || ''}
				title="Documents"
				subtitle="Manage event documents"
			>
				<Container>
					<div className="space-y-6">
						{/* Header */}
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
							<div>
								<h1 className="text-2xl font-bold text-foreground">Documents</h1>
								<p className="text-muted-foreground">Upload and manage PDF documents for this event</p>
							</div>
							{hasWritePermission && (
								<Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
									<DialogTrigger asChild>
										<Button className="w-full sm:w-auto">
											<Upload className="w-4 h-4 mr-2" />
											Upload Document
										</Button>
									</DialogTrigger>
								</Dialog>
							)}
						</div>

						{/* Documents List */}
						{isLoading ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
								<p className="mt-2 text-muted-foreground">Loading documents...</p>
							</div>
						) : documents.length === 0 ? (
							<Card>
								<CardContent className="text-center py-8">
									<FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-medium text-foreground mb-2">No documents yet</h3>
									<p className="text-muted-foreground mb-4">Upload your first PDF document to get started</p>
									{hasWritePermission && (
										<Button onClick={() => setIsUploadDialogOpen(true)}>
											<Upload className="w-4 h-4 mr-2" />
											Upload Document
										</Button>
									)}
								</CardContent>
							</Card>
						) : (
							<div className="grid gap-4">
								{documents.map((document) => (
									<Card key={document.document_id} className="hover:shadow-md transition-shadow">
										<CardContent className="p-4 sm:p-6">
											<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
												<div className="flex items-start space-x-3 sm:space-x-4 flex-1">
													<div className="p-2 sm:p-3 bg-primary/10 rounded-lg flex-shrink-0">
														<FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-start justify-between mb-2">
															<div className="flex-1">
																{editingDocument?.id === document.document_id ? (
																	<div className="flex items-center space-x-2">
																		<Input
																			value={editingDocument.name}
																			onChange={(e) => setEditingDocument({
																				id: document.document_id,
																				name: e.target.value
																			})}
																			className="flex-1 max-w-md"
																		/>
																		<Button
																			size="sm"
																			onClick={() => handleEditName(document.document_id, editingDocument.name)}
																		>
																			Save
																		</Button>
																		<Button
																			size="sm"
																			variant="outline"
																			onClick={() => setEditingDocument(null)}
																		>
																			Cancel
																		</Button>
																	</div>
																) : (
																	<div className="flex items-center space-x-2">
																		<h3 
																			className="text-base sm:text-lg font-semibold text-foreground cursor-pointer hover:text-primary transition-colors flex items-center"
																			onClick={() => handleViewDocument(document)}
																		>
																			{document.name}
																			<Eye className="ml-2 w-4 h-4 sm:w-5 sm:h-5 text-primary" />
																		</h3>
																		{hasWritePermission && (
																			<Button
																				size="sm"
																				variant="ghost"
																				onClick={() => setEditingDocument({
																					id: document.document_id,
																					name: document.name
																				})}
																				className="text-muted-foreground hover:text-foreground"
																			>
																				<Edit className="w-4 h-4" />
																			</Button>
																		)}
																	</div>
																)}
															</div>
														</div>
														<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
															<div className="flex items-center space-x-2">
																<Calendar className="w-4 h-4" />
																<span>{formatDate(document.created_at)}</span>
															</div>
															<div className="flex items-center space-x-2">
																<User className="w-4 h-4" />
																<span>{document.User.username}</span>
															</div>
															<div className="flex items-center space-x-2">
																<FileText className="w-4 h-4" />
																<span>{formatFileSize(document.file_size)}</span>
															</div>
														</div>
													</div>
												</div>
												{(hasDownloadPermission || hasDeletePermission) && (
													<div className="flex items-center space-x-2 flex-shrink-0">
														{hasDownloadPermission && (
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleDownload(document)}
																className="flex items-center"
															>
																<Download className="w-4 h-4 mr-1" />
																<span className="hidden sm:inline">Download</span>
															</Button>
														)}
														{hasDeletePermission && (
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleDelete(document.document_id)}
																className="text-destructive hover:text-destructive hover:bg-destructive/10"
															>
																<Trash2 className="w-4 h-4" />
															</Button>
														)}
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>

					{/* Upload Dialog */}
					{hasWritePermission && (
						<Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle className="flex items-center">
										<Upload className="w-5 h-5 mr-2" />
										Upload Document
									</DialogTitle>
								</DialogHeader>
								<div className="space-y-6">
									<div className="space-y-2">
										<Label htmlFor="document-name">Document Name</Label>
										<Input
											id="document-name"
											value={documentName}
											onChange={(e) => setDocumentName(e.target.value)}
											placeholder="Enter document name"
											className="w-full"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="file-upload">Select PDF File</Label>
										<Input
											id="file-upload"
											type="file"
											accept=".pdf"
											onChange={handleFileSelect}
											className="w-full"
										/>
										{selectedFile && (
											<p className="text-sm text-muted-foreground">
												Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
											</p>
										)}
									</div>
									<div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
										<Button
											variant="outline"
											onClick={() => setIsUploadDialogOpen(false)}
											className="w-full sm:w-auto"
										>
											Cancel
										</Button>
										<Button
											onClick={handleUpload}
											disabled={!selectedFile || !documentName || isUploading}
											className="w-full sm:w-auto min-w-[100px]"
										>
											{isUploading ? (
												<>
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
													Uploading...
												</>
											) : (
												'Upload'
											)}
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					)}
				</Container>
			</DefaultLayout>
		</ClientOnly>
	)
} 