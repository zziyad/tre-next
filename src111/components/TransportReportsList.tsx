'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ReportForm } from './ReportForm'
import { useTransportReports } from '@/frontend/hooks/useTransportReports'
import type { CreateTransportReportData } from '@/frontend/services/transport-report.service'
import { format } from 'date-fns'
import { Plus, FileText, Calendar, User } from 'lucide-react'

interface TransportReportsListProps {
	eventId: number
	userId: number
}

export function TransportReportsList({ eventId, userId }: TransportReportsListProps) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const { reports, isLoading, error, createReport } = useTransportReports(eventId, userId)

	const handleCreateReport = async (data: CreateTransportReportData) => {
		try {
			await createReport({
				...data,
				eventId,
				userId,
			})
			setIsCreateDialogOpen(false)
		} catch (error) {
			console.error('Error creating report:', error)
		}
	}

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'approved':
				return 'bg-green-100 text-green-800'
			case 'rejected':
				return 'bg-red-100 text-red-800'
			case 'pending':
			default:
				return 'bg-yellow-100 text-yellow-800'
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-muted-foreground">Loading reports...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-destructive">Error: {error}</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground">Transport Reports</h2>
					<p className="text-muted-foreground">
						Manage and view transport reports for this event
					</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="w-4 h-4 mr-2" />
							New Report
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Create New Transport Report</DialogTitle>
							<DialogDescription>
								Fill out the form below to submit a new transport report.
							</DialogDescription>
						</DialogHeader>
						<ReportForm
							eventId={eventId}
							userId={userId}
							onSubmit={handleCreateReport}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{reports.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<FileText className="w-12 h-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold text-foreground mb-2">
							No reports yet
						</h3>
						<p className="text-muted-foreground text-center mb-4">
							Get started by creating your first transport report.
						</p>
						<Button onClick={() => setIsCreateDialogOpen(true)}>
							<Plus className="w-4 h-4 mr-2" />
							Create First Report
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{reports.map((report) => (
						<Card key={report.report_id} className="hover:shadow-md transition-shadow">
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<User className="w-4 h-4 text-muted-foreground" />
											<span className="font-medium">{report.name}</span>
											<span className="text-muted-foreground">({report.email})</span>
										</div>
										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											<div className="flex items-center gap-1">
												<Calendar className="w-4 h-4" />
												{format(new Date(report.report_date), 'PPP')}
											</div>
											<Badge className={getStatusColor(report.status)}>
												{report.status}
											</Badge>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4">
									{report.tasks_completed && (
										<div>
											<h4 className="font-medium text-sm mb-1">Tasks Completed</h4>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{report.tasks_completed}
											</p>
										</div>
									)}
									{report.meetings_attended && (
										<div>
											<h4 className="font-medium text-sm mb-1">Meetings Attended</h4>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{report.meetings_attended}
											</p>
										</div>
									)}
									{report.issues_encountered && (
										<div>
											<h4 className="font-medium text-sm mb-1">Issues & Actions</h4>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{report.issues_encountered}
											</p>
										</div>
									)}
									{report.pending_tasks && (
										<div>
											<h4 className="font-medium text-sm mb-1">Pending Tasks</h4>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{report.pending_tasks}
											</p>
										</div>
									)}
									{report.support_notes && (
										<div>
											<h4 className="font-medium text-sm mb-1">Support Notes</h4>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{report.support_notes}
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	)
} 