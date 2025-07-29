'use client'

import { useParams } from 'next/navigation'
import { RealTimeStatusList } from '@/components/RealTimeStatusList'
import { DefaultLayout } from '@/components/layout/DefaultLayout'
import { BarChart3, Calendar, FileText, Clock, Users, Settings } from 'lucide-react'

export default function RealTimeStatusPage() {
	const params = useParams()
	const eventId = params.eventId as string

	// Define sidebar items with Real-time Status as active
	const sidebarItems = [
		{ icon: BarChart3, label: 'Dashboard', active: false, href: `/events/${eventId}` },
		{ icon: Calendar, label: 'Flight Schedule', active: false, href: `/events/${eventId}/flight-schedules` },
		{ icon: FileText, label: 'Transport Reports', active: false, href: `/events/${eventId}/transport-reports` },
		{ icon: Clock, label: 'Real-time Status', active: true, href: `/events/${eventId}/status` },
		{ icon: Users, label: 'Passengers', active: false, href: `/events/${eventId}/passengers` },
		{ icon: FileText, label: 'Documents', active: false, href: `/events/${eventId}/documents` },
		{ icon: Settings, label: 'Settings', active: false, href: `/events/${eventId}/settings` }
	]

	return (
		<DefaultLayout 
			eventId={eventId}
			sidebarItems={sidebarItems}
			title="Real-Time Status"
			subtitle="Track vehicle status and guest movements in real-time"
		>
			<RealTimeStatusList eventId={parseInt(eventId)} />
		</DefaultLayout>
	)
} 