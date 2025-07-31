'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { RealTimeStatusList } from '@/components/RealTimeStatusList'
import { DefaultLayout } from '@/components/layout/DefaultLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { BarChart3, Calendar, FileText, Clock, Users, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UserSession {
  user_id: number;
  username: string;
  email: string;
  is_active: boolean;
  permissions: string[];
}

export default function RealTimeStatusPage() {
	const params = useParams()
	const router = useRouter()
	const eventId = parseInt(params.eventId as string)
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
	const hasReadPermission = Boolean(userSession && Array.isArray(userSession.permissions) && userSession.permissions.includes('real_time_status:read'))
	const hasWritePermission = Boolean(userSession && Array.isArray(userSession.permissions) && userSession.permissions.includes('real_time_status:write'))
	const hasDeletePermission = Boolean(userSession && Array.isArray(userSession.permissions) && userSession.permissions.includes('real_time_status:delete'))

	// Debug: Log user session and permissions
	console.log('User session:', userSession)
	console.log('Permissions check:', {
		hasReadPermission,
		hasWritePermission,
		hasDeletePermission,
		permissions: userSession?.permissions
	})

	// Define sidebar items with Real-Time Status as active
	const sidebarItems = [
		{ icon: BarChart3, label: 'Dashboard', active: false, href: `/events/${eventId}` },
		{ icon: Calendar, label: 'Flight Schedule', active: false, href: `/events/${eventId}/flight-schedules` },
		{ icon: FileText, label: 'Transport Reports', active: false, href: `/events/${eventId}/transport-reports` },
		{ icon: Clock, label: 'Real-time Status', active: true, href: `/events/${eventId}/status` },
		{ icon: Users, label: 'Passengers', active: false, href: `/events/${eventId}/passengers` },
		{ icon: FileText, label: 'Documents', active: false, href: `/events/${eventId}/documents` }
	]

	if (loading) {
		return (
			<DefaultLayout eventId={eventId.toString()} sidebarItems={sidebarItems}>
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
						<p>Loading...</p>
					</div>
				</div>
			</DefaultLayout>
		)
	}

	// Check if user has read permission
	if (!hasReadPermission) {
		return (
			<DefaultLayout eventId={eventId.toString()} sidebarItems={sidebarItems}>
				<div className="text-center py-8">
					<AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
					<h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
					<p className="text-gray-600 mb-4">
						You do not have permission to view real-time status entries.
					</p>
					<p className="text-sm text-gray-500">
						Please contact your administrator to request access.
					</p>
				</div>
			</DefaultLayout>
		)
	}

	return (
		<DefaultLayout 
			eventId={eventId.toString()}
			sidebarItems={sidebarItems}
			title="Real-Time Status"
			subtitle="Track vehicle status and guest movements in real-time"
		>
			<ErrorBoundary>
				<RealTimeStatusList 
					eventId={eventId}
					hasWritePermission={hasWritePermission || false}
					hasDeletePermission={hasDeletePermission || false}
				/>
			</ErrorBoundary>
		</DefaultLayout>
	)
} 