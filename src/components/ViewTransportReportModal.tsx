'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, User, Calendar, Mail, Clock, CheckCircle, AlertCircle, Clock as ClockIcon, Eye } from 'lucide-react'
import type { TransportReport } from '@/types'

interface ViewTransportReportModalProps {
	report: TransportReport
}

export function ViewTransportReportModal({ report }: ViewTransportReportModalProps) {
	const [isOpen, setIsOpen] = React.useState(false)

	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case 'approved':
				return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
			case 'rejected':
				return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>
			case 'pending':
			default:
				return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><ClockIcon className="w-3 h-3 mr-1" />Pending</Badge>
		}
	}

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="flex items-center gap-2">
					<Eye className="w-4 h-4" />
					View Details
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileText className="w-5 h-5" />
						Transport Report Details
					</DialogTitle>
					<DialogDescription>
						Detailed view of transport report #{report.report_id}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Header Information */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center space-x-2">
									<User className="w-4 h-4 text-gray-500" />
									<span className="font-medium text-lg">
										{report.name} {report.surname}
									</span>
									<Mail className="w-4 h-4 text-gray-500" />
									<span className="text-sm text-gray-600">{report.email}</span>
								</div>
								{getStatusBadge(report.status)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<div className="flex items-center space-x-2">
										<Calendar className="w-4 h-4 text-gray-500" />
										<span className="text-sm font-medium">Report Date:</span>
										<span className="text-sm text-gray-600">
											{formatDate(report.report_date)}
										</span>
									</div>
									<div className="flex items-center space-x-2">
										<Clock className="w-4 h-4 text-gray-500" />
										<span className="text-sm font-medium">Submitted:</span>
										<span className="text-sm text-gray-600">
											{formatDate(report.submitted_at)}
										</span>
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex items-center space-x-2">
										<User className="w-4 h-4 text-gray-500" />
										<span className="text-sm font-medium">Reporter:</span>
										<span className="text-sm text-gray-600">
											{report.user?.username || 'Unknown'}
										</span>
									</div>
									<div className="flex items-center space-x-2">
										<FileText className="w-4 h-4 text-gray-500" />
										<span className="text-sm font-medium">Event:</span>
										<span className="text-sm text-gray-600">
											{report.event?.name || 'Unknown Event'}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Report Content */}
					<div className="space-y-4">
						{report.tasks_completed && (
							<Card>
								<CardContent className="pt-6">
									<h4 className="font-medium text-sm mb-2 flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-green-600" />
										Tasks Completed
									</h4>
									<p className="text-sm text-gray-600 bg-green-50 p-3 rounded">
										{report.tasks_completed}
									</p>
								</CardContent>
							</Card>
						)}
						
						{report.meetings_attended && (
							<Card>
								<CardContent className="pt-6">
									<h4 className="font-medium text-sm mb-2 flex items-center gap-2">
										<Calendar className="w-4 h-4 text-blue-600" />
										Meetings Attended
									</h4>
									<p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
										{report.meetings_attended}
									</p>
								</CardContent>
							</Card>
						)}
						
						{report.issues_encountered && (
							<Card>
								<CardContent className="pt-6">
									<h4 className="font-medium text-sm mb-2 flex items-center gap-2">
										<AlertCircle className="w-4 h-4 text-red-600" />
										Issues Encountered
									</h4>
									<p className="text-sm text-gray-600 bg-red-50 p-3 rounded">
										{report.issues_encountered}
									</p>
								</CardContent>
							</Card>
						)}
						
						{report.pending_tasks && (
							<Card>
								<CardContent className="pt-6">
									<h4 className="font-medium text-sm mb-2 flex items-center gap-2">
										<ClockIcon className="w-4 h-4 text-yellow-600" />
										Pending Tasks
									</h4>
									<p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
										{report.pending_tasks}
									</p>
								</CardContent>
							</Card>
						)}
						
						{report.support_notes && (
							<Card>
								<CardContent className="pt-6">
									<h4 className="font-medium text-sm mb-2 flex items-center gap-2">
										<FileText className="w-4 h-4 text-purple-600" />
										Support Notes
									</h4>
									<p className="text-sm text-gray-600 bg-purple-50 p-3 rounded">
										{report.support_notes}
									</p>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end gap-3 pt-4">
						<Button variant="outline" onClick={() => setIsOpen(false)}>
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
} 