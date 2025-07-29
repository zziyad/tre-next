'use client'

import { useParams } from 'next/navigation'
import { CreateTransportReportModal } from '@/components/CreateTransportReportModal'
import { TransportReportsList } from '@/components/TransportReportsList'
import { DefaultLayout } from '@/components/layout/DefaultLayout'
import { BarChart3, Calendar, FileText, Clock, Users, Settings } from 'lucide-react'
import { useState } from 'react'

export default function TransportReportsPage() {
	const params = useParams()
	const eventId = params.eventId as string
	const [refreshKey, setRefreshKey] = useState(0)

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

	const handleReportCreated = () => {
		// Refresh the reports list after successful submission
		setRefreshKey(prev => prev + 1)
	}

	return (
		<DefaultLayout 
			eventId={eventId}
			sidebarItems={sidebarItems}
			title="Transport Reports"
			subtitle="Manage and view transport reports for this event"
		>
			<div className="space-y-6">
				{/* Header with Create Button */}
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold">Transport Reports</h2>
						<p className="text-muted-foreground">
							Submit new reports and view existing ones for this event
						</p>
					</div>
					<CreateTransportReportModal 
						eventId={parseInt(eventId)} 
						onSuccess={handleReportCreated}
					/>
				</div>

				{/* Reports List */}
				<TransportReportsList 
					key={refreshKey}
					eventId={parseInt(eventId)} 
				/>
			</div>
		</DefaultLayout>
	)
} 