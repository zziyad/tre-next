'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, User, Calendar, Mail, Clock, CheckCircle, AlertCircle, Clock as ClockIcon, Search, Filter } from 'lucide-react'
import { useTransportReports } from '@/frontend/hooks/useTransportReports'
import { ViewTransportReportModal } from './ViewTransportReportModal'

interface TransportReportsListProps {
	eventId: number
	userId?: number
	hasWritePermission?: boolean
	hasDeletePermission?: boolean
	hasApprovePermission?: boolean
}

export function TransportReportsList({ eventId, userId, hasWritePermission = false, hasDeletePermission = false, hasApprovePermission = false }: TransportReportsListProps) {
	const { reports, isLoading, error, refetch } = useTransportReports(eventId, userId)
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')

	// Filter reports based on search term and status
	const filteredReports = useMemo(() => {
		return reports.filter(report => {
			const matchesSearch = 
				report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				report.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
				report.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				report.tasks_completed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				report.meetings_attended?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				report.issues_encountered?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				report.pending_tasks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				report.support_notes?.toLowerCase().includes(searchTerm.toLowerCase())

			const matchesStatus = statusFilter === 'all' || report.status.toLowerCase() === statusFilter.toLowerCase()

			return matchesSearch && matchesStatus
		})
	}, [reports, searchTerm, statusFilter])

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

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="animate-pulse">
					<div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-32 bg-gray-200 rounded"></div>
						))}
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center text-red-600">
						<AlertCircle className="w-8 h-8 mx-auto mb-2" />
						<p>Error loading reports: {error}</p>
						<Button onClick={refetch} variant="outline" className="mt-2">
							Try Again
						</Button>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (reports.length === 0) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center text-gray-500">
						<FileText className="w-8 h-8 mx-auto mb-2" />
						<p>No transport reports found</p>
						<p className="text-sm">Submit your first transport report to get started</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-4">
			{/* Search and Filter Controls */}
			<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
				<div className="flex items-center gap-2">
					<h3 className="text-lg font-semibold">Transport Reports ({filteredReports.length} of {reports.length})</h3>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<Input
							placeholder="Search reports..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 w-64"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="approved">Approved</SelectItem>
							<SelectItem value="rejected">Rejected</SelectItem>
						</SelectContent>
					</Select>
					<Button onClick={refetch} variant="outline" size="sm">
						Refresh
					</Button>
				</div>
			</div>

			{/* Reports List */}
			<div className="space-y-4">
				{filteredReports.length === 0 ? (
					<Card>
						<CardContent className="pt-6">
							<div className="text-center text-gray-500">
								<Search className="w-8 h-8 mx-auto mb-2" />
								<p>No reports match your search criteria</p>
								<p className="text-sm">Try adjusting your search terms or filters</p>
							</div>
						</CardContent>
					</Card>
				) : (
					filteredReports.map((report) => (
						<Card key={report.report_id} className="hover:shadow-md transition-shadow">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<User className="w-4 h-4 text-gray-500" />
										<span className="font-medium">
											{report.name} {report.surname}
										</span>
										<Mail className="w-4 h-4 text-gray-500" />
										<span className="text-sm text-gray-600">{report.email}</span>
									</div>
									{getStatusBadge(report.status)}
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
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

								<Separator />

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{report.tasks_completed && (
										<div>
											<h4 className="font-medium text-sm mb-1">Tasks Completed</h4>
											<p className="text-sm text-gray-600 bg-green-50 p-2 rounded">
												{report.tasks_completed}
											</p>
										</div>
									)}
									
									{report.meetings_attended && (
										<div>
											<h4 className="font-medium text-sm mb-1">Meetings Attended</h4>
											<p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
												{report.meetings_attended}
											</p>
										</div>
									)}
									
									{report.issues_encountered && (
										<div>
											<h4 className="font-medium text-sm mb-1">Issues Encountered</h4>
											<p className="text-sm text-gray-600 bg-red-50 p-2 rounded">
												{report.issues_encountered}
											</p>
										</div>
									)}
									
									{report.pending_tasks && (
										<div>
											<h4 className="font-medium text-sm mb-1">Pending Tasks</h4>
											<p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
												{report.pending_tasks}
											</p>
										</div>
									)}
									
									{report.support_notes && (
										<div className="md:col-span-2">
											<h4 className="font-medium text-sm mb-1">Support Notes</h4>
											<p className="text-sm text-gray-600 bg-purple-50 p-2 rounded">
												{report.support_notes}
											</p>
										</div>
									)}
								</div>

								{/* Action Buttons */}
								<div className="flex justify-end pt-2">
									<ViewTransportReportModal report={report} />
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	)
} 