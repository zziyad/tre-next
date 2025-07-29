'use client'

import { useParams } from 'next/navigation'
import { TransportReportsList } from '@/components/TransportReportsList'
import { DefaultLayout } from '@/components/layout/DefaultLayout'
import { BarChart3, Calendar, FileText, Clock, Users, Settings } from 'lucide-react'

export default function TransportReportsPage() {
	const params = useParams()
	const eventId = params.eventId as string
	
	// TODO: Get actual user ID from session/auth
	const userId = 1 // This should come from authentication

	// Define sidebar items with Transport Reports as active
	const sidebarItems = [
		{ icon: BarChart3, label: 'Dashboard', active: false, href: `/events/${eventId}` },
		{ icon: Calendar, label: 'Flight Schedule', active: false, href: `/events/${eventId}/flight-schedules` },
		{ icon: FileText, label: 'Transport Reports', active: true, href: `/events/${eventId}/transport-reports` },
		{ icon: Clock, label: 'Real-time Status', active: false, href: `/events/${eventId}/status` },
		{ icon: Users, label: 'Passengers', active: false, href: `/events/${eventId}/passengers` },
		{ icon: FileText, label: 'Documents', active: false, href: `/events/${eventId}/documents` },
		{ icon: Settings, label: 'Settings', active: false, href: `/events/${eventId}/settings` }
	]

	return (
		<DefaultLayout 
			eventId={eventId}
			sidebarItems={sidebarItems}
			title="Transport Reports"
			subtitle="Manage and view transport reports for this event"
		>
			<TransportReportsList eventId={parseInt(eventId)} userId={userId} />
		</DefaultLayout>
	)
} 