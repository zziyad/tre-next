'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DefaultLayout } from '@/components/layout/DefaultLayout'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Download, ArrowLeft, FileText, Calendar, User, Info, AlertCircle } from 'lucide-react'
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

export default function DocumentViewerPage() {
	const params = useParams()
	const router = useRouter()
	const eventId = params.eventId ? parseInt(params.eventId as string) : null
	const documentId = params.documentId ? parseInt(params.documentId as string) : null

	const [document, setDocument] = useState<any>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [userSession, setUserSession] = useState<UserSession | null>(null)
	const [sessionLoading, setSessionLoading] = useState(true)

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
				setSessionLoading(false)
			}
		}

		checkUserPermissions()
	}, [router])

	// Check if user has required permissions with defensive checks
	const hasReadPermission = userSession && Array.isArray(userSession.permissions) && userSession.permissions.includes('documents:read')
	const hasDownloadPermission = userSession && Array.isArray(userSession.permissions) && userSession.permissions.includes('documents:download')

	// Debug: Log user session and permissions
	console.log('User session:', userSession)
	console.log('Permissions check:', {
		hasReadPermission,
		hasDownloadPermission,
		permissions: userSession?.permissions
	})

	useEffect(() => {
		if (!eventId || !documentId) {
			setError('Invalid document ID')
			setIsLoading(false)
			return
		}

		const fetchDocument = async () => {
			try {
				const response = await fetch(`/api/events/${eventId}/documents`)
				if (!response.ok) {
					throw new Error('Failed to fetch documents')
				}

				const data = await response.json()
				const foundDocument = data.data?.documents?.find((doc: any) => doc.document_id === documentId)
				
				if (!foundDocument) {
					throw new Error('Document not found')
				}

				setDocument(foundDocument)
			} catch (error) {
				console.error('Error fetching document:', error)
				setError('Failed to load document')
			} finally {
				setIsLoading(false)
			}
		}

		fetchDocument()
	}, [eventId, documentId])

	const handleDownload = async () => {
		if (!hasDownloadPermission) {
			toast.error('You do not have permission to download documents')
			return
		}

		if (!document) return
		
		try {
			const response = await fetch(`/api/events/${document.event_id}/documents/${document.document_id}`)
			if (!response.ok) {
				throw new Error('Failed to download document')
			}
			
			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const a = window.document.createElement('a')
			a.href = url
			a.download = document.original_name
			window.document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
			window.document.body.removeChild(a)
			
			toast.success('Document downloaded successfully')
		} catch (error) {
			console.error('Error downloading document:', error)
			toast.error('Failed to download document')
		}
	}

	const handleBack = () => {
		router.push(`/events/${eventId}/documents`)
	}

	const DocumentViewer = () => {
		if (sessionLoading) {
			return (
				<div className="flex items-center justify-center min-h-[80vh]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Checking permissions...</p>
					</div>
				</div>
			)
		}

		// Check if user has read permission
		if (!hasReadPermission) {
			return (
				<div className="flex items-center justify-center min-h-[80vh]">
					<div className="text-center">
						<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
						<p className="text-gray-600 mb-4">You do not have permission to view this document.</p>
						<Button onClick={handleBack}>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Documents
						</Button>
					</div>
				</div>
			)
		}

		if (isLoading) {
			return (
				<div className="flex items-center justify-center min-h-[80vh]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading document...</p>
					</div>
				</div>
			)
		}

		if (error || !document) {
			return (
				<div className="flex items-center justify-center min-h-[80vh]">
					<div className="text-center">
						<FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-foreground mb-2">Document Not Found</h2>
						<p className="text-muted-foreground mb-4">{error || 'The requested document could not be found.'}</p>
						<Button onClick={handleBack}>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Documents
						</Button>
					</div>
				</div>
			)
		}

		return (
			<div className="h-screen flex flex-col">
				{/* Mobile Header - Fixed at top */}
				<div className="flex items-center justify-between p-4 bg-card border-b border-border shadow-sm">
					<div className="flex items-center space-x-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBack}
							className="p-2"
						>
							<ArrowLeft className="w-4 h-4" />
						</Button>
						<div className="min-w-0 flex-1">
							<h1 className="text-sm font-semibold text-foreground truncate">{document.name}</h1>
							<p className="text-xs text-muted-foreground">PDF Document</p>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="ghost" size="sm" className="p-2">
									<Info className="w-4 h-4" />
								</Button>
							</SheetTrigger>
							<SheetContent side="bottom" className="h-[40vh]">
								<SheetHeader>
									<SheetTitle className="flex items-center">
										<FileText className="w-4 h-4 mr-2" />
										Document Info
									</SheetTitle>
								</SheetHeader>
								<div className="mt-4 space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Uploaded</span>
										<span className="text-sm font-medium">{formatDate(document.created_at)}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">By</span>
										<span className="text-sm font-medium">{document.user.username}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Size</span>
										<span className="text-sm font-medium">{formatFileSize(document.file_size)}</span>
									</div>
									{hasDownloadPermission && (
										<div className="pt-4">
											<Button onClick={handleDownload} className="w-full">
												<Download className="w-4 h-4 mr-2" />
												Download Document
											</Button>
										</div>
									)}
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>

				{/* PDF Viewer - Takes remaining space */}
				<div className="flex-1 bg-background">
					<iframe
						src={`/api/events/${document.event_id}/documents/${document.document_id}`}
						className="w-full h-full border-0"
						title={`Viewing ${document.name}`}
					/>
				</div>
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
				title="Document Viewer"
				subtitle="View and download PDF documents"
			>
				<DocumentViewer />
			</DefaultLayout>
		</ClientOnly>
	)
} 